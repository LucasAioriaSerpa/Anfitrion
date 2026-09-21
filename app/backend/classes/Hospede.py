import itertools

class Hospede:
    id_counter = itertools.count(start=1)

    def __init__(
        self,
        nome: str,
        email: str,
        senha: str,
        telefone: str,
        id_hospede: int = None,
        criado_em: str = None
    ) -> None:
        self.id = id_hospede if id_hospede is not None else next(Hospede.id_counter)
        self.id_hospede = self.id
        self.nome = nome
        self.email = email
        self.senha = senha
        self.telefone = str(telefone)
        self.criado_em = criado_em

    def get(self, varClass: str) -> int | float | str | None:
        match varClass:
            case "id" | "id_hospede": return self.id
            case "nome": return self.nome
            case "email": return self.email
            case "senha": return self.senha
            case "telefone": return self.telefone
            case "criado_em": return self.criado_em
            case _: return None

    def __set__(self, varClass: str, newValue: int | float | str):
        match varClass:
            case "id" | "id_hospede":
                self.id = self.id_hospede = int(newValue)
            case "nome":
                self.nome = str(newValue)
            case "email":
                self.email = str(newValue)
            case "senha":
                self.senha = str(newValue)
            case "telefone":
                self.telefone = str(newValue)
            case "criado_em":
                self.criado_em = str(newValue)
            case _:
                return ValueError

    def to_dict(self, include_senha: bool = False) -> dict:
        data = {
            "id_hospede": self.id,
            "id": self.id,
            "nome": self.nome,
            "email": self.email,
            "telefone": self.telefone,
            "criado_em": self.criado_em
        }
        if include_senha:
            data["senha"] = self.senha
        return data

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            id_hospede=data.get("id_hospede") or data.get("id"),
            nome=data.get("nome", ""),
            email=data.get("email", ""),
            senha=data.get("senha", ""),
            telefone=str(data.get("telefone", "")),
            criado_em=data.get("criado_em")
        )
