import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { SideView } from "../viz/SideView.tsx";
import { calculate } from "@stairs/calc";

const FIXTURE = calculate({
  type: "straight",
  style: "closed",
  totalRise: 2700,
  desiredStepHeight: 175,
  desiredStepDepth: 260,
  stairWidth: 1000,
});

describe("SideView snapshot", () => {
  it("matches snapshot for straight closed stair", () => {
    const { container } = render(<SideView result={FIXTURE} style="closed" />);
    expect(container.innerHTML).toMatchSnapshot();
  });

  it("renders side-view-svg testid", () => {
    const { getByTestId } = render(<SideView result={FIXTURE} style="closed" />);
    expect(getByTestId("side-view-svg")).toBeTruthy();
  });

  it("matches snapshot for open style", () => {
    const openResult = calculate({
      type: "straight",
      style: "open",
      totalRise: 2700,
      desiredStepHeight: 175,
      desiredStepDepth: 260,
      stairWidth: 1000,
    });
    const { container } = render(<SideView result={openResult} style="open" />);
    expect(container.innerHTML).toMatchSnapshot();
  });
});
