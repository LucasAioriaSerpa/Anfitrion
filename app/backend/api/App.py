import sys, os
from flask import Flask, jsonify, request

if getattr(sys, 'frozen', False): BASE_DIR = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
else: BASE_DIR = os.path.dirname(os.path.abspath(__file__))

try:
    from config.Config import Config
    from utils.Loggers import Logger
    from api.features import (
        hospede_bp,
        hotel_bp,
        quarto_bp,
        funcionario_bp,
        reserva_bp,
        auth_bp
    )
except ImportError:
    from app.backend.config.Config import Config
    from app.backend.utils.Loggers import Logger
    from app.backend.api.features import (
        hospede_bp,
        hotel_bp,
        quarto_bp,
        funcionario_bp,
        reserva_bp,
        auth_bp
    )

class App:
    """_summary_
    # Servidor de Aplicação Web Flask.
    - Executado em uma Thread dedicada iniciada por Main.py.
    - Atende às requisições do frontend React com CRUDs e autenticação através de Blueprints.
    """
    __log = Logger()
    __config = Config()

    def __init__(self) -> None:
        self.__log.log_info("[ FLASK ] - Inicializando <App>")
        self.app = Flask(__name__)
        self._configure_cors()
        self._register_routes()
        self._register_blueprints()

    def _configure_cors(self):
        """Configura cabeçalhos CORS para permitir comunicação com o frontend React."""
        @self.app.after_request
        def after_request(response):
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
            return response

        @self.app.route("/<path:path>", methods=["OPTIONS"])
        def handle_options(path):
            return jsonify(status="ok"), 200

    def _register_routes(self):
        self.__log.log_info("[ FLASK ] - Registrando rotas base")

        @self.app.route("/")
        def index():
            return self.__index()

        @self.app.route("/api")
        @self.app.route("/api/")
        def api_root():
            return jsonify({
                "message": "API Anfitrião - Sistema de Gestão Hoteleira",
                "status": 200,
                "endpoints": {
                    "hospede": "/api/hospede",
                    "hotel": "/api/hotel",
                    "quarto": "/api/quarto",
                    "funcionario": "/api/funcionario",
                    "reserva": "/api/reserva",
                    "auth": "/api/auth"
                }
            })

    def _register_blueprints(self):
        self.__log.log_info("[ FLASK ] - Registrando Blueprints do Flask")
        blueprints = [
            ("hospede", hospede_bp),
            ("hotel", hotel_bp),
            ("quarto", quarto_bp),
            ("funcionario", funcionario_bp),
            ("reserva", reserva_bp),
            ("auth", auth_bp)
        ]

        for name, bp in blueprints:
            try:
                self.app.register_blueprint(bp)
                self.__log.log_info(f"[ FLASK ] - Blueprint registrado com sucesso: <{name}>")
            except Exception as e:
                self.__log.log_error(f"[ FLASK ] - Erro ao registrar blueprint <{name}>: {str(e)}")

        self.__log.log_success("[ FLASK ] - Todos os Blueprints foram registrados com sucesso!")

    def __index(self):
        return jsonify(
            message="Anfitrião API em execução",
            status=200,
            docs="/api",
            database="SQLite (db_anfitrion.db)"
        )

    def run(self):
        host = str(self.__config.get("FLASK_HOST") or "0.0.0.0")
        port = int(self.__config.get("FLASK_PORT") or 5000)
        debug = bool(self.__config.get("FLASK_DEBUG") or False)
        self.__log.log_info(f"[ FLASK ] - Inicializando e rodando FLASK em http://{host}:{port}")
        self.app.run(debug=debug, use_reloader=False, host=host, port=port)
