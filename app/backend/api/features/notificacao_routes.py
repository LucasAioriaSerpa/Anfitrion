from typing import Any

from flask import Blueprint, request, jsonify

try:
    from api.auth.auth_context import current_user, require_auth
    from api.auth.cargo_guard import CARGOS_RECEPCAO, require_cargo
    from api.templates.entities_notificacao import ChegadaDoDiaNotificacao
    from manager.Database import Database
    from utils.Loggers import Logger
except ImportError:
    from app.backend.api.auth.auth_context import current_user, require_auth
    from app.backend.api.auth.cargo_guard import CARGOS_RECEPCAO, require_cargo
    from app.backend.api.templates.entities_notificacao import ChegadaDoDiaNotificacao
    from app.backend.manager.Database import Database
    from app.backend.utils.Loggers import Logger

notificacao_bp = Blueprint("notificacao", __name__, url_prefix="/api/notificacao")
db = Database()
log = Logger()


def _response(success: bool, status: int, message: str, data: Any = None, **extra) -> tuple[Any, int]:
    return jsonify({"success": success, "status": status, "message": message, "data": data, **extra}), status


@notificacao_bp.route("", methods=["GET"])
@notificacao_bp.route("/", methods=["GET"])
@require_auth
def list_minhas_notificacoes():
    """Caixa de entrada do usuário autenticado. Query: ?apenas_nao_lidas=true"""
    id_hospede = current_user().get("id_hospede")
    registros = [n for n in db.read("notificacao", {"id_hospede": id_hospede}) if n]
    nao_lidas = sum(1 for n in registros if not n.get("lida"))
    if request.args.get("apenas_nao_lidas", "").lower() == "true":
        registros = [n for n in registros if not n.get("lida")]
    registros.sort(key=lambda n: n["id_notificacao"], reverse=True)
    return _response(True, 200, f"{len(registros)} notificações", registros, total=len(registros), nao_lidas=nao_lidas)


@notificacao_bp.route("/<int:entity_id>/lida", methods=["PATCH"])
@require_auth
def marcar_como_lida(entity_id: int):
    """Marca uma notificação do próprio usuário como lida."""
    id_hospede = current_user().get("id_hospede")
    registros = [n for n in db.read("notificacao", {"id_notificacao": entity_id}) if n]
    if not registros or registros[0]["id_hospede"] != id_hospede:
        return _response(False, 404, "Notificação não encontrada")
    db.update("notificacao", {"lida": 1}, {"id_notificacao": entity_id})
    return _response(True, 200, "Notificação marcada como lida", {"id_notificacao": entity_id})


@notificacao_bp.route("/chegadas-do-dia", methods=["POST"])
@require_cargo(*CARGOS_RECEPCAO)
def disparar_chegadas_do_dia():
    """Dispara manualmente o resumo de chegadas do hotel do funcionário. Body opcional: {data: 'AAAA-MM-DD'}"""
    payload = request.get_json(silent=True) or {}
    resultado = ChegadaDoDiaNotificacao().notify({
        "id_hotel": current_user().get("id_hotel"),
        "data": payload.get("data"),
    })
    status = 200 if resultado["success"] else 400
    return _response(resultado["success"], status, resultado["mensagem"], resultado)
