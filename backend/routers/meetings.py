# backend/routers/meetings.py
from datetime import datetime
from uuid import uuid4

from pydantic import BaseModel, Field
from fastapi import APIRouter, BackgroundTasks
from services.mom_generator import MoMGenerator
from services.rag_chatbot import RAGChatbot

router = APIRouter()
mom_gen = MoMGenerator()
rag = RAGChatbot()



class MeetingCreate(BaseModel):
    title: str
    agenda: dict = Field(default_factory=dict)
    meeting_date: datetime | None = None


@router.post("/meetings")
async def create_meeting(payload: MeetingCreate):
    meeting_id = str(uuid4())

    # Replace this with a database insert.
    return {
        "id": meeting_id,
        "title": payload.title,
        "agenda": payload.agenda,
        "meeting_date": payload.meeting_date,
        "status": "created",
    }
    
    
def generate_mom_task(meeting_id: str, transcript: str, agenda: dict, diarization: list):
    mom = mom_gen.generate_mom(transcript, agenda, diarization)
    rag.store_mom(meeting_id, mom)

@router.post("/meetings/{meeting_id}/generate-mom")
async def trigger_mom(meeting_id: str, background_tasks: BackgroundTasks):
    # Fetch transcript, agenda, diarization from DB (not shown)
    transcript = "..."  # placeholder
    agenda = {"title": "Sprint Review", "agenda_items": ["Demo", "Blockers"]}
    diarization = []
    background_tasks.add_task(generate_mom_task, meeting_id, transcript, agenda, diarization)
    return {"status": "processing", "meeting_id": meeting_id}