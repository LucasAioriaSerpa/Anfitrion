<div style="display: flex; justify-content: center; align-items: center; height: 50vh"><img src="img/logo-Anfitrion.png"></div>

# Arquitetura do Backend - Sistema Anfitrião

Este documento descreve de forma clara, simples e direta a arquitetura do backend do **Anfitrião**, detalhando a organização estrutural, os padrões de projeto (Design Patterns) implementados e o funcionamento das funcionalidades mais complexas do sistema.

---

## 1. Visão Geral e Tecnologias

O backend do Anfitrião é construído em **Python 3**, utilizando **Flask** para a exposição de APIs "RESTful" e **SQLite3** para a persistência relacional. A aplicação adota os princípios de Programação Orientada a Objetos (**POO**) e Orientação a Reuso (**OO**), organizando-se em módulos por responsabilidade e recursos de domínio (_features_).

| Componente          | Tecnologia                                 | Papel                                                             |
| :------------------ | :----------------------------------------- | :---------------------------------------------------------------- |
| **Linguagem**       | Python 3                                   | Lógica de negócios, modelos de domínio e concorrência             |
| **Web Framework**   | Flask (Blueprints)                         | Endpoints HTTP, roteamento e serialização JSON                    |
| **Banco de Dados**  | SQLite3 relacional                         | Armazenamento transacional com integridade referencial ativa      |
| **Autenticação**    | `itsdangerous` + PBKDF2-HMAC-SHA256        | Token assinado com expiração e hash de senhas                     |
| **Concorrência**    | `threading` nativo                         | Separação entre Thread de Background (pesada) e Thread Web (HTTP) |
| **Empacotamento**   | PyInstaller                                | Geração do executável (`Main.spec`, `build.ps1`, `build.bash`)    |
| **Design Patterns** | Singleton, Factory Method, Template Method | Modularidade, reuso de código e desacoplamento                    |

---

## 2. Estrutura de Pastas e Componentes

A estrutura interna sob `/app/backend` foi desenhada para garantir isolamento e manutenibilidade:

```text
app/backend/
├── Main.py                      # Ponto de entrada: orquestra as Threads MAIN e FLASK
├── api/
│   ├── App.py                   # Servidor Flask, CORS e registro de Blueprints
│   ├── auth/                    # Autenticação e autorização
│   │   ├── auth_context.py      # Token assinado, require_auth e escopo por hotel
│   │   └── cargo_guard.py       # require_cargo: autorização por cargo do funcionário
│   ├── factories/               # Padrão Factory Method
│   │   ├── entity_factory.py    # Classe base abstrata EntityFactory
│   │   ├── model_factory.py     # Despachante central de fábricas
│   │   ├── user_factory.py      # Fábrica especializada para Hospede e Funcionario
│   │   └── entities/            # Fábricas concretas de cada recurso
│   ├── templates/               # Padrão Template Method
│   │   ├── crud_template.py         # Algoritmo invariante das operações CRUD
│   │   ├── tarifa_template.py       # Algoritmo invariante do cálculo de tarifa
│   │   ├── notificacao_template.py  # Algoritmo invariante do envio de notificações
│   │   ├── entities_crud/           # Especializações do CRUD (regras, hooks e validações)
│   │   ├── entities_tarifa/         # Políticas de tarifa + registro (POLITICAS)
│   │   └── entities_notificacao/    # Tipos de notificação
│   └── features/                # Blueprints do Flask com rotas HTTP RESTful
├── classes/                     # Classes de Domínio (Hospede, Hotel, Quarto, Funcionario, Reserva)
├── config/                      # Configurações globais e repositório de memória compartilhada
├── database/
│   ├── setup_db.py              # DDL de inicialização das tabelas SQLite
│   ├── data/mock_data.json      # Dados de semente compartilhados com o frontend
│   └── mock/seed_mock_data.py   # Geração e inserção dos dados mock
├── manager/                     # Camada de acesso a dados (Database thread-safe)
├── meta/                        # Metaclasses estruturais (Singleton)
├── private/cypher.py            # Hash e verificação de senhas (PBKDF2)
├── tests/                       # Testes automatizados (unittest)
└── utils/                       # Utilitários de sistema e padronização de Logs
```

