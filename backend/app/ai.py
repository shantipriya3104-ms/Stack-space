import os
import httpx
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")


# AI-generated cloud readiness summary
async def create_ai_summary(
    project_name: str,
    project_type: str,
    stack: str,
    score: int,
    recommendations: list[str]
) -> str:

    system_prompt = """
    You are a pragmatic cloud software engineer.
    Explain cloud readiness assessments in 150 words or fewer.
    Prioritize practical improvements.
    """

    prompt = (
        f"Project: {project_name}\n"
        f"Type: {project_type}\n"
        f"Stack: {stack or 'not specified'}\n"
        f"Score: {score}/100\n"
        f"Recommendations: {'; '.join(recommendations)}"
    )

    try:
        async with httpx.AsyncClient(timeout=150) as client:
            response = await client.post(
                "http://localhost:11434/api/chat",
                json={
                    "model": "qwen3:4b",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt}
                    ],
                    "stream": False,
                    "think": False,
                    "options": {
                        "num_predict": 200,
                        "temperature": 0.3
                    }
                }
            )

            response.raise_for_status()

            return response.json()["message"]["content"].strip()

    except Exception as exc:
        print("AI SUMMARY ERROR:", repr(exc))
        return (
            "AI summary unavailable. "
            "Your rule-based recommendations are still available."
        )


# StackSpace AI Chat Assistant
async def chat_with_ai(messages: list[dict[str, str]]) -> str:

    system_prompt = """
    You are StackSpace AI, a helpful software engineering
    and cloud computing assistant.

    Your expertise includes:
    - Software engineering
    - Cloud computing
    - AWS and deployment
    - Docker and Kubernetes
    - CI/CD pipelines
    - DevOps and GitHub Actions
    - APIs and backend development
    - Application security and monitoring

    Give accurate, beginner-friendly answers.
    Keep answers concise and practical.
    Use examples when helpful.
    """

    async with httpx.AsyncClient(timeout=120) as client:

        response = await client.post(
            "http://localhost:11434/api/chat",
            json={
                "model": "qwen3:4b",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    *messages
                ],
                "stream": False,
                "think": False,
                "options": {
                    "num_predict": 150,
                    "temperature": 0.4
                }
            }
        )

        response.raise_for_status()

        return response.json()["message"]["content"].strip()