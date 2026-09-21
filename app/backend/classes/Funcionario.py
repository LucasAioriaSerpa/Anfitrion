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

    def get(self, varClass: str) -> int | float | str | None:
        """_summary_
            \nid: int
            \nnome: str,
            \nemail: str,
            \nsenha: str,
            \ntelefone: str,
            \nid_hospede: int,
            \nid_hotel: int,
            \ncargo: str
        """
        match varClass:
            case "id":          return self.id
            case "nome":        return self.nome
            case "email":       return self.email
            case "senha":       return self.senha
            case "telefone":    return self.telefone
            case "id_hospede":  return self.id_hospede
            case "id_hotel":    return self.id_hotel
            case "cargo":       return self.cargo
            case _: print("\nError - var não encontrada!\n"); return None
    
    def __set__(self, varClass: str, newValue: int | float | str):
        """_summary_
            \nid: int
            \nnome: str,
            \nemail: str,
            \nsenha: str,
            \ntelefone: str,
            \nid_hospede: int,
            \nid_hotel: int,
            \ncargo: str
        """
        match varClass:
            case "id":          
                if type(self.id) == type(newValue): self.id = newValue; print(f"Valor atualizado: <{varClass}> -> <{newValue}>")
            case "nome":       
                if type(self.nome) == type(newValue): self.nome = newValue; print(f"Valor atualizado: <{varClass}> -> <{newValue}")
            case "email":      
                if type(self.email) == type(newValue): self.email = newValue; print(f"Valor atualizado: <{varClass}> -> <{newValue}")
            case "senha":      
                if type(self.senha) == type(newValue): self.senha = newValue; print(f"Valor atualizado: <{varClass}> -> <{newValue}")
            case "telefone":   
                if type(self.telefone) == type(newValue): self.telefone = newValue; print(f"Valor atualizado: <{varClass}> -> <{newValue}")
            case "id_hospede": 
                if type(self.id_hospede) == type(newValue): self.id_hospede = newValue; print(f"Valor atualizado: <{varClass}> -> <{newValue}")
            case "id_hotel":   
                if type(self.id_hotel) == type(newValue): self.id_hotel = newValue; print(f"Valor atualizado: <{varClass}> -> <{newValue}")
            case "cargo":      
                if type(self.cargo) == type(newValue): self.cargo = newValue; print(f"Valor atualizado: <{varClass}> -> <{newValue}")
            case _: return ValueError
