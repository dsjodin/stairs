import type { StairInput, StairResult } from "@stairs/calc";

export async function calculateStairs(input: StairInput): Promise<StairResult> {
  const res = await fetch("/api/calculate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const text = await res.text();
    let message: string;
    try {
      const err = JSON.parse(text) as { errors?: unknown };
      message = JSON.stringify(err.errors ?? err);
    } catch {
      message = `HTTP ${res.status} ${res.statusText}`;
    }
    throw new Error(message);
  }
  return res.json() as Promise<StairResult>;
}
