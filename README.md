# 🏟️ GitArena

> **Where Code Meets Gaming.** Transform your development workflow into an immersive RPG experience.

![Status](https://img.shields.io/badge/Status-Online-success?style=for-the-badge&logo=statuspage)
![Stack](https://img.shields.io/badge/Stack-Fullstack-blue?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)

---

## 🌟 Introduction

**GitArena** isn't just a dashboard; it's a **productivity engine**. By Gamifying the software development lifecycle, we turn every commit, pull request, and code review into a quest for excellence.

Elevate your engineering team's performance with:
*   **XP & Leveling System**: Get rewarded for consistent, high-quality contributions.
*   **AI Dungeon Master**: Our LLM-powered engine analyzes your code and provides "loot" (insights) and "quests" (challenges).
*   **Team Raids**: Collaborate to clear technical debt and ship features.

---

## 🏗️ Architecture & Schema

We believe in **Transparent Architecture**. Here is the blueprint of our world.

### 🧠 The Neural Core (Database Schema)

A live visualization of our data relationships. The `User` is at the center of the universe, commanding `Repositories` and joining `Spaces`.

```mermaid
erDiagram
    User ||--o{ Repository : owns
    User ||--o{ Space : owns
    User ||--o{ Commit : authors
    User ||--o{ PullRequest : creates
    User ||--o{ Issue : opens
    
    Space ||--o{ SpaceMember : contains
    Space ||--o{ Repository : manages
    
    Repository ||--o{ Commit : tracks
    Repository ||--o{ PullRequest : receives
    Repository ||--o{ Issue : lists
    Repository ||--o{ Release : publishes
    Repository ||--o{ Deployment : deploys
    
    PullRequest ||--o{ Review : has
    
    User {
        int id
        string username
        string github_login
        int level
        int xp
    }
    
    Repository {
        int id
        string name
        string language
        int stars
    }
    
    Space {
        int id
        string name
        string description
    }
```

### ⚡ System Flow

How data flows from GitHub to your screen:

```mermaid
graph LR
    GH[GitHub API] -->|Sync| BE[Backend Service]
    BE -->|Store| DB[(PostgreSQL)]
    BE -->|Analyze| AI[OpenAI / LLM]
    AI -->|Insights| DB
    BE -->|Serve| FE[React Frontend]
    FE -->|Visualize| User[Developer]
    
    style GH fill:#333,stroke:#fff,color:#fff
    style BE fill:#2d6a4f,stroke:#fff,color:#fff
    style DB fill:#0077b6,stroke:#fff,color:#fff
    style AI fill:#d00000,stroke:#fff,color:#fff
    style FE fill:#e0aaff,stroke:#333,color:#000
```

---

## 🚀 Speed Run (Quick Start)

Get access to the arena in less than 5 minutes.

### 📋 Prerequisites
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) 🐳
*   GitHub OAuth App Credentials 🔑

### 🎮 Press Start
1.  **Summon the Code**
    ```bash
    git clone <repo_url>
    cd GitArena
    ```

2.  **Equip Items (Config)**
    ```bash
    # Backend Setup
    cd backend
    cp .env.example .env
    # EDIT .env with your keys!
    
    # Frontend Setup
    cd ../frontend
    cp .env.example .env
    ```

3.  **Launch Server**
    ```bash
    cd ..
    docker-compose up --build
    ```

4.  **Enter the Arena**
    *   **Frontend**: [http://localhost:3000](http://localhost:3000)
    *   **Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## � Workflow: Database Migrations

Keep the realm synchronized. We use **Alembic** for schema evolution.

> **Visual Guide**: `Model Change` -> `Migration Script` -> `Apply to DB`

### How to Introduce New Content (Tables/Columns)

1.  **Design**: Edit `backend/app/shared/models.py`.
2.  **Manifest**: Create the migration spell.
    ```bash
    # Inside backend container/venv
    alembic revision --autogenerate -m "Summon new table"
    ```
3.  **Sync**: Push the new file in `migrations/versions/` to Git.
4.  **Refresh**: Restart your container to apply.

---

## 🛠️ The Armory (Tech Stack)

| Component | Tech | Description |
|-----------|------|-------------|
| **Core** | ![Python](https://img.shields.io/badge/Python-3.12-blue) | The brain of the operation. |
| **API** | ![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green) | High-speed magic. |
| **UI** | ![React](https://img.shields.io/badge/React-18-cyan) | Reactive crystalline interface. |
| **Data** | ![Postgres](https://img.shields.io/badge/PostgreSQL-16-blue) | Persistent memory vault. |
| **Infra** | ![Docker](https://img.shields.io/badge/Docker-Compose-blue) | Containerized deployment units. |

---

## 🤝 Join the Party

We are looking for contributors!
1.  Fork the Quest.
2.  Create your Feature Branch (`git checkout -b feature/EpicLoot`).
3.  Commit your Changes (`git commit -m 'Add EpicLoot'`).
4.  Push to the Branch (`git push origin feature/EpicLoot`).
5.  Open a Pull Request.

---

<p align="center">
  Made with ⚔️ and 🛡️ by the <b>GitArena Team</b>
</p>
