import sqlite3
import pathlib

from meta.Singleton import Singleton
from config.Config import Config
from utils.Loggers import Logger

class Database(metaclass=Singleton):
    __log = Logger()
    __config = Config()
    def __init__(self) -> None:
        try: self.db_path = self.__db_path_init()
        except: self.__log.log_error("[ database.py ] - db_path não encontrado em config.py")

    def __str__(self) -> str: return "Objeto de conexão, inserção, atualização, visualização e remoção do banco de dados SQLite"

    def __db_path_init(self) -> str:
        db_path = self.__config.get("DATABASE_DIR")
        if not isinstance(db_path, (str, bytes, pathlib.Path)):
            raise TypeError("DATABASE_DIR deve ser um caminho válido")
        return db_path

    def connect(self): return sqlite3.connect(self.db_path)

    def _execute(self, query: str, values=(), fetch=False):
        with self.connect() as conn:
            conn.row_factory = sqlite3.Row if fetch else None
            cursor = conn.cursor()
            cursor.execute(query, values)
            if fetch:
                rows = cursor.fetchall()
                return [dict(row) for row in rows]
            else:
                conn.commit()
                return None

    def create(self, table: str, data: dict):
        columns = ", ".join(data.keys())
        placeholders = ", ".join(["?" for _ in data])
        values = tuple(data.values())
        query = f"INSERT INTO {table} ({columns}) VALUES ({placeholders})"
        self._execute(query, values)

    def read(self, table: str, conditions: dict):
        query = f"SELECT * FROM {table}"
        values = ()
        if conditions:
            condition = " AND ".join([f"{col}=?" for col in conditions.keys()])
            query += f" WHERE {condition}"
            values = tuple(conditions.values())
        return self._execute(query, values, fetch=True)

    def update(self, table: str, data: dict, conditions: dict):
        set_value = ", ".join([f"{col}=?" for col in data.keys()])
        condition = " AND ".join([f"{col}=?" for col in conditions.keys()])
        values = tuple(data.values()) + tuple(conditions.values())
        query = f"UPDATE {table} SET {set_value} WHERE {condition}"
        self._execute(query, values)

    def delete(self, table, conditions: dict):
        condition = " AND ".join([f"{col}=?" for col in conditions.keys()])
        values = tuple(conditions.values())
        query = f"DELETE FROM {table} WHERE {condition}"
        self._execute(query, values)

#* INSERIR
#* ManagerDatabase().create("nome_tabela", {"atributo_tabela": "valor_campo", "atributo_tabela": "valor_campo"})

#* ATUALIZAR
#* ManagerDatabase().update("nome_tabela", {"campo_que_sera_atualizado": "novo_valor_do_campo"}, {"atributo_procurado": "valor_procurado"})

#? VISUALIZAR
#? ManagerDatabase().read("nome_tabela", {}) ou ManagerDatabase().("nome_tabela", {"atributo_procurado": "valor_atributo"})

#! DELETAR
#! ManagerDatabase().delete("nome_tabela", {"atributo_procurado (ex: nome)": "valor_procurado"})
