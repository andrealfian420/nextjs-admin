# syntax=docker/dockerfile:1
# Node 24 / npm 11, the same runtime as package.json engines and CI.

# Stage 1: Install dependencies (also the dev image: docker-compose.dev.yml targets it)
FROM node:24-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# Stage 2: Build the application
FROM node:24-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time only: next.config.ts derives images.remotePatterns from them. The server reads
# API_URL again at runtime (env_file), so the image stays the same across environments
# that share these values.
ARG API_URL
ARG MEDIA_URL
ENV NEXT_TELEMETRY_DISABLED=1

# The Turbopack build cache lives in a BuildKit cache mount, so rebuilds start warm and the
# cache never ends up in an image layer.
RUN --mount=type=cache,target=/app/.next/cache npm run build

# Stage 3: Production runner
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 --ingroup nodejs nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Copy standalone output. .next stays owned by the app user: the image optimizer writes its
# cache to .next/cache at runtime.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
