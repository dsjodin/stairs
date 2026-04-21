import { StairInputSchema } from "./types.js";
import type { StairResult } from "./types.js";
import { calculateSteps } from "./steps.js";
import { blondelFormula, blondelZone } from "./blondel.js";
import { buildWarnings } from "./validation.js";
import { buildSegments, calculateFootprint } from "./geometry.js";

export function calculate(rawInput: unknown): StairResult {
  const input = StairInputSchema.parse(rawInput);

  const { numberOfSteps, actualStepHeight } = calculateSteps(
    input.totalRise,
    input.desiredStepHeight
  );
  const numberOfTreads = numberOfSteps - 1;

  // Cap step depth when maxHorizontalRun is specified
  let actualStepDepth = input.desiredStepDepth;
  if (input.maxHorizontalRun && numberOfTreads > 0) {
    actualStepDepth = Math.min(actualStepDepth, input.maxHorizontalRun / numberOfTreads);
  }

  const totalRun = numberOfTreads * actualStepDepth;
  const slopeRad = Math.atan2(input.totalRise, totalRun);
  const slopeDegrees = (slopeRad * 180) / Math.PI;

  // Derive flight1Steps from flight1Run or auto-split
  const winderN = input.winderSteps ?? 0;
  let flight1Steps: number;
  if (input.flight1Run && (input.type === "L" || input.type === "U")) {
    flight1Steps = Math.round(input.flight1Run / actualStepDepth);
  } else {
    flight1Steps = Math.ceil((numberOfSteps - winderN) / 2);
  }
  flight1Steps = Math.min(Math.max(flight1Steps, 1), numberOfSteps - winderN - 1);

  // Stairwell calculation
  let stairwellStart: number | undefined;
  let stairwellLength: number | undefined;
  if (input.showStairwell && totalRun > 0) {
    const ceilingH = input.totalRise - input.floorThickness;
    const xCritical = (ceilingH - input.minimumHeadroom) / Math.tan(slopeRad);
    stairwellStart = Math.max(0, xCritical);
    stairwellLength = totalRun - stairwellStart;
  }

  const blondel = blondelFormula(actualStepHeight, actualStepDepth);
  const zone = blondelZone(blondel);

  const warnings = buildWarnings({
    actualStepHeight,
    actualStepDepth,
    stairWidth: input.stairWidth,
    slopeDegrees,
    type: input.type,
    landingDepth: input.landingDepth,
    winderSteps: input.winderSteps,
    showStairwell: input.showStairwell,
    stairwellStart,
  });

  const segments = buildSegments(input, numberOfSteps, actualStepHeight, actualStepDepth, flight1Steps);
  const footprint = calculateFootprint(segments, input.stairWidth);

  return {
    stairWidth: input.stairWidth,
    type: input.type,
    style: input.style,
    numberOfSteps,
    numberOfTreads,
    actualStepHeight,
    actualStepDepth,
    totalRun,
    totalFootprint: footprint,
    blondelFormula: blondel,
    blondelZone: zone,
    sumRule: actualStepHeight + actualStepDepth,
    productRule: actualStepHeight * actualStepDepth,
    slopeDegrees,
    warnings,
    segments,
    stairwellStart,
    stairwellLength,
    floorThickness: input.floorThickness,
    minimumHeadroom: input.minimumHeadroom,
  };
}
