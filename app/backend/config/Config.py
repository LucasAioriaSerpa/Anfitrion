
import os, sys

from meta.Singleton import Singleton
from utils.Loggers import Logger

class Config(metaclass=Singleton):
    __log = Logger()
    _OS_PATH = os.path

    if getattr(sys, 'frozen', False): ROOT_DIR = sys._MEIPASS
    else: ROOT_DIR = _OS_PATH.dirname(_OS_PATH.dirname(_OS_PATH.dirname(_OS_PATH.abspath(__file__))))
    
    def __init__(self) -> None:
        self.DATABASE_DIR = self._OS_PATH.join(self.ROOT_DIR, "database/db_anfitrion.db")

    def get(self, var_class: str) -> str | int | float | None:
        match var_class:
            case "varTest": return self.varTest
            case "DATABASE_DIR": return self.DATABASE_DIR
            case _: self.__log.log_error("Error - var não encontrado!")

    def set(self, var_class: str, new_value: str | int | float) -> None:
        match var_class:
            case "varTest": self.varTest = new_value
            case _: self.__log.log_error("Error - var não encontrado!")
