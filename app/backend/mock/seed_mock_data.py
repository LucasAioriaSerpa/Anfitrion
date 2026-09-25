"""
Script isolado de Seed / Mock de dados para o Anfitrião Hotel Management System.
Substitui o antigo 'seed_initial_data' que residia dentro do Main.py.

Contém entidades completas para testes e desenvolvimento:
- Hotéis (Matriz e Filial)
- Funcionários com hierarquia e cargos:
  * Administrador Geral
  * Gerente Geral
  * Subgerente Operacional
  * Recepcionista
  * Governanta Chefe
  * Camareira Sênior
- Hóspedes cadastrados
- Quartos em múltiplos andares com status variados
- Diárias explícitas para cada categoria de quarto
- Reservas (concluídas, em andamento e futuras com taxas)
"""

import os
import sys
import json
import sqlite3
from pathlib import Path
from datetime import datetime

# Garante que o diretório raiz do backend esteja no sys.path para importações
CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CURRENT_DIR.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

def get_mock_data():
    """Retorna os dados mock estruturados para semente do sistema."""
    return {
        "hoteis": [
            {
                "id_hotel": 1,
                "cnpj": "12.345.678/0001-90",
                "franquia": "Anfitrião Hotéis & Resorts",
                "nome": "Anfitrião Grand Hotel & Resort",
                "endereso": "Avenida Atlântica, 1500 - Copacabana, Rio de Janeiro - RJ",
                "qtd_quartos": 30
            },
            {
                "id_hotel": 2,
                "cnpj": "98.765.432/0001-10",
                "franquia": "Anfitrião Hotéis & Resorts",
                "nome": "Anfitrião Boutique Hotel Jardins",
                "endereso": "Alameda Santos, 850 - Cerqueira César, São Paulo - SP",
                "qtd_quartos": 15
            }
        ],
        "funcionarios": [
            {
                "nome": "Administrador Geral",
                "email": "admin@anfitrion.com",
                "senha": "admin",
                "telefone": "(11) 98888-7777",
                "cargo": "Administrador",
                "id_hotel": 1,
                "role": "funcionario"
            },
            {
                "nome": "Roberto Silva",
                "email": "gerente@anfitrion.com",
                "senha": "123",
                "telefone": "(11) 98111-2222",
                "cargo": "Gerente Geral",
                "id_hotel": 1,
                "role": "funcionario"
            },
            {
                "nome": "Fernanda Lima",
                "email": "subgerente@anfitrion.com",
                "senha": "123",
                "telefone": "(11) 98222-3333",
                "cargo": "Subgerente",
                "id_hotel": 1,
                "role": "funcionario"
            },
            {
                "nome": "Lucas Martins",
                "email": "recepcao@anfitrion.com",
                "senha": "123",
                "telefone": "(11) 97777-6666",
                "cargo": "Recepcionista",
                "id_hotel": 1,
                "role": "funcionario"
            },
            {
                "nome": "Clara Mendes",
                "email": "governanta@anfitrion.com",
                "senha": "123",
                "telefone": "(11) 97555-4444",
                "cargo": "Governanta",
                "id_hotel": 1,
                "role": "funcionario"
            },
            {
                "nome": "Rosa Santos",
                "email": "camareira@anfitrion.com",
                "senha": "123",
                "telefone": "(11) 97444-3333",
                "cargo": "Camareira",
                "id_hotel": 1,
                "role": "funcionario"
            }
        ],
        "hospedes": [
            {
                "nome": "Mariana Silva",
                "email": "mariana@gmail.com",
                "senha": "123",
                "telefone": "(21) 99999-1234",
                "role": "hospede"
            },
            {
                "nome": "Carlos Oliveira",
                "email": "carlos@gmail.com",
                "senha": "123",
                "telefone": "(11) 98888-0000",
                "role": "hospede"
            },
            {
                "nome": "Beatriz Costa",
                "email": "beatriz@gmail.com",
                "senha": "123",
                "telefone": "(31) 97777-8888",
                "role": "hospede"
            },
            {
                "nome": "João Pedro Almeida",
                "email": "joao@gmail.com",
                "senha": "123",
                "telefone": "(41) 99111-2233",
                "role": "hospede"
            }
        ],
        "quartos": [
            {
                "id_quarto": 1,
                "id_hotel": 1,
                "num_quarto": 101,
                "andar": 1,
                "tipo": "Standard Solteiro",
                "diaria": 150.0,
                "status": "Disponível"
            },
            {
                "id_quarto": 2,
                "id_hotel": 1,
                "num_quarto": 102,
                "andar": 1,
                "tipo": "Standard Casal",
                "diaria": 220.0,
                "status": "Ocupado"
            },
            {
                "id_quarto": 3,
                "id_hotel": 1,
                "num_quarto": 201,
                "andar": 2,
                "tipo": "Suíte Luxo",
                "diaria": 380.0,
                "status": "Disponível"
            },
            {
                "id_quarto": 4,
                "id_hotel": 1,
                "num_quarto": 202,
                "andar": 2,
                "tipo": "Suíte Executiva",
                "diaria": 450.0,
                "status": "Ocupado"
            },
            {
                "id_quarto": 5,
                "id_hotel": 1,
                "num_quarto": 301,
                "andar": 3,
                "tipo": "Suíte Master Presidencial",
                "diaria": 750.0,
                "status": "Disponível"
            },
            {
                "id_quarto": 6,
                "id_hotel": 2,
                "num_quarto": 101,
                "andar": 1,
                "tipo": "Boutique Casal Charm",
                "diaria": 320.0,
                "status": "Disponível"
            },
            {
                "id_quarto": 7,
                "id_hotel": 2,
                "num_quarto": 201,
                "andar": 2,
                "tipo": "Boutique Executive Suite",
                "diaria": 520.0,
                "status": "Disponível"
            }
        ],
        "reservas": [
            {
                "id_reserva": 1,
                "quarto_num": 102,
                "hospede_email": "mariana@gmail.com",
                "check_in": "2026-09-24",
                "check_out": "2026-09-28",
                "qtd_hospedes": 2,
                "diaria": 220.0,
                "taxa_cafe_manha": 35.0,
                "taxa_pet": 0.0,
                "taxa_refeicao": 50.0,
                "taxa_almoco": 0.0,
                "taxa_jantar": 0.0
            },
            {
                "id_reserva": 2,
                "quarto_num": 202,
                "hospede_email": "carlos@gmail.com",
                "check_in": "2026-09-22",
                "check_out": "2026-09-27",
                "qtd_hospedes": 1,
                "diaria": 450.0,
                "taxa_cafe_manha": 35.0,
                "taxa_pet": 40.0,
                "taxa_refeicao": 0.0,
                "taxa_almoco": 0.0,
                "taxa_jantar": 0.0
            },
            {
                "id_reserva": 3,
                "quarto_num": 201,
                "hospede_email": "beatriz@gmail.com",
                "check_in": "2026-10-01",
                "check_out": "2026-10-05",
                "qtd_hospedes": 2,
                "diaria": 380.0,
                "taxa_cafe_manha": 70.0,
                "taxa_pet": 0.0,
                "taxa_refeicao": 0.0,
                "taxa_almoco": 0.0,
                "taxa_jantar": 0.0
            }
        ]
    }

