import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Fastify from "fastify";
import cors from "@fastify/cors";
import healthRoute from "../routes/health.js";
import calculateRoute from "../routes/calculate.js";

const app = Fastify();

beforeAll(async () => {
  await app.register(cors, { origin: true });
  await app.register(healthRoute);
  await app.register(calculateRoute);
  await app.ready();
});

afterAll(() => app.close());

describe("GET /api/health", () => {
  it("returns 200 ok", async () => {
    const res = await app.inject({ method: "GET", url: "/api/health" });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ status: "ok" });
  });
});

describe("POST /api/calculate", () => {
  it("returns 200 with valid input", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/calculate",
      payload: {
        type: "straight",
        style: "closed",
        totalRise: 2700,
        desiredStepHeight: 175,
        desiredStepDepth: 260,
        stairWidth: 1000,
      },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.numberOfSteps).toBe(16);
    expect(body.actualStepHeight).toBeCloseTo(168.75);
  });

  it("returns 400 with invalid input", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/calculate",
      payload: { totalRise: -100 },
    });
    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect(body.errors).toBeDefined();
  });

  it("handles L-stair", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/calculate",
      payload: {
        type: "L",
        style: "closed",
        totalRise: 2700,
        desiredStepHeight: 175,
        desiredStepDepth: 260,
        stairWidth: 1000,
        landingDepth: 1000,
      },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.segments).toHaveLength(3);
  });
});
