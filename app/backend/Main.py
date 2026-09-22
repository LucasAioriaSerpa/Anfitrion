import sys, os, time
from datetime import datetime
from threading import Thread

if getattr(sys, 'frozen', False): BASE_DIR = getattr(sys, '_MEIPASS')
else: BASE_DIR = os.path.dirname(os.path.abspath(__file__))

if BASE_DIR not in sys.path: sys.path.insert(0, BASE_DIR)

try:
    from manager.Database import Database
    from config.Config import Config
    from utils.Loggers import Logger
except ImportError:
    from app.backend.manager.Database import Database
    from app.backend.config.Config import Config
    from app.backend.utils.Loggers import Logger

class Main:
    """_summary_
    # Processador Principal (Thread MAIN).
    ## Executa tarefas em segundo plano e processamentos mais pesados:
    - Verificação e auditoria de integridade do banco de dados
    - Atualização e expiração automática de reservas
    - Cálculo de métricas e taxa de ocupação hoteleira
    - Armazenamento de estatísticas no Config compartilhado entre Threads
    """
    __config = Config()
    __log = Logger()
    __db = Database()

    def __init__(self) -> None:
        self.__log.log_info("[ Main.py ] - Inicializando <Main>")
        self.__log.log_info("[ Main.py ] - Verificando existência das tabelas")

    def __check_tables(self, tables=None) -> bool:
        configured_tables = self.__config.get("TABLES")
        target_tables = tables or (
            configured_tables
            if isinstance(configured_tables, (list, tuple, set))
            else ["hospede", "hotel", "quarto", "funcionario", "reserva"]
        )
        for table in target_tables:
            try: self.__db.read(table, {})
            except Exception: self.__log.log_error(f"[ Main.py ] - Tabela não encontrada ou inacessível | <{table}>"); return False
        return True

    def __seed_initial_data(self) -> None:
        """Popula o banco com dados iniciais se estiver vazio para facilitar testes pelo React."""
        try:
            hoteis = self.__db.read("hotel", {})
            if not hoteis:
                self.__log.log_info("[ Main.py ] - Banco vazio detectado. Inserindo dados semente (Seed)...")
                
                #? 1. Hotel padrão
                id_hotel = self.__db.create("hotel", {
                    "cnpj": "12.345.678/0001-90",
                    "franquia": "Anfitrião Hotéis & Resorts",
                    "nome": "Anfitrião Grand Hotel",
                    "endereso": "Avenida Atlântica, 1500 - Copacabana",
                    "qtd_quartos": 10
                })

                #? 2. Quartos padrão
                quartos_seed = [
                    {"id_hotel": id_hotel, "tipo": "Standard Solteiro", "status": "Disponível", "andar": 1, "num_quarto": 101, "diaria": 120.0},
                    {"id_hotel": id_hotel, "tipo": "Standard Casal", "status": "Disponível", "andar": 1, "num_quarto": 102, "diaria": 180.0},
                    {"id_hotel": id_hotel, "tipo": "Suíte Luxo", "status": "Disponível", "andar": 2, "num_quarto": 201, "diaria": 320.0},
                    {"id_hotel": id_hotel, "tipo": "Suíte Presidencial", "status": "Disponível", "andar": 3, "num_quarto": 301, "diaria": 650.0}
                ]
                for q in quartos_seed:
                    self.__db.create("quarto", q)

                #? 3. Usuário e Funcionário administrador
                id_hosp_admin = self.__db.create("hospede", {
                    "nome": "Administrador do Sistema",
                    "email": "admin@anfitrion.com",
                    "senha": "admin",
                    "telefone": "(11) 98888-7777"
                })
                self.__db.create("funcionario", {
                    "id_hospede": id_hosp_admin,
                    "id_hotel": id_hotel,
                    "cargo": "Gerente Geral"
                })

                #? 4. Funcionário recepcionista
                id_hosp_recep = self.__db.create("hospede", {
                    "nome": "Lucas Recepcionista",
                    "email": "recepcao@anfitrion.com",
                    "senha": "123",
                    "telefone": "(11) 97777-6666"
                })
                self.__db.create("funcionario", {
                    "id_hospede": id_hosp_recep,
                    "id_hotel": id_hotel,
                    "cargo": "Recepcionista"
                })

                #? 5. Hóspede demonstrativo
                self.__db.create("hospede", {
                    "nome": "Mariana Silva",
                    "email": "mariana@gmail.com",
                    "senha": "123",
                    "telefone": "(21) 99999-1234"
                })

                self.__log.log_success("[ Main.py ] - Dados semente inseridos com sucesso!")
        except Exception as e:
            self.__log.log_warning(f"[ Main.py ] - Aviso ao verificar dados semente: {str(e)}")

    def __process_heavy_tasks(self) -> None:
        """
        ### Processamentos mais pesados executados pela Thread MAIN:
        - Processamento de expiração de reservas
        - Atualização dos status dos quartos
        - Cálculo de métricas e taxa de ocupação para consulta em tempo real
        """
        try:
            today_str = datetime.now().strftime("%Y-%m-%d")
            
            #? 1. Checa reservas concluídas para liberar quartos
            reservas = self.__db.read("reserva", {})
            quartos = self.__db.read("quarto", {})
            hospedes = self.__db.read("hospede", {})
            hoteis = self.__db.read("hotel", {})

            quartos_ocupados_ids = set()
            for r in reservas:
                check_out = str(r.get("check_out", ""))
                if check_out and check_out < today_str: pass
                else: quartos_ocupados_ids.add(r.get("id_quarto"))

            total_quartos = len(quartos)
            quartos_ocupados_count = len([q for q in quartos if q.get("status") == "Ocupado" or q.get("id_quarto") in quartos_ocupados_ids])
            taxa_ocupacao = round((quartos_ocupados_count / total_quartos * 100), 2) if total_quartos > 0 else 0.0

            stats = {
                "total_hospedes": len(hospedes),
                "total_hoteis": len(hoteis),
                "total_quartos": total_quartos,
                "quartos_ocupados": quartos_ocupados_count,
                "quartos_disponiveis": max(0, total_quartos - quartos_ocupados_count),
                "total_reservas": len(reservas),
                "taxa_ocupacao": taxa_ocupacao,
                "ultima_execucao_main": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }

            self.__config.set("STATS", stats)
            cycle = eval(f"{(self.__config.get("BACKGROUND_TASKS_COUNTER") or 0)} + 1")
            self.__config.set("BACKGROUND_TASKS_COUNTER", cycle)

            if cycle % 10 == 1:
                self.__log.log_info(
                    f"[ MAIN ] - Rotina de background executada (Ciclo {cycle}) | "
                    f"Ocupação: {taxa_ocupacao}% ({quartos_ocupados_count}/{total_quartos} quartos)"
                )
        except Exception as e: self.__log.log_error(f"[ MAIN ] - Erro no processamento de rotinas em background: {str(e)}")

    def run(self):
        if not self.__check_tables():
            self.__log.log_info("[ Main.py ] - Configurando banco de dados SQLite & inserindo tabelas")
            try:
                from database import setup_db
                setup_db.init_db()
                self.__log.log_success("[ Main.py ] - SQLite configurado e tabelas inseridas com sucesso")
            except Exception as e:
                self.__log.log_error(f"[ Main.py ] - Erro ao realizar setup do banco: {str(e)}")
                return None
        
        self.__seed_initial_data()
        
        sleep_interval = float(self.__config.get("MAIN_SLEEP_INTERVAL") or 3.0)
        self.__log.log_success("[ MAIN ] - Thread MAIN de processamento pesado iniciada!")

        while bool(self.__config.get("IS_RUNNING")):
            self.__process_heavy_tasks()
            time.sleep(sleep_interval)


if "__main__" == __name__:
    log = Logger()
    log.log_info("[ Main.py ] - Configurando as Threads")
    try:
        from api.App import App
        main = Thread(target=Main().run, name="Thread-MAIN", daemon=True)
        flask = Thread(target=App().run, name="Thread-FLASK", daemon=True)
    except Exception as e:
        log.log_error(f"[ Main.py ] - Erro ao configurar as Threads: {str(e)}")
        exit(1)

    log.log_success("[ Main.py ] - Threads configuradas com sucesso!")
    main.start()
    flask.start()

    try:
        while True: time.sleep(1)
    except KeyboardInterrupt:
        log.log_info("[ Main.py ] - Finalizando aplicação...")
        Config().set("IS_RUNNING", False)
