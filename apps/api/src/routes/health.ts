import type { FastifyPluginAsync } from "fastify";

const health: FastifyPluginAsync = async (fastify) => {
  fastify.get("/api/health", async () => ({ status: "ok" }));
};

export default health;
