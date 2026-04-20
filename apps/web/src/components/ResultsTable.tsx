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

export function ResultsTable({ result, unit }: Props) {
  const rows: [string, string][] = [
    ["Antal stigningar", String(result.numberOfSteps)],
    ["Antal plansteg", String(result.numberOfTreads)],
    ["Faktisk steghojd", fmt(result.actualStepHeight, unit)],
    ["Faktiskt stegdjup", fmt(result.actualStepDepth, unit)],
    ["Total horisontell langd", fmt(result.totalRun, unit)],
    ["Fotavtryck B x D", `${fmt(result.totalFootprint.width, unit)} x ${fmt(result.totalFootprint.depth, unit)}`],
    ["Lutning", `${result.slopeDegrees.toFixed(1)} deg`],
    ["Summaregel h+d", fmt(result.sumRule, unit)],
    ["Produktregel h*d", `${Math.round(result.productRule)} mm\u00b2`],
  ];

  return (
    <table className="w-full text-sm font-mono border-collapse">
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label} className="border-b border-gray-100 last:border-0">
            <td className="py-1 pr-4 text-gray-500">{label}</td>
            <td
              className="py-1 text-right font-semibold text-gray-800"
              data-testid={label === "Antal stigningar" ? "result-steps" : undefined}
            >
              {value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
