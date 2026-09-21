from typing import Any
from .crud_template import CrudTemplate

try:
    from api.factories.entity_factory import ModelFactory
    from utils.Loggers import Logger
except ImportError:
    from app.backend.api.factories.entity_factory import ModelFactory
    from app.backend.utils.Loggers import Logger


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

        # Validação via Factory Method
        if not is_update:
            ModelFactory.create("hospede", payload)

        return payload

    def after_read(self, record: dict[str, Any]) -> dict[str, Any]:
        rec = dict(record)
        rec.pop("senha", None)  # Oculta a senha por segurança
        return rec


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
        # Enriquecer com dados do hotel se disponível
        try:
            hoteis = self._db.read("hotel", {"id_hotel": rec["id_hotel"]})
            if hoteis:
                rec["hotel_nome"] = hoteis[0].get("nome")
                rec["hotel_franquia"] = hoteis[0].get("franquia")
        except Exception:
            pass
        return rec


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
            # Pode vir com id_hospede existente OU com dados para cadastrar um novo usuário
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
            # Preserva os dados do usuário para o hook before_save
            for ufield in ["nome", "email", "senha", "telefone"]:
                if ufield in data:
                    payload[ufield] = data[ufield]

        return payload

    def before_save(self, data: dict[str, Any], is_update: bool = False) -> dict[str, Any]:
        """
        Hook do Template Method: se id_hospede não foi fornecido mas temos nome/email,
        cria ou localiza o hóspede correspondente.
        """
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

        # Remove campos de usuário que não pertencem à tabela funcionario
        clean_payload = {
            "id_hotel": data.get("id_hotel"),
            "cargo": data.get("cargo"),
            "id_hospede": data.get("id_hospede")
        }
        return {k: v for k, v in clean_payload.items() if v is not None}

    def after_read(self, record: dict[str, Any]) -> dict[str, Any]:
        rec = dict(record)
        # Mescla com os dados do hospede associado
        try:
            hospedes = self._db.read("hospede", {"id_hospede": rec["id_hospede"]})
            if hospedes:
                h = hospedes[0]
                rec["nome"] = h.get("nome")
                rec["email"] = h.get("email")
                rec["telefone"] = h.get("telefone")
        except Exception:
            pass
        return rec


class ReservaCrudTemplate(CrudTemplate):
    """Implementação Concreta do Template Method para a entidade Reserva."""

    def __init__(self) -> None:
        super().__init__(table_name="reserva", primary_key="id_reserva", entity_name="reserva")

    def validate_payload(self, data: dict[str, Any], is_update: bool = False) -> dict[str, Any]:
        if not is_update:
            for field in ["id_quarto", "id_hospede", "check_in", "check_out", "qtd_hospedes"]:
                if data.get(field) is None or data.get(field) == "":
                    raise ValueError(f"O campo '{field}' é obrigatório para cadastrar uma reserva")

        payload = {}
        if "id_quarto" in data:
            payload["id_quarto"] = int(data["id_quarto"])
        if "id_hospede" in data:
            payload["id_hospede"] = int(data["id_hospede"])
        if "check_in" in data:
            payload["check_in"] = str(data["check_in"]).strip()
        if "check_out" in data:
            payload["check_out"] = str(data["check_out"]).strip()
        if "qtd_hospedes" in data:
            payload["qtd_hospedes"] = int(data["qtd_hospedes"])

        for taxa in ["taxa_pet", "taxa_refeicao", "taxa_cafe_manha", "taxa_almoco", "taxa_jantar"]:
            if taxa in data:
                payload[taxa] = float(data[taxa] or 0.0)
            elif not is_update:
                payload[taxa] = 0.0

        if not is_update:
            ModelFactory.create("reserva", payload)

        return payload

    def after_save(self, record: dict[str, Any], is_update: bool = False) -> dict[str, Any]:
        """
        Hook do Template Method: após criar/atualizar reserva, atualiza o status do quarto.
        """
        try:
            id_quarto = record.get("id_quarto")
            if id_quarto:
                self._db.update("quarto", {"status": "Ocupado"}, {"id_quarto": id_quarto})
                self._log.log_info(f"[ ReservaTemplate ] - Quarto {id_quarto} marcado como 'Ocupado'")
        except Exception as e:
            self._log.log_warning(f"[ ReservaTemplate ] - Não foi possível atualizar status do quarto: {str(e)}")
        return self.after_read(record)

    def before_delete(self, existing: dict[str, Any]) -> None:
        """
        Hook do Template Method: antes de excluir a reserva, libera o quarto.
        """
        try:
            id_quarto = existing.get("id_quarto")
            if id_quarto:
                self._db.update("quarto", {"status": "Disponível"}, {"id_quarto": id_quarto})
                self._log.log_info(f"[ ReservaTemplate ] - Quarto {id_quarto} liberado para 'Disponível'")
        except Exception as e:
            self._log.log_warning(f"[ ReservaTemplate ] - Falha ao liberar quarto: {str(e)}")

    def after_read(self, record: dict[str, Any]) -> dict[str, Any]:
        rec = dict(record)
        # Enriquecer com detalhes do quarto e do hóspede
        try:
            quartos = self._db.read("quarto", {"id_quarto": rec["id_quarto"]})
            if quartos:
                rec["quarto_tipo"] = quartos[0].get("tipo")
                rec["quarto_numero"] = quartos[0].get("num_quarto")
                rec["quarto_diaria"] = quartos[0].get("diaria")
        except Exception:
            pass

        try:
            hospedes = self._db.read("hospede", {"id_hospede": rec["id_hospede"]})
            if hospedes:
                rec["hospede_nome"] = hospedes[0].get("nome")
                rec["hospede_email"] = hospedes[0].get("email")
        except Exception:
            pass

        return rec
