from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .hindsight import recall_memories
from .llm import generate_meeting_brief


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class MeetingPrepRequest(BaseModel):
    contact_name: str


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/meeting-prep")
def meeting_prep(request: MeetingPrepRequest):
    query = (
        f"Previous meetings, discussions, commitments, preferences, "
        f"concerns, and follow-ups involving {request.contact_name}"
    )

    memories = recall_memories(query)

    first_name = request.contact_name.split()[0].lower()
    full_name = request.contact_name.lower()

    # Keep only memories directly related to the selected contact.
    filtered_memories = []

    for memory in memories:
        memory_lower = memory.lower()

        if full_name in memory_lower or first_name in memory_lower:
            filtered_memories.append(memory)

    # Remove duplicate memories while preserving order.
    memories = list(dict.fromkeys(filtered_memories))

    brief = generate_meeting_brief(
        request.contact_name,
        memories
    )

    return {
        "contact_name": request.contact_name,
        "memories": memories,
        "brief": brief,
    }
