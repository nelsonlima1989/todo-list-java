# Especificação Funcional e Técnica: Tarefas Recorrentes no ToDo List Frontend

## 1. Visão Geral e Objetivo

Atualmente, o frontend do **ToDo List** (desenvolvido em HTML5, CSS3 e JavaScript Vanilla, com persistência em `localStorage` e sem integração com o backend Java) gerencia apenas tarefas avulsas.

O objetivo desta funcionalidade é permitir que o usuário configure tarefas com recorrência **Diária**, **Semanal** ou **Mensal** (mantendo **Nenhuma** como padrão). Quando uma tarefa recorrente for concluída (`DONE`) — seja por edição individual, ação em massa ou criação direta com status `DONE` —, o sistema deve manter a ocorrência concluída e gerar automaticamente uma única ocorrência sucessora com status `TODO` e nova data de término calculada.

---

## 2. Escopo Técnico

- **Dentro do escopo:**
  - Frontend em HTML5, CSS3 e JavaScript Vanilla (`frontend/index.html`, `frontend/css/style.css`, `frontend/js/`).
  - Persistência local via `localStorage` (chave `"tarefas"`).
  - Testes automatizados unitários e de integração DOM com **Vitest** e **jsdom**.
  - Documentação SDD (`AGENTS.md`, `docs/spec.md`, `docs/plano.md`) e relatório final do desafio.
- **Fora do escopo:**
  - Qualquer alteração no backend Java (`src/`, `build.gradle`, `gradle/`, `settings.gradle`) ou integração HTTP/API.
  - Migração para frameworks ou bibliotecas externas de UI.
  - Alarmes, lembretes, notificações push ou agendamento em background.
  - Novos filtros na listagem (mantém-se exclusivamente o filtro por status `TODOS`, `TODO`, `DOING`, `DONE`).
  - Edição ou exclusão em cascata de ocorrências passadas ou futuras.

---

## 3. Modelo de Dados e Retrocompatibilidade

Cada objeto de tarefa armazenado no array `tarefas` (persistido em JSON sob a chave `"tarefas"` do `localStorage`) passará a seguir a estrutura abaixo:

```json
{
  "id": 1,
  "nome": "Pagar conta de internet",
  "descricao": "Pagar via PIX",
  "dataTermino": "2026-01-31",
  "prioridade": 2,
  "categoria": "Finanças",
  "status": "TODO",
  "recorrencia": "MENSAL",
  "diaBaseRecorrencia": 31,
  "sucessoraGerada": false
}
```

### Descrição dos Campos de Recorrência

| Campo | Tipo | Padrão | Descrição |
| :--- | :--- | :--- | :--- |
| `recorrencia` | `String` | `"NENHUMA"` | Frequência de repetição: `"NENHUMA"`, `"DIARIA"`, `"SEMANAL"` ou `"MENSAL"`. |
| `diaBaseRecorrencia` | `Number \| null` | `null` | Dia original da série (`1` a `31`) usado na recorrência `"MENSAL"` para preservar o dia-alvo entre meses curtos e longos (ex.: `31` na série `31/01 → 28/02 → 31/03`). `null` quando `recorrencia !== "MENSAL"`. |
| `sucessoraGerada` | `Boolean` | `false` | Indica se esta ocorrência já gerou sua tarefa sucessora. Uma vez `true`, nunca volta a ser `false` em edições subsequentes. |

### Valores de `recorrencia`

| Valor interno | Rótulo na Interface | Regra de Repetição |
| :--- | :--- | :--- |
| `"NENHUMA"` | Nenhuma | Tarefa avulsa sem repetição (valor padrão) |
| `"DIARIA"` | Diária | Avança em ciclos de +1 dia |
| `"SEMANAL"` | Semanal | Avança em ciclos de +7 dias |
| `"MENSAL"` | Mensal | Avança em ciclos de +1 mês preservando `diaBaseRecorrencia` (limitado ao último dia do mês destino) |

### Retrocompatibilidade (`localStorage`)

