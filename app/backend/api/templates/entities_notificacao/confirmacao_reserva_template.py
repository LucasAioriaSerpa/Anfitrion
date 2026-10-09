from datetime import date
from typing import Any

from ..notificacao_template import NotificacaoTemplate

class ConfirmacaoReservaNotificacao(NotificacaoTemplate):
    """Reserva criada -> avisa o hóspede. Contexto: {'id_reserva'}. Entidades: reserva, hospede, quarto."""

    tipo = "confirmacao_reserva"

    def prepare_context(self, ctx):
        reserva = self.get_one("reserva", "id_reserva", ctx.get("id_reserva"))
        quarto = self.get_one("quarto", "id_quarto", reserva["id_quarto"])
        hospede = self.get_one("hospede", "id_hospede", reserva["id_hospede"])
        return {**ctx, "reserva": reserva, "quarto": quarto, "hospede": hospede, "id_hotel": quarto["id_hotel"]}

    def reference(self, ctx):
        return f"reserva:{ctx['reserva']['id_reserva']}:confirmacao"

    def resolve_recipients(self, ctx):
        return [self.recipient_from_hospede(ctx["hospede"], ctx["id_hotel"])]

    def build_message(self, ctx):
        reserva, quarto = ctx["reserva"], ctx["quarto"]
        return {
            "assunto": f"Reserva #{reserva['id_reserva']} confirmada",
            "corpo": (
                f"Olá, {{nome}}! Sua reserva do quarto {quarto['num_quarto']} ({quarto['tipo']}) está confirmada "
                f"de {reserva['check_in']} a {reserva['check_out']} para {reserva['qtd_hospedes']} hóspede(s)."
            ),
        }
