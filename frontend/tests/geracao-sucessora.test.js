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
  nome = "Tarefa recorrente",
  descricao = "Descrição padrão",
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

describe("T04 — Geração automática de sucessoras e prevenção de duplicações", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 4, 12, 0, 0)); // 2026-11-04 (horário local)
    vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("1. deve gerar imediatamente uma única tarefa sucessora TODO ao criar tarefa recorrente diretamente com status DONE (CA07)", async () => {
    await carregarAplicacao();

    preencherFormulario({
      nome: "Relatório diário",
      descricao: "Enviar indicadores",
      dataTermino: "2026-11-10",
      prioridade: "1",
      categoria: "Gestão",
      status: "DONE",
      recorrencia: "DIARIA",
    });

    submeterFormulario();

    const tarefas = obterTarefasSalvas();
    expect(tarefas).toHaveLength(2);

    expect(tarefas[0]).toEqual({
      id: 1,
      nome: "Relatório diário",
      descricao: "Enviar indicadores",
      dataTermino: "2026-11-10",
      prioridade: 1,
      categoria: "Gestão",
      status: "DONE",
      recorrencia: "DIARIA",
      diaBaseRecorrencia: null,
      sucessoraGerada: true,
    });

    expect(tarefas[1]).toEqual({
      id: 2,
      nome: "Relatório diário",
      descricao: "Enviar indicadores",
      dataTermino: "2026-11-11",
      prioridade: 1,
      categoria: "Gestão",
      status: "TODO",
      recorrencia: "DIARIA",
      diaBaseRecorrencia: null,
      sucessoraGerada: false,
    });

    expect(document.querySelectorAll(".task-card")).toHaveLength(2);
    expect(document.getElementById("total-tarefas").textContent).toBe("2");
    expect(document.getElementById("tarefas-done").textContent).toBe("1");
    expect(document.getElementById("tarefas-todo").textContent).toBe("1");
  });

  it("2. não deve gerar sucessora ao criar ou concluir tarefa com recorrência NENHUMA (CA01)", async () => {
    await carregarAplicacao();

    preencherFormulario({
      nome: "Tarefa única concluída",
      dataTermino: "2026-11-10",
      status: "DONE",
      recorrencia: "NENHUMA",
    });

    submeterFormulario();

    const tarefas = obterTarefasSalvas();
    expect(tarefas).toHaveLength(1);
    expect(tarefas[0].status).toBe("DONE");
    expect(tarefas[0].recorrencia).toBe("NENHUMA");
    expect(tarefas[0].sucessoraGerada).toBe(false);
  });

  it("3. deve gerar sucessoras corretas ao concluir tarefas DIARIA e SEMANAL via edição no formulário (CA03)", async () => {
    await carregarAplicacao([
      {
        id: 1,
        nome: "Backup diário",
        descricao: "Rotina diária",
        dataTermino: "2026-11-10",
        prioridade: 1,
        categoria: "Infra",
        status: "TODO",
        recorrencia: "DIARIA",
        diaBaseRecorrencia: null,
        sucessoraGerada: false,
      },
      {
        id: 2,
        nome: "Reunião semanal",
        descricao: "Alinhamento",
        dataTermino: "2026-11-10",
        prioridade: 2,
        categoria: "Equipe",
        status: "TODO",
        recorrencia: "SEMANAL",
        diaBaseRecorrencia: null,
        sucessoraGerada: false,
      },
    ]);

    // Concluir tarefa 1 (DIARIA) via edição
    document.querySelector('.btn-edit[data-id="1"]').click();
    document.getElementById("status").value = "DONE";
    submeterFormulario();

    // Concluir tarefa 2 (SEMANAL) via edição
    document.querySelector('.btn-edit[data-id="2"]').click();
    document.getElementById("status").value = "DONE";
    submeterFormulario();

    const tarefas = obterTarefasSalvas();
    expect(tarefas).toHaveLength(4);

    expect(tarefas[0]).toMatchObject({
      id: 1,
      status: "DONE",
      dataTermino: "2026-11-10",
      sucessoraGerada: true,
    });
    expect(tarefas[1]).toMatchObject({
      id: 2,
      status: "DONE",
      dataTermino: "2026-11-10",
      sucessoraGerada: true,
    });
    expect(tarefas[2]).toMatchObject({
      id: 3,
      nome: "Backup diário",
      status: "TODO",
      dataTermino: "2026-11-11",
      recorrencia: "DIARIA",
      sucessoraGerada: false,
    });
    expect(tarefas[3]).toMatchObject({
      id: 4,
      nome: "Reunião semanal",
      status: "TODO",
      dataTermino: "2026-11-17",
      recorrencia: "SEMANAL",
      sucessoraGerada: false,
    });
  });

  it("4. deve gerar sucessoras para todas as tarefas recorrentes elegíveis ao concluir em massa (#btn-status-multiplo) (CA03)", async () => {
    await carregarAplicacao([
      {
        id: 1,
        nome: "Checkup diário",
        descricao: "Servidores",
        dataTermino: "2026-11-10",
        prioridade: 1,
        categoria: "DevOps",
        status: "TODO",
        recorrencia: "DIARIA",
        diaBaseRecorrencia: null,
        sucessoraGerada: false,
      },
      {
        id: 2,
        nome: "Planejamento semanal",
        descricao: "Sprint",
        dataTermino: "2026-11-10",
        prioridade: 2,
        categoria: "Agile",
        status: "DOING",
        recorrencia: "SEMANAL",
        diaBaseRecorrencia: null,
        sucessoraGerada: false,
      },
      {
        id: 3,
        nome: "Tarefa avulsa",
        descricao: "Sem repetição",
        dataTermino: "2026-11-10",
        prioridade: 3,
        categoria: "Geral",
        status: "TODO",
        recorrencia: "NENHUMA",
        diaBaseRecorrencia: null,
        sucessoraGerada: false,
      },
    ]);

    document
      .querySelectorAll(".task-checkbox")
      .forEach((checkbox) => (checkbox.checked = true));

    document.getElementById("status-multiplo").value = "DONE";
    document.getElementById("btn-status-multiplo").click();

    const tarefas = obterTarefasSalvas();
    expect(tarefas).toHaveLength(5);

    expect(tarefas[0]).toMatchObject({
      id: 1,
      status: "DONE",
      sucessoraGerada: true,
    });
    expect(tarefas[1]).toMatchObject({
      id: 2,
      status: "DONE",
      sucessoraGerada: true,
    });
    expect(tarefas[2]).toMatchObject({
      id: 3,
      status: "DONE",
      sucessoraGerada: false,
    });
    expect(tarefas[3]).toMatchObject({
      id: 4,
      nome: "Checkup diário",
      status: "TODO",
      dataTermino: "2026-11-11",
      sucessoraGerada: false,
    });
    expect(tarefas[4]).toMatchObject({
      id: 5,
      nome: "Planejamento semanal",
      status: "TODO",
      dataTermino: "2026-11-17",
      sucessoraGerada: false,
    });
  });

  it("5. deve avançar múltiplos ciclos ao concluir tarefa recorrente atrasada até obter data estritamente futura (CA04)", async () => {
    // Hoje é 2026-11-04
    await carregarAplicacao([
      {
        id: 1,
        nome: "Revisão atrasada",
        descricao: "Estava prevista para 15/10",
        dataTermino: "2026-10-15",
        prioridade: 2,
        categoria: "Qualidade",
        status: "TODO",
        recorrencia: "SEMANAL",
        diaBaseRecorrencia: null,
        sucessoraGerada: false,
      },
    ]);

    document.querySelector('.btn-edit[data-id="1"]').click();
    document.getElementById("status").value = "DONE";
    submeterFormulario();

    const tarefas = obterTarefasSalvas();
    expect(tarefas).toHaveLength(2);
    expect(tarefas[1].dataTermino).toBe("2026-11-05");
    expect(tarefas[1].status).toBe("TODO");
  });

  it("6. deve preservar diaBaseRecorrencia (31) ao concluir série mensal 31/01 → 28/02 → 31/03 → 30/04 no fluxo completo (CA05)", async () => {
    vi.setSystemTime(new Date(2026, 0, 15, 10, 0, 0)); // 2026-01-15

    await carregarAplicacao();

    preencherFormulario({
      nome: "Fechamento mensal",
      descricao: "Contabilidade",
      dataTermino: "2026-01-31",
      prioridade: "1",
      categoria: "Finanças",
      status: "TODO",
      recorrencia: "MENSAL",
    });
    submeterFormulario();

    // 1. Concluir ocorrência de janeiro (id: 1) -> gera 2026-02-28 (id: 2)
    document.querySelector('.btn-edit[data-id="1"]').click();
    document.getElementById("status").value = "DONE";
    submeterFormulario();

    let tarefas = obterTarefasSalvas();
    expect(tarefas).toHaveLength(2);
    expect(tarefas[1]).toMatchObject({
      id: 2,
      dataTermino: "2026-02-28",
      diaBaseRecorrencia: 31,
      status: "TODO",
      sucessoraGerada: false,
    });

    // 2. Concluir ocorrência de fevereiro (id: 2) -> recupera dia 31 em 2026-03-31 (id: 3)
    document.querySelector('.btn-edit[data-id="2"]').click();
    document.getElementById("status").value = "DONE";
    submeterFormulario();

    tarefas = obterTarefasSalvas();
    expect(tarefas).toHaveLength(3);
    expect(tarefas[2]).toMatchObject({
      id: 3,
      dataTermino: "2026-03-31",
      diaBaseRecorrencia: 31,
      status: "TODO",
      sucessoraGerada: false,
    });

    // 3. Concluir ocorrência de março (id: 3) -> gera 2026-04-30 (id: 4)
    document.querySelector('.btn-edit[data-id="3"]').click();
    document.getElementById("status").value = "DONE";
    submeterFormulario();

    tarefas = obterTarefasSalvas();
    expect(tarefas).toHaveLength(4);
    expect(tarefas[3]).toMatchObject({
      id: 4,
      dataTermino: "2026-04-30",
      diaBaseRecorrencia: 31,
      status: "TODO",
      sucessoraGerada: false,
    });
  });

  it("7. deve respeitar ano bissexto na conclusão de série mensal 2028-01-31 → 2028-02-29 → 2028-03-31 (CA06)", async () => {
    vi.setSystemTime(new Date(2028, 0, 15, 10, 0, 0)); // 2028-01-15

    await carregarAplicacao([
      {
        id: 1,
        nome: "Assinatura mensal bissexto",
        descricao: "Série em 2028",
        dataTermino: "2028-01-31",
        prioridade: 1,
        categoria: "Finanças",
        status: "TODO",
        recorrencia: "MENSAL",
        diaBaseRecorrencia: 31,
        sucessoraGerada: false,
      },
    ]);

    // Concluir janeiro de 2028 -> gera 2028-02-29
    document.querySelector('.btn-edit[data-id="1"]').click();
    document.getElementById("status").value = "DONE";
    submeterFormulario();

    let tarefas = obterTarefasSalvas();
    expect(tarefas).toHaveLength(2);
    expect(tarefas[1]).toMatchObject({
      id: 2,
      dataTermino: "2028-02-29",
      diaBaseRecorrencia: 31,
      status: "TODO",
    });

    // Concluir fevereiro de 2028 -> gera 2028-03-31
    document.querySelector('.btn-edit[data-id="2"]').click();
    document.getElementById("status").value = "DONE";
    submeterFormulario();

    tarefas = obterTarefasSalvas();
    expect(tarefas).toHaveLength(3);
    expect(tarefas[2]).toMatchObject({
      id: 3,
      dataTermino: "2028-03-31",
      diaBaseRecorrencia: 31,
      status: "TODO",
    });
  });

  it("8. não deve duplicar sucessora após editar, reabrir (TODO/DOING) e concluir novamente via formulário ou ação em massa (CA08)", async () => {
    await carregarAplicacao([
      {
        id: 1,
        nome: "Backup diário",
        descricao: "Primeira ocorrência",
        dataTermino: "2026-11-10",
        prioridade: 1,
        categoria: "Infra",
        status: "TODO",
        recorrencia: "DIARIA",
        diaBaseRecorrencia: null,
        sucessoraGerada: false,
      },
    ]);

    // Primeira conclusão: deve gerar exatamente 1 sucessora (total = 2)
    document.querySelector('.btn-edit[data-id="1"]').click();
    document.getElementById("status").value = "DONE";
    submeterFormulario();

    expect(obterTarefasSalvas()).toHaveLength(2);

    // Editar mantendo DONE: não deve gerar outra sucessora
    document.querySelector('.btn-edit[data-id="1"]').click();
    document.getElementById("nome").value = "Backup diário editado";
    document.getElementById("status").value = "DONE";
    submeterFormulario();

    expect(obterTarefasSalvas()).toHaveLength(2);

    // Reabrir para TODO via formulário e concluir novamente para DONE via formulário
    document.querySelector('.btn-edit[data-id="1"]').click();
    document.getElementById("status").value = "TODO";
    submeterFormulario();

    expect(obterTarefasSalvas()[0].status).toBe("TODO");
    expect(obterTarefasSalvas()[0].sucessoraGerada).toBe(true);

    document.querySelector('.btn-edit[data-id="1"]').click();
    document.getElementById("status").value = "DONE";
    submeterFormulario();

    expect(obterTarefasSalvas()).toHaveLength(2);

    // Reabrir para DOING via ação em massa e concluir novamente para DONE via ação em massa
    const checkboxId1 = document.querySelector('.task-checkbox[data-id="1"]');
    checkboxId1.checked = true;
    document.getElementById("status-multiplo").value = "DOING";
    document.getElementById("btn-status-multiplo").click();

    expect(obterTarefasSalvas()[0].status).toBe("DOING");
    expect(obterTarefasSalvas()[0].sucessoraGerada).toBe(true);

    const checkboxId1Reaberto = document.querySelector(
      '.task-checkbox[data-id="1"]'
    );
    checkboxId1Reaberto.checked = true;
    document.getElementById("status-multiplo").value = "DONE";
    document.getElementById("btn-status-multiplo").click();

    const tarefasFinais = obterTarefasSalvas();
    expect(tarefasFinais).toHaveLength(2);
    expect(tarefasFinais[0].status).toBe("DONE");
    expect(tarefasFinais[0].sucessoraGerada).toBe(true);
  });

  it("9. deve garantir isolamento total ao editar ou excluir ocorrências individuais e bloquear exclusão em edição (CA09 / RF07)", async () => {
    await carregarAplicacao([
      {
        id: 1,
        nome: "Pagar internet",
        descricao: "Janeiro",
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
        nome: "Pagar internet",
        descricao: "Fevereiro",
        dataTermino: "2026-02-28",
        prioridade: 1,
        categoria: "Finanças",
        status: "TODO",
        recorrencia: "MENSAL",
        diaBaseRecorrencia: 31,
        sucessoraGerada: false,
      },
    ]);

    // Editar ocorrência 2 não altera ocorrência 1
    document.querySelector('.btn-edit[data-id="2"]').click();

    // Tentar excluir ocorrência 2 enquanto está em modo de edição deve ser bloqueado
    document.querySelector('.btn-delete[data-id="2"]').click();
    expect(window.alert).toHaveBeenCalledTimes(1);
    expect(obterTarefasSalvas()).toHaveLength(2);

    document.getElementById("nome").value = "Pagar internet (Fevereiro)";
    document.getElementById("prioridade").value = "3";
    submeterFormulario();

    let tarefas = obterTarefasSalvas();
    expect(tarefas[0].nome).toBe("Pagar internet");
    expect(tarefas[0].prioridade).toBe(1);
    expect(tarefas[1].nome).toBe("Pagar internet (Fevereiro)");
    expect(tarefas[1].prioridade).toBe(3);

    // Excluir ocorrência 2 fora do modo de edição remove apenas a 2 e preserva a 1
    document.querySelector('.btn-delete[data-id="2"]').click();

    tarefas = obterTarefasSalvas();
    expect(tarefas).toHaveLength(1);
    expect(tarefas[0].id).toBe(1);
    expect(tarefas[0].nome).toBe("Pagar internet");
  });

  it("10. deve processar corretamente conclusão em massa mista (2 recorrentes elegíveis, 1 avulsa NENHUMA e 1 recorrente com sucessoraGerada: true) sem duplicar em segunda execução", async () => {
    await carregarAplicacao([
      {
        id: 1,
        nome: "Recorrente elegível 1 (Diária)",
        descricao: "Ainda não gerou sucessora",
        dataTermino: "2026-11-10",
        prioridade: 1,
        categoria: "Operações",
        status: "TODO",
        recorrencia: "DIARIA",
        diaBaseRecorrencia: null,
        sucessoraGerada: false,
      },
      {
        id: 2,
        nome: "Recorrente elegível 2 (Semanal)",
        descricao: "Ainda não gerou sucessora",
        dataTermino: "2026-11-10",
        prioridade: 2,
        categoria: "Operações",
        status: "DOING",
        recorrencia: "SEMANAL",
        diaBaseRecorrencia: null,
        sucessoraGerada: false,
      },
      {
        id: 3,
        nome: "Tarefa avulsa (Nenhuma)",
        descricao: "Não deve gerar sucessora",
        dataTermino: "2026-11-10",
        prioridade: 3,
        categoria: "Geral",
        status: "TODO",
        recorrencia: "NENHUMA",
        diaBaseRecorrencia: null,
        sucessoraGerada: false,
      },
      {
        id: 4,
        nome: "Recorrente já processada anteriormente",
        descricao: "Já possui sucessoraGerada: true",
        dataTermino: "2026-11-10",
        prioridade: 1,
        categoria: "Financeiro",
        status: "TODO",
        recorrencia: "MENSAL",
        diaBaseRecorrencia: 10,
        sucessoraGerada: true,
      },
    ]);

    // Selecionar simultaneamente as 4 tarefas iniciais
    document
      .querySelectorAll(".task-checkbox")
      .forEach((checkbox) => (checkbox.checked = true));

    document.getElementById("status-multiplo").value = "DONE";
    document.getElementById("btn-status-multiplo").click();

    const tarefasAposPrimeiraExecucao = obterTarefasSalvas();

    // 4 originais + 2 sucessoras (apenas das tarefas 1 e 2) = 6 tarefas
    expect(tarefasAposPrimeiraExecucao).toHaveLength(6);

    // IDs únicos para todas as 6 tarefas
    const ids = tarefasAposPrimeiraExecucao.map((t) => t.id);
    expect(new Set(ids).size).toBe(6);
    expect(ids).toEqual([1, 2, 3, 4, 5, 6]);

    // As 4 tarefas originais permanecem na lista como DONE
    expect(tarefasAposPrimeiraExecucao[0]).toMatchObject({
      id: 1,
      status: "DONE",
      recorrencia: "DIARIA",
      sucessoraGerada: true,
    });
    expect(tarefasAposPrimeiraExecucao[1]).toMatchObject({
      id: 2,
      status: "DONE",
      recorrencia: "SEMANAL",
      sucessoraGerada: true,
    });
    expect(tarefasAposPrimeiraExecucao[2]).toMatchObject({
      id: 3,
      status: "DONE",
      recorrencia: "NENHUMA",
      sucessoraGerada: false,
    });
    expect(tarefasAposPrimeiraExecucao[3]).toMatchObject({
      id: 4,
      status: "DONE",
      recorrencia: "MENSAL",
      sucessoraGerada: true,
    });

    // As 2 novas sucessoras ficam com status TODO e sucessoraGerada: false (não foram processadas na mesma operação)
    expect(tarefasAposPrimeiraExecucao[4]).toEqual({
      id: 5,
      nome: "Recorrente elegível 1 (Diária)",
      descricao: "Ainda não gerou sucessora",
      dataTermino: "2026-11-11",
      prioridade: 1,
      categoria: "Operações",
      status: "TODO",
      recorrencia: "DIARIA",
      diaBaseRecorrencia: null,
      sucessoraGerada: false,
    });
    expect(tarefasAposPrimeiraExecucao[5]).toEqual({
      id: 6,
      nome: "Recorrente elegível 2 (Semanal)",
      descricao: "Ainda não gerou sucessora",
      dataTermino: "2026-11-17",
      prioridade: 2,
      categoria: "Operações",
      status: "TODO",
      recorrencia: "SEMANAL",
      diaBaseRecorrencia: null,
      sucessoraGerada: false,
    });

    // Segunda execução sobre as mesmas 4 tarefas originais (IDs 1, 2, 3 e 4)
    for (const idOriginal of [1, 2, 3, 4]) {
      document.querySelector(
        `.task-checkbox[data-id="${idOriginal}"]`
      ).checked = true;
    }

    document.getElementById("status-multiplo").value = "DONE";
    document.getElementById("btn-status-multiplo").click();

    const tarefasAposSegundaExecucao = obterTarefasSalvas();
    expect(tarefasAposSegundaExecucao).toHaveLength(6);
    expect(tarefasAposSegundaExecucao).toEqual(tarefasAposPrimeiraExecucao);
  });
});