- Tarefas legadas já armazenadas no `localStorage` sem os campos `recorrencia`, `diaBaseRecorrencia` ou `sucessoraGerada` devem ser carregadas e manipuladas sem falhas:
  - Se `tarefa.recorrencia` estiver ausente ou não for um dos valores válidos, assumir `"NENHUMA"`.
  - Se `tarefa.sucessoraGerada` estiver ausente, assumir `false` (`Boolean(tarefa.sucessoraGerada)`).
  - Se `tarefa.recorrencia === "MENSAL"` e `tarefa.diaBaseRecorrencia` estiver ausente, extrair o dia numérico (`1`–`31`) de `tarefa.dataTermino`; caso contrário, assumir `null`.

---

## 4. Requisitos Funcionais e Regras de Negócio

### RF01 — Configuração de Recorrência no Formulário
- O formulário `#form-tarefa` deve incluir o campo `<select id="recorrencia" name="recorrencia">` com as opções:
  - `NENHUMA` ("Nenhuma" — opção padrão inicial e após `reset`)
  - `DIARIA` ("Diária")
  - `SEMANAL` ("Semanal")
  - `MENSAL` ("Mensal")

### RF02 — Obrigatoriedade da Data de Término para Tarefas Recorrentes
- Quando `recorrencia === "NENHUMA"`, o campo `dataTermino` (`#data-termino`) permanece opcional.
- Quando `recorrencia` for `"DIARIA"`, `"SEMANAL"` ou `"MENSAL"`, o campo `dataTermino` é **obrigatório**:
  - Ao selecionar uma recorrência diferente de `"NENHUMA"`, o input `#data-termino` recebe `required = true`.
  - Na submissão do formulário (`submit`), caso `recorrencia !== "NENHUMA"` e `dataTermino` esteja vazio, a gravação é bloqueada e o usuário é informado da obrigatoriedade.

### RF03 — Geração Automática de Sucessora ao Concluir (`DONE`) ou Criar como `DONE`
- Uma ocorrência elegível para gerar sucessora é toda tarefa que satisfaz simultaneamente:
  1. `recorrencia !== "NENHUMA"`
  2. `status === "DONE"`
  3. `sucessoraGerada === false`
  4. `dataTermino` preenchida e válida (`YYYY-MM-DD`).
- **Cenários de disparo:**
  1. **Criação direta com status `DONE`:**
     - Ao criar uma nova tarefa recorrente já com `status === "DONE"`, a tarefa recém-criada é mantida como `"DONE"`, é imediatamente marcada com `sucessoraGerada: true`, e uma única tarefa sucessora com `status: "TODO"` e `sucessoraGerada: false` é criada e adicionada à lista no mesmo ato.
  2. **Conclusão via edição no formulário (`submit`):**
     - Ao editar uma tarefa recorrente cujo `sucessoraGerada` seja `false` e salvá-la com `status === "DONE"`, a tarefa editada permanece `"DONE"`, recebe `sucessoraGerada: true` e gera imediatamente uma única tarefa sucessora `"TODO"`.
  3. **Conclusão via alteração de status em massa (`#btn-status-multiplo`):**
     - Ao alterar tarefas selecionadas para `"DONE"`, cada tarefa selecionada que seja recorrente e tenha `sucessoraGerada === false` permanece `"DONE"`, recebe `sucessoraGerada: true` e gera sua respectiva sucessora `"TODO"`.
- **Atributos da tarefa sucessora gerada:**
  - `id`: novo identificador único sequencial (`proximoId++`).
  - `nome`, `descricao`, `prioridade`, `categoria`, `recorrencia`: copiados da tarefa concluída.
  - `status`: `"TODO"`.
  - `dataTermino`: calculada conforme **RF04** e **RF05**.
  - `diaBaseRecorrencia`: se `recorrencia === "MENSAL"`, recebe o `diaBaseRecorrencia` da tarefa concluída; caso contrário, `null`.
  - `sucessoraGerada`: `false`.

