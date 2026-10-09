from datetime import date
from typing import Any

from ..notificacao_template import NotificacaoTemplate

class QuartoParaLimpezaNotificacao(NotificacaoTemplate):
    """Quarto entrou em limpeza (ex.: após check-out) -> avisa Governanta e Camareiras do hotel. Contexto: {'id_quarto'}."""

    tipo = "quarto_para_limpeza"
    CARGOS = ("governanta", "camareira")

    def prepare_context(self, ctx):
        quarto = self.get_one("quarto", "id_quarto", ctx.get("id_quarto"))
        return {**ctx, "quarto": quarto, "id_hotel": quarto["id_hotel"]}

    def resolve_recipients(self, ctx):
        return self.staff_of_hotel(ctx["id_hotel"], self.CARGOS)

    def build_message(self, ctx):
        quarto = ctx["quarto"]
        return {
            "assunto": f"Quarto {quarto['num_quarto']} aguardando limpeza",
            "corpo": f"Olá, {{nome}}! O quarto {quarto['num_quarto']} ({quarto['andar']}º andar, {quarto['tipo']}) foi liberado e precisa ser higienizado.",
        }
