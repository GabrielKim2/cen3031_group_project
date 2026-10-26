import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./tests/setup.js"],
    // bcrypt is slow on purpose, and the first run downloads a MongoDB binary.
    testTimeout: 20_000,
    hookTimeout: 120_000,
  },
});
