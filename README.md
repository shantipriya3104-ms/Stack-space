# StackSpace — AI-Powered Cloud Readiness Analyzer

StackSpace is a full-stack developer tool that evaluates how ready a software project is for cloud deployment. It produces a transparent readiness score, identifies missing production practices, and (optionally) uses an LLM to generate tailored recommendations.

It is designed as a practical portfolio project demonstrating:
- React + TypeScript frontend
- Python + FastAPI REST API
- SQLite for local development (easy to run)
- Optional OpenAI-compatible AI integration
- Docker containerization
- Automated tests and GitHub Actions CI

> ** The readiness score is a heuristic, not a security audit or certification. Do not paste secrets,
> credentials, private source code, or sensitive customer data.

## Features

- Create and evaluate project profiles
- Score projects across reliability, security, observability, delivery, and scalability
- View category scores and actionable recommendations
- Save and revisit past assessments
- Optional AI-generated executive summary and recommendations
- Interactive API docs at `/docs`
- Docker support for repeatable deployment

## Quick start (Windows)

### 1. Requirements
- Python 3.11+
- Node.js 20+
- Git

### 2. Start the backend
Open PowerShell in this folder:
powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload

Backend: http://localhost:8000  
API docs: http://localhost:8000/docs

If PowerShell blocks activation, run this once in the same terminal:
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

Or use .venv\Scripts\python.exe -m pip install -r requirements.txt` and `.venv\Scripts\python.exe -m uvicorn app.main:app --reload.

### 3. Start the frontend
Open a **second** PowerShell terminal:
cd frontend
npm install
npm run dev

Frontend: http://localhost:5173

## Optional AI setup

The app works without an AI key. Without one, it generates recommendations using its built-in rules.

To enable AI:
1. Get an API key from an OpenAI-compatible provider.
2. Open `backend/.env`.
3. Set `AI_API_KEY`, `AI_BASE_URL` (if your provider requires a custom endpoint), and `AI_MODEL`.
4. Restart the backend.

## Docker

Then open http://localhost:8000. The FastAPI container serves the built React application and API.

Stop:
bash
docker compose down

## API overview
-------------------------------------------------------------
| Method |       Endpoint          | Purpose                |
|--------|-------------------------|------------------------|
| GET    | `/api/health`           | Health check           |
| POST   | `/api/assessments`      | Create an assessment   |
| GET    | `/api/assessments`      | List saved assessments |
| GET    | `/api/assessments/{id}` | Get one assessment     |
| DELETE | `/api/assessments/{id}` | Delete one assessment  |
-------------------------------------------------------------

## Project structure

stackspace-ai-cloud/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── scoring.py
│   │   └── ai.py
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── .github/workflows/ci.yml
├── Dockerfile
├── docker-compose.yml
└── README.md



**StackSpace is an AI-assisted cloud deployment readiness analyzer built with React, TypeScript, FastAPI, and Docker. It evaluates software projects across production-readiness dimensions and turns gaps into actionable engineering recommendations.**


