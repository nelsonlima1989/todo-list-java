package repositoryTest

import serviceTest.TarefaServiceSpec
import spock.lang.Specification
import com.todolist.repository.TarefaRepository
import com.todolist.service.TarefaService
import com.todolist.model.Tarefa
import com.todolist.model.Status

import java.time.LocalDate

class TarefaRepositorySpec extends Specification{

    def "deve iniciar uma lista de tarefas vazia"(){
        given:
        TarefaRepository repository = new TarefaRepository()

        when:
        def tarefas = repository.listar()

        then:
        tarefas.isEmpty()

    }

    def "deve salvar uma tarefa no repositorio"(){
        given:
        TarefaRepository repository = new TarefaRepository()

        Tarefa tarefa = new Tarefa(
                1,
                "Estudar Spock",
                "Aprender testes",
                LocalDate.of(2026, 9, 10),
                1,
                "Estudos",
                Status.TODO

        )

        when:
        repository.salvar(tarefa)

        then:
        repository.listar().size() == 1
        repository.listar().get(0) == tarefa
    }


    def "deve buscar uma tarefa por id"(){

        given:
        TarefaRepository repository = new TarefaRepository()

        Tarefa tarefa = new Tarefa(
                1,
                "Estudar Spock",
                "Aprender testes com Spock",
                LocalDate.of(2026, 9, 10),
                1,
                "Estudos",
                Status.TODO
        )

        repository.salvar(tarefa)

        when:
        Tarefa tarefaEncontrada = repository.buscarPorId(1)

        then:
        tarefaEncontrada == tarefa

    }

    def "deve retornar null quando não encontra uma tarefa por id"(){

        given:
        TarefaRepository repository = new TarefaRepository()

        when:
        Tarefa tarefaEncontrada = repository.buscarPorId(1)

        then:
        tarefaEncontrada == null

    }

    def "deve remover uma tarefa existente"(){

        given:
        TarefaRepository repository = new TarefaRepository()

        Tarefa tarefa = new Tarefa(
                1,
                "Estudar Spock",
                "Aprender testes com Spock",
                LocalDate.of(2026, 9, 10),
                1,
                "Estudos",
                Status.TODO
        )

        repository.salvar(tarefa)

        when:
        boolean tarefaRemovida = repository.remover(1)

        then:
        tarefaRemovida
        repository.listar().isEmpty()
        repository.buscarPorId(1) == null

    }

    def "nao deve remover uma tarefa inexistente"(){

        given:
        TarefaRepository repository = new TarefaRepository()

        when:
        boolean tarefaRemovida = repository.remover(999)

        then:
        !tarefaRemovida
        repository.listar().isEmpty()

    }

}