### RF04 — Cálculo da Nova Data de Término e Avanço para Data Estritamente Futura
- O cálculo parte da `dataTermino` prevista da tarefa concluída e avança no mínimo **1 ciclo** (`+1 dia` para `"DIARIA"`, `+7 dias` para `"SEMANAL"`, `+1 mês` para `"MENSAL"`).
- **Garantia de data estritamente futura:**
  - Considerando `hoje` como a data local atual no formato `YYYY-MM-DD` (meia-noite local):
  - Se a data obtida após avançar 1 ciclo for **menor ou igual a `hoje`** (`novaData <= hoje`), o algoritmo deve continuar avançando ciclos sucessivos até encontrar a primeira data **estritamente maior que `hoje`** (`novaData > hoje`).
  - Se a `dataTermino` da tarefa concluída já era igual ou posterior a `hoje`, o avanço de 1 único ciclo já produzirá uma data estritamente futura (`> hoje`).

### RF05 — Preservação de `diaBaseRecorrencia` e Ajuste de Fim de Mês na Recorrência Mensal
- **Definição e propagação de `diaBaseRecorrencia`:**
  - Na criação de uma tarefa com `recorrencia === "MENSAL"`, `diaBaseRecorrencia` é definido como o dia numérico (`1` a `31`) da `dataTermino` informada (ex.: `"2026-01-31"` → `diaBaseRecorrencia = 31`).
  - Na geração automática da sucessora mensal, `diaBaseRecorrencia` é copiado da tarefa concluída sem ser sobrescrito pelo dia ajustado de um mês mais curto.
  - Na edição manual de uma ocorrência mensal pelo formulário:
    - Se a tarefa ainda não era `"MENSAL"` e passou a ser `"MENSAL"`, ou se o usuário alterou manualmente o valor de `dataTermino` no formulário, `diaBaseRecorrencia` é atualizado para o dia da nova `dataTermino`.
    - Se o usuário editou outros campos (ou apenas mudou o status para `"DONE"`) mantendo a mesma `dataTermino`, o `diaBaseRecorrencia` existente na ocorrência é preservado.
- **Cálculo do dia no mês de destino (`31/01 → 28/02 → 31/03`):**
  - Para cada salto de `+k` meses a partir do ano/mês da ocorrência concluída, o dia do mês de destino é calculado como:
    $$\text{diaDestino} = \min(\text{diaBaseRecorrencia}, \text{ultimoDiaDoMes}(\text{anoDestino}, \text{mesDestino}))$$
  - **Exemplos obrigatórios:**
    - **Série iniciada em `2026-01-31` (`diaBaseRecorrencia: 31`) em ano não bissexto:**
      1. Ao concluir a ocorrência de `2026-01-31` → gera sucessora em **`2026-02-28`** com `diaBaseRecorrencia: 31`.
      2. Ao concluir a ocorrência de `2026-02-28` → usa `diaBaseRecorrencia: 31` e gera sucessora em **`2026-03-31`** com `diaBaseRecorrencia: 31`.
      3. Ao concluir a ocorrência de `2026-03-31` → gera sucessora em **`2026-04-30`** com `diaBaseRecorrencia: 31`.
    - **Ano bissexto (`2028`):**
      - Ocorrência em `2028-01-31` (`diaBaseRecorrencia: 31`) → ao concluir, gera sucessora em **`2028-02-29`** com `diaBaseRecorrencia: 31` → ao concluir a de fevereiro, gera sucessora em **`2028-03-31`**.

### RF06 — Prevenção de Duplicação de Sucessoras (`sucessoraGerada`)
- O controle de geração única é feito exclusivamente pela propriedade booleana `sucessoraGerada`.
- Uma vez que uma tarefa tenha gerado sua sucessora (`sucessoraGerada: true`):
  - **Imutabilidade em edições comuns:** Editar a tarefa no formulário (alterando nome, descrição, data, prioridade, categoria, recorrência ou status) ou aplicar ações em massa **não pode** redefinir `sucessoraGerada` de `true` para `false`.
  - **Reabertura e nova conclusão:** Se a tarefa concluída (`sucessoraGerada: true`) tiver seu status alterado para `"TODO"` ou `"DOING"` e posteriormente for marcada como `"DONE"` novamente (via formulário ou ação em massa), nenhuma nova sucessora deve ser criada.

