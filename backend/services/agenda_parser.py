# backend/services/agenda_parser.py
import os
from typing import List, Dict
import pdfplumber
from docx import Document
import markdown

class AgendaParser:
    def __init__(self):
        pass

    def parse_file(self, file_path: str) -> Dict:
        ext = os.path.splitext(file_path)[1].lower()
        if ext == ".pdf":
            text = self._parse_pdf(file_path)
        elif ext == ".docx":
            text = self._parse_docx(file_path)
        elif ext == ".md":
            text = self._parse_md(file_path)
        else:
            with open(file_path, "r", encoding="utf-8") as f:
                text = f.read()
        return self._extract_agenda_items(text)

    def _parse_pdf(self, path: str) -> str:
        text = ""
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
        return text

    def _parse_docx(self, path: str) -> str:
        doc = Document(path)
        return "\n".join([p.text for p in doc.paragraphs])

    def _parse_md(self, path: str) -> str:
        with open(path, "r", encoding="utf-8") as f:
            md_text = f.read()
        return markdown.markdown(md_text)

    def _extract_agenda_items(self, text: str) -> Dict:
        # Use a small local LLM (e.g., Qwen 7B via llama-cpp) to extract agenda
        # For now, simple heuristic: split by lines with numbers/bullets
        items = []
        for line in text.splitlines():
            line = line.strip()
            if line and (line[0].isdigit() or line.startswith("-")):
                items.append(line.lstrip("0123456789.- "))
        return {
            "raw_text": text,
            "agenda_items": items,
            "title": text.splitlines()[0] if text.splitlines() else "Untitled Meeting"
        }