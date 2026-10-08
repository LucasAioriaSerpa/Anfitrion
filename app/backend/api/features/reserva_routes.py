from flask import Blueprint, request, jsonify

try:
    from api.templates.entities.reserva_template import ReservaCrudTemplate
    from utils.Loggers import Logger
    from app.backend.api.auth.auth_context import current_user, payload_belongs_to_hotel, require_auth, scope_list_response, scope_record_response
except ImportError or ModuleNotFoundErro:
    from app.backend.api.templates.entities.reserva_template import ReservaCrudTemplate
    from app.backend.utils.Loggers import Logger
    from app.backend.api.auth.auth_context import current_user, payload_belongs_to_hotel, require_auth, scope_list_response, scope_record_response

reserva_bp = Blueprint("reserva", __name__, url_prefix="/api/reserva")
reserva_crud = ReservaCrudTemplate()
log = Logger()

@reserva_bp.route("", methods=["GET"])
@reserva_bp.route("/", methods=["GET"])
@require_auth
def list_reservas():
    """Lista todas as reservas."""
    filters = request.args.to_dict()
    res, status = reserva_crud.process_read_all(filters)
    res = scope_list_response("reserva", res, current_user())
    return jsonify(res), status

@reserva_bp.route("/<int:entity_id>", methods=["GET"])
@require_auth
def get_reserva(entity_id: int):
    """Busca detalhes de uma reserva por ID."""
    res, status = reserva_crud.process_read_by_id(entity_id)
    res, status = scope_record_response("reserva", res, current_user())
    return jsonify(res), status

@reserva_bp.route("", methods=["POST"])
@reserva_bp.route("/", methods=["POST"])
@require_auth
def create_reserva():
    """Cria uma nova reserva."""
    payload = request.get_json(silent=True) or {}
    if not payload_belongs_to_hotel("reserva", payload, current_user()):
        return jsonify({"success": False, "message": "Reserva fora do hotel autorizado", "data": None}), 403
    res, status = reserva_crud.process_create(payload)
    return jsonify(res), status

@reserva_bp.route("/<int:entity_id>", methods=["PUT"])
@require_auth
def update_reserva(entity_id: int):
    """Atualiza dados de uma reserva."""
    existing, existing_status = reserva_crud.process_read_by_id(entity_id)
    existing, existing_status = scope_record_response("reserva", existing, current_user())
    if existing_status != 200:
        return jsonify(existing), existing_status
    payload = request.get_json(silent=True) or {}
    if "id_quarto" in payload and not payload_belongs_to_hotel("reserva", payload, current_user()):
        return jsonify({"success": False, "message": "Reserva fora do hotel autorizado", "data": None}), 403
    res, status = reserva_crud.process_update(entity_id, payload)
    return jsonify(res), status

@reserva_bp.route("/<int:entity_id>", methods=["DELETE"])
@require_auth
def delete_reserva(entity_id: int):
    """Cancela/remove uma reserva e libera o quarto."""
    existing, existing_status = reserva_crud.process_read_by_id(entity_id)
    existing, existing_status = scope_record_response("reserva", existing, current_user())
    if existing_status != 200:
        return jsonify(existing), existing_status
    res, status = reserva_crud.process_delete(entity_id)
    return jsonify(res), status
