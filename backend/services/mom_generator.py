# backend/services/mom_generator.py
import os
from typing import List, Dict
from llama_cpp import Llama

class MoMGenerator:
    def __init__(self):
        model_path = os.getenv("LLAMA_MODEL_PATH")  # e.g., Qwen 7B GGUF
        self.llm = Llama(model_path=model_path, n_threads=4, n_ctx=4096) if model_path else None

    def generate_mom(self, transcript: str, agenda: Dict, diarized_segments: List[Dict]) -> Dict:
        # Build prompt
        agenda_text = "\n".join(agenda.get("agenda_items", []))
        prompt = f"""
                    You are a professional meeting assistant. Generate a structured Meeting Minutes (MoM) document.

                    Meeting Title: {agenda.get('title', 'Untitled')}
                    Agenda Items:
                    {agenda_text}

                    Transcript (with speaker labels):
                    {transcript}

                    Output JSON with keys:
                    - title
                    - date (ISO format)
                    - attendees (list of speaker names)
                    - introduction (1-2 paragraphs)
                    - discussion_points (list of objects: {{agenda_item, summary, key_quotes}})
                    - action_items (list of objects: {{task, owner, deadline}})
                    - conclusion (1 paragraph)
                    """
        if self.llm:
            result = self.llm(prompt, max_tokens=1024, temperature=0.2)
            # Parse JSON from result['choices'][0]['text']
            # (Add robust parsing in production)
            return {"status": "generated", "mom": result}
        else:
            return {"status": "error", "message": "LLM not available"}