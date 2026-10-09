from typing import Any

from flask import Blueprint, request, jsonify

try:
    from api.auth.auth_context import can_access_record, current_user
    from api.auth.cargo_guard import CARGOS_GERENCIA, require_cargo
    from api.templates.entities_tarifa import get_tarifa_template, listar_politicas, POLITICAS
    from manager.Database import Database
    from utils.Loggers import Logger
except ImportError:
    from app.backend.api.auth.auth_context import can_access_record, current_user
    from app.backend.api.auth.cargo_guard import CARGOS_GERENCIA, require_cargo
    from app.backend.api.templates.entities_tarifa import get_tarifa_template, listar_politicas, POLITICAS
    from app.backend.manager.Database import Database
    from app.backend.utils.Loggers import Logger

tarifa_bp = Blueprint("tarifa", __name__, url_prefix="/api/tarifa")
db = Database()
log = Logger()

CAMPOS_TAXA = ("taxa_pet", "taxa_refeicao", "taxa_cafe_manha", "taxa_almoco", "taxa_jantar")


def _ok(data: Any, message: str = "Cálculo realizado") -> tuple[Any, int]: return jsonify({"success": True, "status": 200, "message": message, "data": data}), 200


def _fail(message: str, status: int) -> tuple[Any, int]: return jsonify({"success": False, "status": status, "message": message, "data": None}), status


def _first(table: str, key: str, value: Any) -> dict[str, Any] | None:
    rows = [row for row in db.read(table, {key: value}) if row]
    return rows[0] if rows else None


def _load_reserva_context(id_reserva: int):
    """Carrega reserva, quarto e hóspede respeitando o escopo do hotel do funcionário."""
    user = current_user()
    reserva = _first("reserva", "id_reserva", id_reserva)
    if not reserva or not can_access_record("reserva", reserva, user):
        return None, None, None
    quarto = _first("quarto", "id_quarto", reserva["id_quarto"])
    hospede = _first("hospede", "id_hospede", reserva["id_hospede"])
    return reserva, quarto, hospede


@tarifa_bp.route("/politicas", methods=["GET"])
@require_cargo(*CARGOS_GERENCIA)
def list_politicas():
    """Lista as políticas de tarifa disponíveis."""
    return _ok(listar_politicas(), "Políticas disponíveis")


@tarifa_bp.route("/reserva/<int:id_reserva>", methods=["GET"])
@require_cargo(*CARGOS_GERENCIA)
def calcular_reserva(id_reserva: int):
    """Calcula o valor de uma reserva existente. Query: ?politica=padrao|fidelidade|temporada|longa_estadia"""
    reserva, quarto, hospede = _load_reserva_context(id_reserva)
    if not reserva or not quarto:
        return _fail("Reserva não encontrada", 404)
    try:
        template = get_tarifa_template(request.args.get("politica"))
        return _ok(template.calculate(reserva, quarto, hospede))
    except ValueError as error:
        return _fail(str(error), 400)


@tarifa_bp.route("/reserva/<int:id_reserva>/comparar", methods=["GET"])
@require_cargo(*CARGOS_GERENCIA)
def comparar_reserva(id_reserva: int):
    """Calcula a mesma reserva em todas as políticas, para o gerente comparar."""
    reserva, quarto, hospede = _load_reserva_context(id_reserva)
    if not reserva or not quarto:
        return _fail("Reserva não encontrada", 404)
    try:
        calculos = [cls().calculate(reserva, quarto, hospede) for cls in POLITICAS.values()]
    except ValueError as error:
        return _fail(str(error), 400)
    return _ok({
        "id_reserva": id_reserva,
        "calculos": calculos,
        "menor_total": min(calculos, key=lambda c: c["total"])["politica"],
        "maior_total": max(calculos, key=lambda c: c["total"])["politica"],
    }, "Comparativo de políticas")


@tarifa_bp.route("/simular", methods=["POST"])
@require_cargo(*CARGOS_GERENCIA)
def simular():
    """
    Simula uma reserva que ainda não existe.
    Body: {id_quarto, check_in, check_out, id_hospede?, politica?, taxa_pet?, taxa_refeicao?,
           taxa_cafe_manha?, taxa_almoco?, taxa_jantar?}
    """
    payload = request.get_json(silent=True) or {}
    for campo in ("id_quarto", "check_in", "check_out"):
        if not payload.get(campo):
            return _fail(f"O campo '{campo}' é obrigatório", 400)

    quarto = _first("quarto", "id_quarto", payload["id_quarto"])
    if not quarto or not can_access_record("quarto", quarto, current_user()):
        return _fail("Quarto não encontrado", 404)

    hospede = _first("hospede", "id_hospede", payload["id_hospede"]) if payload.get("id_hospede") else None
    reserva = {
        "id_quarto": quarto["id_quarto"],
        "id_hospede": hospede["id_hospede"] if hospede else None,
        "check_in": payload["check_in"],
        "check_out": payload["check_out"],
    }
    try:
        for campo in CAMPOS_TAXA:
            reserva[campo] = float(payload.get(campo) or 0.0)
        template = get_tarifa_template(payload.get("politica"))
        return _ok(template.calculate(reserva, quarto, hospede))
    except (ValueError, TypeError) as error:
        return _fail(str(error), 400)
