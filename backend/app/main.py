import json
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from .database import Base, engine, get_db
from .models import Assessment
from .scoring import evaluate
from .schemas import AssessmentCreate, ChatRequest
from .ai import create_ai_summary, chat_with_ai

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(title="StackSpace API", version="1.0.0", description="AI-assisted cloud deployment readiness analyzer.", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Content-Type"],
)

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "StackSpace API"}
@app.post("/api/chat")
async def chat(payload: ChatRequest):
    messages = [
        message.model_dump()
        for message in payload.messages
    ]

    if messages[-1]["role"] != "user":
        raise HTTPException(
            status_code=400,
            detail="The latest message must be from the user."
        )

    try:
        reply = await chat_with_ai(messages)
        return {"reply": reply}

    except ValueError as exc:
        raise HTTPException(
            status_code=503,
            detail=str(exc)
        )

    except Exception as exc:
        print("AI CHAT ERROR:", repr(exc))
        raise HTTPException(
            status_code=502,
            detail=str(exc)
      )
def serialize(item: Assessment):
    return {
        "id": item.id, "project_name": item.project_name, "project_type": item.project_type,
        "stack": item.stack, "score": item.score, "level": item.level,
        "categories": json.loads(item.categories_json),
        "recommendations": json.loads(item.recommendations_json),
        "ai_summary": item.ai_summary,
        "created_at": item.created_at.isoformat(),
    }

@app.post("/api/assessments")
async def create_assessment(payload: AssessmentCreate, db: Session = Depends(get_db)):
    data = payload.model_dump()
    score, level, categories, recommendations = evaluate(data)
    summary = await create_ai_summary(payload.project_name, payload.project_type, payload.stack, score, recommendations)
    item = Assessment(
        project_name=payload.project_name, project_type=payload.project_type, stack=payload.stack,
        score=score, level=level, categories_json=json.dumps(categories),
        recommendations_json=json.dumps(recommendations), ai_summary=summary,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return serialize(item)

@app.get("/api/assessments")
def list_assessments(db: Session = Depends(get_db)):
    return [serialize(item) for item in db.query(Assessment).order_by(Assessment.id.desc()).limit(50).all()]

@app.get("/api/assessments/{assessment_id}")
def get_assessment(assessment_id: int, db: Session = Depends(get_db)):
    item = db.get(Assessment, assessment_id)
    if not item:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return serialize(item)

@app.delete("/api/assessments/{assessment_id}")
def delete_assessment(assessment_id: int, db: Session = Depends(get_db)):
    item = db.get(Assessment, assessment_id)
    if not item:
        raise HTTPException(status_code=404, detail="Assessment not found")
    db.delete(item)
    db.commit()
    return {"deleted": True}

# In Docker, serve the production-built React app from FastAPI.
frontend_dist = Path(__file__).resolve().parents[2] / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")
