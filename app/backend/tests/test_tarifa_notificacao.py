"""
Testes dos templates TarifaCalculationTemplate e NotificacaoTemplate.
Usam SQLite em memória e substituem Database/Logger por versões mínimas com a mesma interface,
então rodam sem tocar no banco real. Execute em app/backend:  python -m unittest tests.test_tarifa_notificacao -v
"""
import os
import sqlite3
import sys
import types
import unittest

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path: sys.path.insert(0, BACKEND_DIR)

SCHEMA = """--sql
CREATE TABLE hospede (
    id_hospede INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    telefone TEXT NOT NULL,
    criado_em TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE hotel (
    id_hotel INTEGER PRIMARY KEY AUTOINCREMENT,
    cnpj TEXT,
    franquia TEXT,
    nome TEXT,
    endereso TEXT,
    qtd_quartos INTEGER
);
CREATE TABLE quarto (
    id_quarto INTEGER PRIMARY KEY AUTOINCREMENT,
    id_hotel INTEGER NOT NULL,
    tipo TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Disponível',
    andar INTEGER NOT NULL,
    num_quarto INTEGER NOT NULL,
    diaria REAL NOT NULL
);
CREATE TABLE funcionario (
    id_funcionario INTEGER PRIMARY KEY AUTOINCREMENT,
    id_hospede INTEGER NOT NULL,
    id_hotel INTEGER NOT NULL,
    cargo TEXT NOT NULL
);
CREATE TABLE reserva (
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
    taxa_jantar REAL DEFAULT 0.0
);
CREATE TABLE notificacao (
    id_notificacao INTEGER PRIMARY KEY AUTOINCREMENT,
    id_hospede INTEGER NOT NULL,
    id_hotel INTEGER,
    tipo TEXT NOT NULL,
    assunto TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    referencia TEXT,
    lida INTEGER NOT NULL DEFAULT 0,
    criado_em TEXT DEFAULT CURRENT_TIMESTAMP
);
"""


class FakeDatabase:
    """Mesma interface de manager.Database (create/read/update/delete), em memória."""
    conn: sqlite3.Connection

    def create(self, table, data):
        cols = ", ".join(data)
        cur = self.conn.execute(f"INSERT INTO {table} ({cols}) VALUES ({', '.join('?' * len(data))})", tuple(data.values()))
        self.conn.commit()
        return cur.lastrowid

    def read(self, table, conditions=None):
        query, values = f"SELECT * FROM {table}", ()
        if conditions:
            query += " WHERE " + " AND ".join(f"{c} IS ?" if v is None else f"{c}=?" for c, v in conditions.items())
            values = tuple(conditions.values())
        return [dict(r) for r in self.conn.execute(query, values).fetchall()]

    def update(self, table, data, conditions):
        sets = ", ".join(f"{c}=?" for c in data)
        where = " AND ".join(f"{c}=?" for c in conditions)
        self.conn.execute(f"UPDATE {table} SET {sets} WHERE {where}", tuple(data.values()) + tuple(conditions.values()))
        self.conn.commit()
        return True


class FakeLogger:
    def log_info(self, *_): pass
    def log_success(self, *_): pass
    def log_warning(self, *_): pass
    def log_error(self, *_): pass


def _install_fakes():
    manager = types.ModuleType("manager"); manager.__path__ = []
    manager_db = types.ModuleType("manager.Database"); setattr(manager_db, "Database", FakeDatabase)
    utils = types.ModuleType("utils"); utils.__path__ = []
    utils_log = types.ModuleType("utils.Loggers"); setattr(utils_log, "Logger", FakeLogger)
    sys.modules.update({"manager": manager, "manager.Database": manager_db, "utils": utils, "utils.Loggers": utils_log})


_install_fakes()

from api.templates.entities_tarifa import get_tarifa_template, listar_politicas  # noqa: E402
from api.templates.entities_notificacao.confirmacao_reserva_template import ConfirmacaoReservaNotificacao
from api.templates.entities_notificacao.quarto_para_limpeza_template import QuartoParaLimpezaNotificacao
from api.templates.entities_notificacao.manutencao_template import ManutencaoNotificacao
from api.templates.entities_notificacao.chegada_do_dia_notificacao_template import ChegadaDoDiaNotificacao


