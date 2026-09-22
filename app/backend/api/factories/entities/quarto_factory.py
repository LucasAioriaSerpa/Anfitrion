from typing import Any


try:
    from ..entity_factory import EntityFactory
    from classes.Quarto import Quarto
except:
    from app.backend.api.factories.entity_factory import EntityFactory
    from app.backend.classes.Quarto import Quarto

class QuartoFactory(EntityFactory):
    """Fábrica Concreta para criação de instâncias de Quarto."""
    def create_entity(self, data: dict[str, Any]) -> Quarto:
        self._log.log_info(f"[ QuartoFactory ] - Fabricando entidade Quarto nº {data.get('num_quarto')}")
        return Quarto.from_dict(data)
