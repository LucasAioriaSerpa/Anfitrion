
from typing import Optional
import sqlite3
import os

try:
    from config.Config import Config
    from utils.Loggers import Logger
except ImportError:
    from app.backend.config.Config import Config
    from app.backend.utils.Loggers import Logger

log = Logger()

def init_db(db_path: Optional[str] = None) -> bool:
    """Inicializa as tabelas do banco de dados SQLite caso ainda não existam."""
    config = Config()
    target_path = db_path or config.get("DATABASE_DIR")
    if not isinstance(target_path, str): raise TypeError("DATABASE_DIR deve ser um caminho de arquivo válido")
    
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    log.log_info(f"[ setup_db.py ] - Conectando ao banco em: {target_path}")

    try:
        conn = sqlite3.connect(target_path)
        cursor = conn.cursor()
        cursor.execute("PRAGMA foreign_keys = ON;")

        #? Tabela hospede
        cursor.execute("""--sql
        CREATE TABLE IF NOT EXISTS hospede (
            id_hospede INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            senha TEXT NOT NULL,
            telefone TEXT NOT NULL,
            criado_em TEXT DEFAULT CURRENT_TIMESTAMP
        );
        """)

        #? Tabela hotel
        cursor.execute("""--sql
        CREATE TABLE IF NOT EXISTS hotel (
            id_hotel INTEGER PRIMARY KEY AUTOINCREMENT,
            cnpj TEXT NOT NULL,
            franquia TEXT NOT NULL,
            nome TEXT NOT NULL,
            endereso TEXT NOT NULL,
            qtd_quartos INTEGER NOT NULL,
            criado_em TEXT DEFAULT CURRENT_TIMESTAMP
        );
        """)

        #? Tabela quarto
        cursor.execute("""--sql
        CREATE TABLE IF NOT EXISTS quarto (
            id_quarto INTEGER PRIMARY KEY AUTOINCREMENT,
            id_hotel INTEGER NOT NULL,
            tipo TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'Disponível',
            andar INTEGER NOT NULL,
            num_quarto INTEGER NOT NULL,
            diaria REAL NOT NULL,
            criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (id_hotel) REFERENCES hotel(id_hotel)
        );
        """)

        #? Tabela funcionario
        cursor.execute("""--sql
        CREATE TABLE IF NOT EXISTS funcionario (
            id_funcionario INTEGER PRIMARY KEY AUTOINCREMENT,
            id_hospede INTEGER NOT NULL,
            id_hotel INTEGER NOT NULL,
            cargo TEXT NOT NULL,
            FOREIGN KEY (id_hospede) REFERENCES hospede(id_hospede),
            FOREIGN KEY (id_hotel) REFERENCES hotel(id_hotel)
        );
        """)

        #? Tabela reserva
        cursor.execute("""--sql
        CREATE TABLE IF NOT EXISTS reserva (
            id_reserva INTEGER PRIMARY KEY AUTOINCREMENT,
            id_quarto INTEGER NOT NULL,
            id_hospede INTEGER NOT NULL,
            check_in TEXT NOT NULL,
            check_out TEXT NOT NULL,
            qtd_hospedes INTEGER NOT NULL,
            criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
            taxa_pet REAL DEFAULT 0.0,
            taxa_refeicao REAL DEFAULT 0.0,
            taxa_cafe_manha REAL DEFAULT 0.0,
            taxa_almoco REAL DEFAULT 0.0,
            taxa_jantar REAL DEFAULT 0.0,
            FOREIGN KEY (id_quarto) REFERENCES quarto(id_quarto),
            FOREIGN KEY (id_hospede) REFERENCES hospede(id_hospede)
        );
        """)
        
        conn.commit()
        conn.close()
        log.log_success("[ setup_db.py ] - Banco de dados e tabelas configurados com sucesso!")
        return True
    except Exception as e:
        log.log_error(f"[ setup_db.py ] - Falha na criação das tabelas: {str(e)}")
        return False

init_db()
