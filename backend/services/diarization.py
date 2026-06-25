# backend/services/diarization.py
import os
from diarize import diarize as run_diarize

class Diarizer:
    """
    Wraps FoxNoseTech's diarize (CPU-only diarization).
    """
    def __init__(self):
        pass

    def process_file(self, filename):
        """
        Run diarization on a WAV/PCM file and return list of segments.
        Each segment has .start, .end, .speaker attributes.
        """
        result = run_diarize(filename)
        return result.segments  # list of segments with .start, .end, .speaker

    def process_array(self, audio_samples, sample_rate=16000):
        """
        If needed, write array to temp file and diarize.
        """
        temp_path = "temp_meeting.wav"
        # Write audio_samples (numpy) to WAV file (not shown for brevity)
        # ...
        segments = run_diarize(temp_path).segments
        os.remove(temp_path)
        return segments

def init_diarization():
    """
    If any one-time setup is needed for diarize.
    """
    # e.g., download models if necessary
    return
