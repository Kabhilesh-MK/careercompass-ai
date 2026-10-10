# CareerCompass AI — Backend (Phase 2)

Production-ready FastAPI + MongoDB (Motor) backend for CareerCompass AI.

> Machine Learning is intentionally NOT implemented in this phase (planned for Phase 3).

## Tech Stack

- **Python 3.11+**
- **FastAPI** — async web framework
- **Uvicorn** — ASGI server
- **Motor** — async MongoDB driver
- **MongoDB** — database (`career_compass_ai`)
- **Pydantic v2** — validation
- **python-jose** — JWT
- **passlib + bcrypt** — password hashing
- **python-dotenv** — env config
- **loguru** — logging

## Folder Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── controllers/      # (reserved for heavier controller logic)
│   │   └── routes/            # route definitions per resource
│   ├── services/              # business logic + async DB ops
│   ├── models/                # MongoDB document builders
│   ├── schemas/               # Pydantic request/response models
│   ├── database/              # connection + index setup
│   ├── middleware/            # error handling + logging
│   ├── utils/                 # helpers + custom exceptions
│   ├── config/                # settings (env-driven)
│   ├── auth/                  # security, JWT, dependencies
│   ├── uploads/resumes/       # uploaded resume PDFs
│   └── main.py                # FastAPI entrypoint
├── requirements.txt
├── .env.example
└── .env
```

## Collections

`users`, `skills`, `careers`, `predictions`, `roadmaps`, `projects`,
`certifications`, `learning_resources`, `placement_scores`, `resumes`,
`chat_history`, `admins`.

## Setup

```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                              # then edit values
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### MongoDB

- **Local (Compass):** set `MONGODB_URL=mongodb://localhost:27017`
- **Atlas:** set `MONGODB_URL=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net`

Database name: `career_compass_ai` (auto-created on first write).

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register a new student |
| POST | `/api/auth/login` | Login (student) |
| POST | `/api/auth/admin/login` | Login (admin) |
| POST | `/api/auth/logout` | Logout (revoke token) |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/forgot-password` | Request reset token |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/profile` | Get current user profile |
| PUT | `/api/profile/update` | Update profile |
| PUT | `/api/profile/skills` | Update skills |
| PUT | `/api/profile/education` | Update education |
| POST | `/api/profile/photo` | Upload avatar |
| GET/PUT | `/api/skills` | Get/update skills |
| POST | `/api/resume/upload` | Upload resume (PDF) |
| GET | `/api/resume` / `/api/resume/list` | Fetch resumes |
| DELETE | `/api/resume/{id}` | Delete resume |
| GET/POST/PUT/DELETE | `/api/projects` | Projects CRUD |
| GET/POST/PUT/DELETE | `/api/certifications` | Certifications CRUD |
| GET/POST | `/api/roadmap` | Roadmap CRUD |
| PUT | `/api/roadmap/milestone/{id}/{index}` | Update milestone progress |
| GET | `/api/careers` | List careers |
| GET | `/api/reports` | Generate JSON report |
| GET/PUT | `/api/settings` | Settings |
| PUT | `/api/settings/password` | Change password |
| GET/POST | `/api/mentor/history` `/message` | AI mentor chat |
| DELETE | `/api/mentor/history` | Clear chat |
| GET | `/api/admin/stats` `/users` | Admin stats + users |

## Auth

JWT bearer tokens. Protected routes require `Authorization: Bearer <token>`.
Roles: `student`, `admin`. Admin-only routes are enforced via dependencies.

## Docs

Interactive docs available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
