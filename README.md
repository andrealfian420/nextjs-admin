# NextJS Boilerplate Project

A production-ready Next.js admin dashboard boilerplate, designed to work with [express-core](https://github.com/andrealfian420/express-core) as the backend API.

## Overview

This boilerplate provides a fully functional admin panel foundation including authentication, role-based access control, user and role management, activity logs, and a rich component library — ready to be extended for any project.

## Requirements

- Node.js 18+
- [express-core](https://github.com/andrealfian420/express-core) running as the backend API

## Getting Started

**1. Clone the repository**

```bash
git clone https://github.com/andrealfian420/nextjs-admin.git
cd nextjs-admin
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure environment variables**

```bash
cp .env.example .env
```

Edit `.env` and set your backend API URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**4. Start the development server**

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Build for production     |
| `npm run start` | Start production server  |
| `npm run lint`  | Run ESLint               |

## Features

- **Authentication** — Login, logout, forgot password, token refresh with silent re-authentication
- **Session management** — Access token in memory (Zustand), refresh token via HttpOnly cookie
- **RBAC** — Role-based access control with per-route `PermissionGuard` and per-element `Can` component. Authorization is enforced server-side by the API.
- **User management** — Create, edit, delete users with avatar upload
- **Role management** — Create, edit, delete roles with granular permission assignment
- **Activity logs** — View and inspect system activity with change comparison table
- **Profile** — Update name, avatar, and password with automatic re-login on password change
- **Dark mode** — System-aware theme with manual toggle
- **Data table** — Server-side pagination, search, and sorting via `DataTable` component
- **Rich text editor** — Tiptap-based editor for article/content use cases
- **Pending toast system** — Cross-layout toast that survives full-page redirects (e.g., after password change)

## Tech Stack

| Category         | Library                                                                  |
| ---------------- | ------------------------------------------------------------------------ |
| Framework        | [Next.js 16](https://nextjs.org) (App Router)                            |
| Language         | JavaScript (JSX) with React Compiler                                     |
| Styling          | [Tailwind CSS v4](https://tailwindcss.com)                               |
| UI Components    | [Radix UI](https://radix-ui.com), [shadcn/ui](https://ui.shadcn.com)     |
| Forms            | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev)  |
| HTTP Client      | [Axios](https://axios-http.com) with interceptors for auto token refresh |
| State Management | [Zustand](https://zustand-demo.pmnd.rs)                                  |
| Table            | [TanStack Table v8](https://tanstack.com/table)                          |
| Rich Editor      | [Tiptap](https://tiptap.dev)                                             |
| Notifications    | [Sonner](https://sonner.emilkowal.ski)                                   |
| Icons            | [Lucide React](https://lucide.dev)                                       |

## Project Structure

```
src/
├── app/ # Next.js App Router pages
│ ├── (auth)/ # Auth pages (login, forgot-password)
│ └── admin/ # Protected admin pages
├── components/
│ ├── admin/ # Page-specific view components
│ ├── forms/ # Form components with validation
│ ├── layout/ # Layout components (Sidebar, Navbar, Guards)
│ ├── providers/ # AuthProvider, PendingToastHandler
│ └── ui/ # Reusable UI primitives (Button, Input, DataTable, etc.)
├── config/ # App config and navigation menu definition
├── hooks/ # Custom hooks (useLogout)
├── lib/ # Utilities (axios instance, auth helpers, permissions)
├── services/ # API service modules (authService, userService, etc.)
└── store/ # Zustand stores (useAuthStore, usePendingToastStore, etc.)
```

## Backend Integration

This project is built to consume the [express-core](https://github.com/andrealfian420/express-core) REST API. The expected endpoints include:

| Endpoint                      | Description                                |
| ----------------------------- | ------------------------------------------ |
| `POST /auth/login`            | Login with email and password              |
| `POST /auth/logout`           | Logout and invalidate refresh token        |
| `POST /auth/refresh`          | Refresh access token using HttpOnly cookie |
| `GET /profile`                | Get authenticated user profile             |
| `PUT /profile`                | Update profile (name, password, avatar)    |
| `GET/POST /users`             | List and create users                      |
| `GET/PUT/DELETE /users/:slug` | Get, update, delete user                   |
| `GET/POST /roles`             | List and create roles                      |
| `GET/PUT/DELETE /roles/:slug` | Get, update, delete role                   |
| `GET /roles/access-list`      | Get available permissions                  |
| `GET /activity-logs`          | List activity logs                         |
| `GET /activity-logs/:id`      | Get activity log detail                    |
| `GET /utils/role-options`     | Get role options for select inputs         |

The API is expected to return refresh tokens as HttpOnly cookies and access tokens in the response body.

## Security

- Access tokens stored in memory only (never `localStorage`)
- Refresh tokens stored as HttpOnly cookies managed by the backend
- Security headers configured in `next.config.mjs` (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- All file uploads validated by type and size on the client before submission
- Authorization enforced server-side — client-side guards are for UX only

## License

Copyright &copy; 2026 - Present Alfian Andre Ramadhan. All rights reserved.
