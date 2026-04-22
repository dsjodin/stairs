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

  const winderMode = (input.type === "L") && !!input.winderSteps;

  const recommendedWinder = Math.round(
    (Math.PI / 2) * ((2 / 3) * input.stairWidth) / input.desiredStepDepth
  );
  const walkingLineDepth = input.winderSteps
    ? ((2 / 3) * input.stairWidth * Math.PI) / 2 / input.winderSteps
    : 0;

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
              onClick={() => {
                setField("type", t.value);
                if (t.value !== "L") setField("winderSteps", undefined);
              }}
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

      {/* L-stair: landing vs winder toggle */}
      {input.type === "L" && (
        <div className="space-y-2">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Vändning</p>
          <div className="flex gap-1">
            <button
              onClick={() => setField("winderSteps", undefined)}
              className={`flex-1 py-1.5 text-xs rounded border font-mono ${
                !winderMode
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
              }`}
            >
              Vilplan
            </button>
            <button
              onClick={() => setField("winderSteps", recommendedWinder)}
              className={`flex-1 py-1.5 text-xs rounded border font-mono ${
                winderMode
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
              }`}
            >
              Balanserade steg
            </button>
          </div>

          {!winderMode && (
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

          {winderMode && (
            <div className="space-y-2">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className="text-xs text-gray-600">Antal vindelsteg</label>
                  <span className="text-xs font-mono font-semibold text-gray-800">
                    {input.winderSteps} steg
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={2}
                    max={12}
                    step={1}
                    value={input.winderSteps ?? recommendedWinder}
                    onChange={(e) => setField("winderSteps", parseInt(e.target.value))}
                    className="flex-1 h-2 accent-blue-600"
                  />
                  <input
                    type="number"
                    min={2}
                    max={12}
                    value={input.winderSteps ?? recommendedWinder}
                    onChange={(e) => setField("winderSteps", parseInt(e.target.value))}
                    className="w-20 text-xs font-mono border border-gray-200 rounded px-1 py-0.5 text-right"
                  />
                </div>
              </div>
              <div className="flex gap-2 text-xs text-gray-500 font-mono">
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                  Rek: {recommendedWinder} steg
                </span>
                <span className="bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                  Ganglinje: {Math.round(walkingLineDepth)} mm
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* U-stair landing */}
      {input.type === "U" && (
        <>
          <NumericField
            label="Vilplanets djup"
            value={input.landingDepth ?? 1000}
            min={700}
            max={2000}
            step={50}
            unit={unit}
            onChange={(v) => setField("landingDepth", v)}
          />
          <NumericField
            label="Brunnens bredd (wellWidth)"
            value={input.wellWidth ?? 200}
            min={0}
            max={1000}
            step={50}
            unit={unit}
            onChange={(v) => setField("wellWidth", v)}
          />
        </>
      )}

      {/* Flight 1 length (L and U only) */}
      {(input.type === "L" || input.type === "U") && (
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-xs text-gray-600">Sektionslangd 1</label>
            <div className="flex items-center gap-1">
              {input.flight1Run !== undefined ? (
                <>
                  <span className="text-xs font-mono font-semibold text-gray-800">
                    {unit === "cm" ? (input.flight1Run / 10).toFixed(1) : Math.round(input.flight1Run)} {unit}
                  </span>
                  <button
                    onClick={() => setField("flight1Run", undefined)}
                    className="text-xs text-gray-400 hover:text-red-500 px-1"
                    title="Aterstall auto"
                  >
                    x
                  </button>
                </>
              ) : (
                <span className="text-xs text-gray-400 italic">Auto (50/50)</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={unit === "cm" ? 30 : 300}
              max={unit === "cm" ? 500 : 5000}
              step={unit === "cm" ? 1 : 10}
              value={
                input.flight1Run !== undefined
                  ? unit === "cm" ? input.flight1Run / 10 : input.flight1Run
                  : unit === "cm" ? 100 : 1000
              }
              onChange={(e) => {
                const n = parseFloat(e.target.value);
                setField("flight1Run", unit === "cm" ? n * 10 : n);
              }}
              className="flex-1 h-2 accent-blue-600"
            />
            <input
              type="number"
              min={unit === "cm" ? 30 : 300}
              max={unit === "cm" ? 500 : 5000}
              step={unit === "cm" ? 1 : 10}
              placeholder={unit === "cm" ? "Auto" : "Auto"}
              value={
                input.flight1Run !== undefined
                  ? unit === "cm" ? (input.flight1Run / 10).toFixed(1) : Math.round(input.flight1Run)
                  : ""
              }
              onChange={(e) => {
                const n = parseFloat(e.target.value);
                if (!isNaN(n)) setField("flight1Run", unit === "cm" ? n * 10 : n);
              }}
              className="w-20 text-xs font-mono border border-gray-200 rounded px-1 py-0.5 text-right"
            />
          </div>
        </div>
      )}

      {/* Max horizontal run (all types, optional) */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <label className="text-xs text-gray-600">Max horisontellt avstand</label>
          <div className="flex items-center gap-1">
            {input.maxHorizontalRun !== undefined ? (
              <>
                <span className="text-xs font-mono font-semibold text-gray-800">
                  {unit === "cm" ? (input.maxHorizontalRun / 10).toFixed(1) : Math.round(input.maxHorizontalRun)} {unit}
                </span>
                <button
                  onClick={() => setField("maxHorizontalRun", undefined)}
                  className="text-xs text-gray-400 hover:text-red-500 px-1"
                  title="Ta bort begransning"
                >
                  x
                </button>
              </>
            ) : (
              <span className="text-xs text-gray-400 italic">Ej begransat</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={unit === "cm" ? 50 : 500}
            max={unit === "cm" ? 1000 : 10000}
            step={unit === "cm" ? 5 : 50}
            value={
              input.maxHorizontalRun !== undefined
                ? unit === "cm" ? input.maxHorizontalRun / 10 : input.maxHorizontalRun
                : unit === "cm" ? 400 : 4000
            }
            onChange={(e) => {
              const n = parseFloat(e.target.value);
              setField("maxHorizontalRun", unit === "cm" ? n * 10 : n);
            }}
            className="flex-1 h-2 accent-gray-400"
          />
          <input
            type="number"
            min={unit === "cm" ? 50 : 500}
            max={unit === "cm" ? 1000 : 10000}
            step={unit === "cm" ? 5 : 50}
            placeholder="Auto"
            value={
              input.maxHorizontalRun !== undefined
                ? unit === "cm" ? (input.maxHorizontalRun / 10).toFixed(1) : Math.round(input.maxHorizontalRun)
                : ""
            }
            onChange={(e) => {
              const n = parseFloat(e.target.value);
              if (!isNaN(n)) setField("maxHorizontalRun", unit === "cm" ? n * 10 : n);
            }}
            className="w-20 text-xs font-mono border border-gray-200 rounded px-1 py-0.5 text-right"
          />
        </div>
      </div>

      {/* Stairwell toggle */}
      <div className="border-t border-gray-100 pt-3 space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={input.showStairwell ?? false}
            onChange={(e) => setField("showStairwell", e.target.checked)}
            className="rounded border-gray-300 accent-blue-600"
          />
          <span className="text-xs text-gray-600 font-mono">Visa trapphål</span>
        </label>

        {input.showStairwell && (
          <div className="space-y-2 pl-5">
            <NumericField
              label="Bjalklagstjocklek"
              value={input.floorThickness ?? 200}
              min={100}
              max={400}
              step={10}
              unit={unit}
              onChange={(v) => setField("floorThickness", v)}
            />
            <NumericField
              label="Min fri hojd (BBR)"
              value={input.minimumHeadroom ?? 2100}
              min={1800}
              max={2400}
              step={50}
              unit={unit}
              onChange={(v) => setField("minimumHeadroom", v)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
