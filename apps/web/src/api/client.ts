import type { StairInput, StairResult } from "@stairs/calc";

export async function calculateStairs(input: StairInput): Promise<StairResult> {
  const res = await fetch("/api/calculate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(JSON.stringify(err));
  }
  return res.json() as Promise<StairResult>;
}
