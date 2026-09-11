# backend/app.py
import os
import logging
from fastapi import FastAPI, WebSocket, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from routers.audio import router as audio_router
from routers.agenda import router as agenda_router
from routers.meetings import router as meetings_router
from routers.chat import router as chat_router

# from services.asr import init_asr_model
from services.summarizer import init_summarizer
# from services.diarization import init_diarization
from ai.registry.service_registry import registry
from ai.registry.provider_factory import ProviderFactory
from ai.config.ai_config import settings


app = FastAPI()
app.include_router(audio_router, prefix="/api")
app.include_router(agenda_router, prefix="/api")
app.include_router(meetings_router, prefix="/api")
app.include_router(chat_router, prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # in prod, limit to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# @app.on_event("startup")
# async def startup_event():
#     logging.basicConfig(level=logging.INFO)
#     logging.info("Loading ASR model...")
#     init_asr_model(model_size="small.en", device="cpu", compute_type="int8")  # quantized faster-whisper
#     logging.info("Loading summarizer LLM (if any)...")
#     init_summarizer()
#     logging.info("Startup complete.")

@app.on_event("startup")
async def startup_event():

    logging.basicConfig(level=logging.INFO)

    logging.info("Initializing AI Registry...")

    registry.register(
        "llm",
        ProviderFactory.create_llm(settings)
    )

    registry.register(
        "asr",
        ProviderFactory.create_asr(settings)
    )

    app.state.registry = registry

    logging.info("AI Registry initialized.")
