from abc import ABC, abstractmethod
from typing import Any

try:
    from manager.Database import Database
    from config.Config import Config
    from utils.Loggers import Logger
except ImportError:
    from app.backend.manager.Database import Database
    from app.backend.config.Config import Config
    from app.backend.utils.Loggers import Logger


class CrudTemplate(ABC):
    """
    Design Pattern: TEMPLATE METHOD
    Define a estrutura e o fluxo de execução invariante para operações de CRUD.
    As subclasses concretas implementam os passos específicos de cada entidade
    (validações, regras de negócio, transformações pré e pós-salvamento).
    """

    def __init__(self, table_name: str, primary_key: str, entity_name: str) -> None:
        self.table_name = table_name
        self.primary_key = primary_key
        self.entity_name = entity_name
        self._db = Database()
        self._config = Config()
        self._log = Logger()

    # =========================================================================
    # TEMPLATE METHODS (Esqueleto fixo dos algoritmos de CRUD)
    # =========================================================================

    def process_create(self, payload: dict[str, Any]) -> tuple[dict[str, Any], int]:
        """
        Template Method para CRIAÇÃO:
        1. Validação do payload
        2. Hook pré-criação (before_save)
        3. Execução da inserção no banco
        4. Leitura do registro recém-criado
        5. Hook pós-criação (after_save)
        6. Formatação e retorno da resposta HTTP
        """
        self._log.log_info(f"[ {self.entity_name}Template ] - Iniciando criação de {self.entity_name}")
        try:
            validated_data = self.validate_payload(payload, is_update=False)
            prepared_data = self.before_save(validated_data, is_update=False)
            
            new_id = self.execute_insert(prepared_data)
            created_record = self.execute_select_by_id(new_id)

            if not created_record:
                raise RuntimeError(f"Registro criado em {self.table_name}, mas falha ao recuperar por ID: {new_id}")

            processed_record = self.after_save(created_record, is_update=False)
            self._log.log_success(f"[ {self.entity_name}Template ] - {self.entity_name} criado com sucesso (ID: {new_id})")
            return self.format_response(
                data=processed_record,
                status=201,
                message=f"{self.entity_name.capitalize()} criado com sucesso",
                success=True
            )
        except ValueError as ve:
            self._log.log_warning(f"[ {self.entity_name}Template ] - Validação falhou: {str(ve)}")
            return self.format_response(data=None, status=400, message=str(ve), success=False)
        except Exception as e:
            self._log.log_error(f"[ {self.entity_name}Template ] - Erro interno na criação: {str(e)}")
            return self.format_response(data=None, status=500, message=f"Erro interno: {str(e)}", success=False)

    def process_read_all(self, filters: dict[str, Any] | None = None) -> tuple[dict[str, Any], int]:
        """
        Template Method para LISTAGEM:
        1. Sanitização dos filtros recebidos da query
        2. Execução da consulta no banco
        3. Hook de pós-processamento dos registros
        4. Retorno dos registros formatados
        """
        self._log.log_info(f"[ {self.entity_name}Template ] - Listando registros de {self.entity_name}")
        try:
            sanitized_filters = self.sanitize_filters(filters or {})
            records = self.execute_select_all(sanitized_filters)
            processed_records = [self.after_read(rec) for rec in records]
            self._log.log_success(f"[ {self.entity_name}Template ] - {len(processed_records)} registros encontrados")
            return self.format_response(
                data=processed_records,
                status=200,
                message=f"{len(processed_records)} registros encontrados",
                success=True,
                extra={"total": len(processed_records)}
            )
        except Exception as e:
            self._log.log_error(f"[ {self.entity_name}Template ] - Erro ao buscar registros: {str(e)}")
            return self.format_response(data=None, status=500, message=str(e), success=False)

    def process_read_by_id(self, entity_id: int) -> tuple[dict[str, Any], int]:
        """
        Template Method para CONSULTA POR ID:
        1. Validação do ID
        2. Execução da busca no banco
        3. Verificação de existência
        4. Hook de pós-leitura
        5. Retorno
        """
        self._log.log_info(f"[ {self.entity_name}Template ] - Buscando {self.entity_name} ID: {entity_id}")
        try:
            validated_id = self.validate_id(entity_id)
            record = self.execute_select_by_id(validated_id)
            if not record:
                self._log.log_warning(f"[ {self.entity_name}Template ] - ID {entity_id} não encontrado")
                return self.format_response(data=None, status=404, message=f"{self.entity_name.capitalize()} não encontrado", success=False)

            processed = self.after_read(record)
            return self.format_response(data=processed, status=200, message="Registro encontrado", success=True)
        except ValueError as ve:
            return self.format_response(data=None, status=400, message=str(ve), success=False)
        except Exception as e:
            self._log.log_error(f"[ {self.entity_name}Template ] - Erro ao buscar por ID: {str(e)}")
            return self.format_response(data=None, status=500, message=str(e), success=False)

    def process_update(self, entity_id: int, payload: dict[str, Any]) -> tuple[dict[str, Any], int]:
        """
        Template Method para ATUALIZAÇÃO:
        1. Validação do ID e checagem de existência prévia
        2. Validação dos dados parciais recebidos
        3. Hook pré-atualização
        4. Execução da atualização no banco
        5. Busca do registro atualizado
        6. Hook pós-atualização
        7. Retorno
        """
        self._log.log_info(f"[ {self.entity_name}Template ] - Atualizando {self.entity_name} ID: {entity_id}")
        try:
            validated_id = self.validate_id(entity_id)
            existing = self.execute_select_by_id(validated_id)
            if not existing:
                self._log.log_warning(f"[ {self.entity_name}Template ] - ID {entity_id} não encontrado para update")
                return self.format_response(data=None, status=404, message=f"{self.entity_name.capitalize()} não encontrado", success=False)

            validated_data = self.validate_payload(payload, is_update=True)
            prepared_data = self.before_save(validated_data, is_update=True)

            self.execute_update(validated_id, prepared_data)
            updated_record = self.execute_select_by_id(validated_id)
            if not updated_record:
                raise RuntimeError(f"Registro atualizado em {self.table_name}, mas falha ao recuperar por ID: {validated_id}")
            processed_record = self.after_save(updated_record, is_update=True)

            self._log.log_success(f"[ {self.entity_name}Template ] - {self.entity_name} ID: {entity_id} atualizado com sucesso")
            return self.format_response(data=processed_record, status=200, message="Atualizado com sucesso", success=True)
        except ValueError as ve:
            self._log.log_warning(f"[ {self.entity_name}Template ] - Validação falhou no update: {str(ve)}")
            return self.format_response(data=None, status=400, message=str(ve), success=False)
        except Exception as e:
            self._log.log_error(f"[ {self.entity_name}Template ] - Erro no update: {str(e)}")
            return self.format_response(data=None, status=500, message=str(e), success=False)

    def process_delete(self, entity_id: int) -> tuple[dict[str, Any], int]:
        """
        Template Method para EXCLUSÃO:
        1. Validação do ID e checagem de existência prévia
        2. Hook antes da exclusão (limpeza/regras de integridade)
        3. Execução da exclusão no banco
        4. Hook após a exclusão
        5. Retorno
        """
        self._log.log_info(f"[ {self.entity_name}Template ] - Excluindo {self.entity_name} ID: {entity_id}")
        try:
            validated_id = self.validate_id(entity_id)
            existing = self.execute_select_by_id(validated_id)
            if not existing:
                self._log.log_warning(f"[ {self.entity_name}Template ] - ID {entity_id} não encontrado para exclusão")
                return self.format_response(data=None, status=404, message=f"{self.entity_name.capitalize()} não encontrado", success=False)

            self.before_delete(existing)
            self.execute_delete(validated_id)
            self.after_delete(existing)

            self._log.log_success(f"[ {self.entity_name}Template ] - {self.entity_name} ID: {entity_id} excluído com sucesso")
            return self.format_response(data={"id": validated_id}, status=200, message="Excluído com sucesso", success=True)
        except ValueError as ve:
            return self.format_response(data=None, status=400, message=str(ve), success=False)
        except Exception as e:
            self._log.log_error(f"[ {self.entity_name}Template ] - Erro ao excluir: {str(e)}")
            return self.format_response(data=None, status=500, message=str(e), success=False)

    # =========================================================================
    # PRIMITIVE OPERATIONS & HOOKS (Podem ou devem ser sobrescritos pelas subclasses)
    # =========================================================================

    def validate_id(self, entity_id: Any) -> int:
        """Valida que o ID é um número inteiro positivo."""
        try:
            val = int(entity_id)
            if val <= 0:
                raise ValueError
            return val
        except (ValueError, TypeError):
            raise ValueError(f"ID inválido fornecido: {entity_id}")

    @abstractmethod
    def validate_payload(self, data: dict[str, Any], is_update: bool = False) -> dict[str, Any]:
        """Valida os campos obrigatórios e tipos de dados da entidade."""
        pass

    def before_save(self, data: dict[str, Any], is_update: bool = False) -> dict[str, Any]:
        """Hook opcional executado antes de persistir no banco."""
        return data

    def after_save(self, record: dict[str, Any], is_update: bool = False) -> dict[str, Any]:
        """Hook opcional executado após a gravação no banco."""
        return record

    def after_read(self, record: dict[str, Any]) -> dict[str, Any]:
        """Hook opcional executado após a leitura de cada registro."""
        return record

    def before_delete(self, existing: dict[str, Any]) -> None:
        """Hook opcional para verificar dependências antes de excluir."""
        pass

    def after_delete(self, existing: dict[str, Any]) -> None:
        """Hook opcional executado após a exclusão."""
        pass

    def sanitize_filters(self, filters: dict[str, Any]) -> dict[str, Any]:
        """Sanitiza filtros de consulta removendo valores vazios ou não mapeados."""
        return {k: v for k, v in filters.items() if v is not None and v != ""}

    # =========================================================================
    # OPERAÇÕES DE BANCO (Implementação padrão utilizando o Database Singleton)
    # =========================================================================

    def execute_insert(self, data: dict[str, Any]) -> int:
        return self._db.create(self.table_name, data)

    def execute_select_all(self, filters: dict[str, Any]) -> list[dict[str, Any]]:
        return self._db.read(self.table_name, filters)

    def execute_select_by_id(self, entity_id: int) -> dict[str, Any] | None:
        results = self._db.read(self.table_name, {self.primary_key: entity_id})
        return results[0] if results else None

    def execute_update(self, entity_id: int, data: dict[str, Any]) -> bool:
        return self._db.update(self.table_name, data, {self.primary_key: entity_id})

    def execute_delete(self, entity_id: int) -> bool:
        return self._db.delete(self.table_name, {self.primary_key: entity_id})

    def format_response(
        self,
        data: Any,
        status: int,
        message: str = "",
        success: bool = True,
        extra: dict[str, Any] | None = None
    ) -> tuple[dict[str, Any], int]:
        """Formata uma resposta JSON padrão para o React."""
        res = {
            "success": success,
            "status": status,
            "message": message,
            "data": data
        }
        if extra:
            res.update(extra)
        return res, status
