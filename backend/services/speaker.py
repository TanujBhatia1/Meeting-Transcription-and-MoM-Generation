# backend/services/speaker.py
from ai.registry.service_registry import registry

import psycopg2
from psycopg2.extras import Json

class SpeakerID:
    """
    Handles speaker enrollment and identification with pgvector.
    """
    def __init__(self):
        self.encoder = registry.get("speaker")
        self.conn = psycopg2.connect(dbname="meetings", user="user", password="pass")

    def enroll(self, user_id: int, audio_path: str):
        """
        Enroll a new speaker by computing embedding and storing in DB.
        """
        wav, sr = librosa.load(audio_path, sr=16000)
        embed = self.encoder.embed_utterance(wav)
        cur = self.conn.cursor()
        cur.execute("""
            INSERT INTO speakers (user_id, name, embedding) 
            VALUES (%s, %s, %s)
            ON CONFLICT (user_id) DO UPDATE SET embedding=EXCLUDED.embedding;
        """, (user_id, "User"+str(user_id), embed.tolist()))
        self.conn.commit()

    def identify(self, audio_segment):
        """
        Given a short audio segment, return closest enrolled speaker name or None.
        """
        embed = self.encoder.embed_utterance(audio_segment)
        cur = self.conn.cursor()
        cur.execute("""
            SELECT user_id, name FROM speakers 
            ORDER BY embedding <-> %s
            LIMIT 1;
        """, (embed.tolist(),))
        row = cur.fetchone()
        if row:
            return row[1]  # name
        return None
