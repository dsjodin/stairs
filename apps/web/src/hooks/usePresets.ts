import type { StairInput } from "@stairs/calc";

interface Preset {
  label: string;
  input: StairInput;
}

export function usePresets(): Preset[] {
  return [
    {
      label: "Bostad rak",
      input: {
        type: "straight",
        style: "closed",
        totalRise: 2700,
        desiredStepHeight: 175,
        desiredStepDepth: 260,
        stairWidth: 900,
        nosing: 20,
      },
    },
    {
      label: "Villa L-trappa",
      input: {
        type: "L",
        style: "closed",
        totalRise: 2700,
        desiredStepHeight: 175,
        desiredStepDepth: 260,
        stairWidth: 1000,
        nosing: 20,
        landingDepth: 1000,
      },
    },
    {
      label: "Flerbostadshus U-trappa",
      input: {
        type: "U",
        style: "closed",
        totalRise: 2700,
        desiredStepHeight: 175,
        desiredStepDepth: 260,
        stairWidth: 1200,
        nosing: 20,
        landingDepth: 1200,
        wellWidth: 200,
      },
    },
  ];
}
