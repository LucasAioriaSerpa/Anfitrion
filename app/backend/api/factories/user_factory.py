
from app.backend.classes.Funcionario import Functionario
from app.backend.classes.Hospede import Hospede

class userFactory:
    @staticmethod
    def registrar_user(dado: dict):
        if dado.get("role") == "funcionario": return Functionario()
