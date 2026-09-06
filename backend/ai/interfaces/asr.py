from abc import ABC, abstractmethod


class BaseASRProvider(ABC):

    @abstractmethod
    def transcribe(self, audio):
        raise NotImplementedError