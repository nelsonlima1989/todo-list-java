import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

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
  dataTermino = "",
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

describe("T03 — Integração do campo de recorrência e validação de data no formulário", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  it("1. deve exibir o campo de recorrência com label e as quatro opções esperadas no formulário", async () => {
    await carregarAplicacao();

    const labelRecorrencia = document.querySelector('label[for="recorrencia"]');
    const selectRecorrencia = document.getElementById("recorrencia");
    const tagScript = document.querySelector('script[src="js/script.js"]');

    expect(labelRecorrencia).not.toBeNull();
    expect(labelRecorrencia.textContent.trim()).toBe("Recorrência");

    expect(selectRecorrencia).not.toBeNull();
    expect(selectRecorrencia.getAttribute("name")).toBe("recorrencia");

    const opcoes = Array.from(selectRecorrencia.options).map((opcao) => ({
      valor: opcao.value,
      texto: opcao.textContent.trim(),
    }));

    expect(opcoes).toEqual([
      { valor: "NENHUMA", texto: "Nenhuma" },
      { valor: "DIARIA", texto: "Diária" },
      { valor: "SEMANAL", texto: "Semanal" },
      { valor: "MENSAL", texto: "Mensal" },
    ]);

    expect(tagScript).not.toBeNull();
    expect(tagScript.getAttribute("type")).toBe("module");
  });

  it("2. deve iniciar com o valor padrão NENHUMA e data de término opcional", async () => {
    await carregarAplicacao();

    const selectRecorrencia = document.getElementById("recorrencia");
    const inputDataTermino = document.getElementById("data-termino");

    expect(selectRecorrencia.value).toBe("NENHUMA");
    expect(inputDataTermino.required).toBe(false);
  });

  it("3. deve alternar dinamicamente a obrigatoriedade de #data-termino conforme a recorrência selecionada", async () => {
    await carregarAplicacao();

    const selectRecorrencia = document.getElementById("recorrencia");
    const inputDataTermino = document.getElementById("data-termino");

    for (const valorRecorrente of ["DIARIA", "SEMANAL", "MENSAL"]) {
      selectRecorrencia.value = valorRecorrente;
      selectRecorrencia.dispatchEvent(new Event("change", { bubbles: true }));
      expect(inputDataTermino.required).toBe(true);
    }

    selectRecorrencia.value = "NENHUMA";
    selectRecorrencia.dispatchEvent(new Event("change", { bubbles: true }));
    expect(inputDataTermino.required).toBe(false);
  });

  it("4. deve bloquear a submissão quando a recorrência exige data na criação e na edição sem alterar o localStorage", async () => {
    await carregarAplicacao();

    for (const recorrencia of ["DIARIA", "SEMANAL", "MENSAL"]) {
      preencherFormulario({
        nome: `Tarefa ${recorrencia} sem data`,
        dataTermino: "",
        recorrencia,
      });

      submeterFormulario();

      expect(window.alert).toHaveBeenCalled();
      expect(localStorage.getItem("tarefas")).toBeNull();
      expect(document.querySelectorAll(".task-card").length).toBe(0);
    }

    // Cenário de edição: tarefa existente não pode ser salva como recorrente sem data
    const tarefaInicial = [
      {
        id: 1,
        nome: "Tarefa original",
        descricao: "Com data",
        dataTermino: "2026-11-10",
        prioridade: 1,
        categoria: "Geral",
        status: "TODO",
        recorrencia: "NENHUMA",
        diaBaseRecorrencia: null,
        sucessoraGerada: false,
      },
    ];
    await carregarAplicacao(tarefaInicial);
    window.alert.mockClear();

    const botaoEditar = document.querySelector('.btn-edit[data-id="1"]');
    botaoEditar.click();

    document.getElementById("data-termino").value = "";
    const selectRecorrencia = document.getElementById("recorrencia");
    selectRecorrencia.value = "MENSAL";
    selectRecorrencia.dispatchEvent(new Event("change", { bubbles: true }));

    submeterFormulario();

    expect(window.alert).toHaveBeenCalledTimes(1);
    const tarefasNoStorage = JSON.parse(localStorage.getItem("tarefas"));
    expect(tarefasNoStorage).toEqual(tarefaInicial);
    expect(
      document.querySelector('#form-tarefa button[type="submit"]').textContent
    ).toBe("Salvar tarefa");
  });

  it("5. deve permitir criar tarefa sem recorrência (NENHUMA) e sem data de término", async () => {
    await carregarAplicacao();

    preencherFormulario({
      nome: "Tarefa avulsa sem data",
      descricao: "Leitura opcional",
      dataTermino: "",
      prioridade: "3",
      categoria: "Estudos",
      status: "TODO",
      recorrencia: "NENHUMA",
    });

    submeterFormulario();

    expect(window.alert).not.toHaveBeenCalled();

    const tarefasSalvas = JSON.parse(localStorage.getItem("tarefas"));
    expect(tarefasSalvas).toHaveLength(1);
    expect(tarefasSalvas[0]).toEqual({
      id: 1,
      nome: "Tarefa avulsa sem data",
      descricao: "Leitura opcional",
      dataTermino: "",
      prioridade: 3,
      categoria: "Estudos",
      status: "TODO",
      recorrencia: "NENHUMA",
      diaBaseRecorrencia: null,
      sucessoraGerada: false,
    });
  });

  it("6. deve criar tarefas recorrentes (DIARIA, SEMANAL e MENSAL) com data válida", async () => {
    await carregarAplicacao();

    preencherFormulario({
      nome: "Daily standup",
      dataTermino: "2026-11-10",
      recorrencia: "DIARIA",
    });
    submeterFormulario();

    preencherFormulario({
      nome: "Revisão semanal",
      dataTermino: "2026-11-15",
      recorrencia: "SEMANAL",
    });
    submeterFormulario();

    preencherFormulario({
      nome: "Fechamento mensal",
      dataTermino: "2026-01-31",
      recorrencia: "MENSAL",
    });
    submeterFormulario();

    const tarefasSalvas = JSON.parse(localStorage.getItem("tarefas"));
    expect(tarefasSalvas).toHaveLength(3);

    expect(tarefasSalvas[0].recorrencia).toBe("DIARIA");
    expect(tarefasSalvas[0].diaBaseRecorrencia).toBeNull();

    expect(tarefasSalvas[1].recorrencia).toBe("SEMANAL");
    expect(tarefasSalvas[1].diaBaseRecorrencia).toBeNull();

    expect(tarefasSalvas[2].recorrencia).toBe("MENSAL");
    expect(tarefasSalvas[2].diaBaseRecorrencia).toBe(31);
  });

  it("7. deve persistir corretamente recorrencia, diaBaseRecorrencia e sucessoraGerada no localStorage", async () => {
    await carregarAplicacao();

    preencherFormulario({
      nome: "Pagar aluguel",
      descricao: "Transferência bancária",
      dataTermino: "2026-05-30",
      prioridade: "1",
      categoria: "Finanças",
      status: "TODO",
      recorrencia: "MENSAL",
    });

    submeterFormulario();

    const tarefasSalvas = JSON.parse(localStorage.getItem("tarefas"));
    expect(tarefasSalvas).toEqual([
      {
        id: 1,
        nome: "Pagar aluguel",
        descricao: "Transferência bancária",
        dataTermino: "2026-05-30",
        prioridade: 1,
        categoria: "Finanças",
        status: "TODO",
        recorrencia: "MENSAL",
        diaBaseRecorrencia: 30,
        sucessoraGerada: false,
      },
    ]);
  });

  it("8. deve preencher o campo de recorrência ao editar uma tarefa recorrente e salvar as alterações", async () => {
    await carregarAplicacao([
      {
        id: 1,
        nome: "Backup do banco",
        descricao: "Executar script",
        dataTermino: "2026-11-12",
        prioridade: 2,
        categoria: "Infra",
        status: "TODO",
        recorrencia: "SEMANAL",
        diaBaseRecorrencia: null,
        sucessoraGerada: false,
      },
    ]);

    const botaoEditar = document.querySelector('.btn-edit[data-id="1"]');
    botaoEditar.click();

    const selectRecorrencia = document.getElementById("recorrencia");
    const inputDataTermino = document.getElementById("data-termino");

    expect(selectRecorrencia.value).toBe("SEMANAL");
    expect(inputDataTermino.required).toBe(true);

    document.getElementById("nome").value = "Backup diário do banco";
    selectRecorrencia.value = "DIARIA";
    selectRecorrencia.dispatchEvent(new Event("change", { bubbles: true }));

    submeterFormulario();

    const tarefasSalvas = JSON.parse(localStorage.getItem("tarefas"));
    expect(tarefasSalvas[0].nome).toBe("Backup diário do banco");
    expect(tarefasSalvas[0].recorrencia).toBe("DIARIA");
    expect(tarefasSalvas[0].diaBaseRecorrencia).toBeNull();
  });

  it("9. deve preservar sucessoraGerada: true durante edições comuns no formulário", async () => {
    await carregarAplicacao([
      {
        id: 1,
        nome: "Relatório concluído",
        descricao: "Já gerou sucessora",
        dataTermino: "2026-11-10",
        prioridade: 1,
        categoria: "Gestão",
        status: "DONE",
        recorrencia: "DIARIA",
        diaBaseRecorrencia: null,
        sucessoraGerada: true,
      },
    ]);

    document.querySelector('.btn-edit[data-id="1"]').click();

    document.getElementById("nome").value = "Relatório concluído (revisado)";
    document.getElementById("status").value = "DOING";

    submeterFormulario();

    const tarefasSalvas = JSON.parse(localStorage.getItem("tarefas"));
    expect(tarefasSalvas).toHaveLength(1);
    expect(tarefasSalvas[0].nome).toBe("Relatório concluído (revisado)");
    expect(tarefasSalvas[0].status).toBe("DOING");
    expect(tarefasSalvas[0].sucessoraGerada).toBe(true);
  });

  it("10. deve preservar diaBaseRecorrencia quando a data não muda e atualizá-lo quando a data ou recorrência mudar (RF05)", async () => {
    await carregarAplicacao([
      {
        id: 1,
        nome: "Fechamento contábil",
        descricao: "Ocorrência de fevereiro ajustada de 31/01",
        dataTermino: "2026-02-28",
        prioridade: 1,
        categoria: "Finanças",
        status: "TODO",
        recorrencia: "MENSAL",
        diaBaseRecorrencia: 31,
        sucessoraGerada: false,
      },
    ]);

    // Caso A: edita título mantendo a mesma data 2026-02-28 -> preserva diaBaseRecorrencia = 31
    document.querySelector('.btn-edit[data-id="1"]').click();
    document.getElementById("nome").value = "Fechamento contábil atualizado";
    submeterFormulario();

    let tarefasSalvas = JSON.parse(localStorage.getItem("tarefas"));
    expect(tarefasSalvas[0].dataTermino).toBe("2026-02-28");
    expect(tarefasSalvas[0].diaBaseRecorrencia).toBe(31);

    // Caso B: usuário altera manualmente dataTermino para 2026-02-15 -> atualiza diaBaseRecorrencia = 15
    document.querySelector('.btn-edit[data-id="1"]').click();
    document.getElementById("data-termino").value = "2026-02-15";
    submeterFormulario();

    tarefasSalvas = JSON.parse(localStorage.getItem("tarefas"));
    expect(tarefasSalvas[0].dataTermino).toBe("2026-02-15");
    expect(tarefasSalvas[0].diaBaseRecorrencia).toBe(15);

    // Caso C: usuário altera recorrência para SEMANAL -> diaBaseRecorrencia passa a ser null
    document.querySelector('.btn-edit[data-id="1"]').click();
    const selectRecorrencia = document.getElementById("recorrencia");
    selectRecorrencia.value = "SEMANAL";
    selectRecorrencia.dispatchEvent(new Event("change", { bubbles: true }));
    submeterFormulario();

    tarefasSalvas = JSON.parse(localStorage.getItem("tarefas"));
    expect(tarefasSalvas[0].recorrencia).toBe("SEMANAL");
    expect(tarefasSalvas[0].diaBaseRecorrencia).toBeNull();
  });

  it("11. deve restaurar recorrência NENHUMA, desmarcar obrigatoriedade da data e sair do modo de edição ao limpar o formulário", async () => {
    await carregarAplicacao([
      {
        id: 1,
        nome: "Tarefa em edição",
        descricao: "Teste reset",
        dataTermino: "2026-11-20",
        prioridade: 2,
        categoria: "Dev",
        status: "TODO",
        recorrencia: "MENSAL",
        diaBaseRecorrencia: 20,
        sucessoraGerada: false,
      },
    ]);

    document.querySelector('.btn-edit[data-id="1"]').click();

    const selectRecorrencia = document.getElementById("recorrencia");
    const inputDataTermino = document.getElementById("data-termino");
    const botaoSubmit = document.querySelector(
      '#form-tarefa button[type="submit"]'
    );
    const botaoLimpar = document.querySelector(
      '#form-tarefa button[type="reset"]'
    );

    expect(selectRecorrencia.value).toBe("MENSAL");
    expect(inputDataTermino.required).toBe(true);
    expect(botaoSubmit.textContent.trim()).toBe("Salvar tarefa");

    botaoLimpar.click();

    expect(selectRecorrencia.value).toBe("NENHUMA");
    expect(inputDataTermino.required).toBe(false);
    expect(botaoSubmit.textContent.trim()).toBe("Criar tarefa");
  });

  it("12. deve carregar e editar tarefas antigas do localStorage sem campos de recorrência (retrocompatibilidade CA11)", async () => {
    await carregarAplicacao([
      {
        id: 10,
        nome: "Tarefa legada",
        descricao: "Salva antes da feature",
        dataTermino: "2026-10-01",
        prioridade: 4,
        categoria: "Legado",
        status: "TODO",
      },
    ]);

    expect(document.querySelectorAll(".task-card")).toHaveLength(1);

    document.querySelector('.btn-edit[data-id="10"]').click();

    const selectRecorrencia = document.getElementById("recorrencia");
    const inputDataTermino = document.getElementById("data-termino");

    expect(selectRecorrencia.value).toBe("NENHUMA");
    expect(inputDataTermino.required).toBe(false);

    document.getElementById("nome").value = "Tarefa legada atualizada";
    submeterFormulario();

    const tarefasSalvas = JSON.parse(localStorage.getItem("tarefas"));
    expect(tarefasSalvas).toEqual([
      {
        id: 10,
        nome: "Tarefa legada atualizada",
        descricao: "Salva antes da feature",
        dataTermino: "2026-10-01",
        prioridade: 4,
        categoria: "Legado",
        status: "TODO",
        recorrencia: "NENHUMA",
        diaBaseRecorrencia: null,
        sucessoraGerada: false,
      },
    ]);
  });
});
