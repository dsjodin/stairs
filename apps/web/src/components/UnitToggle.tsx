import React from "react";

interface Props {
  unit: "mm" | "cm";
  onChange: (unit: "mm" | "cm") => void;
}

export function UnitToggle({ unit, onChange }: Props) {
  return (
    <div className="flex gap-1 text-xs">
      {(["mm", "cm"] as const).map((u) => (
        <button
          key={u}
          onClick={() => onChange(u)}
          className={`px-2 py-1 rounded font-mono ${
            unit === u
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {u}
        </button>
      ))}
    </div>
  );
}
