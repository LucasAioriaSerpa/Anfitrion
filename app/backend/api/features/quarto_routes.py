from flask import Blueprint, request, jsonify

try:
    from api.templates.entities.quarto_template import QuartoCrudTemplate
    from utils.Loggers import Logger
except ImportError:
    from app.backend.api.templates.entities.quarto_template import QuartoCrudTemplate
    from app.backend.utils.Loggers import Logger

quarto_bp = Blueprint("quarto", __name__, url_prefix="/api/quarto")
quarto_crud = QuartoCrudTemplate()
log = Logger()

@quarto_bp.route("", methods=["GET"])
@quarto_bp.route("/", methods=["GET"])
def list_quartos():
    """Lista todos os quartos, permitindo filtros por status, hotel, andar, tipo."""
    filters = request.args.to_dict()
    res, status = quarto_crud.process_read_all(filters)
    return jsonify(res), status

@quarto_bp.route("/<int:entity_id>", methods=["GET"])
def get_quarto(entity_id: int):
    """Busca detalhes de um quarto por ID."""
    res, status = quarto_crud.process_read_by_id(entity_id)
    return jsonify(res), status

@quarto_bp.route("", methods=["POST"])
@quarto_bp.route("/", methods=["POST"])
def create_quarto():
    """Cadastra um novo quarto."""
    payload = request.get_json(silent=True) or {}
    res, status = quarto_crud.process_create(payload)
    return jsonify(res), status

@quarto_bp.route("/<int:entity_id>", methods=["PUT"])
def update_quarto(entity_id: int):
    """Atualiza dados do quarto (status, diária, tipo, etc.)."""
    payload = request.get_json(silent=True) or {}
    res, status = quarto_crud.process_update(entity_id, payload)
    return jsonify(res), status

@quarto_bp.route("/<int:entity_id>", methods=["DELETE"])
def delete_quarto(entity_id: int):
    """Remove um quarto."""
    res, status = quarto_crud.process_delete(entity_id)
    return jsonify(res), status
