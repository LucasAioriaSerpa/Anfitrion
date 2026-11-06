# Database First

Esta pasta contém o gerador somente leitura do Anfitrion. Ele inspeciona o
SQLite existente e cria artefatos Python sem alterar tabelas, dados ou
migrações.

## Gerar

A partir da raiz do repositório:

```powershell
py -m app.backend.database.FIRST.generator
```

Também é possível indicar caminhos:

```powershell
py -m app.backend.database.FIRST.generator --database app/database/db_anfitrion.db --output app/backend/database/FIRST/generated
```

Os artefatos são escritos em `generated/`:

- `schema.json`: metadados de tabelas, colunas, tipos, chaves e relações;
- `models.py`: dataclasses geradas;
- `repository.py`: CRUD genérico com identificadores limitados ao esquema;
- `routes.py`: API em `/api/generated`;
- `__init__.py`: exportação do Blueprint.

O `App` registra o Blueprint gerado sem substituir as rotas manuais. O endpoint
`/api/generated/schema` não expõe campos sensíveis como `senha`, `token` ou
`secret`. A interface administrativa React usa esse manifesto para montar
listas e formulários genéricos.

## Limitações

O gerador não cria regras de negócio, autorização por cargo, autenticação,
migrações ou telas específicas de reserva. Essas regras continuam nas camadas
manuais existentes. Os arquivos dentro de `generated/` são sobrescritos quando
o gerador é executado novamente.
