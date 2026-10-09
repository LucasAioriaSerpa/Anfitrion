from typing import Any

from ..crud_template import CrudTemplate

try:
    from api.factories.model_factory import ModelFactory
except ImportError:
    from app.backend.api.factories.model_factory import ModelFactory


class HotelCrudTemplate(CrudTemplate):
    """Implementação Concreta do Template Method para a entidade Hotel."""

    def __init__(self) -> None:
        super().__init__(table_name="hotel", primary_key="id_hotel", entity_name="hotel")

    def validate_payload(self, data: dict[str, Any], is_update: bool = False) -> dict[str, Any]:
        required = ["cnpj", "franquia", "nome", "qtd_quartos"]
        if not is_update:
            for field in required:
                if data.get(field) is None or data.get(field) == "":
                    raise ValueError(f"O campo '{field}' é obrigatório para cadastrar um hotel")
            if not data.get("endereso") and not data.get("endereco"):
                raise ValueError("O campo 'endereso' é obrigatório")

        payload = {}
        if "cnpj" in data:
            payload["cnpj"] = str(data["cnpj"]).strip()
        if "franquia" in data:
            payload["franquia"] = str(data["franquia"]).strip()
        if "nome" in data:
            payload["nome"] = str(data["nome"]).strip()
        if "endereso" in data:
            payload["endereso"] = str(data["endereso"]).strip()
        elif "endereco" in data:
            payload["endereso"] = str(data["endereco"]).strip()
        if "qtd_quartos" in data:
            try:
                payload["qtd_quartos"] = int(data["qtd_quartos"])
            except (ValueError, TypeError):
                raise ValueError("qtd_quartos deve ser um número inteiro")

        if not is_update:
            ModelFactory.create("hotel", payload)

        return payload