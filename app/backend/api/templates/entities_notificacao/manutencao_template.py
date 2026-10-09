from datetime import date
from typing import Any

from ..notificacao_template import NotificacaoTemplate

class ManutencaoNotificacao(NotificacaoTemplate):
    """Quarto interditado para manutenção -> avisa Gerência e Administração. Contexto: {'id_quarto', 'motivo'?}."""

    tipo = "quarto_manutencao"
    CARGOS = ("admin", "gerente", "subgerente")

    def prepare_context(self, ctx):
        quarto = self.get_one("quarto", "id_quarto", ctx.get("id_quarto"))
        return {**ctx, "quarto": quarto, "id_hotel": quarto["id_hotel"]}

    def resolve_recipients(self, ctx):
        return self.staff_of_hotel(ctx["id_hotel"], self.CARGOS)

    def build_message(self, ctx):
        quarto = ctx["quarto"]
        motivo = f" Motivo: {ctx['motivo']}." if ctx.get("motivo") else ""
        return {
            "assunto": f"Quarto {quarto['num_quarto']} em manutenção",
            "corpo": f"Olá, {{nome}}! O quarto {quarto['num_quarto']} ({quarto['tipo']}) está indisponível para venda.{motivo}",
        }
