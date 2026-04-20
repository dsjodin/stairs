import { describe, it, expect } from "vitest";
import { blondelFormula, blondelZone } from "../blondel.js";

describe("blondelFormula", () => {
  it("calculates 2h + d", () => {
    expect(blondelFormula(175, 260)).toBeCloseTo(610);
  });
  it("acceptance criteria value", () => {
    expect(blondelFormula(168.75, 260)).toBeCloseTo(597.5);
  });
});

describe("blondelZone", () => {
  it("579 is outside", () => expect(blondelZone(579)).toBe("outside"));
  it("580 is acceptable", () => expect(blondelZone(580)).toBe("acceptable"));
  it("599 is acceptable", () => expect(blondelZone(599)).toBe("acceptable"));
  it("600 is ok", () => expect(blondelZone(600)).toBe("ok"));
  it("619 is ok", () => expect(blondelZone(619)).toBe("ok"));
  it("620 is ideal", () => expect(blondelZone(620)).toBe("ideal"));
  it("625 is ideal", () => expect(blondelZone(625)).toBe("ideal"));
  it("630 is ideal", () => expect(blondelZone(630)).toBe("ideal"));
  it("631 is ok", () => expect(blondelZone(631)).toBe("ok"));
  it("640 is ok", () => expect(blondelZone(640)).toBe("ok"));
  it("641 is acceptable", () => expect(blondelZone(641)).toBe("acceptable"));
  it("660 is acceptable", () => expect(blondelZone(660)).toBe("acceptable"));
  it("661 is outside", () => expect(blondelZone(661)).toBe("outside"));
});
