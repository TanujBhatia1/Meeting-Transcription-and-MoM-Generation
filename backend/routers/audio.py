# backend/routers/audio.py
import io, time
from uuid import UUID
from fastapi import Query
from fastapi import APIRouter, WebSocket, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from services.asr import transcribe_chunk
from services.diarization import Diarizer
from services.speaker import SpeakerID
from services.summarizer import Summarizer
from utils.vad import VoiceActivityDetector

router = APIRouter()
auth = HTTPBearer()  # Token-based auth (bearer)

@router.websocket("/ws/asr")
async def asr_websocket( websocket: WebSocket, meeting_id: UUID = Query(...)):
    await websocket.accept()
    # Validate meeting_id and user permissions here.
    
    vad = VoiceActivityDetector()
    speaker_id = SpeakerID()      # handles enrollment lookup
    diar = Diarizer()            # can accumulate or run at end
    summarizer = Summarizer()    # incremental summarizer
    
    buffer = b""  # holds raw audio bytes
    try:
        while True:
            data = await websocket.receive_bytes()
            buffer += data
            # Here we assume the client sends small audio blobs (e.g. 250ms). 
            # We decode them to PCM (using PyAV/ffmpeg under the hood, not shown).
            # For brevity, assume data is raw PCM samples at 16kHz:
            pcm_samples = data  # in practice, decode if containerized
            
            # Voice Activity Detection
            speech_segments = vad.extract_speech_segments(pcm_samples)
            for seg in speech_segments:
                # seg: (start_time, end_time, pcm_array)
                start, end, audio = seg
                # ASR transcription
                text = transcribe_chunk(audio)  # string
                timestamp = time.time()
                # Optionally attach speaker from diarization (placeholder)
                speaker = None
                # Send partial transcript back
                await websocket.send_json({
                    "timestamp": timestamp,
                    "start": start, "end": end,
                    "speaker": speaker or "Speaker?",
                    "text": text
                })
                # Buffer transcripts in Summarizer
                summarizer.add_transcript(start, end, text, speaker or "Speaker?")
            
            # Periodically, we could trigger diarization or summarization here
            # (For simplicity, summarizer runs every N secs internally)
    except Exception as e:
        await websocket.close()
