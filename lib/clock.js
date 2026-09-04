import { runPowerShell } from "./wsl-host.js";

export function notWsl() {
  return { ok: false, error: "not running in WSL", advice: [] };
}

export function parameters() {
  return { type: "object", additionalProperties: false, properties: {} };
}

export function outputSchema() {
  return { type: "object", additionalProperties: true };
}

export function format(v) {
  const lines = [`clock_doctor ok=${v.ok} level=${v.level || "?"} skewSec=${v.skewSec}`];
  if (v.wslNow) lines.push(`wslNow: ${v.wslNow}`);
  if (v.windowsNow) lines.push(`windowsNow: ${v.windowsNow}`);
  for (const a of v.advice || []) lines.push(`- ${a}`);
  if (v.error) lines.push(`error: ${v.error}`);
  return lines.join("\n");
}

/**
 * @returns {{ skewSec: number, absSkewSec: number, level: "ok"|"warn"|"fail", ok: boolean }}
 */
export function computeSkew(wslMs, winMs, maxSkewSec = 30) {
  const maxSkew = Number(maxSkewSec) > 0 ? Number(maxSkewSec) : 30;
  const skewSec = Math.round((Number(wslMs) - Number(winMs)) / 1000);
  const absSkewSec = Math.abs(skewSec);
  let level = "ok";
  if (absSkewSec > maxSkew) level = "fail";
  else if (absSkewSec > Math.max(5, Math.floor(maxSkew / 2))) level = "warn";
  return {
    skewSec,
    absSkewSec,
    level,
    ok: level !== "fail",
    maxSkewSec: maxSkew,
  };
}

export function buildClockAdvice({ level, skewSec, maxSkewSec } = {}) {
  const tips = [];
  if (level === "fail") {
    tips.push(
      `Clock skew ${skewSec}s exceeds maxSkewSec=${maxSkewSec}. TLS handshakes and GitHub App JWTs often fail after laptop sleep.`,
    );
    tips.push(
      "Fix: from elevated Windows run `wsl --shutdown`, reopen the distro, then restart-dsh-web.sh. Or sync NTP inside WSL.",
    );
  } else if (level === "warn") {
    tips.push(
      `Clock skew ${skewSec}s is elevated (warn). Watch for intermittent TLS / token errors; prefer wsl --shutdown after long sleep.`,
    );
  } else {
    tips.push("Skew within tolerance.");
  }
  tips.push("Pair with dns_doctor / net_doctor if HTTPS still fails after time looks OK.");
  return tips;
}

export async function execute(_args, config = {}, deps = {}) {
  const maxSkew = Number(config.maxSkewSec) > 0 ? Number(config.maxSkewSec) : 30;
  const nowFn = deps.now || Date.now;
  const runPs = deps.runPowerShell || runPowerShell;
  const wslMs = nowFn();
  let winMs = 0;
  try {
    const { stdout } = await runPs("[DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()", {
      timeoutMs: 10_000,
    });
    winMs = Number(String(stdout).trim());
    if (!Number.isFinite(winMs)) {
      return { ok: false, error: "invalid Windows time", advice: [], level: "fail", skewSec: 0 };
    }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      advice: ["Could not read Windows UTC time via PowerShell."],
      level: "fail",
      skewSec: 0,
    };
  }
  const skew = computeSkew(wslMs, winMs, maxSkew);
  const advice = buildClockAdvice(skew);
  return {
    ok: skew.ok,
    level: skew.level,
    skewSec: skew.skewSec,
    maxSkewSec: skew.maxSkewSec,
    wslNow: new Date(wslMs).toISOString(),
    windowsNow: new Date(winMs).toISOString(),
    advice,
  };
}
