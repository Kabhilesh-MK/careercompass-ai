# Deployment Guide — CareerCompass AI

## Overview & Deployment Readiness

> [!NOTE]
> **Deployment Status**: CareerCompass AI is **deployment-ready** with validated Docker containerization, Render backend service blueprints, and Vercel static SPA configuration. In the standard evaluation/demo mode, application state is persisted completely in browser `localStorage`, with optional MongoDB Atlas persistence for multi-device deployments.

This guide covers deploying CareerCompass AI to production:
- **Backend Service**: Python 3.12, FastAPI, Uvicorn on Render or containerized Docker host.
- **Frontend SPA**: React 18, TypeScript, Vite static bundle on Vercel or Nginx.
- **Database (Optional)**: MongoDB Atlas for multi-user account persistence (defaults to LocalStorage demo mode).
- **ML Artifacts**: Locked Candidate H model (`careercompass_phase3_4_model.joblib`), preprocessor, and metadata shipped directly in the container image.

---

## 1. MongoDB Atlas Setup

### Create Cluster
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Sign up / sign in and click **Build a Cluster**
3. Choose **M0 Free Tier** (sufficient for demo/college project)
4. Select your preferred cloud region
5. Name the cluster: `careercompass-cluster`

### Database User
1. Navigate to **Database Access** → **Add New Database User**
2. Username: `careercompass`
3. Password: generate a strong random password (save it!)
4. Role: **Atlas admin** or **Read and write to any database**

### Network Access
1. Navigate to **Network Access** → **Add IP Address**
2. For Render deployment: click **Allow Access from Anywhere** (0.0.0.0/0)
3. For local development: add your current IP

### Get Connection String
1. Click **Connect** → **Connect your application**
2. Copy the string: `mongodb+srv://careercompass:<password>@careercompass-cluster.xxx.mongodb.net/`
3. Replace `<password>` with your actual password

---

## 2. Backend Deployment (Render)

### Option A: Via render.yaml Blueprint (Recommended)
The `render.yaml` file at the repository root defines the backend service using Render's **Docker runtime**:
- **Runtime**: Docker (using the root-level `Dockerfile`)
- **Build Context**: `.` (Repository root — critical so `backend/`, `ml/models/`, and `ml/src/` are copied into the container)
- **Port Handling**: Uvicorn binds to `0.0.0.0:${PORT:-8000}`, dynamically resolving Render's injected `$PORT`
- **Health Check**: `/api/v1/ready` (validates that ML artifacts are fully loaded and operational)

**Steps to Deploy:**
1. Push your code to GitHub
2. Go to [render.com](https://render.com) → **New** → **Blueprint**
3. Connect your GitHub repository (`careercompass-ai`)
4. Render auto-detects `render.yaml` and deploys the container service

### Option B: Manual Web Service Setup
If creating the service manually in the Render dashboard:
1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repository
3. **Choose Docker runtime (Recommended):**
   - **Runtime**: Docker
   - **Root Directory**: `.` (leave empty or set to repository root — **do NOT set to `backend`**)
   - **Dockerfile Path**: `Dockerfile`
   - **Docker Context**: `.`
4. *(Alternative) Native Python runtime:*
   - **Runtime**: Python 3.12 (set `PYTHON_VERSION=3.12.10` in environment)
   - **Root Directory**: `.` (leave empty or set to repository root — **do NOT set to `backend`**)
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`

### Environment Variables (Required)
Set these in the Render dashboard under **Environment**:

| Key | Value |
|-----|-------|
| `MONGODB_URL` | Your Atlas connection string |
| `MONGODB_DB_NAME` | `career_compass_ai` |
| `JWT_SECRET_KEY` | A 64+ character random string |
| `JWT_ALGORITHM` | `HS256` |
| `JWT_ACCESS_EXPIRE_MINUTES` | `60` |
| `JWT_REFRESH_EXPIRE_DAYS` | `7` |
| `ALLOWED_ORIGINS` | `https://your-app.vercel.app` (never wildcard `*`) |
| `CORS_ORIGINS` | `https://your-app.vercel.app` |
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |

### Generate JWT Secret
```bash
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

### ML Model Artifacts (Locked System)
The Candidate H Random Forest model (`careercompass_phase3_4_model.joblib`), preprocessor, and metadata are **permanently locked** and shipped in the `ml/models/` directory. 
- **DO NOT** attempt to train or overwrite the model in production.
- On startup, the FastAPI application loads and validates the model automatically via the lifespan context manager.
- Verify status via `GET /api/v1/ready`.

> **Note**: On Render's free tier, the service spins down after 15 minutes of inactivity. The first request after spin-down takes ~30s. Upgrade to Starter ($7/month) for always-on service.

---

## 3. Frontend Deployment (Vercel)

### Option A: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `.` (project root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variables:
   - `VITE_API_URL` = `https://your-api-name.onrender.com`
   - `VITE_API_BASE_URL` = `https://your-api-name.onrender.com`
5. Click **Deploy**

### Option B: Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

When prompted:
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`

### Environment Variables
| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://your-api-name.onrender.com` |
| `VITE_API_BASE_URL` | `https://your-api-name.onrender.com` |

---

## 4. Docker (Self-hosted)

For self-hosted production deployment:

```bash
# Clone and configure
git clone https://github.com/yourusername/careercompass-ai.git
cd careercompass-ai
cp backend/.env.example backend/.env
cp .env.example .env
# Edit backend/.env and set strong JWT secret and allowed origins

# Build and start services
docker-compose up -d --build

# Verify health and readiness
curl http://localhost:8000/api/v1/ready

# View logs
docker-compose logs -f api
```

Services:
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 5. Post-Deployment Checklist

- [ ] API health check returns `{"status": "ok"}` at `GET /`
- [ ] ML readiness probe returns `{"status": "ready"}` at `GET /api/v1/ready`
- [ ] Swagger docs load at `/docs`
- [ ] Frontend loads without console errors
- [ ] User registration works end-to-end
- [ ] ML prediction returns results
- [ ] `ALLOWED_ORIGINS` includes the Vercel frontend URL
- [ ] `APP_DEBUG=false` in production
- [ ] MongoDB connection string uses Atlas (not localhost)
- [ ] JWT secret is at least 64 characters

---

## 6. Custom Domain (Optional)

### Vercel
1. Dashboard → Settings → Domains
2. Add your domain
3. Update DNS records with your registrar

### Render
1. Service Settings → Custom Domains
2. Add your API domain (e.g., `api.careercompass.ai`)
3. Update DNS records

---

## 7. Monitoring & Logs

- **Render**: Dashboard → Logs tab (real-time log streaming)
- **Vercel**: Dashboard → Deployments → View Function Logs
- **MongoDB Atlas**: Atlas dashboard → Monitoring tab

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `CORS error` | Add frontend URL to `ALLOWED_ORIGINS` / `CORS_ORIGINS` env var (never use `*`) |
| `ML model not found` | Verify ML artifacts exist at `ml/models/careercompass_phase3_4_model.joblib` |
| `MongoDB connection refused` | Check `MONGODB_URL` format and Atlas IP allowlist |
| `JWT decode error` | Ensure `JWT_SECRET_KEY` is the same on all instances |
| `Build fails on Render` | Check Python version — use 3.12 |
| `Vite build fails` | Run `npm install` then `npm run build` locally first |
