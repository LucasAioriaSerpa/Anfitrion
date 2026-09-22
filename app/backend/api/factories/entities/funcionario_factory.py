from typing import Any


try:
    from ..entity_factory import EntityFactory
    from classes.Funcionario import Funcionario
except:
    from app.backend.api.factories.entity_factory import EntityFactory
    from app.backend.classes.Funcionario import Funcionario

class FuncionarioFactory(EntityFactory):
    """Fábrica Concreta para criação de instâncias de Funcionario."""
    def create_entity(self, data: dict[str, Any]) -> Funcionario:
        self._log.log_info(f"[ FuncionarioFactory ] - Fabricando entidade Funcionario: {data.get('email')}")
        return Funcionario.from_dict(data)
