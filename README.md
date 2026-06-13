# MONHPC Frontend (`mcs17-frontend`)

> React/TypeScript web interface for the MCS-17 HPC cluster — part of a Final Year Project building a full-stack, AI-integrated high-performance computing platform.

## Overview

This is the user-facing web application for MONHPC. It provides a unified interface for submitting and monitoring Slurm jobs, managing files on the BeeGFS shared filesystem, browsing cluster nodes, and interacting with the cluster's AI chat agent — all behind a JWT-authenticated session.

Built with **TanStack Start** (React 19, file-based routing, SSR-capable), **Tailwind CSS v4**, and **Bun** as the runtime and package manager. The app talks to a separate backend API (not included in this repo).

---

## Features

### Dashboard (`/`)
- Slurm job table with status filtering (Running, Pending, Completed, Failed, Cancelled)
- Date-range filters and search
- Per-job stdout/stderr viewer with inline log preview and download
- Admin-only user filter on the job list

### Job Submission (`/submit`)
- Multi-step wizard: choose mode → configure script → confirm → submit
- Script editor with form fields and a raw script textarea
- Confirmation step showing resource summary before submission

### AI Chat (`/chat`, `/chat/$convoId`)
- Conversational interface backed by the backend AI agent
- Attach up to 10 files per message
- Conversation history with sidebar navigation between past chats
- LaTeX math rendering (KaTeX) and Markdown with syntax highlighting

### Storage (`/storage`)
- Browse, upload, download, and delete files/folders on the user's BeeGFS directory (`/mnt/beegfs/user/<user_id>`)
- Path breadcrumb navigation aliased to `/` for the user root
- Quick Look preview modal for text/code/image files
- Multi-select with bulk delete and sequential file download
- Create-folder and high-friction deletion modal to prevent accidental data loss

### Nodes (`/nodes`)
- Cluster node status and resource usage overview
- Per-node detail view (CPU, memory, GPU, temperature, uptime)

### Admin Panel (`/admin`)
- User listing with role and status display (admin/staff only)
- Credit balance management

