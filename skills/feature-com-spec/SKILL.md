---
name: feature-com-spec
description: Orienta a implementação incremental de funcionalidades por meio de especificações, critérios de aceite, planejamento, testes e validação.
---

# Skill: Desenvolvimento Orientado por Especificação (SDD — Spec-Driven Development)

Esta skill define um fluxo padronizado, auditável e independente de tecnologia para projetar, especificar, planejar, implementar, testar e entregar funcionalidades de software utilizando **Spec-Driven Development (SDD)**.

---

## 1. Quando Utilizar Esta Skill

Ative esta skill sempre que a tarefa envolver:
- Criação de uma nova funcionalidade (*feature*) ou evolução arquitetural relevante.
- Necessidade de alinhar requisitos de negócio, contratos de dados e casos de borda antes de escrever código.
- Desenvolvimento incremental com controle rigoroso de escopo, testes automatizados por etapa e histórico de commits semânticos e rastreáveis.

---

## 2. Regras Operacionais Inegociáveis (Guardrails do Agente)

1. **Não implementar antes da aprovação da especificação e do plano:** Nenhum arquivo de código de produção deve ser alterado antes que a especificação (`docs/spec.md`) e o plano técnico (`docs/plano.md`) tenham sido revisados e aprovados pelo responsável humano.
2. **Não alterar arquivos fora do escopo autorizado:** Respeite estritamente os limites de diretórios, módulos e camadas definidos na especificação e em cada tarefa do plano.
3. **Não executar commits, criação de branches ou `git push` sem autorização explícita:** Toda operação de gravação no controle de versão exige aprovação prévia após inspeção do diff e dos resultados de teste.
4. **Não marcar tarefas como concluídas antes de validar os testes:** O status de uma tarefa no plano só deve mudar de `[ ] Pendente` para `[x] Concluída` após todos os testes automatizados (novos e anteriores) passarem e o revisor autorizar o fechamento da tarefa.
5. **Não confundir testes automatizados com validação manual:** Testes unitários ou de integração em ambiente simulado não substituem a verificação prática da aplicação em execução real quando exigida pelo plano.
6. **Não afirmar que verificou algo que não executou:** Caso uma ferramenta, servidor ou navegador não possa ser executado no ambiente, relate explicitamente a limitação técnica.
7. **Não inventar métricas, tokens, custos ou resultados:** Utilize apenas dados extraídos de logs verificáveis ou comandos efetivamente executados; quando uma métrica consolidada não estiver disponível, declare formalmente sua indisponibilidade.
8. **Preservar funcionalidades existentes:** Toda entrega incremental deve comprovar ausência de regressões nas funcionalidades anteriores da aplicação.
9. **Evitar duplicações e instruções contraditórias:** Revise artefatos de especificação e planejamento para eliminar ambiguidades (ex.: padrões de módulos conflitantes, regras duplicadas ou nomes divergentes).
10. **Identificar desvios entre especificação e implementação:** Se surgir necessidade de alterar uma regra de negócio durante a codificação, proponha primeiro a atualização da especificação antes de alterar o código.
11. **Comunicar problemas e solicitar revisão antes de corrigir falhas fora do escopo:** Ao encontrar um defeito em módulo não autorizado para a tarefa atual, documente a causa raiz, os passos de reprodução e aguarde orientação antes de intervir.

---

## 3. Fluxo Passo a Passo de Execução (16 Etapas)

### Fase A — Descoberta e Contexto

1. **Analisar o contexto do repositório:**
   - Inspecione a estrutura de diretórios, linguagens, gerenciadores de pacotes, suítes de teste existentes, scripts de build e histórico recente do Git (`git status`, `git log`).
2. **Verificar instruções existentes para agentes:**
   - Leia integralmente arquivos como `AGENTS.md`, `CONTRIBUTING.md` ou `README.md` para respeitar convenções de nomenclatura, arquitetura e restrições do projeto.
   - Se o repositório ainda não possuir um `AGENTS.md` e o fluxo exigir sua criação, documente a visão geral, stack tecnológica, estrutura de pastas, comandos de execução/testes e restrições obrigatórias.
