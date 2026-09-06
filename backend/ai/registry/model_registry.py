class ModelRegistry:

    def __init__(self):
        self._models = {}

    def register(self, name, provider):
        self._models[name] = provider

    def get(self, name):
        return self._models.get(name)

    def has(self, name):
        return name in self._models

    def clear(self):
        self._models.clear()