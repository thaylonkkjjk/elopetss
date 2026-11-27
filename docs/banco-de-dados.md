# Banco de dados — Mundo ONG

## 1. Visão geral

O Mundo ONG utiliza o PostgreSQL como sistema de gerenciamento de banco de dados, por meio da plataforma Supabase.

O banco de dados é responsável pelo armazenamento e gerenciamento das informações utilizadas pela plataforma.

## 2. Tecnologias utilizadas

### PostgreSQL

Sistema de gerenciamento de banco de dados relacional, responsável pelo armazenamento estruturado das informações.

### Supabase

Plataforma que disponibiliza serviços de banco de dados, armazenamento e integração com aplicações.

## 3. Organização das informações

O sistema trabalha com as seguintes categorias de informações:

| Categoria | Informações |
|---|---|
| ONGs | Dados cadastrais, informações de contato e situação do cadastro. |
| Adoções | Informações dos animais disponíveis para adoção. |
| Pedidos de ajuda | Publicações relacionadas às necessidades das organizações. |
| Denúncias | Registros de denúncias realizadas pelos visitantes. |
| Administração | Informações relacionadas ao gerenciamento e à moderação da plataforma. |

### 3.1. Tabelas do banco de dados

O Mundo ONG utiliza as seguintes tabelas para organizar e gerenciar suas informações:

| Nome da tabela | Finalidade |
|---|---|
| `ongs_pending` | Armazena os cadastros de ONGs que aguardam aprovação. |
| `ongs_approved` | Armazena as informações das ONGs aprovadas. |
| `ong_posts` | Armazena as publicações de adoção e pedidos de ajuda. |
| `ong_contact_methods` | Armazena as formas de contato das organizações. |
| `post_reports` | Armazena as denúncias de publicações. |
| `post_history` | Registra o histórico de publicações. |
| `admin_users` | Armazena os registros dos usuários administrativos. |
| `admin_logs` | Registra as ações realizadas pelos administradores. |
| `login_history` | Registra o histórico de acessos. |

### 3.2. Armazenamento de imagens

Além do banco de dados relacional, o Mundo ONG utiliza o Supabase Storage para o armazenamento de imagens.

O sistema utiliza um bucket denominado `elopets-images`.

Um bucket é um espaço destinado ao armazenamento de arquivos, permitindo organizar e disponibilizar imagens utilizadas pela aplicação.

Ao configurar uma nova instância do Supabase, será necessário criar esse bucket e configurar suas permissões de acesso de acordo com as necessidades do sistema.

O nome do bucket deve ser mantido para garantir a compatibilidade com a aplicação.

## 4. Configuração do banco de dados

1. Acesse https://supabase.com/.
2. Realize o login ou crie uma conta.
3. Clique em New Project.
4. Defina o nome do projeto.
5. Crie uma senha segura para o banco de dados.
6. Selecione a região de hospedagem.
7. Aguarde a criação do projeto.

## 5. Configuração da estrutura

Para utilizar um novo banco de dados, será necessário reproduzir a estrutura utilizada pelo Mundo ONG.

No painel do Supabase, as ferramentas Table Editor e SQL Editor permitem criar e gerenciar tabelas, campos e relacionamentos.

A estrutura original do banco deverá ser disponibilizada pela equipe responsável pelo desenvolvimento antes da configuração de uma nova instância.

## 6. Conexão com o sistema

Na pasta principal do Mundo ONG, localize o arquivo `.env` criado durante a configuração do ambiente.

Preencha as variáveis de conexão com as credenciais fornecidas pelo Supabase:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
```

As credenciais devem pertencer ao projeto de banco de dados autorizado para utilização.

## 7. Verificação da conexão

Após configurar as credenciais e a estrutura do banco de dados, execute:

```bash
pnpm dev
```

Acesse a plataforma e verifique se as informações cadastradas são exibidas corretamente.

## 8. Segurança e manutenção

Para garantir a proteção das informações armazenadas, recomenda-se:

- Utilizar senhas fortes.
- Restringir o acesso administrativo.
- Realizar backups periódicos.
- Não compartilhar credenciais de acesso.
- Não publicar informações privadas no GitHub.
- Utilizar um banco de dados separado para testes.

## 9. Documentação oficial

- Supabase: https://supabase.com/docs
- PostgreSQL: https://www.postgresql.org/docs/

---

## Navegação da documentação

- [Página inicial](../README.md)
- [Guia de instalação](instalacao.md)
- [Configuração do ambiente](configuracao.md)
- [Banco de dados](banco-de-dados.md)
- [Guia do usuário](guia-do-usuario.md)
- [Solução de problemas](solucao-de-problemas.md)
