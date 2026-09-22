from typing import Any

from ..crud_template import CrudTemplate


class FuncionarioCrudTemplate(CrudTemplate):
    """Implementação Concreta do Template Method para a entidade Funcionário."""

    def __init__(self) -> None:
        super().__init__(table_name="funcionario", primary_key="id_funcionario", entity_name="funcionario")

    def validate_payload(self, data: dict[str, Any], is_update: bool = False) -> dict[str, Any]:
        if not is_update:
            if not data.get("id_hotel"):
                raise ValueError("O campo 'id_hotel' é obrigatório para cadastrar um funcionário")
            if not data.get("cargo"):
                raise ValueError("O campo 'cargo' é obrigatório para cadastrar um funcionário")
            if not data.get("id_hospede") and (not data.get("email") or not data.get("nome") or not data.get("senha")):
                raise ValueError("É necessário informar 'id_hospede' ou os dados do usuário (nome, email, senha, telefone)")

        payload = {}
        if "id_hotel" in data:
            payload["id_hotel"] = int(data["id_hotel"])
        if "cargo" in data:
            payload["cargo"] = str(data["cargo"]).strip()
        if "id_hospede" in data and data["id_hospede"]:
            payload["id_hospede"] = int(data["id_hospede"])
        else:
            for user_field in ["nome", "email", "senha", "telefone"]:
                if user_field in data:
                    payload[user_field] = data[user_field]

        return payload

    def before_save(self, data: dict[str, Any], is_update: bool = False) -> dict[str, Any]:
        if not is_update and not data.get("id_hospede"):
            email = str(data.get("email", "")).lower()
            existing = self._db.read("hospede", {"email": email})
            if existing:
                data["id_hospede"] = existing[0]["id_hospede"]
            else:
                user_payload = {
                    "nome": data.get("nome"),
                    "email": email,
                    "senha": data.get("senha"),
                    "telefone": data.get("telefone", "")
                }
                new_hospede_id = self._db.create("hospede", user_payload)
                data["id_hospede"] = new_hospede_id
                self._log.log_info(f"[ FuncionarioTemplate ] - Hóspede associado criado com ID: {new_hospede_id}")

        clean_payload = {
            "id_hotel": data.get("id_hotel"),
            "cargo": data.get("cargo"),
            "id_hospede": data.get("id_hospede")
        }
        return {key: value for key, value in clean_payload.items() if value is not None}

    def after_read(self, record: dict[str, Any]) -> dict[str, Any]:
        rec = dict(record)
        try:
            hospedes = self._db.read("hospede", {"id_hospede": rec["id_hospede"]})
            if hospedes:
                hospede = hospedes[0]
                rec["nome"] = hospede.get("nome")
                rec["email"] = hospede.get("email")
                rec["telefone"] = hospede.get("telefone")
        except Exception:
            pass
        return rec