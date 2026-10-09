from datetime import timedelta
from typing import Any

from ..tarifa_template import Modificador, TarifaCalculationTemplate

class TarifaFidelidadeTemplate(TarifaCalculationTemplate):
    """
    Desconto por nível de fidelidade do hóspede, com os mesmos níveis do `Hospede.js`:
    Silver (2+ estadias) 5%, Gold (5+) 10%, Diamond (10+) 15%.
    Conta apenas estadias anteriores ao check-in da reserva calculada.
    """

    politica = "fidelidade"
    descricao = "Desconto por nível de fidelidade (Silver 5%, Gold 10%, Diamond 15%)"
    NIVEIS = ((10, "Diamond", 15.0), (5, "Gold", 10.0), (2, "Silver", 5.0))

    def calculate_discount(self, valor_diarias, noites, reserva, quarto, hospede) -> Modificador:
        id_hospede = (hospede or {}).get("id_hospede") or reserva.get("id_hospede")
        if not id_hospede:
            return Modificador(descricao="Hóspede não informado: sem desconto de fidelidade")

        estadias = self.count_previous_stays(int(id_hospede), reserva)
        for minimo, nivel, percentual in self.NIVEIS:
            if estadias >= minimo:
                return self.percent_of(valor_diarias, percentual, f"Fidelidade {nivel} ({estadias} estadias anteriores)")
        return Modificador(descricao=f"Standard ({estadias} estadias anteriores): sem desconto")

    def count_previous_stays(self, id_hospede: int, reserva: dict[str, Any]) -> int:
        check_in, _ = self.parse_dates(reserva)
        id_atual = reserva.get("id_reserva")
        reservas = [r for r in self._db.read("reserva", {"id_hospede": id_hospede}) if r]
        return sum(
            1
            for r in reservas
            if r.get("id_reserva") != id_atual and str(r.get("check_out", ""))[:10] <= check_in.isoformat()
        )
