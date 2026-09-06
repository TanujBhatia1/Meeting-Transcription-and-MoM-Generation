# backend/services/asr.py
from ai.registry.service_registry import registry


def transcribe_chunk(audio):

    model = registry.get("asr")

    return model.transcribe(audio)
