
import sys, os

from flask import Flask, Response

if getattr(sys, 'frozen', False): BASE_DIR = sys._MEIPASS
else: BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class App:
    def __init__(self) -> None:
        self.app = Flask(__name__)
        self._register_routes()

    def _register_routes(self):
        @self.app.route("/")
        def index(): return "Hello world"
    
    def run(self): 
        print("flask")
        self.app.run(debug=True, use_reloader=False, host="0.0.0.0", port=5000)
