import { z } from "zod";

export const StairTypeSchema = z.enum(["straight", "L", "U"]);
export const StairStyleSchema = z.enum(["open", "closed"]);

export const StairInputSchema = z.object({
  type: StairTypeSchema,
  style: StairStyleSchema,
  totalRise: z.number().positive(),
  availableRun: z.number().positive().optional(),
  desiredStepHeight: z.number().positive(),
  desiredStepDepth: z.number().positive(),
  stairWidth: z.number().positive(),
  nosing: z.number().nonnegative().default(20),
  landingDepth: z.number().positive().optional(),
  wellWidth: z.number().positive().optional(),
  // Winder (L-stair without landing)
  winderSteps: z.number().int().min(2).max(20).optional(),
  // Flight section lengths
  flight1Run: z.number().positive().optional(),
  maxHorizontalRun: z.number().positive().optional(),
  // Stairwell (trapphål)
  showStairwell: z.boolean().default(false),
  floorThickness: z.number().positive().default(200),
  minimumHeadroom: z.number().positive().default(2100),
});

export const WarningSchema = z.object({
  code: z.string(),
  message: z.string(),
  severity: z.enum(["warn", "error"]),
});

export const BlondelZoneSchema = z.enum(["ideal", "ok", "acceptable", "outside"]);

export const FlightSegmentSchema = z.object({
  kind: z.literal("flight"),
  steps: z.number().int(),
  stepHeight: z.number(),
  stepDepth: z.number(),
  startX: z.number(),
  startY: z.number(),
  direction: z.enum(["right", "up", "left", "down"]),
});

export const LandingSegmentSchema = z.object({
  kind: z.literal("landing"),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  depth: z.number(),
});

export const WinderSegmentSchema = z.object({
  kind: z.literal("winder"),
  steps: z.number().int(),
  stepHeight: z.number(),
  innerRadius: z.number(),
  outerRadius: z.number(),
  pivotX: z.number(),
  pivotY: z.number(),
  startAngleDeg: z.number(),
  totalAngleDeg: z.number(),
  walkingLineDepth: z.number(),
  nextFlightX: z.number(),
  nextFlightY: z.number(),
  nextDirection: z.enum(["right", "up", "left", "down"]),
});

export const SegmentSchema = z.discriminatedUnion("kind", [
  FlightSegmentSchema,
  LandingSegmentSchema,
  WinderSegmentSchema,
]);

export const StairResultSchema = z.object({
  stairWidth: z.number(),
  type: StairTypeSchema,
  style: StairStyleSchema,
  numberOfSteps: z.number().int(),
  numberOfTreads: z.number().int(),
  actualStepHeight: z.number(),
  actualStepDepth: z.number(),
  totalRun: z.number(),
  totalFootprint: z.object({ width: z.number(), depth: z.number() }),
  blondelFormula: z.number(),
  blondelZone: BlondelZoneSchema,
  sumRule: z.number(),
  productRule: z.number(),
  slopeDegrees: z.number(),
  warnings: z.array(WarningSchema),
  segments: z.array(SegmentSchema),
  stairwellStart: z.number().optional(),
  stairwellLength: z.number().optional(),
  floorThickness: z.number(),
  minimumHeadroom: z.number(),
});

export type StairType = z.infer<typeof StairTypeSchema>;
export type StairStyle = z.infer<typeof StairStyleSchema>;
export type StairInput = z.input<typeof StairInputSchema>;
export type Warning = z.infer<typeof WarningSchema>;
export type BlondelZone = z.infer<typeof BlondelZoneSchema>;
export type FlightSegment = z.infer<typeof FlightSegmentSchema>;
export type LandingSegment = z.infer<typeof LandingSegmentSchema>;
export type WinderSegment = z.infer<typeof WinderSegmentSchema>;
export type Segment = z.infer<typeof SegmentSchema>;
export type StairResult = z.infer<typeof StairResultSchema>;