### RF07 — Isolamento na Edição e Exclusão
- **Edição individual:** Qualquer edição afeta apenas o registro selecionado (`editandoPorId`). Editar uma ocorrência que já gerou sua sucessora (`sucessoraGerada: true`) não altera retroativamente os dados, a recorrência, o `diaBaseRecorrencia` nem a data de término das sucessoras já existentes na lista.
- **Exclusão individual:** Excluir uma tarefa remove apenas a ocorrência correspondente ao `id` acionado, mantendo intacta a regra existente que impede excluir uma tarefa enquanto ela estiver em modo de edição (`editandoPorId === id`).

### RF08 — Identificação Visual nos Cartões e Preservação de Filtros
- Os cartões (`.task-card`) de tarefas com `recorrencia !== "NENHUMA"` devem exibir visualmente a recorrência (ex.: badge/item `.task-recurrence` indicando `Diária`, `Semanal` ou `Mensal`).
- Tarefas com `recorrencia === "NENHUMA"` não exibem badge de recorrência.
- O filtro de status (`#filtro-status`: `TODOS`, `TODO`, `DOING`, `DONE`) e os contadores de estatísticas (`#total-tarefas`, `#tarefas-todo`, `#tarefas-doing`, `#tarefas-done`) continuam operando normalmente sem qualquer novo filtro adicional.

---

## 5. Alterações de Interface (UI/UX)

1. **Formulário (`frontend/index.html`):**
   - Inclusão do `<select id="recorrencia" name="recorrencia">` dentro de `.form-row` com as opções `NENHUMA`, `DIARIA`, `SEMANAL` e `MENSAL`.
2. **Estilização (`frontend/css/style.css`):**
   - Ajuste do grid de `.form-row` para acomodar 5 campos mantendo a responsividade em `900px` e `600px`.
   - Criação da classe `.task-recurrence` seguindo a identidade visual *dark glassmorphism* do projeto.
3. **Renderização e Eventos (`frontend/js/script.js`):**
   - Leitura/preenchimento de `#recorrencia` ao criar, editar e limpar o formulário.
   - Exibição condicional do indicador de recorrência no `.task-card`.

---

## 6. Critérios de Aceite (Formato Dado / Quando / Então)

Todos os cenários abaixo são determinísticos e verificáveis por testes automatizados com **Vitest** e **jsdom**:

### CA01 — Padrão "Nenhuma" e criação de tarefa sem recorrência
- **Dado** que o formulário de nova tarefa está no estado inicial (ou após clicar em "Limpar"),
- **Quando** o usuário preenche uma tarefa sem alterar o campo de recorrência e a conclui (`DONE`),
- **Então** a tarefa é salva com `recorrencia: "NENHUMA"`, `diaBaseRecorrencia: null`, `sucessoraGerada: false`, nenhum badge de recorrência é exibido no cartão e nenhuma tarefa sucessora é gerada.

### CA02 — Obrigatoriedade de data de término para tarefas recorrentes
- **Dado** que o usuário selecionou a recorrência `"DIARIA"`, `"SEMANAL"` ou `"MENSAL"` no formulário,
- **Quando** tenta submeter o formulário com o campo `#data-termino` vazio,
- **Então** a submissão é impedida, nenhuma tarefa é adicionada ou alterada no `localStorage` e o campo de data exige preenchimento.

### CA03 — Recorrência Diária e Semanal ao concluir tarefa futura
- **Dado** que a data atual é `2026-11-04` e existem duas tarefas com status `"TODO"` e `dataTermino: "2026-11-10"`, sendo uma `"DIARIA"` e outra `"SEMANAL"`,
- **Quando** ambas são alteradas para `"DONE"` (por edição ou ação em massa),
- **Então** as tarefas originais permanecem `"DONE"` com `sucessoraGerada: true`, e são criadas duas novas tarefas `"TODO"` com `sucessoraGerada: false` e `dataTermino` iguais a `"2026-11-11"` (diária) e `"2026-11-17"` (semanal).

### CA04 — Avanço até data estritamente futura para tarefas atrasadas
- **Dado** que a data atual de referência é `2026-11-04` e existe uma tarefa `"SEMANAL"` com status `"TODO"` e `dataTermino` no passado (`"2026-10-15"`),
- **Quando** a tarefa é concluída (`"DONE"`),
- **Então** o cálculo avança múltiplos ciclos de 7 dias a partir de `"2026-10-15"` (`22/10`, `29/10`, `05/11`) até gerar a sucessora `"TODO"` com a primeira data estritamente futura: `"2026-11-05"`.

