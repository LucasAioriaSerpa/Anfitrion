from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import date
from typing import Any

try:
    from manager.Database import Database
    from utils.Loggers import Logger
except ImportError:
    from app.backend.manager.Database import Database
    from app.backend.utils.Loggers import Logger


@dataclass(frozen=True)
class Modificador:
    """Acréscimo/desconto aplicado ao cálculo. `percentual` está em pontos percentuais (10.0 = 10%)."""
    valor: float = 0.0
    percentual: float = 0.0
    descricao: str = ""

    @classmethod
    def nenhum(cls) -> "Modificador":
        return cls()

    def to_dict(self) -> dict[str, Any]:
        return {
            "valor": round(self.valor, 2),
            "percentual": round(self.percentual, 2),
            "descricao": self.descricao,
        }


class TarifaCalculationTemplate(ABC):
    """
    Design Pattern: TEMPLATE METHOD
    Define o fluxo invariante do cálculo do valor de uma reserva:

        1. Ler datas e contar noites
        2. Valor base (diária x noites)
        3. Ajuste de tarifa           (hook: sazonalidade, etc.)
        4. Adicionais (café, almoço, jantar, refeição, pet)
        5. Desconto                   (passo abstrato: política comercial)
        6. Total e detalhamento

    As subclasses definem apenas a política (descontos/ajustes); o fluxo não muda.
    Usado por Gerente/Subgerente/Administrador para simular e conferir tarifas.
    """

    politica: str = "base"
    descricao: str = ""

    def __init__(self) -> None:
        self._db = Database()
        self._log = Logger()

    # =========================================================================
    # TEMPLATE METHOD
    # =========================================================================

    def calculate(
        self,
        reserva: dict[str, Any],
        quarto: dict[str, Any],
        hospede: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        check_in, check_out = self.parse_dates(reserva)
        noites = self.count_nights(check_in, check_out)
        diaria = self.get_daily_rate(quarto)
        valor_base = round(diaria * noites, 2)

        ajuste = self.calculate_adjustment(valor_base, noites, reserva, quarto, hospede)
        valor_diarias = round(valor_base + ajuste.valor, 2)

        extras = self.calculate_extras(reserva, noites)
        desconto = self.calculate_discount(valor_diarias, noites, reserva, quarto, hospede)

        subtotal = round(valor_diarias + extras["total"], 2)
        total = round(max(0.0, subtotal - desconto.valor), 2)

        result = self.build_breakdown(
            check_in, check_out, noites, diaria, valor_base, ajuste, valor_diarias, extras, subtotal, desconto, total
        )
        self._log.log_info(
            f"[ Tarifa:{self.politica} ] - {noites} noite(s), subtotal R$ {subtotal:.2f}, total R$ {total:.2f}"
        )
        return result

    # =========================================================================
    # PASSO ABSTRATO (varia por política)
    # =========================================================================

    @abstractmethod
    def calculate_discount(
        self,
        valor_diarias: float,
        noites: int,
        reserva: dict[str, Any],
        quarto: dict[str, Any],
        hospede: dict[str, Any] | None,
    ) -> Modificador:
        """Retorna o desconto da política sobre o valor das diárias."""

    # =========================================================================
    # PASSOS COM IMPLEMENTAÇÃO PADRÃO / HOOKS
    # =========================================================================

    def parse_dates(self, reserva: dict[str, Any]) -> tuple[date, date]:
        try:
            check_in = date.fromisoformat(str(reserva.get("check_in", ""))[:10])
            check_out = date.fromisoformat(str(reserva.get("check_out", ""))[:10])
        except ValueError:
            raise ValueError("Datas inválidas: use o formato AAAA-MM-DD em check_in e check_out")
        return check_in, check_out

    def count_nights(self, check_in: date, check_out: date) -> int:
        noites = (check_out - check_in).days
        if noites <= 0:
            raise ValueError("check_out deve ser posterior ao check_in")
        return noites

    def get_daily_rate(self, quarto: dict[str, Any]) -> float:
        try:
            diaria = float(quarto.get("diaria", 0))
        except (TypeError, ValueError):
            raise ValueError("Diária do quarto inválida")
        if diaria < 0:
            raise ValueError("Diária do quarto não pode ser negativa")
        return diaria

    def calculate_adjustment(
        self,
        valor_base: float,
        noites: int,
        reserva: dict[str, Any],
        quarto: dict[str, Any],
        hospede: dict[str, Any] | None,
    ) -> Modificador:
        """Hook: acréscimo (valor > 0) ou redução (valor < 0) na tarifa. Padrão: nenhum."""
        return Modificador.nenhum()

    def calculate_extras(self, reserva: dict[str, Any], noites: int) -> dict[str, float]:
        """Mesma regra do frontend: café/almoço/jantar por noite; refeição e pet são taxas únicas."""
        def valor(campo: str) -> float:
            return float(reserva.get(campo) or 0.0)

        extras = {
            "cafe_manha": round(valor("taxa_cafe_manha") * noites, 2),
            "almoco": round(valor("taxa_almoco") * noites, 2),
            "jantar": round(valor("taxa_jantar") * noites, 2),
            "refeicao": round(valor("taxa_refeicao"), 2),
            "pet": round(valor("taxa_pet"), 2),
        }
        extras["total"] = round(sum(extras.values()), 2)
        return extras

    def build_breakdown(
        self,
        check_in: date,
        check_out: date,
        noites: int,
        diaria: float,
        valor_base: float,
        ajuste: Modificador,
        valor_diarias: float,
        extras: dict[str, float],
        subtotal: float,
        desconto: Modificador,
        total: float,
    ) -> dict[str, Any]:
        return {
            "politica": self.politica,
            "descricao_politica": self.descricao,
            "check_in": check_in.isoformat(),
            "check_out": check_out.isoformat(),
            "noites": noites,
            "diaria": round(diaria, 2),
            "valor_base": valor_base,
            "ajuste_tarifa": ajuste.to_dict(),
            "valor_diarias": valor_diarias,
            "extras": extras,
            "subtotal": subtotal,
            "desconto": desconto.to_dict(),
            "total": total,
        }

    # =========================================================================
    # UTILITÁRIOS PARA SUBCLASSES
    # =========================================================================

    def percent_of(self, valor: float, percentual: float, descricao: str) -> Modificador: return Modificador(valor=round(valor * percentual / 100, 2), percentual=percentual, descricao=descricao)
