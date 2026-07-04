import { customType } from "drizzle-orm/pg-core";

/**
 * pgvector `vector(N)` column type for Drizzle ORM.
 * Stores float arrays as pgvector embeddings.
 *
 * Usage: `customVector("column_name", { dimensions: 768 })`
 */
export const customVector = customType<{
  data: number[];
  driverParam: string;
  config: { dimensions: number };
}>({
  dataType(config) {
    return `vector(${config?.dimensions ?? 768})`;
  },
  toDriver(value: number[]): string {
    return `[${value.join(",")}]`;
  },
  fromDriver(value: unknown): number[] {
    if (typeof value === "string") {
      return value
        .slice(1, -1)
        .split(",")
        .map(Number);
    }
    return value as number[];
  },
});
