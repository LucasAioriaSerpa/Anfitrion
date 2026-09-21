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

    def get(self, varClass: str) -> int | float | str | None:
        """_summary_
            \nid: int
            \ncnpj: int,
            \nfranquia: str,
            \nnome: str,
            \nendereso: str,
            \nqtd_quartos: str,
            \ntipo: str,
            \nstatus: str,
            \nandar: int,
            \nnum_quarto: int,
            \ndiaria: float
        """
        match varClass:
            case "id":          return self.id
            case "cnpj":        return self.cnpj
            case "franquia":    return self.franquia
            case "nome":        return self.nome
            case "endereso":    return self.endereso
            case "qtd_quartos": return self.qtd_quartos
            case "tipo":        return self.tipo
            case "status":      return self.status
            case "andar":       return self.andar
            case "num_quarto":  return self.num_quarto
            case "diaria":      return self.diaria
            case _: print("\nError - var não encontrada!\n"); return None
    
    def __set__(self, varClass: str, newValue: int | float | str):
        """_summary_
            \nid: int
            \ncnpj: int,
            \nfranquia: str,
            \nnome: str,
            \nendereso: str,
            \nqtd_quartos: str,
            \ntipo: str,
            \nstatus: str,
            \nandar: int,
            \nnum_quarto: int,
            \ndiaria: float
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
            case "tipo":         
                if type(self.tipo) == type(newValue): self.tipo = newValue; print(f"Valor atualizado: <{varClass}> -> <{newValue}")
            case "status":       
                if type(self.status) == type(newValue): self.status = newValue; print(f"Valor atualizado: <{varClass}> -> <{newValue}")
            case "andar":        
                if type(self.andar) == type(newValue): self.andar = newValue; print(f"Valor atualizado: <{varClass}> -> <{newValue}")
            case "num_quarto":   
                if type(self.num_quarto) == type(newValue): self.num_quarto = newValue; print(f"Valor atualizado: <{varClass}> -> <{newValue}")
            case "diaria":       
                if type(self.diaria) == type(newValue): self.diaria = newValue; print(f"Valor atualizado: <{varClass}> -> <{newValue}")
            case _: return ValueError
