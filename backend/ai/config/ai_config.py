from pydantic_settings import BaseSettings


class AISettings(BaseSettings):

    # LLM
    LLM_PROVIDER: str = "huggingface"
    LLM_MODEL: str = "meta-llama/Llama-3.1-8B-Instruct"

    # ASR
    ASR_PROVIDER: str = "huggingface"
    ASR_MODEL: str = "openai/whisper-large-v3"

    # Embeddings
    EMBEDDING_PROVIDER: str = "huggingface"
    EMBEDDING_MODEL: str = "BAAI/bge-large-en-v1.5"
    
    HF_TOKEN: str = ""
    GROQ_API_KEY: str = ""
    OPENROUTER_API_KEY: str = ""

    class Config:
        env_prefix = "AI_"
        extra = "ignore"


settings = AISettings()