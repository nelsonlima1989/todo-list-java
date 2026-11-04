import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as moduloRecorrencia from "../js/recorrencia.js";

const htmlIndice = readFileSync(resolve(process.cwd(), "index.html"), "utf-8");

const carregarAplicacaoComStorageBruto = async (valorBrutoStorage = null) => {
  localStorage.clear();

  if (valorBrutoStorage !== null) {
    localStorage.setItem("tarefas", valorBrutoStorage);
  }

  document.documentElement.innerHTML = htmlIndice;

  vi.resetModules();
  await import("../js/script.js");
};

const carregarAplicacao = async (tarefasIniciais = null) => {
  const valorBruto =
    tarefasIniciais !== null ? JSON.stringify(tarefasIniciais) : null;
  await carregarAplicacaoComStorageBruto(valorBruto);
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

describe("Code Review PR #2 — Segurança e Integridade (F01, F02, F03 e F04)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 4, 12, 0, 0));
    vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("F01 — Prevenção de XSS e exibição literal de HTML/caracteres especiais", () => {
    it("1. não deve interpretar HTML executável em nome, descrição ou categoria na tarefa original nem na sucessora", async () => {
      await carregarAplicacao();

      const payloadNome =
        '<span data-xss="titulo">Revisar & Validar "A" e \'B\'</span>';
      const payloadDescricao =
        '<b data-xss="descricao">Descrição com <tag> & "aspas"</b>';
      const payloadCategoria = '<i data-xss="categoria">Dev & <SecOps></i>';

      preencherFormulario({
        nome: payloadNome,
        descricao: payloadDescricao,
        dataTermino: "2026-11-10",
        prioridade: "1",
        categoria: payloadCategoria,
        status: "DONE",
        recorrencia: "DIARIA",
      });

      submeterFormulario();

      const lista = document.getElementById("lista-tarefas");
      const cartoes = lista.querySelectorAll(".task-card");

      expect(cartoes).toHaveLength(2);
      // Nenhum nó HTML injetado deve existir no DOM
      expect(lista.querySelectorAll("[data-xss]")).toHaveLength(0);

      // Tanto a tarefa original (índice 0) quanto a sucessora (índice 1) devem exibir o texto literal
      for (const cartao of cartoes) {
        expect(cartao.querySelector(".task-header h3").textContent.trim()).toBe(
          payloadNome
        );
        expect(cartao.querySelector(".task-content p").textContent.trim()).toBe(
          payloadDescricao
        );
        expect(cartao.querySelector(".task-information").textContent).toContain(
          `📁 Categoria: ${payloadCategoria}`
        );
        expect(
          cartao.querySelector(".task-recurrence").textContent.trim()
        ).toBe("🔁 Recorrência: Diária");
      }
    });

    it("2. deve impedir injeção de atributos ou elementos via campos persistidos no localStorage preservando botões e eventos", async () => {
      await carregarAplicacao([
        {
          id: 1,
          nome: '"><div data-injetado="nome">Injetado</div>',
          descricao: "Texto & <script data-injetado='script'></script>",
          dataTermino: "2026-11-10",
          prioridade: 1,
          categoria: '"><span data-injetado="cat">Cat</span>',
          status: "TODO",
          recorrencia: "SEMANAL",
          diaBaseRecorrencia: null,
          sucessoraGerada: false,
        },
      ]);

      const lista = document.getElementById("lista-tarefas");
      expect(lista.querySelectorAll("[data-injetado]")).toHaveLength(0);

      const cartao = lista.querySelector(".task-card");
      expect(cartao).not.toBeNull();
      expect(
        cartao.querySelector('.task-checkbox[data-id="1"]')
      ).not.toBeNull();
      expect(cartao.querySelector('.btn-edit[data-id="1"]')).not.toBeNull();
      expect(cartao.querySelector('.btn-delete[data-id="1"]')).not.toBeNull();
      expect(cartao.querySelector(".task-recurrence").textContent.trim()).toBe(
        "🔁 Recorrência: Semanal"
      );
    });
  });

  describe("F02 — Leitura resiliente do localStorage", () => {
    it("3. não deve falhar na inicialização nem apagar o localStorage quando o JSON estiver malformado", async () => {
      const jsonCorrompido = "{json_invalido: [1, 2";

      await expect(
        carregarAplicacaoComStorageBruto(jsonCorrompido)
      ).resolves.not.toThrow();

      // Não deve sobrescrever automaticamente o dado original corrompido durante a leitura inicial
      expect(localStorage.getItem("tarefas")).toBe(jsonCorrompido);
      expect(document.getElementById("total-tarefas").textContent).toBe("0");
      expect(
        document.querySelector("#lista-tarefas .empty-state")
      ).not.toBeNull();

      // A aplicação deve estar funcional (listeners registrados)
      preencherFormulario({
        nome: "Nova tarefa após recuperação",
        dataTermino: "2026-11-15",
        recorrencia: "DIARIA",
      });
      submeterFormulario();

      expect(document.querySelectorAll(".task-card")).toHaveLength(1);
    });

    it("4. não deve falhar na inicialização quando o JSON no localStorage não for um Array", async () => {
      for (const valorNaoArray of ['{"id": 1}', "123", "true", '"texto"']) {
        await expect(
          carregarAplicacaoComStorageBruto(valorNaoArray)
        ).resolves.not.toThrow();

        expect(localStorage.getItem("tarefas")).toBe(valorNaoArray);
        expect(document.getElementById("total-tarefas").textContent).toBe("0");
        expect(
          document.querySelector("#lista-tarefas .empty-state")
        ).not.toBeNull();
      }
    });

    it("5. deve ignorar elementos nulos ou primitivos em um array no localStorage preservando os registros válidos", async () => {
      const arrayMisto = JSON.stringify([
        null,
        undefined,
        42,
        "string_invalida",
        ["array_aninhado"],
        {
          id: 7,
          nome: "Tarefa íntegra",
          descricao: "Deve ser preservada",
          dataTermino: "2026-11-20",
          prioridade: 2,
          categoria: "Dados",
          status: "TODO",
          recorrencia: "MENSAL",
          diaBaseRecorrencia: 20,
          sucessoraGerada: false,
        },
      ]);

      await expect(
        carregarAplicacaoComStorageBruto(arrayMisto)
      ).resolves.not.toThrow();

      expect(document.getElementById("total-tarefas").textContent).toBe("1");
      const cartoes = document.querySelectorAll(".task-card");
      expect(cartoes).toHaveLength(1);
      expect(cartoes[0].querySelector("h3").textContent.trim()).toBe(
        "Tarefa íntegra"
      );
    });
  });

  describe("F03 — Integridade e unicidade dos IDs", () => {
    it("6. deve recuperar tarefas com ID ausente ou inválido atribuindo IDs inteiros positivos únicos sem gerar NaN", async () => {
      await carregarAplicacao([
        {
          nome: "Sem ID",
          descricao: "Registro legado sem id",
          dataTermino: "2026-11-10",
          prioridade: 1,
          categoria: "Geral",
          status: "TODO",
        },
        {
          id: "invalido",
          nome: "ID não numérico",
          descricao: "ID string",
          dataTermino: "2026-11-10",
          prioridade: 2,
          categoria: "Geral",
          status: "TODO",
        },
        {
          id: -10,
          nome: "ID negativo",
          descricao: "ID <= 0",
          dataTermino: "2026-11-10",
          prioridade: 3,
          categoria: "Geral",
          status: "TODO",
        },
        {
          id: 10,
          nome: "ID válido existente",
          descricao: "Deve preservar ID 10",
          dataTermino: "2026-11-10",
          prioridade: 1,
          categoria: "Geral",
          status: "TODO",
        },
      ]);

      // Nenhuma das 4 tarefas deve ser descartada
      expect(document.querySelectorAll(".task-card")).toHaveLength(4);

      // Criar uma tarefa recorrente concluída para forçar geração de sucessora
      preencherFormulario({
        nome: "Recorrente após recuperação de IDs",
        dataTermino: "2026-11-10",
        status: "DONE",
        recorrencia: "DIARIA",
      });
      submeterFormulario();

      const tarefasSalvas = JSON.parse(localStorage.getItem("tarefas"));
      expect(tarefasSalvas).toHaveLength(6);

      const ids = tarefasSalvas.map((t) => t.id);
      for (const id of ids) {
        expect(Number.isInteger(id)).toBe(true);
        expect(id).toBeGreaterThan(0);
      }
      expect(new Set(ids).size).toBe(6);

      // O ID válido original 10 deve ter sido preservado
      const tarefaId10 = tarefasSalvas.find(
        (t) => t.nome === "ID válido existente"
      );
      expect(tarefaId10.id).toBe(10);
    });

    it("7. deve resolver IDs duplicados no carregamento e manter unicidade entre originais e sucessoras", async () => {
      await carregarAplicacao([
        {
          id: 5,
          nome: "Primeira com ID 5",
          descricao: "Preserva o ID 5",
          dataTermino: "2026-11-10",
          prioridade: 1,
          categoria: "Geral",
          status: "TODO",
          recorrencia: "DIARIA",
          diaBaseRecorrencia: null,
          sucessoraGerada: false,
        },
        {
          id: 5,
          nome: "Segunda duplicada com ID 5",
          descricao: "Deve receber novo ID único",
          dataTermino: "2026-11-10",
          prioridade: 2,
          categoria: "Geral",
          status: "TODO",
          recorrencia: "SEMANAL",
          diaBaseRecorrencia: null,
          sucessoraGerada: false,
        },
      ]);

      // Concluir ambas em massa
      document
        .querySelectorAll(".task-checkbox")
        .forEach((cb) => (cb.checked = true));
      document.getElementById("status-multiplo").value = "DONE";
      document.getElementById("btn-status-multiplo").click();

      const tarefasSalvas = JSON.parse(localStorage.getItem("tarefas"));
      expect(tarefasSalvas).toHaveLength(4);

      const ids = tarefasSalvas.map((t) => t.id);
      expect(new Set(ids).size).toBe(4);
      expect(tarefasSalvas[0].id).toBe(5);
    });

    it("8. deve produzir IDs inteiros seguros (Number.isSafeInteger) e únicos mesmo na presença de valores extremos como Number.MAX_SAFE_INTEGER", async () => {
      await carregarAplicacao([
        {
          id: Number.MAX_SAFE_INTEGER,
          nome: "Tarefa no limite MAX_SAFE_INTEGER",
          descricao: "ID extremo válido",
          dataTermino: "2026-11-10",
          prioridade: 1,
          categoria: "Extremo",
          status: "TODO",
          recorrencia: "DIARIA",
          diaBaseRecorrencia: null,
          sucessoraGerada: false,
        },
        {
          id: Number.MAX_SAFE_INTEGER,
          nome: "Duplicada no limite MAX_SAFE_INTEGER",
          descricao: "Não pode receber MAX_SAFE_INTEGER + 1",
          dataTermino: "2026-11-10",
          prioridade: 2,
          categoria: "Extremo",
          status: "TODO",
          recorrencia: "NENHUMA",
        },
        {
          id: Number.MAX_SAFE_INTEGER + 100,
          nome: "Acima de MAX_SAFE_INTEGER",
          descricao: "Inseguro, deve ser recuperado para inteiro seguro",
          dataTermino: "2026-11-10",
          prioridade: 3,
          categoria: "Extremo",
          status: "TODO",
          recorrencia: "NENHUMA",
        },
      ]);

      // Criar nova tarefa recorrente já como DONE (gera original + sucessora)
      preencherFormulario({
        nome: "Nova recorrente após MAX_SAFE_INTEGER",
        dataTermino: "2026-11-10",
        status: "DONE",
        recorrencia: "SEMANAL",
      });
      submeterFormulario();

      const tarefasSalvas = JSON.parse(localStorage.getItem("tarefas"));
      expect(tarefasSalvas).toHaveLength(5);

      const ids = tarefasSalvas.map((t) => t.id);
      for (const id of ids) {
        expect(Number.isSafeInteger(id)).toBe(true);
        expect(id).toBeGreaterThan(0);
      }
      expect(new Set(ids).size).toBe(5);
      expect(tarefasSalvas[0].id).toBe(Number.MAX_SAFE_INTEGER);
    });
  });

  describe("F04 — Validação rigorosa de datas em tarefas recorrentes", () => {
    it("9. deve expor função pública de validação de data ISO em recorrencia.js rejeitando formatos inválidos e datas inexistentes", () => {
      expect(typeof moduloRecorrencia.ehDataTerminoValida).toBe("function");

      expect(moduloRecorrencia.ehDataTerminoValida("2026-11-10")).toBe(true);
      expect(moduloRecorrencia.ehDataTerminoValida("2028-02-29")).toBe(true);

      expect(moduloRecorrencia.ehDataTerminoValida("")).toBe(false);
      expect(moduloRecorrencia.ehDataTerminoValida("   ")).toBe(false);
      expect(moduloRecorrencia.ehDataTerminoValida("10/11/2026")).toBe(false);
      expect(moduloRecorrencia.ehDataTerminoValida("2026-02-29")).toBe(false);
      expect(moduloRecorrencia.ehDataTerminoValida("2026-02-31")).toBe(false);
      expect(moduloRecorrencia.ehDataTerminoValida("2026-04-31")).toBe(false);
      expect(moduloRecorrencia.ehDataTerminoValida("2026-13-01")).toBe(false);
    });

    it("10. deve bloquear a criação e a edição de tarefa recorrente quando a data tiver formato inválido ou não existir no calendário", async () => {
      await carregarAplicacao();

      const inputData = document.getElementById("data-termino");
      // Simula ambiente ou manipulação onde o input permite string arbitrária
      inputData.type = "text";

      for (const dataInvalida of ["10/11/2026", "2026-02-29", "2026-02-31", "2026-04-31"]) {
        preencherFormulario({
          nome: `Tarefa com data ${dataInvalida}`,
          dataTermino: dataInvalida,
          status: "DONE",
          recorrencia: "MENSAL",
        });

        submeterFormulario();

        expect(window.alert).toHaveBeenCalled();
        expect(localStorage.getItem("tarefas")).toBeNull();
        expect(document.querySelectorAll(".task-card")).toHaveLength(0);
        window.alert.mockClear();
      }

      // Verificar bloqueio também na edição de tarefa existente
      await carregarAplicacao([
        {
          id: 1,
          nome: "Tarefa existente",
          descricao: "Válida inicialmente",
          dataTermino: "2026-11-10",
          prioridade: 1,
          categoria: "Geral",
          status: "TODO",
          recorrencia: "DIARIA",
          diaBaseRecorrencia: null,
          sucessoraGerada: false,
        },
      ]);

      document.querySelector('.btn-edit[data-id="1"]').click();
      const inputDataEdicao = document.getElementById("data-termino");
      inputDataEdicao.type = "text";
      inputDataEdicao.value = "2026-02-31";
      document.getElementById("status").value = "DONE";

      submeterFormulario();

      expect(window.alert).toHaveBeenCalledTimes(1);
      const tarefasNoStorage = JSON.parse(localStorage.getItem("tarefas"));
      expect(tarefasNoStorage).toHaveLength(1);
      expect(tarefasNoStorage[0].dataTermino).toBe("2026-11-10");
      expect(tarefasNoStorage[0].status).toBe("TODO");
    });

    it("11. deve acionar a validação nativa do formulário via requestSubmit() quando recorrência exige data", async () => {
      await carregarAplicacao();

      const formulario = document.getElementById("form-tarefa");
      const inputData = document.getElementById("data-termino");

      preencherFormulario({
        nome: "Teste requestSubmit nativo",
        dataTermino: "",
        prioridade: "1",
        recorrencia: "SEMANAL",
      });

      expect(inputData.required).toBe(true);
      expect(formulario.checkValidity()).toBe(false);

      let eventoInvalidDisparado = false;
      inputData.addEventListener("invalid", () => {
        eventoInvalidDisparado = true;
      });

      formulario.requestSubmit();

      expect(eventoInvalidDisparado).toBe(true);
      expect(localStorage.getItem("tarefas")).toBeNull();
      expect(document.querySelectorAll(".task-card")).toHaveLength(0);
    });
  });
});
