import React from "react";
import type { StairInput, StairType, StairStyle } from "@stairs/calc";
import { usePresets } from "../hooks/usePresets.ts";

interface Props {
  input: StairInput;
  setField: (field: keyof StairInput, value: unknown) => void;
  applyPreset: (input: StairInput) => void;
  unit: "mm" | "cm";
}

interface FieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: "mm" | "cm";
  onChange: (v: number) => void;
}

function NumericField({ label, value, min, max, step, unit, onChange }: FieldProps) {
  const display = unit === "cm" ? value / 10 : value;
  const displayMin = unit === "cm" ? min / 10 : min;
  const displayMax = unit === "cm" ? max / 10 : max;
  const displayStep = unit === "cm" ? step / 10 : step;

  function handleChange(raw: string) {
    const n = parseFloat(raw);
    if (!isNaN(n)) onChange(unit === "cm" ? n * 10 : n);
  }

  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <label className="text-xs text-gray-600">{label}</label>
        <span className="text-xs font-mono font-semibold text-gray-800">
          {display.toFixed(unit === "cm" ? 1 : 0)} {unit}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={displayMin}
          max={displayMax}
          step={displayStep}
          value={display}
          onChange={(e) => handleChange(e.target.value)}
          className="flex-1 h-2 accent-blue-600"
        />
        <input
          type="number"
          min={displayMin}
          max={displayMax}
          step={displayStep}
          value={display.toFixed(unit === "cm" ? 1 : 0)}
          onChange={(e) => handleChange(e.target.value)}
          className="w-20 text-xs font-mono border border-gray-200 rounded px-1 py-0.5 text-right"
        />
      </div>
    </div>
  );
}

const typeLabels: { value: StairType; label: string; icon: string }[] = [
  { value: "straight", label: "Rak", icon: "▶" },
  { value: "L", label: "L-form", icon: "⌐" },
  { value: "U", label: "U-form", icon: "⊓" },
];

const styleLabels: { value: StairStyle; label: string }[] = [
  { value: "closed", label: "Stangd" },
  { value: "open", label: "Oppen" },
];

export function InputForm({ input, setField, applyPreset, unit }: Props) {
  const presets = usePresets();

  return (
    <div className="space-y-4 text-sm">
      {/* Presets */}
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Forinst.</p>
        <div className="flex flex-wrap gap-1">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p.input)}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 rounded border border-gray-200 font-mono"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stair type */}
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Trappform</p>
        <div className="flex gap-1">
          {typeLabels.map((t) => (
            <button
              key={t.value}
              onClick={() => setField("type", t.value)}
              className={`flex-1 py-2 text-xs rounded border font-mono ${
                input.type === t.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <span className="block text-base leading-none mb-0.5">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Style */}
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Konstruktion</p>
        <div className="flex gap-1">
          {styleLabels.map((s) => (
            <button
              key={s.value}
              onClick={() => setField("style", s.value)}
              className={`flex-1 py-1.5 text-xs rounded border font-mono ${
                input.style === s.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Numeric fields */}
      <NumericField
        label="Vaningshojd (totalRise)"
        value={input.totalRise}
        min={1500}
        max={5000}
        step={10}
        unit={unit}
        onChange={(v) => setField("totalRise", v)}
      />
      <NumericField
        label="Onskat stegdjup"
        value={input.desiredStepDepth}
        min={180}
        max={400}
        step={5}
        unit={unit}
        onChange={(v) => setField("desiredStepDepth", v)}
      />
      <NumericField
        label="Onskat steghojd"
        value={input.desiredStepHeight}
        min={120}
        max={250}
        step={5}
        unit={unit}
        onChange={(v) => setField("desiredStepHeight", v)}
      />
      <NumericField
        label="Trappbredd"
        value={input.stairWidth}
        min={600}
        max={2000}
        step={50}
        unit={unit}
        onChange={(v) => setField("stairWidth", v)}
      />
      {input.style === "closed" && (
        <NumericField
          label="Stegnos (nosing)"
          value={input.nosing ?? 20}
          min={0}
          max={50}
          step={5}
          unit={unit}
          onChange={(v) => setField("nosing", v)}
        />
      )}
      {(input.type === "L" || input.type === "U") && (
        <NumericField
          label="Vilplanets djup"
          value={input.landingDepth ?? 1000}
          min={700}
          max={2000}
          step={50}
          unit={unit}
          onChange={(v) => setField("landingDepth", v)}
        />
      )}
      {input.type === "U" && (
        <NumericField
          label="Brunnens bredd (wellWidth)"
          value={input.wellWidth ?? 200}
          min={0}
          max={1000}
          step={50}
          unit={unit}
          onChange={(v) => setField("wellWidth", v)}
        />
      )}
    </div>
  );
}
