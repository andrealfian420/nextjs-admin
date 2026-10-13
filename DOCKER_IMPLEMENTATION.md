# Docker Implementation

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  Host (127.0.0.1:3000)                              │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │  Docker Container: app                        │  │
│  │                                               │  │
│  │  Next.js (Node 24 Alpine)                     │  │
│  │  ├── SSR Pages (admin, auth, etc.)            │  │
│  │  ├── /api/* → Proxy to Backend (API_URL)      │  │
│  │  └── Static Assets (.next/static, public/)    │  │
│  │                                               │  │
│  │  Port: 3000 (internal)                        │  │
│  └───────────────────────────────────────────────┘  │
│                          │                          │
│                          ▼                          │
│              Backend API (API_URL)                   │
│          (separate container / external service)     │
└─────────────────────────────────────────────────────┘
```

## File Structure

```
├── Dockerfile              # Multi-stage build (deps → builder → runner)
├── docker-compose.yml      # Base/production compose
├── docker-compose.dev.yml  # Dev override (hot-reload + volume mount)
├── .dockerignore           # Exclude files from build context
├── Makefile                # Developer-friendly commands
├── bitbucket-pipelines.yml # CI quality gate (lint, typecheck, test, build)
└── .env.example            # Environment variables reference
```

## Quick Start

### Prerequisites

- Docker with BuildKit (the default builder; the Dockerfile uses cache mounts) and Docker Compose
- Backend API stack running (with its Docker network created)
- On Windows: the project on the WSL filesystem (e.g. `~/projects`), not under `/mnt/c`
- `.env` file configured (copy from `.env.example`)

### Development (Hot-Reload)

```bash
cp .env.example .env
# Edit .env, set API_URL

make dev
```

App will be running at `http://127.0.0.1:3000` with hot-reload enabled.

### Production-like

```bash
make prod
```

Builds an optimized standalone image and runs at `http://127.0.0.1:3000`.

## Makefile Commands

| Command      | Description                                     |
| ------------ | ----------------------------------------------- |
| `make dev`   | Start development mode (hot-reload via volume)  |
| `make prod`  | Start production-like mode (standalone build)   |
| `make build` | Build Docker image only                         |
| `make logs`  | Tail container logs                             |
| `make down`  | Stop & remove containers                        |
| `make clean` | Stop, remove containers + volumes (fresh start) |
| `make shell` | Shell into app container                        |

## Environment Variables

| Variable    | Required | When read            | Description                                                             |
| ----------- | -------- | -------------------- | ----------------------------------------------------------------------- |
| `API_URL`   | Yes      | Runtime + build time | Backend API URL proxied by the `/api` BFF; at build time it also allows `/storage/uploads/**` on that host for `next/image` |
| `MEDIA_URL` | No       | Build time           | Comma-separated extra image origins/path prefixes for `next/image` (see `.env.example`) |

Build-time values are passed as build args by `docker-compose.yml` (taken from `.env` or the shell). Rebuild (`make prod`) after changing them.

### Example `API_URL` values:

- Local without Docker: `http://localhost:3001/api/v1`
- Docker (cross-container): `http://<api-container-name>:<internal-port>/api/v1`
- Production: `https://your-backend.com/api`

## Cross-Container Networking

This project uses an **external Docker network** to communicate with the backend API running in a separate Docker Compose stack.

```
┌─ express-core-network (external) ────────────────┐
│                                                   │
│  express-core-api (port 3001)    ← Backend API   │
│  express-core-worker                              │
│  express-core-redis                               │
│  express-core-postgres                            │
│                                                   │
│  nextjs-admin (port 3000)        ← This app      │
│                                                   │
└───────────────────────────────────────────────────┘
```

**How it works:**

- The backend stack creates a Docker network (e.g., `express-core-network`)
- This project joins that network with `external: true` declaration
- Inside the shared network, containers resolve each other by **container name**
- `API_URL` uses the backend container name as hostname (e.g., `http://express-core-api:3001/api/v1`)
- Use the **internal port** (not the host-mapped port)

**Important:** The backend stack must be running first so the external network exists before starting this app.

## Docker Compose Files

### `docker-compose.yml` (Base/Production)

- Container name: `nextjs-admin`
- Network: `express-core-network` (external)
- Builds from Dockerfile (full multi-stage, standalone output) with `API_URL`/`MEDIA_URL` build args
- Port bind: `127.0.0.1:3000:3000`
- Healthcheck via wget
- Restart policy: `unless-stopped`
- Resource limits: 1 CPU / 512MB memory (reserved: 0.25 CPU / 256MB)

### `docker-compose.dev.yml` (Development Override)

Always used together with `docker-compose.yml` (`make dev`); it inherits the container name, network, port and `.env`.

- Builds only up to `deps` stage
- Command: `npm run dev` (Next.js dev server, Turbopack)
- Volume mounts: source code + named volumes `node_modules` and `next` (`/app/.next`). Compose prefixes them with the project name (e.g. `nextjs-admin_node_modules`), so separate clones never share them, and they survive restarts. After changing dependencies, run `make clean && make dev`.
- No file-watch polling: Turbopack gets file events from the bind mount as long as the project is on the Linux/WSL filesystem
- Resource limits: 2 CPUs / 2GB memory (reserved: 0.5 CPU / 512MB)

## Dockerfile Stages

All stages use `node:24-alpine` (Node 24 / npm 11, as in `package.json` `engines` and CI).

1. **deps** — `npm ci` from the lockfile, with npm's download cache in a BuildKit cache mount
2. **builder** — Copy source (tests and docs are excluded by `.dockerignore`), run `next build` with the `API_URL`/`MEDIA_URL` build args. The Turbopack build cache (`.next/cache`) lives in a BuildKit cache mount, so rebuilds start warm and the cache never ends up in a layer
3. **runner** — Minimal image, copy standalone output + static + public, run as non-root user `nextjs` (group `nodejs`). `.next` is owned by that user because the image optimizer writes `.next/cache` at runtime

## Resource Limits

| Mode        | CPU Limit | Memory Limit | CPU Reserved | Memory Reserved |
| ----------- | --------- | ------------ | ------------ | --------------- |
| Production  | 1.0       | 512M         | 0.25         | 256M            |
| Development | 2.0       | 2G           | 0.5          | 512M            |

Development has higher limits due to Next.js dev server running TypeScript compilation, hot-reload, and file watching concurrently.

## Security

- Container runs as non-root user (`nextjs:nodejs`, UID 1001)
- Port only binds to `127.0.0.1` (not accessible from external network)
- Use a reverse proxy (Nginx/Caddy) in front for production with SSL. It must pass the public host on (`proxy_set_header Host $host;` or `X-Forwarded-Host`): the login, refresh and logout routes compare it with the browser's `Origin` and answer 403 otherwise (see README → Deploying behind a reverse proxy)

## Troubleshooting

### Container cannot connect to backend

- Ensure the backend stack is running first (`docker network ls` should show the external network)
- Verify `API_URL` uses the backend container name, not `localhost`
- Check both containers are on the same network: `docker network inspect <network-name>`

### Hot-reload not working in dev mode

- Keep the project on the Linux/WSL filesystem: file events from `/mnt/c` (Windows drives) do not reach the container
- Verify volume mount is correct (`.:/app`)

### Dependencies missing or outdated in dev mode

- `node_modules` lives in a named volume that is filled only when empty: run `make clean && make dev` after changing `package.json`

### Slow filesystem warning in dev mode

- The `.next` and `node_modules` named volumes should prevent this
- If still slow, check Docker Desktop resource allocation

### Build fails due to memory

- Increase memory limit in Docker Desktop settings
- Or increase in compose: `deploy.resources.limits.memory: 4G`

### Port already in use

- Ensure port 3000 is not used by another process
- Or change port mapping in `docker-compose.yml`: `"127.0.0.1:3001:3000"`

### Container killed by OOM

- Increase `memory` limit in the relevant compose file
- Check for memory leaks in your application

---

## Implementing Docker in a Project Based on This Boilerplate

If your project was created from this boilerplate but does not yet have Docker, follow these steps:

### Step 1: Add `output: "standalone"` to `next.config.ts`

```ts
const nextConfig: NextConfig = {
  output: 'standalone',
  // ... rest of your config
};
```

### Step 2: Copy Docker files

Copy the following files from this boilerplate into your project root:

- `Dockerfile`
- `docker-compose.yml`
- `docker-compose.dev.yml`
- `.dockerignore`
- `Makefile`
- `bitbucket-pipelines.yml` (optional CI quality gate)

### Step 3: Customize for your project

Update these values in `docker-compose.yml` (the dev override inherits them):

| Setting          | What to change                     | Example               |
| ---------------- | ---------------------------------- | --------------------- |
| `container_name` | Your project name                  | `my-project-frontend` |
| `networks`       | Your backend's Docker network name | `my-backend-network`  |
| `ports`          | Change if port 3000 conflicts      | `127.0.0.1:3001:3000` |

Update the `networks` block at the bottom of `docker-compose.yml`:

```yaml
networks:
  my-backend-network:
    external: true
```

### Step 4: Configure `.env`

```env
API_URL=http://<your-api-container-name>:<internal-port>/api/v1
```

Find your API container name with `docker ps` and use the **internal port** (the port the app listens on inside the container, not the host-mapped one).

### Step 5: Ensure `.dockerignore` exists

Copy it from this boilerplate. Besides `node_modules`, `.next`, `.git` and `.env*`, it excludes docs and every test file (`vitest.config.mts`, `src/test`, `__mocks__`, `*.test.ts(x)`), so the image build never type-checks code it does not ship.

### Step 6: Run

```bash
# Ensure your backend stack is running first
make dev    # Development with hot-reload
make prod   # Production-like
```

### Checklist

- [ ] `next.config.ts` has `output: "standalone"`
- [ ] `container_name` updated in `docker-compose.yml`
- [ ] `networks` updated to match your backend's network name
- [ ] `.env` has correct `API_URL` with backend container name
- [ ] Backend stack is running before starting frontend
- [ ] `docker network ls` shows the external network exists

---

## CI (Bitbucket Pipelines)

`bitbucket-pipelines.yml` runs one quality-gate step on every push, on `node:24`:

```
npm ci → npm run lint → npm run typecheck → npm run test:run → npm run build
```

The first failing command fails the build. npm's download cache and the Turbopack build cache (`.next/cache`) are cached between runs. No deployment is configured: add a deploy step for your own infrastructure if you need one.
