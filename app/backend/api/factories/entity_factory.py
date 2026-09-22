from abc import ABC, abstractmethod
from typing import Any

try:
    from utils.Loggers import Logger
except ImportError:
    from app.backend.utils.Loggers import Logger

class EntityFactory(ABC):
    """
    Design Pattern: FACTORY METHOD (Creator Abstrato)
    Declara o método de fábrica que retorna novos objetos de entidade.
    """
    def __init__(self):
        self._log = Logger()

    @abstractmethod
    def create_entity(self, data: dict[str, Any]) -> Any:
        """Método de fábrica que deve ser implementado pelas subclasses concretas."""
        pass
