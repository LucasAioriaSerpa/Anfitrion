
import sys, os

from flask import Flask, jsonify, Response

if getattr(sys, 'frozen', False): BASE_DIR = sys._MEIPASS
else: BASE_DIR = os.path.dirname(os.path.abspath(__file__))

from config.Config import Config
from utils.Loggers import Logger

class App:
    __log = Logger()
    __config = Config()
    def __init__(self) -> None:
        self.__log.log_info("[ FLASK ] - Inicializando <App>")
        self.app = Flask(__name__)
        self._register_routes()

    def _register_routes(self):
        self.__log.log_info("[ FLASK ] - Registrando rotas")
        @self.app.route("/") #? para cada rota adicionar uma função privada para aquela rota
        def index(): return self.__index()

    def __index(self):
        return jsonify(message="Hello world", status=200, mimetype="application/json")

    def run(self):
        self.__log.log_info("[ FLASK ] - Inicializando e rodando FLASK")
        self.app.run(debug=True, use_reloader=False, host="0.0.0.0", port=5000)
