# backend/routers/chat.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.rag_chatbot import RAGChatbot
from llama_cpp import Llama
import os

router = APIRouter()
rag = RAGChatbot()
llm = Llama(model_path=os.getenv("LLAMA_MODEL_PATH"), n_threads=4) if os.getenv("LLAMA_MODEL_PATH") else None

class ChatQuery(BaseModel):
    question: str
    meeting_id: str = None

@router.post("/chat")
async def chat(query: ChatQuery):
    context, sources = rag.query(query.question)
    prompt = f"Context:\n{context}\n\nQuestion: {query.question}\n\nAnswer:"
    if llm:
        result = llm(prompt, max_tokens=512)
        answer = result['choices'][0]['text']
    else:
        raise HTTPException(500, "LLM not available")
    return {
        "answer": answer,
        "sources": [{"text": s[0], "score": s[2]} for s in sources]
    }