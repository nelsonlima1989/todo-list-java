import { afterEach, describe, expect, it, vi } from "vitest";
import {
  RECORRENCIAS_VALIDAS,
  calcularProximaDataTermino,
  deveGerarSucessora,
  gerarTarefaSucessora,
  normalizarTarefa,
  obterUltimoDiaDoMes,
} from "../js/recorrencia.js";

describe("Módulo puro de recorrência e cálculo de datas (recorrencia.js)", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe("RECORRENCIAS_VALIDAS", () => {
    it("deve conter exatamente NENHUMA, DIARIA, SEMANAL e MENSAL e ser imutável", () => {
      expect(RECORRENCIAS_VALIDAS).toEqual([
        "NENHUMA",
        "DIARIA",
        "SEMANAL",
        "MENSAL",
      ]);
      expect(Object.isFrozen(RECORRENCIAS_VALIDAS)).toBe(true);
    });
  });

  describe("normalizarTarefa", () => {
    it("deve normalizar tarefas legadas sem campos de recorrência preservando atributos existentes e sem mutar a entrada", () => {
      const tarefaLegada = {
        id: 10,
        nome: "Estudar JavaScript",
        descricao: "Revisar ES Modules",
        dataTermino: "2026-11-10",
        prioridade: 1,
        categoria: "Estudos",
        status: "TODO",
      };
      const copiaEntrada = { ...tarefaLegada };

      const resultado = normalizarTarefa(tarefaLegada);

      expect(resultado).toEqual({
        id: 10,
        nome: "Estudar JavaScript",
        descricao: "Revisar ES Modules",
        dataTermino: "2026-11-10",
        prioridade: 1,
        categoria: "Estudos",
        status: "TODO",
        recorrencia: "NENHUMA",
        diaBaseRecorrencia: null,
        sucessoraGerada: false,
      });
      expect(resultado).not.toBe(tarefaLegada);
      expect(tarefaLegada).toEqual(copiaEntrada);
    });

    it("deve assumir NENHUMA quando a recorrência for inválida e forçar diaBaseRecorrencia como null", () => {
      const tarefaInvalida = {
        id: 2,
        nome: "Tarefa inválida",
        descricao: "",
        dataTermino: "2026-11-15",
        prioridade: 3,
        categoria: "Geral",
        status: "DOING",
        recorrencia: "QUINZENAL",
        diaBaseRecorrencia: 15,
      };

      const resultado = normalizarTarefa(tarefaInvalida);

      expect(resultado.recorrencia).toBe("NENHUMA");
      expect(resultado.diaBaseRecorrencia).toBeNull();
      expect(resultado.sucessoraGerada).toBe(false);
    });

    it("deve inferir diaBaseRecorrencia a partir de dataTermino em tarefas MENSAL quando o campo estiver ausente", () => {
      const tarefaMensalSemDiaBase = {
        id: 3,
        nome: "Pagar aluguel",
        descricao: "Boleto bancário",
        dataTermino: "2026-01-31",
        prioridade: 1,
        categoria: "Finanças",
        status: "TODO",
        recorrencia: "MENSAL",
      };

      const resultado = normalizarTarefa(tarefaMensalSemDiaBase);

      expect(resultado.recorrencia).toBe("MENSAL");
      expect(resultado.diaBaseRecorrencia).toBe(31);
      expect(resultado.sucessoraGerada).toBe(false);
    });

    it("deve preservar diaBaseRecorrencia explícito em tarefa MENSAL mesmo quando dataTermino estiver em mês curto (ex: 28/02 com base 31)", () => {
      const tarefaFevereiro = {
        id: 4,
        nome: "Fechamento mensal",
        descricao: "Relatório contábil",
        dataTermino: "2026-02-28",
        prioridade: 2,
        categoria: "Trabalho",
        status: "TODO",
        recorrencia: "MENSAL",
        diaBaseRecorrencia: 31,
        sucessoraGerada: true,
      };

      const resultado = normalizarTarefa(tarefaFevereiro);

      expect(resultado.diaBaseRecorrencia).toBe(31);
      expect(resultado.sucessoraGerada).toBe(true);
    });

    it("deve definir diaBaseRecorrencia como null para recorrências DIARIA e SEMANAL", () => {
      const diaria = normalizarTarefa({
        id: 5,
        nome: "Daily",
        descricao: "",
        dataTermino: "2026-11-10",
        prioridade: 2,
        categoria: "Trabalho",
        status: "TODO",
        recorrencia: "DIARIA",
        diaBaseRecorrencia: 10,
      });

      const semanal = normalizarTarefa({
        id: 6,
        nome: "Weekly",
        descricao: "",
        dataTermino: "2026-11-10",
        prioridade: 2,
        categoria: "Trabalho",
        status: "TODO",
        recorrencia: "SEMANAL",
        diaBaseRecorrencia: 10,
      });

      expect(diaria.diaBaseRecorrencia).toBeNull();
      expect(semanal.diaBaseRecorrencia).toBeNull();
    });

    it("deve lançar erro caso o parâmetro não seja um objeto válido", () => {
      expect(() => normalizarTarefa(null)).toThrow(TypeError);
      expect(() => normalizarTarefa(undefined)).toThrow(TypeError);
    });
  });

  describe("obterUltimoDiaDoMes", () => {
    it("deve retornar 28 para fevereiro em anos não bissextos e 29 em anos bissextos", () => {
      expect(obterUltimoDiaDoMes(2026, 2)).toBe(28);
      expect(obterUltimoDiaDoMes(2027, 2)).toBe(28);
      expect(obterUltimoDiaDoMes(1900, 2)).toBe(28);

      expect(obterUltimoDiaDoMes(2024, 2)).toBe(29);
      expect(obterUltimoDiaDoMes(2028, 2)).toBe(29);
      expect(obterUltimoDiaDoMes(2000, 2)).toBe(29);
    });

    it("deve retornar corretamente 30 ou 31 para todos os meses de 1 a 12", () => {
      expect(obterUltimoDiaDoMes(2026, 1)).toBe(31);
      expect(obterUltimoDiaDoMes(2026, 3)).toBe(31);
      expect(obterUltimoDiaDoMes(2026, 4)).toBe(30);
      expect(obterUltimoDiaDoMes(2026, 5)).toBe(31);
      expect(obterUltimoDiaDoMes(2026, 6)).toBe(30);
      expect(obterUltimoDiaDoMes(2026, 7)).toBe(31);
      expect(obterUltimoDiaDoMes(2026, 8)).toBe(31);
      expect(obterUltimoDiaDoMes(2026, 9)).toBe(30);
      expect(obterUltimoDiaDoMes(2026, 10)).toBe(31);
      expect(obterUltimoDiaDoMes(2026, 11)).toBe(30);
      expect(obterUltimoDiaDoMes(2026, 12)).toBe(31);
    });

    it("deve lançar RangeError para mês fora do intervalo 1..12 ou argumentos não inteiros", () => {
      expect(() => obterUltimoDiaDoMes(2026, 0)).toThrow(RangeError);
      expect(() => obterUltimoDiaDoMes(2026, 13)).toThrow(RangeError);
      expect(() => obterUltimoDiaDoMes(2026, 2.5)).toThrow(RangeError);
    });
  });

  describe("calcularProximaDataTermino", () => {
    it("deve avançar +1 dia na recorrência DIARIA e +7 dias na SEMANAL quando a data é futura (CA03)", () => {
      const hoje = "2026-11-04";

      expect(
        calcularProximaDataTermino("2026-11-10", "DIARIA", null, hoje)
      ).toBe("2026-11-11");

      expect(
        calcularProximaDataTermino("2026-11-10", "SEMANAL", null, hoje)
      ).toBe("2026-11-17");
    });

    it("deve preservar o dia-base 31 na série mensal 31/01/2026 → 28/02/2026 → 31/03/2026 → 30/04/2026 (CA05)", () => {
      const dataFev = calcularProximaDataTermino(
        "2026-01-31",
        "MENSAL",
        31,
        "2026-01-15"
      );
      expect(dataFev).toBe("2026-02-28");

      const dataMar = calcularProximaDataTermino(
        dataFev,
        "MENSAL",
        31,
        "2026-02-15"
      );
      expect(dataMar).toBe("2026-03-31");

      const dataAbr = calcularProximaDataTermino(
        dataMar,
        "MENSAL",
        31,
        "2026-03-15"
      );
      expect(dataAbr).toBe("2026-04-30");
    });

    it("deve tratar corretamente o ano bissexto na série 31/01/2028 → 29/02/2028 → 31/03/2028 (CA06)", () => {
      const dataFevBissexto = calcularProximaDataTermino(
        "2028-01-31",
        "MENSAL",
        31,
        "2028-01-15"
      );
      expect(dataFevBissexto).toBe("2028-02-29");

      const dataMarPosBissexto = calcularProximaDataTermino(
        dataFevBissexto,
        "MENSAL",
        31,
        "2028-02-15"
      );
      expect(dataMarPosBissexto).toBe("2028-03-31");
    });

    it("deve avançar múltiplos ciclos em tarefas atrasadas até encontrar data estritamente futura (CA04)", () => {
      const hoje = "2026-11-04";

      // Semanal atrasada: 15/10 -> 22/10 -> 29/10 -> 05/11 (> 04/11)
      expect(
        calcularProximaDataTermino("2026-10-15", "SEMANAL", null, hoje)
      ).toBe("2026-11-05");

      // Diária atrasada: 01/11 -> avança até 05/11 (> 04/11)
      expect(
        calcularProximaDataTermino("2026-11-01", "DIARIA", null, hoje)
      ).toBe("2026-11-05");

      // Mensal atrasada iniciada em 31/01/2026 concluída em 15/03/2026 -> 28/02 <= hoje -> 31/03/2026
      expect(
        calcularProximaDataTermino("2026-01-31", "MENSAL", 31, "2026-03-15")
      ).toBe("2026-03-31");
    });

    it("deve avançar mais um ciclo quando a data calculada cair exatamente na data de hoje (garantindo > hoje)", () => {
      const hoje = "2026-11-04";

      // Diária com vencimento ontem (03/11): +1 dia seria 04/11 (=== hoje), deve avançar para 05/11
      expect(
        calcularProximaDataTermino("2026-11-03", "DIARIA", null, hoje)
      ).toBe("2026-11-05");

      // Semanal com vencimento há 7 dias (28/10): +7 dias seria 04/11 (=== hoje), deve avançar para 11/11
      expect(
        calcularProximaDataTermino("2026-10-28", "SEMANAL", null, hoje)
      ).toBe("2026-11-11");

      // Mensal com vencimento em 04/10: +1 mês seria 04/11 (=== hoje), deve avançar para 04/12
      expect(
        calcularProximaDataTermino("2026-10-04", "MENSAL", 4, hoje)
      ).toBe("2026-12-04");
    });

    it("deve funcionar na virada de ano (dezembro para janeiro)", () => {
      expect(
        calcularProximaDataTermino("2026-12-31", "DIARIA", null, "2026-12-31")
      ).toBe("2027-01-01");

      expect(
        calcularProximaDataTermino("2026-12-28", "SEMANAL", null, "2026-12-28")
      ).toBe("2027-01-04");

      expect(
        calcularProximaDataTermino("2026-12-31", "MENSAL", 31, "2026-12-31")
      ).toBe("2027-01-31");
    });

    it("deve utilizar a data local do usuário quando dataReferenciaHoje for omitida", () => {
      // Simula 2026-11-04 às 23:30 no horário local (mesmo que em UTC já fosse dia 05/11)
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 10, 4, 23, 30, 0));

      // Data de término 2026-11-03 + 1 dia = 2026-11-04 (=== hoje local), portanto deve avançar para 2026-11-05
      expect(calcularProximaDataTermino("2026-11-03", "DIARIA")).toBe(
        "2026-11-05"
      );
    });

    it("deve lançar erro para datas de término inválidas ou recorrência NENHUMA", () => {
      expect(() =>
        calcularProximaDataTermino("2026-02-29", "DIARIA", null, "2026-02-01")
      ).toThrow();
      expect(() =>
        calcularProximaDataTermino("2026-04-31", "MENSAL", 31, "2026-04-01")
      ).toThrow();
      expect(() =>
        calcularProximaDataTermino("", "DIARIA", null, "2026-11-04")
      ).toThrow();
      expect(() =>
        calcularProximaDataTermino("2026-11-10", "NENHUMA", null, "2026-11-04")
      ).toThrow();
    });
  });

  describe("deveGerarSucessora", () => {
    it("deve retornar true apenas para tarefa recorrente com status DONE, sucessoraGerada false e dataTermino válida", () => {
      expect(
        deveGerarSucessora({
          id: 1,
          nome: "Backup",
          dataTermino: "2026-11-10",
          status: "DONE",
          recorrencia: "DIARIA",
          sucessoraGerada: false,
        })
      ).toBe(true);
    });

    it("deve retornar false quando sucessoraGerada for true (CA08)", () => {
      expect(
        deveGerarSucessora({
          id: 1,
          nome: "Backup",
          dataTermino: "2026-11-10",
          status: "DONE",
          recorrencia: "DIARIA",
          sucessoraGerada: true,
        })
      ).toBe(false);
    });

    it("deve retornar false para tarefas com recorrencia NENHUMA ou ausente (CA01)", () => {
      expect(
        deveGerarSucessora({
          id: 1,
          nome: "Tarefa avulsa",
          dataTermino: "2026-11-10",
          status: "DONE",
          recorrencia: "NENHUMA",
          sucessoraGerada: false,
        })
      ).toBe(false);

      expect(
        deveGerarSucessora({
          id: 2,
          nome: "Tarefa legada",
          dataTermino: "2026-11-10",
          status: "DONE",
        })
      ).toBe(false);
    });

    it("deve retornar false quando status for TODO ou DOING, ou quando dataTermino for inválida/vazia", () => {
      expect(
        deveGerarSucessora({
          id: 1,
          nome: "Em andamento",
          dataTermino: "2026-11-10",
          status: "DOING",
          recorrencia: "SEMANAL",
          sucessoraGerada: false,
        })
      ).toBe(false);

      expect(
        deveGerarSucessora({
          id: 2,
          nome: "Sem data",
          dataTermino: "",
          status: "DONE",
          recorrencia: "MENSAL",
          sucessoraGerada: false,
        })
      ).toBe(false);

      expect(
        deveGerarSucessora({
          id: 3,
          nome: "Fevereiro não bissexto inexistente",
          dataTermino: "2026-02-29",
          status: "DONE",
          recorrencia: "MENSAL",
          sucessoraGerada: false,
        })
      ).toBe(false);

      expect(
        deveGerarSucessora({
          id: 4,
          nome: "Abril com dia 31 inexistente",
          dataTermino: "2026-04-31",
          status: "DONE",
          recorrencia: "DIARIA",
          sucessoraGerada: false,
        })
      ).toBe(false);
    });
  });

  describe("gerarTarefaSucessora", () => {
    it("deve construir uma nova tarefa TODO com novo ID, sucessoraGerada false, preservando diaBaseRecorrencia e sem mutar a tarefa original", () => {
      const tarefaConcluida = {
        id: 1,
        nome: "Fechamento contábil",
        descricao: "Enviar balancete",
        dataTermino: "2026-01-31",
        prioridade: 1,
        categoria: "Finanças",
        status: "DONE",
        recorrencia: "MENSAL",
        diaBaseRecorrencia: 31,
        sucessoraGerada: true,
      };
      const copiaOriginal = { ...tarefaConcluida };

      const primeiraSucessora = gerarTarefaSucessora(
        tarefaConcluida,
        2,
        "2026-01-31"
      );

      expect(primeiraSucessora).toEqual({
        id: 2,
        nome: "Fechamento contábil",
        descricao: "Enviar balancete",
        dataTermino: "2026-02-28",
        prioridade: 1,
        categoria: "Finanças",
        status: "TODO",
        recorrencia: "MENSAL",
        diaBaseRecorrencia: 31,
        sucessoraGerada: false,
      });
      expect(tarefaConcluida).toEqual(copiaOriginal);

      // Concluindo a ocorrência de fevereiro (28/02), a próxima deve voltar para 31/03
      const segundaSucessora = gerarTarefaSucessora(
        { ...primeiraSucessora, status: "DONE", sucessoraGerada: true },
        3,
        "2026-02-28"
      );

      expect(segundaSucessora.dataTermino).toBe("2026-03-31");
      expect(segundaSucessora.diaBaseRecorrencia).toBe(31);
      expect(segundaSucessora.status).toBe("TODO");
      expect(segundaSucessora.sucessoraGerada).toBe(false);
    });
  });
});