### CA05 — Recorrência Mensal em meses curtos preservando `diaBaseRecorrencia` (`31/01 → 28/02 → 31/03`)
- **Dado** que a data atual é `2026-01-15` e uma tarefa `"MENSAL"` é criada com `dataTermino: "2026-01-31"` (`diaBaseRecorrencia: 31`),
- **Quando** a ocorrência de janeiro é concluída (gerando a de fevereiro) e, em seguida, a ocorrência de fevereiro é concluída,
- **Então** a primeira sucessora é gerada com `dataTermino: "2026-02-28"` e `diaBaseRecorrencia: 31`, e a segunda sucessora recupera o dia original da série, sendo gerada com `dataTermino: "2026-03-31"` e `diaBaseRecorrencia: 31` (e, se concluída novamente, gera `"2026-04-30"` mantendo `diaBaseRecorrencia: 31`).

### CA06 — Recorrência Mensal em ano bissexto (`2028-01-31 → 2028-02-29 → 2028-03-31`)
- **Dado** que a data de referência é `2028-01-15` (ano bissexto) e existe uma tarefa `"MENSAL"` com `dataTermino: "2028-01-31"` (`diaBaseRecorrencia: 31`),
- **Quando** a ocorrência de janeiro é concluída e posteriormente a ocorrência de fevereiro é concluída,
- **Então** a sucessora de fevereiro recebe `dataTermino: "2028-02-29"` (`diaBaseRecorrencia: 31`) e a sucessora seguinte recebe `dataTermino: "2028-03-31"` (`diaBaseRecorrencia: 31`).

### CA07 — Criação de tarefa recorrente diretamente com status `DONE`
- **Dado** que a data atual simulada é `2026-11-04` e o usuário preenche o formulário de nova tarefa com `recorrencia: "DIARIA"`, `dataTermino: "2026-11-10"` e seleciona `status: "DONE"` já na criação,
- **Quando** o formulário é submetido,
- **Então** a tarefa original é salva com `status: "DONE"` e `sucessoraGerada: true`, e imediatamente uma única tarefa sucessora é criada com `status: "TODO"`, `dataTermino: "2026-11-11"` e `sucessoraGerada: false`.

### CA08 — Prevenção de duplicação após reabertura, nova conclusão ou edição comum
- **Dado** que uma tarefa recorrente já foi concluída e possui `sucessoraGerada: true`,
- **Quando** o usuário edita seus dados ou altera seu status de `"DONE"` para `"TODO"`/`"DOING"` e depois a conclui novamente para `"DONE"` (via formulário ou ação em massa),
- **Então** `sucessoraGerada` permanece `true` e **nenhuma** nova tarefa sucessora duplicada é criada.

### CA09 — Isolamento na edição e exclusão de ocorrências
- **Dado** que existem na lista a ocorrência original concluída (`id: 1`) e sua sucessora pendente (`id: 2`),
- **Quando** o usuário edita ou exclui apenas a ocorrência `id: 2`,
- **Então** a ocorrência `id: 1` permanece inalterada na lista e no `localStorage`.

### CA10 — Identificação visual no cartão, estatísticas e filtro por status
- **Dado** que existem tarefas avulsas e tarefas recorrentes nos status `TODO`, `DOING` e `DONE`,
- **Quando** a lista é renderizada e o usuário alterna o filtro `#filtro-status`,
- **Então** os cartões de tarefas recorrentes exibem o indicador visual de recorrência (`.task-recurrence`), os contadores do dashboard refletem o total exato de cada status e o filtro exibe apenas as tarefas do status selecionado.

### CA11 — Compatibilidade com tarefas antigas no `localStorage`
- **Dado** que o `localStorage` contém tarefas salvas no formato legado (sem as propriedades `recorrencia`, `diaBaseRecorrencia` e `sucessoraGerada`),
- **Quando** a aplicação é inicializada e essas tarefas são listadas, editadas ou concluídas em massa,
- **Então** todas são tratadas de forma segura com `recorrencia: "NENHUMA"`, `diaBaseRecorrencia: null` e `sucessoraGerada: false`, sem erros de execução.
