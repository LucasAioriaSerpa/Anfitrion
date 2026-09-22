from typing import Any

try:
    from .entity_factory import EntityFactory
    from .entities.funcionario_factory import FuncionarioFactory
    from .entities.hospede_factory import HospedeFactory
    from .entities.hotel_factory import HotelFactory
    from .entities.quarto_factory import QuartoFactory
    from .entities.reserva_factory import ReservaFactory
    from utils.Loggers import Logger
except ImportError:
    from app.backend.api.factories.entity_factory import EntityFactory
    from app.backend.api.factories.entities.funcionario_factory import FuncionarioFactory
    from app.backend.api.factories.entities.hospede_factory import HospedeFactory
    from app.backend.api.factories.entities.hotel_factory import HotelFactory
    from app.backend.api.factories.entities.quarto_factory import QuartoFactory
    from app.backend.api.factories.entities.reserva_factory import ReservaFactory
    from app.backend.utils.Loggers import Logger

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
