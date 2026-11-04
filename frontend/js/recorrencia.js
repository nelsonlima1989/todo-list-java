// CONSTANTES DE RECORRÊNCIA

export const RECORRENCIAS_VALIDAS = Object.freeze([
  "NENHUMA",
  "DIARIA",
  "SEMANAL",
  "MENSAL",
]);

// UTILITÁRIOS DE DATA (ISO YYYY-MM-DD SEM IMPACTO DE FUSO HORÁRIO OU HORÁRIO DE VERÃO)

const REGEX_DATA_ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

const formatarDataISO = (ano, mes, dia) => {
  const anoTexto = String(ano).padStart(4, "0");
  const mesTexto = String(mes).padStart(2, "0");
  const diaTexto = String(dia).padStart(2, "0");

  return `${anoTexto}-${mesTexto}-${diaTexto}`;
};

const obterDataHojeISO = () => {
  const agora = new Date();

  return formatarDataISO(
    agora.getFullYear(),
    agora.getMonth() + 1,
    agora.getDate()
  );
};

/**
 * Retorna o último dia do mês informado (28, 29, 30 ou 31), tratando anos bissextos.
 * @param {number} ano - Ano com 4 dígitos (ex.: 2026, 2028).
 * @param {number} mes - Mês de 1 (janeiro) a 12 (dezembro).
 * @returns {number} Último dia válido do mês.
 */
export const obterUltimoDiaDoMes = (ano, mes) => {
  if (!Number.isInteger(ano) || !Number.isInteger(mes) || mes < 1 || mes > 12) {
    throw new RangeError(
      "Ano deve ser inteiro e mês deve ser um inteiro entre 1 e 12."
    );
  }

  return new Date(Date.UTC(ano, mes, 0)).getUTCDate();
};

const extrairPartesDataISO = (dataTexto) => {
  if (typeof dataTexto !== "string") {
    return null;
  }

  const correspondencia = REGEX_DATA_ISO.exec(dataTexto.trim());
  if (!correspondencia) {
    return null;
  }

  const ano = Number(correspondencia[1]);
  const mes = Number(correspondencia[2]);
  const dia = Number(correspondencia[3]);

  if (mes < 1 || mes > 12) {
    return null;
  }

  const ultimoDia = obterUltimoDiaDoMes(ano, mes);
  if (dia < 1 || dia > ultimoDia) {
    return null;
  }

  return { ano, mes, dia };
};

const resolverDataReferenciaISO = (dataReferenciaHoje) => {
  if (dataReferenciaHoje === undefined || dataReferenciaHoje === null) {
    return obterDataHojeISO();
  }

  if (dataReferenciaHoje instanceof Date) {
    if (Number.isNaN(dataReferenciaHoje.getTime())) {
      throw new Error("Data de referência inválida.");
    }

    return formatarDataISO(
      dataReferenciaHoje.getFullYear(),
      dataReferenciaHoje.getMonth() + 1,
      dataReferenciaHoje.getDate()
    );
  }

  const partes = extrairPartesDataISO(dataReferenciaHoje);
  if (!partes) {
    throw new Error("Data de referência deve estar no formato válido YYYY-MM-DD.");
  }

  return formatarDataISO(partes.ano, partes.mes, partes.dia);
};

// NORMALIZAÇÃO E RETROCOMPATIBILIDADE DE TAREFAS

export const normalizarTarefa = (tarefa) => {
  if (!tarefa || typeof tarefa !== "object") {
    throw new TypeError("O objeto de tarefa informado é inválido.");
  }

  const recorrenciaValida = RECORRENCIAS_VALIDAS.includes(tarefa.recorrencia)
    ? tarefa.recorrencia
    : "NENHUMA";

  const sucessoraGerada = Boolean(tarefa.sucessoraGerada);

  let diaBaseRecorrencia = null;

  if (recorrenciaValida === "MENSAL") {
    if (
      Number.isInteger(tarefa.diaBaseRecorrencia) &&
      tarefa.diaBaseRecorrencia >= 1 &&
      tarefa.diaBaseRecorrencia <= 31
    ) {
      diaBaseRecorrencia = tarefa.diaBaseRecorrencia;
    } else {
      const partesData = extrairPartesDataISO(tarefa.dataTermino);
      diaBaseRecorrencia = partesData ? partesData.dia : null;
    }
  }

  return {
    ...tarefa,
    recorrencia: recorrenciaValida,
    diaBaseRecorrencia,
    sucessoraGerada,
  };
};

// CÁLCULO DE PRÓXIMA DATA DE TÉRMINO

const avancarUmDiaUTC = (ano, mes, dia) => {
  const dataUTC = new Date(Date.UTC(ano, mes - 1, dia + 1));

  return {
    ano: dataUTC.getUTCFullYear(),
    mes: dataUTC.getUTCMonth() + 1,
    dia: dataUTC.getUTCDate(),
  };
};

const avancarSeteDiasUTC = (ano, mes, dia) => {
  const dataUTC = new Date(Date.UTC(ano, mes - 1, dia + 7));

  return {
    ano: dataUTC.getUTCFullYear(),
    mes: dataUTC.getUTCMonth() + 1,
    dia: dataUTC.getUTCDate(),
  };
};

