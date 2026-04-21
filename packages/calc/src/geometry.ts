import type { Segment, StairInput } from "./types.js";

interface GeomParams {
  numberOfSteps: number;
  flight1Steps: number;
  stepHeight: number;
  stepDepth: number;
  stairWidth: number;
  landingDepth: number;
  wellWidth: number;
  winderSteps?: number;
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
  const stepsInFlight1 = p.flight1Steps;
  const f1x = stepsInFlight1 * p.stepDepth;

  if (p.winderSteps) {
    const stepsInFlight2 = p.numberOfSteps - stepsInFlight1 - p.winderSteps;
    const walkingLineRadius = (2 / 3) * p.stairWidth;
    const walkingLineDepth = walkingLineRadius * (Math.PI / 2 / p.winderSteps);
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
        kind: "winder",
        steps: p.winderSteps,
        stepHeight: p.stepHeight,
        innerRadius: 0,
        outerRadius: p.stairWidth,
        pivotX: f1x,
        pivotY: 0,
        startAngleDeg: 0,
        totalAngleDeg: 90,
        walkingLineDepth,
        nextFlightX: f1x,
        nextFlightY: p.stairWidth,
        nextDirection: "up",
      },
      {
        kind: "flight",
        steps: stepsInFlight2,
        stepHeight: p.stepHeight,
        stepDepth: p.stepDepth,
        startX: f1x,
        startY: p.stairWidth,
        direction: "up",
      },
    ];
  }

  const stepsInFlight2 = p.numberOfSteps - stepsInFlight1;
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
      x: f1x,
      y: 0,
      width: p.stairWidth,
      depth: p.landingDepth,
    },
    {
      kind: "flight",
      steps: stepsInFlight2,
      stepHeight: p.stepHeight,
      stepDepth: p.stepDepth,
      startX: f1x,
      startY: p.landingDepth,
      direction: "up",
    },
  ];
}

export function uShapeSegments(p: GeomParams): Segment[] {
  const stepsInFlight1 = p.flight1Steps;
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
  stepDepth: number,
  flight1Steps: number
): Segment[] {
  const p: GeomParams = {
    numberOfSteps,
    flight1Steps,
    stepHeight,
    stepDepth,
    stairWidth: input.stairWidth,
    landingDepth: input.landingDepth ?? input.stairWidth,
    wellWidth: input.wellWidth ?? 200,
    winderSteps: input.winderSteps,
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
    } else if (seg.kind === "winder") {
      maxX = Math.max(maxX, seg.pivotX + seg.outerRadius);
      maxY = Math.max(maxY, seg.pivotY + seg.outerRadius);
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
