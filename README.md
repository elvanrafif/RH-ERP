# RH-ERP

Internal ERP system for managing architecture, civil, and interior design projects — including clients, quotations, invoices, vendors, and project tracking.

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Backend:** PocketBase
- **State/Data:** TanStack Query
- **UI:** Radix UI (shadcn/ui) + Tailwind CSS 4
- **Forms:** React Hook Form + Zod

## Prerequisites

- Node.js 18+
- PocketBase instance (self-hosted or remote)

## Setup

### 1. Clone & install dependencies

```bash
cd frontend
npm install
```

### 2. Configure environment

```bash
cp frontend/.env.local.example frontend/.env.local
```

Edit `.env.local`:

```env
VITE_API_URL=http://127.0.0.1:8090
```

### 3. Run PocketBase locally (optional)

If running locally, download PocketBase and start it:

```bash
./pocketbase serve
```

PocketBase admin panel will be available at `http://127.0.0.1:8090/_/`.

### 4. Start the frontend

```bash
cd frontend
npm run dev
```

App runs at `http://localhost:5173`.

## Project Structure

```
frontend/src/
├── components/        # Shared UI components
├── contexts/          # AuthContext (RBAC)
├── hooks/             # Custom hooks (one hook = one responsibility)
├── lib/               # Helpers, constants, validations, business logic
├── pages/             # Page components (render only, no business logic)
└── types.ts           # Global TypeScript types
```

See `CLAUDE.md` for full architecture and coding conventions.

## Modules

See [docs/modules.md](docs/modules.md) for a list of all modules and their current status.

## Build

```bash
cd frontend
npm run build
```
