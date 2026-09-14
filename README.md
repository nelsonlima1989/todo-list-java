# 📝 TODO List

Aplicação de gerenciamento de tarefas (**TODO List**) desenvolvida com **Backend em Java** e **Frontend em HTML, CSS e JavaScript**, utilizando **Gradle** no backend e sem frameworks.

O projeto começou como uma aplicação Java com interação via terminal e posteriormente recebeu uma interface web desenvolvida em JavaScript puro. Atualmente, o frontend trabalha com dados em memória e ainda não possui comunicação com uma API REST.

---

## 📋 Sobre o projeto

A aplicação permite o gerenciamento de tarefas através de duas interfaces:

- **Backend:** aplicação Java com interação via terminal;
- **Frontend:** interface web desenvolvida com HTML, CSS e JavaScript.

Cada tarefa possui as seguintes informações:

- ID;
- Nome;
- Descrição;
- Data de término;
- Prioridade;
- Categoria;
- Status.

Os status disponíveis são:

- `TODO` — tarefa ainda não iniciada;
- `DOING` — tarefa em andamento;
- `DONE` — tarefa concluída.

---

# 🚀 Funcionalidades

## Backend

- Criar tarefas;
- Listar todas as tarefas;
- Listar tarefas por categoria;
- Listar tarefas por prioridade;
- Listar tarefas por status;
- Alterar o status de uma tarefa;
- Remover tarefas;
- Validação de opções do menu;
- Validação de prioridades;
- Ordenação automática das tarefas por prioridade.

## Frontend

- Criar uma nova tarefa;
- Listar tarefas cadastradas;
- Editar uma tarefa existente;
- Excluir uma tarefa;
- Filtrar tarefas por status;
- Exibir estatísticas das tarefas;
- Exibir quantidade total de tarefas;
- Exibir quantidade de tarefas `TODO`, `DOING` e `DONE`;
- Utilizar o mesmo formulário para criação e edição;
- Limpar o formulário;
- Cancelar o modo de edição.

O frontend utiliza um array em memória para armazenar as tarefas durante a execução da página. Os dados são perdidos ao recarregar ou fechar a página.

---

# 🖥️ Interface Frontend

A interface web foi desenvolvida com HTML, CSS e JavaScript puro.

O dashboard apresenta:

```text
TOTAL
TODO
DOING
DONE
```

A área de tarefas permite visualizar:

- Prioridade;
- Nome;
- Status;
- Descrição;
- Categoria;
- Data de término.

Também estão disponíveis as ações:

```text
Editar | Excluir
```

O formulário permite informar:

```text
Nome
Descrição
Data de término
Prioridade
Categoria
Status
```

O mesmo formulário é utilizado tanto para criação quanto para edição.

---

# 🧩 Estrutura do projeto

```text
todo-list
│
├── frontend/
│   ├── index.html
│   │
│   ├── css/
│   │   └── style.css
│   │
│   └── js/
│       └── script.js
│
├── src/
│   └── main/
│       └── java/
│           └── com/
│               └── todolist/
│                   │
│                   ├── Main.java
│                   │
│                   ├── model/
│                   │   ├── Status.java
│                   │   └── Tarefa.java
│                   │
│                   ├── repository/
│                   │   └── TarefaRepository.java
│                   │
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
└── gradlew.bat
```

---

# 🧱 Backend

O backend foi desenvolvido em Java sem utilização de frameworks.

A aplicação possui separação de responsabilidades:

```text
Main
 ↓
Service
 ↓
Repository
 ↓
Dados
```

Embora o projeto não utilize uma implementação completa do padrão MVC, sua estrutura foi organizada para separar as principais responsabilidades da aplicação.

## Main

A classe `Main` é responsável pela interação com o usuário através do terminal.

Entre suas responsabilidades estão:

- Exibição do menu;
- Leitura dos dados utilizando `Scanner`;
- Validação das opções;
- Direcionamento para a funcionalidade selecionada;
- Exibição dos resultados.

## Model

O pacote `model` contém as classes que representam os dados da aplicação.

Uma `Tarefa` possui:

```text
ID
Nome
Descrição
Data de término
Prioridade
Categoria
Status
```

O status é representado pelo `enum`:

```java
TODO
DOING
DONE
```

## Repository

A classe `TarefaRepository` é responsável pelo armazenamento e acesso às tarefas.

Atualmente utiliza:

```java
List<Tarefa>
```

Responsabilidades:

- Adicionar tarefas;
- Listar tarefas;
- Buscar tarefa por ID;
- Remover tarefas.

Os dados são armazenados em memória e são perdidos quando a aplicação Java é encerrada.

## Service

A classe `TarefaService` concentra as principais regras de negócio:

- Criar tarefas;
- Validar prioridade;
- Listar tarefas;
- Filtrar por categoria;
- Filtrar por prioridade;
- Filtrar por status;
- Alterar status;
- Remover tarefas;
- Organizar tarefas por prioridade.

---

# 🔢 Sistema de prioridades

As tarefas possuem prioridade de `1` até `5`:

```text
1 → Maior prioridade
2 → Alta prioridade
3 → Média prioridade
4 → Baixa prioridade
5 → Menor prioridade
```

