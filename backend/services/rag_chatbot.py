# backend/services/rag_chatbot.py
import os
import psycopg2
from psycopg2.extras import execute_values
import numpy as np
from sentence_transformers import SentenceTransformer

class RAGChatbot:
    def __init__(self):
        self.conn = psycopg2.connect(
            dbname=os.getenv("DB_NAME", "meetings"),
            user=os.getenv("DB_USER", "user"),
            password=os.getenv("DB_PASS", "pass"),
            host=os.getenv("DB_HOST", "localhost")
        )
        self.embedder = SentenceTransformer("BAAI/bge-large-en-v1.5")

    def store_mom(self, meeting_id: str, mom_json: Dict):
        # Store MoM and embed chunks
        cur = self.conn.cursor()
        cur.execute("""
            INSERT INTO mom_documents (meeting_id, title, content)
            VALUES (%s, %s, %s)
            RETURNING id
        """, (meeting_id, mom_json.get("title"), json.dumps(mom_json)))
        mom_id = cur.fetchone()[0]

        # Chunk MoM text (simple split by sections)
        chunks = self._chunk_mom(mom_json)
        embeddings = self.embedder.encode([c["text"] for c in chunks], convert_to_numpy=True)
        execute_values(cur, """
            INSERT INTO mom_embeddings (mom_id, chunk_text, embedding, metadata)
            VALUES %s
        """, [
            (mom_id, c["text"], embeddings[i].tolist(), json.dumps(c["meta"]))
            for i, c in enumerate(chunks)
        ])
        self.conn.commit()

    def _chunk_mom(self, mom: Dict, max_len: int = 512):
        # Simple chunking by section
        chunks = []
        for section in ["introduction", "discussion_points", "action_items", "conclusion"]:
            text = str(mom.get(section, ""))
            for i in range(0, len(text), max_len):
                chunks.append({
                    "text": text[i:i+max_len],
                    "meta": {"section": section}
                })
        return chunks

    def query(self, question: str, top_k: int = 5):
        # Embed question
        q_emb = self.embedder.encode(question, convert_to_numpy=True)
        cur = self.conn.cursor()
        cur.execute("""
            SELECT chunk_text, metadata, 1 - (embedding <-> %s::vector) AS score
            FROM mom_embeddings
            ORDER BY score DESC
            LIMIT %s
        """, (q_emb.tolist(), top_k))
        results = cur.fetchall()
        context = "\n\n".join([r[0] for r in results])
        return context, results