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
            case _: print("\nError - var não encontrada!\n"); return None
    
    def set(self, varClass: str, newValue: int | float | str):
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
            case _: return ValueError
