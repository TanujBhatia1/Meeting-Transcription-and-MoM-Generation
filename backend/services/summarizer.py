# backend/services/summarizer.py
import os
from llama_cpp import Llama
import openai

llm = None

def init_summarizer():
    global llm
    model_path = os.getenv("LLAMA_MODEL_PATH")
    if model_path:
        # Initialize local LLaMA model (quantized gguf)
        llm = Llama(model_path=model_path, n_threads=4)
    else:
        llm = None
        openai.api_key = os.getenv("OPENAI_API_KEY")  # optional

class Summarizer:
    """
    Builds incremental summaries using a local LLM or external API.
    """
    def __init__(self):
        self.history = ""  # accumulate transcript
        self.last_summary = ""

    def add_transcript(self, start, end, text, speaker):
        """
        Append new transcript piece and update summary if needed.
        """
        entry = f"{speaker}: {text}\n"
        self.history += entry
        # Optionally trigger summarization periodically
        if len(self.history.split()) > 200:  # e.g., every ~200 words
            self.summarize_incremental()

    def summarize_incremental(self):
        prompt = (
            "You are a meeting assistant. Summarize the recent discussion.\n"
            f"{self.history}\n"
            "Return JSON with keys: Discussion, Decisions, Action Items.\n"
        )
        if llm:
            result = llm(prompt, max_tokens=150, stop=["\n\n"])
            summary = result['choices'][0]['text']
        else:
            # Fallback: external API (OpenAI or dummy)
            try:
                resp = openai.ChatCompletion.create(
                    model="gpt-4",
                    messages=[
                        {"role": "system", "content": "You are a meeting assistant."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=150
                )
                summary = resp.choices[0].message.content
            except Exception:
                summary = "ERROR: LLM not available"
        self.last_summary = summary
        # Reset history if desired, or keep accumulating
        return summary

    def finalize_mom(self):
        """
        Produce final Meeting Minutes (MoM).
        """
        prompt = f"You are a professional meeting assistant. Generate a detailed meeting summary and MoM from:\n{self.history}"
        # Similar calling logic as above
        # ...
        return "Final MoM (mock) - see transcripts."

