from ai.config.ai_config import settings

from ai.providers.llm.huggingface import HuggingFaceLLM
from ai.providers.asr.huggingface import HuggingFaceASR


class ProviderFactory:

    @staticmethod
    def create_llm(settings):

        if settings.LLM_PROVIDER == "huggingface":
            return HuggingFaceLLM()

        raise ValueError("Unknown LLM Provider")


    @staticmethod
    def create_asr(settings):

        if settings.ASR_PROVIDER == "huggingface":
            return HuggingFaceASR()

        raise ValueError("Unknown ASR Provider")