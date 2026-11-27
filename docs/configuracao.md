# Configuração do ambiente — Mundo ONG

Após instalar as dependências do projeto, será necessário configurar o ambiente para permitir a comunicação entre o servidor, o banco de dados e os serviços externos.

## 1. Criação do arquivo de configuração

Abra a pasta principal do projeto utilizando o Visual Studio Code.

Crie um arquivo chamado `.env` na mesma pasta em que está localizado o arquivo `package.json`.

## 2. Variáveis de ambiente

Adicione as seguintes variáveis ao arquivo `.env`:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
JWT_SECRET=
BREVO_API_KEY=
EMAIL_FROM=
GMAIL_USER=
SITE_URL=http://localhost:3000
PORT=3000
```

## 3. Descrição das variáveis

| Variável | Finalidade |
|---|---|
| SUPABASE_URL | Endereço do projeto no Supabase. |
| SUPABASE_SERVICE_ROLE_KEY | Chave privada de acesso do servidor ao Supabase. |
| DATABASE_URL | Endereço de conexão com o banco de dados. |
| JWT_SECRET | Chave secreta destinada à autenticação. |
| BREVO_API_KEY | Chave de integração com o serviço de envio de e-mails. |
| EMAIL_FROM | Identificação do remetente dos e-mails. |
| GMAIL_USER | Endereço de e-mail utilizado como alternativa na identificação do remetente. |
| SITE_URL | Endereço de acesso à plataforma. |
| PORT | Porta utilizada pelo servidor local. |

## 4. Configuração do Supabase

1. Acesse https://supabase.com/.
2. Crie uma conta ou entre em uma conta existente.
3. Crie um projeto ou acesse um projeto autorizado.
4. Localize as configurações de conexão e as chaves de API.
5. Copie a URL do projeto e a chave service_role.
6. Preencha as respectivas variáveis no arquivo `.env`.

Para utilizar um novo projeto no Supabase, também será necessário configurar a estrutura do banco de dados conforme o guia de banco de dados.

## 5. Configuração do serviço de e-mail

O Mundo ONG utiliza o Brevo para o envio de e-mails.

1. Acesse https://www.brevo.com/.
2. Crie uma conta ou utilize uma conta existente.
3. Gere uma chave de API.
4. Configure e valide o remetente.
5. Preencha as variáveis correspondentes no arquivo `.env`.

Essa configuração é necessária para o funcionamento dos recursos que dependem do envio de e-mails.

## 6. Segurança das informações

O arquivo `.env` contém informações privadas e não deve ser publicado no GitHub.

- Não compartilhe senhas ou chaves de API.
- Mantenha o arquivo `.env` incluído no `.gitignore`.
- Utilize uma chave secreta exclusiva e segura.
- Nunca exponha a chave service_role no frontend.

## 7. Inicialização do ambiente

Após preencher as configurações necessárias, salve o arquivo `.env` e execute:

```bash
pnpm dev
```

Acesse o endereço informado no terminal.

Por padrão, o servidor utiliza:

http://localhost:3000

Caso a porta esteja ocupada, o sistema poderá utilizar outra porta disponível.

---

## Navegação da documentação

- [Página inicial](../README.md)
- [Guia de instalação](instalacao.md)
- [Configuração do ambiente](configuracao.md)
- [Banco de dados](banco-de-dados.md)
- [Guia do usuário](guia-do-usuario.md)
- [Solução de problemas](solucao-de-problemas.md)
