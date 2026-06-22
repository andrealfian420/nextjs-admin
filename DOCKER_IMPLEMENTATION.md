# Docker Implementation

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  Host (127.0.0.1:3000)                              │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │  Docker Container: app                        │  │
│  │                                               │  │
│  │  Next.js (Node 22 Alpine)                     │  │
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
└── .env.example            # Environment variables reference
```

## Quick Start

### Prerequisites

- Docker & Docker Compose installed
- Backend API stack running (with its Docker network created)
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

| Variable  | Required | Description                        |
| --------- | -------- | ---------------------------------- |
| `API_URL` | Yes      | Backend API URL proxied by Next.js |

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
- Builds from Dockerfile (full multi-stage, standalone output)
- Port bind: `127.0.0.1:3000:3000`
- Healthcheck via wget
- Restart policy: `unless-stopped`
- Resource limits: 1 CPU / 512MB memory (reserved: 0.25 CPU / 256MB)

### `docker-compose.dev.yml` (Development Override)

- Container name: `nextjs-admin`
- Network: `express-core-network` (external)
- Builds only up to `deps` stage
- Command: `npm run dev` (Next.js dev server)
- Volume mounts: source code + anonymous volumes for `node_modules` and `.next` (performance optimization on Windows/Mac)
- `WATCHPACK_POLLING=true` for file watching in Docker
- Resource limits: 2 CPUs / 2GB memory (reserved: 0.5 CPU / 512MB)

## Dockerfile Stages

1. **deps** — Install all npm dependencies on Alpine
2. **builder** — Copy source, run `next build`, produce `.next/standalone`
3. **runner** — Minimal image, copy standalone output + static + public, run as non-root user `nextjs`

## Resource Limits

| Mode        | CPU Limit | Memory Limit | CPU Reserved | Memory Reserved |
| ----------- | --------- | ------------ | ------------ | --------------- |
| Production  | 1.0       | 512M         | 0.25         | 256M            |
| Development | 2.0       | 2G           | 0.5          | 512M            |

Development has higher limits due to Next.js dev server running TypeScript compilation, hot-reload, and file watching concurrently.

## Security

- Container runs as non-root user (`nextjs:nodejs`, UID 1001)
- Port only binds to `127.0.0.1` (not accessible from external network)
- Use a reverse proxy (Nginx/Caddy) in front for production with SSL

## Troubleshooting

### Container cannot connect to backend

- Ensure the backend stack is running first (`docker network ls` should show the external network)
- Verify `API_URL` uses the backend container name, not `localhost`
- Check both containers are on the same network: `docker network inspect <network-name>`

### Hot-reload not working in dev mode

- Ensure `WATCHPACK_POLLING=true` is set in environment
- Verify volume mount is correct (`.:/app`)

### Slow filesystem warning in dev mode

- The `.next` and `node_modules` anonymous volumes should prevent this
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

### Step 3: Customize for your project

Update these values in **both** `docker-compose.yml` and `docker-compose.dev.yml`:

| Setting          | What to change                     | Example               |
| ---------------- | ---------------------------------- | --------------------- |
| `container_name` | Your project name                  | `my-project-frontend` |
| `networks`       | Your backend's Docker network name | `my-backend-network`  |
| `ports`          | Change if port 3000 conflicts      | `127.0.0.1:3001:3000` |

Update the `networks` block at the bottom of both files:

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

```
node_modules
.next
.git
.gitignore
.env
.env.local
*.md
Makefile
docker-compose*.yml
```

### Step 6: Run

```bash
# Ensure your backend stack is running first
make dev    # Development with hot-reload
make prod   # Production-like
```

### Checklist

- [ ] `next.config.ts` has `output: "standalone"`
- [ ] `container_name` updated in both compose files
- [ ] `networks` updated to match your backend's network name
- [ ] `.env` has correct `API_URL` with backend container name
- [ ] Backend stack is running before starting frontend
- [ ] `docker network ls` shows the external network exists
