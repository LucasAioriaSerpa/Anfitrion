
import sys, os

from flask import Flask, Response

if getattr(sys, 'frozen', False): BASE_DIR = sys._MEIPASS
else: BASE_DIR = os.path.dirname(os.path.abspath(__file__))

from utils.Loggers import Logger

class App:
    __log = Logger()
    def __init__(self) -> None:
        self.__log.log_info("[ App.py ] - Inicializando <App>")
        self.app = Flask(__name__)
        self._register_routes()

    def _register_routes(self):
        self.__log.log_info("[ App.py ] - Registrando rotas")
        @self.app.route("/")
        def index(): return "Hello world!"
    
    def run(self):
        self.__log.log_info("[ App.py ] - Inicializando e rodando FLASK")
        self.app.run(debug=True, use_reloader=False, host="0.0.0.0", port=5000)
