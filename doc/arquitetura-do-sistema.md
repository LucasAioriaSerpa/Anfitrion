<div style="display: flex; justify-content: center; align-items: center; height: 50vh"><img src="img/logo-Anfitrion.png"></div>

## Paleta de cores

<h3 style='color:#E8F7EE';>● #E8F7EE</h3>
<h3 style='color:#B8C4BB';>● #B8C4BB</h3>
<h3 style='color:#663F46';>● #663F46</h3>
<h3 style='color:#3C362A';>● #3C362A</h3>
<h3 style='color:#C9D6EA';>● #C9D6EA</h3>

---

## linguagens e tecnologias

|     frontend      |    backend    | banco de dados |
| :---------------: | :-----------: | :------------: |
| React/ javascript | Flask/ python |     SQLite     |

---

## Estrutura de pastas, orientação de programação & Desing pattern

Para o sistema todo será utilizado duas orientações de programação, a principal sendo por objeto (POO) e a segundo por reuso (OO). Onde a qual a estrutura de pastas será por componentes & features

### Design Patterns que será utilizado

- [Singleton](https://refactoring.guru/pt-br/design-patterns/singleton)
- [Template Method](https://refactoring.guru/pt-br/design-patterns/template-method)
- [Factory Method](https://refactoring.guru/pt-br/design-patterns/factory-method)

---

## Backend (Visão Geral)

O backend foi construído em **Python (Flask + SQLite)** com arquitetura modular baseada em concorrência multi-thread:

- **Arquitetura em Duas Threads**:
  - **Thread MAIN (Worker)**:
    Processa rotinas pesadas em segundo plano contínuo (auditoria de tabelas, expiração de reservas vencidas e cálculo em tempo real da taxa de ocupação dos hotéis).
  - **Thread FLASK (API REST)**:
    Atende de forma ágil e sem bloqueios às requisições do frontend React através de Blueprints organizados por recursos.
    (`/api/hospede`, `/api/hotel`, `/api/quarto`, `/api/funcionario`, `/api/reserva`, `/api/auth`).
- **Comunicação Inter-Threads**:
  Feita com segurança (_thread-safe_) via repositório em memória na classe `Config` (Singleton com `Lock`).
- **Padrões de Projeto Aplicados**:
  - **Singleton**:
    Garante instância única e controle de concorrência no `Config` e na camada de dados `Database`.
  - **Factory Method**:
    Criação padronizada e desacoplada das entidades de domínio (`ModelFactory` e classes filhas de `EntityFactory`).
  - **Template Method**:
    Padronização invariante do ciclo de vida das operações CRUD (`CrudTemplate`), permitindo validações, ganchos automáticos de atualização de status dos quartos e pós-processamento.
- **Documentação Detalhada**:
  Para a especificação técnica completa, consulte o documento [`doc/arquitetura_backend.md`](arquitetura_backend.md).

---

## Interfaces

- Tela principal mostrando as ofertas das reservas
  - Entretanto, so podera pagar ou visualizar mais detalhes se tiver cadastrado
- Tela de login (para hospedes & funcionarios)
  - Contendo email & senha (com icon de olho para esconder ou mostrar a senha inserida)
- Tela cadastro (para hospedes)
  - Contendo nome, email, senha e telefone
  - O cadastro das contas dos funcionarios é feito pelo gerente/sub-gerente/administrador do sistema
    - Onde contera nome, email, senha, telefone & cargo (que será entre camarera/governanta, recepcionista, assistente de reservas, analista financeiro)
