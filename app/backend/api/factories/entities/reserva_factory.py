from typing import Any


try:
    from ..entity_factory import EntityFactory
    from classes.Reserva import Reserva
except:
    from app.backend.api.factories.entity_factory import EntityFactory
    from app.backend.classes.Reserva import Reserva

class ReservaFactory(EntityFactory):
    """Fábrica Concreta para criação de instâncias de Reserva."""
    def create_entity(self, data: dict[str, Any]) -> Reserva:
        self._log.log_info(f"[ ReservaFactory ] - Fabricando entidade Reserva para quarto ID: {data.get('id_quarto')}")
        return Reserva.from_dict(data)
