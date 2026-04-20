import React from "react";
import type { Warning } from "@stairs/calc";

interface Props {
  warnings: Warning[];
}

export function WarningsList({ warnings }: Props) {
  if (warnings.length === 0) {
    return (
      <div data-testid="warnings-list" className="text-sm text-green-600 font-medium">
        Inga BBR-avvikelser
      </div>
    );
  }

  return (
    <div data-testid="warnings-list" className="space-y-1">
      {warnings.map((w) => (
        <div
          key={w.code}
          className={`text-xs px-3 py-2 rounded font-mono ${
            w.severity === "error"
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-amber-50 text-amber-700 border border-amber-200"
          }`}
        >
          <span className="font-bold">[{w.code}]</span> {w.message}
        </div>
      ))}
    </div>
  );
}
