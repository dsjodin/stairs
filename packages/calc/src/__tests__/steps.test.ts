import { describe, it, expect } from "vitest";
import { calculateSteps } from "../steps.js";

describe("calculateSteps", () => {
  it("rounds to nearest step", () => {
    const { numberOfSteps } = calculateSteps(2700, 175);
    expect(numberOfSteps).toBe(16);
  });

  it("actual height is totalRise / numberOfSteps", () => {
    const { actualStepHeight } = calculateSteps(2700, 175);
    expect(actualStepHeight).toBeCloseTo(168.75);
  });

  it("rounds up even when remainder < 0.5", () => {
    // 2710/175 = 15.49 - Math.ceil gives 16
    const { numberOfSteps } = calculateSteps(2710, 175);
    expect(numberOfSteps).toBe(16);
  });

  it("exact division", () => {
    const { numberOfSteps, actualStepHeight } = calculateSteps(1750, 175);
    expect(numberOfSteps).toBe(10);
    expect(actualStepHeight).toBe(175);
  });

  it("minimum 1 step", () => {
    const { numberOfSteps } = calculateSteps(100, 175);
    expect(numberOfSteps).toBe(1);
  });

  it("high rise", () => {
    const { numberOfSteps } = calculateSteps(4000, 175);
    expect(numberOfSteps).toBe(23);
  });
});
