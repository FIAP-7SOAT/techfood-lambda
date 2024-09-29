# TechFood Lambda

## Descrição

TechFood Lambda é uma aplicação serverless desenvolvida utilizando o AWS Serverless Application Model (SAM). A aplicação consiste em funções Lambda que gerenciam autenticação e operações de cadastro e login para a plataforma TechFood. Com uma infraestrutura automatizada de implantação via GitHub Actions, o projeto garante escalabilidade, segurança e facilidade de manutenção.

## Requisitos

Antes de começar, certifique-se de ter os seguintes requisitos instalados em sua máquina:

- **AWS CLI:** A Interface de Linha de Comando da AWS é necessária para interagir com os serviços da AWS. [Instruções de instalação da AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- **SAM CLI:** O AWS Serverless Application Model Command Line Interface (SAM CLI) é usado para desenvolver e testar aplicações serverless. [Instruções de instalação do SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
- **Node.js e npm:** Necessários para gerenciar as dependências do projeto e executar scripts. [Download Node.js e npm](https://nodejs.org/)
- **Docker e Docker Desktop:** Necessários para emular o ambiente AWS Lambda localmente e executar o SAM CLI.
  - [Instruções de instalação do Docker](https://docs.docker.com/get-docker/)
  - [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)

Certifique-se de que todas essas ferramentas estejam corretamente instaladas e configuradas antes de prosseguir com a instalação e execução do projeto.

## Instalação

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/seu-usuario/techfood-lambda.git
   cd techfood-lambda
   ```

2. **Instale as dependências:**

   ```bash
   cd techfood-lambda
   npm install
   ```

3. **Configure variáveis de ambiente:**

   - Crie um arquivo `.env` na raiz do diretório `techfood-lambda/` e adicione as variáveis necessárias, como credenciais da AWS e outras configurações pertinentes. Exemplo:

   ```bash
   USER_POOL_ID=aws_congnito_user_pool_id>
   CLIENT_ID=<aws_congnito_pool_client_id>
   ```

## Como executar localmente

1. **Inicie a API localmente utilizando o AWS SAM:**

   ```bash
   sam local start-api --debug
   ```

2. **Teste os endpoints:**

   - **Autenticação:** `GET http://localhost:3000/auth`
   - **Cadastro:** `POST http://localhost:3000/signup`
   - **Login:** `POST http://localhost:3000/signin`

## Stack e ferramentas utilizadas

- **Linguagem:** TypeScript
- **Framework:** AWS Serverless Application Model (SAM)
- **Serviços AWS:**
  - AWS Lambda
  - API Gateway
  - AWS Cognito (para gerenciamento de identidade)
- **Ferramentas de Desenvolvimento:**
  - Node.js
  - npm
  - esbuild (para bundling)
  - ESLint e Prettier (para linting e formatação de código)
- **Integração Contínua e Deploy:** GitHub Actions

## Funções

### 1. Auth Function (`auth.lambdaHandler`)

- **Descrição:** Gerencia a autenticação de usuários, verificando tokens JWT e assegurando que apenas usuários autenticados possam acessar determinados recursos.
- **Endpoint:** `GET /auth`
- **Exemplo de Request:**
  ```http
  GET /auth HTTP/1.1
  Host: localhost:3000
  Authorization: Bearer <access_token>
  ```

### 2. Signup Function (`signup.lambdaHandler`)

- **Descrição:** Lida com o cadastro de novos usuários, criando entradas no AWS Cognito e validando as informações fornecidas.
- **Endpoint:** `POST /signup`
- **Exemplo de Request:**

  ```http
  POST /signup HTTP/1.1
  Host: localhost:3000
  Content-Type: application/json

  Body: {
    "cpf": "29440414871"
    "email": "usuario@exemplo.com"
    "name": "Nome do Usuário"
    "password": "1234@Test"
  }
  ```

### 3. Signin Function (`signin.lambdaHandler`)

- **Descrição:** Autentica usuários existentes, gerando tokens de sessão após a validação das credenciais.
- **Endpoint:** `POST /signin`
- **Exemplo de Request:**

  ```http
  POST /signin HTTP/1.1
  Host: localhost:3000
  Content-Type: application/json

  Body: {
    "cpf": "29440414871"
    "password": "1234@Test"
  }
  ```

## Deploy

A implantação da aplicação é automatizada através do GitHub Actions. Sempre que houver um push para a branch `main`, o workflow definido em `.github/workflows/deploy.yml` será executado, construindo e implantando a aplicação no AWS usando SAM.

## Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
