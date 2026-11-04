import {
  RECORRENCIAS_VALIDAS,
  deveGerarSucessora,
  ehDataTerminoValida,
  gerarTarefaSucessora,
  normalizarTarefa,
} from "./recorrencia.js";

// ESTADO DA APLICAÇÃO

const STATUS_VALIDOS = Object.freeze(["TODO", "DOING", "DONE"]);

const ehIdInteiroPositivo = (id) => {
  return Number.isSafeInteger(id) && id > 0;
};

const alocarProximoIdSeguro = (candidatoInicial, conjuntoIdsOcupados) => {
  let candidato = ehIdInteiroPositivo(candidatoInicial) ? candidatoInicial : 1;

  while (conjuntoIdsOcupados.has(candidato)) {
    if (candidato >= Number.MAX_SAFE_INTEGER) {
      candidato = 1;
      break;
    }
    candidato += 1;
  }

  while (conjuntoIdsOcupados.has(candidato)) {
    candidato += 1;
  }

  const proximoCandidato =
    candidato < Number.MAX_SAFE_INTEGER ? candidato + 1 : 1;

  return { idAlocado: candidato, proximoCandidato };
};

const carregarTarefasIniciais = () => {
  const textoBruto = localStorage.getItem("tarefas");
  if (!textoBruto) {
    return { lista: [], proximoIdInicial: 1 };
  }

  let dadosAnalisados;
  try {
    dadosAnalisados = JSON.parse(textoBruto);
  } catch {
    return { lista: [], proximoIdInicial: 1 };
  }

  if (!Array.isArray(dadosAnalisados)) {
    return { lista: [], proximoIdInicial: 1 };
  }

  const registrosObjetos = dadosAnalisados.filter((item) =>
    Boolean(item && typeof item === "object" && !Array.isArray(item))
  );

  const idsValidosExistentes = registrosObjetos
    .map((item) => item.id)
    .filter((id) => ehIdInteiroPositivo(id));

  const maiorIdValidoExistente =
    idsValidosExistentes.length > 0 ? Math.max(...idsValidosExistentes) : 0;

  let proximoIdDisponivel =
    maiorIdValidoExistente > 0 &&
    maiorIdValidoExistente < Number.MAX_SAFE_INTEGER
      ? maiorIdValidoExistente + 1
      : 1;

  const idsOcupados = new Set(idsValidosExistentes);
  const idsJaAtribuidos = new Set();

  const listaNormalizada = registrosObjetos.map((registro) => {
    let idFinal;
    if (
      ehIdInteiroPositivo(registro.id) &&
      !idsJaAtribuidos.has(registro.id)
    ) {
      idFinal = registro.id;
    } else {
      const alocacao = alocarProximoIdSeguro(proximoIdDisponivel, idsOcupados);
      idFinal = alocacao.idAlocado;
      proximoIdDisponivel = alocacao.proximoCandidato;
      idsOcupados.add(idFinal);
    }
    idsJaAtribuidos.add(idFinal);

    const prioridadeNumerica = Number(registro.prioridade);
    const prioridadeValida =
      Number.isInteger(prioridadeNumerica) &&
      prioridadeNumerica >= 1 &&
      prioridadeNumerica <= 5
        ? prioridadeNumerica
        : 1;

    const statusValido = STATUS_VALIDOS.includes(registro.status)
      ? registro.status
      : "TODO";

    return normalizarTarefa({
      ...registro,
      id: idFinal,
      nome:
        typeof registro.nome === "string"
          ? registro.nome
          : String(registro.nome ?? ""),
      descricao:
        typeof registro.descricao === "string"
          ? registro.descricao
          : String(registro.descricao ?? ""),
      dataTermino:
        typeof registro.dataTermino === "string" ? registro.dataTermino : "",
      prioridade: prioridadeValida,
      categoria:
        typeof registro.categoria === "string"
          ? registro.categoria
          : String(registro.categoria ?? ""),
      status: statusValido,
    });
  });

  const { idAlocado: proximoIdInicial } = alocarProximoIdSeguro(
    proximoIdDisponivel,
    idsOcupados
  );

  return {
    lista: listaNormalizada,
    proximoIdInicial,
  };
};

