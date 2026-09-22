from typing import Any


try:
    from ..entity_factory import EntityFactory
    from classes.Hotel import Hotel
except:
    from app.backend.api.factories.entity_factory import EntityFactory
    from app.backend.classes.Hotel import Hotel

class HotelFactory(EntityFactory):
    """Fábrica Concreta para criação de instâncias de Hotel."""
    def create_entity(self, data: dict[str, Any]) -> Hotel:
        self._log.log_info(f"[ HotelFactory ] - Fabricando entidade Hotel: {data.get('nome')}")
        return Hotel.from_dict(data)
