import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["packages/**/src/**/*.test.ts", "apps/**/src/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/.astro/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
    },
  },
});
