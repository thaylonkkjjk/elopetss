<div align="center">

**EE PROFESSOR ROLDÃO LOPES DE BARROS**

Habilitação profissional: Técnico em Desenvolvimento de Sistemas

<br>

**EDUARDO SOUZA**
**THAYLON**
**TAMIRES**
**MATHEUS DIAS**
**DIEGO**

<br><br>

# ELOPETS

**Plataforma web para ONGs de proteção animal**

<br><br>

São Paulo
2026

</div>

---

> Trabalho de Conclusão de Curso apresentado à EE Professor Roldão Lopes de Barros como requisito parcial para a obtenção do título de Técnico em Desenvolvimento de Sistemas.
>
> **Orientadores:** Prof. Josef e Profª Juliette

---

## RESUMO

O EloPets é uma plataforma web que conecta organizações não governamentais (ONGs) de proteção animal, adotantes, doadores e voluntários. O projeto parte da observação de que muitas ONGs enfrentam falta de recursos (alimentos, medicamentos e apoio financeiro) e de voluntários, enquanto há pessoas dispostas a ajudar que não sabem como ou onde contribuir. A plataforma centraliza a divulgação de animais para adoção, o cadastro e a gestão de ONGs parceiras, o recebimento de doações, a candidatura a ações de voluntariado e a conscientização sobre a posse responsável. O sistema é desenvolvido com HTML, CSS e TypeScript no front-end, e com o Supabase (banco de dados PostgreSQL, autenticação e armazenamento de arquivos) no back-end, com interface responsiva.

---

## SUMÁRIO

