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

const selecionarFiltroStatus = (status) => {
  const filtro = document.getElementById("filtro-status");
  filtro.value = status;
  filtro.dispatchEvent(new Event("change", { bubbles: true }));
};

const submeterFormulario = () => {
  const formulario = document.getElementById("form-tarefa");
  formulario.dispatchEvent(
    new Event("submit", { bubbles: true, cancelable: true })
  );
};

describe("T05 — Indicadores de recorrência nos cartões, filtros por status e dashboard", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 4, 12, 0, 0));
    vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("1. deve exibir o indicador '.task-recurrence' com 'Diária' em tarefa com recorrência DIARIA", async () => {
    await carregarAplicacao([
      {
        id: 1,
        nome: "Daily Scrum",
        descricao: "Alinhamento diário",
        dataTermino: "2026-11-10",
        prioridade: 1,
        categoria: "Agile",
        status: "TODO",
        recorrencia: "DIARIA",
        diaBaseRecorrencia: null,
        sucessoraGerada: false,
      },
    ]);

    const indicador = document.querySelector(".task-card .task-recurrence");
    expect(indicador).not.toBeNull();
    expect(indicador.textContent.trim()).toBe("🔁 Recorrência: Diária");
  });

  it("2. deve exibir o indicador '.task-recurrence' com 'Semanal' em tarefa com recorrência SEMANAL", async () => {
    await carregarAplicacao([
      {
        id: 1,
        nome: "Revisão de código semanal",
        descricao: "Arquitetura",
        dataTermino: "2026-11-12",
        prioridade: 2,
        categoria: "Engenharia",
        status: "DOING",
        recorrencia: "SEMANAL",
        diaBaseRecorrencia: null,
        sucessoraGerada: false,
      },
    ]);

    const indicador = document.querySelector(".task-card .task-recurrence");
    expect(indicador).not.toBeNull();
    expect(indicador.textContent.trim()).toBe("🔁 Recorrência: Semanal");
  });

  it("3. deve exibir o indicador '.task-recurrence' com 'Mensal' em tarefa com recorrência MENSAL", async () => {
    await carregarAplicacao([
      {
        id: 1,
        nome: "Fechamento de folha",
        descricao: "Contabilidade mensal",
        dataTermino: "2026-11-30",
        prioridade: 1,
        categoria: "RH",
        status: "TODO",
        recorrencia: "MENSAL",
        diaBaseRecorrencia: 30,
        sucessoraGerada: false,
      },
    ]);

    const indicador = document.querySelector(".task-card .task-recurrence");
    expect(indicador).not.toBeNull();
    expect(indicador.textContent.trim()).toBe("🔁 Recorrência: Mensal");
  });

  it("4. não deve exibir indicador '.task-recurrence' em tarefa avulsa com recorrência NENHUMA (CA01)", async () => {
    await carregarAplicacao([
      {
        id: 1,
        nome: "Comprar monitor",
        descricao: "Compra única",
        dataTermino: "2026-11-20",
        prioridade: 3,
        categoria: "Equipamentos",
        status: "TODO",
        recorrencia: "NENHUMA",
        diaBaseRecorrencia: null,
        sucessoraGerada: false,
      },
    ]);

    const cartao = document.querySelector(".task-card");
    expect(cartao).not.toBeNull();
    expect(cartao.querySelector(".task-recurrence")).toBeNull();
  });

  it("5. não deve exibir indicador '.task-recurrence' em tarefa legada sem propriedade recorrencia ou com valor inválido", async () => {
    await carregarAplicacao([
      {
        id: 1,
        nome: "Tarefa antiga sem campo",
        descricao: "Persistida antes da feature",
        dataTermino: "2026-11-15",
        prioridade: 2,
        categoria: "Legado",
        status: "TODO",
      },
      {
        id: 2,
        nome: "Tarefa com valor arbitrário",
        descricao: "Valor inválido no storage",
        dataTermino: "2026-11-15",
        prioridade: 2,
        categoria: "Segurança",
        status: "TODO",
        recorrencia: "<img src=x onerror=alert(1)>",
      },
    ]);

    const cartoes = document.querySelectorAll(".task-card");
    expect(cartoes).toHaveLength(2);
    expect(document.querySelectorAll(".task-recurrence")).toHaveLength(0);
  });

  it("6. deve contabilizar corretamente original DONE e sucessora TODO nos contadores do dashboard", async () => {
    await carregarAplicacao([
      {
        id: 1,
        nome: "Backup concluído",
        descricao: "Ocorrência 1",
        dataTermino: "2026-11-10",
        prioridade: 1,
        categoria: "Infra",
        status: "DONE",
        recorrencia: "DIARIA",
        diaBaseRecorrencia: null,
        sucessoraGerada: true,
      },
      {
        id: 2,
        nome: "Backup concluído",
        descricao: "Ocorrência 2",
        dataTermino: "2026-11-11",
        prioridade: 1,
        categoria: "Infra",
        status: "TODO",
        recorrencia: "DIARIA",
        diaBaseRecorrencia: null,
        sucessoraGerada: false,
      },
    ]);

    expect(document.getElementById("total-tarefas").textContent).toBe("2");
    expect(document.getElementById("tarefas-todo").textContent).toBe("1");
    expect(document.getElementById("tarefas-doing").textContent).toBe("0");
    expect(document.getElementById("tarefas-done").textContent).toBe("1");
  });

  it("7. deve exibir todas as ocorrências quando o filtro TODOS estiver selecionado", async () => {
    await carregarAplicacao([
      {
        id: 1,
        nome: "Tarefa TODO",
        descricao: "",
        dataTermino: "2026-11-10",
        prioridade: 1,
        categoria: "Geral",
        status: "TODO",
        recorrencia: "DIARIA",
      },
      {
        id: 2,
        nome: "Tarefa DOING",
        descricao: "",
        dataTermino: "2026-11-11",
        prioridade: 2,
        categoria: "Geral",
        status: "DOING",
        recorrencia: "SEMANAL",
      },
      {
        id: 3,
        nome: "Tarefa DONE",
        descricao: "",
        dataTermino: "2026-11-12",
        prioridade: 3,
        categoria: "Geral",
        status: "DONE",
        recorrencia: "NENHUMA",
      },
    ]);

    selecionarFiltroStatus("TODOS");

    const cartoes = document.querySelectorAll(".task-card");
    expect(cartoes).toHaveLength(3);
    expect(document.querySelectorAll(".task-recurrence")).toHaveLength(2);
  });

  it("8. deve exibir somente tarefas pendentes quando o filtro TODO estiver selecionado", async () => {
    await carregarAplicacao([
      {
        id: 1,
        nome: "Ocorrência concluída",
        descricao: "",
        dataTermino: "2026-11-10",
        prioridade: 1,
        categoria: "Infra",
        status: "DONE",
        recorrencia: "DIARIA",
        sucessoraGerada: true,
      },
      {
        id: 2,
        nome: "Sucessora pendente",
        descricao: "",
        dataTermino: "2026-11-11",
        prioridade: 1,
        categoria: "Infra",
        status: "TODO",
        recorrencia: "DIARIA",
        sucessoraGerada: false,
      },
      {
        id: 3,
        nome: "Em andamento",
        descricao: "",
        dataTermino: "2026-11-12",
        prioridade: 2,
        categoria: "Infra",
        status: "DOING",
        recorrencia: "NENHUMA",
      },
    ]);

    selecionarFiltroStatus("TODO");

    const cartoes = document.querySelectorAll(".task-card");
    expect(cartoes).toHaveLength(1);
    expect(cartoes[0].querySelector("h3").textContent).toBe(
      "Sucessora pendente"
    );
    expect(
      cartoes[0].querySelector(".task-recurrence").textContent.trim()
    ).toBe("🔁 Recorrência: Diária");
  });

  it("9. deve exibir somente tarefas em andamento quando o filtro DOING estiver selecionado", async () => {
    await carregarAplicacao([
      {
        id: 1,
        nome: "Tarefa pendente",
        descricao: "",
        dataTermino: "2026-11-10",
        prioridade: 1,
        categoria: "Dev",
        status: "TODO",
        recorrencia: "DIARIA",
      },
      {
        id: 2,
        nome: "Tarefa em execução",
        descricao: "",
        dataTermino: "2026-11-15",
        prioridade: 2,
        categoria: "Dev",
        status: "DOING",
        recorrencia: "SEMANAL",
      },
    ]);

    selecionarFiltroStatus("DOING");

    const cartoes = document.querySelectorAll(".task-card");
    expect(cartoes).toHaveLength(1);
    expect(cartoes[0].querySelector("h3").textContent).toBe(
      "Tarefa em execução"
    );
    expect(
      cartoes[0].querySelector(".task-recurrence").textContent.trim()
    ).toBe("🔁 Recorrência: Semanal");
  });

  it("10. deve exibir somente tarefas concluídas quando o filtro DONE estiver selecionado", async () => {
    await carregarAplicacao([
      {
        id: 1,
        nome: "Mensal concluída",
        descricao: "",
        dataTermino: "2026-01-31",
        prioridade: 1,
        categoria: "Finanças",
        status: "DONE",
        recorrencia: "MENSAL",
        diaBaseRecorrencia: 31,
        sucessoraGerada: true,
      },
      {
        id: 2,
        nome: "Mensal sucessora",
        descricao: "",
        dataTermino: "2026-02-28",
        prioridade: 1,
        categoria: "Finanças",
        status: "TODO",
        recorrencia: "MENSAL",
        diaBaseRecorrencia: 31,
        sucessoraGerada: false,
      },
    ]);

    selecionarFiltroStatus("DONE");

    const cartoes = document.querySelectorAll(".task-card");
    expect(cartoes).toHaveLength(1);
    expect(cartoes[0].querySelector("h3").textContent).toBe(
      "Mensal concluída"
    );
    expect(
      cartoes[0].querySelector(".task-recurrence").textContent.trim()
    ).toBe("🔁 Recorrência: Mensal");
  });

  it("11. não deve alterar os registros no localStorage ao alternar entre os filtros de status", async () => {
    const tarefasIniciais = [
      {
        id: 1,
        nome: "Tarefa 1",
        descricao: "Desc 1",
        dataTermino: "2026-11-10",
        prioridade: 1,
        categoria: "Cat 1",
        status: "TODO",
        recorrencia: "DIARIA",
        diaBaseRecorrencia: null,
        sucessoraGerada: false,
      },
      {
        id: 2,
        nome: "Tarefa 2",
        descricao: "Desc 2",
        dataTermino: "2026-11-12",
        prioridade: 2,
        categoria: "Cat 2",
        status: "DONE",
        recorrencia: "SEMANAL",
        diaBaseRecorrencia: null,
        sucessoraGerada: true,
      },
    ];

    await carregarAplicacao(tarefasIniciais);
    const snapshotAntes = localStorage.getItem("tarefas");

    selecionarFiltroStatus("TODO");
    selecionarFiltroStatus("DOING");
    selecionarFiltroStatus("DONE");
    selecionarFiltroStatus("TODOS");

    expect(localStorage.getItem("tarefas")).toBe(snapshotAntes);
    expect(JSON.parse(localStorage.getItem("tarefas"))).toEqual(
      tarefasIniciais
    );
  });

  it("12. deve atualizar contadores, lista e indicadores visuais de forma coerente ao gerar uma sucessora", async () => {
    await carregarAplicacao([
      {
        id: 1,
        nome: "Pagamento mensal",
        descricao: "Internet fibra",
        dataTermino: "2026-11-15",
        prioridade: 1,
        categoria: "Contas",
        status: "TODO",
        recorrencia: "MENSAL",
        diaBaseRecorrencia: 15,
        sucessoraGerada: false,
      },
    ]);

    expect(document.getElementById("total-tarefas").textContent).toBe("1");
    expect(document.getElementById("tarefas-todo").textContent).toBe("1");
    expect(document.getElementById("tarefas-done").textContent).toBe("0");

    // Concluir via edição no formulário
    document.querySelector('.btn-edit[data-id="1"]').click();
    document.getElementById("status").value = "DONE";
    submeterFormulario();

    expect(document.getElementById("total-tarefas").textContent).toBe("2");
    expect(document.getElementById("tarefas-todo").textContent).toBe("1");
    expect(document.getElementById("tarefas-doing").textContent).toBe("0");
    expect(document.getElementById("tarefas-done").textContent).toBe("1");

    const cartoes = document.querySelectorAll(".task-card");
    expect(cartoes).toHaveLength(2);

    const indicadores = document.querySelectorAll(
      ".task-card .task-recurrence"
    );
    expect(indicadores).toHaveLength(2);
    expect(indicadores[0].textContent.trim()).toBe("🔁 Recorrência: Mensal");
    expect(indicadores[1].textContent.trim()).toBe("🔁 Recorrência: Mensal");
  });

  it("13. deve preservar nos cartões recorrentes os controles existentes de edição, exclusão e seleção em massa", async () => {
    await carregarAplicacao([
      {
        id: 1,
        nome: "Revisão semanal",
        descricao: "Segurança",
        dataTermino: "2026-11-10",
        prioridade: 1,
        categoria: "SecOps",
        status: "TODO",
        recorrencia: "SEMANAL",
        diaBaseRecorrencia: null,
        sucessoraGerada: false,
      },
    ]);

    const cartao = document.querySelector(".task-card");
    const checkbox = cartao.querySelector('.task-checkbox[data-id="1"]');
    const botaoEditar = cartao.querySelector('.btn-edit[data-id="1"]');
    const botaoExcluir = cartao.querySelector('.btn-delete[data-id="1"]');
    const indicador = cartao.querySelector(".task-recurrence");

    expect(checkbox).not.toBeNull();
    expect(botaoEditar).not.toBeNull();
    expect(botaoExcluir).not.toBeNull();
    expect(indicador.textContent.trim()).toBe("🔁 Recorrência: Semanal");

    // Ação em massa para DOING
    checkbox.checked = true;
    document.getElementById("status-multiplo").value = "DOING";
    document.getElementById("btn-status-multiplo").click();

    expect(document.getElementById("tarefas-doing").textContent).toBe("1");

    // Edição pelo botão Editar
    document.querySelector('.btn-edit[data-id="1"]').click();
    expect(document.getElementById("nome").value).toBe("Revisão semanal");
    expect(document.getElementById("recorrencia").value).toBe("SEMANAL");
    document.querySelector('#form-tarefa button[type="reset"]').click();

    // Exclusão pelo botão Excluir
    document.querySelector('.btn-delete[data-id="1"]').click();
    expect(document.querySelectorAll(".task-card")).toHaveLength(0);
    expect(document.getElementById("total-tarefas").textContent).toBe("0");
  });
});

