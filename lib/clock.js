import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function readLinuxUtcIso({ execFileFn = execFileAsync } = {}) {
  const { stdout } = await execFileFn("date", ["-u", "+%Y-%m-%dT%H:%M:%SZ"], {
    encoding: "utf8",
    timeout: 5_000,
  });
  return String(stdout || "").trim();
}

export function windowsUtcScript() {
  return "[Console]::Out.Write(([DateTime]::UtcNow.ToString('o')))";
}

export function parseUtcMs(iso) {
  const t = Date.parse(String(iso || "").trim());
  return Number.isFinite(t) ? t : null;
}

export function skewSeconds(linuxIso, windowsIso) {
  const a = parseUtcMs(linuxIso);
  const b = parseUtcMs(windowsIso);
  if (a == null || b == null) return { ok: false, error: "unparseable timestamps" };
  return { ok: true, skewSec: (a - b) / 1000, linuxIso, windowsIso };
}

export function buildClockAdvice({ skewSec, maxSkewSec = 2, allowFix = false, fixed = false }) {
  const tips = [];
  const abs = Math.abs(Number(skewSec) || 0);
  if (abs <= maxSkewSec) {
    tips.push(`Clock skew ${abs.toFixed(3)}s within threshold (${maxSkewSec}s).`);
    return tips;
  }
  tips.push(`WSL clock drift ~${abs.toFixed(3)}s vs Windows UTC (threshold ${maxSkewSec}s).`);
  tips.push("Advise: sudo hwclock -s  (or restart WSL: wsl --shutdown from Windows).");
  if (allowFix) {
    tips.push(fixed
      ? "allowFix applied: attempted sudo hwclock -s."
      : "allowFix is true but fix was not applied in this report.");
  } else {
    tips.push("Auto-fix disabled (config.allowFix=false). Enable only if you accept sudo hwclock -s.");
  }
  return tips;
}

export async function applyHwclockSync({ execFileFn = execFileAsync } = {}) {
  await execFileFn("sudo", ["hwclock", "-s"], { encoding: "utf8", timeout: 15_000 });
  return { ok: true };
}

export function formatClockReport(report) {
  const lines = ["clock_doctor"];
  if (report.error) lines.push(`error: ${report.error}`);
  if (report.linuxIso) lines.push(`linux_utc: ${report.linuxIso}`);
  if (report.windowsIso) lines.push(`windows_utc: ${report.windowsIso}`);
  if (report.skewSec != null) lines.push(`skew_sec: ${report.skewSec}`);
  for (const tip of report.advice || []) lines.push(`- ${tip}`);
  return lines.join("\n");
}
