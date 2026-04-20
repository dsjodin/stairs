import { describe, it, expect } from "vitest";
import { buildWarnings } from "../validation.js";

const base = {
  actualStepHeight: 168.75,
  actualStepDepth: 260,
  stairWidth: 1000,
  slopeDegrees: 34.7,
  type: "straight" as const,
};

describe("BBR_RISER_HEIGHT", () => {
  it("no warning at 175mm", () => {
    const w = buildWarnings({ ...base, actualStepHeight: 175 });
    expect(w.find((x) => x.code === "BBR_RISER_HEIGHT")).toBeUndefined();
  });
  it("warns at 176mm", () => {
    const w = buildWarnings({ ...base, actualStepHeight: 176 });
    expect(w.find((x) => x.code === "BBR_RISER_HEIGHT")).toBeDefined();
  });
});

describe("BBR_TREAD_DEPTH", () => {
  it("no warning at 250mm", () => {
    const w = buildWarnings({ ...base, actualStepDepth: 250 });
    expect(w.find((x) => x.code === "BBR_TREAD_DEPTH")).toBeUndefined();
  });
  it("warns at 249mm", () => {
    const w = buildWarnings({ ...base, actualStepDepth: 249 });
    expect(w.find((x) => x.code === "BBR_TREAD_DEPTH")).toBeDefined();
  });
});

describe("BBR_STAIR_WIDTH", () => {
  it("no warning at 900mm", () => {
    const w = buildWarnings({ ...base, stairWidth: 900 });
    expect(w.find((x) => x.code === "BBR_STAIR_WIDTH")).toBeUndefined();
  });
  it("warns at 899mm", () => {
    const w = buildWarnings({ ...base, stairWidth: 899 });
    expect(w.find((x) => x.code === "BBR_STAIR_WIDTH")).toBeDefined();
  });
});

describe("BBR_SLOPE", () => {
  it("no warning at 38 deg", () => {
    const w = buildWarnings({ ...base, slopeDegrees: 38 });
    expect(w.find((x) => x.code === "BBR_SLOPE")).toBeUndefined();
  });
  it("warns above 38 deg", () => {
    const w = buildWarnings({ ...base, slopeDegrees: 38.1 });
    expect(w.find((x) => x.code === "BBR_SLOPE")).toBeDefined();
  });
});

describe("BBR_LANDING_DEPTH", () => {
  it("no warning for straight", () => {
    const w = buildWarnings({ ...base, type: "straight" });
    expect(w.find((x) => x.code === "BBR_LANDING_DEPTH")).toBeUndefined();
  });
  it("warns for L without landingDepth", () => {
    const w = buildWarnings({ ...base, type: "L" });
    expect(w.find((x) => x.code === "BBR_LANDING_DEPTH")).toBeDefined();
  });
  it("warns for L with too-small landing", () => {
    const w = buildWarnings({ ...base, type: "L", landingDepth: 800 });
    expect(w.find((x) => x.code === "BBR_LANDING_DEPTH")).toBeDefined();
  });
  it("no warning for L with sufficient landing", () => {
    const w = buildWarnings({ ...base, type: "L", landingDepth: 1000 });
    expect(w.find((x) => x.code === "BBR_LANDING_DEPTH")).toBeUndefined();
  });
});