class BaseCase(unittest.TestCase):
    def setUp(self):
        FakeDatabase.conn = sqlite3.connect(":memory:")
        FakeDatabase.conn.row_factory = sqlite3.Row
        FakeDatabase.conn.executescript(SCHEMA)
        self.db = FakeDatabase()
        for i in (1, 2):
            self.db.create("hotel", {"cnpj": f"0{i}", "franquia": "F", "nome": f"Hotel {i}", "endereso": "x", "qtd_quartos": 2})
        self.quarto1 = self.db.create("quarto", {"id_hotel": 1, "tipo": "Standard Casal", "andar": 1, "num_quarto": 101, "diaria": 200.0})
        self.quarto2 = self.db.create("quarto", {"id_hotel": 2, "tipo": "Suite Luxo", "andar": 1, "num_quarto": 101, "diaria": 380.0})
        self.hospede = self._pessoa("Mariana Silva", "mariana@x.com")

    def _pessoa(self, nome, email):
        return self.db.create("hospede", {"nome": nome, "email": email, "senha": "h", "telefone": "1"})

    def _funcionario(self, nome, email, cargo, hotel):
        return self.db.create("funcionario", {"id_hospede": self._pessoa(nome, email), "id_hotel": hotel, "cargo": cargo})

    def _reserva(self, check_in, check_out, quarto=None, hospede=None, **taxas):
        return self.db.create("reserva", {
            "id_quarto": quarto or self.quarto1, "id_hospede": hospede or self.hospede,
            "check_in": check_in, "check_out": check_out, "qtd_hospedes": 2, **taxas,
        })

    def _calc(self, politica, reserva_id):
        reserva = self.db.read("reserva", {"id_reserva": reserva_id})[0]
        quarto = self.db.read("quarto", {"id_quarto": reserva["id_quarto"]})[0]
        hospede = self.db.read("hospede", {"id_hospede": reserva["id_hospede"]})[0]
        return get_tarifa_template(politica).calculate(reserva, quarto, hospede)


class TarifaTests(BaseCase):
    def test_padrao_com_extras(self):
        rid = self._reserva("2026-10-10", "2026-10-13", taxa_cafe_manha=35.0, taxa_pet=70.0)
        r = self._calc("padrao", rid)
        self.assertEqual(r["noites"], 3)
        self.assertEqual(r["valor_base"], 600.0)
        self.assertEqual(r["extras"]["cafe_manha"], 105.0)
        self.assertEqual(r["extras"]["total"], 175.0)
        self.assertEqual(r["desconto"]["valor"], 0.0)
        self.assertEqual(r["total"], 775.0)

    def test_fidelidade_gold_conta_apenas_estadias_anteriores(self):
        for i in range(5):
            self._reserva(f"2026-0{i + 1}-01", f"2026-0{i + 1}-03")
        atual = self._reserva("2026-10-10", "2026-10-12")
        futura = self._reserva("2026-12-01", "2026-12-03")  # posterior: não conta
        r = self._calc("fidelidade", atual)
        self.assertEqual(r["desconto"]["percentual"], 10.0)
        self.assertEqual(r["desconto"]["valor"], 40.0)
        self.assertEqual(r["total"], 360.0)
        self.assertIn("Gold", r["desconto"]["descricao"])
        self.assertEqual(self._calc("fidelidade", futura)["desconto"]["percentual"], 10.0)

    def test_fidelidade_sem_historico(self):
        rid = self._reserva("2026-10-10", "2026-10-12")
        r = self._calc("fidelidade", rid)
        self.assertEqual(r["desconto"]["valor"], 0.0)
        self.assertEqual(r["total"], 400.0)

    def test_temporada_alta_e_virada_de_temporada(self):
        alta = self._calc("temporada", self._reserva("2027-01-10", "2027-01-12"))
        self.assertEqual(alta["ajuste_tarifa"]["valor"], 80.0)
        self.assertEqual(alta["total"], 480.0)
        # 30/09 (baixa, -10%) e 01/10 (regular): só 1 noite em baixa
        mista = self._calc("temporada", self._reserva("2026-09-30", "2026-10-02"))
        self.assertEqual(mista["ajuste_tarifa"]["valor"], -20.0)
        self.assertEqual(mista["total"], 380.0)
        regular = self._calc("temporada", self._reserva("2026-10-10", "2026-10-12"))
        self.assertEqual(regular["ajuste_tarifa"]["valor"], 0.0)

    def test_longa_estadia_faixas(self):
        self.assertEqual(self._calc("longa_estadia", self._reserva("2026-10-01", "2026-10-07"))["desconto"]["percentual"], 0.0)
        r7 = self._calc("longa_estadia", self._reserva("2026-10-01", "2026-10-08"))
        self.assertEqual((r7["desconto"]["percentual"], r7["total"]), (5.0, 1330.0))
        self.assertEqual(self._calc("longa_estadia", self._reserva("2026-10-01", "2026-10-15"))["desconto"]["percentual"], 10.0)
        self.assertEqual(self._calc("longa_estadia", self._reserva("2026-10-01", "2026-10-31"))["desconto"]["percentual"], 15.0)

    def test_datas_invalidas(self):
        template = get_tarifa_template("padrao")
        quarto = {"diaria": 100}
        for ci, co in (("2026-10-10", "2026-10-10"), ("2026-10-12", "2026-10-10"), ("abc", "2026-10-10")):
            with self.assertRaises(ValueError):
                template.calculate({"check_in": ci, "check_out": co}, quarto)

    def test_registro_de_politicas(self):
        self.assertEqual({p["politica"] for p in listar_politicas()}, {"padrao", "fidelidade", "temporada", "longa_estadia"})
        self.assertEqual(get_tarifa_template(None).politica, "padrao")
        with self.assertRaises(ValueError): get_tarifa_template("inexistente")


