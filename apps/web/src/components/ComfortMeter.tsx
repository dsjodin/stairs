import React from "react";
import type { BlondelZone } from "@stairs/calc";

interface Props {
  value: number;
  zone: BlondelZone;
  stepHeight: number;
  stepDepth: number;
}

const SCALE_MIN = 560;
const SCALE_MAX = 680;
const W = 400;
const BAR_Y = 30;
const BAR_H = 16;

interface ZoneBar {
  from: number;
  to: number;
  color: string;
}

const ZONES: ZoneBar[] = [
  { from: 560, to: 580, color: "#ef4444" },
  { from: 580, to: 600, color: "#f97316" },
  { from: 600, to: 620, color: "#eab308" },
  { from: 620, to: 630, color: "#22c55e" },
  { from: 630, to: 640, color: "#eab308" },
  { from: 640, to: 660, color: "#f97316" },
  { from: 660, to: 680, color: "#ef4444" },
];

function toX(v: number): number {
  return ((v - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * W;
}

const zoneLabels: Record<BlondelZone, string> = {
  ideal: "Utmarkt komfort",
  ok: "Inom komfortintervallet",
  acceptable: "Acceptabel",
  outside: "Utanfor komfortintervallet",
};

const zoneColors: Record<BlondelZone, string> = {
  ideal: "#22c55e",
  ok: "#eab308",
  acceptable: "#f97316",
  outside: "#ef4444",
};

const suggestions: Record<BlondelZone, string> = {
  ideal: "",
  ok: "",
  acceptable: "Tips: justera stegdjup eller steghojd for att na idealzonen (620-630 mm).",
  outside: "Anpassa mattan: oka stegdjupet eller minska steghojden for att na 620-630 mm.",
};

export function ComfortMeter({ value, zone, stepHeight, stepDepth }: Props) {
  const clampedX = Math.max(0, Math.min(W, toX(value)));
  const color = zoneColors[zone];
  const h = stepHeight.toFixed(1);
  const d = stepDepth.toFixed(0);
  const formula = `2 x ${h} + ${d} = ${value.toFixed(1)} mm`;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-500 font-mono px-1">
        <span>{SCALE_MIN}</span>
        <span className="font-semibold" style={{ color }}>
          {zoneLabels[zone]}
        </span>
        <span>{SCALE_MAX}</span>
      </div>
      <svg viewBox={`0 0 ${W} 56`} width="100%" style={{ maxHeight: 56 }}>
        {ZONES.map((z) => (
          <rect
            key={z.from}
            x={toX(z.from)}
            y={BAR_Y}
            width={toX(z.to) - toX(z.from)}
            height={BAR_H}
            fill={z.color}
            opacity={0.75}
          />
        ))}
        {[580, 600, 620, 630, 640, 660].map((v) => (
          <g key={v}>
            <line x1={toX(v)} y1={BAR_Y} x2={toX(v)} y2={BAR_Y + BAR_H + 4} stroke="#374151" strokeWidth={1} />
            <text x={toX(v)} y={BAR_Y + BAR_H + 13} textAnchor="middle" fontSize={8} fill="#6b7280" fontFamily="monospace">
              {v}
            </text>
          </g>
        ))}
        <line
          x1={clampedX}
          y1={BAR_Y - 8}
          x2={clampedX}
          y2={BAR_Y + BAR_H + 2}
          stroke={color}
          strokeWidth={2.5}
        />
        <polygon
          points={`${clampedX - 5},${BAR_Y - 8} ${clampedX + 5},${BAR_Y - 8} ${clampedX},${BAR_Y}`}
          fill={color}
        />
      </svg>
      <p className="text-xs font-mono text-center" style={{ color }}>
        {formula}
      </p>
      {suggestions[zone] && (
        <p className="text-xs text-amber-600">{suggestions[zone]}</p>
      )}
    </div>
  );
}
