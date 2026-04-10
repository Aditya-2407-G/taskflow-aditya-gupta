# TaskFlow

A task management system where users can register, log in, create projects, add tasks, and assign them. Built as a full-stack application with a REST API, relational data model, and polished UI.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + TypeScript + Express |
| Database | PostgreSQL 16 + Knex.js (migrations + query builder) |
| Auth | bcrypt (cost 12) + JWT (24h expiry) |
| Validation | Zod |
| Logging | Pino (structured JSON) |
| Frontend | React 18 + TypeScript + Vite |
| UI | Tailwind CSS + custom components |
| State | TanStack Query (server state) + React Context (auth) |
| Forms | react-hook-form + Zod resolvers |
| DnD | @hello-pangea/dnd |
| Infrastructure | Docker + docker-compose + nginx |

**Language choice**: The assignment prefers Go. I chose TypeScript/Node.js because it's where I'm most productive and can deliver the highest quality work within the deadline. TypeScript gives strong type safety, and the Express ecosystem has mature libraries for every requirement (JWT, bcrypt, rate limiting, structured logging).

---

## Architecture Decisions

- **Knex.js over a full ORM**: Explicit SQL control, clean migration files with both up and down, no auto-migrate magic. Migrations are versioned and deterministic.
- **Zod for validation**: TypeScript-first schema validation that produces structured field-level errors matching the API spec's `{ error, fields }` format.
- **Pino for logging**: Fast structured JSON logging in production, pretty-printed in dev. Request ID correlation via `X-Request-ID` header on every request.
- **Rate limiting on auth**: `express-rate-limit` at 10 requests/minute/IP on login and register endpoints to prevent brute-force attacks.
- **CORS origin configured**: Not wildcard in production — explicit origin via `CORS_ORIGIN` env var.
- **PostgreSQL trigger for `updated_at`**: Reliable across bulk updates and raw queries, unlike application-level hooks.
- **TanStack Query for frontend state**: Server state caching with built-in optimistic updates, automatic cache invalidation, and retry logic.
- **localStorage for JWT storage**: Simpler than httpOnly cookies for this scope. The XSS tradeoff is acknowledged — see "What You'd Do With More Time."
- **Task creation restricted to project owners**: Assignees can view projects (via GET /projects) but cannot create tasks. This is intentional — assignees have read access only, while project owners manage the task list.

---

## Running Locally

```bash
git clone https://github.com/your-name/taskflow
cd taskflow
cp .env.example .env
docker compose up --build
```

- API: http://localhost:3000
- App: http://localhost:8080
- Database: localhost:5432

That's it. Migrations and seed data run automatically on container start.

---

## Running Migrations

Migrations run automatically on API startup (inside `index.ts`). For manual execution:

```bash
# Run latest migrations
docker compose exec api npx knex migrate:latest --knexfile dist/db/knexfile.js

# Rollback
docker compose exec api npx knex migrate:rollback --knexfile dist/db/knexfile.js

# Seed data
docker compose exec api npx knex seed:run --knexfile dist/db/knexfile.js
```

---

## Test Credentials

Seeded automatically on startup:

```
Email:    test@example.com
Password: password123
```

---

## API Reference

All endpoints return `Content-Type: application/json` (via `res.json()`). DELETE endpoints return 204 with no body.

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login and receive JWT |

**POST /api/auth/register**
```json
// Request
{ "name": "Jane Doe", "email": "jane@example.com", "password": "secret123" }

// Response 201
{ "user": { "id": "uuid", "name": "Jane Doe", "email": "jane@example.com" }, "token": "jwt..." }
```

**POST /api/auth/login**
```json
// Request
{ "email": "test@example.com", "password": "password123" }

// Response 200
{ "user": { "id": "uuid", "name": "Test User", "email": "test@example.com" }, "token": "jwt..." }
```

### Projects

All require `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List accessible projects (owns or has tasks in). Supports `?page=&limit=` |
| POST | `/api/projects` | Create a project (owner = current user) |
| GET | `/api/projects/:id` | Get project details |
| PATCH | `/api/projects/:id` | Update name/description (owner only) |
| DELETE | `/api/projects/:id` | Delete project + cascade tasks (owner only) |
| GET | `/api/projects/:id/stats` | **(Bonus)** Task counts by status |

**GET /api/projects**
```json
// Response 200
{
  "data": [{ "id": "uuid", "name": "Demo Project", "description": "...", "owner_id": "uuid", "created_at": "..." }],
  "pagination": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
}
```

**GET /api/projects/:id/stats**
```json
// Response 200
{ "todo": 1, "in_progress": 1, "done": 1, "total": 3 }
```

### Tasks

All require `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/:id/tasks` | List tasks. Supports `?status=`, `?assignee=`, `?page=`, `?limit=` |
| POST | `/api/projects/:id/tasks` | Create a task (project owner only) |
| PATCH | `/api/tasks/:id` | Update task (project owner or assignee) |
| DELETE | `/api/tasks/:id` | Delete task (project owner only) |

**POST /api/projects/:id/tasks**
```json
// Request
{ "title": "New Task", "description": "...", "priority": "high", "due_date": "2026-04-20" }

// Response 201
{ "id": "uuid", "title": "New Task", "status": "todo", "priority": "high", ... }
```

### Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Health check |

```json
// Response 200
{ "status": "ok", "timestamp": "2026-04-10T...", "uptime": 123.45 }
```

### Error Responses

```json
// 400 Validation error
{ "error": "Validation failed", "fields": { "email": "already registered" } }

// 401 Unauthenticated
{ "error": "Invalid credentials" }

// 403 Forbidden
{ "error": "Access denied" }

// 404 Not found
{ "error": "Project not found" }
```

---

## Bonus Features Implemented

- [x] **Pagination** on list endpoints (`?page=&limit=`) with response envelope including `totalPages`
- [x] **Project stats endpoint** (`GET /api/projects/:id/stats`) — task counts by status
- [x] **Dark mode** with system preference detection (`prefers-color-scheme`) and localStorage persistence
- [x] **Drag-and-drop** task status changes between Kanban columns (keyboard accessible)
- [x] **Pagination UI** with URL-synced page state (`?page=2`) surviving refresh

---

## What You'd Do With More Time

- **httpOnly cookie auth**: Move JWT from localStorage to httpOnly cookie to eliminate XSS token theft vector. Currently a deliberate tradeoff for simplicity.
- **Token refresh**: Currently 24h hard expiry with no refresh. Add refresh token rotation for seamless session continuation.
- **WebSocket/SSE**: Real-time task updates when another user modifies a shared project.
- **Role-based access**: Currently binary owner/non-owner. Add project member invitations with granular role levels (admin, editor, viewer).
- **CI/CD**: GitHub Actions pipeline with lint, typecheck, test, build, and deploy stages.
- **E2E tests**: Playwright for full user journey testing across login, project creation, task management.
- **Database connection pooling tuning**: Currently Knex defaults (min 2, max 10). In production, tune based on expected concurrency and PG `max_connections`.
- **Add Unit Test Cases**: Add some unit test cases to verify the code. 
