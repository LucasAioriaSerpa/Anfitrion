import itertools

class Hotel():
    id_counter = itertools.count(start=1)
    def __init__(
        self,
        cnpj: int,
        franquia: str,
        nome: str,
        endereso: str,
        qtd_quartos: str
    ) -> None:
        self.id = next(Hotel.id_counter)
        self.cnpj           = cnpj
        self.franquia       = franquia
        self.nome           = nome
        self.endereso       = endereso
        self.qtd_quartos    = qtd_quartos
