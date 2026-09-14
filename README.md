# TODO List

Aplicação de gerenciamento de tarefas desenvolvida como projeto de estudo, com backend em Java e frontend em HTML, CSS e JavaScript.

O projeto foi desenvolvido com foco em organização de código, separação de responsabilidades, manipulação de dados, CRUD de tarefas, persistência no navegador e implementação de uma funcionalidade para alteração de status de múltiplas tarefas simultaneamente.

---

## Sobre o projeto

A aplicação permite cadastrar, consultar, editar, alterar e remover tarefas.

Cada tarefa possui:

- Nome
- Descrição
- Data de término
- Prioridade
- Categoria
- Status

As prioridades são organizadas de **1 a 5**, sendo:

- `1` → maior prioridade
- `5` → menor prioridade

Os status disponíveis são:

- `TODO`
- `DOING`
- `DONE`

O projeto está dividido em duas partes:

- **Backend:** aplicação Java executada pelo terminal.
- **Frontend:** interface web desenvolvida com HTML, CSS e JavaScript.

Atualmente, o frontend utiliza o `localStorage` do navegador para persistência dos dados.

---

## Funcionalidades

### Backend

- Criar tarefas
- Listar todas as tarefas
- Buscar tarefa por ID
- Alterar status da tarefa
- Remover tarefas
- Listar tarefas por categoria
- Listar tarefas por prioridade
- Listar tarefas por status
- Ordenar tarefas por prioridade
- Validar prioridade
- Validar opções do menu
- Gerar IDs automaticamente
- Organização em camadas de Model, Repository e Service
- Armazenamento das tarefas em memória através de `List<Tarefa>`

### Frontend

- Dashboard com estatísticas das tarefas
- Cadastro de tarefas
- Edição de tarefas
- Exclusão de tarefas
- Alteração individual de status
- Filtro de tarefas por status
- Ordenação das tarefas por prioridade
- Persistência das tarefas utilizando `localStorage`
- Seleção de múltiplas tarefas através de checkboxes
- Alteração de status de múltiplas tarefas simultaneamente
- Atualização dinâmica da interface sem necessidade de recarregar a página
- Interface responsiva para diferentes tamanhos de tela

---

## Persistência com Local Storage

O frontend utiliza o `localStorage` do navegador para manter as tarefas persistidas.

Sempre que ocorre uma alteração relevante nos dados, o array de tarefas é convertido para JSON e armazenado no navegador.

Isso permite que as tarefas continuem disponíveis após:

- Recarregar a página
- Fechar e abrir novamente o navegador
- Editar uma tarefa
- Alterar o status de uma tarefa
- Alterar o status de várias tarefas
- Remover tarefas

A persistência é realizada através de:

```javascript
localStorage.setItem("tarefas", JSON.stringify(tarefas));
```

No carregamento da aplicação, os dados são recuperados através de:

```javascript
JSON.parse(localStorage.getItem("tarefas")) || [];
```

---

## Alteração de status de múltiplas tarefas

Uma das funcionalidades implementadas no frontend permite alterar o status de várias tarefas simultaneamente.

O usuário pode selecionar as tarefas desejadas através dos checkboxes presentes em cada card e escolher o novo status.

### Fluxo da funcionalidade

```text
Selecionar tarefas
       ↓
Obter os IDs selecionados
       ↓
Localizar as tarefas no array
       ↓
Obter o novo status
       ↓
Alterar o status das tarefas
       ↓
Salvar no localStorage
       ↓
Renderizar novamente a lista
```

### Processo

1. O usuário seleciona uma ou mais tarefas.
2. O JavaScript identifica os checkboxes marcados.
3. Os IDs das tarefas selecionadas são extraídos através do atributo `data-id`.
4. As tarefas correspondentes são localizadas no array `tarefas`.
5. O novo status escolhido é obtido através do campo de seleção.
6. O status das tarefas selecionadas é atualizado.
7. As alterações são persistidas no `localStorage`.
8. A função `renderizarTarefas()` atualiza os cards exibidos na página.

A funcionalidade permite, por exemplo, selecionar três tarefas e alterar todas de `TODO` para `DOING` em uma única operação.

---

## Estrutura do projeto

```text
todo-list/
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── script.js
│   └── index.html
│
├── src/
│   └── main/
│       └── java/
│           └── com/
│               └── todolist/
│                   ├── Main.java
│                   ├── model/
│                   │   ├── Status.java
│                   │   └── Tarefa.java
│                   ├── repository/
│                   │   └── TarefaRepository.java
│                   └── service/
│                       └── TarefaService.java
│
├── gradle/
│   └── wrapper/
│
├── .gitignore
├── build.gradle
├── settings.gradle
├── gradlew
├── gradlew.bat
└── README.md
```

---

## Arquitetura

O backend utiliza uma organização baseada na separação de responsabilidades.

### Model

Responsável pelas entidades e estruturas de dados utilizadas pela aplicação.