---

## 3. Padrões de Projeto (Design Patterns)

### 3.1. Singleton

- **Onde é aplicado**:
  `Config` (`config/Config.py`) e `Database` (`manager/Database.py`), via metaclasse `Singleton` (`meta/Singleton.py`).
- **Como funciona**:
  A metaclasse `Singleton` intercepta a instanciação das classes e utiliza uma trava de exclusão mútua (`threading.Lock`). Se uma instância já existir na tabela `_instances`, ela é retornada imediatamente.
- **Por que é essencial**:
  - Garante que haja apenas uma conexão centralizada com o banco de dados.
  - Permite que variáveis dinâmicas e métricas sejam compartilhadas de forma síncrona e segura entre threads distintas sem risco de condição de corrida (_race condition_).

### 3.2. Factory Method

- **Onde é aplicado**: Módulo `api/factories/`.
  - Base: `EntityFactory` (classe abstrata com o método `create_entity(data)`).
  - Concretas: `HospedeFactory`, `HotelFactory`, `QuartoFactory`, `FuncionarioFactory`, `ReservaFactory` e `userFactory`.
  - Despachante: `ModelFactory.create(entity_name, data)`.
- **Como funciona**: O chamador não precisa saber como instanciar cada modelo ou lidar com casting de tipos e atributos opcionais. O `ModelFactory` localiza a fábrica correta e produz o objeto correspondente a partir de um dicionário de dados. Os templates de CRUD de hóspede, hotel, quarto e reserva usam `ModelFactory.create(...)` dentro de `validate_payload` para garantir que o payload gera uma entidade de domínio válida antes de gravar.
- **`userFactory`**: usada em `/api/auth/register`; decide entre `Hospede` e `Funcionario` a partir de `role`/`cargo`.

### 3.3. Template Method

O padrão é aplicado em **três** famílias de algoritmos. Em todas, a classe base define o fluxo fixo e as subclasses implementam apenas os passos variáveis.

#### 3.3.1. CRUD (`CrudTemplate`)

- **Onde**: `api/templates/crud_template.py` e `api/templates/entities_crud/`.
- **Especializações**: `HospedeCrudTemplate`, `HotelCrudTemplate`, `QuartoCrudTemplate`, `FuncionarioCrudTemplate` e `ReservaCrudTemplate`.
- **Fluxo**: define `process_create`, `process_read_all`, `process_read_by_id`, `process_update` e `process_delete`. Exemplo da criação:
  1. Validação do payload (`validate_payload`, **passo abstrato**);
  2. Transformações pré-gravação (`before_save`, hook);
  3. Execução do `INSERT` (`execute_insert`);
  4. Leitura do registro criado (`execute_select_by_id`);
  5. Pós-processamento e efeitos colaterais (`after_save`, hook);
  6. Resposta JSON padronizada (`format_response`).
- **Outros hooks**: `after_read`, `before_delete`, `after_delete`, `sanitize_filters` (remove `access_token`, `email`, `login` e `senha` dos filtros de listagem, para que credenciais enviadas na query não virem filtro SQL).

#### 3.3.2. Cálculo de tarifa (`TarifaCalculationTemplate`)

- **Onde**: `api/templates/tarifa_template.py` e `api/templates/entities_tarifa/`.
- **Fluxo invariante (`calculate`)**:
  1. Ler datas e contar noites (`parse_dates`, `count_nights`);
  2. Valor base = diária × noites (`get_daily_rate`);
  3. Ajuste de tarifa (`calculate_adjustment`, hook; padrão: nenhum);
  4. Adicionais (`calculate_extras`): café, almoço e jantar são cobrados **por noite**; refeição e pet são taxas **únicas**;
  5. Desconto (`calculate_discount`, **passo abstrato**: a política comercial);
  6. Total e detalhamento (`build_breakdown`).
- **Políticas concretas** (registradas em `POLITICAS`, resolvidas por `get_tarifa_template(nome)`):

