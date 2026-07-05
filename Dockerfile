# ─── Build Stage ──────────────────────────────────────────
FROM node:24-alpine AS builder
RUN npm install -g pnpm

WORKDIR /app

# Copy lockfile and workspace configs
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/db/package.json ./packages/db/
COPY packages/ai/package.json ./packages/ai/
COPY packages/config/package.json ./packages/config/
COPY packages/ui/package.json ./packages/ui/
COPY packages/ingestion/package.json ./packages/ingestion/
COPY apps/worker/package.json ./apps/worker/

# Install dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Copy source files
COPY packages ./packages
COPY apps/worker ./apps/worker

# Build all packages & the worker app
RUN pnpm --filter @mediverse/db build
RUN pnpm --filter @mediverse/ai build
RUN pnpm --filter @mediverse/ingestion build
RUN pnpm --filter @mediverse/worker build

# ─── Production Runner Stage ──────────────────────────────
FROM node:24-alpine AS runner
RUN npm install -g pnpm

WORKDIR /app

COPY --from=builder /app ./

# Expose port (if needed for metrics, though worker is pull-based)
EXPOSE 8080

CMD ["pnpm", "--filter", "@mediverse/worker", "start"]
