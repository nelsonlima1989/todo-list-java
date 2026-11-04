import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const htmlIndice = readFileSync(resolve(process.cwd(), "index.html"), "utf-8");

const carregarAplicacao = async (tarefasIniciais = null) => {
  localStorage.clear();

  if (tarefasIniciais !== null) {
    localStorage.setItem("tarefas", JSON.stringify(tarefasIniciais));
  }

  document.documentElement.innerHTML = htmlIndice;

  vi.resetModules();
  await import("../js/script.js");
};

const preencherFormulario = ({
  nome = "Tarefa de teste",
  descricao = "Descrição de teste",
  dataTermino = "2026-11-10",
  prioridade = "2",
  categoria = "Trabalho",
  status = "TODO",
  recorrencia = "NENHUMA",
} = {}) => {
  document.getElementById("nome").value = nome;
  document.getElementById("descricao").value = descricao;
  document.getElementById("data-termino").value = dataTermino;
  document.getElementById("prioridade").value = prioridade;
  document.getElementById("categoria").value = categoria;
  document.getElementById("status").value = status;

  const selectRecorrencia = document.getElementById("recorrencia");
  selectRecorrencia.value = recorrencia;
  selectRecorrencia.dispatchEvent(new Event("change", { bubbles: true }));
};

const submeterFormulario = () => {
  const formulario = document.getElementById("form-tarefa");
  formulario.dispatchEvent(
    new Event("submit", { bubbles: true, cancelable: true })
  );
};

const obterTarefasSalvas = () => {
  return JSON.parse(localStorage.getItem("tarefas")) || [];
};