| Política        | Classe                       | Regra                                                                      |
| :-------------- | :--------------------------- | :------------------------------------------------------------------------- |
| `padrao`        | `TarifaPadraoTemplate`       | Tarifa de balcão, sem desconto                                             |
| `fidelidade`    | `TarifaFidelidadeTemplate`   | Silver (2+ estadias anteriores) 5%, Gold (5+) 10%, Diamond (10+) 15%       |
| `temporada`     | `TarifaTemporadaTemplate`    | Por noite: alta (dez, jan, fev, jul) +20%; baixa (mai, jun, ago, set) -10% |
| `longa_estadia` | `TarifaLongaEstadiaTemplate` | 7+ noites 5%, 14+ noites 10%, 30+ noites 15%                               |

- Os níveis de fidelidade espelham `Hospede.js` no frontend; só contam estadias cujo `check_out` é anterior ou igual ao `check_in` da reserva calculada.
- `Modificador` (dataclass imutável) representa qualquer acréscimo ou desconto (`valor`, `percentual`, `descricao`).

#### 3.3.3. Notificações internas (`NotificacaoTemplate`)

- **Onde**: `api/templates/notificacao_template.py` e `api/templates/entities_notificacao/`.
- **Fluxo invariante (`notify`)**:
  1. `prepare_context` (hook: carrega entidades);
  2. `should_notify` (hook: decide se vale notificar);
  3. `resolve_recipients` (**passo abstrato**: quem recebe);
  4. `build_message` (**passo abstrato**: o que é dito; `{nome}` vira o primeiro nome do destinatário);
  5. Para cada destinatário: deduplicação (`already_sent`) → `render` → `send`;
  6. `after_send` (hook).
- **Garantias**: `notify` **nunca levanta exceção** (falha de notificação não derruba a operação principal) e devolve um resumo (`destinatarios`, `enviadas`, `ja_enviadas`). A **idempotência** é dada por `reference(ctx)`: o mesmo (destinatário, tipo, referência) é enviado uma única vez.
- **Canal padrão**: caixa de entrada interna (tabela `notificacao`); `send` pode ser sobrescrito para e-mail/WhatsApp.
- **Tipos concretos**:

| Tipo                  | Classe                          | Destinatários                             |
| :-------------------- | :------------------------------ | :---------------------------------------- |
| `confirmacao_reserva` | `ConfirmacaoReservaNotificacao` | O hóspede da reserva                      |
| `quarto_para_limpeza` | `QuartoParaLimpezaNotificacao`  | Governanta e Camareiras do hotel          |
| `quarto_manutencao`   | `ManutencaoNotificacao`         | Administrador, Gerente e Subgerente       |
| `chegadas_do_dia`     | `ChegadaDoDiaNotificacao`       | Recepção do hotel (só se houver chegadas) |

---

## 4. Funcionalidades Complexas e Como Funcionam no Sistema

### 4.1. Concorrência Multi-Thread (Background Worker vs. API Web)

O sistema opera simultaneamente duas threads independentes gerenciadas pelo `Main.py`:

```text
                      ┌────────────────────────────────────────┐
                      │                Main.py                 │
                      └───────┬────────────────────────┬───────┘
                              │                        │
                     Inicia   │                        │ Inicia
                              ▼                        ▼
              ┌────────────────────────┐      ┌────────────────────────┐
              │      Thread MAIN       │      │      Thread FLASK      │
              │  (Background Worker)   │      │       (Web Server)     │
              └───────────┬────────────┘      └─────────────┬──────────┘
                          │                                 │
            Processamento │                                 │ Requisições
            em segundo    │                                 │ HTTP (React)
            plano contínuo│                                 │
                          ▼                                 ▼
                     ┌───────────┐                     ┌─────────┐
                     │ Auditoria │                     │  Rotas  │
                     │ Status    │◄──── Compartilha ──►│  CRUD & │
                     │ Métricas  │      via Config     │  Auth   │
                     └───────────┘     (Singleton)     └─────────┘
```

