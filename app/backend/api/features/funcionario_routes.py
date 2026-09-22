from flask import Blueprint, request, jsonify

try:
    from api.templates.entities.funcionario_template import FuncionarioCrudTemplate
    from utils.Loggers import Logger
except ImportError:
    from app.backend.api.templates.entities.funcionario_template import FuncionarioCrudTemplate
    from app.backend.utils.Loggers import Logger

funcionario_bp = Blueprint("funcionario", __name__, url_prefix="/api/funcionario")
funcionario_crud = FuncionarioCrudTemplate()
log = Logger()

@funcionario_bp.route("", methods=["GET"])
@funcionario_bp.route("/", methods=["GET"])
def list_funcionarios():
    """Lista todos os funcionários cadastrados."""
    filters = request.args.to_dict()
    res, status = funcionario_crud.process_read_all(filters)
    return jsonify(res), status

@funcionario_bp.route("/<int:entity_id>", methods=["GET"])
def get_funcionario(entity_id: int):
    """Busca detalhes de um funcionário por ID."""
    res, status = funcionario_crud.process_read_by_id(entity_id)
    return jsonify(res), status

@funcionario_bp.route("", methods=["POST"])
@funcionario_bp.route("/", methods=["POST"])
def create_funcionario():
    """Cadastra um novo funcionário."""
    payload = request.get_json(silent=True) or {}
    res, status = funcionario_crud.process_create(payload)
    return jsonify(res), status

@funcionario_bp.route("/<int:entity_id>", methods=["PUT"])
def update_funcionario(entity_id: int):
    """Atualiza dados do funcionário."""
    payload = request.get_json(silent=True) or {}
    res, status = funcionario_crud.process_update(entity_id, payload)
    return jsonify(res), status

@funcionario_bp.route("/<int:entity_id>", methods=["DELETE"])
def delete_funcionario(entity_id: int):
    """Exclui um funcionário."""
    res, status = funcionario_crud.process_delete(entity_id)
    return jsonify(res), status
