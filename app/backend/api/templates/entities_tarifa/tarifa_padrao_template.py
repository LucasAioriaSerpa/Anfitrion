from datetime import timedelta
from typing import Any

from ..tarifa_template import Modificador, TarifaCalculationTemplate


class TarifaPadraoTemplate(TarifaCalculationTemplate):
    """Tarifa de balcão: diária x noites + adicionais, sem desconto."""
    politica = "padrao"
    descricao = "Tarifa de balcão, sem descontos"
    def calculate_discount(self, valor_diarias, noites, reserva, quarto, hospede) -> Modificador: return Modificador.nenhum()
