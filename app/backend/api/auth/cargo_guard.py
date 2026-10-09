from functools import wraps
from typing import Any, Callable

from flask import jsonify

try:
    from api.auth.auth_context import current_user, is_employee, require_auth
    from manager.Database import Database
except ImportError:
    from app.backend.api.auth.auth_context import current_user, is_employee, require_auth
    from app.backend.manager.Database import Database

_db = Database()

#* "gerente" já cobre "Gerente Geral" e "Subgerente" (mesma regra de Funcionario.isGerenteOuSuperior no frontend)
CARGOS_GERENCIA = ("admin", "gerente", "subgerente")
CARGOS_RECEPCAO = CARGOS_GERENCIA + ("recep",)


def user_cargo(user: dict[str, Any]) -> str:
    """Cargo do funcionário autenticado, lido do banco (o token não carrega o cargo)."""
    funcionario_id = user.get("id_funcionario")
    if not funcionario_id: return ""
    rows = [row for row in _db.read("funcionario", {"id_funcionario": funcionario_id}) if row]
    return str(rows[0].get("cargo", "")).strip().lower() if rows else ""


def require_cargo(*allowed: str) -> Callable:
    """
    Exige autenticação e que o cargo do funcionário contenha um dos trechos informados.
    Uso: @require_cargo(*CARGOS_GERENCIA) abaixo do @route.
    """
    def decorator(view: Callable) -> Callable:
        @wraps(view)
        def wrapped(*args, **kwargs):
            user = current_user()
            cargo = user_cargo(user)
            if not is_employee(user) or not any(trecho in cargo for trecho in allowed):
                return jsonify({
                    "success": False,
                    "status": 403,
                    "message": "Cargo sem permissão para este recurso",
                    "data": None,
                }), 403
            return view(*args, **kwargs)
        return require_auth(wrapped)
    return decorator
