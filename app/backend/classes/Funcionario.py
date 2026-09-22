import itertools

try:
    from classes.Hospede import Hospede
except ImportError:
    try:
        from app.backend.classes.Hospede import Hospede
    except ImportError:
        from Hospede import Hospede

class Funcionario(Hospede):
    id_counter = itertools.count(start=1)

    def __init__(
        self,
        nome: str,
        email: str,
        senha: str,
        telefone: str,
        id_hospede: int,
        id_hotel: int,
        cargo: str,
        id_funcionario: int | None = None,
        criado_em: str = None
    ) -> None:
        super().__init__(nome, email, senha, telefone, id_hospede=id_hospede, criado_em=criado_em)
        self.id = id_funcionario if id_funcionario is not None else next(Funcionario.id_counter)
        self.id_funcionario = self.id
        self.id_hospede = int(id_hospede)
        self.id_hotel = int(id_hotel)
        self.cargo = cargo

    def get(self, varClass: str) -> int | float | str | None:
        match varClass:
            case "id" | "id_funcionario": return self.id
            case "id_hospede": return self.id_hospede
            case "id_hotel": return self.id_hotel
            case "cargo": return self.cargo
            case _: return super().get(varClass)

    def set(self, varClass: str, newValue: int | float | str):
        match varClass:
            case "id" | "id_funcionario": self.id = self.id_funcionario = int(newValue)
            case "id_hospede": self.id_hospede = int(newValue)
            case "id_hotel": self.id_hotel = int(newValue)
            case "cargo": self.cargo = str(newValue)
            case _: return super().set(varClass, newValue)

    def to_dict(self, include_senha: bool = False) -> dict:
        base = super().to_dict(include_senha=include_senha)
        base.update({
            "id_funcionario": self.id,
            "id_hotel": self.id_hotel,
            "cargo": self.cargo
        })
        return base

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            id_funcionario=(
                int(data.get("id_funcionario") or data.get("id"))
                if data.get("id_funcionario") is not None or data.get("id") is not None
                else None
            ),
            nome=data.get("nome", ""),
            email=data.get("email", ""),
            senha=data.get("senha", ""),
            telefone=str(data.get("telefone", "")),
            id_hospede=data.get("id_hospede", 1),
            id_hotel=data.get("id_hotel", 1),
            cargo=data.get("cargo", "Recepcionista"),
            criado_em=data.get("criado_em")
        )