### Auth (`/login`)
- JWT-based login and registration (Monash email domains)
- Token stored in `localStorage`
- Global auth guard in root layout — unauthenticated users are redirected to `/login`

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| Framework | [TanStack Start](https://tanstack.com/start) (React 19) |
| Routing | TanStack Router (file-based) |
| Data fetching | TanStack Query + REST via `src/lib/api.ts` |
| Styling | Tailwind CSS v4 |
| Animations | Motion (Framer Motion v12) |
| Markdown | react-markdown + remark-gfm + remark-math + KaTeX |
| Syntax highlighting | react-syntax-highlighter |
| Icons | Lucide React |
| Linting/Formatting | Biome |
| Runtime & Package Manager | Bun |
| Build tool | Vite 8 |
| Testing | Vitest + Testing Library (configured, no test files yet) |

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed (`>= 1.3`)
- A running MONHPC backend (FastAPI) — set the URL via environment variable

### Environment Variables

Create a `.env` file at the project root (optional — a local default is provided in code):

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://127.0.0.1:8000` | Base URL for the MONHPC backend API |

Configured in `src/lib/api.ts`. All authenticated requests send a `Bearer` token from `localStorage`.

### Install & Run

```bash
bun install
bun --bun run dev
```

The app runs on [http://localhost:3000](http://localhost:3000). Unauthenticated users are redirected to `/login`.

### Build for Production

```bash
bun --bun run build
bun --bun run preview
```

---

## Scripts

```bash
bun --bun run dev       # Dev server on port 3000
bun --bun run build     # Production build
bun --bun run preview   # Preview production build
bun --bun run test      # Run Vitest (no test files yet)
bun --bun run lint      # Biome lint
bun --bun run format    # Biome format
bun --bun run check     # Biome lint + format check
```

---

## Routes

| Route | Description |
| --- | --- |
| `/login` | Login and registration |
| `/chat` | New chat with file attachments |
| `/chat/$convoId` | Existing conversation |
| `/` | Job dashboard |
| `/submit` | Job submission wizard |
| `/nodes` | Cluster node status |
| `/storage` | BeeGFS file manager |
| `/admin` | User credit management (admin/staff only) |

Navigation lives in `src/components/Sidebar.tsx`. The root layout in `src/routes/__root.tsx` handles auth guarding, the glassmorphic shell, and sidebar visibility.

---

## Project Structure

```
├── api/
│   └── server.js                  # Vercel serverless entry for SSR
├── public/
│   ├── favicon.svg
│   └── manifest.json
├── src/
│   ├── components/
│   │   └── Sidebar.tsx            # Collapsible nav + conversation list
│   ├── lib/                       # API client modules
│   │   ├── api.ts                 # Base fetch wrapper + ApiError
│   │   ├── auth.ts                # Login, logout, session management
│   │   ├── chat.ts                # AI conversation API
│   │   ├── files.ts               # BeeGFS file manager API
│   │   ├── jobs.ts                # Slurm job API
│   │   ├── nodes.ts               # Cluster node API
│   │   ├── submit.ts              # Job submission API
│   │   └── admin.ts               # Admin user management API
│   ├── routes/
│   │   ├── __root.tsx             # Root layout + global auth guard
│   │   ├── index.tsx              # Dashboard
│   │   ├── login.tsx
│   │   ├── chat.tsx               # Layout route for /chat/*
│   │   ├── chat/
│   │   │   ├── index.tsx          # New conversation
│   │   │   └── $convoId.tsx       # Active conversation
│   │   ├── submit.tsx
│   │   ├── submit/
│   │   │   ├── -submit.types.ts
│   │   │   └── step/
│   │   ├── storage.tsx
│   │   ├── nodes.tsx
│   │   └── admin.tsx
│   ├── router.tsx
│   ├── routeTree.gen.ts           # Auto-generated — do not edit
│   └── styles.css
├── biome.json
├── vite.config.ts
├── tsconfig.json
├── vercel.json
└── package.json
```

Path aliases: `#/*` and `@/*` both resolve to `./src/*` (see `package.json` imports and `tsconfig.json`).

---

## API Integration

All API calls go through `src/lib/api.ts`, which attaches the JWT `Authorization` header automatically from `localStorage`.

| Module | Backend Prefix | Purpose |
| :--- | :--- | :--- |
| `auth.ts` | `/api/auth`, `/api/users` | Login, logout, register |
| `jobs.ts` | `/api/slurm` | List/get/output Slurm jobs |
| `submit.ts` | `/api/jobs` | Job submission |
| `chat.ts` | `/api/ai` | AI conversations and dialogues |
| `files.ts` | `/api/files` | BeeGFS directory + file operations |
| `nodes.ts` | `/api/nodes` | Cluster node metrics |
| `admin.ts` | `/api/admin/users` | User administration |

---

## Routing

Routes are defined as files under `src/routes/`. TanStack Router generates `src/routeTree.gen.ts` automatically during dev/build.

To add a route, create a new file in `src/routes/` and use `createFileRoute`. Navigate with the `Link` component from `@tanstack/react-router`:

```tsx
import { Link } from "@tanstack/react-router"

<Link to="/storage">Storage</Link>
```

The root route uses `shellComponent` for the HTML document and `component` for the app layout (`Outlet` for nested routes). See [TanStack Router layouts](https://tanstack.com/router/latest/docs/framework/react/guide/routing-concepts#layouts).

---

## Authentication

- Sessions are stored in `localStorage` (`accessToken`, `authUser`).
- `src/routes/__root.tsx` redirects unauthenticated users to `/login` and authenticated users away from `/login` to `/chat`.
- Auth state changes dispatch an `auth-change` window event so the sidebar and layout stay in sync.

---

## Deployment (Vercel)

`vercel.json` configures:

- Install: `bun install`
- Build: `bun --bun run build`
- Output: `dist/client`
- SSR via `api/server.js` (rewrites all paths to the TanStack Start server handler)

Set `VITE_API_BASE_URL` in the Vercel project environment to point at the production backend.

---

## Testing

[Vitest](https://vitest.dev/) is configured (`bun --bun run test`) with jsdom and Testing Library, but no test files exist yet.

---

## Linting & Formatting

[Biome](https://biomejs.dev/) handles linting and formatting. Config: `biome.json`.

```bash
bun --bun run lint
bun --bun run format
bun --bun run check
```

---

## Learn More

- [TanStack Start](https://tanstack.com/start)
- [TanStack Router](https://tanstack.com/router)
- [TanStack Query](https://tanstack.com/query)