const { lista: tarefas, proximoIdInicial } = carregarTarefasIniciais();

let editandoPorId = null;

// DEFINE O PRÓXIMO ID DISPONÍVEL
let proximoId = proximoIdInicial;

const gerarProximoId = (idsReservadosExtras = []) => {
  const idsOcupados = new Set([
    ...tarefas.map((tarefa) => tarefa.id),
    ...idsReservadosExtras,
  ]);
  const { idAlocado, proximoCandidato } = alocarProximoIdSeguro(
    proximoId,
    idsOcupados
  );
  proximoId = proximoCandidato;
  return idAlocado;
};

// PERSISTÊNCIA

const salvarTarefas = () => {
  localStorage.setItem("tarefas", JSON.stringify(tarefas));
};

// ELEMENTOS DA INTERFACE

const formulario = document.getElementById("form-tarefa");

const listaTarefas = document.getElementById("lista-tarefas");

const botaoSubmit = formulario.querySelector('button[type="submit"]');

const totalTarefas = document.getElementById("total-tarefas");

const tarefasTodo = document.getElementById("tarefas-todo");

const tarefasDoing = document.getElementById("tarefas-doing");

const tarefasDone = document.getElementById("tarefas-done");

const filtroStatus = document.getElementById("filtro-status");

const botaoLimpar = formulario.querySelector('button[type="reset"]');

const statusMultiplo = document.getElementById("status-multiplo");

const botaoStatusMultiplo = document.getElementById("btn-status-multiplo");

const campoDataTermino = document.getElementById("data-termino");

const campoRecorrencia = document.getElementById("recorrencia");

// SINCRONIZAR OBRIGATORIEDADE DA DATA DE TÉRMINO

const sincronizarObrigatoriedadeDataTermino = () => {
  campoDataTermino.required = campoRecorrencia.value !== "NENHUMA";
};

campoRecorrencia.addEventListener("change", () => {
  sincronizarObrigatoriedadeDataTermino();
});

sincronizarObrigatoriedadeDataTermino();


//SETAR STATUS MULTIPLAS TAREFAS

botaoStatusMultiplo.addEventListener("click", () => {  

  const checkboxesSelecionados = document.querySelectorAll(
    ".task-checkbox:checked"
  );

  const idsSelecionados = Array.from(checkboxesSelecionados).map((checkbox) => {
    return Number(checkbox.dataset.id);
  });  

  const tarefasSelecionadas = tarefas.filter((tarefa) => {
    return idsSelecionados.includes(tarefa.id);
  });  

  const novoStatus = statusMultiplo.value;  

  const novasTarefasSucessoras = [];

  tarefasSelecionadas.forEach((tarefa) => {
    tarefa.status = novoStatus;

    if (deveGerarSucessora(tarefa)) {
      const idsExtras = novasTarefasSucessoras.map((sucessora) => sucessora.id);
      const tarefaSucessora = gerarTarefaSucessora(
        tarefa,
        gerarProximoId(idsExtras)
      );
      tarefa.sucessoraGerada = true;
      novasTarefasSucessoras.push(tarefaSucessora);
    }
  });

  if (novasTarefasSucessoras.length > 0) {
    tarefas.push(...novasTarefasSucessoras);
  }

  if (editandoPorId !== null && idsSelecionados.includes(editandoPorId)) {
    document.getElementById("status").value = novoStatus;
  }

  salvarTarefas();

  renderizarTarefas(); 

});


// ADICIONANDO FILTRO POR STATUS

filtroStatus.addEventListener("change", () => {
  renderizarTarefas();
});

// CRIAÇÃO OU EDIÇÃO DE TAREFA

