from flask import Blueprint, request, jsonify

try:
    from api.templates.entities.hospede_template import HospedeCrudTemplate
    from utils.Loggers import Logger
except ImportError:
    from app.backend.api.templates.entities.hospede_template import HospedeCrudTemplate
    from app.backend.utils.Loggers import Logger

hospede_bp = Blueprint("hospede", __name__, url_prefix="/api/hospede")
hospede_crud = HospedeCrudTemplate()
log = Logger()

@hospede_bp.route("", methods=["GET"])
@hospede_bp.route("/", methods=["GET"])
def list_hospedes():
    """Lista todos os hóspedes com suporte a filtros via query params."""
    filters = request.args.to_dict()
    res, status = hospede_crud.process_read_all(filters)
    return jsonify(res), status

@hospede_bp.route("/<int:entity_id>", methods=["GET"])
def get_hospede(entity_id: int):
    """Busca um hóspede por ID."""
    res, status = hospede_crud.process_read_by_id(entity_id)
    return jsonify(res), status

@hospede_bp.route("", methods=["POST"])
@hospede_bp.route("/", methods=["POST"])
def create_hospede():
    """Cria um novo hóspede."""
    payload = request.get_json(silent=True) or {}
    res, status = hospede_crud.process_create(payload)
    return jsonify(res), status

@hospede_bp.route("/<int:entity_id>", methods=["PUT"])
def update_hospede(entity_id: int):
    """Atualiza dados de um hóspede."""
    payload = request.get_json(silent=True) or {}
    res, status = hospede_crud.process_update(entity_id, payload)
    return jsonify(res), status

@hospede_bp.route("/<int:entity_id>", methods=["DELETE"])
def delete_hospede(entity_id: int):
    """Remove um hóspede."""
    res, status = hospede_crud.process_delete(entity_id)
    return jsonify(res), status
