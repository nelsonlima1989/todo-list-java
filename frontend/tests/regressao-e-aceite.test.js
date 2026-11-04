import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const htmlIndice = readFileSync(resolve(process.cwd(), "index.html"), "utf-8");

const carregarAplicacao = async (tarefasIniciais = null) => {
  if (tarefasIniciais !== undefined && tarefasIniciais !== null) {
    localStorage.clear();
    localStorage.setItem("tarefas", JSON.stringify(tarefasIniciais));
  } else if (tarefasIniciais === null) {
    localStorage.clear();
  }

  document.documentElement.innerHTML = htmlIndice;

  vi.resetModules();
  await import("../js/script.js");
};

const recarregarSessaoNavegador = async () => {
  document.documentElement.innerHTML = htmlIndice;
  vi.resetModules();
  await import("../js/script.js");
};

const preencherFormulario = ({
  nome = "Tarefa teste",
  descricao = "Descrição teste",
  dataTermino = "2026-11-10",
  prioridade = "1",
  categoria = "Geral",
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

const selecionarFiltroStatus = (status) => {
  const filtro = document.getElementById("filtro-status");
  filtro.value = status;
  filtro.dispatchEvent(new Event("change", { bubbles: true }));
};

const obterTarefasSalvas = () => {
  return JSON.parse(localStorage.getItem("tarefas")) || [];
};

describe("T06 — Testes de Regressão e Aceite Integrado (CA01 a CA11)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 4, 12, 0, 0)); // 2026-11-04
    vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Regressão das funcionalidades originais do ToDo List", () => {
    it("1. deve criar tarefa avulsa e renderizar estrutura completa do cartão (.task-card)", async () => {
      await carregarAplicacao(null);

      preencherFormulario({
        nome: "Implementar layout responsivo",
        descricao: "Ajustar breakpoints de 900px e 600px",
        dataTermino: "2026-11-20",
        prioridade: "2",
        categoria: "Frontend",
        status: "DOING",
      });
      submeterFormulario();

      const cartao = document.querySelector(".task-card");
      expect(cartao).not.toBeNull();
      expect(cartao.querySelector(".task-priority").textContent.trim()).toBe(
        "PRIORIDADE 2"
      );
      expect(cartao.querySelector(".task-header h3").textContent.trim()).toBe(
        "Implementar layout responsivo"
      );
      expect(
        cartao.querySelector(".task-status.status-doing").textContent.trim()
      ).toBe("DOING");
      expect(cartao.querySelector(".task-content p").textContent.trim()).toBe(
        "Ajustar breakpoints de 900px e 600px"
      );
      expect(cartao.querySelector(".task-information").textContent).toContain(
        "📁 Categoria: Frontend"
      );
      expect(cartao.querySelector(".task-information").textContent).toContain(
        "📅 Data: 2026-11-20"
      );
      expect(cartao.querySelector(".task-recurrence")).toBeNull();
    });

    it("2. deve listar múltiplas tarefas e calcular proximoId a partir do maior ID existente", async () => {
      await carregarAplicacao([
        {
          id: 5,
          nome: "Tarefa ID 5",
          descricao: "Primeira",
          dataTermino: "2026-11-10",
          prioridade: 1,
          categoria: "Backlog",
          status: "TODO",
        },
        {
          id: 12,
          nome: "Tarefa ID 12",
          descricao: "Segunda",
          dataTermino: "2026-11-11",
          prioridade: 3,
          categoria: "Backlog",
          status: "DONE",
        },
      ]);

      expect(document.querySelectorAll(".task-card")).toHaveLength(2);

      preencherFormulario({
        nome: "Nova tarefa sequencial",
        prioridade: "4",
      });
      submeterFormulario();

      const tarefas = obterTarefasSalvas();
      expect(tarefas).toHaveLength(3);
      expect(tarefas[2].id).toBe(13);
    });

    it("3. deve editar todos os atributos de uma tarefa avulsa existente e restaurar o botão para 'Criar tarefa'", async () => {
      await carregarAplicacao([
        {
          id: 1,
          nome: "Rascunho inicial",
          descricao: "Descrição antiga",
          dataTermino: "2026-11-10",
          prioridade: 5,
          categoria: "Ideias",
          status: "TODO",
        },
      ]);

      const botaoSubmit = document.querySelector(
        '#form-tarefa button[type="submit"]'
      );

      document.querySelector('.btn-edit[data-id="1"]').click();
      expect(botaoSubmit.textContent.trim()).toBe("Salvar tarefa");

      preencherFormulario({
        nome: "Especificação finalizada",
        descricao: "Descrição revisada",
        dataTermino: "2026-11-25",
        prioridade: "1",
        categoria: "Arquitetura",
        status: "DOING",
        recorrencia: "NENHUMA",
      });
      submeterFormulario();

      expect(botaoSubmit.textContent.trim()).toBe("Criar tarefa");

      const tarefas = obterTarefasSalvas();
      expect(tarefas).toHaveLength(1);
      expect(tarefas[0]).toMatchObject({
        id: 1,
        nome: "Especificação finalizada",
        descricao: "Descrição revisada",
        dataTermino: "2026-11-25",
        prioridade: 1,
        categoria: "Arquitetura",
        status: "DOING",
        recorrencia: "NENHUMA",
      });
    });

    it("4. deve excluir uma tarefa avulsa e atualizar a listagem, o dashboard e o localStorage", async () => {
      await carregarAplicacao([
        {
          id: 1,
          nome: "Tarefa 1",
          descricao: "Manter",
          dataTermino: "2026-11-10",
          prioridade: 1,
          categoria: "Geral",
          status: "TODO",
        },
        {
          id: 2,
          nome: "Tarefa 2",
          descricao: "Remover",
          dataTermino: "2026-11-11",
          prioridade: 2,
          categoria: "Geral",
          status: "DONE",
        },
      ]);

      document.querySelector('.btn-delete[data-id="2"]').click();

      const tarefas = obterTarefasSalvas();
      expect(tarefas).toHaveLength(1);
      expect(tarefas[0].id).toBe(1);
      expect(document.querySelectorAll(".task-card")).toHaveLength(1);
      expect(document.getElementById("total-tarefas").textContent).toBe("1");
      expect(document.getElementById("tarefas-done").textContent).toBe("0");
    });

    it("5. deve bloquear a exclusão da tarefa que está em edição exibindo alerta, permitindo excluir outra tarefa não editada", async () => {
      await carregarAplicacao([
        {
          id: 1,
          nome: "Em edição",
          descricao: "Não pode ser excluída agora",
          dataTermino: "2026-11-10",
          prioridade: 1,
          categoria: "Geral",
          status: "TODO",
        },
        {
          id: 2,
          nome: "Outra tarefa",
          descricao: "Pode ser excluída",
          dataTermino: "2026-11-11",
          prioridade: 2,
          categoria: "Geral",
          status: "TODO",
        },
      ]);

      document.querySelector('.btn-edit[data-id="1"]').click();
      document.querySelector('.btn-delete[data-id="1"]').click();

      expect(window.alert).toHaveBeenCalledWith(
        "Não é possível excluir uma tarefa durante a edição da mesma!"
      );
      expect(obterTarefasSalvas()).toHaveLength(2);

      // Excluir a tarefa 2 (que não está em edição) deve funcionar normalmente
      document.querySelector('.btn-delete[data-id="2"]').click();
      expect(obterTarefasSalvas()).toHaveLength(1);
      expect(obterTarefasSalvas()[0].id).toBe(1);
    });

    it("6. deve renderizar o estado vazio (.empty-state) quando não há tarefas ou quando o filtro não encontra correspondências", async () => {
      await carregarAplicacao(null);

      const estadoVazioInicial = document.querySelector(
        "#lista-tarefas .empty-state"
      );
      expect(estadoVazioInicial).not.toBeNull();
      expect(estadoVazioInicial.querySelector("h3").textContent.trim()).toBe(
        "Nenhuma tarefa encontrada"
      );

      preencherFormulario({
        nome: "Apenas TODO",
        status: "TODO",
      });
      submeterFormulario();

      expect(document.querySelector("#lista-tarefas .empty-state")).toBeNull();

      selecionarFiltroStatus("DOING");
      expect(
        document.querySelector("#lista-tarefas .empty-state")
      ).not.toBeNull();
    });

    it("7. deve alterar o status em massa apenas das tarefas avulsas selecionadas via checkbox", async () => {
      await carregarAplicacao([
        {
          id: 1,
          nome: "Selecionada 1",
          descricao: "",
          dataTermino: "2026-11-10",
          prioridade: 1,
          categoria: "Dev",
          status: "TODO",
        },
        {
          id: 2,
          nome: "Não selecionada",
          descricao: "",
          dataTermino: "2026-11-10",
          prioridade: 2,
          categoria: "Dev",
          status: "TODO",
        },
        {
          id: 3,
          nome: "Selecionada 2",
          descricao: "",
          dataTermino: "2026-11-10",
          prioridade: 3,
          categoria: "Dev",
          status: "DOING",
        },
      ]);

      document.querySelector('.task-checkbox[data-id="1"]').checked = true;
      document.querySelector('.task-checkbox[data-id="3"]').checked = true;

      document.getElementById("status-multiplo").value = "DONE";
      document.getElementById("btn-status-multiplo").click();

      const tarefas = obterTarefasSalvas();
      expect(tarefas).toHaveLength(3);
      expect(tarefas[0].status).toBe("DONE");
      expect(tarefas[1].status).toBe("TODO");
      expect(tarefas[2].status).toBe("DONE");
    });

    it("8. deve atualizar os contadores do dashboard e filtrar corretamente durante ciclo completo de CRUD", async () => {
      await carregarAplicacao(null);

      expect(document.getElementById("total-tarefas").textContent).toBe("0");

      preencherFormulario({ nome: "T1", status: "TODO" });
      submeterFormulario();
      preencherFormulario({ nome: "T2", status: "DOING" });
      submeterFormulario();
      preencherFormulario({ nome: "T3", status: "DONE" });
      submeterFormulario();

      expect(document.getElementById("total-tarefas").textContent).toBe("3");
      expect(document.getElementById("tarefas-todo").textContent).toBe("1");
      expect(document.getElementById("tarefas-doing").textContent).toBe("1");
      expect(document.getElementById("tarefas-done").textContent).toBe("1");

      selecionarFiltroStatus("DONE");
      expect(document.querySelectorAll(".task-card")).toHaveLength(1);

      // Mesmo com filtro DONE ativo, os contadores globais do dashboard permanecem exatos
      expect(document.getElementById("total-tarefas").textContent).toBe("3");
      expect(document.getElementById("tarefas-todo").textContent).toBe("1");
    });

    it("9. deve persistir e restaurar tarefas ao simular recarregamento completo da página pelo localStorage", async () => {
      await carregarAplicacao(null);

      preencherFormulario({
        nome: "Tarefa persistida",
        descricao: "Deve sobreviver ao reload",
        dataTermino: "2026-12-01",
        prioridade: "1",
        categoria: "Persistência",
        status: "TODO",
        recorrencia: "SEMANAL",
      });
      submeterFormulario();

      // Simula recarregamento da página sem limpar o localStorage
      await recarregarSessaoNavegador();

      expect(document.querySelectorAll(".task-card")).toHaveLength(1);
      expect(
        document.querySelector(".task-card h3").textContent.trim()
      ).toBe("Tarefa persistida");
      expect(
        document.querySelector(".task-card .task-recurrence").textContent.trim()
      ).toBe("🔁 Recorrência: Semanal");
      expect(document.getElementById("total-tarefas").textContent).toBe("1");
    });

    it("10. deve carregar, editar e concluir em massa tarefas legadas sem campos de recorrência sem gerar sucessoras indevidas (CA11)", async () => {
      await carregarAplicacao([
        {
          id: 1,
          nome: "Legada 1",
          descricao: "Sem campos novos",
          dataTermino: "2026-11-10",
          prioridade: 2,
          categoria: "Antiga",
          status: "TODO",
        },
        {
          id: 2,
          nome: "Legada 2",
          descricao: "Sem campos novos",
          dataTermino: "2026-11-12",
          prioridade: 3,
          categoria: "Antiga",
          status: "DOING",
        },
      ]);

      // Concluir ambas em massa para DONE
      document
        .querySelectorAll(".task-checkbox")
        .forEach((cb) => (cb.checked = true));
      document.getElementById("status-multiplo").value = "DONE";
      document.getElementById("btn-status-multiplo").click();

      const tarefas = obterTarefasSalvas();
      expect(tarefas).toHaveLength(2);
      expect(tarefas[0]).toEqual({
        id: 1,
        nome: "Legada 1",
        descricao: "Sem campos novos",
        dataTermino: "2026-11-10",
        prioridade: 2,
        categoria: "Antiga",
        status: "DONE",
        recorrencia: "NENHUMA",
        diaBaseRecorrencia: null,
        sucessoraGerada: false,
      });
      expect(tarefas[1]).toEqual({
        id: 2,
        nome: "Legada 2",
        descricao: "Sem campos novos",
        dataTermino: "2026-11-12",
        prioridade: 3,
        categoria: "Antiga",
        status: "DONE",
        recorrencia: "NENHUMA",
        diaBaseRecorrencia: null,
        sucessoraGerada: false,
      });
    });

    it("11. deve cancelar a edição ao clicar em Limpar e criar uma nova tarefa na submissão seguinte sem sobrescrever a anterior", async () => {
      await carregarAplicacao([
        {
          id: 1,
          nome: "Tarefa original intacta",
          descricao: "Não deve ser sobrescrita",
          dataTermino: "2026-11-10",
          prioridade: 1,
          categoria: "Segurança",
          status: "TODO",
        },
      ]);

      document.querySelector('.btn-edit[data-id="1"]').click();
      document.getElementById("nome").value = "Alteração descartada";

      // Clicar em Limpar cancela editandoPorId
      document.querySelector('#form-tarefa button[type="reset"]').click();

      preencherFormulario({
        nome: "Segunda tarefa independente",
        descricao: "Criada após limpar",
        dataTermino: "2026-11-15",
        prioridade: "2",
        categoria: "Nova",
        status: "TODO",
      });
      submeterFormulario();

      const tarefas = obterTarefasSalvas();
      expect(tarefas).toHaveLength(2);
      expect(tarefas[0].nome).toBe("Tarefa original intacta");
      expect(tarefas[1].nome).toBe("Segunda tarefa independente");
    });
  });

  describe("Cenários integrados ponta a ponta dos Critérios de Aceite (CA01 a CA11)", () => {
    it("12. deve cumprir integralmente o fluxo ponta a ponta de CA01 (criar tarefa após reset sem mexer em recorrência, concluir para DONE, não exibir badge e não gerar sucessora)", async () => {
      await carregarAplicacao(null);

      document.querySelector('#form-tarefa button[type="reset"]').click();

      document.getElementById("nome").value = "Tarefa padrão CA01";
      document.getElementById("descricao").value = "Sem tocar no select de recorrência";
      document.getElementById("data-termino").value = "2026-11-10";
      document.getElementById("prioridade").value = "1";
      document.getElementById("categoria").value = "Geral";
      document.getElementById("status").value = "TODO";
      submeterFormulario();

      expect(document.querySelector(".task-card .task-recurrence")).toBeNull();

      // Concluir via edição
      document.querySelector('.btn-edit[data-id="1"]').click();
      document.getElementById("status").value = "DONE";
      submeterFormulario();

      const tarefas = obterTarefasSalvas();
      expect(tarefas).toHaveLength(1);
      expect(tarefas[0]).toMatchObject({
        id: 1,
        status: "DONE",
        recorrencia: "NENHUMA",
        diaBaseRecorrencia: null,
        sucessoraGerada: false,
      });
      expect(document.querySelector(".task-card .task-recurrence")).toBeNull();
    });

    it("13. deve manter consistência ponta a ponta entre recorrência atrasada (CA04), série mensal (CA05), persistência em reload e filtros/dashboard (CA10)", async () => {
      // Hoje simulado: 2026-03-15
      vi.setSystemTime(new Date(2026, 2, 15, 12, 0, 0));

      await carregarAplicacao([
        {
          id: 1,
          nome: "Mensal atrasada de 31/01",
          descricao: "Ao concluir em 15/03, 28/02 já passou, deve ir para 31/03",
          dataTermino: "2026-01-31",
          prioridade: 1,
          categoria: "Finanças",
          status: "TODO",
          recorrencia: "MENSAL",
          diaBaseRecorrencia: 31,
          sucessoraGerada: false,
        },
      ]);

      // Concluir em massa
      document.querySelector('.task-checkbox[data-id="1"]').checked = true;
      document.getElementById("status-multiplo").value = "DONE";
      document.getElementById("btn-status-multiplo").click();

      // Recarregar a aplicação do localStorage para validar persistência integral
      await recarregarSessaoNavegador();

      const tarefas = obterTarefasSalvas();
      expect(tarefas).toHaveLength(2);
      expect(tarefas[0]).toMatchObject({
        id: 1,
        status: "DONE",
        dataTermino: "2026-01-31",
        diaBaseRecorrencia: 31,
        sucessoraGerada: true,
      });
      expect(tarefas[1]).toMatchObject({
        id: 2,
        status: "TODO",
        dataTermino: "2026-03-31",
        diaBaseRecorrencia: 31,
        sucessoraGerada: false,
      });

      expect(document.getElementById("total-tarefas").textContent).toBe("2");
      expect(document.getElementById("tarefas-done").textContent).toBe("1");
      expect(document.getElementById("tarefas-todo").textContent).toBe("1");

      selecionarFiltroStatus("TODO");
      const cartoesTodo = document.querySelectorAll(".task-card");
      expect(cartoesTodo).toHaveLength(1);
      expect(cartoesTodo[0].querySelector(".task-information").textContent).toContain(
        "📅 Data: 2026-03-31"
      );
      expect(
        cartoesTodo[0].querySelector(".task-recurrence").textContent.trim()
      ).toBe("🔁 Recorrência: Mensal");
    });
  });
});
