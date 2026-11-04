# AGENTS.md — Guia de Contexto e Diretrizes para Agentes de IA

Este documento fornece o contexto técnico, arquitetural e metodológico do repositório **ToDo List** para garantir que agentes de IA atuem de forma segura, previsível e consistente.

---

## 1. Visão Geral

- **Objetivo do Projeto:** Aplicação de gerenciamento de tarefas (*ToDo List*) voltada à organização de fluxo de trabalho, permitindo o controle do ciclo de vida de tarefas (`TODO`, `DOING`, `DONE`), categorização e definição de prioridades (`1` — maior prioridade a `5` — menor prioridade).
- **Coexistência de Duas Aplicações Independentes:**
  - **Frontend (`frontend/`):** Aplicação web desenvolvida em HTML5, CSS3 e JavaScript Vanilla, com persistência local no navegador via `localStorage`.
  - **Backend (`src/`):** Aplicação Java de console (terminal) com armazenamento em memória (`List<Tarefa>`).
- **Ausência de Integração:** **Não existe integração** (API REST, chamadas HTTP ou banco compartilhado) entre o frontend e o backend Java. As duas camadas operam de forma totalmente independente.
- **Funcionalidades Já Implementadas no Frontend:**
  - **Dashboard de Estatísticas:** Contadores dinâmicos de tarefas (`TOTAL`, `TODO`, `DOING` e `DONE`).
  - **CRUD Completo de Tarefas:** Criação, listagem em cartões, edição no próprio formulário (`editandoPorId`) e exclusão individual (com bloqueio de exclusão caso a tarefa esteja em modo de edição).
  - **Filtro por Status:** Seleção para visualizar `Todos` (`TODOS`), `TODO`, `DOING` ou `DONE`, com exibição de estado vazio (`.empty-state`) quando não há tarefas correspondentes.
  - **Alteração de Status em Massa (Bulk Actions):** Seleção de múltiplas tarefas por meio de checkboxes (`.task-checkbox`) e atualização simultânea do status para `TODO`, `DOING` ou `DONE`.
  - **Persistência no Navegador:** Sincronização automática do array de tarefas na chave `"tarefas"` do `localStorage`.
  - **Layout Responsivo:** Interface em tema escuro (*dark glassmorphism*) com breakpoints para `900px`, `700px` e `600px`.

---

## 2. Stack Tecnológica

### Frontend (Escopo Ativo)
- **HTML5:** Marcação semântica em `frontend/index.html` (`lang="pt-BR"`).
- **CSS3:** Estilização customizada em `frontend/css/style.css` (CSS Grid, Flexbox, Media Queries, sem pré-processadores ou bibliotecas CSS externas).
- **JavaScript Vanilla (ES6+):** Lógica da aplicação e manipulação de DOM em `frontend/js/script.js`, sem uso de frameworks (React, Vue, Angular, etc.).
- **Persistência:** Web Storage API (`window.localStorage`), serializando os dados em JSON sob a chave `"tarefas"`.
- **Controle de Versão e Automação:** Git, GitHub e servidor oficial GitHub MCP (`github/github-mcp-server`).

### Backend (Apenas Contextualização — Fora do Escopo)
- **Linguagem e Build:** Java + Gradle (`build.gradle`, `gradlew`), organizados nas camadas `model` (`Tarefa`, `Status`), `repository` (`TarefaRepository`) e `service` (`TarefaService`), além de `Main.java`.
- **Testes Backend:** Groovy 5 + Spock Framework 2.4 + JUnit Platform (`src/test/groovy/`).

---

## 3. Estrutura do Projeto

```text
todo-list/
├── frontend/                     # Aplicação web (escopo de desenvolvimento atual)
│   ├── index.html                # Estrutura da página: Header, Hero, Dashboard, Painel de Tarefas e Formulário
│   ├── css/
│   │   └── style.css             # Estilos globais, tema dark glassmorphism, cards, formulário e responsividade
│   └── js/
│       └── script.js             # Estado em memória, persistência localStorage, eventos e renderização DOM
│
├── docs/                         # Artefatos do processo Spec-Driven Development (SDD)
│   └── spec.md                   # Especificação funcional e técnica da feature
│
├── src/                          # Backend Java e testes Spock (FORA DO ESCOPO — NÃO MODIFICAR)
│   ├── main/java/com/todolist/   # Main, model/, repository/, service/
│   └── test/groovy/              # Especificações de teste Spock do backend
│
├── gradle/                       # Gradle Wrapper do backend Java
├── build.gradle                  # Configuração de build do backend Java
├── settings.gradle               # Nome do projeto Gradle ('todo-list')
├── README.md                     # Documentação geral do repositório
└── AGENTS.md                     # Este guia de contexto e regras para agentes de IA
```

