from ..notificacao_template import NotificacaoTemplate
from .confirmacao_reserva_template import ConfirmacaoReservaNotificacao
from .quarto_para_limpeza_template import QuartoParaLimpezaNotificacao
from .manutencao_template import ManutencaoNotificacao
from .chegada_do_dia_notificacao_template import ChegadaDoDiaNotificacao

__all__ = [
    "NotificacaoTemplate",
    "ConfirmacaoReservaNotificacao",
    "QuartoParaLimpezaNotificacao",
    "ManutencaoNotificacao",
    "ChegadaDoDiaNotificacao",
]
