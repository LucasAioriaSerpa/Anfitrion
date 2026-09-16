import itertools

from Hospede import Hospede

class Functionario(Hospede):
    id_counter = itertools.count(start=1)
    def __init__(
        self,
        nome: str,
        email: str,
        senha: str,
        telefone: str,
        id_hospede: int,
        id_hotel: int,
        cargo: str
    ) -> None:
        super().__init__(nome, email, senha, telefone)
        self.id = next(Functionario.id_counter)
        self.id_hospede = id_hospede
        self.id_hotel = id_hotel
        self.cargo = cargo
