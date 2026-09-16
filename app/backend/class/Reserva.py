from datetime import datetime
import itertools

class Reserva():
    id_counter = itertools.count(start=1)
    def __init__(
        self,
        id_reserva: int,
        id_quarto: int,
        id_hospede: int,
        check_in: datetime, #* strftime("%d/%m/%Y")
        check_out: datetime,
        qtd_hospedes: int,
        taxa_pet: float,
        taxa_refeicao: float,
        taxa_cafe_manha: float,
        taxa_almoco: float,
        taxa_jantar: float
    ) -> None:
        self.id = next(Reserva.id_counter)
        self.id_reserva         = id_reserva
        self.id_quarto          = id_quarto
        self.id_hospede         = id_hospede
        self.check_in           = check_in
        self.check_out          = check_out
        self.qtd_hospedes       = qtd_hospedes
        self.taxa_pet           = taxa_pet
        self.taxa_refeicao      = taxa_refeicao
        self.taxa_cafe_manha    = taxa_cafe_manha
        self.taxa_almoco        = taxa_almoco
        self.taxa_jantar        = taxa_jantar
    
    ...
