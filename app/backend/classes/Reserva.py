import itertools

class Reserva:
    id_counter = itertools.count(start=1)

    def __init__(
        self,
        id_quarto: int,
        id_hospede: int,
        check_in: str,
        check_out: str,
        qtd_hospedes: int,
        id_reserva: int = None,
        taxa_pet: float = 0.0,
        taxa_refeicao: float = 0.0,
        taxa_cafe_manha: float = 0.0,
        taxa_almoco: float = 0.0,
        taxa_jantar: float = 0.0,
        criado_em: str = None
    ) -> None:
        self.id = id_reserva if id_reserva is not None else next(Reserva.id_counter)
        self.id_reserva = self.id
        self.id_quarto = int(id_quarto)
        self.id_hospede = int(id_hospede)
        self.check_in = str(check_in)
        self.check_out = str(check_out)
        self.qtd_hospedes = int(qtd_hospedes)
        self.taxa_pet = float(taxa_pet or 0.0)
        self.taxa_refeicao = float(taxa_refeicao or 0.0)
        self.taxa_cafe_manha = float(taxa_cafe_manha or 0.0)
        self.taxa_almoco = float(taxa_almoco or 0.0)
        self.taxa_jantar = float(taxa_jantar or 0.0)
        self.criado_em = criado_em

    def get(self, varClass: str) -> any:
        match varClass:
            case "id" | "id_reserva": return self.id
            case "id_quarto": return self.id_quarto
            case "id_hospede": return self.id_hospede
            case "check_in": return self.check_in
            case "check_out": return self.check_out
            case "qtd_hospedes": return self.qtd_hospedes
            case "taxa_pet": return self.taxa_pet
            case "taxa_refeicao": return self.taxa_refeicao
            case "taxa_cafe_manha": return self.taxa_cafe_manha
            case "taxa_almoco": return self.taxa_almoco
            case "taxa_jantar": return self.taxa_jantar
            case "criado_em": return self.criado_em
            case _: return None

    def __set__(self, varClass: str, newValue: any):
        match varClass:
            case "id" | "id_reserva": self.id = self.id_reserva = int(newValue)
            case "id_quarto": self.id_quarto = int(newValue)
            case "id_hospede": self.id_hospede = int(newValue)
            case "check_in": self.check_in = str(newValue)
            case "check_out": self.check_out = str(newValue)
            case "qtd_hospedes": self.qtd_hospedes = int(newValue)
            case "taxa_pet": self.taxa_pet = float(newValue)
            case "taxa_refeicao": self.taxa_refeicao = float(newValue)
            case "taxa_cafe_manha": self.taxa_cafe_manha = float(newValue)
            case "taxa_almoco": self.taxa_almoco = float(newValue)
            case "taxa_jantar": self.taxa_jantar = float(newValue)
            case "criado_em": self.criado_em = str(newValue)
            case _: return ValueError

    def to_dict(self) -> dict:
        return {
            "id_reserva": self.id,
            "id": self.id,
            "id_quarto": self.id_quarto,
            "id_hospede": self.id_hospede,
            "check_in": self.check_in,
            "check_out": self.check_out,
            "qtd_hospedes": self.qtd_hospedes,
            "taxa_pet": self.taxa_pet,
            "taxa_refeicao": self.taxa_refeicao,
            "taxa_cafe_manha": self.taxa_cafe_manha,
            "taxa_almoco": self.taxa_almoco,
            "taxa_jantar": self.taxa_jantar,
            "criado_em": self.criado_em
        }

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            id_reserva=data.get("id_reserva") or data.get("id"),
            id_quarto=data.get("id_quarto", 1),
            id_hospede=data.get("id_hospede", 1),
            check_in=str(data.get("check_in", "")),
            check_out=str(data.get("check_out", "")),
            qtd_hospedes=int(data.get("qtd_hospedes", 1)),
            taxa_pet=float(data.get("taxa_pet") or 0.0),
            taxa_refeicao=float(data.get("taxa_refeicao") or 0.0),
            taxa_cafe_manha=float(data.get("taxa_cafe_manha") or 0.0),
            taxa_almoco=float(data.get("taxa_almoco") or 0.0),
            taxa_jantar=float(data.get("taxa_jantar") or 0.0),
            criado_em=data.get("criado_em")
        )
