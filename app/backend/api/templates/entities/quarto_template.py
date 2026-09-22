from typing import Any

from ..crud_template import CrudTemplate

try:
    from api.factories.model_factory import ModelFactory
except ImportError:
    from app.backend.api.factories.model_factory import ModelFactory


class QuartoCrudTemplate(CrudTemplate):
    """Implementação Concreta do Template Method para a entidade Quarto."""

    def __init__(self) -> None:
        super().__init__(table_name="quarto", primary_key="id_quarto", entity_name="quarto")

    def validate_payload(self, data: dict[str, Any], is_update: bool = False) -> dict[str, Any]:
        if not is_update:
            for field in ["id_hotel", "tipo", "andar", "num_quarto", "diaria"]:
                if data.get(field) is None or data.get(field) == "":
                    raise ValueError(f"O campo '{field}' é obrigatório para cadastrar um quarto")

        payload = {}
        if "id_hotel" in data:
            payload["id_hotel"] = int(data["id_hotel"])
        if "tipo" in data:
            payload["tipo"] = str(data["tipo"]).strip()
        if "status" in data:
            payload["status"] = str(data["status"]).strip()
        elif not is_update:
            payload["status"] = "Disponível"
        if "andar" in data:
            payload["andar"] = int(data["andar"])
        if "num_quarto" in data:
            payload["num_quarto"] = int(data["num_quarto"])
        if "diaria" in data:
            payload["diaria"] = float(data["diaria"])

        if not is_update:
            ModelFactory.create("quarto", payload)

        return payload

    def after_read(self, record: dict[str, Any]) -> dict[str, Any]:
        rec = dict(record)
        try:
            hoteis = self._db.read("hotel", {"id_hotel": rec["id_hotel"]})
            if hoteis:
                rec["hotel_nome"] = hoteis[0].get("nome")
                rec["hotel_franquia"] = hoteis[0].get("franquia")
        except Exception:
            pass
        return rec