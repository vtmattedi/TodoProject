<h1 align="center" style="font-weight: Bold">:desktop_computer: Projeto TODO Backend. </h1>
Este é um simples projeto que gerencia tarefas TODO.

### Pré-Requisitos:

Para utilizar esta aplicação é nescessario ter instalado:

1. NodeJS e NPM (Testado nas Versões 22.12.0, 10.5.0 respectivamente) https://nodejs.org/en/download
2. Um banco de dados PostgreSQL https://www.postgresql.org/download ou uma solução online como (https://neon.com/)

### Instalando o aplicativo.

Uma vez que os pre-requistos estejam instalados, para instalar esta aplicação:

1. clone este repositorio:

```Bash
git clone link
```

2. Abra a pasta

```Bash
    cd folder
```

3. Instalar as dependencias:

```Bash
    npm install
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
* `JWT_ACCESS_TOKEN_EXPIRES`: Tempo para que o token de acesso seja valido. Deve ser no formato 'num''unit' então algo como '72h' ou '15m'.
* `JWT_REFRESH_TOKEN_EXPIRES`: Tempo para que o *refresh* token seja válido. Deve ser no formato 'num''unit' então algo como '72h' ou '15m'.
* `NODE_ENV`: `production` ou `development`. Em *development* alguma informações extra são expostas tais como motivo da falha do login.

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

ou (com o watcher)

```Bash
    npm run start:dev
```

### Testando o Aplicativo

Para testar o aplicativo é nescessario algo

### Funcionamento da aplicação:

* Autenticação:
  Para a autenticação foi escolhido uma estrategia de access token/refresh token utilizando JWT que funciona com o seguinte fluxo:
* O Usuario cria uma conta/faz login e recebe uma access token e um refresh token.
  * O access token tem duração curta.
  * Para acessar alguma tarefa o usuario precia fornecer o access token no cabebeçalho.
  * Caso o usuario precise de mais tokens de acesso ele pode pedir no endpoint: `GET /auth/token`.
  *
