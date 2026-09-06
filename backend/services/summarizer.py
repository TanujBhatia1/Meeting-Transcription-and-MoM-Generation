# backend/services/summarizer.py
from ai.registry.service_registry import registry

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
        llm = registry.get("llm")

        summary = llm.generate(

            system_prompt="You are a meeting assistant.",

            user_prompt=prompt

        )

    def finalize_mom(self):
        """
        Produce final Meeting Minutes (MoM).
        """
        prompt = f"You are a professional meeting assistant. Generate a detailed meeting summary and MoM from:\n{self.history}"
        
        llm = registry.get("llm")

        summary = llm.generate(

            system_prompt="You are a mom generator assistant.",

            user_prompt=prompt

        )
        return summary

