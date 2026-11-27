# Solução de problemas — Mundo ONG

Este guia apresenta possíveis problemas durante a instalação e execução do sistema, juntamente com orientações para solucioná-los.

## 1. Node.js não reconhecido

Caso o terminal não reconheça o comando `node`, verifique se o Node.js está instalado corretamente.

Execute:

```bash
node -v
```

Caso o problema persista, reinstale o Node.js e reinicie o terminal.

## 2. pnpm não reconhecido

Caso o gerenciador de dependências não esteja disponível, execute:

```bash
npm install -g pnpm@10.4.1
```

Em seguida, verifique a instalação:

```bash
pnpm -v
```

## 3. Erro na instalação das dependências

Verifique a conexão com a internet e certifique-se de estar na pasta principal do projeto.

Execute novamente:

```bash
pnpm install
```

Caso o erro persista, verifique a compatibilidade das versões instaladas.

## 4. Servidor não inicia

Verifique se:

- As dependências foram instaladas corretamente.
- O arquivo `.env` está localizado na pasta principal do projeto.
- As variáveis de ambiente foram configuradas.
- A porta utilizada pelo servidor está disponível.

Após realizar as verificações, execute:

```bash
pnpm dev
```

## 5. Erro de conexão com o banco de dados

Verifique:

- A conexão com a internet.
- A URL do projeto no Supabase.
- As credenciais de acesso.
- A disponibilidade do banco de dados.
- A existência das tabelas necessárias.

Consulte o guia de configuração do banco de dados para mais informações.

## 6. Plataforma não abre no navegador

Certifique-se de que o servidor está em execução.

Verifique o endereço informado no terminal e utilize-o para acessar a plataforma.

Por padrão, o endereço local é:

http://localhost:3000

## 7. Problemas de acesso à área da ONG

Caso não seja possível acessar a área de gerenciamento:

- Verifique as credenciais informadas.
- Confirme se o cadastro da organização foi aprovado.
- Verifique a conexão com o servidor e o banco de dados.

## 8. Problemas no envio de e-mails

Verifique se a chave de API do Brevo foi configurada corretamente e se o remetente está autorizado no serviço.

## 9. Suporte

Caso o problema persista, entre em contato com a equipe responsável pelo desenvolvimento do Mundo ONG ou registre uma ocorrência na seção Issues do repositório no GitHub.

Ao relatar um problema, informe:

- Sistema operacional utilizado.
- Versão do Node.js.
- Versão do pnpm.
- Descrição do problema.
- Mensagem de erro apresentada.

Nunca compartilhe senhas, chaves privadas ou credenciais do banco de dados ao solicitar suporte.

---

## Navegação da documentação

- [Página inicial](../README.md)
- [Guia de instalação](instalacao.md)
- [Configuração do ambiente](configuracao.md)
- [Banco de dados](banco-de-dados.md)
- [Guia do usuário](guia-do-usuario.md)
- [Solução de problemas](solucao-de-problemas.md)