#### Como funciona:

1. **Thread MAIN (Worker)**:
   - Na inicialização verifica as tabelas; se faltarem, executa `setup_db.init_db()`. Em seguida, se o banco estiver vazio, popula com dados mock (`seed_database`, ver seção 4.6).
   - Executa em laço perpétuo enquanto `IS_RUNNING` for verdadeiro (intervalo `MAIN_SLEEP_INTERVAL`, padrão 3 s).
   - **Cálculo de Ocupação em Tempo Real**:
     Um quarto é contado como ocupado se seu status é `"Ocupado"` ou se há uma reserva cujo `check_out` **ainda não passou**. Reservas já vencidas são ignoradas no cálculo. A rotina **não altera** o status dos quartos no banco; ela só calcula métricas.
   - Calcula totais gerais e a **taxa de ocupação por hotel** (`taxa_ocupacao_por_hotel`).
   - **Comunicação Segura**:
     Armazena as métricas em `STATS` no `_shared_store` do `Config` (protegido por `Lock`) e incrementa `BACKGROUND_TASKS_COUNTER`. A cada 10 ciclos escreve um resumo no log.
2. **Thread FLASK (Web)**:
   - Fica dedicada a responder às requisições do frontend React sem bloqueios de I/O causados por rotinas pesadas.
   - Ao atender `/api/auth/stats`, lê os dados já processados pelo `Config`.

---

### 4.2. Ganchos (_Hooks_) e Efeitos Colaterais Automáticos no CRUD

A gestão de reservas exige que a alteração de um registro reflita no inventário de quartos. O `ReservaCrudTemplate` implementa ganchos que eliminam a intervenção manual:

1. **Ao Criar ou Atualizar Reserva (`after_save`)**:
   - Assim que a reserva é salva, `after_save` localiza o `id_quarto` e altera seu status na tabela `quarto` para `"Ocupado"`. Falhas nessa etapa são registradas como _warning_ e não derrubam a resposta.
2. **Ao Cancelar ou Deletar Reserva (`before_delete`)**:
   - Antes de remover a reserva, o hook captura o registro original e devolve o quarto para `"Disponível"`.
3. **Resolução Dinâmica de Relacionamentos (`after_read`)**:
   - `ReservaCrudTemplate`: acrescenta `quarto_tipo`, `quarto_numero`, `quarto_diaria`, `hospede_nome` e `hospede_email`.
   - `QuartoCrudTemplate`: acrescenta `hotel_nome` e `hotel_franquia`.
   - `FuncionarioCrudTemplate`: acrescenta `nome`, `email` e `telefone` do hóspede vinculado.
   - `HospedeCrudTemplate`: **remove o campo `senha`** da resposta.

---

### 4.3. Polimorfismo e Unificação de Contas (`Hospede` vs. `Funcionario`)

No modelo de negócios do Anfitrião, todo funcionário é, por essência, uma especialização de um usuário/hóspede, mas com permissões administrativas e vínculo a um hotel:

```text
              ┌────────────────────────────────────────┐
              │                Hospede                 │
              │  (nome, email, senha, telefone, etc.)  │
              └───────────────────▲────────────────────┘
                                  │
                                  │ herda de
                                  │
              ┌───────────────────┴────────────────────┐
              │              Funcionario               │
              │   (id_hotel, cargo, id_funcionario)    │
              └────────────────────────────────────────┘
```

#### Como a complexidade é resolvida:

- A classe `Funcionario` herda diretamente de `Hospede` e chama `super().__init__(...)`.
- No `FuncionarioCrudTemplate.before_save`, ao cadastrar um novo funcionário, o sistema verifica se o `email` já existe na tabela `hospede`. Se existir, reaproveita o `id_hospede`. Se não, **cria a conta de base automaticamente** (com a senha já passada por `Cypher.hash_password`) e vincula o `id_hospede` gerado ao novo registro de funcionário, em uma única operação transparente para o frontend.
- No login, a presença de uma linha em `funcionario` para o `id_hospede` define o `role` (`funcionario` ou `hospede`).

---

