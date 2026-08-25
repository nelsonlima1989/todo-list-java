# 📝 TODO List Java

Aplicação de gerenciamento de tarefas (**TODO List**) desenvolvida em **Java**, utilizando **Gradle** como ferramenta de build e sem a utilização de frameworks.

O projeto foi desenvolvido inicialmente apenas com o backend e interação via terminal, permitindo que futuramente seja evoluído para integração com um frontend desenvolvido em JavaScript.

---

## 📋 Sobre o projeto

A aplicação permite o gerenciamento de tarefas através de um menu interativo no terminal.

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

A aplicação possui as seguintes funcionalidades:

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

---

# 🖥️ Menu da aplicação

Ao executar a aplicação, será apresentado o seguinte menu:

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

# 🏗️ Estrutura do projeto

O projeto foi organizado separando as responsabilidades principais da aplicação.

```text
todo-list-java
│
├── gradle/
│   └── wrapper/
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
├── .gitignore
├── build.gradle
├── settings.gradle
├── gradlew
└── gradlew.bat
```

---

# 🧩 Arquitetura da aplicação

A aplicação foi organizada através da separação de responsabilidades.

```text
Main
 ↓
Service
 ↓
Repository
 ↓
Dados
```

A comunicação ocorre da seguinte forma:

```text
Usuário
   ↓
Main
   ↓
TarefaService
   ↓
TarefaRepository
   ↓
Lista de tarefas
```

Embora o projeto não utilize uma implementação completa do padrão MVC, sua estrutura foi organizada de forma a separar as responsabilidades principais da aplicação.

---

# ▶️ Main

A classe `Main` é responsável pela interação com o usuário através do terminal.

Nela são realizadas operações como:

- Exibição do menu;
- Leitura dos dados utilizando `Scanner`;
- Validação das opções do usuário;
- Direcionamento para a funcionalidade selecionada;
- Exibição dos resultados.

O fluxo geral funciona da seguinte forma:

```text
Usuário escolhe uma opção
        ↓
Main recebe a opção
        ↓
Switch identifica a ação
        ↓
Service executa a regra de negócio
        ↓
Repository manipula os dados
        ↓
Resultado é exibido ao usuário
```

---

# 📦 Model

O pacote `model` contém as classes que representam os dados da aplicação.

## Tarefa

A classe `Tarefa` representa uma atividade da TODO List.

Uma tarefa possui:

```text
ID
Nome
Descrição
Data de término
Prioridade
Categoria
Status
```

Exemplo de uma tarefa:

```text
ID: 1
Nome: Estudar Java
Descrição: Estudar orientação a objetos
Data de término: 2026-09-01
Prioridade: 1
Categoria: Estudos
Status: TODO
```

---

# 🔄 Status

O status das tarefas é representado através de um `enum`.

Os valores disponíveis são:

```java
TODO
DOING
DONE
```

Isso evita a utilização de valores inválidos como:

```text
Concluído
Finalizado
Em andamento
```

Em vez disso, a aplicação utiliza valores previamente definidos:

```java
Status.TODO
Status.DOING
Status.DONE
```

---

# 🗂️ Repository

A classe `TarefaRepository` é responsável pelo armazenamento e acesso às tarefas.

Atualmente, os dados são armazenados em memória utilizando:

```java
List<Tarefa>
```

O `Repository` possui responsabilidades como:

- Adicionar tarefas;
- Listar tarefas;
- Buscar uma tarefa pelo ID;
- Remover tarefas.

A estrutura utilizada é:

```text
TarefaRepository
        ↓
List<Tarefa>
```

Como o armazenamento ocorre em memória, os dados são perdidos quando a aplicação é encerrada.

---

# ⚙️ Service

A classe `TarefaService` concentra as principais regras de negócio da aplicação.

Entre suas responsabilidades estão:

- Criar tarefas;
- Validar a prioridade;
- Listar tarefas;
- Filtrar por categoria;
- Filtrar por prioridade;
- Filtrar por status;
- Alterar o status;
- Remover tarefas;
- Organizar as tarefas de acordo com a prioridade.

Essa separação evita que a classe `Main` concentre todas as responsabilidades da aplicação.

---

# 🔢 Sistema de prioridades

As tarefas possuem prioridade de:

```text
1 até 5
```

Onde:

```text
1 → Maior prioridade
2 → Alta prioridade
3 → Média prioridade
4 → Baixa prioridade
5 → Menor prioridade
```

Após uma nova tarefa ser criada, a lista é organizada automaticamente.

Por exemplo, considerando as tarefas:

```text
Tarefa A → Prioridade 5
Tarefa B → Prioridade 3
Tarefa C → Prioridade 1
```

Após o rebalanceamento da ordem:

```text
Tarefa C → Prioridade 1
Tarefa B → Prioridade 3
Tarefa A → Prioridade 5
```

A ordenação é realizada utilizando:

```java
Comparator.comparingInt(Tarefa::getPrioridade)
```

