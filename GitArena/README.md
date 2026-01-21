<div align="center">

# 🏟️ GitArena

### The Ultimate Gamified GitHub Analytics & AI Platform

*Level up your development workflow with AI insights, gamification, and deep analytics.*

![Status](https://img.shields.io/badge/Status-Online-success?style=for-the-badge&logo=statuspage)
![Stack](https://img.shields.io/badge/Stack-Fullstack-blue?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/Efrat-Wilinger/-GitArena)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

[Features](#-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture--schema) • [Team](#-team)

</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Quick Start](#-quick-start)
- [Features](#-features)
- [Gamification](#-gamification)
- [AI Capabilities](#-ai-capabilities)
- [Architecture & Schema](#%EF%B8%8F-architecture--schema)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Development](#-development)
- [Contributing](#-contributing)

---

## 🎯 About

**GitArena** is not just an analytics tool; it's a **developer experience platform**. By combining detailed GitHub analytics with **gamification mechanics** and **AI-driven insights**, GitArena turns code contribution into an engaging, rewarding, and highly productive experience.

Whether you're an individual developer looking to track your growth or a manager aiming to boost team velocity without burnout, GitArena provides the tools you need.

---

## 🚀 Quick Start

### Prerequisites
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) 🐳
*   [Node.js 20+](https://nodejs.org/) (for local dev without Docker)
*   GitHub OAuth App Credentials 🔑

### 1️⃣ Setup GitHub OAuth App (Optional)
> [!NOTE]
> This step is only necessary if you don't already have a configured `.env` file with GitHub secrets.

1. Navigate to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in the details:
   ```
   Application name: GitArena
   Homepage URL: http://localhost:3000
   Authorization callback URL: http://localhost:3000/auth/callback
   ```
4. Copy your **Client ID** and generate a **Client Secret**.

### 2️⃣ Clone & Configure
```bash
git clone <repo_url>
cd GitArena
```

### 3️⃣ Configure Environment
You need to set up the environment variables for the Root directory, Backend, and Frontend.

**Root Configuration (`/.env`):**
```bash
cp .env.example .env
# Contains shared secrets and Docker orchestration config
```

**Backend Server (`/backend/.env`):**
```bash
cd backend
cp .env.example .env
# Edit .env with your DATABASE_URL and GITHUB credentials
```

**Frontend App (`/frontend/.env`):**
```bash
cd ../frontend
cp .env.example .env
# Edit .env and ensure VITE_API_URL=http://localhost:8000
```

### 4️⃣ Launch with Docker
```bash
cd ..
docker-compose up --build -d
```
*   Wait a few minutes for the build to complete.
*   The database will automatically initialize.

### 5️⃣ Access the Application
| Service | URL | Description |
|---------|-----|-------------|
| 🌐 **Frontend** | http://localhost:3000 | Main application |
| 🔧 **Backend API** | http://localhost:8000 | REST API |
| 📚 **API Docs** | http://localhost:8000/docs | Interactive API documentation |
| 🗄️ **Database Admin** | http://localhost:5050 | PGAdmin (Login: `efrat.wilinger@gmail.com` / `12345`) |

---

## ✨ Features

### 🎮 Gamification Engine
*   **XP & Leveling System**: Earn XP for every commit, PR, and code review. Level up your profile!
*   **Achievements & Badges**: Unlock badges like "Bug Hunter", "Code Ninja", and more.
*   **Quests**: Complete daily and weekly quests to earn bonus rewards.
*   **Leaderboards**: Compete with your team to see who's the top contributor.

### 🤖 AI-Powered Insights
*   **Personalized Mentor**: AI evaluates your coding patterns and suggests improvements.
*   **Code Quality Analysis**: Get automated feedback on your PRs and commits.
*   **Smart Recommendations**: Discover areas for growth based on your historic data.

### 💼 Professional Workflow
*   **Unified "My Work" Dashboard**: View all your assigned Issues, PRs, and Reviews in one place.
*   **Task Management**: Create and manage GitHub Issues directly from GitArena.
*   **Bento Grid UI**: A modern, responsive, and customizable dashboard layout.

### 📊 Deep Analytics
*   **Repository Insights**: Track commit history, language distribution, and velocity.
*   **Team Metrics**: Understand collaboration efficacy (Manager View).
*   **DORA Metrics**: Measure deployment frequency and lead time for changes.

---

## 🏗️ Architecture & Schema

### ⚡ System Architecture
The system runs on a containerized microservices-like architecture managed by Docker Compose.

```mermaid
graph TD
    subgraph Client ["Client Side"]
        Browser["User Browser"]
    end

    subgraph Docker ["Docker Environment"]
        FE["Frontend Container (React/Vite)"]
        BE["Backend Container (FastAPI)"]
        DB[("PostgreSQL Database")]
        PG["PGAdmin (DB Management)"]
    end

    subgraph External ["External Services"]
        GH["GitHub API"]
        AI["AI Service / LLM"]
    end

    Browser -->|HTTP/3000| FE
    FE -->|API/8000| BE
    
    BE -->|SQL/5432| DB
    PG -->|SQL/5432| DB
    
    BE -->|REST| GH
    BE -->|REST| AI
    
    style FE fill:#61dafb,stroke:#333,color:#000
    style BE fill:#009688,stroke:#333,color:#fff
    style DB fill:#336791,stroke:#333,color:#fff
    style AI fill:#000000,stroke:#333,color:#fff
    style GH fill:#24292e,stroke:#333,color:#fff
```

### 🧠 Database Schema (ERD)
A live visualization of our data relationships. The `User` is at the center, managing `Spaces` and contributing to `Repositories`.

```mermaid
erDiagram
    User ||--o{ Space : owns
    User ||--o{ SpaceMember : has_membership
    User ||--o{ Repository : owns
    User ||--o{ AIFeedback : receives
    User ||--o{ GamificationStats : has
    User ||--o{ UserAchievement : earns

    Space ||--o{ SpaceMember : contains
    Space ||--o{ Repository : manages
    Space ||--o{ Quest : tracks

    Repository ||--o{ Commit : tracks
    Repository ||--o{ PullRequest : contains
    Repository ||--o{ Issue : tracks
    Repository ||--o{ Release : has
    Repository ||--o{ Deployment : has
    Repository ||--o{ AnalyticsActivity : metrics

    GamificationStats ||--o{ UserAchievement : tracks

    User {
        int id
        string username
        string role
        string github_login
    }

    GamificationStats {
        int id
        int current_xp
        int level
        int streak_days
    }
```

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
- ![OpenAI](https://img.shields.io/badge/OpenAI-API-412991?logo=openai&logoColor=white) **AI Integration** - Smart analysis

</td>
<td width="50%">

### Frontend
- ![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black) **React 18** - UI framework
- ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white) **TypeScript** - Type safety
- ![Vite](https://img.shields.io/badge/Vite-Latest-646CFF?logo=vite&logoColor=white) **Vite** - Lightning-fast builds
- ![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss&logoColor=white) **TailwindCSS** - Utility-first styling
- ![Recharts](https://img.shields.io/badge/Recharts-Visualization-8884d8) **Recharts** - Data visualization
- ![React Query](https://img.shields.io/badge/React_Query-Data_Fetching-FF4154?logo=react-query&logoColor=white) **TanStack Query** - State management

</td>
</tr>
</table>

---

## 📁 Project Structure

```
GitArena/
│
├── 🔙 backend/                    # Python FastAPI Backend
│   ├── app/
│   │   ├── modules/              # Domain modules (users, analytics, gamification, ai)
│   │   ├── shared/               # Shared logic (DB, Auth, Models)
│   │   └── main.py               # App entry
│   └── tests/                    # Backend tests
│
├── 🎨 frontend/                   # React TypeScript Frontend
│   ├── src/
│   │   ├── api/                  # API clients
│   │   ├── components/           # Reusable UI & Bento Grid components
│   │   └── pages/                # Route pages (Member, Manager, etc.)
│   └── Dockerfile
│
├── 🐳 docker-compose.yml         # Container orchestration
└── 📖 README.md                  # You are here!
```

---

## 📚 API Documentation

### 🔐 Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/github/login` | Initiate GitHub OAuth flow |
| `GET` | `/auth/github/callback` | OAuth callback handler |

### 🎮 Gamification
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/gamification/stats` | Get user XP, level, and stats |
| `GET` | `/gamification/challenges` | Get active quests and challenges |

### 📊 Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/analytics/dashboard` | Get dashboard statistics |
| `GET` | `/analytics/activity` | Get activity metrics |
| `GET` | `/analytics/manager/team` | Get team performance stats |

> 💡 **Tip**: Visit [http://localhost:8000/docs](http://localhost:8000/docs) for full interactive documentation.

---

## 💻 Development

### Running Without Docker

#### Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Testing

We use **Playwright** for End-to-End (E2E) system testing to ensure the platform works as expected.

### Prerequisites
*   Ensure the **Backend** (`localhost:8000`) and **Frontend** (`localhost:3000`) are running (via Docker or locally).

### 1️⃣ Setup Test Environment
Open a new terminal (keep your servers running!) and navigate to the project root:

```bash
# Activate your backend virtual environment
# Windows:
backend\venv\Scripts\activate
# Mac/Linux:
source backend/venv/bin/activate

# Install Test Dependencies
pip install -r tests/requirements.txt

# Install Playwright Browsers (Required for first run)
playwright install
```

### 2️⃣ Run System Tests
Run the full system test suite. You can run it in "headed" mode to see the browser interactions:

```bash
# Run visually (headed)
pytest tests/test_system_playwright.py --headed

# Run in background (headless)
pytest tests/test_system_playwright.py
```

### 3️⃣ Test Scenarios Covered
*   **Manager Flow**: Login, Project Selection, Dashboard Analytics, Sync Data.
*   **Member Flow**: Login, Restricted Access Verification, Achievements & Stats logic.
*   **System Logic**: Leaderboard placeholders, Numeric validation of XP/Levels.
*   **Projects**: Full creation flow (Form fill, Repo selection, Submission).

---

## 🤝 Contributing

We welcome contributions!
1. 🍴 Fork the repository
2. 🌿 Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. 🔀 Open a Pull Request

---

<div align="center">

### 🌟 Star us on GitHub!

If you find GitArena useful, please consider giving it a star ⭐

[⬆ Back to Top](#️-gitarena)

</div>
