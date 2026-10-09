from datetime import date
from typing import Any

from ..notificacao_template import NotificacaoTemplate

class ChegadaDoDiaNotificacao(NotificacaoTemplate):
    """
    Resumo diário de chegadas -> avisa a Recepção do hotel. Contexto: {'id_hotel', 'data'?} (padrão: hoje).
    Só notifica se houver chegadas; idempotente por (hotel, data), então rodar na thread Main várias vezes é seguro.
    """

    tipo = "chegadas_do_dia"
    CARGOS = ("recep",)

    def prepare_context(self, ctx):
        if ctx.get("id_hotel") is None:
            raise ValueError("id_hotel é obrigatório")
        data = str(ctx.get("data") or date.today().isoformat())[:10]
        quartos = {q["id_quarto"]: q for q in self._db.read("quarto", {"id_hotel": ctx["id_hotel"]}) if q}
        chegadas = []
        for reserva in self._db.read("reserva", {"check_in": data}):
            if not reserva or reserva["id_quarto"] not in quartos:
                continue
            hospedes = [h for h in self._db.read("hospede", {"id_hospede": reserva["id_hospede"]}) if h]
            chegadas.append({
                "num_quarto": quartos[reserva["id_quarto"]]["num_quarto"],
                "hospede": hospedes[0]["nome"] if hospedes else f"Hóspede #{reserva['id_hospede']}",
                "qtd_hospedes": reserva["qtd_hospedes"],
            })
        chegadas.sort(key=lambda c: c["num_quarto"])
        return {**ctx, "data": data, "chegadas": chegadas}

    def should_notify(self, ctx):
        return bool(ctx["chegadas"])

    def reference(self, ctx):
        return f"chegadas:{ctx['id_hotel']}:{ctx['data']}"

    def resolve_recipients(self, ctx):
        return self.staff_of_hotel(int(ctx["id_hotel"]), self.CARGOS)

    def build_message(self, ctx):
        linhas = "\n".join(
            f"- Quarto {c['num_quarto']}: {c['hospede']} ({c['qtd_hospedes']} hóspede(s))" for c in ctx["chegadas"]
        )
        return {
            "assunto": f"{len(ctx['chegadas'])} chegada(s) em {ctx['data']}",
            "corpo": f"Olá, {{nome}}! Chegadas previstas para {ctx['data']}:\n{linhas}",
        }
