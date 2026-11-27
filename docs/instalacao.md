# Guia de instalação — Mundo ONG

Este guia apresenta os requisitos e procedimentos necessários para instalar e executar o Mundo ONG em um ambiente local.

## 1. Requisitos do sistema

Antes de iniciar a instalação, certifique-se de possuir os seguintes programas:

| Ferramenta | Versão recomendada | Finalidade |
|---|---|---|
| Node.js | 24 LTS | Executar o servidor e as ferramentas do projeto. |
| pnpm | 10.4.1 | Gerenciar as dependências. |
| Git | 2.x | Clonar o repositório. |
| Visual Studio Code | Versão atualizada | Editor de código opcional. |
| Navegador web | Versão atualizada | Acessar a plataforma. |

## 2. Download das ferramentas

- Node.js: https://nodejs.org/
- Git: https://git-scm.com/
- Visual Studio Code: https://code.visualstudio.com/

## 3. Verificação da instalação

Abra o terminal do computador e execute os comandos:

```bash
node -v
npm -v
git --version
```

Os comandos deverão apresentar as versões instaladas.

## 4. Instalação do pnpm

Execute o seguinte comando no terminal:

```bash
npm install -g pnpm@10.4.1
```

Para verificar a instalação:

```bash
pnpm -v
```

## 5. Clonagem do repositório

Execute o comando:

```bash
git clone https://github.com/thaylonkkjjk/elopetss.git
```

Em seguida, acesse a pasta do projeto:

```bash
cd elopetss
```

## 6. Instalação das dependências

Dentro da pasta principal do projeto, execute:

```bash
pnpm install
```

Aguarde a instalação de todas as dependências necessárias.

## 7. Configuração do ambiente

Antes de iniciar o servidor, será necessário configurar as variáveis de ambiente e a conexão com o Supabase.

Esses procedimentos serão apresentados nos guias de configuração do ambiente e banco de dados.

## 8. Inicialização do servidor

Após concluir as configurações necessárias, execute:

```bash
pnpm dev
```

Esse comando iniciará o sistema em modo de desenvolvimento.

## 9. Acesso à plataforma

Após a inicialização do servidor, abra o navegador e acesse o endereço local informado no terminal.

Mantenha o terminal aberto durante a utilização do sistema.

## 10. Encerramento do servidor

Para interromper a execução do sistema, pressione:

```text
Ctrl + C
```

---

## Navegação da documentação

- [Página inicial](../README.md)
- [Guia de instalação](instalacao.md)
- [Configuração do ambiente](configuracao.md)
- [Banco de dados](banco-de-dados.md)
- [Guia do usuário](guia-do-usuario.md)
- [Solução de problemas](solucao-de-problemas.md)