class NotificacaoTests(BaseCase):
    def setUp(self):
        super().setUp()
        self.gov1 = self._funcionario("Clara Mendes", "gov1@x.com", "Governanta", 1)
        self.cam1 = self._funcionario("Rosa Santos", "cam1@x.com", "Camareira", 1)
        self.cam2 = self._funcionario("Outra Hotel2", "cam2@x.com", "Camareira", 2)
        self.rec1 = self._funcionario("Lucas Martins", "rec1@x.com", "Recepcionista", 1)
        self.ger1 = self._funcionario("Roberto Silva", "ger1@x.com", "Gerente Geral", 1)
        self.sub1 = self._funcionario("Fernanda Lima", "sub1@x.com", "Subgerente", 1)
        self.adm1 = self._funcionario("Admin Um", "adm1@x.com", "Administrador", 1)

    def _inbox(self, tipo=None):
        rows = self.db.read("notificacao", {"tipo": tipo} if tipo else None)
        return sorted(self.db.read("hospede", {"id_hospede": r["id_hospede"]})[0]["email"] for r in rows)

    def test_confirmacao_vai_para_o_hospede_e_e_idempotente(self):
        rid = self._reserva("2026-10-10", "2026-10-12")
        r1 = ConfirmacaoReservaNotificacao().notify({"id_reserva": rid})
        self.assertEqual((r1["success"], r1["enviadas"]), (True, 1))
        r2 = ConfirmacaoReservaNotificacao().notify({"id_reserva": rid})
        self.assertEqual((r2["enviadas"], r2["ja_enviadas"]), (0, 1))
        msg = self.db.read("notificacao")[0]
        self.assertEqual(self._inbox(), ["mariana@x.com"])
        self.assertIn("Olá, Mariana!", msg["mensagem"])
        self.assertIn("quarto 101", msg["mensagem"])

    def test_limpeza_so_equipe_do_hotel_do_quarto(self):
        r = QuartoParaLimpezaNotificacao().notify({"id_quarto": self.quarto1})
        self.assertEqual(r["enviadas"], 2)
        self.assertEqual(self._inbox("quarto_para_limpeza"), ["cam1@x.com", "gov1@x.com"])

    def test_manutencao_vai_para_gerencia_e_admin(self):
        r = ManutencaoNotificacao().notify({"id_quarto": self.quarto1, "motivo": "ar-condicionado"})
        self.assertEqual(r["enviadas"], 3)
        self.assertEqual(self._inbox("quarto_manutencao"), ["adm1@x.com", "ger1@x.com", "sub1@x.com"])
        self.assertIn("ar-condicionado", self.db.read("notificacao")[0]["mensagem"])

    def test_chegadas_do_dia(self):
        vazio = ChegadaDoDiaNotificacao().notify({"id_hotel": 1, "data": "2026-10-10"})
        self.assertEqual((vazio["success"], vazio["enviadas"]), (True, 0))
        self._reserva("2026-10-10", "2026-10-12")
        self._reserva("2026-10-10", "2026-10-11", quarto=self.quarto2)  # outro hotel: fora do resumo
        r = ChegadaDoDiaNotificacao().notify({"id_hotel": 1, "data": "2026-10-10"})
        self.assertEqual(r["enviadas"], 1)
        self.assertEqual(self._inbox("chegadas_do_dia"), ["rec1@x.com"])
        corpo = self.db.read("notificacao")[0]["mensagem"]
        self.assertIn("Quarto 101: Mariana Silva", corpo)
        again = ChegadaDoDiaNotificacao().notify({"id_hotel": 1, "data": "2026-10-10"})
        self.assertEqual((again["enviadas"], again["ja_enviadas"]), (0, 1))

    def test_contexto_invalido_nao_levanta_excecao(self):
        r = QuartoParaLimpezaNotificacao().notify({"id_quarto": 9999})
        self.assertFalse(r["success"])
        self.assertIn("não encontrado", r["mensagem"])
        self.assertFalse(ChegadaDoDiaNotificacao().notify({})["success"])


if __name__ == "__main__": unittest.main(verbosity=2)
