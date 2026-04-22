import { describe, it, expect } from "vitest";
import { straightSegments, lShapeSegments, uShapeSegments } from "../geometry.js";

const base = {
  numberOfSteps: 16,
  flight1Steps: 8,
  stepHeight: 168.75,
  stepDepth: 260,
  stairWidth: 1000,
  landingDepth: 1000,
  wellWidth: 200,
};

describe("straightSegments", () => {
  const segs = straightSegments(base);
  it("returns 1 segment", () => expect(segs).toHaveLength(1));
  it("is a flight", () => expect(segs[0].kind).toBe("flight"));
  it("starts at origin", () => {
    expect(segs[0].startX).toBe(0);
    expect(segs[0].startY).toBe(0);
  });
  it("direction is right", () => {
    if (segs[0].kind === "flight") expect(segs[0].direction).toBe("right");
  });
  it("has all steps", () => {
    if (segs[0].kind === "flight") expect(segs[0].steps).toBe(16);
  });
});

describe("lShapeSegments", () => {
  const segs = lShapeSegments(base);
  it("returns 3 segments", () => expect(segs).toHaveLength(3));
  it("flight, landing, flight", () => {
    expect(segs[0].kind).toBe("flight");
    expect(segs[1].kind).toBe("landing");
    expect(segs[2].kind).toBe("flight");
  });
  it("total steps equals numberOfSteps", () => {
    const f1 = segs[0];
    const f2 = segs[2];
    if (f1.kind === "flight" && f2.kind === "flight") {
      expect(f1.steps + f2.steps).toBe(16);
    }
  });
  it("second flight direction is up", () => {
    const f2 = segs[2];
    if (f2.kind === "flight") expect(f2.direction).toBe("up");
  });
  it("landing x is at end of first flight", () => {
    const f1 = segs[0];
    const landing = segs[1];
    if (f1.kind === "flight" && landing.kind === "landing") {
      expect(landing.x).toBe(f1.steps * f1.stepDepth);
    }
  });
});

describe("uShapeSegments", () => {
  const segs = uShapeSegments(base);
  it("returns 3 segments", () => expect(segs).toHaveLength(3));
  it("last flight direction is left", () => {
    const last = segs[2];
    if (last.kind === "flight") expect(last.direction).toBe("left");
  });
  it("total steps equals numberOfSteps", () => {
    const f1 = segs[0];
    const f2 = segs[2];
    if (f1.kind === "flight" && f2.kind === "flight") {
      expect(f1.steps + f2.steps).toBe(16);
    }
  });
  it("landing depth spans both flights + well", () => {
    const landing = segs[1];
    if (landing.kind === "landing") {
      expect(landing.depth).toBe(base.stairWidth * 2 + base.wellWidth);
    }
  });
});
