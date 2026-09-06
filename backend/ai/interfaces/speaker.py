from abc import ABC, abstractmethod


class BaseSpeakerProvider(ABC):

    @abstractmethod
    def enroll(self, speaker_id, audio):
        raise NotImplementedError

    @abstractmethod
    def identify(self, audio):
        raise NotImplementedError