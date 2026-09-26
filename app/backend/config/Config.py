
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

    DB_NAME = "db_anfitrion.db"
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

    def __init__(self) -> None:
        app_dir = self._OS_PATH.dirname(self._OS_PATH.dirname(self._OS_PATH.dirname(self._OS_PATH.abspath(__file__))))
        db_dir = self._OS_PATH.join(app_dir, "database") #* /app/database
        if not self._OS_PATH.exists(db_dir): os.makedirs(db_dir, exist_ok=True)
        self.DATABASE_DIR = self._OS_PATH.join(db_dir, self.DB_NAME)

        self._shared_store: dict = {
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
            "IS_RUNNING": True,
            "STATS": {
                "total_hospedes": 0,
                "total_hoteis": 0,
                "total_quartos": 0,
                "total_reservas": 0,
                "taxa_ocupacao": 0.0,
                "ultima_execucao_main": None
            },
            "BACKGROUND_TASKS_COUNTER": 0
        }

    def get(self, var_class: str) -> str | int | float | None:
        """Obtém uma variável constante ou compartilhada com segurança entre threads."""
        with self._lock:
            if var_class in self._shared_store:
                return self._shared_store[var_class]
            if hasattr(self, var_class):
                return getattr(self, var_class)
            self.__log.log_warning(f"[ Config.py ] - Variável <{var_class}> não encontrada!")
            return None

    def set(self, var_class: str, new_value: Any) -> None:
        """Define ou atualiza uma variável compartilhada entre threads com thread safety."""
        with self._lock:
            self._shared_store[var_class] = new_value
            setattr(self, var_class, new_value)
            self.__log.log_info(f"[ Config.py ] - Variável <{var_class}> atualizada entre threads")

DATABASE_DIR = Config().DATABASE_DIR

