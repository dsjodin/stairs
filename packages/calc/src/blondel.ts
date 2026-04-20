import type { BlondelZone } from "./types.js";

export function blondelFormula(h: number, d: number): number {
  return 2 * h + d;
}

export function blondelZone(value: number): BlondelZone {
  if (value >= 620 && value <= 630) return "ideal";
  if (value >= 600 && value <= 640) return "ok";
  if (value >= 580 && value <= 660) return "acceptable";
  return "outside";
}
