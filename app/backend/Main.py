
from threading import Thread
import sys, os, time

if getattr(sys, 'frozen', False): BASE_DIR = sys._MEIPASS
else: BASE_DIR = os.path.dirname(os.path.abspath(__file__))

from manager.Database import Database
from config.Config import Config
from utils.Loggers import Logger

class Main:
    __config = Config()
    __log = Logger()
    __db = Database()
    def __init__(self) -> None: 
        self.__log.log_info("[ Main.py ] - Inicializando <Main>")
        self.__log.log_info("[ Main.py ] - Verificando existencia das tabelas")
    
    def __check_tables(self, tables=["hospede","hotel","quarto","funcionario","reserva"]) -> bool:
        for i in range(len(tables)):
            try: self.__db.read(tables[i], {})
            except: self.__log.log_error(f"[ Main.py ] - tabela não encontrada | <{tables[i]}>"); return False
        return True
    
    def run(self):
        if not self.__check_tables():
            self.__log.log_info("[ Main.py ] - Configurando banco de dados SQLite & inserindo tabelas")
            try:     from database import Setup_db 
            except:  self.__log.log_error("[ Main.py ] - Erro ao realizar o setup_db.py em <Anfitrion/app/backend/database/Setup_db.py>"); return None
            finally: self.__log.log_success("[ Main.py ] - SQLite configurado e tabelas inseridas com sucesso")
        while True:
            self.__log.log_info("[ MAIN ] - running...") #TODO: apos adicionar as funcionalidades que precisam ser processadas e geradas pf remover para não poluir o terminal & logs
            time.sleep(1)

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
