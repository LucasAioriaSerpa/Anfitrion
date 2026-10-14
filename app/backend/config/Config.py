
import os, sys
from typing import Any
from threading import Lock

try:
    from meta.Singleton import Singleton
    from utils.Loggers import Logger
except ImportError:
    from app.backend.meta.Singleton import Singleton
    from app.backend.utils.Loggers import Logger

class Config(metaclass=Singleton):
    """
    Design Pattern: SINGLETON
    Classe central de configurações do sistema Anfitrião.
    Armazena constantes, caminhos e variáveis compartilhadas entre Threads (MAIN e FLASK).
    """
    _OS_PATH = os.path
    __log = Logger()
    _lock = Lock()

    if getattr(sys, 'frozen', False): ROOT_DIR = getattr(sys, '_MEIPASS', _OS_PATH.dirname(_OS_PATH.dirname(_OS_PATH.abspath(__file__))))
    else: ROOT_DIR = _OS_PATH.dirname(_OS_PATH.dirname(_OS_PATH.abspath(__file__))) #* Diretório raiz do backend (/app/backend)
    
    app_dir = _OS_PATH.dirname(_OS_PATH.dirname(_OS_PATH.dirname(_OS_PATH.abspath(__file__)))) #* /app
    db_dir = _OS_PATH.join(app_dir, "database") #* /app/database
    if not _OS_PATH.exists(db_dir): os.makedirs(db_dir, exist_ok=True)
    
    ASSETS_DIR = _OS_PATH.join(ROOT_DIR, "assets")
    FAVICON_FILE = "favicon.ico"
    LOGO_ANFITRION = "logo-Anfitrion.png"
    DB_NAME = "db_anfitrion.db"
    DATABASE_DIR = _OS_PATH.join(db_dir, DB_NAME)
    FLASK_HOST = "0.0.0.0"
    FLASK_PORT = 5000
    FLASK_DEBUG = True
    API_PREFIX = "/api"
    MAIN_SLEEP_INTERVAL = 3
    TABLES = ["hospede", "hotel", "quarto", "funcionario", "reserva"]
    TABLE_PRIMARY_KEYS = {
        "hospede": "id_hospede",
        "hotel": "id_hotel",
        "quarto": "id_quarto",
        "funcionario": "id_funcionario",
        "reserva": "id_reserva"
    }
    STATUS_QUARTO = ["Disponível", "Ocupado", "Manutenção", "Limpeza"]
    CARGOS_FUNCIONARIO = ["Gerente", "Recepcionista", "Camareira", "Governanta", "Concierge"]
    AUTH_SECRET = os.getenv("ANFITRION_AUTH_SECRET", "anfitrion-development-secret")
    AUTH_TOKEN_MAX_AGE = 60 * 60 * 8
    AUTH_TOKEN_SALT = "anfitrion-auth"
    AUTH_QUERY_ENABLED = os.getenv("ANFITRION_AUTH_QUERY_ENABLED", "true").lower() == "true"
    ALGORITHM = "sha256"
    ITERATIONS = 600_000
    SALT_BYTES = 16

    def __init__(self) -> None:
        self._shared_store: dict = {
            "ASSETS_DIR": self.ASSETS_DIR,
            "FAVICON_FILE": self.FAVICON_FILE,
            "LOGO_ANFITRION": self.LOGO_ANFITRION,
            "DATABASE_DIR": self.DATABASE_DIR,
            "DB_NAME": self.DB_NAME,
            "FLASK_HOST": self.FLASK_HOST,
            "FLASK_PORT": self.FLASK_PORT,
            "FLASK_DEBUG": self.FLASK_DEBUG,
            "API_PREFIX": self.API_PREFIX,
            "MAIN_SLEEP_INTERVAL": self.MAIN_SLEEP_INTERVAL,
            "TABLES": self.TABLES,
            "TABLE_PRIMARY_KEYS": self.TABLE_PRIMARY_KEYS,
            "STATUS_QUARTO": self.STATUS_QUARTO,
            "CARGOS_FUNCIONARIO": self.CARGOS_FUNCIONARIO,
            "AUTH_SECRET": self.AUTH_SECRET,
            "AUTH_TOKEN_MAX_AGE": self.AUTH_TOKEN_MAX_AGE,
            "AUTH_TOKEN_SALT": self.AUTH_TOKEN_SALT,
            "AUTH_QUERY_ENABLED": self.AUTH_QUERY_ENABLED,
            "ALGORITHM": self.ALGORITHM,
            "ITERATIONS": self.ITERATIONS,
            "SALT_BYTES": self.SALT_BYTES,
            "IS_RUNNING": True,
            "STATS": {
                "quartos_disponiveis": 0,
                "quartos_ocupados": 0,
                "taxa_ocupacao": 0,
                "taxa_ocupacao_por_hotel": [{}],
                "total_hospedes": 0,
                "total_hoteis": 0,
                "total_quartos": 0,
                "total_reservas": 0,
                "ultima_execucao_main": ""
            },
            "BACKGROUND_TASKS_COUNTER": 0
        }

    def get(self, var_class: str) -> str | int | float | list[Any] | dict[Any, Any] | None:
        """Obtém uma variável constante ou compartilhada com segurança entre threads."""
        self._lock.acquire()
        try:
            if var_class in self._shared_store: return self._shared_store[var_class]
            if hasattr(self, var_class): return getattr(self, var_class)
            self.__log.log_warning(f"[ Config.py ] - Variável <{var_class}> não encontrada!")
            return None
        finally: self._lock.release()

    def set(self, var_class: str, new_value: Any) -> None:
        """Define ou atualiza uma variável compartilhada entre threads com thread safety."""
        self._lock.acquire()
        try:
            self._shared_store[var_class] = new_value
            setattr(self, var_class, new_value)
            self.__log.log_info(f"[ Config.py ] - Variável <{var_class}> atualizada entre threads")
        finally: self._lock.release()

DATABASE_DIR = Config().DATABASE_DIR

