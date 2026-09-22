# Arquitetura do Backend - Sistema Anfitrião

Este documento descreve de forma clara, simples e direta a arquitetura do backend do **Anfitrião**, detalhando a organização estrutural, os padrões de projeto (Design Patterns) implementados e o funcionamento das funcionalidades mais complexas do sistema.

---

## 1. Visão Geral e Tecnologias

O backend do Anfitrião é construído em **Python 3**, utilizando **Flask** para a exposição de APIs RESTful e **SQLite3** para a persistência relacional. A aplicação adota os princípios de Programação Orientada a Objetos (**POO**) e Orientação a Reuso (**OO**), organizando-se em módulos por responsabilidade e recursos de domínio (*features*).

| Componente | Tecnologia | Papel |
| :--- | :--- | :--- |
| **Linguagem** | Python 3 | Lógica de negócios, modelos de domínio e concorrência |
| **Web Framework** | Flask (Blueprints) | Endpoints HTTP, roteamento e serialização JSON |
| **Banco de Dados** | SQLite3 relacional | Armazenamento transacional com integridade referencial ativa |
| **Concorrência** | `threading` nativo | Separação entre Thread de Background (pesada) e Thread Web (HTTP) |
| **Design Patterns** | Singleton, Factory Method, Template Method | Modularidade, reuso de código e desacoplamento |

---

## 2. Estrutura de Pastas e Componentes

A estrutura interna sob `/app/backend` foi desenhada para garantir isolamento e manutenibilidade:

```text
app/backend/
├── Main.py                      # Ponto de entrada: orquestra as Threads MAIN e FLASK
├── api/
│   ├── App.py                   # Servidor Flask e registro de Blueprints
│   ├── factories/               # Padrão Factory Method
│   │   ├── entity_factory.py    # Classe base abstrata EntityFactory
│   │   ├── model_factory.py     # Despachante central de fábricas
│   │   ├── user_factory.py      # Fábrica especializada para Hospede e Funcionario
│   │   └── entities/            # Fábricas concretas de cada recurso
│   ├── templates/               # Padrão Template Method
│   │   ├── crud_template.py     # Algoritmo invariante das operações CRUD
│   │   └── entities/            # Especializações do CRUD (regras, hooks e validações)
│   └── features/                # Blueprints do Flask com rotas HTTP RESTful
├── classes/                     # Classes de Domínio (Hospede, Hotel, Quarto, Funcionario, Reserva)
├── config/                      # Configurações globais e repositório de memória compartilhada
├── database/                    # Scripts DDL de inicialização e tabelas SQLite
├── manager/                     # Camada de acesso a dados (Database thread-safe)
├── meta/                        # Metaclasses estruturais (SingletonMeta)
└── utils/                       # Utilitários de sistema e padronização de Logs
```

---

## 3. Padrões de Projeto (Design Patterns)

### 3.1. Singleton
- **Onde é aplicado**: `Config` (`config/Config.py`) e `Database` (`manager/Database.py`), via metaclasse `SingletonMeta` (`meta/Singleton.py`).
- **Como funciona**: A metaclasse `SingletonMeta` intercepta a instanciação das classes e utiliza uma trava de exclusão mútua (`threading.Lock`). Se uma instância já existir na tabela `_instances`, ela é retornada imediatamente.
- **Por que é essencial**: 
  - Garante que haja apenas uma conexão centralizada com o banco de dados.
  - Permite que variáveis dinâmicas e métricas sejam compartilhadas de forma síncrona e segura entre threads distintas sem risco de condição de corrida (*race condition*).

### 3.2. Factory Method
- **Onde é aplicado**: Módulo `api/factories/`.
  - Base: `EntityFactory` (classe abstrata com o método `create_entity(data)`).
  - Concretas: `HospedeFactory`, `HotelFactory`, `QuartoFactory`, `FuncionarioFactory`, `ReservaFactory` e `userFactory`.
  - Despachante: `ModelFactory.create(entity_name, data)`.
- **Como funciona**: O chamador não precisa saber como instanciar cada modelo ou lidar com casting de tipos e atributos opcionais. O `ModelFactory` localiza a fábrica correta e produz o objeto correspondente a partir de um dicionário de dados.

### 3.3. Template Method
- **Onde é aplicado**: Módulo `api/templates/`.
  - Base abstrata: `CrudTemplate` (`crud_template.py`).
  - Especializações: `HospedeCrudTemplate`, `HotelCrudTemplate`, `QuartoCrudTemplate`, `FuncionarioCrudTemplate` e `ReservaCrudTemplate`.
- **Como funciona**: Define o esqueleto invariante das operações (`process_create`, `process_read_all`, `process_read_by_id`, `process_update`, `process_delete`). Esse fluxo gerencia:
  1. Extração do payload;
  2. Validação obrigatória (`validate_payload`);
  3. Transformações pré-gravação (`before_save`);
  4. Execução da instrução SQL no banco;
  5. Pós-processamento e efeitos colaterais (`after_save`);
  6. Formatação consistente da resposta JSON (`format_response`).

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
              └───────────┬────────────┘      └───────────┬────────────┘
                          │                               │
            Processamento │                               │ Requisições
            em segundo    │                               │ HTTP (React)
            plano contínuo│                               │
                          ▼                               ▼
                     ┌─────────┐                     ┌─────────┐
                     │ Auditoria│                    │  Rotas  │
                     │ Status  │◄──── Compartilha ──►│  CRUD & │
                     │ Métricas│      via Config     │  Auth   │
                     └─────────┘     (Singleton)     └─────────┘
