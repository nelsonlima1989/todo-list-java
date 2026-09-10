package serviceTest

import com.todolist.model.Status
import com.todolist.model.Tarefa
import com.todolist.repository.TarefaRepository
import spock.lang.Specification
import com.todolist.service.TarefaService

import java.time.LocalDate

class TarefaServiceSpec extends Specification{

    def "deve retornar uma lista vazia ao ordenar quando nao existem tarefas"() {

        given:
        TarefaRepository repository = new TarefaRepository()
        TarefaService service = new TarefaService(repository)

        when:
        def tarefasOrdenadas = service.listarOrdenadasPorPrioridade()

        then:
        tarefasOrdenadas.isEmpty()
    }

    def "deve listar tarefas ordenadas por prioridade"(){

        given:
        TarefaRepository repository = new TarefaRepository()
        TarefaService service = new TarefaService(repository)

        repository.salvar(new  Tarefa(
                1,
                "Tarefa prioridade 5",
                "Descricao",
                LocalDate.now(),
                5,
                "Estudos",
                Status.TODO
        ))

        repository.salvar(new Tarefa(
                2,
                "Tarefa prioridade 1",
                "Descricao",
                LocalDate.now(),
                1,
                "Estudos",
                Status.TODO
        ))

        repository.salvar(new Tarefa(
                3,
                "Tarefa prioridade 3",
                "Descricao",
                LocalDate.now(),
                3,
                "Estudos",
                Status.TODO
        ))

        when:
        def tarefasOrdenadas = service.listarOrdenadasPorPrioridade()

        then:
        tarefasOrdenadas*.prioridade == [1, 3, 5]

    }

    def "deve listar tarefas ordenadas por prioridade mesmo com prioridades repetidas"() {

        given:
        TarefaRepository repository = new TarefaRepository()
        TarefaService service = new TarefaService(repository)

        repository.salvar(new Tarefa(
                1,
                "Tarefa prioridade 5",
                "Descricao",
                LocalDate.now(),
                5,
                "Estudos",
                Status.TODO
        ))

        repository.salvar(new Tarefa(
                2,
                "Tarefa prioridade 1",
                "Descricao",
                LocalDate.now(),
                1,
                "Estudos",
                Status.TODO
        ))

        repository.salvar(new Tarefa(
                3,
                "Tarefa prioridade 3",
                "Descricao",
                LocalDate.now(),
                3,
                "Estudos",
                Status.TODO
        ))

        repository.salvar(new Tarefa(
                4,
                "Outra tarefa prioridade 1",
                "Descricao",
                LocalDate.now(),
                1,
                "Pessoal",
                Status.TODO
        ))

        repository.salvar(new Tarefa(
                5,
                "Outra tarefa prioridade 5",
                "Descricao",
                LocalDate.now(),
                5,
                "Trabalho",
                Status.TODO
        ))

        when:
        def tarefasOrdenadas = service.listarOrdenadasPorPrioridade()

        then:
        tarefasOrdenadas*.prioridade == [1, 1, 3, 5, 5]
    }

    def "nao deve salvar uma tarefa com prioridade invalida"(){

        given:
        TarefaRepository repository = Mock()
        TarefaService service = new TarefaService(repository)

        when:
        service.criarTarefa(
                "Estudar Spock",
                "Aprender testes utilizando Spock",
                null,
                prioridade,
                "Estudos"
        )

        then:
        0 * repository.salvar(_)

        where:
        prioridade << [0,6]

    }

    def "deve salvar uma tarefa com prioridade valida"() {

        given:
        TarefaRepository repository = Mock()
        TarefaService service = new TarefaService(repository)

        when:
        service.criarTarefa(
                "Estudar Spock",
                "Aprender testes utilizando Spock",
                null,
                prioridade,
                "Estudos"
        )

        then:
        1 * repository.salvar(_)

        where:
        prioridade << [1, 2, 3, 4, 5]
    }

}
