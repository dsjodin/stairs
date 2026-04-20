import Fastify from "fastify";
import cors from "@fastify/cors";
import healthRoute from "./routes/health.js";
import calculateRoute from "./routes/calculate.js";

const fastify = Fastify({ logger: true });

await fastify.register(cors, { origin: true });
await fastify.register(healthRoute);
await fastify.register(calculateRoute);

const port = Number(process.env.API_PORT ?? 3000);
const host = process.env.API_HOST ?? "0.0.0.0";

try {
  await fastify.listen({ port, host });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
