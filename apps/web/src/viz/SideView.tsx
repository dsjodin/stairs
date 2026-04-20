import React from "react";
import type { StairResult, StairStyle, FlightSegment, LandingSegment } from "@stairs/calc";
import { DimensionLine } from "./DimensionLine.tsx";

interface Props {
  result: StairResult;
  style: StairStyle;
}

const MARGIN = 80;
const W = 700;
const H = 450;

export function SideView({ result, style }: Props) {
  const { segments, actualStepHeight, actualStepDepth, totalRun, slopeDegrees } = result;
  const totalRise = result.numberOfSteps * actualStepHeight;

  const scaleX = (W - MARGIN * 2) / (totalRun + actualStepDepth * 2);
  const scaleY = (H - MARGIN * 2) / (totalRise + actualStepHeight * 2);
  const scale = Math.min(scaleX, scaleY);

  function sx(mm: number) {
    return MARGIN + mm * scale;
  }
  function sy(mm: number) {
    return H - MARGIN - mm * scale;
  }

  const paths: React.ReactNode[] = [];
  let stepIndex = 0;

  for (const seg of segments) {
    if (seg.kind === "landing") {
      const ls = seg as LandingSegment;
      paths.push(
        <rect
          key={`landing-${stepIndex}`}
          x={sx(ls.x)}
          y={sy(ls.y + ls.depth)}
          width={ls.width * scale}
          height={ls.depth * scale}
          fill="#e5e7eb"
          stroke="#374151"
          strokeWidth={1.5}
        />
      );
      continue;
    }

    const fs = seg as FlightSegment;
    let cx = fs.startX;
    let cy = fs.startY;

    for (let i = 0; i < fs.steps; i++) {
      stepIndex++;
      const riser = fs.stepHeight;
      const tread = fs.stepDepth;
      const isLast = i === fs.steps - 1;

      if (fs.direction === "right") {
        // Always draw riser; only draw tread if not last step
        if (style === "closed") {
          const p = isLast
            ? `M${sx(cx)},${sy(cy)} L${sx(cx)},${sy(cy + riser)}`
            : `M${sx(cx)},${sy(cy)} L${sx(cx)},${sy(cy + riser)} L${sx(cx + tread)},${sy(cy + riser)}`;
          paths.push(<path key={`step-${stepIndex}`} d={p} fill="none" stroke="#374151" strokeWidth={1.5} />);
        } else if (!isLast) {
          // Open style: tread line only
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
      } else if (fs.direction === "up") {
        // Second flight in L-shape (profile view: going "up" means stepping in Y direction)
        if (style === "closed") {
          const p = isLast
            ? `M${sx(cx)},${sy(cy)} L${sx(cx + riser)},${sy(cy)}`
            : `M${sx(cx)},${sy(cy)} L${sx(cx + riser)},${sy(cy)} L${sx(cx + riser)},${sy(cy + tread)}`;
          paths.push(<path key={`step-${stepIndex}`} d={p} fill="none" stroke="#374151" strokeWidth={1.5} />);
        } else if (!isLast) {
          paths.push(
            <path
              key={`step-${stepIndex}`}
              d={`M${sx(cx + riser)},${sy(cy)} L${sx(cx + riser)},${sy(cy + tread)}`}
              fill="none"
              stroke="#374151"
              strokeWidth={2}
            />
          );
        }
        cx += riser;
        if (!isLast) cy += tread;
      }
    }
  }

  // Stringer (diagonal underside line) for straight stair
  const straightFlights = segments.filter((s) => s.kind === "flight") as FlightSegment[];
  const firstFlight = straightFlights[0];
  const lastFlight = straightFlights[straightFlights.length - 1];
  const stringerEndX =
    lastFlight.direction === "right"
      ? lastFlight.startX + (lastFlight.steps - 1) * lastFlight.stepDepth
      : lastFlight.startX;
  const stringerEndY = totalRise;

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

      {/* Ground line */}
      <line
        x1={sx(0) - 10}
        y1={sy(0)}
        x2={sx(totalRun) + 10}
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
        y2={sy(stringerEndY)}
        stroke="#6b7280"
        strokeWidth={1}
        strokeDasharray="5,3"
        opacity={0.7}
      />

      {paths}

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

      {/* Angle arc */}
      <text
        x={sx(0) + 30}
        y={sy(0) - 10}
        fontSize={10}
        fill="#6b7280"
        fontFamily="monospace"
      >
        {slopeDegrees.toFixed(1)}°
      </text>
    </svg>
  );
}