3. **Identificar requisitos e restrições da feature:**
   - Levante as entradas, saídas, regras de domínio, casos de borda, requisitos de retrocompatibilidade e limites do que está **dentro** e **fora** do escopo.
   - Vincule o trabalho a uma Issue rastreável no repositório remoto quando aplicável.

### Fase B — Especificação Funcional e Técnica

4. **Criar ou revisar a especificação funcional (`docs/spec.md`):**
   - Documente o objetivo, escopo técnico, modelo de dados, contratos de interface e regras de retrocompatibilidade.
5. **Definir requisitos funcionais identificados (`RF01`, `RF02`, ...):**
   - Numere cada requisito funcional de forma única, clara e atômica para permitir rastreabilidade direta até as tarefas e testes.
6. **Escrever critérios de aceite verificáveis (`CA01`, `CA02`, ...):**
   - Redija todos os critérios de aceite no formato determinístico **Dado / Quando / Então** (*Given / When / Then*), cobrindo fluxos principais, fluxos alternativos, validações de erro e casos de borda.
   - Pare e aguarde a revisão e aprovação da especificação antes de prosseguir.

### Fase C — Planejamento Incremental

7. **Elaborar um plano incremental com tarefas pequenas (`docs/plano.md`):**
   - Decomponha a implementação em tarefas pequenas, coesas e sequenciais (`T01`, `T02`, ..., `T0N`).
   - Para cada tarefa, defina: status inicial (`[ ] Pendente`), objetivo, descrição das alterações, arquivos autorizados, requisitos funcionais atendidos (`RF`), critérios de aceite relacionados (`CA`), dependências, testes automatizados, validação manual, critério objetivo de conclusão e sugestão de mensagem de commit.
8. **Validar o plano antes de implementar:**
   - Verifique a consistência técnica entre as tarefas, a ausência de instruções conflitantes e a cobertura completa de todos os requisitos e critérios de aceite na matriz de rastreabilidade.
   - Aguarde aprovação formal do plano antes de iniciar `T01`.

### Fase D — Implementação e Testes Incrementais

9. **Implementar uma tarefa por vez:**
   - Execute exclusivamente a tarefa autorizada da vez, modificando apenas os arquivos previstos no seu escopo.
10. **Criar testes automatizados correspondentes:**
    - Escreva testes unitários e/ou de integração que comprovem de forma determinística os requisitos e critérios de aceite daquela tarefa.
11. **Executar testes de regressão:**
    - Execute toda a suíte de testes a cada tarefa concluída para garantir que as entregas anteriores e as funcionalidades legadas continuam íntegras.
12. **Solicitar revisão antes de registrar commits:**
    - Ao finalizar uma tarefa, apresente o relatório de entrega (arquivos alterados, resumo do diff, comandos de teste executados, contagem de testes aprovados/reprovados, problemas e correções, evidência de validação manual e sugestão de commit) e aguarde autorização para atualizar o status no plano e criar o commit.
13. **Manter rastreabilidade entre requisitos, testes e commits:**
    - Cada tarefa aprovada deve originar um commit atômico e semântico referenciando a Issue da feature.

### Fase E — Auditoria Final, Documentação e Entrega

14. **Realizar auditoria final de código, comportamento e Git:**
    - Confronte cada requisito (`RF`) e critério de aceite (`CA`) com o código e os testes implementados.
    - Execute instalação limpa das dependências (ex.: `npm ci`), rode a suíte completa de testes, valide a aplicação em execução real e audite o repositório (`git status`, `git log`, `git diff --check`).
15. **Documentar erros, correções e decisões:**
    - Registre de forma transparente qualquer erro técnico ocorrido, as correções aplicadas pelo agente e os ajustes decorrentes de revisão humana.
16. **Preparar Pull Request vinculado à Issue correspondente:**
    - Somente após autorização explícita, envie a branch (`git push`) e abra o Pull Request contendo resumo técnico, matriz de rastreabilidade, instruções de validação e vínculo com a Issue (`Closes #<numero>`).

---

## 4. Modelos e Exemplos Genéricos

### 4.1. Estrutura Genérica de Especificação (`docs/spec.md`)

