from abc import ABC, abstractmethod


class BaseDiarizationProvider(ABC):

    @abstractmethod
    def diarize(self, audio):
        raise NotImplementedError