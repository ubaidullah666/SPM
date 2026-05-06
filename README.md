# ImpactHub — Social Impact & Volunteering Exchange Platform

A full-stack platform connecting volunteers with NGOs to create meaningful social impact.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 + CSS (responsive) |
| Backend | Node.js + NestJS (modular) |
| Database | PostgreSQL + TypeORM |
| Auth | JWT + Passport.js |
| Docs | Swagger/OpenAPI |

---

## Project Structure

```
├── backend/                  # NestJS API
│   ├── sql/init.sql          # Reference SQL schema (optional if using TypeORM sync)
│   └── src/
│       ├── auth/             # JWT authentication
│       ├── users/            # User management (volunteers / admins)
│       ├── ngos/             # NGO accounts (separate table)
│       ├── projects/         # Project CRUD
│       ├── applications/     # Apply & review
│       ├── contributions/    # Hour tracking
│       ├── ratings/          # Project feedback (PostgreSQL)
│       ├── ai-matching/      # Skill-based matching
│       └── entities/         # TypeORM entities
│
├── frontend/                 # Next.js app
│   └── src/
│       ├── app/              # App Router pages
│       ├── components/
│       ├── lib/              # API client, auth helpers
│       └── styles/
│
└── docker-compose.yml        # Postgres + backend + frontend
```

---

## Prerequisites

- **Node.js** 18+
- **npm**
- **Docker Desktop** (for the Docker workflow) — install, open it, and wait until it is running before using `docker compose`.

---

## Ports (quick reference)

| Service | URL on your machine | Notes |
|--------|----------------------|--------|
| **Frontend** | http://localhost:**3002** | Default in `docker-compose.yml` (host 3002 → container 3000). Many Macs already use 3000 for local `next dev`. |
| **Backend API** | http://localhost:**3001** | All routes are under **`/api`**. |
| **Swagger** | http://localhost:**3001/api/docs** | Interactive API docs. |
| **PostgreSQL** | **localhost:5433** | User `postgres`, password `postgres`, database `social_impact`. **5433** avoids clashing with Homebrew Postgres on **5432**. |

To use host port **3000** for the frontend instead (only if nothing else uses it):

```bash
FRONTEND_HOST_PORT=3000 FRONTEND_URL=http://localhost:3000 docker compose up -d
```

---

## Run the app with Docker (full stack)

Use this when you want Postgres, API, and UI in containers.

### Step 1 — Start Docker Desktop

On macOS, open **Docker Desktop** and wait until it reports that the engine is running.

### Step 2 — Start all services

From the **`SPM`** folder (the directory that contains `docker-compose.yml`):

```bash
cd /path/to/SPM
docker compose up -d --build
```

- First run builds images; later you can use `docker compose up -d` without `--build` if nothing changed.
- To see logs in the foreground instead: `docker compose up --build` (no `-d`).

### Step 3 — Confirm containers

```bash
docker compose ps
```

You should see `social-impact-postgres`, `social-impact-backend`, and `social-impact-frontend` running.

### Step 4 — Open the app

- **UI:** http://localhost:3002  
- **API docs:** http://localhost:3001/api/docs  
- **Quick API check:** http://localhost:3001/api/projects (expect `200` and usually a JSON array)

### Step 5 — Seed demo data (from your Mac, not inside a container)

The seed script creates demo users, an NGO, and sample projects. Run it **after** the Postgres container is up.

```bash
cd backend
npm install
export DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5433/social_impact"
npm run seed
```

**Important:**

- Use port **5433** (mapped from Docker), **not** `5432`, if you also have **Homebrew PostgreSQL** installed. Connecting to `localhost:5432` often hits Homebrew and produces `role "postgres" does not exist`.
- If the seed says the database is unreachable, ensure `docker compose ps` shows Postgres healthy, then retry.

**Demo accounts** (after a successful seed):

| Account | Email | Password |
|---------|--------|----------|
| Volunteer | volunteer@demo.com | demo123 |
| NGO | ngo@demo.com | demo123 |

### Step 6 — Stop the stack

```bash
docker compose down
```

Data in Postgres is kept in the Docker volume unless you remove volumes explicitly.

---

## Run the app without Docker (local Node + database)

Use this when you develop with `npm run dev` and supply your own PostgreSQL.

### Step 1 — Install dependencies

From the **`SPM`** folder:

```bash
npm run install:all
```

### Step 2 — PostgreSQL

Either:

- Run **only** the DB in Docker:  
  `docker compose up -d postgres`  
  Then use `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5433/social_impact` for the backend, **or**
- Use **Homebrew** Postgres: create database `social_impact` and set  
  `DATABASE_URL=postgresql://$(whoami)@localhost:5432/social_impact` (adjust user/password to match your setup).