formulario.addEventListener("submit", (event) => {
  event.preventDefault();

  const nome = document.getElementById("nome").value;
  const descricao = document.getElementById("descricao").value;
  const dataTermino = campoDataTermino.value;
  const prioridade = Number(document.getElementById("prioridade").value);
  const categoria = document.getElementById("categoria").value;
  const status = document.getElementById("status").value;
  const recorrencia = RECORRENCIAS_VALIDAS.includes(campoRecorrencia.value)
    ? campoRecorrencia.value
    : "NENHUMA";

  if (recorrencia !== "NENHUMA" && !dataTermino.trim()) {
    campoDataTermino.required = true;
    return alert(
      "A data de término é obrigatória para tarefas com recorrência!",
    );
  }

  if (recorrencia !== "NENHUMA" && !ehDataTerminoValida(dataTermino)) {
    return alert(
      "A data de término informada é inválida! Utilize uma data real no formato AAAA-MM-DD.",
    );
  }

  if (editandoPorId === null) {
    const tarefa = normalizarTarefa({
      id: gerarProximoId(),
      nome: nome,
      descricao: descricao,
      dataTermino: dataTermino,
      prioridade: prioridade,
      categoria: categoria,
      status: status,
      recorrencia: recorrencia,
      diaBaseRecorrencia: null,
      sucessoraGerada: false,
    });

    tarefas.push(tarefa);

    if (deveGerarSucessora(tarefa)) {
      const tarefaSucessora = gerarTarefaSucessora(tarefa, gerarProximoId());
      tarefa.sucessoraGerada = true;
      tarefas.push(tarefaSucessora);
    }

    salvarTarefas();
  } else {
    const tarefaExistente = tarefas.find((tarefa) => {
      return tarefa.id === editandoPorId;
    });

    const preservarDiaBaseMensal =
      recorrencia === "MENSAL" &&
      tarefaExistente.recorrencia === "MENSAL" &&
      tarefaExistente.dataTermino === dataTermino;

    const tarefaAtualizada = normalizarTarefa({
      ...tarefaExistente,
      nome: nome,
      descricao: descricao,
      dataTermino: dataTermino,
      prioridade: prioridade,
      categoria: categoria,
      status: status,
      recorrencia: recorrencia,
      diaBaseRecorrencia: preservarDiaBaseMensal
        ? tarefaExistente.diaBaseRecorrencia
        : null,
      sucessoraGerada: Boolean(tarefaExistente.sucessoraGerada),
    });

    Object.assign(tarefaExistente, tarefaAtualizada);

    if (deveGerarSucessora(tarefaExistente)) {
      const tarefaSucessora = gerarTarefaSucessora(
        tarefaExistente,
        gerarProximoId()
      );
      tarefaExistente.sucessoraGerada = true;
      tarefas.push(tarefaSucessora);
    }

    salvarTarefas();
  }

  editandoPorId = null;

  botaoSubmit.textContent = "Criar tarefa";

  renderizarTarefas();

  formulario.reset();
});

//ATUALIZAR ESTATÍSTICAS

const atualizarEstatisticas = () => {
  totalTarefas.textContent = tarefas.length;

  tarefasTodo.textContent = tarefas.filter((tarefa) => {
    return tarefa.status === "TODO";
  }).length;

  tarefasDoing.textContent = tarefas.filter((tarefa) => {
    return tarefa.status === "DOING";
  }).length;

  tarefasDone.textContent = tarefas.filter((tarefa) => {
    return tarefa.status === "DONE";
  }).length;
};

//RENDERIZAR TAREFAS

const ROTULOS_RECORRENCIA = Object.freeze({
  DIARIA: "Diária",
  SEMANAL: "Semanal",
  MENSAL: "Mensal",
});

