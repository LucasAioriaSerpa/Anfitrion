
from app.backend.classes.Funcionario import Functionario
from app.backend.classes.Hospede import Hospede

from app.backend.utils.Loggers import Logger
from typing import cast

class userFactory:
    @staticmethod
    def registrar_user(dado: dict[str, int | str]) -> Hospede | Functionario | None:
        """_summary_

        Args:
            dado (dict[str, int  |  str]): _description_

        Param_info:
            dado = {
                "role": "hospede" / "funcionario",
                "nome": str...
            }

        Returns:
            _type_: _description_
        """
        __log = Logger()
        try:
            user_hospede = Hospede(
                nome=cast(str, dado.get("nome")),
                email=cast(str, dado.get("email")),
                senha=cast(str, dado.get("senha")),
                telefone=cast(str, dado.get("telefone"))
            )
        except: __log.log_error("[ API ] - Falha ao tentar inicializar o obj <Hospede>"); return None
        if dado.get("role") == "funcionario": 
            try:
                user_funcionario = Functionario(
                    nome=cast(str, user_hospede.get("nome")),
                    email=cast(str, user_hospede.get("email")),
                    senha=cast(str, user_hospede.get("senha")),
                    telefone=cast(str, user_hospede.get("telefone")),
                    id_hospede=cast(int, user_hospede.get("id")),
                    id_hotel=cast(int, dado.get("id_hotel")),
                    cargo=cast(str, dado.get("cargo"))
                )
            except: __log.log_error("[ API ] - Falha em inicializar o obj <Funcionario>"); return None
            return user_funcionario
        return user_hospede