---

## 4. Execução

### Como Executar o Frontend Atual
O frontend atual é estático e não exige etapa de build ou servidor de backend:

1. **Abertura direta no navegador:**
   - Abrir o arquivo `frontend/index.html` diretamente em qualquer navegador moderno.
2. **Servidor local de desenvolvimento (opcional):**
   - Utilizar uma extensão como *Live Server* ou servir a pasta `frontend/` via HTTP local:
     ```bash
     cd frontend && python3 -m http.server 8080
     ```
   - Acessar no navegador: `http://localhost:8080`

---

## 5. Testes

- **Estado Atual no Frontend:** Ainda **não existem testes automatizados configurados** para o frontend (não há `package.json`, `node_modules` ou suíte de testes JS instalada neste momento).
- **Previsão na Feature:** O plano desta feature (`feature/tarefas-recorrentes`, Issue `#1`) prevê adicionar posteriormente **Vitest** e **jsdom** para testes automatizados unitários e de integração DOM. Essas ferramentas só devem ser instaladas e configuradas na etapa correspondente após aprovação do plano.
- **Testes Existentes no Repositório:** Os únicos testes atualmente presentes no repositório pertencem ao backend Java (`src/test/groovy/`, executados via `./gradlew test`) e estão fora do escopo do frontend.

---

## 6. Convenções de Código

Ao ler ou modificar o frontend, siga estritamente os padrões já adotados no código:

### 6.1. Nomenclatura de Variáveis, Funções e Seletores
- **JavaScript (`frontend/js/script.js`):**
  - Identificadores de variáveis, constantes, funções e propriedades de objetos em **português** no formato **`camelCase`**:
    - Estado: `tarefas`, `editandoPorId`, `proximoId`.
    - Referências de elementos DOM: `formulario`, `listaTarefas`, `botaoSubmit`, `totalTarefas`, `tarefasTodo`, `tarefasDoing`, `tarefasDone`, `filtroStatus`, `botaoLimpar`, `statusMultiplo`, `botaoStatusMultiplo`.
    - Funções: declaradas como *arrow functions* atribuídas a `const` (`salvarTarefas`, `atualizarEstatisticas`, `renderizarTarefas`).
- **HTML (`frontend/index.html`):**
  - Atributos `id` em **português** usando **`kebab-case`** (ex.: `#form-tarefa`, `#lista-tarefas`, `#data-termino`, `#filtro-status`, `#status-multiplo`, `#btn-status-multiplo`).
  - Atributos `name` dos campos de formulário em **português** usando **`camelCase`** (ex.: `dataTermino`, `nome`, `descricao`, `prioridade`, `categoria`, `status`).
- **CSS (`frontend/css/style.css`):**
  - Classes CSS em **inglês** usando **`kebab-case`** (ex.: `.task-card`, `.task-checkbox`, `.task-priority`, `.task-content`, `.task-header`, `.task-status`, `.status-todo`, `.status-doing`, `.status-done`, `.task-information`, `.task-actions`, `.btn-edit`, `.btn-delete`, `.bulk-actions`, `.form-row`, `.form-group`).
- **Comentários de Seção:**
  - Cabeçalhos de seção em **português e letras maiúsculas** tanto no JS (`// ESTADO DA APLICAÇÃO`, `// PERSISTÊNCIA`) quanto no CSS (`/* ================================ CARD DA TAREFA ================================ */`).

### 6.2. Estrutura do Objeto de Tarefa
Cada item do array `tarefas` possui atualmente o seguinte formato base:

```javascript
{
  id: 1,                        // Number — ID único sequencial gerado por proximoId++
  nome: "Nome da tarefa",       // String
  descricao: "Descrição...",    // String
  dataTermino: "2026-11-10",    // String — formato ISO "YYYY-MM-DD" (input[type="date"]) ou ""
  prioridade: 1,                // Number — convertido com Number(...), valores de 1 a 5
  categoria: "Desenvolvimento", // String
  status: "TODO"                // String — "TODO" | "DOING" | "DONE"
}
```

