from ..tarifa_template import Modificador, TarifaCalculationTemplate
from .tarifa_fidelidade_template import TarifaFidelidadeTemplate
from .tarifa_longa_estadia_template import TarifaLongaEstadiaTemplate
from .tarifa_padrao_template import TarifaPadraoTemplate
from .tarifa_temporada_template import TarifaTemporadaTemplate

POLITICAS: dict[str, type[TarifaCalculationTemplate]] = {
    cls.politica: cls
    for cls in (
        TarifaFidelidadeTemplate,
        TarifaLongaEstadiaTemplate,
        TarifaPadraoTemplate,
        TarifaTemporadaTemplate,
    )
}

def get_tarifa_template(nome: str | None = None) -> TarifaCalculationTemplate:
    """Resolve a política pelo nome (padrão: 'padrao'). Levanta ValueError se não existir."""
    chave = (nome or "padrao").strip().lower()
    if chave not in POLITICAS: raise ValueError(f"Política de tarifa desconhecida: '{nome}'. Opções: {', '.join(POLITICAS)}")
    return POLITICAS[chave]()

def listar_politicas() -> list[dict[str, str]]: return [{"politica": nome, "descricao": cls.descricao} for nome, cls in POLITICAS.items()]

__all__ = [
    "Modificador",
    "TarifaCalculationTemplate",
    "TarifaPadraoTemplate",
    "TarifaFidelidadeTemplate",
    "TarifaTemporadaTemplate",
    "TarifaLongaEstadiaTemplate",
    "POLITICAS",
    "get_tarifa_template",
    "listar_politicas",
]
