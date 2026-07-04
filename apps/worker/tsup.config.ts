import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  clean: true,
  sourcemap: true,
  dts: false,
  external: [
    "drizzle-orm",
    "@anthropic-ai/sdk",
    "@mediverse/db",
    "@mediverse/ai",
    "@mediverse/config",
    "@mediverse/ingestion",
    "ioredis",
    "bullmq"
  ]
});
