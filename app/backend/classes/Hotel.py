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

    def get(self, varClass: str) -> int | float | str | None:
        """_summary_
            \nid: int
            \ncnpj: int,
            \nfranquia: str,
            \nnome: str,
            \nendereso: str,
            \nqtd_quartos: str,
        """
        match varClass:
            case "id":          return self.id
            case "cnpj":        return self.cnpj
            case "franquia":    return self.franquia
            case "nome":        return self.nome
            case "endereso":    return self.endereso
            case "qtd_quartos": return self.qtd_quartos
            case _: print("\nError - var não encontrada!\n"); return None
    
    def set(self, varClass: str, newValue: int | float | str):
        """_summary_
            \nid: int
            \ncnpj: int,
            \nfranquia: str,
            \nnome: str,
            \nendereso: str,
            \nqtd_quartos: str,
        """
        match varClass:
            case "id":          
                if type(self.id) == type(newValue): self.id = newValue; print(f"Valor atualizado: <{varClass}> -> <{newValue}>")
            case "cnpj":         
                if type(self.cnpj) == type(newValue): self.cnpj = newValue; print(f"Valor atualizado: <{varClass}> -> <{newValue}")
            case "franquia":     
                if type(self.franquia) == type(newValue): self.franquia = newValue; print(f"Valor atualizado: <{varClass}> -> <{newValue}")
            case "nome":         
                if type(self.nome) == type(newValue): self.nome = newValue; print(f"Valor atualizado: <{varClass}> -> <{newValue}")
            case "endereso":     
                if type(self.endereso) == type(newValue): self.endereso = newValue; print(f"Valor atualizado: <{varClass}> -> <{newValue}")
            case "qtd_quartos":  
                if type(self.qtd_quartos) == type(newValue): self.qtd_quartos = newValue; print(f"Valor atualizado: <{varClass}> -> <{newValue}")
            case _: return ValueError
