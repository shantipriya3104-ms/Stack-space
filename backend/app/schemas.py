from pydantic import BaseModel, Field
from typing import Literal

class AssessmentCreate(BaseModel):
    project_name: str = Field(min_length=2, max_length=120)
    project_type: Literal["Web application", "API / Backend", "Mobile application", "Data / AI platform", "Other"]
    stack: str = Field(default="", max_length=300)
    has_tests: bool = False
    has_ci: bool = False
    has_docker: bool = False
    has_monitoring: bool = False
    has_logging: bool = False
    has_https: bool = False
    has_secrets_management: bool = False
    has_backups: bool = False
    has_health_checks: bool = False
    has_scaling_plan: bool = False

class AssessmentOut(BaseModel):
    id: int
    project_name: str
    project_type: str
    stack: str
    score: int
    level: str
    categories: dict
    recommendations: list[str]
    ai_summary: str
    created_at: str
class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(min_length=1, max_length=20)