import itertools

from Hotel import Hotel

class Quarto(Hotel):
    id_counter = itertools.count(start=1)
    def __init__(
        self,
        cnpj: int,
        franquia: str,
        nome: str,
        endereso: str,
        qtd_quartos: str,
        tipo: str,
        status: str,
        andar: int,
        num_quarto: int,
        diaria: float
    ) -> None:
        super().__init__(cnpj, franquia, nome, endereso, qtd_quartos)
        self.id = next(Quarto.id_counter)
        self.tipo       = tipo
        self.status     = status
        self.andar      = andar
        self.num_quarto = num_quarto
        self.diaria     = diaria
