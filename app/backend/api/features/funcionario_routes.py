from flask import Blueprint, request, jsonify

try:
    from api.templates.entities.funcionario_template import FuncionarioCrudTemplate
    from utils.Loggers import Logger
    from api.auth.auth_context import current_user, payload_belongs_to_hotel, require_auth, scope_list_response, scope_record_response
except ImportError or ModuleNotFoundErro:
    from app.backend.api.templates.entities.funcionario_template import FuncionarioCrudTemplate
    from app.backend.utils.Loggers import Logger
    from app.backend.api.auth.auth_context import current_user, payload_belongs_to_hotel, require_auth, scope_list_response, scope_record_response

funcionario_bp = Blueprint("funcionario", __name__, url_prefix="/api/funcionario")
funcionario_crud = FuncionarioCrudTemplate()
log = Logger()

@funcionario_bp.route("", methods=["GET"])
@funcionario_bp.route("/", methods=["GET"])
@require_auth
def list_funcionarios():
    """Lista todos os funcionários cadastrados."""
    filters = request.args.to_dict()
    res, status = funcionario_crud.process_read_all(filters)
    res = scope_list_response("funcionario", res, current_user())
    return jsonify(res), status

@funcionario_bp.route("/<int:entity_id>", methods=["GET"])
@require_auth
def get_funcionario(entity_id: int):
    """Busca detalhes de um funcionário por ID."""
    res, status = funcionario_crud.process_read_by_id(entity_id)
    res, status = scope_record_response("funcionario", res, current_user())
    return jsonify(res), status

@funcionario_bp.route("", methods=["POST"])
@funcionario_bp.route("/", methods=["POST"])
@require_auth
def create_funcionario():
    """Cadastra um novo funcionário."""
    payload = request.get_json(silent=True) or {}
    payload["id_hotel"] = current_user().get("id_hotel")
    if not payload_belongs_to_hotel("funcionario", payload, current_user()):
        return jsonify({"success": False, "message": "Funcionário fora do hotel autorizado", "data": None}), 403
    res, status = funcionario_crud.process_create(payload)
    return jsonify(res), status

@funcionario_bp.route("/<int:entity_id>", methods=["PUT"])
@require_auth
def update_funcionario(entity_id: int):
    """Atualiza dados do funcionário."""
    existing, existing_status = funcionario_crud.process_read_by_id(entity_id)
    existing, existing_status = scope_record_response("funcionario", existing, current_user())
    if existing_status != 200:
        return jsonify(existing), existing_status
    payload = request.get_json(silent=True) or {}
    payload["id_hotel"] = current_user().get("id_hotel")
    res, status = funcionario_crud.process_update(entity_id, payload)
    return jsonify(res), status

@funcionario_bp.route("/<int:entity_id>", methods=["DELETE"])
@require_auth
def delete_funcionario(entity_id: int):
    """Exclui um funcionário."""
    existing, existing_status = funcionario_crud.process_read_by_id(entity_id)
    existing, existing_status = scope_record_response("funcionario", existing, current_user())
    if existing_status != 200:
        return jsonify(existing), existing_status
    res, status = funcionario_crud.process_delete(entity_id)
    return jsonify(res), status
