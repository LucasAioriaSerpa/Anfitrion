import itertools

class Hospede():
    id_counter = itertools.count(start=1)
    def __init__(
        self,
        nome: str,
        email: str,
        senha: str,
        telefone: str
    ) -> None:
        self.id = next(Hospede.id_counter)
        self.nome       = nome
        self.email      = email
        self.senha      = senha
        self.telefone   = telefone
    