Dessa forma, tarefas com prioridade `1` aparecem antes das tarefas com prioridade `5`.

---

# 🔍 Filtros

A aplicação permite consultar tarefas utilizando diferentes filtros.

## Por categoria

O usuário pode buscar tarefas pertencentes a uma categoria específica.

Exemplo:

```text
Estudos
```

Resultado:

```text
Estudar Java
Estudar SQL
Fazer exercícios
```

## Por prioridade

O usuário pode listar todas as tarefas que possuem determinada prioridade.

Exemplo:

```text
Prioridade: 1
```

Serão exibidas apenas as tarefas que possuem prioridade `1`.

## Por status

Os status disponíveis são:

```text
TODO
DOING
DONE
```

Por exemplo:

```text
Status: DONE
```

A aplicação exibirá apenas as tarefas concluídas.

---

# ✏️ Alteração de status

O usuário pode alterar o status de uma tarefa informando o seu ID.

Exemplo:

```text
Digite o ID da tarefa: 1

Escolha o novo status:

1 - TODO
2 - DOING
3 - DONE
```

Fluxo possível:

```text
TODO
  ↓
DOING
  ↓
DONE
```

A alteração é realizada através do `TarefaService`, que busca a tarefa e atualiza o seu status.

---

# 🗑️ Remoção de tarefas

Uma tarefa pode ser removida através do seu ID.

Exemplo:

```text
Digite o ID da tarefa que deseja remover: 2
```

Se a tarefa existir:

```text
Tarefa removida com sucesso!
```

Caso a tarefa não exista:

```text
Tarefa não encontrada.
```

Os IDs das demais tarefas não são reorganizados após uma remoção.

---

# 🛡️ Validações

A aplicação possui validações para evitar erros durante a utilização.

## Validação do menu

O sistema verifica se o usuário informou um número válido.

Exemplo de entrada inválida:

```text
abc
```

Resultado:

```text
Opção inválida. Digite um número.
```

Também são validadas opções fora do intervalo disponível:

```text
9
```

Resultado:

```text
Opção inválida. Tente novamente.
```

## Validação de prioridade

A prioridade deve estar entre:

```text
1 e 5
```

Entradas como:

```text
abc
0
6
```

não são aceitas.

O sistema continua solicitando uma nova prioridade até receber um valor válido.

---

# 🛠️ Tecnologias utilizadas

- Java;
- Gradle;
- IntelliJ IDEA;
- Git;
- GitHub.

O projeto foi desenvolvido sem a utilização de frameworks como:

- Spring;
- Micronaut;
- Grails.

---

# 📥 Como baixar o projeto

Clone o repositório utilizando Git:

```bash
git clone URL_DO_REPOSITORIO
```

Entre na pasta do projeto:

```bash
cd todo-list-java
```

---

# ▶️ Como executar o projeto

## Linux

Utilize:

```bash
./gradlew run
```

Caso seja necessário fornecer permissão de execução:

```bash
chmod +x gradlew
```

Depois execute novamente:

```bash
./gradlew run
```

## Windows

Execute:

```bash
gradlew.bat run
```

Ou:

```bash
./gradlew.bat run
```

## IntelliJ IDEA

Para executar utilizando o IntelliJ IDEA:

1. Clone ou baixe o repositório;
2. Abra o IntelliJ IDEA;
3. Clique em `Open`;
4. Selecione a pasta do projeto;
5. Aguarde o Gradle carregar e sincronizar o projeto;
6. Navegue até:

```text
src/main/java/com/todolist/Main.java
```

7. Execute o método:

```java
public static void main(String[] args)
```

---

# 📦 Requisitos para execução

Para executar o projeto é necessário possuir:

- Java instalado;
- JDK configurado;
- Git instalado, caso queira clonar o repositório.

O projeto utiliza o **Gradle Wrapper**, portanto não é necessário instalar o Gradle globalmente.

---

# 🔮 Possíveis melhorias futuras

Algumas melhorias que podem ser implementadas futuramente:

- Atualização completa de tarefas;
- Persistência em arquivo;
- Persistência em banco de dados;
- Filtro por data;
- Consulta da quantidade de tarefas por status;
- Testes automatizados;
- API REST;
- Integração com frontend;
- Interface gráfica;
- Autenticação de usuários.

---

# 🎯 Objetivo do projeto

Este projeto foi desenvolvido com o objetivo de praticar conceitos fundamentais da linguagem Java.

Entre os conceitos utilizados estão:

- Programação orientada a objetos;
- Classes e objetos;
- Encapsulamento;
- `enum`;
- `List`;
- Laços de repetição;
- Condicionais;
- `switch`;
- `Scanner`;
- Métodos;
- Separação de responsabilidades;
- Regras de negócio;
- Git;
- GitHub;
- Gradle.

---

# 👨‍💻 Autor

**Nelson Lima**

Projeto desenvolvido para fins de estudo e prática da linguagem Java através da implementação de uma aplicação TODO List.
