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
  const actualStepDepth = input.desiredStepDepth;
  const numberOfTreads = numberOfSteps - 1;
  const totalRun = numberOfTreads * actualStepDepth;
  const slopeDegrees = (Math.atan2(input.totalRise, totalRun) * 180) / Math.PI;

  const blondel = blondelFormula(actualStepHeight, actualStepDepth);
  const zone = blondelZone(blondel);

  const warnings = buildWarnings({
    actualStepHeight,
    actualStepDepth,
    stairWidth: input.stairWidth,
    slopeDegrees,
    type: input.type,
    landingDepth: input.landingDepth,
  });

  const segments = buildSegments(input, numberOfSteps, actualStepHeight, actualStepDepth);
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
  };
}
