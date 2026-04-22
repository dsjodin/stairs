import React from "react";
import type { StairResult, FlightSegment, LandingSegment, WinderSegment } from "@stairs/calc";

interface Props {
  result: StairResult;
}

const W_SVG = 700;
const H_SVG = 380;
const MARGIN = 50;

export function IsoView({ result }: Props) {
  const { segments, actualStepHeight: rH, actualStepDepth: rD, stairWidth: W, numberOfSteps } = result;
  const totalRise = numberOfSteps * rH;
  const fp = result.totalFootprint;

  const projW = fp.width + fp.depth * 0.5;
  const projH = totalRise + fp.depth * 0.25;

  const scaleX = (W_SVG - MARGIN * 2) / Math.max(projW, 1);
  const scaleY = (H_SVG - MARGIN * 2) / Math.max(projH, 1);
  const scale = Math.min(scaleX, scaleY);

  // baseY places z=0 at the correct screen y
  const baseX = MARGIN;
  const baseY = MARGIN + totalRise * scale;

  function proj(x: number, y: number, z: number) {
    return { sx: baseX + (x + y * 0.5) * scale, sy: baseY + (-z + y * 0.25) * scale };
  }

  function pStr(x: number, y: number, z: number) {
    const pt = proj(x, y, z);
    return `${pt.sx.toFixed(1)},${pt.sy.toFixed(1)}`;
  }

  function quad(c: [number, number, number][]) {
    return c.map(([x, y, z]) => pStr(x, y, z)).join(" ");
  }

  let z3d = 0;
  let k = 0;
  const bg: React.ReactNode[] = []; // drawn first (back faces / stringers)
  const fg: React.ReactNode[] = []; // drawn second (risers + treads)

  for (let si = 0; si < segments.length; si++) {
    const seg = segments[si];
    const isLastSeg = si === segments.length - 1;

    if (seg.kind === "landing") {
      const ls = seg as LandingSegment;
      fg.push(
        <polygon
          key={`land-${k++}`}
          points={quad([
            [ls.x, ls.y, z3d],
            [ls.x + ls.width, ls.y, z3d],
            [ls.x + ls.width, ls.y + ls.depth, z3d],
            [ls.x, ls.y + ls.depth, z3d],
          ])}
          fill="#d1fae5"
          stroke="#374151"
          strokeWidth={1}
        />
      );
      continue;
    }

    if (seg.kind === "winder") {
      const ws = seg as WinderSegment;
      const { pivotX: px, pivotY: py, outerRadius: R, startAngleDeg, totalAngleDeg } = ws;

      for (let i = 0; i < ws.steps; i++) {
        const isLast = isLastSeg && i === ws.steps - 1;
        const h = ws.stepHeight;
        const a1 = ((startAngleDeg + (i * totalAngleDeg) / ws.steps) * Math.PI) / 180;
        const a2 = ((startAngleDeg + ((i + 1) * totalAngleDeg) / ws.steps) * Math.PI) / 180;
        const aMid = (a1 + a2) / 2;
        const ox1 = px + R * Math.cos(a1), oy1 = py + R * Math.sin(a1);
        const ox2 = px + R * Math.cos(a2), oy2 = py + R * Math.sin(a2);
        const oxM = px + R * Math.cos(aMid), oyM = py + R * Math.sin(aMid);

        // Riser face (radial boundary at angle a1)
        fg.push(
          <polygon key={`wr-${k++}`}
            points={quad([[px, py, z3d], [ox1, oy1, z3d], [ox1, oy1, z3d + h], [px, py, z3d + h]])}
            fill="#9ca3af" stroke="#374151" strokeWidth={0.8} />
        );
        if (!isLast) {
          // Tread sector approximated with a 4-point polygon (pivot + 3 arc pts)
          fg.push(
            <polygon key={`wt-${k++}`}
              points={quad([[px, py, z3d + h], [ox1, oy1, z3d + h], [oxM, oyM, z3d + h], [ox2, oy2, z3d + h]])}
              fill="#fef3c7" stroke="#374151" strokeWidth={0.8} />
          );
        }
        z3d += h;
      }
      continue;
    }

    const fs = seg as FlightSegment;
    const h = fs.stepHeight;
    const d = fs.stepDepth;

    if (fs.direction === "right") {
      const y0 = fs.startY;
      let x3d = fs.startX;
      const z0 = z3d;

      // Far stringer polygon (at y = y0 + W)
      const farPts: string[] = [pStr(x3d, y0 + W, z0)];
      let tx = x3d;
      for (let i = 0; i < fs.steps; i++) {
        const isLast = isLastSeg && i === fs.steps - 1;
        farPts.push(pStr(tx, y0 + W, z0 + (i + 1) * h));
        if (!isLast) farPts.push(pStr(tx + d, y0 + W, z0 + (i + 1) * h));
        if (!isLast) tx += d;
      }
      farPts.push(pStr(tx, y0 + W, z0));
      bg.push(<polygon key={`fs-${k++}`} points={farPts.join(" ")} fill="#d1d5db" stroke="#374151" strokeWidth={1} />);

      for (let i = 0; i < fs.steps; i++) {
        const isLast = isLastSeg && i === fs.steps - 1;
        fg.push(
          <polygon key={`r-${k++}`}
            points={quad([[x3d, y0, z3d], [x3d, y0 + W, z3d], [x3d, y0 + W, z3d + h], [x3d, y0, z3d + h]])}
            fill="#9ca3af" stroke="#374151" strokeWidth={0.8} />
        );
        if (!isLast) {
          fg.push(
            <polygon key={`t-${k++}`}
              points={quad([[x3d, y0, z3d + h], [x3d + d, y0, z3d + h], [x3d + d, y0 + W, z3d + h], [x3d, y0 + W, z3d + h]])}
              fill="#f3f4f6" stroke="#374151" strokeWidth={0.8} />
          );
          x3d += d;
        }
        z3d += h;
      }
    } else if (fs.direction === "up") {
      const x0 = fs.startX;
      let y3d = fs.startY;
      const z0 = z3d;

      // Far stringer at x = x0 + W
      const farPts: string[] = [pStr(x0 + W, y3d, z0)];
      let ty = y3d;
      for (let i = 0; i < fs.steps; i++) {
        const isLast = isLastSeg && i === fs.steps - 1;
        farPts.push(pStr(x0 + W, ty, z0 + (i + 1) * h));
        if (!isLast) farPts.push(pStr(x0 + W, ty + d, z0 + (i + 1) * h));
        if (!isLast) ty += d;
      }
      farPts.push(pStr(x0 + W, ty, z0));
      bg.push(<polygon key={`fs-${k++}`} points={farPts.join(" ")} fill="#c8d5e0" stroke="#374151" strokeWidth={1} />);

      for (let i = 0; i < fs.steps; i++) {
        const isLast = isLastSeg && i === fs.steps - 1;
        fg.push(
          <polygon key={`r-${k++}`}
            points={quad([[x0, y3d, z3d], [x0 + W, y3d, z3d], [x0 + W, y3d, z3d + h], [x0, y3d, z3d + h]])}
            fill="#a3b4c4" stroke="#374151" strokeWidth={0.8} />
        );
        if (!isLast) {
          fg.push(
            <polygon key={`t-${k++}`}
              points={quad([[x0, y3d, z3d + h], [x0 + W, y3d, z3d + h], [x0 + W, y3d + d, z3d + h], [x0, y3d + d, z3d + h]])}
              fill="#e8edf2" stroke="#374151" strokeWidth={0.8} />
          );
          y3d += d;
        }
        z3d += h;
      }
    } else if (fs.direction === "left") {
      const y0 = fs.startY;
      let x3d = fs.startX;
      const z0 = z3d;

      // Far stringer at y = y0 + W
      const farPts: string[] = [pStr(x3d, y0 + W, z0)];
      let tx = x3d;
      for (let i = 0; i < fs.steps; i++) {
        const isLast = isLastSeg && i === fs.steps - 1;
        farPts.push(pStr(tx, y0 + W, z0 + (i + 1) * h));
        if (!isLast) farPts.push(pStr(tx - d, y0 + W, z0 + (i + 1) * h));
        if (!isLast) tx -= d;
      }
      farPts.push(pStr(tx, y0 + W, z0));
      bg.push(<polygon key={`fs-${k++}`} points={farPts.join(" ")} fill="#d1d5db" stroke="#374151" strokeWidth={1} />);

      for (let i = 0; i < fs.steps; i++) {
        const isLast = isLastSeg && i === fs.steps - 1;
        // Riser faces +x direction; draw it anyway for visual clarity
        fg.push(
          <polygon key={`r-${k++}`}
            points={quad([[x3d, y0, z3d], [x3d, y0 + W, z3d], [x3d, y0 + W, z3d + h], [x3d, y0, z3d + h]])}
            fill="#b0bec5" stroke="#374151" strokeWidth={0.8} />
        );
        if (!isLast) {
          fg.push(
            <polygon key={`t-${k++}`}
              points={quad([[x3d - d, y0, z3d + h], [x3d, y0, z3d + h], [x3d, y0 + W, z3d + h], [x3d - d, y0 + W, z3d + h]])}
              fill="#f3f4f6" stroke="#374151" strokeWidth={0.8} />
          );
          x3d -= d;
        }
        z3d += h;
      }
    }
  }

  // Width label at top of last segment
  const lastSeg = segments[segments.length - 1];
  let labelPt = proj(0, W / 2, totalRise);
  let labelPt2 = proj(0, W, totalRise);
  if (lastSeg.kind === "flight") {
    const fs = lastSeg as FlightSegment;
    if (fs.direction === "right") {
      labelPt = proj(result.totalRun, fs.startY, totalRise);
      labelPt2 = proj(result.totalRun, fs.startY + W, totalRise);
    } else if (fs.direction === "up") {
      const finalY = fs.startY + (fs.steps - 1) * fs.stepDepth;
      labelPt = proj(fs.startX, finalY, totalRise);
      labelPt2 = proj(fs.startX + W, finalY, totalRise);
    } else if (fs.direction === "left") {
      const finalX = fs.startX - (fs.steps - 1) * fs.stepDepth;
      labelPt = proj(finalX, fs.startY, totalRise);
      labelPt2 = proj(finalX, fs.startY + W, totalRise);
    }
  }
  const widthMidX = (labelPt.sx + labelPt2.sx) / 2;
  const widthMidY = (labelPt.sy + labelPt2.sy) / 2;

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
      {bg}
      {fg}
      <text x={widthMidX + 4} y={widthMidY - 4} fontSize={9} fill="#6b7280" fontFamily="monospace">
        {Math.round(W)} mm
      </text>
    </svg>
  );
}
