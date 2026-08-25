package com.todolist;

import com.todolist.model.Status;
import com.todolist.model.Tarefa;
import com.todolist.repository.TarefaRepository;
import com.todolist.service.TarefaService;

import java.time.LocalDate;
import java.util.List;
import java.util.Scanner;

public class Main {

    public static void main(String[] args) {

        TarefaRepository repository = new TarefaRepository();

        TarefaService service = new TarefaService(repository);

        Scanner scanner = new Scanner(System.in);

        int opcao;

        do {

            System.out.println("\n===== TODO LIST =====");
            System.out.println("1 - Criar tarefa");
            System.out.println("2 - Listar tarefas");
            System.out.println("3 - Listar por categoria");
            System.out.println("4 - Listar por prioridade");
            System.out.println("5 - Listar por status");
            System.out.println("6 - Alterar status da tarefa");
            System.out.println("7 - Remover tarefa");
            System.out.println("0 - Sair");

            System.out.print("\nEscolha uma opção: ");

            opcao = scanner.nextInt();

            if (opcao < 0 || opcao > 7) {
                System.out.println("Opção inválida. Tente novamente.");
                continue;
            }

            switch (opcao) {

                case 0:
                    break;

                case 1:
                    scanner.nextLine();

                    System.out.println("\n===== CRIAR TAREFA =====");

                    System.out.print("Nome: ");
                    String nome = scanner.nextLine();

                    System.out.print("Descrição: ");
                    String descricao = scanner.nextLine();

                    System.out.print("Data de término (AAAA-MM-DD): ");
                    String dataTexto = scanner.nextLine();

                    LocalDate dataTermino = LocalDate.parse(dataTexto);

                    System.out.print("Prioridade (1 a 5): ");
                    int prioridade = scanner.nextInt();

                    scanner.nextLine();

                    System.out.print("Categoria: ");
                    String categoria = scanner.nextLine();

                    service.criarTarefa(
                            nome,
                            descricao,
                            dataTermino,
                            prioridade,
                            categoria
                    );

                    break;

                case 2:
                    System.out.println("\n===== LISTA DE TAREFAS =====");

                    for (Tarefa tarefa : service.listarTarefas()) {
                        System.out.println(tarefa);
                    }

                    break;

                case 3:
                    scanner.nextLine();

                    System.out.println("\n===== LISTAR POR CATEGORIA =====");

                    System.out.print("Digite a categoria: ");
                    String categoriaBusca = scanner.nextLine();

                    List<Tarefa> tarefasPorCategoria =
                            service.listarPorCategoria(categoriaBusca);

                    if (tarefasPorCategoria.isEmpty()) {
                        System.out.println("Nenhuma tarefa encontrada nessa categoria.");
                    } else {
                        for (Tarefa tarefa : tarefasPorCategoria) {
                            System.out.println(tarefa);
                        }
                    }

                    break;

                case 4:
                    System.out.println("\n===== LISTAR POR PRIORIDADE =====");

                    System.out.print("Digite a prioridade (1 a 5): ");
                    int prioridadeBusca = scanner.nextInt();

                    List<Tarefa> tarefasPorPrioridade =
                            service.listarPorPrioridade(prioridadeBusca);

                    if (tarefasPorPrioridade.isEmpty()) {
                        System.out.println("Nenhuma tarefa encontrada com essa prioridade.");
                    } else {
                        for (Tarefa tarefa : tarefasPorPrioridade) {
                            System.out.println(tarefa);
                        }
                    }

                    break;

                case 5:
                    System.out.println("\n===== LISTAR POR STATUS =====");
                    System.out.println("1 - TODO");
                    System.out.println("2 - DOING");
                    System.out.println("3 - DONE");

                    System.out.print("Escolha o status: ");
                    int opcaoStatus = scanner.nextInt();

                    Status statusBusca = null;

                    switch (opcaoStatus) {
                        case 1:
                            statusBusca = Status.TODO;
                            break;

                        case 2:
                            statusBusca = Status.DOING;
                            break;

                        case 3:
                            statusBusca = Status.DONE;
                            break;

                        default:
                            System.out.println("Status inválido.");
                            break;
                    }

                    if (statusBusca != null) {

                        List<Tarefa> tarefasPorStatus =
                                service.listarPorStatus(statusBusca);

                        if (tarefasPorStatus.isEmpty()) {
                            System.out.println("Nenhuma tarefa encontrada com esse status.");
                        } else {
                            for (Tarefa tarefa : tarefasPorStatus) {
                                System.out.println(tarefa);
                            }
                        }
                    }

                    break;

                case 6:
                    System.out.println("\n===== ALTERAR STATUS DA TAREFA =====");

                    System.out.print("Digite o ID da tarefa: ");
                    int id = scanner.nextInt();

                    System.out.println("\nEscolha o novo status:");
                    System.out.println("1 - TODO");
                    System.out.println("2 - DOING");
                    System.out.println("3 - DONE");

                    System.out.print("Opção: ");
                    int opcaoNovoStatus = scanner.nextInt();

                    Status novoStatus = null;

                    switch (opcaoNovoStatus) {
                        case 1:
                            novoStatus = Status.TODO;
                            break;

                        case 2:
                            novoStatus = Status.DOING;
                            break;

                        case 3:
                            novoStatus = Status.DONE;
                            break;

                        default:
                            System.out.println("Status inválido.");
                            break;
                    }

                    if (novoStatus != null) {

                        boolean statusAlterado =
                                service.alterarStatus(id, novoStatus);

                        if (statusAlterado) {
                            System.out.println("Status alterado com sucesso!");
                        } else {
                            System.out.println("Tarefa não encontrada.");
                        }
                    }

                    break;

                case 7:
                    System.out.println("\n===== REMOVER TAREFA =====");

                    System.out.print("Digite o ID da tarefa que deseja remover: ");
                    int idRemover = scanner.nextInt();

                    boolean removida = service.removerTarefa(idRemover);

                    if (removida) {
                        System.out.println("Tarefa removida com sucesso!");
                    } else {
                        System.out.println("Tarefa não encontrada.");
                    }

                    break;
            }

        } while (opcao != 0);

        System.out.println("\nPrograma encerrado.");

        scanner.close();
    }
}