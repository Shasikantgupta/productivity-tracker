# Employee Productivity Analytics System

[![Vercel Status](https://img.shields.io/badge/Vercel-Deployed-success?style=flat&logo=vercel)](https://dashboard-c9hqno23l-shashikant-guptas-projects-23e2cb1e.vercel.app)

**Live Dashboard Demo:** [https://dashboard-c9hqno23l-shashikant-guptas-projects-23e2cb1e.vercel.app](https://dashboard-c9hqno23l-shashikant-guptas-projects-23e2cb1e.vercel.app)

Enterprise-grade employee productivity monitoring and analytics platform with real-time tracking, AI-powered insights, and full privacy compliance.

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Electron Agent  │────▶│  FastAPI Backend │◀────│  Next.js Dash   │
│  (Desktop)       │     │  + Socket.IO     │     │  (Admin Panel)  │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                               │   │
┌─────────────────┐     ┌──────▼───┴──────┐
│ Browser Extension│────▶│ PostgreSQL Redis │
│  (Chrome MV3)    │     │ (Data + Cache)   │
└─────────────────┘     └─────────────────┘
```

## 📦 Modules

| Module | Path | Tech |
|--------|------|------|
| Backend API | `backend/` | FastAPI, SQLAlchemy, JWT |
| Database | `backend/migrations/` | PostgreSQL 15 |
| Desktop Agent | `desktop-agent/` | Electron 28, Node.js |
| Admin Dashboard | `dashboard/` | Next.js 14, React 18 |
| Browser Extension | `browser-extension/` | Chrome Extension MV3 |
| AI Analytics | `backend/app/ai/` | scikit-learn, pandas |
| Infrastructure | `docker-compose.yml` | Docker, Nginx |

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for development)
- Python 3.11+ (for development)

### 1. Clone & Configure

```bash
cp .env.example .env
# Edit .env with your settings
```

### 2. Start with Docker

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
```

### 3. Access

| Service | URL |
|---------|-----|
| Dashboard | http://localhost:3000 |
| API Docs | http://localhost:8000/docs |
| API Health | http://localhost:8000/health |

**Default Admin Login:**
- Email: `admin@company.com`
- Password: `Admin@123456`

## 🔧 Development Setup

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate      # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Dashboard

```bash
cd dashboard
npm install
npm run dev
```

### Desktop Agent

```bash
cd desktop-agent
npm install
npm start
```

### Browser Extension

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `browser-extension/` folder

## 📊 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register user |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/refresh` | Refresh token |
| GET | `/api/v1/auth/me` | Current user |
| POST | `/api/v1/auth/change-password` | Change password |

### Employees
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/employees/` | List employees |
| GET | `/api/v1/employees/{id}` | Get employee |
| POST | `/api/v1/employees/` | Create employee |
| PUT | `/api/v1/employees/{id}` | Update employee |

### Tracking
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/tracking/batch` | Submit activity batch |
| POST | `/api/v1/tracking/heartbeat` | Agent heartbeat |
| GET | `/api/v1/tracking/activities/{id}` | Get activities |
| GET | `/api/v1/tracking/app-usage/{id}` | Get app usage |
| GET | `/api/v1/tracking/online` | Online employees |

### Screenshots
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/screenshots/upload` | Upload encrypted screenshot |
| GET | `/api/v1/screenshots/{id}` | Get & decrypt screenshot |
| GET | `/api/v1/screenshots/employee/{id}` | List screenshots |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/reports/dashboard` | Dashboard stats |
| GET | `/api/v1/reports/productivity/{id}` | Productivity scores |
| POST | `/api/v1/reports/generate` | Generate report |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/admin/policies` | Create policy |
| GET | `/api/v1/admin/policies/active` | Active policy |
| POST | `/api/v1/admin/consent` | Record consent |
| GET | `/api/v1/admin/alerts` | List alerts |
| POST | `/api/v1/admin/alerts/{id}/acknowledge` | Acknowledge alert |

## 🔒 Privacy & Compliance

This system implements privacy-first monitoring:

- **Employee Consent Screen** - Shown before any tracking begins
- **Visible Tracking Indicator** - System tray icon shows active tracking
- **Privacy Policy** - Full disclosure of data collected
- **Consent Revocation** - Employees can revoke consent anytime
- **Data Transparency** - Employees can view their own data
- **Admin Controls** - Configurable tracking per employee
- **Encrypted Screenshots** - AES-256 encryption at rest
- **Access Auditing** - All screenshot access is logged
- **Data Retention** - Automatic deletion after retention period

## 🐳 Production Deployment

```bash
# Build and start with production profile
docker-compose --profile production up -d --build

# Scale backend workers
docker-compose up -d --scale backend=3
```

### SSL/TLS Setup
1. Place certificates in `nginx/ssl/`
2. Update `nginx/nginx.conf` to enable HTTPS
3. Restart nginx: `docker-compose restart nginx`

## 📁 Project Structure

```
productivity-tracker/
├── backend/
│   ├── app/
│   │   ├── api/routes/      # REST API endpoints
│   │   ├── core/            # Security, Redis, middleware
│   │   ├── models/          # SQLAlchemy ORM models
│   │   ├── schemas/         # Pydantic validation
│   │   ├── websocket/       # Socket.IO handlers
│   │   └── ai/              # AI analytics engine
│   ├── migrations/          # SQL init scripts
│   ├── Dockerfile
│   └── requirements.txt
├── desktop-agent/
│   ├── src/
│   │   ├── trackers/        # Activity & app trackers
│   │   ├── services/        # API, WebSocket, screenshots
│   │   └── ui/              # Consent, login, privacy
│   ├── main.js              # Electron main process
│   └── preload.js
├── dashboard/
│   ├── src/
│   │   ├── app/             # Next.js pages
│   │   ├── components/      # React components
│   │   ├── lib/             # API client
│   │   └── styles/          # CSS design system
│   └── Dockerfile
├── browser-extension/
│   ├── manifest.json
│   ├── background.js
│   └── popup/
├── nginx/
├── docker-compose.yml
└── .env.example
```

## ⚖️ License

Proprietary - Internal use only.
