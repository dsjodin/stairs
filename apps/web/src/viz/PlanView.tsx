import React from "react";
import type { StairResult, FlightSegment, LandingSegment, WinderSegment } from "@stairs/calc";
import { DimensionLine } from "./DimensionLine.tsx";

interface Props {
  result: StairResult;
}

const MARGIN = 80;
const W = 700;
const H = 450;

export function PlanView({ result }: Props) {
  const { segments, totalFootprint, stairWidth } = result;

  const fpW = Math.max(totalFootprint.width, 1);
  const fpD = Math.max(totalFootprint.depth, 1);

  const scaleX = (W - MARGIN * 2) / fpW;
  const scaleY = (H - MARGIN * 2) / fpD;
  const scale = Math.min(scaleX, scaleY);

  function px(mm: number) {
    return MARGIN + mm * scale;
  }
  function py(mm: number) {
    return MARGIN + mm * scale;
  }

  const elements: React.ReactNode[] = [];
  let stepNum = 0;

  for (const seg of segments) {
    if (seg.kind === "landing") {
      const ls = seg as LandingSegment;
      elements.push(
        <rect
          key="landing-rect"
          x={px(ls.x)}
          y={py(ls.y)}
          width={ls.width * scale}
          height={ls.depth * scale}
          fill="#d1fae5"
          stroke="#374151"
          strokeWidth={1.5}
        />
      );
      elements.push(
        <text
          key="landing-label"
          x={px(ls.x + ls.width / 2)}
          y={py(ls.y + ls.depth / 2)}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={10}
          fill="#047857"
          fontFamily="sans-serif"
        >
          Vilplan
        </text>
      );
      continue;
    }

    if (seg.kind === "winder") {
      const ws = seg as WinderSegment;
      const pivX = px(ws.pivotX);
      const pivY = py(ws.pivotY);
      const outerR_px = ws.outerRadius * scale;
      const walkR_px = (2 / 3) * ws.outerRadius * scale;

      for (let i = 0; i < ws.steps; i++) {
        stepNum++;
        const a1 = ((ws.startAngleDeg + (i * ws.totalAngleDeg) / ws.steps) * Math.PI) / 180;
        const a2 = ((ws.startAngleDeg + ((i + 1) * ws.totalAngleDeg) / ws.steps) * Math.PI) / 180;
        const x1 = pivX + outerR_px * Math.cos(a1);
        const y1 = pivY + outerR_px * Math.sin(a1);
        const x2 = pivX + outerR_px * Math.cos(a2);
        const y2 = pivY + outerR_px * Math.sin(a2);
        const d = `M ${pivX},${pivY} L ${x1},${y1} A ${outerR_px},${outerR_px} 0 0 1 ${x2},${y2} Z`;
        elements.push(
          <path
            key={`winder-step-${i}`}
            d={d}
            fill={i % 2 === 0 ? "#fef3c7" : "#fde68a"}
            stroke="#374151"
            strokeWidth={1.5}
          />
        );
        const midA = (a1 + a2) / 2;
        const labelR = outerR_px * 0.6;
        elements.push(
          <text
            key={`winder-num-${i}`}
            x={pivX + labelR * Math.cos(midA)}
            y={pivY + labelR * Math.sin(midA)}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={9}
            fill="#6b7280"
            fontFamily="monospace"
          >
            {stepNum}
          </text>
        );
      }

      // Walking line arc (dashed blue, at 2/3 of stairWidth from pivot)
      const wa1 = (ws.startAngleDeg * Math.PI) / 180;
      const wa2 = ((ws.startAngleDeg + ws.totalAngleDeg) * Math.PI) / 180;
      const wx1 = pivX + walkR_px * Math.cos(wa1);
      const wy1 = pivY + walkR_px * Math.sin(wa1);
      const wx2 = pivX + walkR_px * Math.cos(wa2);
      const wy2 = pivY + walkR_px * Math.sin(wa2);
      elements.push(
        <path
          key="walking-line"
          d={`M ${wx1},${wy1} A ${walkR_px},${walkR_px} 0 0 1 ${wx2},${wy2}`}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={1.5}
          strokeDasharray="4,2"
        />
      );
      continue;
    }

    const fs = seg as FlightSegment;
    const isRight = fs.direction === "right";
    const isLeft = fs.direction === "left";
    const isUp = fs.direction === "up";

    if (isRight) {
      const fw = fs.steps * fs.stepDepth;
      elements.push(
        <rect
          key={`flight-bg-${stepNum}`}
          x={px(fs.startX)}
          y={py(fs.startY)}
          width={fw * scale}
          height={stairWidth * scale}
          fill="#f9fafb"
          stroke="#374151"
          strokeWidth={2}
        />
      );
      for (let i = 0; i <= fs.steps; i++) {
        stepNum++;
        const tx = fs.startX + i * fs.stepDepth;
        elements.push(
          <line
            key={`line-${stepNum}`}
            x1={px(tx)}
            y1={py(fs.startY)}
            x2={px(tx)}
            y2={py(fs.startY + stairWidth)}
            stroke="#374151"
            strokeWidth={i === 0 || i === fs.steps ? 2 : 0.5}
          />
        );
        if (i < fs.steps) {
          elements.push(
            <text
              key={`num-${stepNum}`}
              x={px(tx + fs.stepDepth / 2)}
              y={py(fs.startY + stairWidth / 2)}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={9}
              fill="#6b7280"
              fontFamily="monospace"
            >
              {stepNum}
            </text>
          );
        }
      }
      stepNum--;
      const arrowX = fs.startX + fs.steps * fs.stepDepth * 0.75;
      elements.push(
        <polygon
          key={`arrow-r-${stepNum}`}
          points={`${px(arrowX + 12)},${py(fs.startY + stairWidth / 2)} ${px(arrowX)},${py(fs.startY + stairWidth / 2 - 6)} ${px(arrowX)},${py(fs.startY + stairWidth / 2 + 6)}`}
          fill="#3b82f6"
        />
      );
    } else if (isLeft) {
      const fw = fs.steps * fs.stepDepth;
      elements.push(
        <rect
          key={`flight-bg-left-${stepNum}`}
          x={px(fs.startX - fw)}
          y={py(fs.startY)}
          width={fw * scale}
          height={stairWidth * scale}
          fill="#f9fafb"
          stroke="#374151"
          strokeWidth={2}
        />
      );
      for (let i = 0; i <= fs.steps; i++) {
        stepNum++;
        const tx = fs.startX - i * fs.stepDepth;
        elements.push(
          <line
            key={`line-l-${stepNum}`}
            x1={px(tx)}
            y1={py(fs.startY)}
            x2={px(tx)}
            y2={py(fs.startY + stairWidth)}
            stroke="#374151"
            strokeWidth={i === 0 || i === fs.steps ? 2 : 0.5}
          />
        );
        if (i < fs.steps) {
          elements.push(
            <text
              key={`num-l-${stepNum}`}
              x={px(tx - fs.stepDepth / 2)}
              y={py(fs.startY + stairWidth / 2)}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={9}
              fill="#6b7280"
              fontFamily="monospace"
            >
              {stepNum}
            </text>
          );
        }
      }
      stepNum--;
      const arrowX = fs.startX - fs.steps * fs.stepDepth * 0.75;
      elements.push(
        <polygon
          key={`arrow-l-${stepNum}`}
          points={`${px(arrowX - 12)},${py(fs.startY + stairWidth / 2)} ${px(arrowX)},${py(fs.startY + stairWidth / 2 - 6)} ${px(arrowX)},${py(fs.startY + stairWidth / 2 + 6)}`}
          fill="#3b82f6"
        />
      );
    } else if (isUp) {
      const fd = fs.steps * fs.stepDepth;
      elements.push(
        <rect
          key={`flight-bg-up-${stepNum}`}
          x={px(fs.startX)}
          y={py(fs.startY)}
          width={stairWidth * scale}
          height={fd * scale}
          fill="#f9fafb"
          stroke="#374151"
          strokeWidth={2}
        />
      );
      for (let i = 0; i <= fs.steps; i++) {
        stepNum++;
        const ty = fs.startY + i * fs.stepDepth;
        elements.push(
          <line
            key={`line-u-${stepNum}`}
            x1={px(fs.startX)}
            y1={py(ty)}
            x2={px(fs.startX + stairWidth)}
            y2={py(ty)}
            stroke="#374151"
            strokeWidth={i === 0 || i === fs.steps ? 2 : 0.5}
          />
        );
        if (i < fs.steps) {
          elements.push(
            <text
              key={`num-u-${stepNum}`}
              x={px(fs.startX + stairWidth / 2)}
              y={py(ty + fs.stepDepth / 2)}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={9}
              fill="#6b7280"
              fontFamily="monospace"
            >
              {stepNum}
            </text>
          );
        }
      }
      stepNum--;
    }
  }

  return (
    <svg
      data-testid="plan-view-svg"
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ maxHeight: 450 }}
      className="bg-white border border-gray-200 rounded"
    >
      <text
        x={W / 2}
        y={16}
        textAnchor="middle"
        fontSize={12}
        fill="#6b7280"
        fontFamily="sans-serif"
      >
        Planvy
      </text>

      {elements}

      <DimensionLine
        x1={px(0)}
        y1={py(fpD + 10)}
        x2={px(fpW)}
        y2={py(fpD + 10)}
        label={`${Math.round(fpW)} mm`}
        offset={20}
      />
      <DimensionLine
        x1={px(fpW + 10)}
        y1={py(0)}
        x2={px(fpW + 10)}
        y2={py(fpD)}
        label={`${Math.round(fpD)} mm`}
        offset={20}
      />
    </svg>
  );
}
