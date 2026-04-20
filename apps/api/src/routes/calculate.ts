import { calculate } from "@stairs/calc";
import { ZodError } from "zod";
import type { FastifyPluginAsync } from "fastify";

const calculateRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post("/api/calculate", async (request, reply) => {
    try {
      const result = calculate(request.body);
      return result;
    } catch (err) {
      if (err instanceof ZodError) {
        return reply.status(400).send({ errors: err.errors });
      }
      throw err;
    }
  });
};

export default calculateRoute;
