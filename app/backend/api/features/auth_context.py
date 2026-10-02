from functools import wraps
from typing import Any, Callable

from flask import g, jsonify, request
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

try:
    from manager.Database import Database
    from config.Config import Config
except ImportError:
    from app.backend.manager.Database import Database
    from app.backend.config.Config import Config


config = Config()
_serializer = URLSafeTimedSerializer(config.AUTH_SECRET, salt=config.AUTH_TOKEN_SALT)
_db = Database()


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
    if not header.startswith("Bearer "): return None

    token = header.removeprefix("Bearer ").strip()
    if not token: return None

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
    if not is_employee(user): return False
    return record_hotel_id(entity, record) == int(user["id_hotel"])


def filter_records(entity: str, records: list[dict[str, Any]], user: dict[str, Any]) -> list[dict[str, Any]]:
    return [record for record in records if can_access_record(entity, record, user)]


def payload_belongs_to_hotel(entity: str, payload: dict[str, Any], user: dict[str, Any]) -> bool:
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