### 4.4. Acesso Concorrente Seguro e Integridade Transacional (`Database.py`)

O acesso ao banco SQLite precisa lidar com requisições concorrentes de múltiplas threads:

- **Foreign Keys Ativas**:
  A cada operação o comando `PRAGMA foreign_keys = ON;` é executado, impedindo que registros filhos fiquem órfãos (ex.: quartos sem hotel ou reservas sem quarto válido).
- **Isolamento de Conexão**:
  Cada operação abre uma conexão própria (`with sqlite3.connect(...)`), de modo que o commit/rollback da transação ocorre no fim de cada chamada e os locks de escrita são liberados em seguida.
- **Rollback em Exceções**:
  Em falha de execução, a transação sofre rollback e o erro é registrado no logger com a query.
- **Convenções de retorno** (importantes para quem consome a classe):
  - `create` devolve o ID gerado, ou `-1` em caso de erro;
  - `read` devolve uma lista de dicionários, ou `[{}]` em caso de erro (por isso o código consumidor filtra registros vazios, ex.: `[n for n in db.read(...) if n]`);
  - `update` e `delete` propagam a exceção.

---

### 4.5. Autenticação, Autorização e Escopo por Hotel

#### Senhas (`private/cypher.py`)

`Cypher.hash_password` gera um hash **PBKDF2-HMAC-SHA256** (600 000 iterações, salt aleatório de 16 bytes) no formato `algoritmo$iterações$salt$hash`. `verify_password` compara com `hmac.compare_digest`. Hashes não podem ser revertidos (`decrypt_password` levanta erro). No login, senhas antigas em texto puro são aceitas uma vez e **migradas automaticamente** para hash.

#### Token de acesso (`api/auth/auth_context.py`)

- No login, `issue_access_token` gera um token assinado (`URLSafeTimedSerializer`, segredo `ANFITRION_AUTH_SECRET`, validade de 8 h) com `id_hospede`, `id_funcionario`, `id_hotel`, `email` e `role`.
- O decorator `@require_auth` lê o header `Authorization: Bearer <token>`, valida assinatura e expiração e grava o usuário em `g.auth_user` (`current_user()`).
- Para funcionários, o `id_hotel` do token é **revalidado no banco** a cada requisição (o funcionário precisa existir e pertencer àquele hotel).
- Existe um modo opcional de credenciais na query string (`?access_token=` ou `?email=&senha=`), controlado por `ANFITRION_AUTH_QUERY_ENABLED` (ligado por padrão). Nele, só administradores são aceitos.

#### Escopo por hotel

Todas as rotas CRUD aplicam o mesmo filtro, centralizado em `auth_context.py`:

| Função                     | Papel                                                                                                                      |
| :------------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| `can_access_record`        | Funcionário: só registros do próprio hotel. Hóspede: só os próprios (`hospede`, `reserva`) e leitura de `quarto` e `hotel` |
| `scope_list_response`      | Filtra listagens e recalcula `total` e `message`                                                                           |
| `scope_record_response`    | Devolve 404 para registros fora do escopo (não revela que existem)                                                         |
| `payload_belongs_to_hotel` | Valida criação/edição: funcionário só cria no próprio hotel; hóspede só cria reserva para si em quarto disponível          |

Em `quarto` e `funcionario`, as rotas **sobrescrevem** `id_hotel` do payload pelo hotel do usuário autenticado. `POST /api/hotel` é sempre recusado (403).

#### Autorização por cargo (`api/auth/cargo_guard.py`)

`@require_cargo(*trechos)` exige funcionário autenticado cujo cargo (lido do banco, pois o token não o carrega) contenha algum dos trechos. Constantes:

- `CARGOS_GERENCIA = ("admin", "gerente", "subgerente")`;
- `CARGOS_RECEPCAO = CARGOS_GERENCIA + ("recep",)`.

Essa regra espelha `Funcionario.isGerenteOuSuperior()` e `isRecepcao()` do frontend.

---

### 4.6. Banco de Dados, Seed e Dados Mock

