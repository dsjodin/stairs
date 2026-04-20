import React from "react";

interface Props {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  offset?: number;
  color?: string;
}

export function DimensionLine({ x1, y1, x2, y2, label, offset = 20, color = "#3b82f6" }: Props) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1) return null;

  const nx = -dy / len;
  const ny = dx / len;

  const ox1 = x1 + nx * offset;
  const oy1 = y1 + ny * offset;
  const ox2 = x2 + nx * offset;
  const oy2 = y2 + ny * offset;

  const mx = (ox1 + ox2) / 2;
  const my = (oy1 + oy2) / 2;

  const arrowSize = 6;
  const ux = dx / len;
  const uy = dy / len;

  // arrowhead at start (pointing toward ox1)
  const a1x1 = ox1 + ux * arrowSize + ny * arrowSize * 0.4;
  const a1y1 = oy1 + uy * arrowSize + (-nx) * arrowSize * 0.4;
  const a1x2 = ox1 + ux * arrowSize - ny * arrowSize * 0.4;
  const a1y2 = oy1 + uy * arrowSize - (-nx) * arrowSize * 0.4;

  // arrowhead at end (pointing toward ox2)
  const a2x1 = ox2 - ux * arrowSize + ny * arrowSize * 0.4;
  const a2y1 = oy2 - uy * arrowSize + (-nx) * arrowSize * 0.4;
  const a2x2 = ox2 - ux * arrowSize - ny * arrowSize * 0.4;
  const a2y2 = oy2 - uy * arrowSize - (-nx) * arrowSize * 0.4;

  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const flip = Math.abs(angle) > 90;
  const textAngle = flip ? angle + 180 : angle;

  return (
    <g stroke={color} fill={color} strokeWidth={1} fontSize={10} fontFamily="monospace">
      <line x1={x1} y1={y1} x2={ox1} y2={oy1} strokeDasharray="3,3" opacity={0.5} />
      <line x1={x2} y1={y2} x2={ox2} y2={oy2} strokeDasharray="3,3" opacity={0.5} />
      <line x1={ox1} y1={oy1} x2={ox2} y2={oy2} />
      <polygon points={`${ox1},${oy1} ${a1x1},${a1y1} ${a1x2},${a1y2}`} />
      <polygon points={`${ox2},${oy2} ${a2x1},${a2y1} ${a2x2},${a2y2}`} />
      <text
        x={mx}
        y={my}
        textAnchor="middle"
        dominantBaseline="middle"
        transform={`rotate(${textAngle}, ${mx}, ${my})`}
        dy={-5}
        fill={color}
        stroke="none"
      >
        {label}
      </text>
    </g>
  );
}
