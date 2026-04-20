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

export const SegmentSchema = z.discriminatedUnion("kind", [
  FlightSegmentSchema,
  LandingSegmentSchema,
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
});

export type StairType = z.infer<typeof StairTypeSchema>;
export type StairStyle = z.infer<typeof StairStyleSchema>;
export type StairInput = z.infer<typeof StairInputSchema>;
export type Warning = z.infer<typeof WarningSchema>;
export type BlondelZone = z.infer<typeof BlondelZoneSchema>;
export type FlightSegment = z.infer<typeof FlightSegmentSchema>;
export type LandingSegment = z.infer<typeof LandingSegmentSchema>;
export type Segment = z.infer<typeof SegmentSchema>;
export type StairResult = z.infer<typeof StairResultSchema>;
