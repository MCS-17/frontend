<<<<<<< Updated upstream
# MONHPC Frontend

> React/TypeScript web interface for the MCS-17 HPC cluster — part of a Final Year Project building a full-stack, AI-integrated high-performance computing platform.

## Overview

This is the user-facing web application for MONHPC. It provides a unified interface for submitting and monitoring Slurm jobs, managing files on the BeeGFS shared filesystem, and interacting with the cluster's AI chat agent — all behind a JWT-authenticated session.

Built with **TanStack Start** (React 19, file-based routing, SSR-capable), **Tailwind CSS v4**, and **Bun** as the runtime and package manager.

---

## Features

### Dashboard
- Live Slurm job table with status filtering (Running, Pending, Completed, Failed, Cancelled)
- Per-job stdout/stderr viewer with inline output preview
- Job stats summary (total jobs, breakdown by status and type)
- Credit balance display per job

### Job Submission
- Multi-step wizard: choose mode → configure script in editor → confirm → submit
- Monaco-style script editor with syntax highlighting
- Confirmation step showing resource summary before submission

### AI Chat
- Conversational interface backed by a LangGraph AI agent
- Safety-checked responses via Llama Guard 4
- Supports attaching files (up to 10 per message) as HPC uploads or chat context
- Conversation history with sidebar navigation between past chats
- Context window usage indicator per conversation
- LaTeX math rendering (KaTeX) and Markdown with syntax highlighting

### Storage (BeeGFS File Manager)
- Browse, upload, download, and delete files/folders on the user's BeeGFS directory (`/mnt/beegfs/user/<user_id>`)
- Path breadcrumb navigation with alias to `/` for the user root
- Quick Look preview modal for text/code/image files
- Multi-select with bulk download (zip) and bulk delete
- Recursive folder upload preserving directory structure
- Right-click context menu with context-aware actions
- High-friction deletion modal to prevent accidental data loss

### Admin Panel
- User management (create, view, update roles and status)
- Credit balance management

