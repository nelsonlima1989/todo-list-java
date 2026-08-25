package com.todolist.repository;
import com.todolist.model.Tarefa;
import java.util.ArrayList;
import java.util.List;

public class TarefaRepository {

    private final List<Tarefa> tarefas = new ArrayList<>();

    public void salvar(Tarefa tarefa){
        tarefas.add(tarefa);
    }

    public List<Tarefa> listar(){
        return tarefas;
    }

    public Tarefa buscarPorId(int id){
        for (Tarefa tarefa : tarefas){
            if(tarefa.getId() == id){
                return tarefa;
            }
        }

        return null;
    }

    public boolean remover(int id){
        Tarefa tarefa = buscarPorId(id);
        if(tarefa != null){
            tarefas.remove(tarefa);
            return true;
        }
        return false;
    }



}