```

#### Como funciona:
1. **Thread MAIN (Worker)**:
   - Executa em laço perpétuo em segundo plano (com intervalo configurável).
   - Realiza auditoria periódica das tabelas para prevenir inconsistências.
   - **Expiração Automática de Reservas**: Varre todas as reservas cadastradas cuja data `check_out` já passou e atualiza o quarto vinculado para `"Disponível"`.
   - **Cálculo de Ocupação em Tempo Real**: Calcula quartos totais, quartos ocupados e a taxa percentual de ocupação hoteleira.
   - **Comunicação Segura**: Armazena as métricas diretamente no repositório `_shared_store` do `Config` (protegido por `Lock`).
2. **Thread FLASK (Web)**:
   - Fica 100% dedicada a responder às requisições do frontend React sem bloqueios de I/O causados por rotinas pesadas.
   - Ao atender ao endpoint `/api/auth/stats`, o Flask simplesmente lê os dados já processados pelo `Config`, entregando respostas instantâneas.

---

### 4.2. Ganchos (*Hooks*) e Efeitos Colaterais Automáticos no CRUD

A gestão de reservas exige que a alteração de um registro reflita instantaneamente no inventário de quartos. O `ReservaCrudTemplate` implementa ganchos que eliminam a necessidade de intervenção manual:

1. **Ao Criar ou Atualizar Reserva (`after_save`)**:
   - Assim que o registro da reserva é salvo no banco com sucesso, o método `after_save` é invocado automaticamente.
   - Localiza o `id_quarto` envolvido e altera seu status na tabela `quarto` para `"Ocupado"`.
2. **Ao Cancelar ou Deletar Reserva (`before_delete`)**:
   - Antes de remover a reserva, o hook `before_delete` captura o registro original, busca o `id_quarto` e atualiza seu status de volta para `"Disponível"`.
3. **Resolução Dinâmica de Relacionamentos (`after_read`)**:
   - Na leitura de reservas ou funcionários, o método `after_read` faz as junções relacionais sob demanda, enriquecendo o registro com dados complementares (ex.: nome do hóspede, número e tipo do quarto, nome do hotel) sem expor senhas ou dados sensíveis.

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
- No `FuncionarioCrudTemplate`, ao cadastrar um novo funcionário, o sistema verifica se o `email` informado já existe na base de `hospede`. Se não existir, ele **cria a conta de base automaticamente** e vincula o `id_hospede` gerado ao novo registro de funcionário em uma única operação transparente para o frontend.

---

### 4.4. Acesso Concorrente Seguro e Integridade Transacional (`Database.py`)

O acesso ao banco SQLite precisa lidar com requisições concorrentes de múltiplas threads:
- **Foreign Keys Ativas**: A cada conexão aberta, o comando `PRAGMA foreign_keys = ON;` é executado, impedindo que registros filhos fiquem órfãos (ex.: quartos sem hotel ou reservas sem quarto válido).
- **Isolamento de Conexão**: Cada operação de CRUD abre e fecha sua própria conexão context-managed (`with sqlite3.connect(...)`), garantindo que o SQLite libere os locks de escrita imediatamente após a transação.
- **Rollback em Exceções**: Se ocorrer qualquer falha durante a execução de inserts ou updates, a transação sofre rollback e uma mensagem padronizada de erro é emitida no logger.

---

## 5. Fluxo de Execução Ponta a Ponta: Exemplo Prático

Abaixo está o ciclo de vida completo de uma requisição típica (exemplo: Criação de Reserva):

1. **Frontend (React)**: O usuário escolhe as datas e clica em reservar, enviando uma requisição `POST /api/reserva` com o payload JSON.
2. **Roteador (`reserva_routes.py`)**: Repassa o payload diretamente para a instância de `ReservaCrudTemplate.process_create(data)`.
3. **Template Method (`CrudTemplate`)**:
   - `validate_payload`: Valida presença de `id_quarto`, `id_hospede`, `check_in`, `check_out` e converte taxas adicionais (pet, refeições).
   - Valida a criação do objeto de domínio via `ModelFactory.create("reserva", payload)`.
   - `before_save`: Higieniza os campos para gravação.
   - `execute_insert`: Grava no SQLite e retorna o `id_reserva` gerado.
   - `after_save`: Atualiza automaticamente a tabela `quarto` para `status = 'Ocupado'`.
   - `after_read`: Recupera o registro completo já preenchido com nome do hóspede e número do quarto.
4. **Resposta**: O Flask devolve `{ "success": true, "data": { ... }, "status": 201 }`.
5. **Background Worker (Thread MAIN)**: No ciclo seguinte, a Thread MAIN computa a nova reserva, recalcula a taxa de ocupação dos hotéis e atualiza as métricas globais no `Config`.

---

## 6. Sumário dos Endpoints da API

| Módulo | Endpoint Base | Operações Disponíveis |
| :--- | :--- | :--- |
| **Hóspedes** | `/api/hospede` | `GET /` (listar/filtrar), `GET /<id>`, `POST /`, `PUT /<id>`, `DELETE /<id>` |
| **Hotéis** | `/api/hotel` | `GET /` (listar/filtrar), `GET /<id>`, `POST /`, `PUT /<id>`, `DELETE /<id>` |
| **Quartos** | `/api/quarto` | `GET /` (listar/filtrar), `GET /<id>`, `POST /`, `PUT /<id>`, `DELETE /<id>` |
| **Funcionários** | `/api/funcionario` | `GET /` (listar/filtrar), `GET /<id>`, `POST /`, `PUT /<id>`, `DELETE /<id>` |
| **Reservas** | `/api/reserva` | `GET /` (listar/filtrar), `GET /<id>`, `POST /`, `PUT /<id>`, `DELETE /<id>` |
| **Autenticação & Métricas** | `/api/auth` | `POST /login`, `POST /register`, `GET /stats` |
