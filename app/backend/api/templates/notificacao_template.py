from abc import ABC, abstractmethod
from typing import Any

try:
    from manager.Database import Database
    from utils.Loggers import Logger
except ImportError:
    from app.backend.manager.Database import Database
    from app.backend.utils.Loggers import Logger


class NotificacaoTemplate(ABC):
    """
    Define o fluxo invariante de envio de uma notificação interna:

        1. prepare_context     (hook: carrega entidades do contexto)
        2. should_notify       (hook: decide se vale notificar)
        3. resolve_recipients  (passo abstrato: QUEM recebe)
        4. build_message       (passo abstrato: O QUE é dito)
        5. para cada destinatário: dedup -> render -> send (hooks)
        6. after_send          (hook)

    `notify` nunca levanta exceção: falhas de notificação não podem derrubar a operação
    principal (ex.: criar reserva). O resultado descreve o que aconteceu.

    Destinatários são sempre linhas de `hospede` (funcionários também são hóspedes no modelo atual),
    então a notificação fica ligada a `id_hospede`.
    """

    tipo: str = "geral"

    def __init__(self) -> None:
        self._db = Database()
        self._log = Logger()

    # =========================================================================
    # TEMPLATE METHOD
    # =========================================================================

    def notify(self, context: dict[str, Any]) -> dict[str, Any]:
        try:
            ctx = self.prepare_context(dict(context))
            if not self.should_notify(ctx):
                return self._result(True, 0, 0, 0, "Nada a notificar")

            destinatarios = self.resolve_recipients(ctx)
            if not destinatarios:
                self._log.log_warning(f"[ Notificacao:{self.tipo} ] - Nenhum destinatário encontrado")
                return self._result(True, 0, 0, 0, "Nenhum destinatário encontrado")

            mensagem = self.build_message(ctx)
            referencia = self.reference(ctx)

            enviadas = ignoradas = 0
            for destinatario in destinatarios:
                if referencia and self.already_sent(destinatario, referencia):
                    ignoradas += 1
                    continue
                if self.send(destinatario, self.render(mensagem, destinatario), ctx, referencia):
                    enviadas += 1

            self.after_send(ctx, destinatarios, enviadas)
            self._log.log_success(
                f"[ Notificacao:{self.tipo} ] - {enviadas}/{len(destinatarios)} enviada(s), {ignoradas} já enviada(s)"
            )
            return self._result(True, len(destinatarios), enviadas, ignoradas, "Processado")
        except ValueError as error:
            self._log.log_warning(f"[ Notificacao:{self.tipo} ] - Contexto inválido: {error}")
            return self._result(False, 0, 0, 0, str(error))
        except Exception as error:
            self._log.log_error(f"[ Notificacao:{self.tipo} ] - Falha inesperada: {error}")
            return self._result(False, 0, 0, 0, f"Erro interno: {error}")

    # =========================================================================
    # PASSOS ABSTRATOS
    # =========================================================================

    @abstractmethod
    def resolve_recipients(self, ctx: dict[str, Any]) -> list[dict[str, Any]]:
        """Lista de destinatários: [{'id_hospede', 'nome', 'email', 'id_hotel'}]."""

    @abstractmethod
    def build_message(self, ctx: dict[str, Any]) -> dict[str, str]:
        """Retorna {'assunto': ..., 'corpo': ...}. Use '{nome}' no corpo para o primeiro nome do destinatário."""

    # =========================================================================
    # HOOKS
    # =========================================================================

    def prepare_context(self, ctx: dict[str, Any]) -> dict[str, Any]:
        return ctx

    def should_notify(self, ctx: dict[str, Any]) -> bool:
        return True

    def reference(self, ctx: dict[str, Any]) -> str | None:
        """Chave de idempotência. Se informada, o mesmo (destinatário, tipo, referência) é enviado uma única vez."""
        return None

    def hotel_id(self, ctx: dict[str, Any]) -> int | None:
        value = ctx.get("id_hotel")
        return int(value) if value is not None else None

    def render(self, mensagem: dict[str, str], destinatario: dict[str, Any]) -> dict[str, str]:
        primeiro_nome = str(destinatario.get("nome") or "").strip().split(" ")[0] or "equipe"
        return {
            "assunto": mensagem["assunto"],
            "corpo": mensagem["corpo"].replace("{nome}", primeiro_nome),
        }

    def send(
        self,
        destinatario: dict[str, Any],
        mensagem: dict[str, str],
        ctx: dict[str, Any],
        referencia: str | None,
    ) -> bool:
        """Canal padrão: caixa de entrada interna (tabela `notificacao`). Sobrescreva para e-mail/WhatsApp."""
        notificacao_id = self._db.create("notificacao", {
            "id_hospede": destinatario["id_hospede"],
            "id_hotel": self.hotel_id(ctx),
            "tipo": self.tipo,
            "assunto": mensagem["assunto"],
            "mensagem": mensagem["corpo"],
            "referencia": referencia,
        })
        return bool(notificacao_id and notificacao_id > 0)

    def already_sent(self, destinatario: dict[str, Any], referencia: str) -> bool:
        existentes = self._db.read("notificacao", {
            "id_hospede": destinatario["id_hospede"],
            "tipo": self.tipo,
            "referencia": referencia,
        })
        return any(existentes)

    def after_send(self, ctx: dict[str, Any], destinatarios: list[dict[str, Any]], enviadas: int) -> None:
        pass

    # =========================================================================
    # UTILITÁRIOS PARA SUBCLASSES
    # =========================================================================

    def get_one(self, table: str, key: str, value: Any) -> dict[str, Any]:
        rows = [row for row in self._db.read(table, {key: value}) if row]
        if not rows:
            raise ValueError(f"{table.capitalize()} {value} não encontrado(a)")
        return rows[0]

    def recipient_from_hospede(self, hospede: dict[str, Any], id_hotel: int | None = None) -> dict[str, Any]:
        return {
            "id_hospede": hospede["id_hospede"],
            "nome": hospede.get("nome"),
            "email": hospede.get("email"),
            "id_hotel": id_hotel,
        }

    def staff_of_hotel(self, id_hotel: int, cargos: tuple[str, ...]) -> list[dict[str, Any]]:
        """Funcionários do hotel cujo cargo contém algum dos trechos informados (case-insensitive)."""
        destinatarios = []
        for funcionario in self._db.read("funcionario", {"id_hotel": id_hotel}):
            cargo = str(funcionario.get("cargo", "")).lower()
            if not funcionario or not any(trecho in cargo for trecho in cargos):
                continue
            hospedes = [h for h in self._db.read("hospede", {"id_hospede": funcionario["id_hospede"]}) if h]
            if hospedes:
                destinatarios.append(self.recipient_from_hospede(hospedes[0], id_hotel))
        return destinatarios

    def _result(self, success: bool, destinatarios: int, enviadas: int, ignoradas: int, mensagem: str) -> dict[str, Any]:
        return {
            "success": success,
            "tipo": self.tipo,
            "destinatarios": destinatarios,
            "enviadas": enviadas,
            "ja_enviadas": ignoradas,
            "mensagem": mensagem,
        }
