from datetime import timedelta
from typing import Any

from ..tarifa_template import Modificador, TarifaCalculationTemplate

class TarifaTemporadaTemplate(TarifaCalculationTemplate):
    """
    Ajuste por sazonalidade, noite a noite (reservas que atravessam temporadas são tratadas corretamente).
    Alta temporada (dez, jan, fev, jul): +20%. Baixa temporada (mai, jun, ago, set): -10%.
    """

    politica = "temporada"
    descricao = "Ajuste sazonal por noite (alta +20%, baixa -10%)"
    MESES_ALTA = frozenset({12, 1, 2, 7})
    MESES_BAIXA = frozenset({5, 6, 8, 9})
    PERCENTUAL_ALTA = 20.0
    PERCENTUAL_BAIXA = -10.0

    def calculate_adjustment(self, valor_base, noites, reserva, quarto, hospede) -> Modificador:
        check_in, _ = self.parse_dates(reserva)
        diaria = self.get_daily_rate(quarto)
        alta = baixa = 0
        for i in range(noites):
            mes = (check_in + timedelta(days=i)).month
            if mes in self.MESES_ALTA:
                alta += 1
            elif mes in self.MESES_BAIXA:
                baixa += 1
        if not alta and not baixa:
            return Modificador(descricao="Temporada regular: sem ajuste")

        valor = diaria * (alta * self.PERCENTUAL_ALTA + baixa * self.PERCENTUAL_BAIXA) / 100
        partes = []
        if alta:
            partes.append(f"{alta} noite(s) em alta temporada ({self.PERCENTUAL_ALTA:+.0f}%)")
        if baixa:
            partes.append(f"{baixa} noite(s) em baixa temporada ({self.PERCENTUAL_BAIXA:+.0f}%)")
        percentual = (valor / valor_base * 100) if valor_base else 0.0
        return Modificador(valor=round(valor, 2), percentual=percentual, descricao="; ".join(partes))

    def calculate_discount(self, valor_diarias, noites, reserva, quarto, hospede) -> Modificador:
        return Modificador.nenhum()