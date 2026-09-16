
import sqlite3

conn = sqlite3.connect("./db_anfitrion.db")
cursor = conn.cursor()

cursor.execute("PRAGMA foreign_keys = ON;")

cursor.execute("""--sql

/*
# ---------------------------
# Tabela hospede
# ---------------------------
*/

CREATE TABLE IF NOT EXISTS hospede (
    id_hospede INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    telefone INTEGER NOT NULL,
    criado_em TEXT DEFAULT CURRENT_TIMESTAMP
);

""")

cursor.execute("""--sql

/*
# ---------------------------
# Tabela hotel
# ---------------------------
*/

CREATE TABLE IF NOT EXISTS hotel (
    id_hotel INTEGER PRIMARY KEY AUTOINCREMENT,
    cnpj INTEGER NOT NULL,
    franquia TEXT NOT NULL,
    nome TEXT NOT NULL,
    endereso TEXT NOT NULL,
    qtd_quartos INTEGER NOT NULL,
    criado_em TEXT DEFAULT CURRENT_TIMESTAMP
);

""")

cursor.execute("""--sql

/*
# ---------------------------
# Tabela quarto
# ---------------------------
*/

CREATE TABLE IF NOT EXISTS quarto (
    id_quarto INTEGER PRIMARY KEY AUTOINCREMENT,
    id_hotel INTEGER NOT NULL,
    tipo TEXT NOT NULL,
    status TEXT NOT NULL,
    andar INTEGER NOT NULL,
    num_quarto INTEGER NOT NULL,
    diaria FLOAT NOT NULL,
    criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_hotel) REFERENCES hotel(id_hotel)
);

""")

cursor.execute("""--sql

/*
# ---------------------------
# Tabela funcionario
# ---------------------------
*/

CREATE TABLE IF NOT EXISTS funcionario (
    id_funcionario INTEGER PRIMARY KEY AUTOINCREMENT,
    id_hospede INTEGER NOT NULL,
    id_hotel INTEGER NOT NULL,
    cargo TEXT NOT NULL,
    FOREIGN KEY (id_hospede) REFERENCES hospede(id_hospede),
    FOREIGN KEY (id_hotel) REFERENCES hotel(id_hotel)
);

""")

cursor.execute("""--sql

/*
# ---------------------------
# Tabela reserva
# ---------------------------
*/

CREATE TABLE IF NOT EXISTS reserva (
    id_reserva INTEGER PRIMARY KEY AUTOINCREMENT,
    id_quarto INTEGER NOT NULL,
    id_hospede INTEGER NOT NULL,
    check_in TEXT NOT NULL,
    check_out TEXT NOT NULL,
    qtd_hospedes INTEGER NOT NULL,
    criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
    taxa_pet FLOAT,
    taxa_refeicao FLOAT,
    taxa_cafe_manha FLOAT,
    taxa_almoco FLOAT,
    taxa_jantar FLOAT,
    FOREIGN KEY (id_quarto) REFERENCES quarto(id_quarto),
    FOREIGN KEY (id_hospede) REFERENCES hospede(id_hospede)
);

""")

conn.commit()
conn.close()

print("Banco de dados e tabelas criados com sucesso!")