- `database/setup_db.py` cria (se não existirem) as tabelas `hospede`, `hotel`, `quarto`, `funcionario` e `reserva`, e insere um "Hotel Padrão" caso a tabela de hotéis esteja vazia.
- `database/mock/seed_mock_data.py` monta a topologia de desenvolvimento: **4 hotéis** (Rio, São Paulo, Gramado e Praia do Forte), **6 funcionários por hotel** (Administrador, Gerente Geral, Subgerente, Recepcionista, Governanta, Camareira), **8 hóspedes**, **12 quartos por hotel** (3 andares × 4 quartos, 8 categorias com diárias de R$ 150 a R$ 750) e **12 reservas**. Todas as senhas são gravadas com `Cypher.hash_password`.
- O mesmo conteúdo é exportado para `database/data/mock_data.json`, lido também pelo frontend (`mockData.js` e `vite-api-plugin.js`) para operar sem o backend.
- A semente roda automaticamente na Thread MAIN se o banco estiver vazio. Manualmente: `python database/mock/seed_mock_data.py [--force]` (`--force` apaga os dados antes de reinserir).

---

### 4.7. Testes Automatizados

`tests/test_tarifa_notificacao.py` cobre os templates de tarifa e de notificação (políticas, virada de temporada, idempotência, escopo por hotel, contexto inválido). Os testes usam **SQLite em memória** e substituem `Database` e `Logger` por versões mínimas com a mesma interface, sem tocar no banco real:

```bash
cd app/backend
python -m unittest tests.test_tarifa_notificacao -v
```

---

## 5. Fluxo de Execução Ponta a Ponta: Exemplo Prático

Ciclo de vida completo de uma requisição típica (exemplo: Criação de Reserva):

1. **Frontend (React)**: O usuário escolhe as datas e clica em reservar, enviando `POST /api/reserva` com o header `Authorization: Bearer <token>` e o payload JSON.
2. **Autenticação (`@require_auth`)**: Valida o token e carrega o usuário atual. Sem token válido, responde 401.
3. **Autorização de escopo (`reserva_routes.py`)**: `payload_belongs_to_hotel("reserva", ...)` confere se o quarto pertence ao hotel do funcionário, ou se o hóspede está reservando para si mesmo em um quarto disponível. Caso contrário, responde 403.
4. **Template Method (`ReservaCrudTemplate.process_create`)**:
   - `validate_payload`: valida presença de `id_quarto`, `id_hospede`, `check_in`, `check_out` e `qtd_hospedes`, converte as taxas adicionais (pet, refeições) e valida o objeto via `ModelFactory.create("reserva", payload)`.
   - `before_save`: sem alteração (hook padrão).
   - `execute_insert`: grava no SQLite e retorna o `id_reserva` gerado.
   - `after_save`: atualiza o quarto para `status = 'Ocupado'` e retorna o registro enriquecido (`after_read`) com nome do hóspede e número/tipo do quarto.
5. **Resposta**: O Flask devolve `{ "success": true, "data": { ... }, "status": 201 }`.
6. **Background Worker (Thread MAIN)**: No ciclo seguinte, computa a nova reserva, recalcula a taxa de ocupação dos hotéis e atualiza as métricas no `Config`.

---

## 6. Sumário dos Endpoints da API

Todas as rotas exigem `Authorization: Bearer <token>`, exceto `/api/auth/login` e `/api/auth/register`.