def seed_database(db_path=None, force=False):
    """
    Insere os dados semente no banco de dados SQLite.
    Se force=True, limpa os dados anteriores antes de reinserir.
    """
    if db_path is None:
        db_path = BACKEND_DIR.parent / "database" / "db_anfitrion.db"

    db_path = Path(db_path)
    db_path.parent.mkdir(parents=True, exist_ok=True)

    print(f"[ Seed ] - Conectando ao banco SQLite: {db_path}")
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    cursor.execute("PRAGMA foreign_keys = ON;")

    # Garante que as tabelas básicas existam
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS hospede (
        id_hospede INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL,
        telefone TEXT NOT NULL,
        criado_em TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)
    cursor.execute("""
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
    cursor.execute("""
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
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS funcionario (
        id_funcionario INTEGER PRIMARY KEY AUTOINCREMENT,
        id_hospede INTEGER NOT NULL,
        id_hotel INTEGER NOT NULL,
        cargo TEXT NOT NULL,
        FOREIGN KEY (id_hospede) REFERENCES hospede(id_hospede),
        FOREIGN KEY (id_hotel) REFERENCES hotel(id_hotel)
    );
    """)
    cursor.execute("""
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

    if force:
        cursor.execute("DELETE FROM reserva;")
        cursor.execute("DELETE FROM funcionario;")
        cursor.execute("DELETE FROM quarto;")
        cursor.execute("DELETE FROM hotel;")
        cursor.execute("DELETE FROM hospede;")
        conn.commit()
        print("[ Seed ] - Dados anteriores excluídos para inserção forçada.")

    # Verifica se já há dados inseridos
    cursor.execute("SELECT COUNT(*) FROM hotel;")
    hoteis_count = cursor.fetchone()[0]
    if hoteis_count > 0 and not force:
        print("[ Seed ] - O banco já possui dados. Use force=True para sobrescrever.")
        conn.close()
        return False

    data = get_mock_data()

    # 1. Hotéis
    hotel_id_map = {}
    for h in data["hoteis"]:
        cursor.execute(
            "INSERT INTO hotel (cnpj, franquia, nome, endereso, qtd_quartos) VALUES (?, ?, ?, ?, ?)",
            (h["cnpj"], h["franquia"], h["nome"], h["endereso"], h["qtd_quartos"])
        )
        hotel_id_map[h["id_hotel"]] = cursor.lastrowid

    # 2. Quartos (com Diárias)
    quarto_num_map = {}
    for q in data["quartos"]:
        real_hotel_id = hotel_id_map.get(q["id_hotel"], 1)
        cursor.execute(
            "INSERT INTO quarto (id_hotel, tipo, status, andar, num_quarto, diaria) VALUES (?, ?, ?, ?, ?, ?)",
            (real_hotel_id, q["tipo"], q["status"], q["andar"], q["num_quarto"], q["diaria"])
        )
        quarto_num_map[q["num_quarto"]] = cursor.lastrowid

    # 3. Funcionários (Administrador, Gerente, Subgerente, Recepcionista, Governanta, Camareira)
    for f in data["funcionarios"]:
        cursor.execute(
            "INSERT OR IGNORE INTO hospede (nome, email, senha, telefone) VALUES (?, ?, ?, ?)",
            (f["nome"], f["email"], f["senha"], f["telefone"])
        )
        # Recupera o id_hospede
        cursor.execute("SELECT id_hospede FROM hospede WHERE email = ?", (f["email"],))
        id_hosp = cursor.fetchone()[0]

        real_hotel_id = hotel_id_map.get(f["id_hotel"], 1)
        cursor.execute(
            "INSERT INTO funcionario (id_hospede, id_hotel, cargo) VALUES (?, ?, ?)",
            (id_hosp, real_hotel_id, f["cargo"])
        )

    # 4. Hóspedes
    hospede_email_map = {}
    for h in data["hospedes"]:
        cursor.execute(
            "INSERT OR IGNORE INTO hospede (nome, email, senha, telefone) VALUES (?, ?, ?, ?)",
            (h["nome"], h["email"], h["senha"], h["telefone"])
        )
        cursor.execute("SELECT id_hospede FROM hospede WHERE email = ?", (h["email"],))
        hospede_email_map[h["email"]] = cursor.fetchone()[0]

    # 5. Reservas
    for r in data["reservas"]:
        id_quarto = quarto_num_map.get(r["quarto_num"])
        id_hospede = hospede_email_map.get(r["hospede_email"])
        if id_quarto and id_hospede:
            cursor.execute("""
            INSERT INTO reserva (
                id_quarto, id_hospede, check_in, check_out, qtd_hospedes,
                taxa_pet, taxa_refeicao, taxa_cafe_manha, taxa_almoco, taxa_jantar
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                id_quarto, id_hospede, r["check_in"], r["check_out"], r["qtd_hospedes"],
                r.get("taxa_pet", 0.0), r.get("taxa_refeicao", 0.0),
                r.get("taxa_cafe_manha", 0.0), r.get("taxa_almoco", 0.0), r.get("taxa_jantar", 0.0)
            ))

    conn.commit()
    conn.close()
    print("[ Seed ] - Banco de dados populado com sucesso com mock completo!")
    return True

def export_json(output_path=None):
    """Exporta os dados mock em JSON para integração cruzada."""
    if output_path is None:
        output_path = BACKEND_DIR / "data" / "mock_data.json"
    
    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(get_mock_data(), f, ensure_ascii=False, indent=2)
    print(f"[ Seed ] - Arquivo JSON gerado em: {path}")

if __name__ == "__main__":
    force_run = "--force" in sys.argv
    export_json()
    seed_database(force=force_run)
