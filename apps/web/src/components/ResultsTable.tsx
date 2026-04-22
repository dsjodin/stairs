import React from "react";
import type { StairResult } from "@stairs/calc";

interface Props {
  result: StairResult;
  unit: "mm" | "cm";
}

function fmt(mm: number, unit: "mm" | "cm"): string {
  if (unit === "cm") return (mm / 10).toFixed(1) + " cm";
  return Math.round(mm) + " mm";
}

type Indicator = "green" | "amber" | "red" | null;

function indicator(val: number, green: [number, number], amber: [number, number]): Indicator {
  if (val >= green[0] && val <= green[1]) return "green";
  if (val >= amber[0] && val <= amber[1]) return "amber";
  return "red";
}

const dotClass: Record<"green" | "amber" | "red", string> = {
  green: "text-green-500",
  amber: "text-amber-500",
  red: "text-red-500",
};

export function ResultsTable({ result, unit }: Props) {
  const h = result.actualStepHeight;
  const d = result.actualStepDepth;

  const indicators: Record<string, Indicator> = {
    "Faktisk steghojd": indicator(h, [150, 175], [130, 200]),
    "Faktiskt stegdjup": indicator(d, [250, 320], [230, 350]),
    "Lutning": indicator(result.slopeDegrees, [28, 36], [20, 38]),
    "Summaregel h+d": indicator(result.sumRule, [430, 470], [410, 490]),
    "Produktregel h*d": indicator(result.productRule, [38000, 55000], [30000, 65000]),
  };

  const rows: [string, string][] = [
    ["Antal stigningar", String(result.numberOfSteps)],
    ["Antal plansteg", String(result.numberOfTreads)],
    ["Faktisk steghojd", fmt(h, unit)],
    ["Faktiskt stegdjup", fmt(d, unit)],
    ["Total horisontell langd", fmt(result.totalRun, unit)],
    ["Fotavtryck B x D", `${fmt(result.totalFootprint.width, unit)} x ${fmt(result.totalFootprint.depth, unit)}`],
    ["Lutning", `${result.slopeDegrees.toFixed(1)}°`],
    ["Summaregel h+d", fmt(result.sumRule, unit)],
    ["Produktregel h*d", `${Math.round(result.productRule)} mm²`],
  ];

  return (
    <table className="w-full text-sm font-mono border-collapse">
      <tbody>
        {rows.map(([label, value]) => {
          const ind = indicators[label] ?? null;
          return (
            <tr key={label} className="border-b border-gray-100 last:border-0">
              <td className="py-1 pr-4 text-gray-500">{label}</td>
              <td
                className="py-1 text-right font-semibold text-gray-800"
                data-testid={label === "Antal stigningar" ? "result-steps" : undefined}
              >
                {ind && <span className={`mr-1 ${dotClass[ind]}`}>&#9679;</span>}
                {value}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