| Módulo                      | Endpoint Base      | Operações Disponíveis                                                                                               |
| :-------------------------- | :----------------- | :------------------------------------------------------------------------------------------------------------------ |
| **Hóspedes**                | `/api/hospede`     | `GET /` (listar/filtrar), `GET /<id>`, `POST /`, `PUT /<id>`, `DELETE /<id>`                                        |
| **Hotéis**                  | `/api/hotel`       | `GET /`, `GET /<id>`, `PUT /<id>`, `DELETE /<id>` (`POST /` sempre retorna 403)                                     |
| **Quartos**                 | `/api/quarto`      | `GET /` (listar/filtrar), `GET /<id>`, `POST /`, `PUT /<id>`, `DELETE /<id>`                                        |
| **Funcionários**            | `/api/funcionario` | `GET /` (listar/filtrar), `GET /<id>`, `POST /`, `PUT /<id>`, `DELETE /<id>`                                        |
| **Reservas**                | `/api/reserva`     | `GET /` (listar/filtrar), `GET /<id>`, `POST /`, `PUT /<id>`, `DELETE /<id>`                                        |
| **Autenticação & Métricas** | `/api/auth`        | `POST /login`, `POST /register`, `GET /stats`                                                                       |
| **Tarifas**                 | `/api/tarifa`      | `GET /politicas`, `GET /reserva/<id>?politica=`, `GET /reserva/<id>/comparar`, `POST /simular` (cargos de gerência) |
| **Notificações**            | `/api/notificacao` | `GET /?apenas_nao_lidas=true`, `PATCH /<id>/lida`, `POST /chegadas-do-dia` (cargos de recepção e gerência)          |

Detalhes das rotas de tarifa:

- `GET /api/tarifa/reserva/<id>?politica=padrao|fidelidade|temporada|longa_estadia` calcula uma reserva existente (padrão: `padrao`).
- `GET /api/tarifa/reserva/<id>/comparar` calcula a mesma reserva em todas as políticas e indica `menor_total` e `maior_total`.
- `POST /api/tarifa/simular` simula uma reserva inexistente. Body: `id_quarto`, `check_in`, `check_out` (obrigatórios), `id_hospede`, `politica` e as taxas (`taxa_pet`, `taxa_refeicao`, `taxa_cafe_manha`, `taxa_almoco`, `taxa_jantar`) opcionais.

---

## 7. Pendências e Pontos de Atenção Conhecidos

Itens identificados na revisão desta documentação contra o código atual:

- **Blueprints de tarifa e notificação não estão registrados**: `tarifa_bp` e `notificacao_bp` existem em `api/features/`, mas não constam em `features/__init__.py` nem em `App._register_blueprints`. Enquanto isso não for feito, os endpoints da seção 6 não ficam acessíveis.
- **Tabela `notificacao` ausente do `setup_db.py`**: ela existe no schema dos testes, mas não é criada pela inicialização real; `ConfirmacaoReserva`, `ChegadaDoDia` etc. falhariam ao gravar. Colunas usadas: `id_notificacao`, `id_hospede`, `id_hotel`, `tipo`, `assunto`, `mensagem`, `referencia`, `lida`, `criado_em`.
- **Notificações sem gatilho automático**: hoje só `POST /api/notificacao/chegadas-do-dia` as dispara. Os hooks de `ReservaCrudTemplate` e a Thread MAIN ainda não chamam `notify`.
- **`GET /api/auth/stats`**: indexa a lista `taxa_ocupacao_por_hotel` pelo `id_hotel` como posição. Com hotéis de ID 1 a 4, o hotel 1 recebe os dados do segundo item e o hotel 4 causaria `IndexError`. O correto é localizar o item cujo `id_hotel` coincide.
- **`POST /api/auth/register`** aceita `role` diferente de `hospede` e cria funcionário. A restrição "só hóspede cria a própria conta" existe apenas no frontend e no plugin de desenvolvimento; o backend deveria recusar esse caso.
- **`POST /api/hospede`** não aplica hash na senha (`HospedeCrudTemplate` não possui `before_save` para isso). O login tolera senha em texto puro e a migra, mas o ideal é gravar sempre o hash.
- **Segredos e modo query**: `AUTH_SECRET` tem valor padrão de desenvolvimento e `AUTH_QUERY_ENABLED` vem ligado. Em produção, defina `ANFITRION_AUTH_SECRET` e `ANFITRION_AUTH_QUERY_ENABLED=false`.
- **Duplicidade de arquivo**: existem `database/Setup_db.py` e `database/setup_db.py` com o mesmo conteúdo; o projeto importa `setup_db`. Em sistemas de arquivos que ignoram maiúsculas/minúsculas isso colide, e um deles deveria ser removido.
