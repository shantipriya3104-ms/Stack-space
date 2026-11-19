# Architecture

```text
Browser (React + TypeScript)
          |
          | HTTP / JSON (/api)
          v
FastAPI application
   |          |
   |          +---- Optional OpenAI-compatible chat completion API
   |
   +---- Readiness scoring engine
   |
   +---- SQLAlchemy ORM
              |
              v
         SQLite database
```

The frontend is a single-page application. FastAPI validates requests with Pydantic, runs a deterministic scoring engine, optionally requests an AI-written summary, and stores each assessment through SQLAlchemy. SQLite is used for frictionless local setup; a managed PostgreSQL database is a sensible production upgrade.
