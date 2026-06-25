# backend/utils/vad.py
import numpy as np
import torch

class VoiceActivityDetector:
    """
    Uses Silero VAD to extract speech segments.
    """
    def __init__(self):
        self.model, self.utils = torch.hub.load(repo_or_dir='snakers4/silero-vad',
                                               model='silero_vad',
                                               force_reload=False)
        (self.get_speech_ts, 
         _, 
         _, 
         _) = self.utils

    def extract_speech_segments(self, pcm_audio, sample_rate=16000):
        """
        Input: raw PCM 16-bit numpy array. Output: list of (start, end, pcm_segment).
        """
        if isinstance(pcm_audio, (bytes, bytearray)):
            # decode bytes to numpy
            audio = np.frombuffer(pcm_audio, dtype=np.int16).astype(np.float32) / 32768.0
        else:
            audio = pcm_audio  # assume numpy float32
        speech_timestamps = self.get_speech_ts(torch.from_numpy(audio), sample_rate)
        segments = []
        for seg in speech_timestamps:
            start, end = int(seg['start']), int(seg['end'])
            segment_audio = audio[start:end]
            segments.append((start / sample_rate, end / sample_rate, segment_audio))
        return segments