```markdown
# Especificação Funcional e Técnica: <Nome da Feature>

## 1. Visão Geral e Objetivo
Descrição concisa do problema de negócio e do resultado esperado.

## 2. Escopo Técnico
- **Dentro do escopo:** Módulos, camadas e comportamentos contemplados.
- **Fora do escopo:** Módulos e integrações que não devem ser alterados.

## 3. Modelo de Dados e Retrocompatibilidade
Definição de entidades, campos, tipos, valores padrão e tratamento de dados legados.

## 4. Requisitos Funcionais e Regras de Negócio
- **RF01 — <Título>:** Descrição objetiva da regra.
- **RF02 — <Título>:** Descrição objetiva da regra.

## 5. Critérios de Aceite (Dado / Quando / Então)
- **CA01 — <Título>:** ...
```

### 4.2. Exemplo Genérico de Critério de Aceite (`Dado / Quando / Então`)

```markdown
### CA02 — Bloqueio de operação quando parâmetro obrigatório estiver ausente
- **Dado** que o usuário selecionou uma modalidade que exige configuração de limite,
- **Quando** tenta submeter o formulário com o campo de limite vazio,
- **Então** a submissão é impedida, o estado persistido não sofre alterações e uma mensagem de validação informa a obrigatoriedade do campo.
```

### 4.3. Exemplo Genérico de Tarefa de Implementação (`docs/plano.md`)

```markdown
### T02 — Implementar módulo de regras de domínio e validações puras
- **Status:** `[ ] Pendente`
- **Objetivo:** Implementar as funções puras de cálculo e validação desacopladas da camada de interface.
- **Descrição das alterações:**
  - Criar módulo de domínio exportando as funções de validação e transformação.
  - Criar suíte de testes unitários cobrindo casos nominais e casos de borda.
- **Arquivos criados ou modificados:**
  - `src/domain/validador.js` (novo)
  - `tests/validador.test.js` (novo)
- **Requisitos funcionais atendidos:** `RF01`, `RF02`.
- **Critérios de aceite relacionados:** `CA01`, `CA02`.
- **Dependências:** `T01`.
- **Testes automatizados a executar:** `npm test`.
- **Validação manual necessária:** Conferir logs de execução dos casos de borda.
- **Critério objetivo de conclusão:** 100% dos testes unitários aprovados sem erros.
- **Mensagem de commit sugerida:** `feat(domain): implementa regras puras de validacao (#<issue>)`
```

### 4.4. Checklist de Aprovação por Tarefa

```markdown
- [ ] Apenas os arquivos autorizados para a tarefa foram criados ou modificados.
- [ ] Nenhum arquivo fora do escopo sofreu alterações (`git status` e `git diff`).
- [ ] Todos os testes novos e anteriores passaram com 0 falhas.
- [ ] A validação manual prevista para a etapa foi executada (ou sua limitação técnica foi reportada).
- [ ] `git diff --check` não apresenta erros de formatação ou espaços em branco.
```

### 4.5. Modelos de Mensagem de Commit (Conventional Commits)

```text
docs: especifica feature de <nome-da-feature> (#<issue>)
docs: adiciona plano de implementacao SDD (#<issue>)
chore(<escopo>): configura infraestrutura de testes automatizados (#<issue>)
feat(<escopo>): implementa <descricao-concisa-da-entrega> (#<issue>)
test(<escopo>): adiciona testes integrados de criterios de aceite e regressao (#<issue>)
style: remove linhas vazias extras identificadas na auditoria
```

### 4.6. Estrutura de Relatório de Auditoria Final

```markdown
# Relatório de Auditoria Final — <Nome da Feature>

1. **Matriz de Conformidade (RF01..RFN):** Situação, arquivo/função responsável, testes correspondentes e eventuais divergências.
2. **Matriz de Cobertura de Critérios de Aceite (CA01..CAN):** Mapeamento entre critérios, implementação e suítes de teste.
3. **Auditoria Técnica:** Análise de casos de borda, segurança, isolamento de estado, retrocompatibilidade e arquitetura.
4. **Execução Reprodutível de Testes:** Resultado da instalação limpa e da suíte completa de testes.
5. **Auditoria de Controle de Versão:** Resultado de `git status`, `git log`, `git diff --stat` e `git diff --check`.
6. **Parecer Final:** Apto ou Não Apto para encerramento e abertura de Pull Request.
```
