<div align="center">

# 🏟️ GitArena

### GitHub Analytics & AI Platform

*Empowering developers and teams with actionable insights from their GitHub repositories*

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/Efrat-Wilinger/-GitArena)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Team](#-team)

</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Development](#-development)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [Team](#-team)

---

## 🎯 About

**GitArena** is a comprehensive GitHub analytics platform that transforms raw repository data into meaningful insights. Built for developers and teams who want to understand their development patterns, improve code quality, and enhance collaboration.

### 🎖️ Sprint 1 - Complete ✅

Our first sprint delivers the foundation:

- ✅ **Story 205**: GitHub OAuth Login with JWT authentication
- ✅ **Story 207**: Repository selection and synchronization
- ✅ **Story 210**: Commit pulling and daily sync automation
- ✅ **Story 212**: User profile management
- ✅ **Story 239**: Docker Compose infrastructure
- ✅ **Story 249**: Git repository initialization

---

## ✨ Features

### 🔐 Authentication & Security
- **GitHub OAuth Integration** - Seamless login with your GitHub account
- **JWT Authentication** - Secure token-based authentication
- **Role-Based Access Control** - Manage team permissions

### 📊 Analytics Dashboard
- **Repository Insights** - Track commits, PRs, and code changes
- **Team Metrics** - Understand collaboration patterns
- **Activity Tracking** - Monitor development velocity
- **Visual Reports** - Beautiful charts and graphs

### 🤖 AI-Powered Features *(Coming Soon)*
- Code review suggestions
- Pattern detection
- Quality recommendations

### 🔄 Synchronization
- **Automatic Sync** - Daily repository updates
- **On-Demand Refresh** - Manual sync when needed
- **Webhook Support** *(Planned)*

---

## 🛠️ Technology Stack

<table>
<tr>
<td width="50%">

### Backend
- ![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white) **FastAPI** - Modern, fast web framework
- ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-4169E1?logo=postgresql&logoColor=white) **PostgreSQL** - Robust database
- ![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-ORM-red) **SQLAlchemy** - Powerful ORM
- ![Alembic](https://img.shields.io/badge/Alembic-Migrations-orange) **Alembic** - Database migrations
- ![JWT](https://img.shields.io/badge/JWT-Auth-000000?logo=jsonwebtokens) **JWT** - Secure authentication

</td>
<td width="50%">

### Frontend
- ![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black) **React 18** - UI framework
- ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white) **TypeScript** - Type safety
- ![Vite](https://img.shields.io/badge/Vite-Latest-646CFF?logo=vite&logoColor=white) **Vite** - Lightning-fast builds
- ![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss&logoColor=white) **TailwindCSS** - Utility-first styling
- ![Recharts](https://img.shields.io/badge/Recharts-Visualization-8884d8) **Recharts** - Data visualization

</td>
</tr>
</table>

### DevOps & Tools
- 🐳 **Docker & Docker Compose** - Containerization
- 🔄 **GitHub Actions** - CI/CD pipeline
- 🧪 **pytest** - Backend testing
- 📦 **npm** - Package management

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have:
- ✅ [Docker](https://www.docker.com/get-started) and Docker Compose installed
- ✅ A GitHub account
- ✅ GitHub OAuth App credentials (see setup below)

### 1️⃣ Setup GitHub OAuth App

1. Navigate to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in the details:
   ```
   Application name: GitArena
   Homepage URL: http://localhost:3000
   Authorization callback URL: http://localhost:3000/auth/callback
   ```
4. Click **"Register application"**
5. Copy your **Client ID** and generate a **Client Secret**

### 2️⃣ Clone & Configure

```bash
# Clone the repository
git clone https://github.com/Efrat-Wilinger/-GitArena.git
cd -GitArena

# Copy environment template
cp .env.example .env
```

### 3️⃣ Configure Environment

Edit `.env` and add your credentials:

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Security
SECRET_KEY=your_super_secret_key_here

# Database
DATABASE_URL=postgresql://gitarena:gitarena@db:5432/gitarena

# API
API_URL=http://localhost:8000
```

### 4️⃣ Launch Application

```bash
# Start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

### 5️⃣ Access the Application

| Service | URL | Description |
|---------|-----|-------------|
| 🌐 **Frontend** | http://localhost:3000 | Main application |
| 🔧 **Backend API** | http://localhost:8000 | REST API |
| 📚 **API Docs** | http://localhost:8000/docs | Interactive API documentation |
| 🗄️ **Database** | localhost:5432 | PostgreSQL (internal) |

---

## 📁 Project Structure

```
GitArena/
│
├── 🔙 backend/                    # Python FastAPI Backend
│   ├── app/
│   │   ├── modules/
│   │   │   ├── github/           # GitHub integration & sync
│   │   │   ├── users/            # User management & auth
│   │   │   ├── analytics/        # Analytics & dashboards
│   │   │   ├── spaces/           # Team spaces
│   │   │   └── ai/               # AI features (placeholder)
│   │   ├── shared/
│   │   │   ├── database.py       # DB connection
│   │   │   ├── models.py         # SQLAlchemy models
│   │   │   ├── security.py       # JWT & auth utilities
│   │   │   └── middleware.py     # Error handling
│   │   ├── config/
│   │   │   └── settings.py       # Configuration
│   │   └── main.py               # FastAPI app entry
│   ├── migrations/               # Alembic migrations
│   ├── devops/
│   │   └── cron_sync.py          # Daily sync job
│   ├── tests/                    # Unit tests
│   ├── requirements.txt
│   └── Dockerfile
│
├── 🎨 frontend/                   # React TypeScript Frontend
│   ├── src/
│   │   ├── api/                  # API client layer
│   │   ├── components/           # Reusable components
│   │   ├── pages/                # Page components
│   │   │   ├── LoginPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── RepositoriesPage.tsx
│   │   │   └── CommitsPage.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── 🔄 .github/
│   └── workflows/
│       └── ci.yml                # GitHub Actions CI
│
├── 🐳 docker-compose.yml         # Docker orchestration
└── 📖 README.md                  # You are here!
```

---

## 📚 API Documentation

### 🔐 Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/github/login` | Initiate GitHub OAuth flow |
| `GET` | `/auth/github/callback` | OAuth callback handler |

### 👤 Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/users/me` | Get current user profile |
| `GET` | `/users/{user_id}` | Get user by ID |

### 🐙 GitHub Integration

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/github/repos` | List user repositories |
| `POST` | `/github/repos/sync` | Sync repositories from GitHub |
| `GET` | `/github/repos/{repo_id}/commits` | Get repository commits |

### 📊 Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/analytics/dashboard` | Get dashboard statistics |
| `GET` | `/analytics/activity` | Get activity metrics |

### 🤖 AI Features *(Coming Soon)*

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/ai/code-review` | Get AI code review |

> 💡 **Tip**: Visit http://localhost:8000/docs for interactive API documentation with Swagger UI!

---

## 💻 Development

### Running Without Docker

#### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your credentials

# Run migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:8000" > .env.local
echo "VITE_GITHUB_CLIENT_ID=your_client_id" >> .env.local

# Start development server
npm run dev
```

### Database Migrations

```bash
# Create a new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1
```

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_main.py
```

### Frontend Build

```bash
cd frontend

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## 🗄️ Database Schema

### Core Tables

| Table | Description |
|-------|-------------|
| `users` | User accounts with GitHub integration |
| `spaces` | Organizational spaces for repositories |
| `repositories` | GitHub repositories |
| `commits` | Repository commits |
| `pull_requests` | Pull requests |
| `reviews` | PR reviews |

### Analytics Tables

| Table | Description |
|-------|-------------|
| `analytics_activity` | User activity metrics |
| `analytics_quality` | Code quality metrics |
| `analytics_collaboration` | Collaboration metrics |
| `ai_feedback` | AI-generated insights |

---

## 🔒 Security Features

- 🔐 **JWT-based authentication** - Secure token management
- 🔑 **GitHub OAuth** - Industry-standard authentication
- 🔒 **Password hashing** - bcrypt encryption
- 🛡️ **CORS protection** - Configured for security
- 🔐 **Environment secrets** - No hardcoded credentials
- 🚫 **SQL injection protection** - SQLAlchemy ORM

---

## 🚧 Roadmap

### 🎯 Sprint 2 *(Planned)*
- [ ] Pull request analytics
- [ ] Team collaboration metrics
- [ ] Advanced data visualizations
- [ ] Real-time notifications

### 🎯 Sprint 3 *(Planned)*
- [ ] AI-powered code reviews
- [ ] Pattern detection
- [ ] Webhook integration
- [ ] Custom dashboards

### 🎯 Future Enhancements
- [ ] Multi-platform support (GitLab, Bitbucket)
- [ ] Mobile app
- [ ] Advanced AI insights
- [ ] Team benchmarking

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. 🍴 Fork the repository
2. 🌿 Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. 📤 Push to the branch (`git push origin feature/AmazingFeature`)
5. 🔀 Open a Pull Request

### Development Guidelines

- Follow PEP 8 for Python code
- Use TypeScript for all frontend code
- Write tests for new features
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**GitArena Development Team**

Made with ❤️ by developers, for developers.

---

## 📞 Support

Having issues? We're here to help!

- 📧 **Email**: support@gitarena.dev
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/Efrat-Wilinger/-GitArena/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Efrat-Wilinger/-GitArena/discussions)

---

<div align="center">

### 🌟 Star us on GitHub!

If you find GitArena useful, please consider giving it a star ⭐

**Sprint 1 Status**: ✅ **Complete**

[⬆ Back to Top](#️-gitarena)

</div>
