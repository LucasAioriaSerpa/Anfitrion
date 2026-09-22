from typing import cast, Any

try:
    from classes.Funcionario import Funcionario
    from classes.Hospede import Hospede
    from utils.Loggers import Logger
except ImportError:
    from app.backend.classes.Funcionario import Funcionario
    from app.backend.classes.Hospede import Hospede
    from app.backend.utils.Loggers import Logger

class userFactory:
    """
    Design Pattern: FACTORY METHOD especializado para usuários (Hóspede ou Funcionário).
    """
    @staticmethod
    def registrar_user(dado: dict[str, Any]) -> Hospede | Funcionario | None:
        """
        Cria a entidade de usuário apropriada (Hospede ou Funcionario) a partir dos dados fornecidos.
        """
        log = Logger()
        try:
            user_hospede = Hospede(
                nome=str(dado.get("nome", "")),
                email=str(dado.get("email", "")),
                senha=str(dado.get("senha", "")),
                telefone=str(dado.get("telefone", "")),
                id_hospede=int(dado.get("id_hospede") or 1)
            )
        except Exception as e:
            log.log_error(f"[ userFactory ] - Falha ao tentar inicializar o obj <Hospede>: {str(e)}")
            return None

        role = str(dado.get("role", "")).lower()
        if role == "funcionario" or "cargo" in dado:
            try:
                user_funcionario = Funcionario(
                    nome=str(user_hospede.get("nome")),
                    email=str(user_hospede.get("email")),
                    senha=str(user_hospede.get("senha")),
                    telefone=str(user_hospede.get("telefone")),
                    id_hospede=int(user_hospede.get("id") or dado.get("id_hospede") or 1),
                    id_hotel=int(dado.get("id_hotel", 1)),
                    cargo=str(dado.get("cargo", "Recepcionista")),
                    id_funcionario=dado.get("id_funcionario")
                )
                log.log_success(f"[ userFactory ] - Objeto <Funcionario> fabricado com sucesso: {user_funcionario.get('email')}")
                return user_funcionario
            except Exception as e:
                log.log_error(f"[ userFactory ] - Falha em inicializar o obj <Funcionario>: {str(e)}")
                return None

        log.log_success(f"[ userFactory ] - Objeto <Hospede> fabricado com sucesso: {user_hospede.get('email')}")
        return user_hospede