describe("Code Review PR #2 — Estado do Formulário (F05 e F06)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 4, 12, 0, 0));
    vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("F05 — Sincronização do formulário durante alteração de status em massa", () => {
    it("1. não deve reverter o status para TODO nem duplicar sucessora ao salvar formulário aberto antes de conclusão em massa", async () => {
      await carregarAplicacao();

      // 1. Criar tarefa recorrente com status TODO
      preencherFormulario({
        nome: "Fechamento diário",
        descricao: "Conferir caixa",
        dataTermino: "2026-11-10",
        prioridade: "1",
        categoria: "Financeiro",
        status: "TODO",
        recorrencia: "DIARIA",
      });
      submeterFormulario();

      // 2. Abrir a tarefa (ID 1) para edição no formulário
      document.querySelector('.btn-edit[data-id="1"]').click();
      expect(document.getElementById("status").value).toBe("TODO");

      // Usuário altera apenas o título no formulário aberto
      document.getElementById("nome").value = "Fechamento diário (revisado)";

      // 3 e 4. Selecionar essa mesma ocorrência no cartão e alterar seu status para DONE em massa
      document.querySelector('.task-checkbox[data-id="1"]').checked = true;
      document.getElementById("status-multiplo").value = "DONE";
      document.getElementById("btn-status-multiplo").click();

      // 5. Confirmar geração de uma única sucessora imediatamente após a ação em massa
      let tarefas = obterTarefasSalvas();
      expect(tarefas).toHaveLength(2);
      expect(tarefas[0]).toMatchObject({
        id: 1,
        status: "DONE",
        sucessoraGerada: true,
      });
      expect(tarefas[1]).toMatchObject({
        id: 2,
        status: "TODO",
        dataTermino: "2026-11-11",
        sucessoraGerada: false,
      });

      // O select #status do formulário em edição deve ter sido sincronizado com DONE
      expect(document.getElementById("status").value).toBe("DONE");

      // 6. Salvar o formulário que havia sido aberto antes da operação em massa
      submeterFormulario();

      tarefas = obterTarefasSalvas();
      // Nenhuma sucessora duplicada deve ser gerada (permanecem 2 tarefas)
      expect(tarefas).toHaveLength(2);
      // A ocorrência original deve permanecer DONE (não voltar silenciosamente para TODO) e com sucessoraGerada: true
      expect(tarefas[0]).toEqual({
        id: 1,
        nome: "Fechamento diário (revisado)",
        descricao: "Conferir caixa",
        dataTermino: "2026-11-10",
        prioridade: 1,
        categoria: "Financeiro",
        status: "DONE",
        recorrencia: "DIARIA",
        diaBaseRecorrencia: null,
        sucessoraGerada: true,
      });
      // A sucessora já criada deve permanecer intacta
      expect(tarefas[1]).toEqual({
        id: 2,
        nome: "Fechamento diário",
        descricao: "Conferir caixa",
        dataTermino: "2026-11-11",
        prioridade: 1,
        categoria: "Financeiro",
        status: "TODO",
        recorrencia: "DIARIA",
        diaBaseRecorrencia: null,
        sucessoraGerada: false,
      });
    });

    it("2. não deve alterar o campo de status do formulário em edição quando a ação em massa afetar apenas outras tarefas", async () => {
      await carregarAplicacao([
        {
          id: 1,
          nome: "Tarefa em edição",
          descricao: "Permanece TODO",
          dataTermino: "2026-11-10",
          prioridade: 1,
          categoria: "Geral",
          status: "TODO",
          recorrencia: "DIARIA",
          diaBaseRecorrencia: null,
          sucessoraGerada: false,
        },
        {
          id: 2,
          nome: "Outra tarefa",
          descricao: "Será concluída em massa",
          dataTermino: "2026-11-10",
          prioridade: 2,
          categoria: "Geral",
          status: "TODO",
          recorrencia: "NENHUMA",
          diaBaseRecorrencia: null,
          sucessoraGerada: false,
        },
      ]);

      // Abrir tarefa 1 para edição
      document.querySelector('.btn-edit[data-id="1"]').click();
      expect(document.getElementById("status").value).toBe("TODO");

      // Concluir em massa apenas a tarefa 2
      document.querySelector('.task-checkbox[data-id="2"]').checked = true;
      document.getElementById("status-multiplo").value = "DONE";
      document.getElementById("btn-status-multiplo").click();

      // O formulário da tarefa 1 deve manter seu status TODO intacto
      expect(document.getElementById("status").value).toBe("TODO");
    });
  });

  describe("F06 — Eliminação da duplicação de restaurarFormularioPadrao no reset", () => {
    it("3. deve executar a restauração do formulário exatamente uma única vez ao clicar no botão Limpar", async () => {
      await carregarAplicacao([
        {
          id: 1,
          nome: "Tarefa recorrente",
          descricao: "Em edição",
          dataTermino: "2026-11-20",
          prioridade: 1,
          categoria: "Dev",
          status: "TODO",
          recorrencia: "MENSAL",
          diaBaseRecorrencia: 20,
          sucessoraGerada: false,
        },
      ]);

      document.querySelector('.btn-edit[data-id="1"]').click();

      const botaoSubmit = document.querySelector(
        '#form-tarefa button[type="submit"]'
      );
      const botaoLimpar = document.querySelector(
        '#form-tarefa button[type="reset"]'
      );
      const selectRecorrencia = document.getElementById("recorrencia");
      const inputDataTermino = document.getElementById("data-termino");

      const spyTextoBotaoSubmit = vi.spyOn(botaoSubmit, "textContent", "set");

      botaoLimpar.click();

      // Instrumentação: deve ter atribuído botaoSubmit.textContent apenas 1 vez (e não 2 vezes)
      expect(spyTextoBotaoSubmit).toHaveBeenCalledTimes(1);
      expect(botaoSubmit.textContent).toBe("Criar tarefa");
      expect(selectRecorrencia.value).toBe("NENHUMA");
      expect(inputDataTermino.required).toBe(false);

      // Nenhuma tarefa persistida deve ter sido alterada pelo reset
      const tarefasSalvas = obterTarefasSalvas();
      expect(tarefasSalvas).toHaveLength(1);
      expect(tarefasSalvas[0].recorrencia).toBe("MENSAL");
    });

    it("4. deve restaurar recorrência NENHUMA, obrigatoriedade da data e modo de criação em reset programático (formulario.reset()) após restauração nativa", async () => {
      await carregarAplicacao([
        {
          id: 1,
          nome: "Tarefa semanal",
          descricao: "Teste reset programático",
          dataTermino: "2026-11-15",
          prioridade: 2,
          categoria: "Infra",
          status: "DOING",
          recorrencia: "SEMANAL",
          diaBaseRecorrencia: null,
          sucessoraGerada: false,
        },
      ]);

      document.querySelector('.btn-edit[data-id="1"]').click();

      const formulario = document.getElementById("form-tarefa");
      const botaoSubmit = document.querySelector(
        '#form-tarefa button[type="submit"]'
      );
      const selectRecorrencia = document.getElementById("recorrencia");
      const inputDataTermino = document.getElementById("data-termino");

      // Simula opção MENSAL marcada como defaultSelected no HTML para provar que a sincronização ocorre também após o reset nativo
      selectRecorrencia.querySelector(
        'option[value="MENSAL"]'
      ).defaultSelected = true;

      formulario.reset();
      await Promise.resolve();

      expect(selectRecorrencia.value).toBe("NENHUMA");
      expect(inputDataTermino.required).toBe(false);
      expect(botaoSubmit.textContent).toBe("Criar tarefa");

      // Submeter nova tarefa após reset deve criar registro novo (id: 2) sem sobrescrever id: 1
      preencherFormulario({
        nome: "Nova tarefa após reset programático",
        dataTermino: "",
        prioridade: "3",
        categoria: "Teste",
        status: "TODO",
        recorrencia: "NENHUMA",
      });
      submeterFormulario();

      const tarefas = obterTarefasSalvas();
      expect(tarefas).toHaveLength(2);
      expect(tarefas[0].nome).toBe("Tarefa semanal");
      expect(tarefas[1].nome).toBe("Nova tarefa após reset programático");
    });

    it("5. deve preservar a obrigatoriedade dinâmica após reset e o fluxo normal de criação e edição (regressão)", async () => {
      await carregarAplicacao();

      const formulario = document.getElementById("form-tarefa");
      const selectRecorrencia = document.getElementById("recorrencia");
      const inputDataTermino = document.getElementById("data-termino");

      // Seleciona recorrência, faz reset e verifica que a alternância dinâmica continua funcionando após o reset
      selectRecorrencia.value = "DIARIA";
      selectRecorrencia.dispatchEvent(new Event("change", { bubbles: true }));
      expect(inputDataTermino.required).toBe(true);

      formulario.reset();
      await Promise.resolve();
      expect(selectRecorrencia.value).toBe("NENHUMA");
      expect(inputDataTermino.required).toBe(false);

      selectRecorrencia.value = "MENSAL";
      selectRecorrencia.dispatchEvent(new Event("change", { bubbles: true }));
      expect(inputDataTermino.required).toBe(true);

      // Fluxo normal de criação e posterior edição
      preencherFormulario({
        nome: "Tarefa mensal criada após reset",
        descricao: "Fluxo normal",
        dataTermino: "2026-01-31",
        prioridade: "1",
        categoria: "Finanças",
        status: "TODO",
        recorrencia: "MENSAL",
      });
      submeterFormulario();

      let tarefas = obterTarefasSalvas();
      expect(tarefas).toHaveLength(1);
      expect(tarefas[0]).toMatchObject({
        id: 1,
        nome: "Tarefa mensal criada após reset",
        recorrencia: "MENSAL",
        diaBaseRecorrencia: 31,
        status: "TODO",
      });

      // Edição normal
      document.querySelector('.btn-edit[data-id="1"]').click();
      document.getElementById("nome").value = "Tarefa mensal editada";
      document.getElementById("status").value = "DOING";
      submeterFormulario();

      tarefas = obterTarefasSalvas();
      expect(tarefas).toHaveLength(1);
      expect(tarefas[0]).toMatchObject({
        id: 1,
        nome: "Tarefa mensal editada",
        recorrencia: "MENSAL",
        diaBaseRecorrencia: 31,
        status: "DOING",
        sucessoraGerada: false,
      });
    });
  });
});
