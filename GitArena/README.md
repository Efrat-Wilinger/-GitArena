# GitArena 🏟️

GitArena is a gamified analytics platform for GitHub repositories. It turns your coding activity into a game, tracking stats, achievements, and providing AI-driven insights.

## 🚀 Quick Start (Recommended)

The easiest way to run the project is using Docker Compose.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository_url>
   cd GitArena
   ```

2. **Environment Setup**
   * **Backend**: Copy `.env.example` to `.env` in the `backend` folder.
     ```bash
     cd backend
     cp .env.example .env
     ```
     Edit `.env` and add your `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and `OPENAI_API_KEY`.
   
   * **Frontend**: Copy `.env.example` to `.env` in the `frontend` folder (if applicable) or ensure `VITE_API_TARGET` is set in `docker-compose.yml`.

3. **Run with Docker**
   Return to the root directory and run:
   ```bash
   docker-compose up --build
   ```

4. **Access the App**
   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **Backend API**: [http://localhost:8000/docs](http://localhost:8000/docs)
   - **PgAdmin (Database UI)**: [http://localhost:5050](http://localhost:5050)
     - Email: `efrat.wilinger@gmail.com`
     - Password: `12345`

---

## 🛠️ Database Setup & Troubleshooting

### "Failed to load commits" Error
If you see an error about `UndefinedColumn` or "Failed to load commits" (specifically missing `diff_data`), it means your database schema needs to be updated.

**Fix:**
Run the following command in a new terminal window (while Docker is running):

```bash
docker-compose exec backend python add_diff_column.py
```

This script will automatically detect and add the missing column to your database.

---

## 💻 Local Development (Manual)

If you prefer running without Docker:

### Backend
1. Python 3.12+ required.
2. Navigate to `backend`.
3. Create venv: `python -m venv venv` and activate it.
4. Install reqs: `pip install -r requirements.txt`.
5. Ensure PostgreSQL is running locally.
6. Run: `python run.py` (or `uvicorn app.main:app --reload`).

### Frontend
1. Node.js 18+ required.
2. Navigate to `frontend`.
3. Install: `npm install`.
4. Run: `npm run dev`.

## 🤝 Contributing
1. Create a branch.
2. Make changes.
3. Submit a Pull Request.

## 📄 API Documentation
Full API documentation is available at [http://localhost:8000/docs](http://localhost:8000/docs) when the backend is running.
