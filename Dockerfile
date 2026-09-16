# 1. Base stage: Install OS dependencies
FROM oven/bun:1 AS base
RUN apt-get update && apt-get install -y libpq-dev && rm -rf /var/lib/apt/lists/*
WORKDIR /usr/src/app
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# 2. Install dependencies
FROM base AS install
COPY package.json bun.lockb* ./ 
RUN bun install --frozen-lockfile

# 3. Build stage (Prerelease)
FROM base AS builder
COPY --from=install /usr/src/app/node_modules ./node_modules
COPY . .

# Build the standalone Next.js application.
RUN bun run build

# 4. Final Release stage
FROM base AS release

# Create system user for security (Debian syntax)
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 -g nodejs ritna

# Copy Next.js Standalone Assets
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder --chown=ritna:nodejs /usr/src/app/.next/standalone ./
COPY --from=builder --chown=ritna:nodejs /usr/src/app/.next/static ./.next/static

USER ritna
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD [ "bun", "server.js" ]