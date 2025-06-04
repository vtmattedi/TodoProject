<h1 align="center" style="font-weight: Bold">:desktop_computer: Projeto TODO Backend. </h1>
Projeto de backend para um aplicativo TODO, utilizando NestJS e typeORM.

* [Projeto](#projeto)
* [Como instalar](#instalando-o-aplicativo)
* [Como configurar](#configurando-o-environment)
* [Testando](#testando-o-aplicativo)
* [Melhorias](#melhorias-futuras)


### Pré-Requisitos:

Para utilizar esta aplicação é nescessario ter instalado:

1. NodeJS e NPM (Testado nas Versões 22.12.0, 10.5.0 respectivamente) [vendor](https://nodejs.org/en/download).
2. Acesso a um banco de dados PostgreSQL:
   * Localmente: [vendor](https://www.postgresql.org/download).
   * ou uma solução online como [neon](https://neon.com/).

### Instalando o aplicativo.

Uma vez que os pre-requistos estejam instalados, para instalar esta aplicação:

1. Clone este repositorio:

```Bash
git clone https://github.com/vtmattedi/TodoProject
```

2. Abra a pasta

```Bash
    cd folder
```

3. Instale as dependencias:

```Bash
    npm install
```

Caso não tenha o nestJS instalado globalmente, é recomendado utilizar:

```Bash
    npm install -g @nestjs/cli
```

4. Além disso é nescessario que o banco de dados esteja funcionando e que as credenciaias estejam no arquivo `.env`.

#### Configurando o Environment

Para a aplicação funcionar corretamente, é nescessario criar o arquivo `.env` como o arquivo [exemplo](.example.env).

Para o correto funcionamento é nescessario que os seguintes dados estejam presentes:

* `JWT_SECRET`: String utilizar para gerar os tokens de acesso.
* `JWT_REFRESH_SECRET`: String utilizar para gerar os *refresh* tokens.
* `SCRYPT_SALT`: Salt para o hash das senhas (sugestão 128bits).
* `PGHOST`: Enderço do PostgreSQL (padrão pós instalção numa maquina local: `::1`).
* `PGDATABASE`: Nome do banco de dados (padrão pós instalção numa maquina local: `postgres`).
* `PGUSER`: Usuário do banco de dados (padrão pós instalção numa maquina local:  `postgres`).
* `PGPASSWORD`: Usuário do banco de dados (deve ter sido solicitado ao final da instalação).
* `PGPORT`: A porta do banco de dados (padrão PostgreSQL: 5432)
* `PGSSL`: `true` ou `false` determina se a conexão deve ser feita usando https.
* `JWT_ACCESS_TOKEN_EXPIRES`: Tempo para que o token de acesso seja valido. Deve ser no formato 'num''unit' então algo como '72h' ou '15m'. (Sugestão: 15m).
* `JWT_REFRESH_TOKEN_EXPIRES`: Tempo para que o *refresh* token seja válido. Deve ser no formato 'num''unit' então algo como '72h' ou '15m'.(Sugestão: 72h).
* `NODE_ENV`: `production` ou `development`. Em *development* alguma informações extra são expostas tais como motivo da falha do login.
* `DONT_RECOVER_FROM_ERROR`: `fasle` ou `true`
  LOG_ROUTING_ERRORS = `true` ou `false`. Imprime os erros capturados

`
Para gerar um Salt ou JWT secret pode ser utilizado:

```Bash
node -p "require('crypto').randomBytes(128).toString('base64')"
```

```Bash
node -p "require('crypto').randomBytes(64).toString('base64')"
```

Se utilizar o neon, este dados podem ser obtidos seguindo os seguintes passos:

1. navegue até sua *dashboard*.
2. clique no banco de dados desejado.
3. selecione *overview* no painel de navegação à esquerda.
4. clique em *Connect* e escolha *Parameters only*

### Rodando o aplicativo

Após a instalação e a correta configuração do `.env` voce pode rodar o aplicativo:

```Bash
    npm run start
```

ou com o watcher:

```Bash
    npm run start:dev
```

### Testando o Aplicativo

Para testar o aplicativo é nescessario algum aplicativo que posso enviar *Requests* com *body* e modificar os headers. Em geral o [insomnia](https://insomnia.rest/) ou [postman](https://www.postman.com/) são utiilizados mas tambem pode ser tulizado ferramentas como o curl.

Uma vez que o aplicativo esteja executando, para testar precisamos primeiramente registrar ou fazer o login com um usuário.

<details>
<summary>Show</summary>

* Criar conta:

```Bash
curl -X 'POST' \
  'http://localhost:3000/auth/register' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "username": "john_doe",
  "email": "name@provider.com",
  "password": "password123"
}'
```

ou

* Login:

```Bash
curl -X 'POST' \
  'http://localhost:3000/auth/login' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "email": "name@provider.com",
  "password": "password123"
}'
```

</details>

Disto receberemos dois tokens um `accessToken`e um `refreshToken` e precisamos utilizarlos para acessar o resto da aplicação.

Para ver, editar, criar e deletar as tarefas, precisamos enviar na requisição, um *header* `authorization` com valor: `Bearer <acessToken>`.

Caso a resposta tenha status 401 podemos enviar uma requisição contendo um *header* `authorization` com valor: `Bearer <refreshToken>`
para `/auth/token` e receberemos um novo `accessToken`caso nosso `refreshToken` seja valido, e podemos continuar manipulando as tarefas deste usuario.

Após isso é possivel deslogar, ou apagar a conta criada, novamente enviando um header

### Projeto

O projeto foi desenvolvido utilizando o framework NestJS e foi escolhido trabalhar com o PostgreSQL pois existe uma ferramenta que permite pequenos bancos de dados gratuitos perfeitos para este tipo de testes, o [neon](https://neon.com).
Como estamos no NestJS e para manter uma boa escalabilidade, foi decido por utilizar o [typeORM](https://docs.nestjs.com/recipes/sql-typeorm).
Foram montados 4 modulos, um de Usúarios, um de 

##### Autenticação
Para autenticação foi defindo uma estrategio de `accessToken` e `refreshToken` onde o usuario recebe ao fazer login um token de cada. O `accessToken` é um JWT de curta duração que permite que o usuario acesse o banco de dados até o fim da duração delete. Enquanto isso o `refreshToken` atua quase que como um token de sessão, ele tem duração bem mais alta e permite que o usuario gere novos `accessToken` e que faça operações de logout ou de fechar a conta.
Toda vez que um `refreshToken` é gerado, ele é armazenado no banco de dados e toda vez que ele é utilizado em uma operação ele é, alem de verificado a assinatura do JWT em sí.

##### Lógica de Negocios

### Melhorias futuras:

Para este projeto temos algumas melhorias que podem ser feitas:

* Trasnformar os refreshTokens em cookies ~~este era o projeto inicial mas não esteva funcionando com o insomnia apesar de funcionar no postman~~.
* Adicionar mais filtros possiveis para buscar tarefas, especialmente para que retorne um numero especifico de tarefas começando de um offset.
* Criar CronJob para retirar refreshTokens invalidos do banco de dados.
* Criar CronJob para deletar permanentemente tarefas marcadas como deletadas no banco de dados.
* Implementar um usúario admin que tenha acesso a outros usuários e tarefas.
* ~~Fora do escopo de backend mas implementar um front, mesmo que, simples para que possa ser testado o aplicativo diretamete.~~