const calcularDataMensalPorCiclo = (anoInicial, mesInicial, diaBase, ciclos) => {
  const totalMeses = anoInicial * 12 + (mesInicial - 1) + ciclos;
  const anoDestino = Math.floor(totalMeses / 12);
  const mesDestino = (totalMeses % 12) + 1;
  const ultimoDiaDestino = obterUltimoDiaDoMes(anoDestino, mesDestino);
  const diaDestino = Math.min(diaBase, ultimoDiaDestino);

  return {
    ano: anoDestino,
    mes: mesDestino,
    dia: diaDestino,
  };
};

export const calcularProximaDataTermino = (
  dataTerminoAtual,
  recorrencia,
  diaBaseRecorrencia = null,
  dataReferenciaHoje = undefined
) => {
  const partesAtuais = extrairPartesDataISO(dataTerminoAtual);
  if (!partesAtuais) {
    throw new Error("A data de término atual é inválida ou está vazia.");
  }

  if (
    !RECORRENCIAS_VALIDAS.includes(recorrencia) ||
    recorrencia === "NENHUMA"
  ) {
    throw new Error(
      "A recorrência deve ser DIARIA, SEMANAL ou MENSAL para calcular a próxima data."
    );
  }

  const hojeISO = resolverDataReferenciaISO(dataReferenciaHoje);

  if (recorrencia === "DIARIA") {
    let proximo = avancarUmDiaUTC(
      partesAtuais.ano,
      partesAtuais.mes,
      partesAtuais.dia
    );
    let proximaDataISO = formatarDataISO(proximo.ano, proximo.mes, proximo.dia);

    while (proximaDataISO <= hojeISO) {
      proximo = avancarUmDiaUTC(proximo.ano, proximo.mes, proximo.dia);
      proximaDataISO = formatarDataISO(proximo.ano, proximo.mes, proximo.dia);
    }

    return proximaDataISO;
  }

  if (recorrencia === "SEMANAL") {
    let proximo = avancarSeteDiasUTC(
      partesAtuais.ano,
      partesAtuais.mes,
      partesAtuais.dia
    );
    let proximaDataISO = formatarDataISO(proximo.ano, proximo.mes, proximo.dia);

    while (proximaDataISO <= hojeISO) {
      proximo = avancarSeteDiasUTC(proximo.ano, proximo.mes, proximo.dia);
      proximaDataISO = formatarDataISO(proximo.ano, proximo.mes, proximo.dia);
    }

    return proximaDataISO;
  }

  const diaAlvo =
    Number.isInteger(diaBaseRecorrencia) &&
    diaBaseRecorrencia >= 1 &&
    diaBaseRecorrencia <= 31
      ? diaBaseRecorrencia
      : partesAtuais.dia;

  let ciclos = 1;
  let proximo = calcularDataMensalPorCiclo(
    partesAtuais.ano,
    partesAtuais.mes,
    diaAlvo,
    ciclos
  );
  let proximaDataISO = formatarDataISO(proximo.ano, proximo.mes, proximo.dia);

  while (proximaDataISO <= hojeISO) {
    ciclos += 1;
    proximo = calcularDataMensalPorCiclo(
      partesAtuais.ano,
      partesAtuais.mes,
      diaAlvo,
      ciclos
    );
    proximaDataISO = formatarDataISO(proximo.ano, proximo.mes, proximo.dia);
  }

  return proximaDataISO;
};

// ELEGIBILIDADE E GERAÇÃO DE TAREFA SUCESSORA

export const deveGerarSucessora = (tarefa) => {
  if (!tarefa || typeof tarefa !== "object") {
    return false;
  }

  const recorrenciaValida =
    RECORRENCIAS_VALIDAS.includes(tarefa.recorrencia) &&
    tarefa.recorrencia !== "NENHUMA";

  if (!recorrenciaValida) {
    return false;
  }

  if (tarefa.status !== "DONE") {
    return false;
  }

  if (Boolean(tarefa.sucessoraGerada) !== false) {
    return false;
  }

  const partesData = extrairPartesDataISO(tarefa.dataTermino);
  return partesData !== null;
};

export const gerarTarefaSucessora = (
  tarefaConcluida,
  novoId,
  dataReferenciaHoje = undefined
) => {
  const tarefaNormalizada = normalizarTarefa(tarefaConcluida);

  const novaDataTermino = calcularProximaDataTermino(
    tarefaNormalizada.dataTermino,
    tarefaNormalizada.recorrencia,
    tarefaNormalizada.diaBaseRecorrencia,
    dataReferenciaHoje
  );

  return {
    id: novoId,
    nome: tarefaNormalizada.nome,
    descricao: tarefaNormalizada.descricao,
    dataTermino: novaDataTermino,
    prioridade: tarefaNormalizada.prioridade,
    categoria: tarefaNormalizada.categoria,
    status: "TODO",
    recorrencia: tarefaNormalizada.recorrencia,
    diaBaseRecorrencia:
      tarefaNormalizada.recorrencia === "MENSAL"
        ? tarefaNormalizada.diaBaseRecorrencia
        : null,
    sucessoraGerada: false,
  };
};

