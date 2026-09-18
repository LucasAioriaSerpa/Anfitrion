
from threading import Thread
import sys, os

if getattr(sys, 'frozen', False): BASE_DIR = sys._MEIPASS
else: BASE_DIR = os.path.dirname(os.path.abspath(__file__))

from utils.Loggers import Logger

class Main:
    __log = Logger()
    def __init__(self) -> None: self.__log.log_info("[ Main.py ] - Inicializando <Main>")
    def run(self):
        self.__log.log_info("[ Main.py ] - Configurando banco de dados SQLite & inserindo tabelas")
        try:     from database import Setup_db 
        except:  self.__log.log_error("[ Main.py ] - Erro ao realizar o setup_db.py em <Anfitrion/app/backend/database/Setup_db.py>")
        finally: self.__log.log_success("[ Main.py ] - SQLite configurado e tabelas inseridas com sucesso")

if "__main__" == __name__:
    log = Logger()
    log.log_info("[ Main.py ] - configurando as Threads")
    try:
        from api.App import App
        main = Thread(target=Main().run)
        flask = Thread(target=App().run)
    except: log.log_error("[ Main.py ] - Erro ao configurar as Threads"); exit()
    finally: log.log_success("[ Main.py ] - Threads configuradas com sucesso!")
    main.start()
    flask.start()
