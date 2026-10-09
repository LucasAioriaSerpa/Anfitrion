from datetime import timedelta
from typing import Any

from ..tarifa_template import Modificador, TarifaCalculationTemplate


class TarifaLongaEstadiaTemplate(TarifaCalculationTemplate):
    """Desconto progressivo por duração: 7+ noites 5%, 14+ noites 10%, 30+ noites 15%."""

    politica = "longa_estadia"
    descricao = "Desconto progressivo por duração (7+ noites 5%, 14+ 10%, 30+ 15%)"
    FAIXAS = ((30, 15.0), (14, 10.0), (7, 5.0))

    def calculate_discount(self, valor_diarias, noites, reserva, quarto, hospede) -> Modificador:
        for minimo, percentual in self.FAIXAS:
            if noites >= minimo:
                return self.percent_of(valor_diarias, percentual, f"Longa estadia ({noites} noites)")
        return Modificador(descricao=f"{noites} noite(s): abaixo do mínimo de 7 para desconto")
