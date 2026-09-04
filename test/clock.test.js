import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildClockAdvice, computeSkew, format } from "../lib/clock.js";

describe("computeSkew", () => {
  it("ok within max", () => {
    const s = computeSkew(1_000_000, 1_000_000, 30);
    assert.equal(s.level, "ok");
    assert.equal(s.ok, true);
    assert.equal(s.skewSec, 0);
  });

  it("warn then fail", () => {
    const warn = computeSkew(1_000_000 + 20_000, 1_000_000, 30);
    assert.equal(warn.level, "warn");
    assert.equal(warn.ok, true);
    const fail = computeSkew(1_000_000 + 60_000, 1_000_000, 30);
    assert.equal(fail.level, "fail");
    assert.equal(fail.ok, false);
  });
});

describe("buildClockAdvice", () => {
  it("mentions JWT/TLS on fail", () => {
    const tips = buildClockAdvice({ level: "fail", skewSec: 120, maxSkewSec: 30 });
    assert.ok(tips.some((t) => /GitHub App JWT|TLS/i.test(t)));
    assert.ok(tips.some((t) => /wsl --shutdown/i.test(t)));
  });
});

describe("format", () => {
  it("includes level", () => {
    assert.match(format({ ok: true, level: "ok", skewSec: 0, advice: ["tip"] }), /level=ok/);
  });
});
