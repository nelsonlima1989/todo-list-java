package com.todolist.service;

import com.todolist.model.Status;
import com.todolist.model.Tarefa;
import com.todolist.repository.TarefaRepository;

import java.util.List;
import java.util.Comparator;
import java.time.LocalDate;

public class TarefaService {
    private final TarefaRepository repository;

    private int proximoId = 1;

    public TarefaService(TarefaRepository repository) {
        this.repository = repository;
    }

    public void criarTarefa(
            String nome,
            String descricao,
            LocalDate dataTermino,
            int prioridade,
            String categoria
    ){
        if (prioridade < 1 || prioridade > 5){
            System.out.println("A prioridade deve estar entre 1 e 5.");
            return;
        }

        Tarefa tarefa = new Tarefa(
                proximoId++,
                nome,
                descricao,
                dataTermino,
                prioridade,
                categoria,
                Status.TODO
        );

        repository.salvar(tarefa);

        System.out.println("Tarefa criada com sucesso!");
    }

    public List<Tarefa> listarTarefas(){
        return repository.listar();
    }

    public List<Tarefa> listarPorCategoria(String categoria) {
        return repository.listar()
                .stream()
                .filter(tarefa ->
                        tarefa.getCategoria().equalsIgnoreCase(categoria)
                )
                .toList();
    }

    public List<Tarefa> listarPorPrioridade(int prioridade) {
        if (prioridade < 1 || prioridade > 5) {
            System.out.println("A prioridade deve estar entre 1 e 5.");
            return List.of();
        }

        List<Tarefa> tarefasFiltradas = repository.listar()
                .stream()
                .filter(tarefa -> tarefa.getPrioridade() == prioridade)
                .toList();

        if (tarefasFiltradas.isEmpty()) {
            System.out.println("Não existem tarefas com prioridade " + prioridade + ".");
        }

        return tarefasFiltradas;

    }

    public boolean removerTarefa(int id) {
        return repository.remover(id);
    }


    private void ordenarPorPrioridades(){
        repository.listar().sort(
                Comparator.comparingInt(Tarefa::getPrioridade)
        );
    }

    public List<Tarefa> listarOrdenadasPorPrioridade() {
        ordenarPorPrioridades();
        return repository.listar();
    }

    public List<Tarefa> listarPorStatus(Status status) {
        return repository.listar()
                .stream()
                .filter(tarefa -> tarefa.getStatus() == status)
                .toList();
    }


    public boolean alterarStatus(int id, Status novoStatus) {

        Tarefa tarefa = repository.buscarPorId(id);

        if (tarefa == null) {
            return false;
        }

        tarefa.setStatus(novoStatus);

        return true;
    }



}
