import React, { useState } from "react";
import { useCalculator } from "./hooks/useCalculator.ts";
import { InputForm } from "./components/InputForm.tsx";
import { StairSvg } from "./viz/StairSvg.tsx";
import { ResultsTable } from "./components/ResultsTable.tsx";
import { WarningsList } from "./components/WarningsList.tsx";
import { ComfortMeter } from "./components/ComfortMeter.tsx";
import { UnitToggle } from "./components/UnitToggle.tsx";

export default function App() {
  const { input, result, loading, error, setField, applyPreset } = useCalculator();
  const [unit, setUnit] = useState<"mm" | "cm">("mm");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="font-semibold text-gray-900 font-mono text-sm">Trappkalkylator</h1>
        <UnitToggle unit={unit} onChange={setUnit} />
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <aside className="w-72 bg-white border-r border-gray-200 p-4 overflow-y-auto flex-shrink-0">
          <InputForm
            input={input}
            setField={setField}
            applyPreset={applyPreset}
            unit={unit}
          />
        </aside>

        {/* Right panel */}
        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading && (
            <div className="text-xs text-gray-400 font-mono animate-pulse">Beraknar...</div>
          )}
          {error && (
            <div className="text-xs text-red-600 font-mono bg-red-50 px-3 py-2 rounded">
              Fel: {error}
            </div>
          )}
          {result && (
            <>
              <StairSvg result={result} />
              <div className="bg-white border border-gray-200 rounded p-4 space-y-3">
                <h2 className="text-xs uppercase tracking-wide text-gray-400 font-semibold">
                  Blondels lag
                </h2>
                <ComfortMeter
                  value={result.blondelFormula}
                  zone={result.blondelZone}
                  stepHeight={result.actualStepHeight}
                  stepDepth={result.actualStepDepth}
                />
              </div>
              <div className="bg-white border border-gray-200 rounded p-4 space-y-3">
                <h2 className="text-xs uppercase tracking-wide text-gray-400 font-semibold">
                  Resultat
                </h2>
                <ResultsTable result={result} unit={unit} />
              </div>
              {result.warnings.length > 0 && (
                <div className="bg-white border border-gray-200 rounded p-4 space-y-2">
                  <h2 className="text-xs uppercase tracking-wide text-gray-400 font-semibold">
                    BBR-varningar
                  </h2>
                  <WarningsList warnings={result.warnings} />
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
