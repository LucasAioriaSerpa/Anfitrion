from typing import Any

from ..crud_template import CrudTemplate

try:
    from api.factories.model_factory import ModelFactory
except ImportError:
    from app.backend.api.factories.model_factory import ModelFactory


class HospedeCrudTemplate(CrudTemplate):
    """Implementação Concreta do Template Method para a entidade Hóspede."""

    def __init__(self) -> None:
        super().__init__(table_name="hospede", primary_key="id_hospede", entity_name="hospede")

    def validate_payload(self, data: dict[str, Any], is_update: bool = False) -> dict[str, Any]:
        required = ["nome", "email", "senha", "telefone"]
        if not is_update:
            for field in required:
                if not data.get(field):
                    raise ValueError(f"O campo '{field}' é obrigatório para cadastrar um hóspede")

        payload = {}
        if "nome" in data and data["nome"]:
            payload["nome"] = str(data["nome"]).strip()
        if "email" in data and data["email"]:
            payload["email"] = str(data["email"]).strip().lower()
        if "senha" in data and data["senha"]:
            payload["senha"] = str(data["senha"])
        if "telefone" in data and data["telefone"]:
            payload["telefone"] = str(data["telefone"]).strip()

        if not is_update:
            ModelFactory.create("hospede", payload)

        return payload

    def after_read(self, record: dict[str, Any]) -> dict[str, Any]:
        rec = dict(record)
        rec.pop("senha", None)
        return rec