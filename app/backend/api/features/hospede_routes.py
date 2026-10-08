from flask import Blueprint, request, jsonify

try:
    from api.auth.auth_context import current_user, require_auth, scope_list_response, scope_record_response
    from api.templates.entities.hospede_template import HospedeCrudTemplate
    from utils.Loggers import Logger
except ImportError or ModuleNotFoundErro:
    from app.backend.api.templates.entities.hospede_template import HospedeCrudTemplate
    from app.backend.utils.Loggers import Logger
    from app.backend.api.auth.auth_context import current_user, require_auth, scope_list_response, scope_record_response

hospede_bp = Blueprint("hospede", __name__, url_prefix="/api/hospede")
hospede_crud = HospedeCrudTemplate()
log = Logger()

@hospede_bp.route("", methods=["GET"])
@hospede_bp.route("/", methods=["GET"])
@require_auth
def list_hospedes():
    """Lista todos os hóspedes com suporte a filtros via query params."""
    filters = request.args.to_dict()
    res, status = hospede_crud.process_read_all(filters)
    res = scope_list_response("hospede", res, current_user())
    return jsonify(res), status

@hospede_bp.route("/<int:entity_id>", methods=["GET"])
@require_auth
def get_hospede(entity_id: int):
    """Busca um hóspede por ID."""
    res, status = hospede_crud.process_read_by_id(entity_id)
    res, status = scope_record_response("hospede", res, current_user())
    return jsonify(res), status

@hospede_bp.route("", methods=["POST"])
@hospede_bp.route("/", methods=["POST"])
@require_auth
def create_hospede():
    """Cria um novo hóspede."""
    payload = request.get_json(silent=True) or {}
    res, status = hospede_crud.process_create(payload)
    return jsonify(res), status

@hospede_bp.route("/<int:entity_id>", methods=["PUT"])
@require_auth
def update_hospede(entity_id: int):
    """Atualiza dados de um hóspede."""
    existing, existing_status = hospede_crud.process_read_by_id(entity_id)
    existing, existing_status = scope_record_response("hospede", existing, current_user())
    if existing_status != 200:
        return jsonify(existing), existing_status
    payload = request.get_json(silent=True) or {}
    res, status = hospede_crud.process_update(entity_id, payload)
    return jsonify(res), status

@hospede_bp.route("/<int:entity_id>", methods=["DELETE"])
@require_auth
def delete_hospede(entity_id: int):
    """Remove um hóspede."""
    existing, existing_status = hospede_crud.process_read_by_id(entity_id)
    existing, existing_status = scope_record_response("hospede", existing, current_user())
    if existing_status != 200:
        return jsonify(existing), existing_status
    res, status = hospede_crud.process_delete(entity_id)
    return jsonify(res), status
