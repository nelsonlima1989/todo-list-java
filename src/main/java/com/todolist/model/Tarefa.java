package com.todolist.model;

import java.time.LocalDate;

public class Tarefa {
    private int id;
    private String nome;
    private String descricao;
    private LocalDate dataTermino;
    private int prioridade;
    private String categoria;
    private Status status;

    public Tarefa(
            int id,
            String nome,
            String descricao,
            LocalDate dataTermino,
            int prioridade,
            String categoria,
            Status status
    ){
        this.id = id;
        this.nome = nome;
        this.descricao = descricao;
        this.dataTermino = dataTermino;
        this.prioridade = prioridade;
        this.categoria = categoria;
        this.status = status;
    }

    public int getId(){
        return id;
    }

    public String getNome(){
        return nome;
    }

    public String getDescricao(){
        return descricao;
    }

    public LocalDate getDataTermino(){
        return dataTermino;
    }

    public int getPrioridade(){
        return prioridade;
    }

    public String getCategoria(){
        return categoria;
    }

    public Status getStatus(){
        return status;
    }

    public void setNome(String nome){
        this.nome = nome;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public void setDataTermino(LocalDate dataTermino) {
        this.dataTermino = dataTermino;
    }

    public void setPrioridade(int prioridade) {
        this.prioridade = prioridade;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    @Override
    public String toString(){
        return "ID: " + id +
                "\nNome: " + nome +
                "\nDescrição: " + descricao +
                "\nData de término: " + dataTermino +
                "\nPrioridade: " + prioridade +
                "\nCategoria: " + categoria +
                "\nStatus: " + status +
                "\n---------------------------";
    }
}
