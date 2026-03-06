import { defineConfig } from "vitest/config";

const vitestConfig = defineConfig({
  test: {
    environment: "node",
    passWithNoTests: true,
    exclude: ["**/node_modules/**", "**/dist/**", "**/frontend/**"],
    hookTimeout: 30000,
  },
});

export default vitestConfig;
