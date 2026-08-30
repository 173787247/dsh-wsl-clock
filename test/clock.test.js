import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildClockAdvice,
  formatClockReport,
  skewSeconds,
} from "../lib/clock.js";

describe("clock_doctor", () => {
  it("computes skew", () => {
    const r = skewSeconds("2026-08-30T12:00:05Z", "2026-08-30T12:00:00Z");
    assert.equal(r.ok, true);
    assert.equal(r.skewSec, 5);
  });

  it("advises hwclock when drifted", () => {
    const advice = buildClockAdvice({ skewSec: 10, maxSkewSec: 2, allowFix: false });
    assert.ok(advice.some((t) => /hwclock/i.test(t)));
    assert.ok(advice.some((t) => /allowFix=false/i.test(t)));
  });

  it("formats", () => {
    assert.match(
      formatClockReport({ linuxIso: "a", windowsIso: "b", skewSec: 1.5, advice: ["x"] }),
      /skew_sec: 1\.5/,
    );
  });
});
