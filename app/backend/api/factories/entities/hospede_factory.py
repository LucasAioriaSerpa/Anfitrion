from typing import Any


try:
    from ..entity_factory import EntityFactory
    from classes.Hospede import Hospede
except:
    from app.backend.api.factories.entity_factory import EntityFactory
    from app.backend.classes.Hospede import Hospede

class HospedeFactory(EntityFactory):
    """Fábrica Concreta para criação de instâncias de Hospede."""
    def create_entity(self, data: dict[str, Any]) -> Hospede:
        self._log.log_info(f"[ HospedeFactory ] - Fabricando entidade Hospede: {data.get('email')}")
        return Hospede.from_dict(data)
