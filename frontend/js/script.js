// ESTADO DA APLICAÇÃO

const tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];

let editandoPorId = null;

// DEFINE O PRÓXIMO ID DISPONÍVEL
let proximoId =
  tarefas.length > 0 ? Math.max(...tarefas.map((tarefa) => tarefa.id)) + 1 : 1;

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

  tarefasSelecionadas.forEach((tarefa) => {
    tarefa.status = novoStatus;
  });

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
  const dataTermino = document.getElementById("data-termino").value;
  const prioridade = Number(document.getElementById("prioridade").value);
  const categoria = document.getElementById("categoria").value;
  const status = document.getElementById("status").value;

  if (editandoPorId === null) {
    const tarefa = {
      id: proximoId++,
      nome: nome,
      descricao: descricao,
      dataTermino: dataTermino,
      prioridade: prioridade,
      categoria: categoria,
      status: status,
    };

    tarefas.push(tarefa);
    salvarTarefas();
  } else {
    const tarefaExistente = tarefas.find((tarefa) => {
      return tarefa.id === editandoPorId;
    });

    tarefaExistente.nome = nome;
    tarefaExistente.descricao = descricao;
    tarefaExistente.dataTermino = dataTermino;
    tarefaExistente.prioridade = prioridade;
    tarefaExistente.categoria = categoria;
    tarefaExistente.status = status;

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
    const classeStatus = `status-${tarefa.status.toLowerCase()}`;

    const tarefaHTML = `
      <div class="task-card">

        <input
          type="checkbox"
          class="task-checkbox"
          data-id="${tarefa.id}"
        >

        <div class="task-priority">
          PRIORIDADE ${tarefa.prioridade}
        </div>

        <div class="task-content">

          <div class="task-header">

            <h3>${tarefa.nome}</h3>

            <span class="task-status ${classeStatus}">
              ${tarefa.status}
            </span>

          </div>

          <p>
            ${tarefa.descricao}
          </p>

          <div class="task-information">
            <span>📁 Categoria: ${tarefa.categoria}</span>
            <span>📅 Data: ${tarefa.dataTermino}</span>
          </div>

        </div>

        <div class="task-actions">

          <button class="btn-edit" data-id="${tarefa.id}">
            Editar
          </button>

          <button class="btn-delete" data-id="${tarefa.id}">
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
    document.getElementById("data-termino").value = tarefa.dataTermino;
    document.getElementById("prioridade").value = tarefa.prioridade;
    document.getElementById("categoria").value = tarefa.categoria;
    document.getElementById("status").value = tarefa.status;

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

botaoLimpar.addEventListener("click", () => {
  editandoPorId = null;

  botaoSubmit.textContent = "Criar tarefa";
});

// CARREGAR TAREFAS AO ABRIR A APLICAÇÃO

renderizarTarefas();
