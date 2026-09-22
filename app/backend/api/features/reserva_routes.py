from flask import Blueprint, request, jsonify

try:
    from api.templates.entities.reserva_template import ReservaCrudTemplate
    from utils.Loggers import Logger
except ImportError:
    from app.backend.api.templates.entities.reserva_template import ReservaCrudTemplate
    from app.backend.utils.Loggers import Logger

reserva_bp = Blueprint("reserva", __name__, url_prefix="/api/reserva")
reserva_crud = ReservaCrudTemplate()
log = Logger()

@reserva_bp.route("", methods=["GET"])
@reserva_bp.route("/", methods=["GET"])
def list_reservas():
    """Lista todas as reservas."""
    filters = request.args.to_dict()
    res, status = reserva_crud.process_read_all(filters)
    return jsonify(res), status

@reserva_bp.route("/<int:entity_id>", methods=["GET"])
def get_reserva(entity_id: int):
    """Busca detalhes de uma reserva por ID."""
    res, status = reserva_crud.process_read_by_id(entity_id)
    return jsonify(res), status

@reserva_bp.route("", methods=["POST"])
@reserva_bp.route("/", methods=["POST"])
def create_reserva():
    """Cria uma nova reserva."""
    payload = request.get_json(silent=True) or {}
    res, status = reserva_crud.process_create(payload)
    return jsonify(res), status

@reserva_bp.route("/<int:entity_id>", methods=["PUT"])
def update_reserva(entity_id: int):
    """Atualiza dados de uma reserva."""
    payload = request.get_json(silent=True) or {}
    res, status = reserva_crud.process_update(entity_id, payload)
    return jsonify(res), status

@reserva_bp.route("/<int:entity_id>", methods=["DELETE"])
def delete_reserva(entity_id: int):
    """Cancela/remove uma reserva e libera o quarto."""
    res, status = reserva_crud.process_delete(entity_id)
    return jsonify(res), status
