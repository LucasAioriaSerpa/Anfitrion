from typing import Any

from ..crud_template import CrudTemplate

try:
    from api.factories.model_factory import ModelFactory
except ImportError:
    from app.backend.api.factories.model_factory import ModelFactory


class ReservaCrudTemplate(CrudTemplate):
    """Implementação Concreta do Template Method para a entidade Reserva."""

    def __init__(self) -> None: super().__init__(table_name="reserva", primary_key="id_reserva", entity_name="reserva")

    def validate_payload(self, data: dict[str, Any], is_update: bool = False) -> dict[str, Any]:
        if not is_update:
            for field in ["id_quarto", "id_hospede", "check_in", "check_out", "qtd_hospedes"]:
                if data.get(field) is None or data.get(field) == "": raise ValueError(f"O campo '{field}' é obrigatório para cadastrar uma reserva")

        payload = {}
        if "id_quarto" in data:     payload["id_quarto"]    = int(data["id_quarto"])
        if "id_hospede" in data:    payload["id_hospede"]   = int(data["id_hospede"])
        if "check_in" in data:      payload["check_in"]     = str(data["check_in"]).strip()
        if "check_out" in data:     payload["check_out"]    = str(data["check_out"]).strip()
        if "qtd_hospedes" in data:  payload["qtd_hospedes"] = int(data["qtd_hospedes"])

        for fee in ["taxa_pet", "taxa_refeicao", "taxa_cafe_manha", "taxa_almoco", "taxa_jantar"]:
            if fee in data:     payload[fee] = float(data[fee] or 0.0)
            elif not is_update: payload[fee] = 0.0

        if not is_update: ModelFactory.create("reserva", payload)

        return payload

    def after_save(self, record: dict[str, Any], is_update: bool = False) -> dict[str, Any]:
        try:
            room_id = record.get("id_quarto")
            if room_id:
                self._db.update("quarto", {"status": "Ocupado"}, {"id_quarto": room_id})
                self._log.log_info(f"[ ReservaTemplate ] - Quarto {room_id} marcado como 'Ocupado'")
        except Exception as error: self._log.log_warning(f"[ ReservaTemplate ] - Não foi possível atualizar status do quarto: {str(error)}")
        return self.after_read(record)

    def before_delete(self, existing: dict[str, Any]) -> None:
        try:
            room_id = existing.get("id_quarto")
            if room_id:
                self._db.update("quarto", {"status": "Disponível"}, {"id_quarto": room_id})
                self._log.log_info(f"[ ReservaTemplate ] - Quarto {room_id} liberado para 'Disponível'")
        except Exception as error:
            self._log.log_warning(f"[ ReservaTemplate ] - Falha ao liberar quarto: {str(error)}")

    def after_read(self, record: dict[str, Any]) -> dict[str, Any]:
        rec = dict(record)
        try:
            quartos = self._db.read("quarto", {"id_quarto": rec["id_quarto"]})
            if quartos:
                rec["quarto_tipo"] = quartos[0].get("tipo")
                rec["quarto_numero"] = quartos[0].get("num_quarto")
                rec["quarto_diaria"] = quartos[0].get("diaria")
        except Exception: pass

        try:
            hospedes = self._db.read("hospede", {"id_hospede": rec["id_hospede"]})
            if hospedes:
                rec["hospede_nome"] = hospedes[0].get("nome")
                rec["hospede_email"] = hospedes[0].get("email")
        except Exception: pass

        return rec