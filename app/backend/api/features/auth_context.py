from functools import wraps
from typing import Any, Callable

from flask import g, jsonify, request
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

try:
    from manager.Database import Database
    from config.Config import Config
    from private.cypher import Cypher
except ImportError:
    from app.backend.manager.Database import Database
    from app.backend.config.Config import Config
    from app.backend.private.cypher import Cypher


config = Config()
_serializer = URLSafeTimedSerializer(config.AUTH_SECRET, salt=config.AUTH_TOKEN_SALT)
_db = Database()


def _is_administrator(funcionario: dict[str, Any]) -> bool:
    cargo = str(funcionario.get("cargo", "")).strip().lower()
    return "admin" in cargo

def _user_from_query_credentials() -> dict[str, Any] | None:
    if not config.AUTH_QUERY_ENABLED: return None

    email = (request.args.get("email") or request.args.get("login") or "").strip().lower()
    senha = request.args.get("senha", "")
    if not email or not senha: return None

    hospedes = _db.read("hospede", {"email": email})
    if not hospedes: return None

    stored_password = str(hospedes[0].get("senha", ""))
    password_matches = Cypher.verify_password(senha, stored_password)
    legacy_password = not stored_password.startswith("sha256$")
    if not password_matches and not (legacy_password and stored_password == senha): return None

    if legacy_password:
        _db.update("hospede", {"senha": Cypher.hash_password(senha)}, {"id_hospede": hospedes[0].get("id_hospede")})

    funcionarios = _db.read("funcionario", {"id_hospede": hospedes[0].get("id_hospede")})
    if not funcionarios or not _is_administrator(funcionarios[0]): return None

    funcionario = funcionarios[0]
    return {
        "id_hospede": hospedes[0].get("id_hospede"),
        "id_funcionario": funcionario.get("id_funcionario"),
        "id_hotel": funcionario.get("id_hotel"),
        "email": hospedes[0].get("email"),
        "role": "funcionario",
        "cargo": funcionario.get("cargo"),
    }


def issue_access_token(user: dict[str, Any]) -> str:
    """Cria um token assinado contendo apenas o contexto de autorização."""
    payload = {
        "id_hospede": user.get("id_hospede"),
        "id_funcionario": user.get("id_funcionario"),
        "id_hotel": user.get("id_hotel"),
        "email": user.get("email"),
        "role": user.get("role", "hospede"),
    }
    return _serializer.dumps(payload)


def _read_access_token() -> dict[str, Any] | None:
    header = request.headers.get("Authorization", "")
    token = header.removeprefix("Bearer ").strip() if header.startswith("Bearer ") else ""

    if not token and config.AUTH_QUERY_ENABLED: token = request.args.get("access_token", "").strip()
    if not token: return _user_from_query_credentials()

    try: payload = _serializer.loads(token, max_age=config.AUTH_TOKEN_MAX_AGE)
    except (BadSignature, SignatureExpired): return None

    if payload.get("role") != "funcionario": return payload

    funcionario_id = payload.get("id_funcionario")
    hotel_id = payload.get("id_hotel")
    if not funcionario_id or not hotel_id: return None

    funcionarios = _db.read("funcionario", {"id_funcionario": funcionario_id})
    if not funcionarios: return None

    funcionario = funcionarios[0]
    if int(funcionario.get("id_hotel", 0)) != int(hotel_id): return None

    payload["id_hotel"] = int(funcionario["id_hotel"])
    return payload


def require_auth(view: Callable) -> Callable:
    @wraps(view)
    def wrapped(*args, **kwargs):
        user = _read_access_token()
        if not user:
            return jsonify({
                "success": False,
                "message": "Autenticação obrigatória ou credencial inválida",
            }), 401
        g.auth_user = user
        return view(*args, **kwargs)
    return wrapped


def current_user() -> dict[str, Any]: return getattr(g, "auth_user", {})


def is_employee(user: dict[str, Any]) -> bool: return user.get("role") == "funcionario" and bool(user.get("id_hotel"))


def record_hotel_id(entity: str, record: dict[str, Any]) -> int | None:
    if entity in {"hotel", "quarto", "funcionario"}:
        value = record.get("id_hotel")
        return int(value) if value is not None else None

    if entity == "reserva":
        quartos = _db.read("quarto", {"id_quarto": record.get("id_quarto")})
        if quartos:
            value = quartos[0].get("id_hotel")
            return int(value) if value is not None else None
        return None

    if entity == "hospede":
        reservas = _db.read("reserva", {"id_hospede": record.get("id_hospede")})
        hotel_ids = {
            record_hotel_id("reserva", reserva)
            for reserva in reservas
        }
        hotel_ids.discard(None)
        return next(iter(hotel_ids)) if len(hotel_ids) == 1 else None
    return None


def can_access_record(entity: str, record: dict[str, Any], user: dict[str, Any]) -> bool:
    if user.get("role") == "hospede":
        if entity == "quarto": return True
        if entity == "hotel": return True
        if entity in {"hospede", "reserva"}:
            return int(record.get("id_hospede", 0)) == int(user.get("id_hospede", 0))
        return False

    if not is_employee(user): return False
    return record_hotel_id(entity, record) == int(user["id_hotel"])


def filter_records(entity: str, records: list[dict[str, Any]], user: dict[str, Any]) -> list[dict[str, Any]]:
    return [record for record in records if can_access_record(entity, record, user)]


def payload_belongs_to_hotel(entity: str, payload: dict[str, Any], user: dict[str, Any]) -> bool:
    if user.get("role") == "hospede":
        if entity != "reserva" or int(payload.get("id_hospede", 0)) != int(user.get("id_hospede", 0)):
            return False
        quartos = _db.read("quarto", {"id_quarto": payload.get("id_quarto")})
        if not quartos: return False
        status = str(quartos[0].get("status", "")).strip().lower()
        return status in {"disponível", "disponivel"}

    if not is_employee(user): return False

    hotel_id = int(user["id_hotel"])
    if entity == "hotel": return int(payload.get("id_hotel", hotel_id)) == hotel_id
    if entity in {"quarto", "funcionario"}: return int(payload.get("id_hotel", hotel_id)) == hotel_id
    if entity == "reserva":
        quartos = _db.read("quarto", {"id_quarto": payload.get("id_quarto")})
        return bool(quartos) and can_access_record("quarto", quartos[0], user)
    if entity == "hospede": return True
    return False


def scope_list_response(
    entity: str,
    response: dict[str, Any],
    user: dict[str, Any],
) -> dict[str, Any]:
    if not response.get("success") or not isinstance(response.get("data"), list): return response
    records = filter_records(entity, response["data"], user)
    response["data"] = records
    response["total"] = len(records)
    response["message"] = f"{len(records)} registros encontrados"
    return response


def scope_record_response(
    entity: str,
    response: dict[str, Any],
    user: dict[str, Any],
) -> tuple[dict[str, Any], int]:
    status = int(response.get("status", 200))
    record = response.get("data")
    if status == 200 and response.get("success") and isinstance(record, dict):
        if not can_access_record(entity, record, user):
            return {
                "success": False,
                "status": 404,
                "message": "Registro não encontrado",
                "data": None,
            }, 404
    return response, status
