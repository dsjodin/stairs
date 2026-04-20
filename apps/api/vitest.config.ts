import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@stairs/calc": path.resolve(__dirname, "../../packages/calc/src/index.ts"),
    },
  },
  test: {
    environment: "node",
  },
});