const escaparHTML = (valor) => {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const renderizarTarefas = () => {
  listaTarefas.innerHTML = "";

  atualizarEstatisticas();

  const statusSelecionado = filtroStatus.value;

  const tarefasFiltradas = tarefas.filter((tarefa) => {
    if (statusSelecionado === "TODOS") {
      return true;
    }

    return tarefa.status === statusSelecionado;
  });

  if (tarefasFiltradas.length === 0) {
    listaTarefas.innerHTML = `
      <div class="empty-state">
        <h3>Nenhuma tarefa encontrada</h3>
        <p>Não existem tarefas para o filtro selecionado.</p>
      </div>
    `;

    return;
  }

  tarefasFiltradas.forEach((tarefa) => {
    const statusSeguro = STATUS_VALIDOS.includes(tarefa.status)
      ? tarefa.status
      : "TODO";
    const classeStatus = `status-${statusSeguro.toLowerCase()}`;
    const idSeguro = escaparHTML(tarefa.id);
    const prioridadeSegura = escaparHTML(tarefa.prioridade);
    const nomeSeguro = escaparHTML(tarefa.nome);
    const descricaoSegura = escaparHTML(tarefa.descricao);
    const categoriaSegura = escaparHTML(tarefa.categoria);
    const dataTerminoSegura = escaparHTML(tarefa.dataTermino);

    const rotuloRecorrencia = Object.prototype.hasOwnProperty.call(
      ROTULOS_RECORRENCIA,
      tarefa.recorrencia
    )
      ? ROTULOS_RECORRENCIA[tarefa.recorrencia]
      : null;

    const indicadorRecorrenciaHTML = rotuloRecorrencia
      ? `<span class="task-recurrence">🔁 Recorrência: ${rotuloRecorrencia}</span>`
      : "";

    const tarefaHTML = `
      <div class="task-card">

        <input
          type="checkbox"
          class="task-checkbox"
          data-id="${idSeguro}"
        >

        <div class="task-priority">
          PRIORIDADE ${prioridadeSegura}
        </div>

        <div class="task-content">

          <div class="task-header">

            <h3>${nomeSeguro}</h3>

            <span class="task-status ${classeStatus}">
              ${statusSeguro}
            </span>

          </div>

          <p>
            ${descricaoSegura}
          </p>

          <div class="task-information">
            <span>📁 Categoria: ${categoriaSegura}</span>
            <span>📅 Data: ${dataTerminoSegura}</span>
            ${indicadorRecorrenciaHTML}
          </div>

        </div>

        <div class="task-actions">

          <button class="btn-edit" data-id="${idSeguro}">
            Editar
          </button>

          <button class="btn-delete" data-id="${idSeguro}">
            Excluir
          </button>

        </div>

      </div>
    `;

    listaTarefas.innerHTML += tarefaHTML;
  });
};

// BOTÃO EDITAR

listaTarefas.addEventListener("click", (event) => {
  if (event.target.classList.contains("btn-edit")) {
    const id = Number(event.target.dataset.id);

    editandoPorId = id;

    const tarefa = tarefas.find((tarefa) => {
      return tarefa.id === id;
    });

    document.getElementById("nome").value = tarefa.nome;
    document.getElementById("descricao").value = tarefa.descricao;
    campoDataTermino.value = tarefa.dataTermino;
    document.getElementById("prioridade").value = tarefa.prioridade;
    document.getElementById("categoria").value = tarefa.categoria;
    document.getElementById("status").value = tarefa.status;
    campoRecorrencia.value = RECORRENCIAS_VALIDAS.includes(tarefa.recorrencia)
      ? tarefa.recorrencia
      : "NENHUMA";

    sincronizarObrigatoriedadeDataTermino();

    botaoSubmit.textContent = "Salvar tarefa";
  }

  if (event.target.classList.contains("btn-delete")) {
    const id = Number(event.target.dataset.id);

    if (editandoPorId === id) {
      return alert(
        "Não é possível excluir uma tarefa durante a edição da mesma!",
      );
    }

    const indice = tarefas.findIndex((tarefa) => {
      return tarefa.id === id;
    });

    tarefas.splice(indice, 1);
    salvarTarefas();

    renderizarTarefas();
  }
});

//BOTAO PARA LIMPAR FORMULARIO

const restaurarFormularioPadrao = () => {
  editandoPorId = null;

  botaoSubmit.textContent = "Criar tarefa";

  Array.from(campoRecorrencia.options).forEach((opcao) => {
    opcao.defaultSelected = opcao.value === "NENHUMA";
  });

  campoRecorrencia.value = "NENHUMA";

  sincronizarObrigatoriedadeDataTermino();
};

formulario.addEventListener("reset", () => {
  restaurarFormularioPadrao();
  queueMicrotask(sincronizarObrigatoriedadeDataTermino);
});

// CARREGAR TAREFAS AO ABRIR A APLICAÇÃO

renderizarTarefas();
