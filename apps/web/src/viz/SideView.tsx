import React from "react";
import type { StairResult, StairStyle, FlightSegment, LandingSegment, WinderSegment } from "@stairs/calc";
import { DimensionLine } from "./DimensionLine.tsx";

interface Props {
  result: StairResult;
  style: StairStyle;
}

const MARGIN = 80;
const W = 700;
const H = 450;

export function SideView({ result, style }: Props) {
  const {
    segments,
    actualStepHeight,
    actualStepDepth,
    totalRun,
    slopeDegrees,
    stairwellStart,
    stairwellLength,
    floorThickness,
    minimumHeadroom,
  } = result;
  const totalRise = result.numberOfSteps * actualStepHeight;

  // Landing depth adds to visual horizontal span in the unrolled elevation
  let landingVisualWidth = 0;
  for (let si = 0; si < segments.length; si++) {
    const seg = segments[si];
    if (seg.kind === "landing") {
      const ls = seg as LandingSegment;
      const nextFlight = segments.slice(si + 1).find((s) => s.kind === "flight") as FlightSegment | undefined;
      landingVisualWidth += nextFlight?.direction === "left" ? ls.width : ls.depth;
    }
  }

  const extraLeft = actualStepDepth * 1.5;
  const extraRight = actualStepDepth * 2;
  const extraY = stairwellStart !== undefined ? floorThickness + actualStepHeight * 2 : actualStepHeight * 2;

  const scaleX = (W - MARGIN * 2) / (totalRun + landingVisualWidth + extraLeft + extraRight);
  const scaleY = (H - MARGIN * 2) / (totalRise + extraY);
  const scale = Math.min(scaleX, scaleY);

  function sx(mm: number) {
    return MARGIN + (mm + extraLeft) * scale;
  }
  function sy(mm: number) {
    return H - MARGIN - mm * scale;
  }

  const paths: React.ReactNode[] = [];
  let stepIndex = 0;
  let cx = 0;
  let cy = 0;

  for (let segIndex = 0; segIndex < segments.length; segIndex++) {
    const seg = segments[segIndex];
    const isLastSeg = segIndex === segments.length - 1;

    if (seg.kind === "landing") {
      const ls = seg as LandingSegment;
      const nextFlight = segments.slice(segIndex + 1).find((s) => s.kind === "flight") as FlightSegment | undefined;
      const advance = nextFlight?.direction === "left" ? ls.width : ls.depth;
      // Draw a flat platform at the current accumulated height (cy unchanged)
      paths.push(
        <rect
          key={`landing-${stepIndex}`}
          x={sx(cx)}
          y={sy(cy)}
          width={advance * scale}
          height={Math.max(3, actualStepHeight * scale * 0.15)}
          fill="#d1fae5"
          stroke="#374151"
          strokeWidth={1}
        />
      );
      cx += advance;
      // cy stays unchanged — landing is flat
      continue;
    }

    if (seg.kind === "winder") {
      const ws = seg as WinderSegment;
      const tread = actualStepDepth;
      for (let i = 0; i < ws.steps; i++) {
        stepIndex++;
        const riser = ws.stepHeight;
        const isLast = isLastSeg && i === ws.steps - 1;
        if (style === "closed") {
          const p = isLast
            ? `M${sx(cx)},${sy(cy)} L${sx(cx)},${sy(cy + riser)}`
            : `M${sx(cx)},${sy(cy)} L${sx(cx)},${sy(cy + riser)} L${sx(cx + tread)},${sy(cy + riser)}`;
          paths.push(
            <path key={`winder-side-${i}`} d={p} fill="none" stroke="#d97706" strokeWidth={1.5} />
          );
        } else if (!isLast) {
          paths.push(
            <path
              key={`winder-side-${i}`}
              d={`M${sx(cx)},${sy(cy + riser)} L${sx(cx + tread)},${sy(cy + riser)}`}
              fill="none"
              stroke="#d97706"
              strokeWidth={2}
            />
          );
        }
        if (!isLast) cx += tread;
        cy += riser;
      }
      continue;
    }

    const fs = seg as FlightSegment;
    if (fs.direction === "right") {
      cx = fs.startX;
      cy = fs.startY;
    }

    for (let i = 0; i < fs.steps; i++) {
      stepIndex++;
      const riser = fs.stepHeight;
      const tread = fs.stepDepth;
      const isLast = isLastSeg && i === fs.steps - 1;

      if (style === "closed") {
        const p = isLast
          ? `M${sx(cx)},${sy(cy)} L${sx(cx)},${sy(cy + riser)}`
          : `M${sx(cx)},${sy(cy)} L${sx(cx)},${sy(cy + riser)} L${sx(cx + tread)},${sy(cy + riser)}`;
        paths.push(<path key={`step-${stepIndex}`} d={p} fill="none" stroke="#374151" strokeWidth={1.5} />);
      } else if (!isLast) {
        paths.push(
          <path
            key={`step-${stepIndex}`}
            d={`M${sx(cx)},${sy(cy + riser)} L${sx(cx + tread)},${sy(cy + riser)}`}
            fill="none"
            stroke="#374151"
            strokeWidth={2}
          />
        );
      }
      if (!isLast) cx += tread;
      cy += riser;
    }
  }

  const firstFlight = segments.find((s) => s.kind === "flight") as FlightSegment;
  const stringerEndX = cx;

  // Floor context (always shown)
  const floorExtendMm = actualStepDepth * 1.5;
  const slabWidthMm = actualStepDepth * 1.5;
  const floorContextElements: React.ReactNode[] = [
    // Lower floor line extending left
    <line
      key="lower-floor"
      x1={sx(-floorExtendMm)}
      y1={sy(0)}
      x2={sx(0)}
      y2={sy(0)}
      stroke="#374151"
      strokeWidth={2}
    />,
    // Upper floor line extending right
    <line
      key="upper-floor"
      x1={sx(stringerEndX)}
      y1={sy(totalRise)}
      x2={sx(stringerEndX + floorExtendMm)}
      y2={sy(totalRise)}
      stroke="#374151"
      strokeWidth={2}
    />,
    // Upper floor slab
    <rect
      key="upper-slab"
      x={sx(stringerEndX)}
      y={sy(totalRise)}
      width={slabWidthMm * scale}
      height={floorThickness * scale}
      fill="#d1d5db"
      stroke="#374151"
      strokeWidth={1}
    />,
  ];

  // Stairwell elements
  const stairwellElements: React.ReactNode[] = [];
  if (stairwellStart !== undefined && stairwellLength !== undefined) {
    const ceilingH = totalRise - floorThickness;
    const nosingAtStart = stairwellStart * (totalRise / totalRun);

    // Headroom zone shading
    stairwellElements.push(
      <rect
        key="sw-zone"
        x={sx(stairwellStart)}
        y={sy(ceilingH)}
        width={(totalRun - stairwellStart) * scale}
        height={(ceilingH - nosingAtStart) * scale}
        fill="#fef3c7"
        opacity={0.45}
      />
    );

    // Dashed ceiling line (underside of upper floor)
    stairwellElements.push(
      <line
        key="sw-ceiling"
        x1={sx(stairwellStart)}
        y1={sy(ceilingH)}
        x2={sx(totalRun)}
        y2={sy(ceilingH)}
        stroke="#6b7280"
        strokeWidth={1.5}
        strokeDasharray="6,3"
      />
    );

    // Vertical edge of stairwell opening
    stairwellElements.push(
      <line
        key="sw-edge"
        x1={sx(stairwellStart)}
        y1={sy(nosingAtStart)}
        x2={sx(stairwellStart)}
        y2={sy(ceilingH)}
        stroke="#9ca3af"
        strokeWidth={1}
        strokeDasharray="4,2"
      />
    );

    // Headroom dimension at stairwellStart
    stairwellElements.push(
      <DimensionLine
        key="sw-headroom"
        x1={sx(stairwellStart) + 30}
        y1={sy(nosingAtStart)}
        x2={sx(stairwellStart) + 30}
        y2={sy(ceilingH)}
        label={`${Math.round(minimumHeadroom)} mm`}
        offset={20}
        color="#f59e0b"
      />
    );

    // Stairwell length dimension
    stairwellElements.push(
      <DimensionLine
        key="sw-length"
        x1={sx(stairwellStart)}
        y1={sy(0) + 50}
        x2={sx(totalRun)}
        y2={sy(0) + 50}
        label={`Trapphål ${Math.round(stairwellLength)} mm`}
        offset={18}
        color="#6b7280"
      />
    );
  }

  return (
    <svg
      data-testid="side-view-svg"
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ maxHeight: 450 }}
      className="bg-white border border-gray-200 rounded"
    >
      <text x={W / 2} y={16} textAnchor="middle" fontSize={12} fill="#6b7280" fontFamily="sans-serif">
        Sidovy
      </text>

      {floorContextElements}

      {/* Ground reference line */}
      <line
        x1={sx(-floorExtendMm) - 8}
        y1={sy(0)}
        x2={sx(stringerEndX) + 8}
        y2={sy(0)}
        stroke="#9ca3af"
        strokeWidth={1}
        strokeDasharray="4,4"
      />

      {/* Stringer */}
      <line
        x1={sx(firstFlight.startX)}
        y1={sy(firstFlight.startY)}
        x2={sx(stringerEndX)}
        y2={sy(totalRise)}
        stroke="#6b7280"
        strokeWidth={1}
        strokeDasharray="5,3"
        opacity={0.7}
      />

      {paths}
      {stairwellElements}

      {/* Dimension lines */}
      <DimensionLine
        x1={sx(0)}
        y1={sy(0)}
        x2={sx(0)}
        y2={sy(totalRise)}
        label={`${Math.round(totalRise)} mm`}
        offset={-40}
      />
      <DimensionLine
        x1={sx(0)}
        y1={sy(0)}
        x2={sx(totalRun)}
        y2={sy(0)}
        label={`${Math.round(totalRun)} mm`}
        offset={30}
      />
      <DimensionLine
        x1={sx(0)}
        y1={sy(0)}
        x2={sx(0)}
        y2={sy(actualStepHeight)}
        label={`h=${Math.round(actualStepHeight)} mm`}
        offset={-25}
        color="#f59e0b"
      />
      <DimensionLine
        x1={sx(0)}
        y1={sy(actualStepHeight)}
        x2={sx(actualStepDepth)}
        y2={sy(actualStepHeight)}
        label={`d=${Math.round(actualStepDepth)} mm`}
        offset={-18}
        color="#f59e0b"
      />

      {/* Angle */}
      <text x={sx(0) + 30} y={sy(0) - 10} fontSize={10} fill="#6b7280" fontFamily="monospace">
        {slopeDegrees.toFixed(1)}°
      </text>
    </svg>
  );
}