### Auth
- JWT-based login with token stored in `localStorage`
- Auto-redirect on session expiry
- Global auth guard in root layout — unauthenticated users see only the login screen

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| Framework | [TanStack Start](https://tanstack.com/start) (React 19) |
| Routing | TanStack Router (file-based) |
| Styling | Tailwind CSS v4 |
| Animations | Motion (Framer Motion v12) |
| Markdown | react-markdown + remark-gfm + remark-math + KaTeX |
| Syntax highlighting | react-syntax-highlighter |
| Icons | Lucide React |
| Linting/Formatting | Biome |
| Runtime & Package Manager | Bun |
| Build tool | Vite 8 |
| Testing | Vitest + Testing Library |

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed (`>= 1.3`)
- A running MONHPC backend (FastAPI) — set the URL via environment variable

### Environment Variables

Create a `.env` file at the project root:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Defaults to `http://127.0.0.1:8000` if not set.

### Install & Run
=======
# MONHPC Frontend (`mcs17-frontend`)

Web UI for the MONHPC high-performance computing platform. Users authenticate, chat with an HPC-aware agent, submit jobs, browse cluster nodes, manage files on the HPC filesystem, and review job history.

This app is built with [TanStack Start](https://tanstack.com/start) and talks to a separate backend API (not included in this repo).

## Prerequisites

- [Bun](https://bun.sh/) (package manager and runtime)
- MONHPC backend API running locally or deployed (default: `http://127.0.0.1:8000`)

## Getting Started
>>>>>>> Stashed changes

```bash
bun install
```

Create a `.env` file in the project root (optional — a local default is provided in code):

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Start the dev server (port **3000**):

```bash
bun --bun run dev
```

<<<<<<< Updated upstream
The app runs on [http://localhost:3000](http://localhost:3000) by default.

### Build for Production
=======
Open [http://localhost:3000](http://localhost:3000). Unauthenticated users are redirected to `/login`.

## Environment Variables
>>>>>>> Stashed changes

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://127.0.0.1:8000` | Base URL for the MONHPC backend API |

Configured in `src/lib/api.ts`. All authenticated requests send a `Bearer` token from `localStorage`.

## Routes & Features

| Route | Description |
| --- | --- |
| `/login` | Login and registration (Monash email domains) |
| `/chat` | New chat with file attachments (up to 10 files per message) |
| `/chat/$convoId` | Existing conversation |
| `/` | Job dashboard — status filters, date range, output/error logs |
| `/submit` | Multi-step job submission wizard (scratch or upload script) |
| `/nodes` | Cluster node status and resource usage |
| `/storage` | HPC filesystem browser (upload, preview, download, delete) |
| `/admin` | User credit management (admin/staff only) |

Navigation lives in `src/components/Sidebar.tsx`. The root layout in `src/routes/__root.tsx` handles auth guarding, the glassmorphic shell, and sidebar visibility.

## Project Structure

```
src/
├── components/       # Shared UI (Sidebar)
├── lib/              # API clients and domain logic
│   ├── api.ts        # Fetch wrapper, auth headers, API base URL
│   ├── auth.ts       # Login, register, logout, session storage
│   ├── chat.ts       # Conversations and messaging
│   ├── files.ts      # Storage filesystem operations
│   ├── jobs.ts       # Job listing and logs
│   ├── nodes.ts      # Cluster node metrics
│   ├── submit.ts     # Job submission
│   └── admin.ts      # Admin user management
├── routes/           # File-based TanStack Router pages
│   ├── __root.tsx    # App shell, auth guard, QueryClient provider
│   ├── index.tsx     # Dashboard
│   ├── login.tsx
│   ├── chat.tsx      # Layout route for /chat/*
│   ├── chat/
│   ├── storage.tsx
│   ├── submit.tsx
│   ├── nodes.tsx
│   └── admin.tsx
├── router.tsx
├── routeTree.gen.ts  # Auto-generated — do not edit
└── styles.css        # Tailwind CSS entry
api/
└── server.js         # Vercel serverless entry for SSR
```

<<<<<<< Updated upstream
### Preview Production Build

```bash
bun --bun run preview
```

---

## Testing
=======
Path aliases: `#/*` and `@/*` both resolve to `./src/*` (see `package.json` imports and `tsconfig.json`).

## Tech Stack

- **Framework:** TanStack Start + TanStack Router (file-based routing)
- **UI:** React 19, Tailwind CSS v4, [Motion](https://motion.dev/), [Lucide](https://lucide.dev/) icons
- **Data:** TanStack Query for server state; REST calls via `src/lib/api.ts`
- **Markdown:** react-markdown with KaTeX, GFM, syntax highlighting (chat)
- **Tooling:** Vite 8, TypeScript, Biome (lint/format), Vitest

## Scripts
>>>>>>> Stashed changes

```bash
bun --bun run dev       # Dev server on port 3000
bun --bun run build     # Production build
bun --bun run preview   # Preview production build
bun --bun run test      # Run Vitest (no test files yet)
bun --bun run lint      # Biome lint
bun --bun run format    # Biome format
bun --bun run check     # Biome lint + format check
```

<<<<<<< Updated upstream
Uses [Vitest](https://vitest.dev/) with jsdom and Testing Library.

---

## Linting & Formatting

This project uses [Biome](https://biomejs.dev/) for linting and formatting:

```bash
bun --bun run lint      # Lint
bun --bun run format    # Format
bun --bun run check     # Lint + format check combined
```

---

## Project Structure

```
frontend-new/
├── api/
│   └── server.js                  # Lightweight local API dev server
├── public/
│   ├── favicon.svg
│   └── manifest.json
├── src/
│   ├── lib/                       # API client modules
│   │   ├── api.ts                 # Base fetch wrapper + ApiError
│   │   ├── auth.ts                # Login, logout, session management
│   │   ├── chat.ts                # AI conversation API
│   │   ├── files.ts               # BeeGFS file manager API
│   │   ├── jobs.ts                # Slurm job API
│   │   ├── submit.ts              # Job submission API
│   │   └── admin.ts               # Admin user management API
│   ├── components/
│   │   └── Sidebar.tsx            # Collapsible nav (Chat, Dashboard, Storage)
│   ├── routes/
│   │   ├── __root.tsx             # Root layout + global auth guard
│   │   ├── index.tsx              # Dashboard (job list + stats)
│   │   ├── login.tsx              # Login page
│   │   ├── chat.tsx               # Chat route wrapper
│   │   ├── chat/
│   │   │   ├── index.tsx          # New conversation / landing
│   │   │   └── $convoId.tsx       # Active conversation view
│   │   ├── submit.tsx             # Job submission wizard
│   │   ├── submit/
│   │   │   ├── -submit.types.ts
│   │   │   └── step/
│   │   │       ├── -ModeStep.tsx
│   │   │       ├── -EditorStep.tsx
│   │   │       ├── -ConfirmStep.tsx
│   │   │       └── -SuccessStep.tsx
│   │   ├── storage.tsx            # BeeGFS file manager
│   │   └── admin.tsx              # Admin panel
│   ├── router.tsx                 # Router setup
│   ├── routeTree.gen.ts           # Auto-generated route tree
│   └── styles.css                 # Global styles + Tailwind import
├── biome.json
├── vite.config.ts
├── tsconfig.json
├── vercel.json                    # Vercel deployment config
└── package.json
```

---

## API Integration

All API calls go through `src/lib/api.ts`, which attaches the JWT `Authorization` header automatically from `localStorage`. The base URL is configured via `VITE_API_BASE_URL`.

Key API modules:

| Module | Backend Prefix | Purpose |
| :--- | :--- | :--- |
| `auth.ts` | `/api/auth` | Login, logout, register |
| `jobs.ts` | `/api/slurm` | List/get/output Slurm jobs |
| `chat.ts` | `/api/ai` | AI conversations and dialogues |
| `files.ts` | `/api/files` | BeeGFS directory + file operations |
| `admin.ts` | `/api/users` | User administration |

---

## Deployment

A `vercel.json` is included for deployment on Vercel. Set `VITE_API_BASE_URL` in the Vercel project environment variables to point to your backend.

For other platforms, the standard Vite build output in `dist/` can be served by any static host or Node server.
=======
## Routing

Routes are defined as files under `src/routes/`. TanStack Router generates `src/routeTree.gen.ts` automatically during dev/build.

To add a route, create a new file in `src/routes/` and use `createFileRoute`. Navigate with the `Link` component from `@tanstack/react-router`:

```tsx
import { Link } from "@tanstack/react-router"

<Link to="/storage">Storage</Link>
```

The root route uses `shellComponent` for the HTML document and `component` for the app layout (`Outlet` for nested routes). See [TanStack Router layouts](https://tanstack.com/router/latest/docs/framework/react/guide/routing-concepts#layouts).

## Authentication

- Sessions are stored in `localStorage` (`accessToken`, `authUser`).
- `src/routes/__root.tsx` redirects unauthenticated users to `/login` and authenticated users away from `/login` to `/chat`.
- Auth state changes dispatch an `auth-change` window event so the sidebar and layout stay in sync.

## Deployment (Vercel)

`vercel.json` configures:

- Install: `bun install`
- Build: `bun --bun run build`
- Output: `dist/client`
- SSR via `api/server.js` (rewrites all paths to the TanStack Start server handler)

Set `VITE_API_BASE_URL` in the Vercel project environment to point at the production backend.

## Testing

[Vitest](https://vitest.dev/) is configured (`bun --bun run test`) but no test files exist yet.

## Linting & Formatting

[Biome](https://biomejs.dev/) handles linting and formatting. Config: `biome.json`.

## Learn More

- [TanStack Start](https://tanstack.com/start)
- [TanStack Router](https://tanstack.com/router)
- [TanStack Query](https://tanstack.com/query)
>>>>>>> Stashed changes
