from abc import ABC, abstractmethod
from typing import Any

try:
    from classes.Hospede import Hospede
    from classes.Hotel import Hotel
    from classes.Quarto import Quarto
    from classes.Funcionario import Funcionario
    from classes.Reserva import Reserva
    from utils.Loggers import Logger
except ImportError:
    from app.backend.classes.Hospede import Hospede
    from app.backend.classes.Hotel import Hotel
    from app.backend.classes.Quarto import Quarto
    from app.backend.classes.Funcionario import Funcionario
    from app.backend.classes.Reserva import Reserva
    from app.backend.utils.Loggers import Logger

class EntityFactory(ABC):
    """
    Design Pattern: FACTORY METHOD (Creator Abstrato)
    Declara o método de fábrica que retorna novos objetos de entidade.
    """
    def __init__(self):
        self._log = Logger()

    @abstractmethod
    def create_entity(self, data: dict[str, Any]):
        """Método de fábrica que deve ser implementado pelas subclasses concretas."""
        pass


class HospedeFactory(EntityFactory):
    """Fábrica Concreta para criação de instâncias de Hospede."""
    def create_entity(self, data: dict[str, Any]) -> Hospede:
        self._log.log_info(f"[ HospedeFactory ] - Fabricando entidade Hospede: {data.get('email')}")
        return Hospede.from_dict(data)


class HotelFactory(EntityFactory):
    """Fábrica Concreta para criação de instâncias de Hotel."""
    def create_entity(self, data: dict[str, Any]) -> Hotel:
        self._log.log_info(f"[ HotelFactory ] - Fabricando entidade Hotel: {data.get('nome')}")
        return Hotel.from_dict(data)


class QuartoFactory(EntityFactory):
    """Fábrica Concreta para criação de instâncias de Quarto."""
    def create_entity(self, data: dict[str, Any]) -> Quarto:
        self._log.log_info(f"[ QuartoFactory ] - Fabricando entidade Quarto nº {data.get('num_quarto')}")
        return Quarto.from_dict(data)


class FuncionarioFactory(EntityFactory):
    """Fábrica Concreta para criação de instâncias de Funcionario."""
    def create_entity(self, data: dict[str, Any]) -> Funcionario:
        self._log.log_info(f"[ FuncionarioFactory ] - Fabricando entidade Funcionario: {data.get('email')}")
        return Funcionario.from_dict(data)


class ReservaFactory(EntityFactory):
    """Fábrica Concreta para criação de instâncias de Reserva."""
    def create_entity(self, data: dict[str, Any]) -> Reserva:
        self._log.log_info(f"[ ReservaFactory ] - Fabricando entidade Reserva para quarto ID: {data.get('id_quarto')}")
        return Reserva.from_dict(data)


class ModelFactory:
    """
    Gerenciador e despachante do Factory Method.
    Permite instanciar a fábrica correta baseada no tipo de recurso/entidade.
    """
    _factories: dict[str, EntityFactory] = {
        "hospede": HospedeFactory(),
        "hotel": HotelFactory(),
        "quarto": QuartoFactory(),
        "funcionario": FuncionarioFactory(),
        "reserva": ReservaFactory()
    }
    _log = Logger()

    @classmethod
    def get_factory(cls, entity_name: str) -> EntityFactory:
        factory = cls._factories.get(entity_name.lower())
        if not factory:
            cls._log.log_error(f"[ ModelFactory ] - Nenhuma fábrica registrada para a entidade: <{entity_name}>")
            raise ValueError(f"Fábrica não encontrada para: {entity_name}")
        return factory

    @classmethod
    def create(cls, entity_name: str, data: dict[str, Any]):
        """Cria e retorna a entidade correspondente usando o Factory Method."""
        factory = cls.get_factory(entity_name)
        return factory.create_entity(data)
