import { describe, it, expect } from "vitest";
import { calculate } from "../calculate.js";

describe("straight closed 2700mm rise - acceptance criteria", () => {
  const result = calculate({
    type: "straight",
    style: "closed",
    totalRise: 2700,
    desiredStepHeight: 175,
    desiredStepDepth: 260,
    stairWidth: 1000,
  });

  it("has 16 steps", () => expect(result.numberOfSteps).toBe(16));
  it("actual height is 168.75mm", () => expect(result.actualStepHeight).toBeCloseTo(168.75));
  it("has 15 treads", () => expect(result.numberOfTreads).toBe(15));
  it("totalRun is 3900mm", () => expect(result.totalRun).toBe(3900));
  it("blondel is 597.5", () => expect(result.blondelFormula).toBeCloseTo(597.5));
  it("blondelZone is acceptable (597.5 in 580-660)", () => expect(result.blondelZone).toBe("acceptable"));
  it("slope approx 34.7 deg", () => expect(result.slopeDegrees).toBeCloseTo(34.7, 0));
  it("sumRule is ~428.75", () => expect(result.sumRule).toBeCloseTo(428.75));
  it("productRule is ~43875", () => expect(result.productRule).toBeCloseTo(43875));
  it("has 1 segment (straight)", () => expect(result.segments).toHaveLength(1));
  it("segment is a flight", () => expect(result.segments[0].kind).toBe("flight"));
});

describe("L-shape stair", () => {
  const result = calculate({
    type: "L",
    style: "closed",
    totalRise: 2700,
    desiredStepHeight: 175,
    desiredStepDepth: 260,
    stairWidth: 1000,
    landingDepth: 1000,
  });

  it("has 16 steps", () => expect(result.numberOfSteps).toBe(16));
  it("has 3 segments (flight, landing, flight)", () => expect(result.segments).toHaveLength(3));
  it("first segment is flight", () => expect(result.segments[0].kind).toBe("flight"));
  it("second segment is landing", () => expect(result.segments[1].kind).toBe("landing"));
  it("third segment is flight", () => expect(result.segments[2].kind).toBe("flight"));
});

describe("U-shape stair", () => {
  const result = calculate({
    type: "U",
    style: "closed",
    totalRise: 2700,
    desiredStepHeight: 175,
    desiredStepDepth: 260,
    stairWidth: 1200,
    landingDepth: 1200,
    wellWidth: 200,
  });

  it("has 16 steps", () => expect(result.numberOfSteps).toBe(16));
  it("has 3 segments (flight, landing, flight)", () => expect(result.segments).toHaveLength(3));
  it("last flight direction is left", () => {
    const last = result.segments[2];
    expect(last.kind).toBe("flight");
    if (last.kind === "flight") expect(last.direction).toBe("left");
  });
});

describe("rounding edge cases", () => {
  it("exact division gives correct steps", () => {
    const r = calculate({
      type: "straight",
      style: "open",
      totalRise: 2800,
      desiredStepHeight: 175,
      desiredStepDepth: 260,
      stairWidth: 1000,
    });
    expect(r.numberOfSteps).toBe(16);
    expect(r.actualStepHeight).toBeCloseTo(175);
  });

  it("handles exact division", () => {
    const r = calculate({
      type: "straight",
      style: "closed",
      totalRise: 1750,
      desiredStepHeight: 175,
      desiredStepDepth: 260,
      stairWidth: 1000,
    });
    expect(r.numberOfSteps).toBe(10);
    expect(r.actualStepHeight).toBe(175);
  });
});

describe("open style has same dimensions as closed", () => {
  const closed = calculate({
    type: "straight",
    style: "closed",
    totalRise: 2700,
    desiredStepHeight: 175,
    desiredStepDepth: 260,
    stairWidth: 1000,
  });
  const open = calculate({
    type: "straight",
    style: "open",
    totalRise: 2700,
    desiredStepHeight: 175,
    desiredStepDepth: 260,
    stairWidth: 1000,
  });

  it("same numberOfSteps", () => expect(open.numberOfSteps).toBe(closed.numberOfSteps));
  it("same actualStepHeight", () => expect(open.actualStepHeight).toBe(closed.actualStepHeight));
  it("same totalRun", () => expect(open.totalRun).toBe(closed.totalRun));
});
