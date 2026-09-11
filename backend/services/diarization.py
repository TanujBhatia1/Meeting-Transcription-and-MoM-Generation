# backend/services/diarization.py
import os
from pyannote.audio import Pipeline
from huggingface_hub import login

class Diarizer:
    def __init__(self):
        hf_token = os.getenv("HUGGING_FACE_HUB_TOKEN")
        if hf_token:
            login(token=hf_token)
        self.pipeline = Pipeline.from_pretrained("pyannote/speaker-diarization-3.1")

    def process_file(self, audio_path: str, num_speakers: int = None):
        diarization = self.pipeline(audio_path)
        segments = []
        for turn, _, speaker in diarization.itertracks(yield_label=True):
            segments.append({
                "start": turn.start,
                "end": turn.end,
                "speaker": speaker
            })
        return segments

    def process_array(self, audio_samples, sample_rate=16000):
        # Write to temp WAV, then diarize
        import soundfile as sf
        temp_path = "temp_meeting.wav"
        sf.write(temp_path, audio_samples, sample_rate)
        segments = self.process_file(temp_path)
        os.remove(temp_path)
        return segments

def init_diarization():
    return Diarizer()