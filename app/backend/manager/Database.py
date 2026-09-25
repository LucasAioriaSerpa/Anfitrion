from typing import Optional, cast, Any
import sqlite3
import pathlib

try:
    from meta.Singleton import Singleton
    from config.Config import Config
    from utils.Loggers import Logger
except ImportError:
    from app.backend.meta.Singleton import Singleton
    from app.backend.config.Config import Config
    from app.backend.utils.Loggers import Logger

class Database(metaclass=Singleton):
    """
    Design Pattern: SINGLETON
    Gerenciador central de conexão e operações no banco de dados SQLite.
    Garante instância única com thread-safety provida pelo Singleton metaclass.
    """
    __log = Logger()
    __config = Config()

    def __init__(self) -> None:
        try:
            self.db_path = self.__db_path_init()
            self.__log.log_info(f"[ Database.py ] - Instância de Database inicializada: {self.db_path}")
        except Exception as e: self.__log.log_error(f"[ Database.py ] - Erro ao inicializar db_path: {str(e)}")

    def __str__(self) -> str: return "Objeto Singleton de conexão, inserção, atualização, visualização e remoção do banco de dados SQLite"

    def __db_path_init(self) -> str:
        db_path = self.__config.get("DATABASE_DIR")
        if not isinstance(db_path, (str, bytes, pathlib.Path)): raise TypeError("DATABASE_DIR deve ser um caminho válido")
        return str(db_path)

    def connect(self):
        return sqlite3.connect(self.db_path)

    def _execute(self, query: str, values=(), fetch=False):
        try:
            with self.connect() as conn:
                conn.execute("PRAGMA foreign_keys = ON;")
                conn.row_factory = sqlite3.Row if fetch else None
                cursor = conn.cursor()
                cursor.execute(query, values)
                if fetch:
                    rows = cursor.fetchall()
                    return [dict(row) for row in rows]
                else:
                    conn.commit()
                    return cursor.lastrowid
        except Exception as e:
            self.__log.log_error(f"[ Database.py ] - Falha na query SQL: {query} | Erro: {str(e)}")
            raise e

    def create(self, table: str, data: dict) -> int:
        columns = ", ".join(data.keys())
        placeholders = ", ".join(["?" for _ in data])
        values = tuple(data.values())
        query = f"INSERT INTO {table} ({columns}) VALUES ({placeholders})"
        try:  last_id = cast(int, self._execute(query, values))
        except Exception as e: last_id = -1
        self.__log.log_info(f"[ Database.py ] - Registro criado em <{table}> com ID: {last_id}")
        return last_id

    def read(self, table: str, conditions: Optional[dict] = None) -> list[dict[Any, Any]]:
        query = f"SELECT * FROM {table}"
        values = ()
        if conditions:
            condition = " AND ".join([f"{col}=?" for col in conditions.keys()])
            query += f" WHERE {condition}"
            values = tuple(conditions.values())
        try: reading = cast(list[dict[Any, Any]], self._execute(query, values, fetch=True))
        except Exception as e: reading = [{}]
        return reading

    def update(self, table: str, data: dict, conditions: dict) -> bool:
        set_value = ", ".join([f"{col}=?" for col in data.keys()])
        condition = " AND ".join([f"{col}=?" for col in conditions.keys()])
        values = tuple(data.values()) + tuple(conditions.values())
        query = f"UPDATE {table} SET {set_value} WHERE {condition}"
        self._execute(query, values)
        self.__log.log_info(f"[ Database.py ] - Registro atualizado em <{table}> com condições: {conditions}")
        return True

    def delete(self, table: str, conditions: dict) -> bool:
        condition = " AND ".join([f"{col}=?" for col in conditions.keys()])
        values = tuple(conditions.values())
        query = f"DELETE FROM {table} WHERE {condition}"
        self._execute(query, values)
        self.__log.log_info(f"[ Database.py ] - Registro excluído de <{table}> com condições: {conditions}")
        return True


#* INSERIR
#* ManagerDatabase().create("nome_tabela", {"atributo_tabela": "valor_campo", "atributo_tabela": "valor_campo"})

#* ATUALIZAR
#* ManagerDatabase().update("nome_tabela", {"campo_que_sera_atualizado": "novo_valor_do_campo"}, {"atributo_procurado": "valor_procurado"})

#? VISUALIZAR
#? ManagerDatabase().read("nome_tabela", {}) ou ManagerDatabase().("nome_tabela", {"atributo_procurado": "valor_atributo"})

#! DELETAR
#! ManagerDatabase().delete("nome_tabela", {"atributo_procurado (ex: nome)": "valor_procurado"})