A ordenação é realizada utilizando:

```java
Comparator.comparingInt(Tarefa::getPrioridade)
```

Dessa forma, tarefas com prioridade `1` aparecem antes das tarefas com prioridade `5`.

---

# 🔍 Filtros

## Backend

O backend permite filtrar tarefas por:

- Categoria;
- Prioridade;
- Status.

## Frontend

O frontend disponibiliza filtro por status:

```text
Todos
TODO
DOING
DONE
```

Quando o filtro é alterado, a lista é renderizada novamente exibindo somente as tarefas correspondentes ao status selecionado.

---

# ✏️ CRUD no Frontend

O frontend implementa as operações básicas de gerenciamento de tarefas.

### Create — Criar

O usuário preenche o formulário e seleciona:

```text
Criar tarefa
```

A tarefa recebe um ID gerado pelo JavaScript e é adicionada ao array em memória.

### Read — Listar

As tarefas cadastradas são exibidas na área de tarefas, apresentando suas principais informações.

### Update — Editar

Ao selecionar:

```text
Editar
```

os dados da tarefa são carregados no formulário.

Após as alterações, o usuário seleciona:

```text
Salvar tarefa
```

A tarefa existente é atualizada sem criar um novo ID.

### Delete — Excluir

Ao selecionar:

```text
Excluir
```

a tarefa é removida do array em memória e a interface é atualizada.

---

# 📊 Estatísticas

O dashboard do frontend apresenta automaticamente:

```text
TOTAL
TODO
DOING
DONE
```

Os valores são calculados com base nas tarefas armazenadas no array JavaScript.

As estatísticas são atualizadas após as operações realizadas na aplicação.

---

# 💾 Armazenamento

Atualmente, tanto o backend quanto o frontend utilizam armazenamento em memória.

### Backend

```java
List<Tarefa>
```

### Frontend

```javascript
const tarefas = [];
```

Não é utilizado:

- Banco de dados;
- Arquivo de persistência;
- `localStorage`;
- API REST.

Por isso, os dados são perdidos quando a aplicação correspondente é encerrada ou a página do frontend é recarregada.

---

# 🔌 Comunicação entre Frontend e Backend

A comunicação entre o frontend JavaScript e o backend Java ainda não foi implementada.

O projeto está preparado para uma futura integração através de uma API REST:

```text
Frontend
   ↓
JavaScript
   ↓
JSON
   ↓
API REST
   ↓
Backend Java
   ↓
Tarefa
```

Atualmente, frontend e backend funcionam de forma independente.

---

# 🛠️ Tecnologias

## Backend

- Java;
- Gradle;
- Programação Orientada a Objetos;
- Collections (`List`);
- `enum`;
- Git;
- GitHub.

## Frontend

- HTML5;
- CSS3;
- JavaScript;
- Manipulação do DOM;
- Eventos;
- Arrays;
- Objetos;
- Template strings;
- CRUD em memória.

Não foram utilizados frameworks no frontend.

---

# ▶️ Executando o Backend

## Linux / macOS

Na raiz do projeto:

```bash
./gradlew run
```

Caso seja necessário fornecer permissão:

```bash
chmod +x gradlew
```

Depois:

```bash
./gradlew run
```

## Windows

```bash
gradlew.bat run
```

## IntelliJ IDEA

1. Abra o projeto no IntelliJ IDEA;
2. Aguarde o Gradle carregar e sincronizar;
3. Navegue até:

```text
src/main/java/com/todolist/Main.java
```

4. Execute:

```java
public static void main(String[] args)
```

---

# 🌐 Executando o Frontend

O frontend não possui dependências externas ou processo de build.

Basta abrir:

```text
frontend/index.html
```

em um navegador.

Durante o desenvolvimento, também é possível utilizar uma extensão como **Live Server** no VS Code.

---

# 📋 Menu do Backend

Ao executar a aplicação Java pelo terminal:

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

# 🎯 Objetivo do projeto

Este projeto foi desenvolvido com o objetivo de praticar conceitos fundamentais de desenvolvimento de software, inicialmente através da implementação de uma aplicação TODO List em Java e posteriormente através da criação de uma interface web.

Entre os conceitos praticados estão:

- Programação Orientada a Objetos;
- Classes e objetos;
- Encapsulamento;
- `enum`;
- `List`;
- Arrays e objetos JavaScript;
- Manipulação do DOM;
- Eventos;
- Formulários;
- CRUD;
- Filtros;
- Regras de negócio;
- Separação de responsabilidades;
- Git;
- GitHub;
- Gradle.

---

# 🔮 Possíveis melhorias futuras

- Integração do frontend com uma API REST Java;
- Comunicação através de requisições HTTP;
- Persistência em arquivo;
- Persistência em banco de dados;
- Filtro por data;
- Atualização completa de tarefas através da API;
- Autenticação de usuários;
- Testes automatizados;
- Deploy do backend;
- Deploy do frontend.

---

# 👨‍💻 Autor

**Nelson Lima**

Projeto desenvolvido para fins de estudo e prática de desenvolvimento Backend e Frontend através da implementação de uma aplicação TODO List.
