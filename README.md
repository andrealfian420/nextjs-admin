# NextJS Admin Boilerplate

A production-ready Next.js admin dashboard boilerplate, designed to work with [express-core](https://github.com/andrealfian420/express-core) as the backend API.

## Overview

This boilerplate provides an admin panel foundation: authentication with silent token refresh, role-based access control, user and role management, activity logs, a profile page and a tested component kit (data table, form actions, image picker, rich editor) — ready to be extended for any project. Start a new project by changing the identity in `src/config/index.ts` and the environment; no domain code needs editing.

## Requirements

- Node.js 24 and npm 11 (`package.json` → `engines`; Docker and CI use the same)
- [express-core](https://github.com/andrealfian420/express-core) 3.x running as the backend API. The express-core changes after 3.0.0 (unreleased at the time of writing) add the role to `GET /users/:slug`, so the user edit form preselects it, and remove the `//` from avatar URLs. Against 3.0.0 itself the edit form starts without a role selected.

## Getting Started

**1. Clone and install**

```bash
git clone https://github.com/andrealfian420/nextjs-admin.git
cd nextjs-admin
npm ci
```

**2. Configure environment variables**

```bash
cp .env.example .env
```

| Variable    | Required | Read at      | Purpose                                                                                                                                   |
| ----------- | -------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `API_URL`   | Yes      | Request time | Backend base URL including its path, e.g. `http://localhost:3001/api/v1`. Server-only: the browser only ever talks to `/api` on this app. |
| `MEDIA_URL` | No       | Build time   | Extra public image origins or path prefixes for `next/image`, comma-separated. Rebuild after changing it. See `.env.example`.             |

`API_URL` already allows images under `<API host>/storage/uploads/**`.

**3. Configure the backend**

In express-core's `.env`:

- `PASSWORD_RESET_URL=<this app's origin>/reset-password` — the reset email links to that page.
- `APP_URL` — the public backend URL used in `avatarUrl`; the browser must reach it (add it to `MEDIA_URL` if it is not the `API_URL` host).
- `ALLOWED_ORIGINS` does not need this app's origin: the BFF calls the backend server-to-server without an `Origin` header.

**4. Start the development server**

```bash
npm run dev
```

The app is available at `http://localhost:3000`.

## Scripts

| Command                 | Description                              |
| ----------------------- | ---------------------------------------- |
| `npm run dev`           | Start the development server             |
| `npm run build`         | Build for production (standalone output) |
| `npm run start`         | Start the production server              |
| `npm run lint`          | Run ESLint                               |
| `npm run typecheck`     | Type-check with `tsc --noEmit`           |
| `npm test`              | Run Vitest in watch mode                 |
| `npm run test:run`      | Run the test suite once                  |
| `npm run test:coverage` | Run the tests with a V8 coverage report  |

Before handing over a change, run `npm run lint`, `npm run typecheck`, `npm run test:run` and `npm run build`. CI runs the same gate (see below).

## Testing

- Vitest runs two projects: `*.test.ts(x)` in **jsdom** (components, hooks, stores) and `*.node.test.ts` in **node** (BFF route handlers, server helpers).
- Tests compile with React Compiler, like the app. Set `VITEST_NO_COMPILER=1` to check whether a failure comes from the compiler.
- Zustand stores reset after every test (`__mocks__/zustand.ts`); mocks are cleared and restored automatically. Set mock implementations inside the test or a `beforeEach`.
- Tests never reach a real backend: services, the router and the toast are mocked per file. Helpers live in `src/test/` (axios responses, admin form action bar).

## Docker (Optional)

Docker is an alternative to the Node.js setup above, for containerized development and production.

```bash
cp .env.example .env
# Set API_URL to the backend container, e.g. http://express-core-api:3001/api/v1

make dev    # Development with hot-reload
make prod   # Production-like (standalone build)
```

The app is available at `http://127.0.0.1:3000`. The backend's Docker network must exist first.

| Command      | Description                                     |
| ------------ | ----------------------------------------------- |
| `make dev`   | Start development mode (hot-reload via volume)  |
| `make prod`  | Start production-like mode (standalone build)   |
| `make build` | Build Docker image only                         |
| `make logs`  | Tail container logs                             |
| `make down`  | Stop & remove containers                        |
| `make clean` | Stop, remove containers + volumes (fresh start) |
| `make shell` | Shell into app container                        |

See [DOCKER_IMPLEMENTATION.md](DOCKER_IMPLEMENTATION.md) for the architecture, build arguments, troubleshooting and how to reuse the setup.

## CI

`bitbucket-pipelines.yml` runs `npm ci`, lint, typecheck, `test:run` and build on every push, on Node 24. It deploys nothing.

## Deploying behind a reverse proxy

The login, refresh and logout routes reject state-changing requests whose `Origin` (or `Referer`) host differs from the host the request was sent to. That host is read from `X-Forwarded-Host`, else `Host`, so the proxy must pass the public host on:

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Without it, sign-in answers `403 Request origin not allowed`.

## Features

- **Authentication** — login, logout, forgot password and reset password (`/reset-password?token=…`), with silent token refresh
- **Session management** — access token in memory only (Zustand), refresh token in an HttpOnly cookie; one refresh in flight per tab; a failed session clears the cookie and returns to the login page, with a retry screen when the backend is unreachable
- **RBAC** — `PermissionGuard` per page, `Can` per element and an `access` key per menu item. The backend enforces authorization; the client only hides what the user cannot use.
- **User management** — create, edit and delete users with avatar upload
- **Role management** — create, edit and delete roles with the permission matrix and the user types from the backend
- **Activity logs** — list and detail with an old/new value comparison
- **Profile** — update name, avatar and password; a password change ends every session and returns to the login page with a notice
- **Admin forms** — shared sticky action bar (Back, Discard changes, Save), backend validation errors shown next to their fields, image picker with preview, replace and cancel
- **Data table** — server-side pagination, search and sorting, with a retry state and a sticky actions column on small screens
- **Rich text editor** — Tiptap-based editor
- **Dark mode** — system-aware theme with a manual toggle

The dashboard figures are sample data marked as such: express-core has no dashboard endpoint.

## Tech Stack

| Category         | Library                                                                      |
| ---------------- | ---------------------------------------------------------------------------- |
| Framework        | [Next.js 16](https://nextjs.org) (App Router)                                |
| Language         | TypeScript (strict) with React Compiler                                      |
| Styling          | [Tailwind CSS v4](https://tailwindcss.com)                                   |
| UI Components    | [Radix UI](https://radix-ui.com), [shadcn/ui](https://ui.shadcn.com)         |
| Forms            | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev)      |
| HTTP Client      | [Axios](https://axios-http.com) with interceptors for auto token refresh     |
| State Management | [Zustand](https://zustand-demo.pmnd.rs)                                      |
| Table            | [TanStack Table v8](https://tanstack.com/table)                              |
| Rich Editor      | [Tiptap](https://tiptap.dev)                                                 |
| Notifications    | [Sonner](https://sonner.emilkowal.ski)                                       |
| Icons            | [Lucide React](https://lucide.dev)                                           |
| Testing          | [Vitest](https://vitest.dev), [Testing Library](https://testing-library.com) |

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # login, forgot-password, reset-password
│   ├── admin/           # Protected admin pages (one folder per module)
│   └── api/             # BFF route handlers
│       ├── [...path]/   # Bearer-only proxy to the backend (allowlisted paths)
│       └── auth/        # login, refresh, logout: refresh-cookie handling + origin guard
├── components/
│   ├── admin/           # Module screens (list View, DetailView)
│   ├── forms/           # Auth forms; forms/admin/ holds the module forms
│   ├── layout/          # Admin shell (Sidebar, Navbar, ProfileMenu, guards), auth shell
│   ├── providers/       # AuthProvider, PendingToastHandler
│   └── ui/              # Reusable components (DataTable, AdminFormActions, ImagePickerField, …)
├── config/              # App identity (index.ts) and the admin menu (navigation.ts)
├── hooks/               # useLogout, useObjectUrl
├── lib/                 # axios instance, session refresh, permissions, BFF and API-error helpers
├── services/            # Typed API modules (authService, userService, …)
├── store/               # Zustand stores (session, pending toast)
├── test/                # Test setup and helpers
└── types/               # Shared types per domain, re-exported from '@/types'
```

## Architecture

### Request flow (BFF)

```
Browser → /api/users             → [Next.js] → API_URL/users              (Bearer token)
Browser → /api/auth/login        → [Next.js] → API_URL/auth/login         (sets the refresh cookie)
```

- **Catch-all** (`src/app/api/[...path]/route.ts`) — forwards only the prefixes in `ALLOWED_PREFIXES` (`/users`, `/roles`, `/activity-logs`, `/profile`, `/utils`) plus `POST /auth/request-password-reset` and `POST /auth/reset-password`. It is Bearer-only: it never forwards cookies in either direction, rejects `.`/`..` path segments and answers 404 for anything else.
- **Auth routes** (`src/app/api/auth/{login,refresh,logout}`) — the only places that touch the `refreshToken` cookie. They pass the origin guard (`src/lib/origin-guard.ts`), strip the cookie's `Domain` so it binds to this app, and forward a rotated cookie only on a successful refresh. `POST /logout` revokes the session on the backend and always clears the cookie; `DELETE /logout` only clears it (used after a password change, when the backend already ended every session).
- `API_URL` is read per request and is never sent to the browser.

### Session lifecycle

1. On load, `AuthProvider` restores the session: one refresh, then the profile. Admin pages wait for the profile (`AdminAccessGuard`); the proxy (`src/proxy.ts`) only checks that the refresh cookie exists.
2. API calls carry the in-memory access token. A 401 triggers one shared refresh (`src/lib/refresh-token.ts`) and one retry; concurrent callers in the same tab wait for the same refresh.
3. A refresh the backend rejects ends the session: store cleared, cookie cleared, login page. A network or server error keeps the session: while loading an admin page it shows a retry screen; later on, only the request that needed the refresh fails.
4. Logout waits for a refresh in flight, so the cookie it revokes is the current one.

### Permissions

Permissions are strings such as `module.master-data.user.index`, read from `role.access` of `GET /profile`. Use `PermissionGuard` around a page, `Can` around a control and `access` on a menu item. Any match of an array grants access.

## Adding a module

Follow the users or roles module:

1. **Types** — `src/types/<module>.ts` for the row, detail and input shapes; re-export it from `src/types/index.ts`.
2. **Service** — `src/services/<module>Service.ts` on the shared `api` instance; encode slugs with `encodeURIComponent` and build list queries with `toListParams`.
3. **BFF** — add the backend prefix to `ALLOWED_PREFIXES` in `src/app/api/[...path]/route.ts`; without it the proxy answers 404.
4. **List** — `src/components/admin/<module>/View.tsx` with `DataTable` (`fetchData` = the service's list method), `SortHeader` on backend-sortable columns only, `Can` around row actions and `DeleteDialog` whose `onConfirm` rethrows after reporting a failure, so the dialog stays open.
5. **Form** — `src/components/forms/admin/<Module>Form.tsx`: react-hook-form + zod, `AdminFormActions` as the last child, `applyApiFieldErrors` + `getApiErrorMessage` on submit errors, `ImagePickerField` + `useObjectUrl` for images. Load the record and its catalogues together; call `notFound()` on a 404 (`isNotFoundError`) and render `LoadFailed` with a retry for any other failure. Start the component with `'use no memo'` if it calls `reset(..., { keepFieldsRef: true })` (see Known limitations).
6. **Pages** — `src/app/admin/<module>/{page,create/page,[slug]/page}.tsx`, each wrapped in `PermissionGuard` with `PageHeader` breadcrumbs.
7. **Menu** — an entry in `src/config/navigation.ts` with its `access` permission.
8. **Tests** — next to each file; mock the service, `next/navigation` and the toast.

## Backend Integration

| Endpoint                            | Used for                                                       |
| ----------------------------------- | -------------------------------------------------------------- |
| `POST /auth/login`                  | Sign in; sets the refresh cookie                               |
| `POST /auth/refresh`                | New access token; rotates the refresh cookie                   |
| `POST /auth/logout`                 | Revoke the refresh token                                       |
| `POST /auth/request-password-reset` | Email a reset link (same answer for unknown emails)            |
| `POST /auth/reset-password`         | `{ token, newPassword }`; ends every session                   |
| `GET/PUT /profile`                  | Session user; update name, password, avatar                    |
| `GET/POST /users`                   | List (without the signed-in user) and create users (multipart) |
| `GET/PUT/DELETE /users/:slug`       | Read, update (multipart), delete a user                        |
| `GET/POST /roles`                   | List and create roles                                          |
| `GET/PUT/DELETE /roles/:slug`       | Read, update, delete a role                                    |
| `GET /roles/access-list`            | Permission matrix                                              |
| `GET /roles/user-types`             | User types a role may have                                     |
| `GET /activity-logs`                | List activity logs                                             |
| `GET /activity-logs/:id`            | Activity log detail                                            |
| `GET /utils/role-options`           | Role options (`{ value: id, label }`)                          |

Responses use `{ success, message, data }`; lists put rows in `data.data` with `data.meta`. Validation errors (400) carry `errors: [{ field, message }]`, which the forms show next to the matching field; other client errors, such as a taken email or a used reset token, carry only `message`, shown in a toast or alert. Single-user payloads have no internal `id`; users and roles are addressed by `slug`.

## Security

- The backend URL stays on the server (BFF); the proxy allowlist prevents open-proxy use
- Access tokens live in memory only (never `localStorage`); refresh tokens are HttpOnly cookies the browser cannot read
- The catch-all forwards no cookies; only the three auth routes handle the refresh cookie, behind an origin guard
- Security headers in `next.config.ts` (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy); `strict-origin-when-cross-origin` keeps the reset token out of third-party referrers
- `next/image` only loads from `API_URL`'s storage path and the `MEDIA_URL` entries
- Uploads are checked for type and size before submission; the backend validates again
- Authorization is enforced by the backend; client-side guards are for UX only

## Known limitations

- **Refresh is single-flight per tab.** Two tabs may refresh with the same cookie at the same time. express-core's grace window (`REFRESH_GRACE_SECONDS`) accepts the second request; one that arrives after the window ends the session on that device.
- **React Compiler and react-hook-form.** Every `reset()` empties react-hook-form's list of mounted fields, which `register()` refills on render. The compiler memoizes those calls, so a later `reset(..., { keepFieldsRef: true })` no longer writes into the inputs. The admin forms opt out with `'use no memo'`.
- **`MEDIA_URL` is build-time.** Image hosts are compiled into the build; changing them needs a rebuild.
- **`next/image` refuses private IPs.** Next 16 does not optimize images whose host resolves to a loopback or private address (`images.dangerouslyAllowLocalIP`, off by default against SSRF), so a production build talking to a backend on `localhost` or a private network answers 400 for its media. The core screens show avatars with plain `<img>` and are not affected; use `unoptimized` or a public media host for `next/image`.
- **Dependency advisories.** `npm audit --omit=dev` reports advisories in `next`, `axios`, Tiptap/ProseMirror and transitive packages. Updating them is a separate maintenance decision; check `npm audit` before a release.

## License

Copyright &copy; 2026 - Present Alfian Andre Ramadhan.
