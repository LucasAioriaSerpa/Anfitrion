from flask import Blueprint, request, jsonify

try:
    from api.auth.auth_context import current_user, payload_belongs_to_hotel, require_auth, scope_list_response, scope_record_response
    from api.templates.entities.quarto_template import QuartoCrudTemplate
    from utils.Loggers import Logger
except ImportError or ModuleNotFoundErro:
    from app.backend.api.templates.entities.quarto_template import QuartoCrudTemplate
    from app.backend.utils.Loggers import Logger
    from app.backend.api.auth.auth_context import current_user, payload_belongs_to_hotel, require_auth, scope_list_response, scope_record_response

quarto_bp = Blueprint("quarto", __name__, url_prefix="/api/quarto")
quarto_crud = QuartoCrudTemplate()
log = Logger()

@quarto_bp.route("", methods=["GET"])
@quarto_bp.route("/", methods=["GET"])
@require_auth
def list_quartos():
    """Lista todos os quartos, permitindo filtros por status, hotel, andar, tipo."""
    filters = request.args.to_dict()
    res, status = quarto_crud.process_read_all(filters)
    res = scope_list_response("quarto", res, current_user())
    return jsonify(res), status

@quarto_bp.route("/<int:entity_id>", methods=["GET"])
@require_auth
def get_quarto(entity_id: int):
    """Busca detalhes de um quarto por ID."""
    res, status = quarto_crud.process_read_by_id(entity_id)
    res, status = scope_record_response("quarto", res, current_user())
    return jsonify(res), status

@quarto_bp.route("", methods=["POST"])
@quarto_bp.route("/", methods=["POST"])
@require_auth
def create_quarto():
    """Cadastra um novo quarto."""
    payload = request.get_json(silent=True) or {}
    payload["id_hotel"] = current_user().get("id_hotel")
    if not payload_belongs_to_hotel("quarto", payload, current_user()):
        return jsonify({"success": False, "message": "Quarto fora do hotel autorizado", "data": None}), 403
    res, status = quarto_crud.process_create(payload)
    return jsonify(res), status

@quarto_bp.route("/<int:entity_id>", methods=["PUT"])
@require_auth
def update_quarto(entity_id: int):
    """Atualiza dados do quarto (status, diária, tipo, etc.)."""
    existing, existing_status = quarto_crud.process_read_by_id(entity_id)
    existing, existing_status = scope_record_response("quarto", existing, current_user())
    if existing_status != 200:
        return jsonify(existing), existing_status
    payload = request.get_json(silent=True) or {}
    payload["id_hotel"] = current_user().get("id_hotel")
    res, status = quarto_crud.process_update(entity_id, payload)
    return jsonify(res), status

@quarto_bp.route("/<int:entity_id>", methods=["DELETE"])
@require_auth
def delete_quarto(entity_id: int):
    """Remove um quarto."""
    existing, existing_status = quarto_crud.process_read_by_id(entity_id)
    existing, existing_status = scope_record_response("quarto", existing, current_user())
    if existing_status != 200:
        return jsonify(existing), existing_status
    res, status = quarto_crud.process_delete(entity_id)
    return jsonify(res), status
