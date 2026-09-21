import itertools

try:
    from classes.Hotel import Hotel
except ImportError:
    try:
        from app.backend.classes.Hotel import Hotel
    except ImportError:
        from Hotel import Hotel

class Quarto:
    id_counter = itertools.count(start=1)

    def __init__(
        self,
        id_hotel: int,
        tipo: str,
        status: str,
        andar: int,
        num_quarto: int,
        diaria: float,
        id_quarto: int = None,
        criado_em: str = None
    ) -> None:
        self.id = id_quarto if id_quarto is not None else next(Quarto.id_counter)
        self.id_quarto = self.id
        self.id_hotel = int(id_hotel)
        self.tipo = tipo
        self.status = status or "Disponível"
        self.andar = int(andar)
        self.num_quarto = int(num_quarto)
        self.diaria = float(diaria)
        self.criado_em = criado_em

    def get(self, varClass: str) -> int | float | str | None:
        match varClass:
            case "id" | "id_quarto": return self.id
            case "id_hotel": return self.id_hotel
            case "tipo": return self.tipo
            case "status": return self.status
            case "andar": return self.andar
            case "num_quarto": return self.num_quarto
            case "diaria": return self.diaria
            case "criado_em": return self.criado_em
            case _: return None

    def __set__(self, varClass: str, newValue: int | float | str):
        match varClass:
            case "id" | "id_quarto": self.id = self.id_quarto = int(newValue)
            case "id_hotel": self.id_hotel = int(newValue)
            case "tipo": self.tipo = str(newValue)
            case "status": self.status = str(newValue)
            case "andar": self.andar = int(newValue)
            case "num_quarto": self.num_quarto = int(newValue)
            case "diaria": self.diaria = float(newValue)
            case "criado_em": self.criado_em = str(newValue)
            case _: return ValueError

    def to_dict(self) -> dict:
        return {
            "id_quarto": self.id,
            "id": self.id,
            "id_hotel": self.id_hotel,
            "tipo": self.tipo,
            "status": self.status,
            "andar": self.andar,
            "num_quarto": self.num_quarto,
            "diaria": self.diaria,
            "criado_em": self.criado_em
        }

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            id_quarto=data.get("id_quarto") or data.get("id"),
            id_hotel=data.get("id_hotel", 1),
            tipo=data.get("tipo", "Casal"),
            status=data.get("status", "Disponível"),
            andar=data.get("andar", 1),
            num_quarto=data.get("num_quarto", 101),
            diaria=data.get("diaria", 150.0),
            criado_em=data.get("criado_em")
        )
