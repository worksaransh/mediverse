import { defineConfig } from "drizzle-kit";
import fs from "node:fs";
import path from "node:path";

// drizzle-kit does not auto-load .env, and its cwd varies depending on how
// it's invoked (`pnpm db:migrate` from root vs `pnpm --filter @mediverse/db
// db:migrate`). Load the monorepo-root .env explicitly so DATABASE_URL is
// always available regardless of invocation path.
const envPath = path.resolve(__dirname, "../../.env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }
}

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
