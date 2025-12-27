"""FastAPI bridge exposing the Thirukkural agent over HTTP."""

from typing import Any, Dict, List, Optional
import uvicorn

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from api_req import get_agent_state, run_agent_inference

app = FastAPI(
    title="Thirukkural AI Agent API",
    description="HTTP interface for the Vertex-backed Thirukkural agent",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PersonalityProfile(BaseModel):
    type: str
    traits: List[str]
    description: str

class AskRequest(BaseModel):
    question: str = Field(..., description="Free-form user prompt for the agent")
    personality: Optional[PersonalityProfile] = None


class AskResponse(BaseModel):
    question: str
    response: Optional[Dict[str, Any]]
    raw_response: str
    plan: Optional[Dict[str, Any]]
    retrieved_kurals: List[Dict[str, Any]]


@app.on_event("startup")
def _warm_state() -> None:
    """Eagerly initialize the Vertex client and retriever."""
    get_agent_state()


@app.get("/health", tags=["meta"])
def healthcheck() -> Dict[str, str]:
    return {"status": "ok"}


@app.post("/api/v1/ask", response_model=AskResponse)
def ask_agent(request: AskRequest) -> AskResponse:  # type: ignore[valid-type]
    question = request.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    try:
        # Pass personality to the inference engine
        personality_dict = request.personality.dict() if request.personality else None
        result = run_agent_inference(question, personality_dict)
    except ValueError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - safeguards unexpected SDK errors
        raise HTTPException(status_code=502, detail=f"Model invocation failed: {exc}") from exc

    return AskResponse(**result)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

