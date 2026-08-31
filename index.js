import { detectWsl } from "./lib/wsl-host.js";
import * as core from "./lib/clock.js";

export const name = "dsh-wsl-clock";
export const inject = ["tools", "systemPrompt"];

export function apply(ctx, config = {}) {
  const timeoutMs = positive(config.timeoutMs, 15_000);
  const wsl = detectWsl();

  ctx.systemPrompt.section({
    name: "tool:clock_doctor",
    order: 115,
    text: "Use clock_doctor for WSL/Windows interop: Detect WSL2 clock drift that breaks TLS and tokens after sleep.",
  });

  ctx.tools.register({
    name: "clock_doctor",
    description: "Detect WSL2 clock drift that breaks TLS and tokens after sleep.",
    parameters: core.parameters(config),
    output: {
      schema: core.outputSchema(),
      render: (_args, value) => [{ type: "text", text: core.format(value) }],
    },
    timeoutMs,
    isConcurrencySafe: () => true,
    async execute(args) {
      if (!wsl) return core.notWsl ? core.notWsl() : { ok: false, error: "not running in WSL" };
      return core.execute(args, config);
    },
    presentCall: () => ({ card: "generic", title: "clock_doctor" }),
    presentResult: (_args, result) => (
      result.isError
        ? { card: "generic", title: "clock_doctor failed", content: result.content }
        : { card: "generic", title: "clock_doctor", content: result.content }
    ),
  });
}

function positive(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}
