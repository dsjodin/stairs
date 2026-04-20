import type { Segment, StairInput } from "./types.js";

interface GeomParams {
  numberOfSteps: number;
  stepHeight: number;
  stepDepth: number;
  stairWidth: number;
  landingDepth: number;
  wellWidth: number;
}

export function straightSegments(p: GeomParams): Segment[] {
  return [
    {
      kind: "flight",
      steps: p.numberOfSteps,
      stepHeight: p.stepHeight,
      stepDepth: p.stepDepth,
      startX: 0,
      startY: 0,
      direction: "right",
    },
  ];
}

export function lShapeSegments(p: GeomParams): Segment[] {
  const stepsInFlight1 = Math.ceil(p.numberOfSteps / 2);
  const stepsInFlight2 = p.numberOfSteps - stepsInFlight1;
  const landingX = stepsInFlight1 * p.stepDepth;

  return [
    {
      kind: "flight",
      steps: stepsInFlight1,
      stepHeight: p.stepHeight,
      stepDepth: p.stepDepth,
      startX: 0,
      startY: 0,
      direction: "right",
    },
    {
      kind: "landing",
      x: landingX,
      y: 0,
      width: p.stairWidth,
      depth: p.landingDepth,
    },
    {
      kind: "flight",
      steps: stepsInFlight2,
      stepHeight: p.stepHeight,
      stepDepth: p.stepDepth,
      startX: landingX,
      startY: p.landingDepth,
      direction: "up",
    },
  ];
}

export function uShapeSegments(p: GeomParams): Segment[] {
  const stepsInFlight1 = Math.ceil(p.numberOfSteps / 2);
  const stepsInFlight2 = p.numberOfSteps - stepsInFlight1;
  const landingX = stepsInFlight1 * p.stepDepth;
  const totalPlanDepth = p.stairWidth * 2 + p.wellWidth;

  return [
    {
      kind: "flight",
      steps: stepsInFlight1,
      stepHeight: p.stepHeight,
      stepDepth: p.stepDepth,
      startX: 0,
      startY: 0,
      direction: "right",
    },
    {
      kind: "landing",
      x: landingX,
      y: 0,
      width: p.landingDepth,
      depth: totalPlanDepth,
    },
    {
      kind: "flight",
      steps: stepsInFlight2,
      stepHeight: p.stepHeight,
      stepDepth: p.stepDepth,
      startX: landingX + p.landingDepth,
      startY: p.stairWidth + p.wellWidth,
      direction: "left",
    },
  ];
}

export function buildSegments(
  input: StairInput,
  numberOfSteps: number,
  stepHeight: number,
  stepDepth: number
): Segment[] {
  const p: GeomParams = {
    numberOfSteps,
    stepHeight,
    stepDepth,
    stairWidth: input.stairWidth,
    landingDepth: input.landingDepth ?? input.stairWidth,
    wellWidth: input.wellWidth ?? 200,
  };

  switch (input.type) {
    case "straight":
      return straightSegments(p);
    case "L":
      return lShapeSegments(p);
    case "U":
      return uShapeSegments(p);
  }
}

export function calculateFootprint(
  segments: Segment[],
  stairWidth: number
): { width: number; depth: number } {
  let maxX = 0;
  let maxY = 0;

  for (const seg of segments) {
    if (seg.kind === "landing") {
      maxX = Math.max(maxX, seg.x + seg.width);
      maxY = Math.max(maxY, seg.y + seg.depth);
    } else {
      // treads = steps - 1 (last step connects to floor, no tread)
      const treads = seg.steps - 1;
      if (seg.direction === "right") {
        maxX = Math.max(maxX, seg.startX + treads * seg.stepDepth);
        maxY = Math.max(maxY, seg.startY + stairWidth);
      } else if (seg.direction === "left") {
        maxX = Math.max(maxX, seg.startX);
        maxY = Math.max(maxY, seg.startY + stairWidth);
      } else if (seg.direction === "up") {
        maxX = Math.max(maxX, seg.startX + stairWidth);
        maxY = Math.max(maxY, seg.startY + treads * seg.stepDepth);
      } else if (seg.direction === "down") {
        maxX = Math.max(maxX, seg.startX + stairWidth);
        maxY = Math.max(maxY, seg.startY);
      }
    }
  }

  return { width: maxX, depth: maxY };
}
