# Changelog

Notable changes to the NextJS Admin boilerplate, breaking changes first.

## Unreleased

Brings the core admin to parity with a production fork: hardened BFF and session handling, a
tested form kit, typed services and a CI gate. Projects built on 1.1.0 should read **Breaking**
before merging.

### Breaking

- **Runtime:** Node 24 and npm 11 for development, Docker and CI (`engines` in `package.json`).
- **BFF catch-all is Bearer-only.** `/api/[...path]` no longer forwards `Cookie` or
  `Set-Cookie`, and under `/auth` only `POST request-password-reset` and `POST reset-password`
  pass. Anything else answers 404. Endpoints that need the refresh cookie need their own route
  handler, like `src/app/api/auth/*`.
- **Origin guard** on `POST /api/auth/{login,refresh,logout}` and `DELETE /api/auth/logout`:
  a foreign or malformed `Origin`/`Referer` gets 403. A reverse proxy must pass the public host
  (`Host` or `X-Forwarded-Host`); see README → Deploying behind a reverse proxy.
- **A failed refresh keeps the cookie.** The refresh route forwards `Set-Cookie` only on
  success; the client clears the cookie itself (`DELETE /api/auth/logout`) when the session ends.
- **Types** are split per domain under `src/types/`. The `User` and `FetchParams` aliases are
  gone: use `UserProfile` (session user), `UserDetail`/`UserRow` (user management) and
  `PaginationParams`.
- **Services** are typed: `userService.createUser`/`updateUser` take `UserInput` and
  `authService.updateProfile` takes `ProfileInput` (no prebuilt `FormData`); list methods return
  `PaginatedResponse<T>`; `authService.register` is removed; `forgotPassword` calls
  `/auth/request-password-reset`.
- **DataTable:** `fetchData` receives `PaginationParams` and returns `PaginatedResponse<T>`;
  `DataTablePagination` takes `page`, `lastPage`, `limit`, `onPageChange`, `onLimitChange`.
- **Menu items** are typed as link, group or separator (`MenuLink | MenuGroup | MenuSeparator`).
- **Config:** `config.apiUrl` is removed (the BFF reads `API_URL`); `config.shortName` is new.
- **Images:** `next/image` hosts come from `API_URL` and the build-time `MEDIA_URL` instead of
  a fixed localhost entry. Rebuild after changing `MEDIA_URL`.

### Added

- `/reset-password` page for the emailed reset link (set express-core's `PASSWORD_RESET_URL`
  to `<app origin>/reset-password`).
- Vitest with jsdom and node projects, React Testing Library, `typecheck` and coverage scripts,
  and tests for the BFF, session, forms, screens and shared components.
- Bitbucket Pipelines quality gate: lint, typecheck, tests, build.
- Shared form kit: `AdminFormActions`, `ConfirmDialog`, `ImagePickerField`, `useObjectUrl`,
  `applyApiFieldErrors`, `getApiErrorMessage`, `isNotFoundError`, `LoadFailed`, `SortHeader`.
- `ProfileMenu` for the navbar and sidebar, `AuthSplitShell` for the auth pages,
  `AdminAccessGuard` that waits for the profile.
- Role user types from `GET /roles/user-types`; the user edit form preselects the role when
  the backend sends it.

### Changed

- One refresh in flight per tab, shared by the provider and the interceptor; one retry per
  request; logout waits for a pending refresh. A backend outage keeps the session and offers a
  retry instead of logging out.
- Admin forms: Discard changes restores the loaded values without a request, backend
  validation errors show next to their fields, and a missing record (404) opens the not-found
  page while other load failures offer a retry. Saving goes straight to the list (no 2-second
  delay); signing in goes straight to the dashboard.
- A password change logs out with `DELETE /api/auth/logout` only; the backend already ended
  every session.
- Failed deletes keep the confirmation open and show the backend's message.
- Docker: Node 24 Alpine, BuildKit caches, named volumes for development.
- `shadcn` moved to `devDependencies` (it is only needed at build time); the unused direct
  `@tiptap/extension-link` and `@tiptap/extension-underline` dependencies are removed
  (StarterKit ships both).

### Fixed

- `npm run lint` errors (`set-state-in-effect`) in the theme toggle and navbar.
- DataTable search reset the page on rerender; stale responses could overwrite newer ones.
- RichEditor reported changes on mount and when toggling `disabled`; a non-UTF-8 byte in the
  file.
- Activity log detail treated empty snapshots as changes and printed nested values as
  `[object Object]`.
- Role delete toast showed `undefined`; the role form label pointed to a missing input.

### Upgrade and rollback

- **Upgrade:** merge, run `npm ci` on Node 24, adapt code that used the removed type aliases,
  `FormData` service calls or the old DataTable/menu props, set `MEDIA_URL` if images are
  served from another host, and make sure the reverse proxy passes `Host`. Run
  `npm run lint && npm run typecheck && npm run test:run && npm run build`.
- **Rollback:** redeploy the previous build or image (1.1.0). The frontend stores no data and
  the refresh cookie keeps its name and path, so signed-in users stay signed in. The
  express-core changes this release relies on are additive and need no backend rollback.
