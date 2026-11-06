from .hospede_routes import hospede_bp
from .hotel_routes import hotel_bp
from .quarto_routes import quarto_bp
from .funcionario_routes import funcionario_bp
from .reserva_routes import reserva_bp
from .auth_routes import auth_bp
from .notificacao_routes import notificacao_bp
from .tarifa_routes import tarifa_bp
try:
    from app.backend.database.FIRST.generated import generated_bp
except ImportError:
    from database.FIRST.generated import generated_bp

__all__ = [
    "hospede_bp",
    "hotel_bp",
    "quarto_bp",
    "funcionario_bp",
    "reserva_bp",
    "auth_bp",
    "notificacao_bp",
    "tarifa_bp",
    "generated_bp",
]
