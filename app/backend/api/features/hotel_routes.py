from flask import Blueprint, request, jsonify

try:
    from api.templates.entities.hotel_template import HotelCrudTemplate
    from utils.Loggers import Logger
    from api.features.auth_context import current_user, require_auth, scope_list_response, scope_record_response
except ImportError or ModuleNotFoundError:
    from app.backend.api.templates.entities.hotel_template import HotelCrudTemplate
    from app.backend.utils.Loggers import Logger
    from app.backend.api.features.auth_context import current_user, require_auth, scope_list_response, scope_record_response

hotel_bp = Blueprint("hotel", __name__, url_prefix="/api/hotel")
hotel_crud = HotelCrudTemplate()
log = Logger()

@hotel_bp.route("", methods=["GET"])
@hotel_bp.route("/", methods=["GET"])
@require_auth
def list_hoteis():
    """Lista todos os hotéis."""
    filters = request.args.to_dict()
    res, status = hotel_crud.process_read_all(filters)
    res = scope_list_response("hotel", res, current_user())
    return jsonify(res), status

@hotel_bp.route("/<int:entity_id>", methods=["GET"])
@require_auth
def get_hotel(entity_id: int):
    """Busca um hotel específico por ID."""
    res, status = hotel_crud.process_read_by_id(entity_id)
    res, status = scope_record_response("hotel", res, current_user())
    return jsonify(res), status

@hotel_bp.route("", methods=["POST"])
@hotel_bp.route("/", methods=["POST"])
@require_auth
def create_hotel():
    """Cadastra um novo hotel."""
    return jsonify({
        "success": False,
        "status": 403,
        "message": "Funcionários não podem criar hotéis fora do próprio escopo",
        "data": None,
    }), 403

@hotel_bp.route("/<int:entity_id>", methods=["PUT"])
@require_auth
def update_hotel(entity_id: int):
    """Atualiza dados do hotel."""
    existing, existing_status = hotel_crud.process_read_by_id(entity_id)
    existing, existing_status = scope_record_response("hotel", existing, current_user())
    if existing_status != 200:
        return jsonify(existing), existing_status
    payload = request.get_json(silent=True) or {}
    res, status = hotel_crud.process_update(entity_id, payload)
    return jsonify(res), status

@hotel_bp.route("/<int:entity_id>", methods=["DELETE"])
@require_auth
def delete_hotel(entity_id: int):
    """Exclui um hotel."""
    existing, existing_status = hotel_crud.process_read_by_id(entity_id)
    existing, existing_status = scope_record_response("hotel", existing, current_user())
    if existing_status != 200:
        return jsonify(existing), existing_status
    res, status = hotel_crud.process_delete(entity_id)
    return jsonify(res), status
