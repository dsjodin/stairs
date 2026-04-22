import React from "react";
import type { StairResult } from "@stairs/calc";
import { SideView } from "./SideView.tsx";
import { PlanView } from "./PlanView.tsx";
import { IsoView } from "./IsoView.tsx";

interface Props {
  result: StairResult;
}

export function StairSvg({ result }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <SideView result={result} style={result.style} />
        <PlanView result={result} />
      </div>
      <IsoView result={result} />
    </div>
  );
}
