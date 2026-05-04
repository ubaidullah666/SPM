# ImpactHub — Social Impact & Volunteering Exchange Platform

A full-stack platform connecting volunteers with NGOs to create meaningful social impact.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 + CSS (responsive) |
| Backend | Node.js + NestJS (modular) |
| Database | MongoDB + Mongoose |
| Auth | JWT + Passport.js |
| Docs | Swagger/OpenAPI |

---

## Project Structure

```
├── backend/                  # NestJS API
│   └── src/
│       ├── auth/             # JWT authentication
│       ├── users/            # User management
│       ├── projects/         # Project CRUD
│       ├── applications/     # Apply & review
│       ├── contributions/    # Hour tracking
│       ├── ratings/          # Feedback system
│       ├── ai-matching/      # Skill-based matching
│       └── common/           # Guards, decorators, enums
│
├── frontend/                 # Next.js app
│   └── src/
│       ├── app/
│       │   ├── login/        # Auth pages
│       │   ├── register/
│       │   ├── dashboard/    # Volunteer dashboard
│       │   ├── dashboard/ngo/# NGO dashboard
│       │   ├── projects/     # Browse & detail
│       │   └── profile/      # User profile
│       ├── components/       # Sidebar, ProjectCard, Layout
│       ├── lib/              # API client, auth helpers
│       └── styles/           # Global CSS design system
│
└── docker-compose.yml        # Full stack deployment
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- npm

### Run everything with one command

From the `SPM` root folder:

```bash
# 1. Install all dependencies (first time only)
npm run install:all

# 2. Start both frontend and backend together
npm run dev
```

- Frontend → http://localhost:3000  
- Backend  → http://localhost:3001  
- Swagger  → http://localhost:3001/api/docs

Both servers run in the same terminal with color-coded output:
- `[BACKEND]` in cyan
- `[FRONTEND]` in magenta

### Individual commands (optional)

```bash
npm run dev:backend    # backend only
npm run dev:frontend   # frontend only
```

### Docker (Full Stack)

```bash
docker-compose up -d
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user/NGO |
| POST | /api/auth/login | Login |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/projects | Browse all (with filters) |
| GET | /api/projects/:id | Project detail |
| POST | /api/projects | Create (NGO only) |
| PUT | /api/projects/:id | Update (NGO only) |
| DELETE | /api/projects/:id | Delete (NGO only) |
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
| GET | /api/ai-matching/suggestions | Skill-matched projects |

---

## Roles & Permissions

| Feature | Volunteer | NGO | Admin |
|---------|-----------|-----|-------|
| Browse projects | ✅ | ✅ | ✅ |
| Apply to projects | ✅ | ❌ | ❌ |
| Create projects | ❌ | ✅ | ✅ |
| Review applications | ❌ | ✅ | ✅ |
| Log contributions | ✅ | ❌ | ❌ |
| Verify contributions | ❌ | ✅ | ✅ |
| View leaderboard | ✅ | ✅ | ✅ |

---

## Features

- **JWT Authentication** with role-based access control (Volunteer / NGO / Admin)
- **Project Discovery** with full-text search, category filters, skill filters, remote/on-site
- **Application System** with cover letters, accept/reject with feedback
- **Contribution Tracking** — log hours, auto-calculate impact score, NGO verification
- **Impact Portfolio** — charts, timeline, skills radar, ratings
- **AI Matching** — skill-based project suggestions (placeholder for real AI integration)
- **Rating System** — volunteers rate projects, NGOs rate volunteers
- **Responsive Design** — mobile + desktop with dark navy/teal design system
