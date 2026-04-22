import React from "react";
import type { StairResult, FlightSegment, WinderSegment } from "@stairs/calc";

interface Props {
  result: StairResult;
}

const W_SVG = 700;
const H_SVG = 360;
const MARGIN = 50;

export function IsoView({ result }: Props) {
  const { segments, actualStepHeight: h, actualStepDepth: d, stairWidth: W, numberOfSteps } = result;
  const totalRise = numberOfSteps * h;

  const projW = result.totalRun + W * 0.5;
  const projH = totalRise + W * 0.25;

  const scaleX = (W_SVG - MARGIN * 2) / Math.max(projW, 1);
  const scaleY = (H_SVG - MARGIN * 2) / Math.max(projH, 1);
  const scale = Math.min(scaleX, scaleY);

  const baseX = MARGIN;
  const baseY = MARGIN + totalRise * scale;

  function proj(x: number, y: number, z: number) {
    return {
      sx: baseX + (x + y * 0.5) * scale,
      sy: baseY + (-z + y * 0.25) * scale,
    };
  }

  function p(x: number, y: number, z: number) {
    const pt = proj(x, y, z);
    return `${pt.sx.toFixed(1)},${pt.sy.toFixed(1)}`;
  }

  function poly(corners: [number, number, number][]) {
    return corners.map(([x, y, z]) => p(x, y, z)).join(" ");
  }

  // Linearize all segments into steps with (cx, cz) elevation positions
  const steps: Array<{ cx: number; cz: number; riser: number; tread: number }> = [];
  let cx = 0;
  let cz = 0;

  for (let si = 0; si < segments.length; si++) {
    const seg = segments[si];
    const isLastSeg = si === segments.length - 1;

    if (seg.kind === "landing") continue;

    if (seg.kind === "winder") {
      const ws = seg as WinderSegment;
      for (let i = 0; i < ws.steps; i++) {
        const isLast = isLastSeg && i === ws.steps - 1;
        steps.push({ cx, cz, riser: ws.stepHeight, tread: d });
        cz += ws.stepHeight;
        if (!isLast) cx += d;
      }
      continue;
    }

    const fs = seg as FlightSegment;
    for (let i = 0; i < fs.steps; i++) {
      const isLast = isLastSeg && i === fs.steps - 1;
      steps.push({ cx, cz, riser: fs.stepHeight, tread: fs.stepDepth });
      cz += fs.stepHeight;
      if (!isLast) cx += fs.stepDepth;
    }
  }

  if (steps.length === 0) return null;

  const lastStep = steps[steps.length - 1];

  // Far stringer polygon (stair profile at y=W)
  const farPts: string[] = [p(0, W, 0)];
  for (let i = 0; i < steps.length; i++) {
    const { cx: sx, cz: sz, riser, tread } = steps[i];
    const isLast = i === steps.length - 1;
    farPts.push(p(sx, W, sz + riser));
    if (!isLast) farPts.push(p(sx + tread, W, sz + riser));
  }
  farPts.push(p(lastStep.cx, W, 0));

  // Near stringer outline at y=0
  const nearPts: string[] = [p(0, 0, 0)];
  for (let i = 0; i < steps.length; i++) {
    const { cx: sx, cz: sz, riser, tread } = steps[i];
    const isLast = i === steps.length - 1;
    nearPts.push(p(sx, 0, sz + riser));
    if (!isLast) nearPts.push(p(sx + tread, 0, sz + riser));
  }

  const elements: React.ReactNode[] = [];

  // Far stringer
  elements.push(
    <polygon
      key="far-stringer"
      points={farPts.join(" ")}
      fill="#d1d5db"
      stroke="#374151"
      strokeWidth={1}
    />
  );

  // Steps: risers and treads (drawn left to right so near steps are on top visually)
  for (let i = 0; i < steps.length; i++) {
    const { cx: sx, cz: sz, riser, tread } = steps[i];
    const isLast = i === steps.length - 1;

    elements.push(
      <polygon
        key={`riser-${i}`}
        points={poly([
          [sx, 0, sz],
          [sx, W, sz],
          [sx, W, sz + riser],
          [sx, 0, sz + riser],
        ])}
        fill="#9ca3af"
        stroke="#374151"
        strokeWidth={0.8}
      />
    );

    if (!isLast) {
      elements.push(
        <polygon
          key={`tread-${i}`}
          points={poly([
            [sx, 0, sz + riser],
            [sx + tread, 0, sz + riser],
            [sx + tread, W, sz + riser],
            [sx, W, sz + riser],
          ])}
          fill="#f3f4f6"
          stroke="#374151"
          strokeWidth={0.8}
        />
      );
    }
  }

  // Near stringer outline
  elements.push(
    <polyline
      key="near-stringer"
      points={nearPts.join(" ")}
      fill="none"
      stroke="#374151"
      strokeWidth={1.5}
    />
  );

  // Width line at top of stair
  const topNear = proj(lastStep.cx, 0, totalRise);
  const topFar = proj(lastStep.cx, W, totalRise);
  elements.push(
    <line key="top-w" x1={topNear.sx} y1={topNear.sy} x2={topFar.sx} y2={topFar.sy} stroke="#374151" strokeWidth={1.5} />
  );

  // Width label
  const topMid = proj(lastStep.cx, W / 2, totalRise);
  elements.push(
    <text
      key="width-label"
      x={topMid.sx + 4}
      y={topMid.sy - 4}
      fontSize={9}
      fill="#6b7280"
      fontFamily="monospace"
    >
      {Math.round(W)} mm
    </text>
  );

  // Bottom width line
  const botNear = proj(0, 0, 0);
  const botFar = proj(0, W, 0);
  elements.push(
    <line key="bot-w" x1={botNear.sx} y1={botNear.sy} x2={botFar.sx} y2={botFar.sy} stroke="#374151" strokeWidth={1.5} />
  );

  // Ground shadow line (context)
  const gL = proj(-d * 0.3, 0, 0);
  const gR = proj(lastStep.cx + d * 0.3, 0, 0);
  elements.push(
    <line key="ground" x1={gL.sx} y1={gL.sy} x2={gR.sx} y2={gR.sy} stroke="#9ca3af" strokeWidth={1} strokeDasharray="4,3" />
  );

  return (
    <svg
      data-testid="iso-view-svg"
      viewBox={`0 0 ${W_SVG} ${H_SVG}`}
      width="100%"
      style={{ maxHeight: H_SVG }}
      className="bg-white border border-gray-200 rounded"
    >
      <text x={W_SVG / 2} y={14} textAnchor="middle" fontSize={11} fill="#6b7280" fontFamily="sans-serif">
        3D-vy
      </text>
      {elements}
    </svg>
  );
}