### 6.3. Organização de Eventos e Manipulação do DOM
- **Elementos estáticos:** Recebem *listeners* diretamente com `addEventListener` (`formulario` no `submit`, `filtroStatus` no `change`, `botaoStatusMultiplo` no `click`, `botaoLimpar` no `click`).
- **Delegação de eventos na lista:** Botões dinâmicos dentro dos cartões (`.btn-edit` e `.btn-delete`) são tratados por um único listener `click` em `listaTarefas`, inspecionando `event.target.classList.contains(...)` e extraindo o ID numérico via `Number(event.target.dataset.id)`.
- **Ações em massa:** Checkboxes marcados são coletados com `document.querySelectorAll(".task-checkbox:checked")` e mapeados para IDs numéricos via `Number(checkbox.dataset.id)`.
- **Renderização (`renderizarTarefas`):**
  - Limpa `listaTarefas.innerHTML = ""`.
  - Atualiza os contadores chamando `atualizarEstatisticas()`.
  - Filtra `tarefas` conforme `filtroStatus.value` (`"TODOS"` retorna todas; caso contrário, compara `tarefa.status === statusSelecionado`).
  - Se não houver resultados, injeta o bloco `.empty-state`.
  - Caso contrário, gera cada `.task-card` via *template literals* e adiciona ao `listaTarefas.innerHTML`.

### 6.4. Fluxo de Persistência e Atualização da Interface
- **Inicialização:**
  - `tarefas` é carregado com `JSON.parse(localStorage.getItem("tarefas")) || []`.
  - `proximoId` é calculado a partir do maior `id` existente (`Math.max(...tarefas.map(t => t.id)) + 1`) ou `1` quando a lista está vazia.
- **Ciclo de Mutação:**
  - Toda operação que cria, edita, altera status (individual ou em massa) ou exclui tarefas executa sempre:
    1. `salvarTarefas()` (`localStorage.setItem("tarefas", JSON.stringify(tarefas))`)
    2. `renderizarTarefas()` (que por sua vez chama `atualizarEstatisticas()`).

---

## 7. Restrições Obrigatórias

1. **Não modificar o backend Java (`src/`, `build.gradle`, `gradle/`, `settings.gradle`)** durante o desenvolvimento desta feature.
2. **Não migrar o frontend para frameworks** ou bibliotecas de UI (manter HTML5, CSS3 e JavaScript Vanilla).
3. **Não alterar ou remover funcionalidades existentes** fora do escopo (dashboard, edição, exclusão, bloqueio de exclusão durante edição, filtro por status e alteração de status em massa devem continuar funcionando).
4. **Preservar total compatibilidade com dados antigos no `localStorage`** (tarefas salvas antes da feature sem os novos campos de recorrência devem ser lidas e manipuladas sem falhas).
5. **Não instalar dependências** (`npm`, pacotes de teste, etc.) sem previsão explícita no plano aprovado.
6. **Não criar commits, branches ou fazer `git push` sem autorização explícita** do usuário.
7. **Não armazenar credenciais, tokens ou segredos** no repositório nem exibi-los em logs.

---

## 8. Processo SDD (Spec-Driven Development)

Todo o desenvolvimento segue rigorosamente o fluxo **Spec-Driven Development**:

1. **Especificação antes do código:** A especificação (`docs/spec.md`) deve ser revisada, aprovada pelo usuário e commitada **antes** de qualquer implementação de código da feature.
2. **Plano antes da implementação:** O plano técnico (`docs/plano.md`) deve ser elaborado e aprovado pelo usuário antes de iniciar a codificação.
3. **Implementação incremental (uma tarefa por vez):** Executar uma tarefa do plano de cada vez, mantendo mudanças pequenas, coesas e rastreáveis.
4. **Revisão de diffs e testes a cada tarefa:** Após implementar uma tarefa, inspecionar `git diff` e executar os testes automatizados correspondentes.
5. **Um commit por tarefa:** Cada tarefa de implementação aprovada e validada deverá resultar em um commit próprio (atômico e semântico). Os commits de documentação, incluindo o commit da especificação aprovada (`docs/spec.md`), serão realizados separadamente, sempre mediante autorização explícita do usuário.
6. **Sincronia da especificação:** Caso surja qualquer alteração de requisito ou regra de negócio durante o desenvolvimento, atualizar `docs/spec.md` **antes** de alterar o código.
7. **Validação obrigatória:** Nenhuma tarefa é considerada concluída sem validação prática dos seus critérios de aceite e verificação de ausência de regressões.

