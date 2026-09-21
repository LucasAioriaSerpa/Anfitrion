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
    
    def get(self, varClass: str) -> int | float | datetime | None:
        """_summary_
            \nid_reserva: int,
            \nid_quarto: int,
            \nid_hospede: int,
            \ncheck_in: datetime, strftime("%d/%m/%Y")
            \ncheck_out: datetime,
            \nqtd_hospedes: int,
            \ntaxa_pet: float,
            \ntaxa_refeicao: float,
            \ntaxa_cafe_manha: float,
            \ntaxa_almoco: float,
            \ntaxa_jantar: float
        """
        match varClass:
            case "id":              return self.id
            case "id_reserva":      return self.id_reserva
            case "id_quarto":       return self.id_quarto
            case "id_hospede":      return self.id_hospede
            case "check_in":        return self.check_in
            case "check_out":       return self.check_out
            case "qtd_hospedes":    return self.qtd_hospedes
            case "taxa_pet":        return self.taxa_pet
            case "taxa_refeicao":   return self.taxa_refeicao
            case "taxa_cafe_manha": return self.taxa_cafe_manha
            case "taxa_almoco":     return self.taxa_almoco
            case "taxa_jantar":     return self.taxa_jantar
            case _: print("\nError - var não encontrada!\n"); return None

    def __set__(self, varClass: str, newValue: int | float | datetime):
        """_summary_
            \nid_reserva: int,
            \nid_quarto: int,
            \nid_hospede: int,
            \ncheck_in: datetime, strftime("%d/%m/%Y")
            \ncheck_out: datetime,
            \nqtd_hospedes: int,
            \ntaxa_pet: float,
            \ntaxa_refeicao: float,
            \ntaxa_cafe_manha: float,
            \ntaxa_almoco: float,
            \ntaxa_jantar: float
        """
        match varClass:
            case "id":          
                if type(self.id) == type(newValue): self.id = newValue; print(f"Valor atualizado: <{varClass}> -> <{newValue}>")
            case "id_reserva":  
                if type(self.id_reserva) == type(newValue): self.id_reserva = newValue; print(f"Valor atualizado: <{varClass}> -> <{newValue}>")
            case "id_quarto":   
                if type(self.id_quarto) == type(newValue): self.id_quarto = newValue; print(f"Valor atualizado: <{varClass}> -> <{newValue}>")
            case "id_hospede":  
                if type(self.id_hospede) == type(newValue): self.id_hospede = newValue; print(f"Valor atualizado: <{varClass}> -> <{newValue}>")
            case "check_in":    
                if type(self.check_in) == type(newValue): self.check_in = newValue; print(f"Valor atualizado: <{varClass}> -> <{newValue}>")
            case "check_out":   
                if type(self.check_out) == type(newValue): self.check_out = newValue; print(f"Valor atualizado: <{varClass}> -> <{newValue}>")
            case "qtd_hospedes":       
                if type(self.qtd_hospedes) == type(newValue): self.qtd_hospedes = newValue; print(f"Valor atualizado: <{varClass}> -> <{newValue}>")
            case "taxa_pet":   
                if type(self.taxa_pet) == type(newValue): self.taxa_pet = newValue; print(f"Valor atualizado: <{varClass}> -> <{newValue}>")
            case "taxa_refeicao":      
                if type(self.taxa_refeicao) == type(newValue): self.taxa_refeicao = newValue; print(f"Valor atualizado: <{varClass}> -> <{newValue}>")
            case "taxa_cafe_manha":    
                if type(self.taxa_cafe_manha) == type(newValue): self.taxa_cafe_manha = newValue; print(f"Valor atualizado: <{varClass}> -> <{newValue}>")
            case "taxa_almoco":        
                if type(self.taxa_almoco) == type(newValue): self.taxa_almoco = newValue; print(f"Valor atualizado: <{varClass}> -> <{newValue}>")
            case "taxa_jantar":        
                if type(self.taxa_jantar) == type(newValue): self.taxa_jantar = newValue; print(f"Valor atualizado: <{varClass}> -> <{newValue}>")
            case _: return ValueError
