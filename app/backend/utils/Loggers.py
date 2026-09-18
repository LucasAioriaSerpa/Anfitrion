
import datetime
import os

class Logger:
    """Classe de registro de logs com suporte a cores, níveis e salvamento em arquivo."""

    #* Códigos ANSI para cores
    __COLORS = {
        "INFO": "\033[94m",     #?      Azul
        "SUCCESS": "\033[92m",  #*      Verde
        "WARNING": "\033[93m",  #TODO   Amarelo
        "ERROR": "\033[91m",    #!      Vermelho
        "RESET": "\033[0m"
    }

    #* Códigos numéricos personalizados
    __CODES = {
        "INFO": "NNN",
        "SUCCESS": "101",
        "WARNING": "202",
        "ERROR": "404"
    }

    def __init__(self, save_to_file=False, file_name="LOGS/log.txt", min_level="INFO"):
        """
        Inicializa o Logger.

        :param save_to_file: Se True, salva logs em arquivo.
        :param file_name: Nome do arquivo de log.
        :param min_level: Nível mínimo de log (INFO, SUCCESS, WARNING, ERROR).
        """
        self.__save_to_file = save_to_file
        self.__file_name = file_name
        self.__min_level = min_level.upper()
        self.__levels_order = ["INFO", "SUCCESS", "WARNING", "ERROR"]

        #* Cria arquivo se necessário
        if save_to_file:
            try:
                if "/" in file_name: os.makedirs(os.path.dirname(file_name), exist_ok=True)
                with open(self.__file_name, "a", encoding="utf-8") as f:
                    f.write(f"\n||===== Logger iniciado em {datetime.datetime.now()} =====||\n")
            except PermissionError: self.__log("ERROR", f"Sem permissão para criar/escrever no arquivo: {self.__file_name}")
            except OSError as e:    self.__log("ERROR", f"Erro ao criar/escrever no arquivo de log: {str(e)}")

    #? ---------------------- GETTERS E SETTERS ----------------------

    @property
    def min_level(self): return self.__min_level

    @min_level.setter
    def min_level(self, value):
        if value.upper() in self.__levels_order: self.__min_level = value.upper()
        else: raise ValueError("Nível inválido. Use: INFO, SUCCESS, WARNING, ERROR.")

    #? ---------------------- MÉTODOS PRIVADOS ----------------------

    def __log(self, level: str, message: str):
        """Método interno central que executa o log completo"""
        if not self.__should_log(level): return
        formatted_message = self.__format_message(level, message)
        self.__print_colored(level, formatted_message)
        if self.__save_to_file: self.__write_to_file(formatted_message)

    def __should_log(self, level):
        """Verifica se o nivel atual deve ser exibido, baseado no nivel minimo configurado."""
        return self.__levels_order.index(level) >= self.__levels_order.index(self.__min_level)

    def __format_message(self, level: str, message: str):
        """Formata a mensagem com timestamp e codigo"""
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        code = self.__CODES[level]
        return f"[{timestamp}] [{code}] {level}: {message}"

    def __print_colored(self, level: str, message: str):
        """Imprime a mensagem colorida no terminal"""
        color = self.__COLORS[level]
        reset = self.__COLORS["RESET"]
        print(f"{color}{message}{reset}")

    def __write_to_file(self, formatted_message: str):
        """Escreve a mensagem formatada no arquivo de log"""
        with open(self.__file_name, "a", encoding="utf-8") as f: f.write(formatted_message + "\n")

    #? ---------------------- METODOS PUBLICOS ----------------------

    def log_info(self, message: str):     self.__log("INFO", message)

    def log_success(self, message: str):  self.__log("SUCCESS", message)

    def log_warning(self, message: str):  self.__log("WARNING", message)

    def log_error(self, message: str):    self.__log("ERROR", message)

    def clear_logs(self):
        if not self.__save_to_file: print("\033[91m[!] O salvamento em arquivo está desativado.\033[0m"); return
        try:
            with open(self.__file_name, "w", encoding="utf-8") as f:
                f.write(f"||===== Log limpo em {datetime.datetime.now()} =====||\n")
            print("\033[92m[✓] Arquivo de log limpo com sucesso.\033[0m")
        except Exception as e:
            print(f"\033[91m[ERRO] Falha ao limpar o log: {e}\033[0m")
