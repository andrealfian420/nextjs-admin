<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project rules

- Validate every change with `npm run lint`, `npm run typecheck`, `npm run test:run` and `npm run build` (the Bitbucket pipeline runs the same gate).
- New admin modules follow README → "Adding a module": typed service, BFF allowlist, `DataTable` list, react-hook-form + zod form with `AdminFormActions`, `PermissionGuard` pages and a menu entry with its permission.
- Tests sit next to the file: `*.test.ts(x)` run in jsdom, `*.node.test.ts` in node. They never call a real backend.
- The backend enforces permissions; client guards only hide what a user cannot use. Never forward cookies through `src/app/api/[...path]`.
