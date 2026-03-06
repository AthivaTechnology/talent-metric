# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Talent Metric** is a full-stack Developer Appraisal System with a multi-stage workflow: Developer fills → Tech Lead reviews → Manager finalizes → Completed.

## Commands

### Backend (`cd backend`)
```bash
npm run dev       # Start dev server with nodemon + ts-node (port 5000)
npm run build     # Compile TypeScript to dist/
npm start         # Run compiled dist/server.js
npm run seed      # Run database migrations and seed initial data
npm run lint      # ESLint TypeScript files
npm test          # Run Jest tests
```

### Frontend (`cd frontend`)
```bash
npm run dev       # Start Vite dev server (port 3000)
npm run build     # tsc + vite build
npm run lint      # ESLint with zero warnings allowed
npm run preview   # Preview production build
```

### Database
```bash
docker-compose up -d   # Start MySQL via Docker (recommended for local dev)
```

## Architecture

### Backend (Node.js/Express/TypeScript)
- **Entry point**: `backend/src/server.ts` — sets up Express with helmet, CORS, morgan, rate limiting, then mounts routes
- **Auth**: JWT-based. Token stored in `Authorization: Bearer <token>` header. The `authenticate` middleware attaches `req.user` to all protected routes.
- **Role hierarchy**: `admin > manager > tech_lead > developer`. Role-specific middleware shortcuts: `isAdmin`, `isManagerOrAdmin`, `isTechLeadOrAbove` in `backend/src/middleware/auth.ts`
- **Models** (Sequelize ORM, MySQL): `User`, `Appraisal`, `Question`, `Response`, `Rating`, `Comment` — associations defined in `backend/src/models/index.ts`
- **Appraisal status flow**: `DRAFT → SUBMITTED → TECH_LEAD_REVIEW → MANAGER_REVIEW → COMPLETED`
- **DB schema auto-syncs**: Sequelize `sync()` is called on connect via `backend/src/config/database.ts`

### Frontend (React 18/TypeScript/Vite)
- **Entry point**: `frontend/src/main.tsx` → `App.tsx`
- **Auth state**: Managed by `AuthContext` (`frontend/src/context/AuthContext.tsx`). Token + user stored in `localStorage`. On mount, validates token by calling `/api/auth/me`.
- **Routing**: React Router v6. `ProtectedRoute` wraps all authenticated pages; accepts optional `allowedRoles` prop for RBAC.
- **Path aliases** (configured in `tsconfig.json` and Vite):
  - `@components/*` → `src/components/*`
  - `@pages/*` → `src/pages/*`
  - `@services/*` → `src/services/*`
  - `@hooks/*` → `src/hooks/*`
  - `@context/*` → `src/context/*`
  - `@utils/*` → `src/utils/*`
  - `@/*` → `src/*`
- **Data fetching**: React Query v3 for server state
- **Styling**: Tailwind CSS + Headless UI + Heroicons
- **Rich text**: Tiptap editor used in appraisal response forms
- **Charts**: Recharts for analytics pages

### Role System
- Roles: `admin`, `manager`, `tech_lead`, `developer`, `tester`
- Testers behave like developers in the workflow (fill → tech lead review → manager review → complete)
- Tech leads and managers can have their own appraisals; they can see those alongside their team's
- Role-specific questions are stored in DB with `applicableRole` field; `GET /api/questions?role=<role>` returns only that role's questions
- Rating categories differ per role — defined in `ROLE_RATING_CONFIGS` in `frontend/src/types/index.ts` and `ROLE_RATING_CATEGORIES` in `backend/src/config/constants.ts`

### Key Route → Page Mapping
| Route | Page | Role Restriction |
|-------|------|-----------------|
| `/dashboard` | `DashboardPage` | Any authenticated |
| `/appraisals` | `AppraisalsPage` | Any authenticated |
| `/appraisals/:id` | `AppraisalDetailPage` | Any authenticated |
| `/users` | `UsersPage` | admin only |
| `/team` | `TeamPage` | manager, tech_lead |
| `/analytics` | `AnalyticsPage` | admin, manager, tech_lead |
| `/user-manual` | `UserManualPage` | Any authenticated |

### API Base URL
- Dev: `http://localhost:5000/api` (set via `REACT_APP_API_URL` in frontend `.env`)
- CORS origin controlled by `CORS_ORIGIN` env var on backend (defaults to `http://localhost:3000`)

## Environment Setup

**Backend** (`backend/.env`):
```
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=talent_metric
DB_USER=root
DB_PASSWORD=password
JWT_SECRET=<secret>
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

**Frontend** (`frontend/.env`):
```
REACT_APP_API_URL=http://localhost:5000/api
```

Copy from `.env.example` files in each directory. Run `npm run seed` after first backend setup to populate questions and demo users.
