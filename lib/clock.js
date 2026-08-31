import { runPowerShell } from "./wsl-host.js";

export function notWsl() {
  return { ok: false, error: "not running in WSL" };
}

export function parameters() {
  return { type: "object", additionalProperties: false, properties: {} };
}

export function outputSchema() {
  return { type: "object", additionalProperties: true };
}

export function format(v) {
  const lines = [`clock_doctor ok=${v.ok} skewSec=${v.skewSec}`];
  lines.push(`wslNow: ${v.wslNow}`);
  lines.push(`windowsNow: ${v.windowsNow}`);
  for (const a of v.advice || []) lines.push(`- ${a}`);
  if (v.error) lines.push(`error: ${v.error}`);
  return lines.join("\n");
}

export async function execute(_args, config = {}) {
  const maxSkew = Number(config.maxSkewSec) > 0 ? Number(config.maxSkewSec) : 30;
  const wslMs = Date.now();
  let winMs = 0;
  try {
    const { stdout } = await runPowerShell("[DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()", { timeoutMs: 10_000 });
    winMs = Number(String(stdout).trim());
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err), advice: [] };
  }
  const skewSec = Math.round((wslMs - winMs) / 1000);
  const drifted = Math.abs(skewSec) > maxSkew;
  const advice = drifted
    ? [
        "Clock skew can break TLS and GitHub App tokens after laptop sleep.",
        "Fix: from elevated Windows `wsl --shutdown`, then reopen the distro; or sync time inside WSL with your usual NTP method.",
      ]
    : ["Skew within tolerance."];
  return {
    ok: !drifted,
    skewSec,
    maxSkewSec: maxSkew,
    wslNow: new Date(wslMs).toISOString(),
    windowsNow: new Date(winMs).toISOString(),
    advice,
  };
}
