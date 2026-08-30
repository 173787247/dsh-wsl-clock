import { detectWsl, runPowerShell } from "./lib/wsl-host.js";
import {
  applyHwclockSync,
  buildClockAdvice,
  formatClockReport,
  readLinuxUtcIso,
  skewSeconds,
  windowsUtcScript,
} from "./lib/clock.js";

export const name = "dsh-wsl-clock";
export const inject = ["tools", "systemPrompt"];

export function apply(ctx, config = {}) {
  const timeoutMs = positive(config.timeoutMs, 15_000);
  const maxSkewSec = positive(config.maxSkewSec, 2);
  const allowFix = config.allowFix === true;
  const wsl = detectWsl();

  ctx.systemPrompt.section({
    name: "tool:clock_doctor",
    order: 123,
    text: [
      "Use clock_doctor when TLS, Git, or package installs fail with clock/certificate time errors inside WSL.",
      "It compares Linux UTC (date -u) with Windows [DateTime]::UtcNow and advises hwclock sync or WSL restart.",
      "Do not auto-fix unless config.allowFix is true.",
    ].join(" "),
  });

  ctx.tools.register({
    name: "clock_doctor",
    description: "Detect WSL clock drift vs Windows UTC; advise (or optionally apply) hwclock sync.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        fix: {
          type: "boolean",
          description: "Attempt sudo hwclock -s only if config.allowFix is true.",
        },
      },
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          wsl: { type: "boolean" },
          linuxIso: { type: "string" },
          windowsIso: { type: "string" },
          skewSec: { type: "number" },
          maxSkewSec: { type: "number" },
          drifted: { type: "boolean" },
          fixed: { type: "boolean" },
          advice: { type: "array", items: { type: "string" } },
          error: { type: "string" },
        },
      },
      render: (_args, value) => [{ type: "text", text: formatClockReport(value) }],
    },
    timeoutMs,
    isConcurrencySafe: () => true,
    async execute(args) {
      if (!wsl) {
        return { wsl: false, error: "not running in WSL", advice: [] };
      }
      try {
        const linuxIso = await readLinuxUtcIso();
        const { stdout } = await runPowerShell(windowsUtcScript(), { timeoutMs });
        const windowsIso = String(stdout || "").trim();
        const skew = skewSeconds(linuxIso, windowsIso);
        if (!skew.ok) {
          return { wsl: true, linuxIso, windowsIso, error: skew.error, advice: [] };
        }
        const drifted = Math.abs(skew.skewSec) > maxSkewSec;
        let fixed = false;
        if (drifted && allowFix && args?.fix === true) {
          try {
            await applyHwclockSync();
            fixed = true;
          } catch (err) {
            return {
              wsl: true,
              linuxIso,
              windowsIso,
              skewSec: skew.skewSec,
              maxSkewSec,
              drifted,
              fixed: false,
              error: err instanceof Error ? err.message : String(err),
              advice: buildClockAdvice({ skewSec: skew.skewSec, maxSkewSec, allowFix, fixed: false }),
            };
          }
        }
        const report = {
          wsl: true,
          linuxIso,
          windowsIso,
          skewSec: skew.skewSec,
          maxSkewSec,
          drifted,
          fixed,
        };
        report.advice = buildClockAdvice({
          skewSec: skew.skewSec,
          maxSkewSec,
          allowFix,
          fixed,
        });
        return report;
      } catch (err) {
        return {
          wsl: true,
          error: err instanceof Error ? err.message : String(err),
          advice: [],
        };
      }
    },
    presentCall: () => ({ card: "generic", title: "Clock doctor" }),
    presentResult: (_args, result) => (
      result.isError
        ? { card: "generic", title: "Clock doctor failed", content: result.content }
        : { card: "generic", title: "Clock doctor", content: result.content }
    ),
  });
}

function positive(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}
