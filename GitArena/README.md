# GitArena

GitArena is a GitHub Analytics and AI Platform that helps developers and teams gain insights from their GitHub repositories.

## 🚀 Sprint 1 Features

### Implemented Stories
- **Story 205**: GitHub OAuth Login with JWT authentication
- **Story 207**: Repository selection and synchronization from GitHub
- **Story 210**: Commit pulling and daily sync (cron stub)
- **Story 212**: Basic user profile page
- **Story 239**: Docker Compose setup
- **Story 249**: Git repository initialization

### Dashboard Queries
- Count tasks by status
- Count tasks by assignee
- Count stories in Sprint 1
- Count commits fetched
- Count registered users

## 📁 Project Structure

```
GitArena/
├── backend/
│   ├── app/
│   │   ├── modules/
│   │   │   ├── github/         # GitHub integration
│   │   │   │   ├── controller.py
│   │   │   │   ├── service.py
│   │   │   │   ├── repository.py
│   │   │   │   └── dto.py
│   │   │   ├── users/          # User management
│   │   │   │   ├── controller.py
│   │   │   │   ├── auth_controller.py
│   │   │   │   ├── service.py
│   │   │   │   ├── repository.py
│   │   │   │   └── dto.py
│   │   │   ├── analytics/      # Analytics & dashboard
│   │   │   │   ├── controller.py
│   │   │   │   ├── service.py
│   │   │   │   ├── repository.py
│   │   │   │   └── dto.py
│   │   │   └── ai/             # AI features (placeholder)
│   │   │       ├── controller.py
│   │   │       ├── service.py
│   │   │       ├── repository.py
│   │   │       └── dto.py
│   │   ├── shared/
│   │   │   ├── database.py     # Database connection
│   │   │   ├── models.py       # SQLAlchemy models
│   │   │   ├── security.py     # JWT & auth utilities
│   │   │   ├── exceptions.py   # Custom exceptions
│   │   │   └── middleware.py   # Error handling
│   │   ├── config/
│   │   │   └── settings.py     # Configuration
│   │   └── main.py             # FastAPI application
│   ├── migrations/             # Alembic migrations
│   ├── devops/
│   │   └── cron_sync.py        # Daily sync job (stub)
│   ├── tests/
│   │   └── test_main.py        # Unit tests
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/                # API client
│   │   │   ├── client.ts
│   │   │   ├── auth.ts
│   │   │   └── github.ts
│   │   ├── components/
│   │   │   └── Layout.tsx
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── CallbackPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── RepositoriesPage.tsx
│   │   │   └── CommitsPage.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── Dockerfile
│   └── nginx.conf
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🛠️ Technology Stack

### Backend
- **Framework**: FastAPI (Python 3.12)
- **ORM**: SQLAlchemy
- **Database**: PostgreSQL
- **Migrations**: Alembic
- **Authentication**: JWT (python-jose)
- **Testing**: pytest

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: React Query
- **Charts**: Recharts
- **HTTP Client**: Axios

### DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **CI/CD**: GitHub Actions

## 🚀 Getting Started

### Prerequisites
- Docker and Docker Compose
- GitHub OAuth App credentials

### Setup GitHub OAuth App

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create a new OAuth App with:
   - **Application name**: GitArena
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/auth/callback`
3. Copy the Client ID and Client Secret

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd GitArena
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your GitHub OAuth credentials:
   ```
   GITHUB_CLIENT_ID=your-client-id
   GITHUB_CLIENT_SECRET=your-client-secret
   SECRET_KEY=your-secret-key
   ```

3. **Start the application**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Development Setup (Without Docker)

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your credentials
alembic upgrade head
uvicorn app.main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
# Create .env.local with:
# VITE_API_URL=http://localhost:8000
# VITE_GITHUB_CLIENT_ID=your-client-id
npm run dev
```

## 📊 Database Schema

### Core Tables
- **users**: User accounts with GitHub integration
- **spaces**: Organizational spaces for repositories
- **repositories**: GitHub repositories
- **commits**: Repository commits
- **pull_requests**: Pull requests
- **reviews**: PR reviews

### Analytics Tables
- **analytics_activity**: User activity metrics
- **analytics_quality**: Code quality metrics
- **analytics_collaboration**: Collaboration metrics
- **ai_feedback**: AI-generated insights

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Build
```bash
cd frontend
npm run build
```

## 📝 API Endpoints

### Authentication
- `POST /auth/github/login` - GitHub OAuth login
- `GET /auth/github/callback` - OAuth callback

### Users
- `GET /users/me` - Get current user profile
- `GET /users/{user_id}` - Get user by ID

### GitHub
- `GET /github/repos` - Get user repositories (with optional sync)
- `GET /github/repos/{repo_id}/commits` - Get repository commits

### Analytics
- `GET /analytics/dashboard` - Get dashboard statistics

### AI
- `POST /ai/code-review` - Get AI code review (placeholder)

## 🔒 Security

- JWT-based authentication
- GitHub OAuth integration
- Secure password hashing (bcrypt)
- CORS configuration
- Environment-based secrets

## 📈 Future Enhancements (Post Sprint 1)

- Pull request analytics
- Team collaboration metrics
- AI-powered code reviews
- Advanced visualizations
- Real-time notifications
- Webhook integration

## 🤝 Contributing

This is Sprint 1 implementation. Future sprints will add more features.

## 📄 License

[Add your license here]

## 👥 Team

GitArena Development Team

---

**Sprint 1 Status**: ✅ Complete
