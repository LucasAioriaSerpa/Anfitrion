from flask import Blueprint, request, jsonify

try:
    from api.templates.entities.hotel_template import HotelCrudTemplate
    from utils.Loggers import Logger
except ImportError:
    from app.backend.api.templates.entities.hotel_template import HotelCrudTemplate
    from app.backend.utils.Loggers import Logger

hotel_bp = Blueprint("hotel", __name__, url_prefix="/api/hotel")
hotel_crud = HotelCrudTemplate()
log = Logger()

@hotel_bp.route("", methods=["GET"])
@hotel_bp.route("/", methods=["GET"])
def list_hoteis():
    """Lista todos os hotéis."""
    filters = request.args.to_dict()
    res, status = hotel_crud.process_read_all(filters)
    return jsonify(res), status

@hotel_bp.route("/<int:entity_id>", methods=["GET"])
def get_hotel(entity_id: int):
    """Busca um hotel específico por ID."""
    res, status = hotel_crud.process_read_by_id(entity_id)
    return jsonify(res), status

@hotel_bp.route("", methods=["POST"])
@hotel_bp.route("/", methods=["POST"])
def create_hotel():
    """Cadastra um novo hotel."""
    payload = request.get_json(silent=True) or {}
    res, status = hotel_crud.process_create(payload)
    return jsonify(res), status

@hotel_bp.route("/<int:entity_id>", methods=["PUT"])
def update_hotel(entity_id: int):
    """Atualiza dados do hotel."""
    payload = request.get_json(silent=True) or {}
    res, status = hotel_crud.process_update(entity_id, payload)
    return jsonify(res), status

@hotel_bp.route("/<int:entity_id>", methods=["DELETE"])
def delete_hotel(entity_id: int):
    """Exclui um hotel."""
    res, status = hotel_crud.process_delete(entity_id)
    return jsonify(res), status