You can apply `backend/sql/init.sql` manually, or rely on TypeORM **`DATABASE_SYNC=true`** in development (see below).

### Step 3 — Backend environment

From `backend/`:

```bash
export DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5433/social_impact"
export DATABASE_SYNC="true"
export JWT_SECRET="dev-secret-change-me"
export JWT_EXPIRES_IN="7d"
export PORT="3001"
export FRONTEND_URL="http://localhost:3000"
npm run start:dev
```

Set **`FRONTEND_URL`** to whatever origin you use for the Next app (e.g. `http://localhost:3000`) so CORS allows the browser.

### Step 4 — Frontend environment

From `frontend/` in another terminal:

```bash
export NEXT_PUBLIC_API_URL="http://localhost:3001/api"
npm run dev
```

### Step 5 — Seed (optional)

Same as Docker Step 5, with a `DATABASE_URL` that points at **your** Postgres instance.

### Step 6 — Run both from repo root (optional)

From **`SPM`**:

```bash
npm run dev
```

This runs backend and frontend together; you still need Postgres running and the backend env vars set (e.g. via `backend/.env` or your shell). Default docs still assume API on **3001** and Next dev on **3000**.

---

## Environment variables (summary)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string (backend and seed). |
| `DATABASE_SYNC` | If `true`, TypeORM updates schema to match entities (dev only; use migrations or `sql/init.sql` in production). |
| `JWT_SECRET` | Secret for signing JWTs. |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `7d`). |
| `PORT` | Backend port (default `3001`). |
| `FRONTEND_URL` | Browser origin allowed by CORS (must match how you open the UI). |
| `NEXT_PUBLIC_API_URL` | API base URL baked into the Next.js client (e.g. `http://localhost:3001/api`). |
| `FRONTEND_HOST_PORT` | Host port mapped to the frontend container (compose default **3002**). |

---

## Troubleshooting

| Problem | What to try |
|---------|-------------|
| `Cannot connect to the Docker daemon` | Start **Docker Desktop**; run `docker info` until it succeeds. |
| `bind: address already in use` on **3000** | Compose defaults to **3002** for the UI; open http://localhost:3002. Or free port 3000 and set `FRONTEND_HOST_PORT=3000`. |
| `role "postgres" does not exist` when seeding | You are hitting **Homebrew** Postgres on **5432**. Use **`127.0.0.1:5433`** with the Docker DB, or stop Homebrew Postgres while using Docker. |
| Empty project list / login fails after fresh DB | Run **`npm run seed`** in `backend/` with the correct `DATABASE_URL`. |
| CORS errors in the browser | Set **`FRONTEND_URL`** on the backend to the exact origin you use (including `http://localhost:3002` if that is your UI URL). |

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register volunteer or NGO |
| POST | /api/auth/login | Login |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/projects | Browse all (with filters) |
| GET | /api/projects/:id | Project detail |
| POST | /api/projects | Create (NGO only) |
| PUT | /api/projects/:id | Update (NGO only) |
| DELETE | /api/projects/:id | Soft-delete (NGO only) |
| GET | /api/projects/my-projects | NGO's own projects |

### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/applications | Apply to project |
| GET | /api/applications/my | My applications |
| GET | /api/applications/project/:id | Project applications (NGO) |
| PUT | /api/applications/:id/review | Accept/reject |

### Contributions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/contributions | Log hours |
| GET | /api/contributions/my | My contributions |
| GET | /api/contributions/my/summary | Impact summary |
| PUT | /api/contributions/:id/verify | Verify (NGO) |

### AI Matching
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/ai-matching/suggestions | Skill-matched projects (volunteer) |

---

## Roles & Permissions

| Feature | Volunteer | NGO | Admin |
|---------|-----------|-----|-------|
| Browse projects | ✅ | ✅ | ✅ |
| Apply to projects | ✅ | ❌ | ❌ |
| Create projects | ❌ | ✅ | ❌ |
| Review applications | ❌ | ✅ | ❌ |
| Log contributions | ✅ | ❌ | ❌ |
| Verify contributions | ❌ | ✅ | ❌ |
| View leaderboard | ✅ | ✅ | ✅ |

---

## Features

- **JWT authentication** with role-based access (volunteer / NGO / admin in the app; NGOs are stored in a dedicated `ngos` table).
- **Project discovery** with search, category, skills, status, and remote filters.
- **Applications** with cover letter and NGO review notes.
- **Contributions** with hours, impact score, and NGO verification.
- **Impact portfolio** with charts and contribution history.
- **AI matching** — skill-based suggestions (placeholder for deeper AI).
- **Project feedback** — ratings tied to projects in PostgreSQL (`project_feedback`).
- **Responsive UI** — navy/teal design system.
