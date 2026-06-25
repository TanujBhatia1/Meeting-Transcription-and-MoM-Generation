# backend/services/asr.py
from faster_whisper import WhisperModel

asr_model = None

def init_asr_model(model_size="small.en", device="cpu", compute_type="int8"):
    global asr_model
    # Initialize Faster-Whisper model (quantized)
    asr_model = WhisperModel(model_size, device=device, compute_type=compute_type)

def transcribe_chunk(audio_samples):
    """
    Transcribe a short PCM audio array (16kHz mono) and return text.
    """
    global asr_model
    # faster-whisper expects a numpy array or file, we assume array here
    segments, _ = asr_model.transcribe(audio_samples, beam_size=5)
    # Concatenate text
    text = " ".join([seg.text for seg in segments])
    return text
