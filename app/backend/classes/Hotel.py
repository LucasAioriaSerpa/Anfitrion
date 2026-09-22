import itertools

class Hotel:
    id_counter = itertools.count(start=1)

    def __init__(
        self,
        cnpj: int | str,
        franquia: str,
        nome: str,
        endereso: str,
        qtd_quartos: int | str,
        id_hotel: int = None,
        criado_em: str = None
    ) -> None:
        self.id = id_hotel if id_hotel is not None else next(Hotel.id_counter)
        self.id_hotel = self.id
        self.cnpj = str(cnpj)
        self.franquia = franquia
        self.nome = nome
        self.endereso = endereso
        self.qtd_quartos = int(qtd_quartos) if str(qtd_quartos).isdigit() else qtd_quartos
        self.criado_em = criado_em

    def get(self, varClass: str) -> int | float | str | None:
        match varClass:
            case "id" | "id_hotel": return self.id
            case "cnpj": return self.cnpj
            case "franquia": return self.franquia
            case "nome": return self.nome
            case "endereso" | "endereco": return self.endereso
            case "qtd_quartos": return self.qtd_quartos
            case "criado_em": return self.criado_em
            case _: return None

    def set(self, varClass: str, newValue: int | float | str):
        match varClass:
            case "id" | "id_hotel": self.id = self.id_hotel = int(newValue)
            case "cnpj": self.cnpj = str(newValue)
            case "franquia": self.franquia = str(newValue)
            case "nome": self.nome = str(newValue)
            case "endereso" | "endereco": self.endereso = str(newValue)
            case "qtd_quartos": self.qtd_quartos = int(newValue)
            case "criado_em": self.criado_em = str(newValue)
            case _: return ValueError

    def to_dict(self) -> dict:
        return {
            "id_hotel": self.id,
            "id": self.id,
            "cnpj": self.cnpj,
            "franquia": self.franquia,
            "nome": self.nome,
            "endereso": self.endereso,
            "endereco": self.endereso,
            "qtd_quartos": self.qtd_quartos,
            "criado_em": self.criado_em
        }

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            id_hotel=data.get("id_hotel") or data.get("id"),
            cnpj=data.get("cnpj", ""),
            franquia=data.get("franquia", ""),
            nome=data.get("nome", ""),
            endereso=data.get("endereso") or data.get("endereco", ""),
            qtd_quartos=data.get("qtd_quartos", 0),
            criado_em=data.get("criado_em")
        )