Principais classes:

- `Tarefa`
- `Status`

### Repository

Responsável pelo armazenamento e recuperação das tarefas.

A implementação atual utiliza uma lista em memória:

```java
List<Tarefa>
```

Principais operações:

- Salvar
- Listar
- Buscar por ID
- Remover

### Service

Responsável pelas regras de negócio da aplicação.

Entre suas responsabilidades estão:

- Criar tarefas
- Gerar IDs
- Validar dados
- Ordenar tarefas por prioridade
- Alterar status
- Remover tarefas
- Filtrar tarefas

### Main

Responsável pela execução da aplicação e interação com o usuário através do menu do terminal.

---

## Ordenação por prioridade

As tarefas são organizadas considerando a prioridade informada pelo usuário.

A prioridade `1` possui maior importância que a prioridade `5`.

A ordenação utiliza:

```java
Comparator.comparingInt(Tarefa::getPrioridade)
```

Dessa forma, uma lista como:

```text
Prioridade 5
Prioridade 1
Prioridade 3
```

é reorganizada para:

```text
Prioridade 1
Prioridade 3
Prioridade 5
```

---

## Menu do Backend

A aplicação Java possui o seguinte menu:

```text
===== TODO LIST =====

1 - Criar tarefa
2 - Listar tarefas
3 - Listar por categoria
4 - Listar por prioridade
5 - Listar por status
6 - Alterar status da tarefa
7 - Remover tarefa
0 - Sair
```

---

## Validações

O backend possui validações para impedir entradas inválidas.

### Prioridade

Somente valores entre `1` e `5` são aceitos.

```text
1 → maior prioridade
2
3
4
5 → menor prioridade
```

### Menu

As opções disponíveis são verificadas antes de executar cada operação.

---

## Frontend

O frontend foi desenvolvido sem frameworks, utilizando tecnologias web fundamentais.

A interface apresenta um dashboard para visualização das tarefas e seus respectivos status.

### Dashboard

Exibe:

- Total de tarefas
- Tarefas `TODO`
- Tarefas `DOING`
- Tarefas `DONE`

### Painel de tarefas

Permite:

- Visualizar tarefas
- Filtrar por status
- Selecionar tarefas
- Alterar status de múltiplas tarefas

### Cadastro e edição

O formulário permite informar:

- Nome
- Descrição
- Data de término
- Prioridade
- Categoria
- Status

---

## Tecnologias utilizadas

### Backend

- Java
- Gradle
- IntelliJ IDEA

### Frontend

- HTML5
- CSS3
- JavaScript
- Local Storage
- Google Chrome / navegadores modernos

### Controle de versão

- Git
- GitHub

---

## Como executar o Backend

Clone o repositório:

```bash
git clone <URL_DO_REPOSITORIO>
```

Entre na pasta do projeto:

```bash
cd todo-list
```

Execute o projeto utilizando o Gradle Wrapper:

```bash
./gradlew run
```

No Linux, caso seja necessário conceder permissão de execução:

```bash
chmod +x gradlew
```

---

## Como executar o Frontend

O frontend não necessita de instalação de dependências.

Entre na pasta:

```bash
cd frontend
```

Abra o arquivo:

```text
index.html
```

no navegador.

Também é possível utilizar uma extensão como **Live Server** no VS Code para executar o frontend durante o desenvolvimento.

---

## Armazenamento dos dados

### Backend

O backend utiliza armazenamento em memória através de uma `List<Tarefa>`.

Os dados são perdidos quando a aplicação Java é encerrada.

### Frontend

O frontend utiliza `localStorage`, permitindo manter os dados no navegador entre diferentes sessões.

O armazenamento é feito localmente no navegador utilizado pelo usuário.

---

## Melhorias futuras

Algumas evoluções possíveis para o projeto:

- Integração entre frontend e backend através de uma API REST
- Persistência dos dados em banco de dados
- Autenticação de usuários
- API para gerenciamento das tarefas
- Testes automatizados
- Paginação
- Filtros adicionais por categoria e prioridade
- Filtro por intervalo de datas
- Contagem de tarefas por categoria
- Dockerização da aplicação
- Deploy da aplicação

---

## Objetivos de aprendizado

O projeto foi desenvolvido com foco no aprendizado e prática de:

- Programação orientada a objetos
- Estruturação de projetos Java
- Separação de responsabilidades
- CRUD
- Collections
- `List`
- `Enum`
- Regras de negócio
- Ordenação
- Validação de dados
- Manipulação do DOM
- Eventos JavaScript
- Arrays e métodos como `filter`, `map` e `forEach`
- `localStorage`
- JSON
- Persistência no navegador
- Git e GitHub
- Desenvolvimento de interface web responsiva

---

## Autor

**Nelson Lima Costa Júnior**

Desenvolvedor Full Stack

GitHub: `github.com/nelsonlima1989`

LinkedIn: `linkedin.com/in/nelsonlima1989/`