1. [Introdução](#1-introdução)
   - 1.1 [Justificativa](#11-justificativa)
   - 1.2 [Objetivos](#12-objetivos)
2. [Equipe e instituição](#2-equipe-e-instituição)
3. [Tecnologias e características técnicas](#3-tecnologias-e-características-técnicas)
4. [Requisitos do sistema](#4-requisitos-do-sistema)
   - 4.1 [Requisitos funcionais](#41-requisitos-funcionais)
   - 4.2 [Requisitos não funcionais](#42-requisitos-não-funcionais)
   - 4.3 [Funcionalidades futuras](#43-funcionalidades-futuras)
5. [Modelagem](#5-modelagem)
   - 5.1 [Mapa do site](#51-mapa-do-site)
   - 5.2 [Diagrama entidade-relacionamento](#52-diagrama-entidade-relacionamento)
   - 5.3 [Dicionário de dados](#53-dicionário-de-dados)
6. [Proteção de dados pessoais](#6-proteção-de-dados-pessoais)
7. [Instalação e execução](#7-instalação-e-execução)
8. [Considerações finais](#8-considerações-finais)
9. [Referências](#9-referências)

---

## 1 INTRODUÇÃO

O EloPets é o Trabalho de Conclusão de Curso (TCC) do Curso Técnico em Desenvolvimento de Sistemas da EE Professor Roldão Lopes de Barros. O projeto utiliza a tecnologia como ferramenta de apoio social, criando uma ponte digital entre ONGs de proteção animal, adotantes e doadores.

A plataforma centraliza:

- a divulgação de animais disponíveis para adoção;
- o cadastro e a gestão de ONGs parceiras;
- o recebimento de doações e o voluntariado;
- a conscientização sobre a posse responsável.

### 1.1 Justificativa

Muitas ONGs de proteção animal enfrentam dificuldades relacionadas à falta de recursos, como alimentos, medicamentos e apoio financeiro, além da escassez de voluntários. Ao mesmo tempo, existem pessoas e instituições dispostas a ajudar, mas que não sabem como ou onde contribuir. A plataforma facilita essa conexão, promovendo colaboração, solidariedade e melhor distribuição de recursos entre as ONGs mais necessitadas.

### 1.2 Objetivos

**Objetivo geral:** desenvolver uma plataforma web que conecte ONGs de proteção animal entre si e com pessoas interessadas em ajudar, facilitando a troca de recursos, doações e apoio voluntário.

**Objetivos específicos:**

- permitir o cadastro e a gestão de usuários e ONGs;
- divulgar animais para adoção com filtros de busca;
- permitir solicitações de adoção e o acompanhamento do status;
- registrar doações e candidaturas a voluntariado;
- oferecer uma interface responsiva, intuitiva e segura.

---

## 2 EQUIPE E INSTITUIÇÃO

| Papel | Nome |
|---|---|
| Autor | Eduardo Souza |
| Autor | Thaylon |
| Autora | Tamires |
| Autor | Matheus Dias |
| Autor | Diego |
| Orientador | Prof. Josef |
| Orientadora | Profª Juliette |

**Instituição:** EE Professor Roldão Lopes de Barros, São Paulo, 2026.

---

## 3 TECNOLOGIAS E CARACTERÍSTICAS TÉCNICAS

| Item | Descrição |
|---|---|
| Marcação | HTML |
| Estilização | CSS |
| Linguagem | TypeScript |
| Back-end e banco de dados | Supabase (PostgreSQL, autenticação, armazenamento de arquivos e regras de acesso por linha, o *Row Level Security*) |
| Aplicação | Plataforma web |
| Interface | Responsiva (dispositivos móveis e desktop) |
| Segurança | Autenticação pelo Supabase Auth e regras de acesso (RLS) nas tabelas |
| Desempenho | Tempo de resposta adequado |
| Design | Intuitivo e de fácil usabilidade |

---

## 4 REQUISITOS DO SISTEMA

### 4.1 Requisitos funcionais

| Código | Descrição |
|---|---|
| RF01 | O administrador deve cadastrar e gerenciar usuários e ONGs. |
| RF02 | O usuário deve realizar cadastro na plataforma. |
| RF03 | O usuário pode informar suas áreas de interesse (doação, adoção etc.). |
| RF04 | O usuário pode buscar ONGs por localização, tipo de causa ou necessidade. |
| RF05 | O usuário pode visualizar informações detalhadas das ONGs. |
| RF06 | O usuário pode se candidatar a ações de voluntariado. |
| RF07 | O usuário pode realizar doações para ONGs cadastradas. |
| RF08 | A ONG deve cadastrar seus projetos, campanhas e necessidades. |
| RF09 | A ONG deve atualizar informações sobre suas atividades. |

### 4.2 Requisitos não funcionais

| Código | Descrição |
|---|---|
| RNF01 | Interface responsiva, adaptável a dispositivos móveis e desktop. |
| RNF02 | Segurança dos dados dos usuários (senhas tratadas pelo Supabase Auth, que as armazena com *hash*, e acesso às tabelas controlado por RLS). |
| RNF03 | Bom desempenho e tempo de resposta adequado. |
| RNF04 | Design intuitivo e de fácil usabilidade. |

### 4.3 Funcionalidades futuras

- Chat em tempo real entre usuários e ONGs;
- doações via PIX / PagSeguro;
- geolocalização de ONGs próximas;
- aplicativo móvel;

---

## 5 MODELAGEM

### 5.1 Mapa do site

```text
EloPets
├── / (Home)
│   ├── Destaques de pets
│   └── Campanhas ativas
├── /pets
│   ├── /pets/:id (Detalhes)
│   └── /pets/filtros (Espécie, Porte, Idade, Cidade)
├── /ongs
│   ├── /ongs/:id (Perfil da ONG)
│   └── /ongs/cadastro
├── /adocao
│   ├── /adocao/solicitar/:petId
│   └── /adocao/status
├── /doacoes
│   ├── /doacoes/pix
│   └── /doacoes/historico
├── /voluntariado
├── /sobre
│   ├── /sobre/contato
│   └── /sobre/faq
├── /auth
│   ├── /login
│   └── /registro
└── /admin (ONG/Admin)
    ├── /admin/dashboard
    ├── /admin/pets
    ├── /admin/adocoes
    └── /admin/usuarios
```

### 5.2 Diagrama entidade-relacionamento

O e-mail e a senha de usuários e ONGs ficam no Supabase Auth (tabela interna `auth.users`). As tabelas abaixo guardam apenas os dados de perfil, ligados ao `id` da conta.

```mermaid
erDiagram
    USUARIO ||--o{ ADOCAO : solicita
    PET ||--o{ ADOCAO : recebe
    ONG ||--o{ PET : cadastra
    ONG ||--o{ DOACAO : recebe
    USUARIO ||--o{ DOACAO : realiza
    PET ||--o{ FOTO_PET : possui
    USUARIO ||--o{ VOLUNTARIO : atua
    ONG ||--o{ VOLUNTARIO : conta_com

    USUARIO {
        uuid id PK
        text nome
        text tipo
        text telefone
        timestamptz created_at
    }
    ONG {
        uuid id PK
        uuid user_id FK
        text nome
        text descricao
        text responsavel_nome
        text telefone
        text website
        text instagram
        text chave_pix
        text endereco
        text cidade
        text estado
        timestamptz created_at
    }
    PET {
        uuid id PK
        uuid ong_id FK
        text nome
        text especie
        text raca
        int idade
        text sexo
        text porte
        text cor_pelagem
        boolean vacinado
        boolean castrado
    }
    ADOCAO {
        uuid id PK
        uuid usuario_id FK
        uuid pet_id FK
        text status
        timestamptz data_solicitacao
        text observacoes
    }
    DOACAO {
        uuid id PK
        uuid usuario_id FK
        uuid ong_id FK
        numeric valor
        text metodo
        timestamptz data
    }
    FOTO_PET {
        uuid id PK
        uuid pet_id FK
        text url
        boolean principal
    }
    VOLUNTARIO {
        uuid id PK
        uuid usuario_id FK
        uuid ong_id FK
        text funcao
        text disponibilidade
    }
```

**Relacionamentos principais**

- **USUARIO – ADOCAO:** um usuário faz várias solicitações.
- **PET – ADOCAO:** um pet pode ter várias solicitações (apenas uma aprovada).
- **ONG – PET:** uma ONG cadastra vários pets.
- **ONG – DOACAO:** uma ONG recebe várias doações.
- **PET – FOTO_PET:** cada pet possui várias fotos.
- **USUARIO – ONG (via VOLUNTARIO):** usuários atuam como voluntários em ONGs.

### 5.3 Dicionário de dados

Os tipos abaixo são os do PostgreSQL (Supabase) e podem ser ajustados.

**USUARIO**

| Campo | Tipo | Observação |
|---|---|---|
| id | uuid, PK | mesmo `id` da conta em `auth.users` |
| nome | text | |
| tipo | text | ex.: adotante, doador, voluntário, admin (com `check`) |
| telefone | text | opcional |
| created_at | timestamptz | padrão `now()` |

**ONG**

| Campo | Tipo | Observação |
|---|---|---|
| id | uuid, PK | padrão `gen_random_uuid()` |
| user_id | uuid, FK → auth.users | conta de acesso da ONG (e-mail e senha ficam no Supabase Auth) |
| nome, descricao | text | informações básicas |
| responsavel_nome | text | |
| telefone, website, instagram, chave_pix | text | contato |
| endereco, cidade, estado | text | localização |
| created_at | timestamptz | |

**PET**

| Campo | Tipo | Observação |
|---|---|---|
| id | uuid, PK | |
| ong_id | uuid, FK → ONG | |
| nome, especie, raca, cor_pelagem | text | |
| idade | int | |
| sexo, porte | text | com `check` dos valores permitidos |
| vacinado, castrado | boolean | |

**ADOCAO, DOACAO, FOTO_PET e VOLUNTARIO:** conforme o diagrama da seção 5.2. Em ADOCAO, `status` pode assumir valores como *pendente*, *em análise*, *aprovada* e *recusada*. Em DOACAO, `valor` é `numeric(10,2)`. Em FOTO_PET, `url` aponta para o arquivo no Supabase Storage.

---

## 6 PROTEÇÃO DE DADOS PESSOAIS

O sistema trata dados pessoais e, por isso, deve observar a Lei Geral de Proteção de Dados (BRASIL, 2018). Recomenda-se:

- coletar apenas os dados necessários à finalidade (princípio da necessidade);
- usar o Supabase Auth para senhas, que não devem ser guardadas em tabelas próprias, e comunicar-se por HTTPS;
- ativar o RLS em todas as tabelas, de modo que cada usuário acesse apenas os dados a que tem direito;
- nunca publicar no repositório a chave de serviço (`service_role`) do Supabase; usar no front-end somente a chave pública (`anon`);
- informar ao titular a finalidade do tratamento e oferecer meios de acessar, corrigir e excluir seus dados;
- verificar em qual região fica o projeto Supabase, pois dados armazenados fora do Brasil caracterizam transferência internacional;
- manter política de privacidade e termos de uso acessíveis na plataforma.

---

## 7 INSTALAÇÃO E EXECUÇÃO

> Complete os trechos entre [colchetes] conforme a estrutura final do repositório.

**Passo 1. Clonar o repositório**

```bash
git clone https://github.com/thaylonkkjjk/elopetss.git
cd elopetss/ONG-ELOPETS
```

**Passo 2. Projeto no Supabase (pendente)**

**Passo 3. Instalar as dependências, compilar e executar (pendente)**

---

## 8 CONSIDERAÇÕES FINAIS

O EloPets propõe uma solução tecnológica de apoio social, aproximando ONGs de proteção animal de pessoas dispostas a adotar, doar e voluntariar-se. Em relação aos objetivos propostos, foram desenvolvidas as funcionalidades de cadastro de usuários e ONGs, divulgação de animais para adoção com filtros, solicitação de adoção, registro de doações e candidatura ao voluntariado.

A plataforma foi construída com HTML, CSS e TypeScript, e com o Supabase como banco de dados e autenticação, com interface responsiva, buscando segurança dos dados, bom desempenho e facilidade de uso.

Durante o desenvolvimento, a equipe encontrou dificuldades como a integração entre o sistema e o banco de dados, a organização do trabalho em grupo e o cumprimento dos prazos. Essas dificuldades contribuíram para a formação técnica dos integrantes, que aplicaram na prática conhecimentos adquiridos ao longo do curso, como programação e versionamento com Git.

Como limitações, destacam-se a ausência de pagamentos reais e a falta de testes com ONGs reais.

Como trabalhos futuros, sugere-se a implementação de chat em tempo real entre usuários e ONGs, doações via PIX e PagSeguro, geolocalização de ONGs próximas e aplicativo móvel. Recomenda-se ainda validar a plataforma com ONGs parceiras, para ajustá-la às necessidades reais de quem atua na proteção animal.

Conclui-se que o EloPets cumpre o objetivo de servir como ponte digital entre ONGs, adotantes, doadores e voluntários, e que tem potencial para ser ampliado e utilizado como ferramenta de impacto social.

---

## 9 REFERÊNCIAS

BRASIL. **Lei nº 13.709, de 14 de agosto de 2018.** Lei Geral de Proteção de Dados Pessoais (LGPD). Brasília, DF: Presidência da República, 2018.
