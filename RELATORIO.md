# Relatório Técnico de Execução — Tarefas Recorrentes no ToDo List Frontend

- **Repositório:** `https://github.com/nelsonlima1989/todo-list-java`
- **Branch da Feature:** `feature/tarefas-recorrentes`
- **Issue Vinculada:** [`#1 — [FEATURE] Implementar tarefas recorrentes no ToDo List Frontend`](https://github.com/nelsonlima1989/todo-list-java/issues/1)
- **Diretrizes do Agente:** [AGENTS.md](AGENTS.md)
- **Especificação Técnica:** [docs/spec.md](docs/spec.md)
- **Plano de Implementação:** [docs/plano.md](docs/plano.md)
- **Skill Reutilizável SDD:** [skills/feature-com-spec/SKILL.md](skills/feature-com-spec/SKILL.md)

---

## 1. Resumo Executivo

Este relatório documenta o desenvolvimento ponta a ponta da funcionalidade de **tarefas recorrentes** (`NENHUMA`, `DIARIA`, `SEMANAL` e `MENSAL`) no frontend da aplicação **ToDo List**, conduzido integralmente sob a metodologia **Spec-Driven Development (SDD)**.

A implementação permitiu configurar frequência de repetição no formulário, exigir data de término para tarefas recorrentes, gerar automaticamente uma única ocorrência sucessora com status `TODO` e data estritamente futura ao concluir uma tarefa (`DONE` por criação direta, edição ou ação em massa), preservar o dia-alvo original (`diaBaseRecorrencia`) entre meses curtos e anos bissextos, impedir duplicações via `sucessoraGerada` e exibir indicadores visuais nos cartões mantendo total retrocompatibilidade com dados legados no `localStorage`.

Foram utilizados **HTML5, CSS3 e JavaScript Vanilla (ES Modules nativos)**, **Vitest + jsdom** para testes automatizados unitários e de integração DOM, **Playwright MCP** para validação em navegador real e **GitHub MCP** (`github/github-mcp-server`) para automação de gestão de issue. Ao final das 6 tarefas planejadas (`T01` a `T06`), a suíte atingiu **6 arquivos de teste e 74 testes automatizados aprovados (0 falhas)**, com 100% de conformidade aos requisitos `RF01`–`RF08` e critérios de aceite `CA01`–`CA11`, sem qualquer alteração no backend Java.

---

## 2. Contexto Técnico

- **Coexistência de Aplicações Independentes:**
  - **Backend Java (`src/`, `build.gradle`):** Aplicação de console em Java com testes em Groovy/Spock, sem API REST e sem integração com a interface web. Permaneceu estritamente fora do escopo e inalterada.
  - **Frontend Web ([frontend/](frontend/)):** Aplicação estática em HTML5 ([frontend/index.html](frontend/index.html)), CSS3 ([frontend/css/style.css](frontend/css/style.css)) e JavaScript Vanilla ([frontend/js/script.js](frontend/js/script.js) e [frontend/js/recorrencia.js](frontend/js/recorrencia.js)), sem uso de frameworks de UI ou bundlers.
- **Persistência Local:**
  - Armazenamento no navegador via `window.localStorage` sob a chave `"tarefas"`, serializando o array de objetos em JSON e normalizando registros legados na inicialização.
- **Modularização com ES Modules Nativos:**
  - As regras puras de calendário, avanço de ciclos e elegibilidade foram isoladas em [frontend/js/recorrencia.js](frontend/js/recorrencia.js) e importadas nativamente por [frontend/js/script.js](frontend/js/script.js) via `<script type="module" src="js/script.js"></script>`.
- **Infraestrutura de Testes e Validação:**
  - **Vitest (`^5.1.0`) + jsdom (`^30.1.3`):** Configurados em [frontend/package.json](frontend/package.json) e [frontend/vitest.config.js](frontend/vitest.config.js) para testes unitários e de integração DOM.
  - **Playwright MCP:** Utilizado para inspeção interativa no navegador real (`http://localhost:8080`), verificação de responsividade (`1280x800` e `375x667`), persistência após reload e monitoramento do console JavaScript.
  - **Git e GitHub MCP (`github/github-mcp-server`):** Utilizados para controle de versão incremental e abertura da Issue `#1`.

---

## 3. Processo SDD (Spec-Driven Development)

O fluxo seguiu rigorosamente nove etapas sequenciais, com pontos de inspeção e aprovação humana entre cada fase:

1. **Análise do projeto:** Leitura da estrutura do repositório, separação entre backend Java e frontend Vanilla JS e levantamento das convenções de código existentes.
2. **Criação da Issue `#1` via GitHub MCP:** Configuração e autenticação do servidor oficial `github/github-mcp-server` e registro da Issue `#1` no GitHub, seguida da criação da branch `feature/tarefas-recorrentes`.
3. **Preparação de [AGENTS.md](AGENTS.md):** Documentação do contexto arquitetural, stack tecnológica, convenções de código (`camelCase` em português no JS, `kebab-case` em inglês no CSS), restrições obrigatórias e regras do processo SDD.
4. **Elaboração de [docs/spec.md](docs/spec.md):** Definição formal do modelo de dados (`recorrencia`, `diaBaseRecorrencia`, `sucessoraGerada`), regras de retrocompatibilidade, requisitos funcionais `RF01` a `RF08` e critérios de aceite `CA01` a `CA11` no formato *Dado / Quando / Então*.
5. **Elaboração de [docs/plano.md](docs/plano.md):** Decomposição técnica em 6 tarefas incrementais (`T01` a `T06`), grafo de dependências, matriz de rastreabilidade e regras de validação por entrega.
6. **Implementação incremental (`T01` a `T06`):** Execução de uma única tarefa por vez, seguida de revisão de diff, execução de testes automatizados no Vitest, validação no navegador via Playwright MCP, atualização do status no plano e commit atômico autorizado.
7. **Auditoria final:** Confrontação linha a linha entre especificação, código e testes, instalação limpa via `npm ci`, validação em navegador real com recarregamento de página e verificação de formatação com `git diff --check`.
8. **Criação da skill e relatório:** Elaboração da skill reutilizável em [skills/feature-com-spec/SKILL.md](skills/feature-com-spec/SKILL.md) e deste relatório técnico [RELATORIO.md](RELATORIO.md).
9. **Preparação do Pull Request (próxima etapa):** Envio da branch `feature/tarefas-recorrentes` ao repositório remoto e abertura do Pull Request vinculado à Issue `#1` após aprovação desta etapa documental.

---

## 4. Histórico de Implementação e Commits

A branch `feature/tarefas-recorrentes` possui a seguinte sequência real de commits sobre a `main` (`3a6078a`):

| Ordem | Hash | Mensagem do Commit | Etapa / Tarefa |
| :---: | :--- | :--- | :--- |
| 1 | `7929835` | `docs: adiciona contexto e diretrizes SDD para agentes` | Etapa 3 — Contexto do Agente ([AGENTS.md](AGENTS.md)) |
| 2 | `1274295` | `docs: especifica feature de tarefas recorrentes (#1)` | Etapa 4 — Especificação ([docs/spec.md](docs/spec.md)) |
| 3 | `60a7a84` | `docs: adiciona plano de implementação SDD (#1)` | Etapa 5 — Planejamento ([docs/plano.md](docs/plano.md)) |
| 4 | `c6adb16` | `chore(frontend): configura Vitest e jsdom para testes automatizados (#1)` | **T01** — Infraestrutura de testes |
| 5 | `b7a2a78` | `feat(frontend): implementa calculo de datas e regras puras de recorrencia (#1)` | **T02** — Módulo puro de domínio |
| 6 | `786e57f` | `feat(frontend): adiciona campo de recorrencia e validacao de data no formulario (#1)` | **T03** — Formulário e validação |
| 7 | `4981dd0` | `feat(frontend): implementa geracao de sucessoras e prevencao de duplicacoes (#1)` | **T04** — Geração de sucessoras |
| 8 | `51ff4fb` | `feat(frontend): exibe indicador de recorrencia nos cartoes e valida filtros e dashboard (#1)` | **T05** — Cartões, filtros e dashboard |
| 9 | `be9039b` | `test(frontend): adiciona testes ponta a ponta de criterios de aceite e regressao (#1)` | **T06** — Regressão e aceite ponta a ponta |
| 10 | `b90d086` | `style: remove linhas vazias extras identificadas na auditoria` | Etapa 7 — Limpeza de formatação (`EOF`) |

### Finalidade dos Seis Commits de Implementação (`T01` a `T06`)

- **T01 (`c6adb16`):** Configurou exclusivamente em `frontend/` o ambiente de testes com `vitest` e `jsdom` ([frontend/package.json](frontend/package.json), [frontend/vitest.config.js](frontend/vitest.config.js), [frontend/.gitignore](frontend/.gitignore) e [frontend/tests/setup.test.js](frontend/tests/setup.test.js)).
- **T02 (`b7a2a78`):** Implementou em [frontend/js/recorrencia.js](frontend/js/recorrencia.js) as funções puras `RECORRENCIAS_VALIDAS`, `obterUltimoDiaDoMes`, `normalizarTarefa`, `calcularProximaDataTermino`, `deveGerarSucessora` e `gerarTarefaSucessora`, acompanhadas de 23 testes unitários em [frontend/tests/recorrencia.test.js](frontend/tests/recorrencia.test.js).
- **T03 (`786e57f`):** Adicionou o campo `<select id="recorrencia">` em [frontend/index.html](frontend/index.html), ajustou `.form-row` para 5 colunas em [frontend/css/style.css](frontend/css/style.css), integrou a leitura, edição, reset e validação obrigatória de `#data-termino` em [frontend/js/script.js](frontend/js/script.js) e criou 12 testes de integração em [frontend/tests/formulario-recorrencia.test.js](frontend/tests/formulario-recorrencia.test.js).
- **T04 (`4981dd0`):** Conectou a geração automática de tarefas sucessoras (`status: "TODO"`) nos três fluxos de conclusão (criação direta como `DONE`, edição no formulário e alteração de status em massa), garantindo a imutabilidade de `sucessoraGerada: true` e o isolamento de ocorrências, com 10 testes em [frontend/tests/geracao-sucessora.test.js](frontend/tests/geracao-sucessora.test.js).
- **T05 (`51ff4fb`):** Adicionou a renderização condicional e segura do badge `.task-recurrence` nos cartões de tarefas recorrentes e sua estilização *dark glassmorphism*, validando filtros por status e contadores do dashboard com 13 testes em [frontend/tests/cartoes-filtro-dashboard.test.js](frontend/tests/cartoes-filtro-dashboard.test.js).
- **T06 (`be9039b`):** Completou a suíte com 13 testes de regressão das funcionalidades originais e fluxos integrados ponta a ponta dos critérios `CA01` a `CA11` em [frontend/tests/regressao-e-aceite.test.js](frontend/tests/regressao-e-aceite.test.js).

---

## 5. Requisitos Funcionais e Critérios de Aceite

### 5.1. Rastreabilidade de Requisitos Funcionais (`RF01` a `RF08`)

| Requisito | Descrição Resumida | Tarefas | Suítes de Teste que Comprovam |
| :--- | :--- | :--- | :--- |
| **RF01** | Seleção de recorrência no formulário (`NENHUMA`, `DIARIA`, `SEMANAL`, `MENSAL`) | `T03` | [formulario-recorrencia.test.js](frontend/tests/formulario-recorrencia.test.js) |
| **RF02** | Obrigatoriedade da data de término quando `recorrencia !== "NENHUMA"` | `T03` | [formulario-recorrencia.test.js](frontend/tests/formulario-recorrencia.test.js) |
| **RF03** | Geração automática de sucessora `TODO` ao concluir (`DONE`) por criação, edição ou massa | `T02`, `T04` | [recorrencia.test.js](frontend/tests/recorrencia.test.js), [geracao-sucessora.test.js](frontend/tests/geracao-sucessora.test.js) |
| **RF04** | Cálculo da nova data de término e avanço de ciclos até data estritamente futura (`> hoje`) | `T02`, `T04` | [recorrencia.test.js](frontend/tests/recorrencia.test.js), [geracao-sucessora.test.js](frontend/tests/geracao-sucessora.test.js), [regressao-e-aceite.test.js](frontend/tests/regressao-e-aceite.test.js) |
| **RF05** | Preservação de `diaBaseRecorrencia` (`1`–`31`) em séries mensais, meses curtos e anos bissextos | `T02`, `T03`, `T04` | [recorrencia.test.js](frontend/tests/recorrencia.test.js), [formulario-recorrencia.test.js](frontend/tests/formulario-recorrencia.test.js), [geracao-sucessora.test.js](frontend/tests/geracao-sucessora.test.js) |
| **RF06** | Prevenção de duplicação de sucessoras via flag `sucessoraGerada` | `T02`, `T03`, `T04` | [recorrencia.test.js](frontend/tests/recorrencia.test.js), [formulario-recorrencia.test.js](frontend/tests/formulario-recorrencia.test.js), [geracao-sucessora.test.js](frontend/tests/geracao-sucessora.test.js) |
| **RF07** | Isolamento de ocorrências na edição e exclusão individual | `T04`, `T06` | [geracao-sucessora.test.js](frontend/tests/geracao-sucessora.test.js), [regressao-e-aceite.test.js](frontend/tests/regressao-e-aceite.test.js) |
| **RF08** | Exibição de badge `.task-recurrence` nos cartões e preservação de filtros e dashboard | `T05`, `T06` | [cartoes-filtro-dashboard.test.js](frontend/tests/cartoes-filtro-dashboard.test.js), [regressao-e-aceite.test.js](frontend/tests/regressao-e-aceite.test.js) |

### 5.2. Resumo de Cobertura dos Critérios de Aceite (`CA01` a `CA11`)

- **CA01 (Padrão `"NENHUMA"` e ausência de badge/sucessora):** Coberto em `recorrencia.test.js`, `formulario-recorrencia.test.js`, `geracao-sucessora.test.js`, `cartoes-filtro-dashboard.test.js` e `regressao-e-aceite.test.js`.
- **CA02 (Obrigatoriedade de data de término para recorrentes):** Coberto em `formulario-recorrencia.test.js` (testes `3` e `4`).
- **CA03 (Recorrência Diária `+1d` e Semanal `+7d` em tarefa futura):** Coberto em `recorrencia.test.js` e `geracao-sucessora.test.js` (testes `3`, `4` e `10`).
- **CA04 (Avanço até data estritamente futura para tarefas atrasadas):** Coberto em `recorrencia.test.js`, `geracao-sucessora.test.js` (teste `5`) e `regressao-e-aceite.test.js` (teste `13`).
- **CA05 (Recorrência Mensal em meses curtos `31/01 → 28/02 → 31/03 → 30/04`):** Coberto em `recorrencia.test.js`, `formulario-recorrencia.test.js` (teste `10`) e `geracao-sucessora.test.js` (teste `6`).
- **CA06 (Recorrência Mensal em ano bissexto `2028-01-31 → 2028-02-29 → 2028-03-31`):** Coberto em `recorrencia.test.js` e `geracao-sucessora.test.js` (teste `7`).
- **CA07 (Criação direta de tarefa recorrente com status `DONE`):** Coberto em `geracao-sucessora.test.js` (teste `1`).
- **CA08 (Prevenção de duplicação após reabertura, nova conclusão ou edição comum):** Coberto em `recorrencia.test.js`, `formulario-recorrencia.test.js` (teste `9`) e `geracao-sucessora.test.js` (testes `8` e `10`).
- **CA09 (Isolamento na edição e exclusão de ocorrências):** Coberto em `geracao-sucessora.test.js` (teste `9`) e `regressao-e-aceite.test.js` (testes `4` e `5`).
- **CA10 (Identificação visual `.task-recurrence`, estatísticas e filtro por status):** Coberto em `cartoes-filtro-dashboard.test.js` (testes `1` a `13`) e `regressao-e-aceite.test.js` (teste `13`).
- **CA11 (Compatibilidade com tarefas antigas no `localStorage`):** Coberto em `recorrencia.test.js`, `formulario-recorrencia.test.js` (teste `12`), `cartoes-filtro-dashboard.test.js` (teste `5`) e `regressao-e-aceite.test.js` (teste `10`).

---

## 6. Testes e Validação

- **Execução Automatizada (`cd frontend && npm test`):**
  - **Suítes aprovadas:** `6 passed (6)`
    1. [frontend/tests/setup.test.js](frontend/tests/setup.test.js) — `3` testes.
    2. [frontend/tests/recorrencia.test.js](frontend/tests/recorrencia.test.js) — `23` testes.
    3. [frontend/tests/formulario-recorrencia.test.js](frontend/tests/formulario-recorrencia.test.js) — `12` testes.
    4. [frontend/tests/geracao-sucessora.test.js](frontend/tests/geracao-sucessora.test.js) — `10` testes.
    5. [frontend/tests/cartoes-filtro-dashboard.test.js](frontend/tests/cartoes-filtro-dashboard.test.js) — `13` testes.
    6. [frontend/tests/regressao-e-aceite.test.js](frontend/tests/regressao-e-aceite.test.js) — `13` testes.
  - **Total de testes aprovados:** `74 passed (74)`
  - **Total de testes reprovados:** `0`
- **Instalação Reprodutível (`cd frontend && npm ci`):**
  - Concluída com código de saída `0` (`added 70 packages`), comprovando total sincronia entre [frontend/package.json](frontend/package.json) e [frontend/package-lock.json](frontend/package-lock.json).
- **Validação em Navegador Real (Playwright MCP em `http://localhost:8080`):**
  - Validados os fluxos de criação, edição, exclusão, criação direta como `DONE`, conclusão em massa, série mensal com dia-base `31`, prevenção de duplicações, filtros (`TODOS`, `TODO`, `DOING`, `DONE`), contadores do dashboard, persistência após recarregamento real da página, responsividade em viewports desktop (`1280x800`) e mobile (`375x667`) e ausência de erros JavaScript no console.
- **Verificação de Formatação e Escopo (`git diff --check`):**
  - Após o commit `b90d086`, `git diff --check main...feature/tarefas-recorrentes` retornou código `0` sem avisos.
  - Nenhum arquivo do backend Java (`src/`, `build.gradle`, `gradle/`, `settings.gradle`) foi modificado.

---

## 7. Erros Reais e Intervenção Humana

Durante o ciclo de desenvolvimento, ocorreram três situações reais que demonstram a complementaridade entre a revisão humana e a autocorreção técnica do agente:

### Caso 1 — Instruções duplicadas e contraditórias no planejamento (Intervenção Humana)
- **Ocorrência:** Na primeira versão de [docs/plano.md](docs/plano.md) (Etapa 5), havia menções conflitantes sobre o sistema de módulos a ser usado entre o navegador e o Vitest (sugerindo fallback condicional CommonJS/global ao mesmo tempo em que previa módulos ES).
- **Detecção e Intervenção Humana:** Durante a revisão humana do plano, o revisor identificou a ambiguidade e determinou o uso exclusivo de **ES Modules nativos** (`import` / `export` e `<script type="module" src="js/script.js"></script>`), sem bundler e sem código híbrido CommonJS, além de orientar que a `T06` priorizasse testes de regressão evitando duplicar testes unitários anteriores.
- **Resolução:** O plano foi refinado e aprovado antes do commit `60a7a84` e antes de qualquer linha de código ser escrita.
- **Importância da Intervenção Humana:** Impediu que uma decisão arquitetural ambígua se propagasse para a implementação das tarefas `T02` e `T03`, garantindo código mais limpo e alinhado aos padrões modernos do navegador.

### Caso 2 — Erro de esquema de URL ao ler `index.html` no `jsdom` (Correção pelo Agente)
- **Ocorrência:** Na implementação inicial da suíte [frontend/tests/formulario-recorrencia.test.js](frontend/tests/formulario-recorrencia.test.js) (`T03`), utilizou-se `readFileSync(new URL("../index.html", import.meta.url), "utf-8")` para carregar o HTML real da aplicação.
- **Falha Observada:** Ao executar `npm test`, o Vitest com ambiente `jsdom` simulou `import.meta.url` sob protocolo HTTP (`http://localhost:3000/...`), fazendo `node:fs` lançar `TypeError: The URL must be of scheme file`.
- **Correção Aplicada pelo Agente:** O agente substituiu a resolução de caminho por `readFileSync(resolve(process.cwd(), "index.html"), "utf-8")` utilizando `resolve` de `node:path`. Após o ajuste, todos os testes da `T03` e das suítes subsequentes (`T04`, `T05` e `T06`) passaram integralmente.

### Caso 3 — Avisos de linha vazia extra no final do arquivo na auditoria (Intervenção Humana + Correção pelo Agente)
- **Ocorrência:** Na auditoria final da Etapa 7, a execução de `git diff --check main...feature/tarefas-recorrentes` retornou código `2` apontando `new blank line at EOF` em 10 arquivos criados que continham uma linha em branco adicional ao final.
- **Intervenção e Correção:** A partir do apontamento na auditoria, o revisor autorizou a limpeza exclusiva das 10 linhas vazias excedentes no EOF, registrada no commit `b90d086` (`style: remove linhas vazias extras identificadas na auditoria`), após o qual `git diff --check main...feature/tarefas-recorrentes` passou a retornar código `0` sem avisos.

---

## 8. Consumo de Tokens e Créditos

Não foi possível obter uma medição consolidada e verificável do consumo de tokens ou créditos nesta execução.

### 8.1. Métricas Parciais Verificáveis nos Logs Locais da Sessão

A investigação dos arquivos locais gerados pelo ambiente Antigravity identificou o arquivo de log da conversa em `.system_generated/logs/transcript.jsonl` (diretório de dados da sessão `d08581bf-7909-4abf-94bf-3c41c004d426`). Esse registro armazena contadores de tokens exclusivamente nos objetos JSON dos passos do tipo `PLANNER_RESPONSE` por meio dos campos `input_tokens`, `output_tokens` e `cache_read_tokens`. Nem todos os passos do log possuem métricas disponíveis: passos dos tipos `USER_INPUT`, `GENERIC` (retornos de ferramentas), `SYSTEM_MESSAGE` e `CHECKPOINT` não contêm campos de contagem de tokens. Além disso, o arquivo **não** registra créditos financeiros/faturamento, não inclui o identificador nominal do modelo em cada linha JSON e representa apenas uma medição parcial até o momento de corte da leitura (distinta de uma medição final consolidada).

Os dados brutos verificáveis extraídos de `transcript.jsonl` no corte de `586` passos registrados (`34` interações `USER_INPUT`, das quais apenas `238` passos `PLANNER_RESPONSE` possuem métricas de tokens disponíveis, sem soma de dados duplicados) são apresentados abaixo:

| Etapa / Fase no Log Local | Interações (`USER_INPUT`) | Passos no Log (`steps`) | Passos c/ Métricas (`PLANNER_RESPONSE`) | `input_tokens` ( Novos ) | `output_tokens` ( Gerados ) | `cache_read_tokens` ( Leitura de Cache ) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Etapas 1 a 4** — Análise, GitHub MCP, Issue `#1`, `AGENTS.md` e `docs/spec.md` (Turnos 01–12) | 12 | 188 | 81 | 557.605 | 45.983 | 5.869.017 |
| **Etapa 5** — Elaboração, revisão e commit de `docs/plano.md` (Turnos 13–15) | 3 | 39 | 14 | 66.486 | 21.127 | 2.345.272 |
| **Etapa 6 (T01)** — Configuração de Vitest e jsdom (Turnos 16–18) | 3 | 46 | 18 | 56.556 | 5.815 | 3.630.046 |
| **Etapa 6 (T02)** — Módulo puro `recorrencia.js` e auditoria (Turnos 19–21) | 3 | 51 | 20 | 93.881 | 22.463 | 2.541.849 |
| **Etapa 6 (T03)** — Integração do formulário e validação (Turnos 22–23) | 2 | 70 | 27 | 108.054 | 26.336 | 2.100.624 |
| **Etapa 6 (T04)** — Geração de sucessoras e auditoria de massa (Turnos 24–26) | 3 | 52 | 21 | 78.782 | 20.239 | 2.788.040 |
| **Etapa 6 (T05)** — Cartões, filtros e dashboard (Turnos 27–28) | 2 | 47 | 19 | 219.889 | 13.185 | 2.905.315 |
| **Etapa 6 (T06)** — Testes de regressão e aceite (Turnos 29–30) | 2 | 41 | 17 | 58.101 | 16.616 | 3.317.975 |
| **Etapa 7** — Auditoria final e correção de EOF (Turnos 31–33) | 3 | 50 | 20 | 749.184 | 11.848 | 3.863.557 |
| **Etapa 8 (parcial)** — Leitura inicial para geração dos artefatos (Turno 34 parcial) | 1 | 2 | 1 | 3.429 | 453 | 242.638 |
| **Total Parcial Verificado no Log Local** | **34** | **586** | **238** | **1.991.967** | **184.065** | **29.604.333** |

- **Créditos ou custo financeiro:** Indisponível nos registros locais da sessão (nenhuma estimativa de custo ou consumo de créditos é afirmada sem evidência).
- **Identificador de modelo:** Não registrado nos objetos JSON de `transcript.jsonl`.

---

## 9. Aprendizados e Conclusão

1. **Benefícios do SDD e da Especificação Antes do Código:** A definição prévia do modelo de dados (`recorrencia`, `diaBaseRecorrencia` e `sucessoraGerada`) e dos critérios `CA01`–`CA11` em [docs/spec.md](docs/spec.md) eliminou ambiguidades críticas — como o comportamento da recorrência mensal ao atravessar fevereiro (`31/01 → 28/02 → 31/03`) e o avanço de múltiplos ciclos para tarefas atrasadas — antes que qualquer linha de JavaScript fosse escrita.
2. **Controle de Escopo e Desacoplamento:** O isolamento da aritmética de datas em [frontend/js/recorrencia.js](frontend/js/recorrencia.js) via ES Modules nativos permitiu testar exaustivamente todas as regras de calendário sem dependência do DOM, mantendo [frontend/js/script.js](frontend/js/script.js) enxuto e preservando o backend Java intacto.
3. **Testes Incrementais e Prevenção de Regressões:** A evolução da suíte a cada tarefa (`3 → 26 → 38 → 48 → 61 → 74` testes) deu segurança imediata em todas as refatorações.
4. **Papel da Revisão Humana:** As intervenções humanas no plano (unificação em ES Modules nativos), na auditoria de ações em massa (`T04`) e na revisão de formatação (`git diff --check`) elevaram a qualidade técnica e a consistência do histórico Git.
5. **Rastreabilidade Ponta a Ponta:** Cada requisito funcional (`RF01`–`RF08`) e critério de aceite (`CA01`–`CA11`) possui mapeamento direto para tarefas (`T01`–`T06`), suítes de teste e commits semânticos individuais.
6. **Limitações da Abordagem:** O fluxo SDD com gates formais de revisão por tarefa exige um número maior de interações e leituras de contexto em comparação a uma implementação monolítica em passo único, porém compensa esse custo com previsibilidade, auditabilidade e ausência de retrabalho estrutural.

---

## 10. Próximos Passos

Com a conclusão da implementação, da auditoria final e dos artefatos de documentação ([skills/feature-com-spec/SKILL.md](skills/feature-com-spec/SKILL.md) e [RELATORIO.md](RELATORIO.md)), o próximo passo — mediante autorização explícita — consiste em:

1. Realizar o commit dos artefatos finais de documentação na branch `feature/tarefas-recorrentes`.
2. Executar `git push -u origin feature/tarefas-recorrentes`.
3. Abrir o Pull Request para a branch `main` utilizando o servidor oficial GitHub MCP, vinculando formalmente a Issue `#1` (`Closes #1`).
