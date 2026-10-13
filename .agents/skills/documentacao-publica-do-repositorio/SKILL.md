---
name: documentacao-publica-do-repositorio
description: >
  Manutenção dos documentos que o repositório publica para quem chega de fora — `README.md`,
  `CONTRIBUTING.md` e `LICENSE`: o que cabe em cada um, em que idioma são escritos, quando precisam
  ser atualizados e como se dividem com o `AGENTS.md` sem duplicar regra. Carregue ao editar ou
  revisar esses três documentos, ao mudar versão de Node, gerenciador de pacotes, script do
  `package.json`, stack declarada, licença ou endereço do repositório, e ao conferir se as
  instruções publicadas ainda batem com o projeto.
metadata:
  author: clovis-cli
  type: technical-skill
---

# Documentação pública do repositório

> **Manutenção desta skill**
>
> Atualize este documento sempre que **qualquer regra descrita aqui** mudar. O critério não é *qual*
> regra — é a natureza da mudança: mudou o comportamento ou a decisão (outro documento publicado,
> outro idioma, outra divisão de assunto com o `AGENTS.md`, outro gatilho de atualização) →
> atualize; refatoração técnica que preserva o padrão (reordenar seções de um documento, trocar a
> redação de um parágrafo, ajustar um exemplo) → não mexa. Quando esta skill disser X e o
> repositório fizer Y sem decisão registrada que resolva o conflito, não "conserte" nem a skill nem
> o documento: escale para o humano.

## Visão geral do padrão e do problema que resolve

O repositório é público e fala com dois leitores diferentes por canais diferentes.

- **Quem chega de fora** — a pessoa que abre `github.com/db1group/db1-tech-radar` para entender o
  produto, rodar o projeto ou propor uma tecnologia — lê `README.md`, `CONTRIBUTING.md` e `LICENSE`.
- **Quem trabalha no repositório**, com ou sem agente, lê o `AGENTS.md` e os artefatos de
  `.agents/`.

Os mesmos fatos aparecem nos dois canais: a versão do Node, o gerenciador de pacotes, o comando que
sobe o projeto, a stack. Sem uma divisão explícita, cada canal evolui por conta própria e a pessoa
de fora segue uma instrução que falha — e falha depois de ela já ter clonado o projeto.

Nada confere esses documentos automaticamente: não há verificação de link, lint de Markdown nem
etapa de build que os leia. A divergência sobrevive até alguém esbarrar nela, e quem esbarra é
justamente o leitor que ainda não conhece o projeto.

## Como aplicar

### O que cabe em cada documento

| Documento | Leitor | Conteúdo |
| --- | --- | --- |
| `README.md` | quem descobre o projeto | o que é o radar, como rodar localmente, a stack em alto nível e os ponteiros para o guia de contribuição, para o radar de origem e para a licença |
| `CONTRIBUTING.md` | quem quer propor ou alterar uma opinião | o caminho de fork, branch e pull request, o template a responder, a regra do anel de entrada e qual arquivo a pessoa edita |
| `LICENSE` | qualquer pessoa que reutilize o código | o texto integral da Apache 2.0 |

O `README.md` cobre o **mínimo para clonar e rodar**: a versão do Node, a instalação das
dependências e o comando de desenvolvimento. Convenção de arquitetura, regra de teste, organização
de arquivos e portão de qualidade não entram nele.

O `CONTRIBUTING.md` **publica** as regras do processo editorial do radar; ele não as decide. Qual é
o anel de entrada, quem promove uma tecnologia e o que a revisão cobra são decisões do time de
engenharia, com documentação autoritativa própria — o guia é o lugar onde elas chegam a quem
contribui.

### Idioma

Os três documentos são escritos em **inglês**: eles falam com o público externo de um repositório
público. O `AGENTS.md` e os artefatos de `.agents/` são escritos em português do Brasil, porque
falam com quem trabalha no repositório.

Traduzir um desses três documentos para português contraria a regra: a convenção de português vale
para a documentação interna, não para o que o repositório publica.

### Divisão com o `AGENTS.md`

O par de fatos repetido nos dois arquivos é curto e fechado:

| Fato | No `README.md` | No `AGENTS.md` |
| --- | --- | --- |
| Versão do Node | requisito para rodar | restrição global |
| Gerenciador de pacotes | comando de instalação | convenção de dependências e do CI |
| Subir o projeto | `yarn start` | linha da tabela de comandos |
| Stack | lista em alto nível, sem versão | seção `Stack`, com versão quando ela importa |

Alterar qualquer um desses quatro fatos toca os **dois** arquivos no mesmo pull request. Tudo o que
não está nessa tabela tem um só lugar: a tabela completa de comandos, as convenções de arquitetura
e as restrições globais ficam no `AGENTS.md`.

### Quando atualizar o `README.md`

Exigem atualização:

- `engines.node` do `package.json` ou a versão do Node usada no workflow de deploy;
- troca do gerenciador de pacotes, ou renomeação dos scripts de instalação e de desenvolvimento;
- entrada ou saída de um item da stack declarada;
- mudança do endereço canônico do repositório, do endereço do site publicado ou da licença;
- mudança do caminho que a pessoa de fora percorre para alterar o acervo.

Não exigem: componente novo, chave de tradução nova, opinião nova no acervo, atualização de versão
de dependência e qualquer mudança interna de `src/`.

### Quando atualizar o `CONTRIBUTING.md`

Exigem atualização:

- mudança no caminho da contribuição — origem da branch, uso de fork, quem revisa, como a revisão
  responde;
- pergunta que entra ou sai do template de pull request;
- mudança no anel de entrada de uma tecnologia nova;
- mudança do arquivo que a pessoa edita para acrescentar ou alterar uma opinião;
- mudança do endereço do repositório ou da página de ajuda citados no texto.

### Conferir antes de fechar

Toda afirmação dos documentos públicos é verificável contra o repositório. Antes de encerrar uma
alteração neles, confira:

- cada comando citado existe em `scripts` do `package.json` e roda como está escrito;
- a versão do Node bate com `engines` e com o workflow de deploy;
- o gerenciador de pacotes citado é o que tem lockfile versionado — `yarn.lock`;
- cada link resolve, e o endereço do repositório é `github.com/db1group/db1-tech-radar`;
- o arquivo que a pessoa é mandada editar existe no caminho citado.

### Legado a corrigir ao tocar nos documentos

Três afirmações publicadas hoje não correspondem ao repositório. Ao editar o documento em que cada
uma vive, corrija-a na mesma alteração:

- o `CONTRIBUTING.md` manda fazer fork de `github.com/db1group/dgs-tech-radar`; o repositório
  publicado é `github.com/db1group/db1-tech-radar`;
- a lista de passos do `README.md` manda alterar "the Markdown files"; o acervo é o documento único
  `public/db1-opinion.json`;
- o `README.md` oferece `npm install` ao lado de `yarn install`; a instalação é com Yarn, que é o
  gerenciador com lockfile versionado e o usado na publicação.

## Ferramentas e artefatos envolvidos

| Artefato | Onde vive | Papel |
| --- | --- | --- |
| `README.md` | raiz | Apresentação do produto e setup de desenvolvimento para quem chega de fora. |
| `CONTRIBUTING.md` | raiz | Caminho da contribuição e template de pull request. |
| `LICENSE` | raiz | Texto da Apache 2.0. |
| `AGENTS.md` | raiz | Contrato operacional de quem trabalha no repositório; fonte dos comandos completos e das convenções. |
| `package.json` | raiz | `scripts`, `engines.node` e `license` — os valores contra os quais o `README.md` é conferido. |
| `yarn.lock`, `.npmrc` | raiz | Provam qual é o gerenciador de pacotes e o regime de versões exatas. |
| `.github/workflows/prod-deploy-app-on-harbor.yml` | `.github/workflows/` | Versão do Node e comandos efetivamente usados na publicação. |

## Restrições e armadilhas conhecidas

- **Nenhuma verificação automática alcança esses arquivos.** Não há lint de Markdown, verificação de
  link nem etapa de CI que os leia. A revisão do pull request é o único controle, e ela precisa ser
  feita contra o repositório, não contra a memória de quem revisa.
- **Erro aqui custa um contribuinte, não um build.** Uma instrução desatualizada no `README.md` ou
  no `CONTRIBUTING.md` chega a quem ainda não conhece o projeto e produz um pull request inválido ou
  uma desistência silenciosa — nenhum sinal volta para o time.
- **Tudo nesses documentos é público.** Endereço interno, credencial, identificador de recurso de
  infraestrutura e dado pessoal não entram neles em nenhuma hipótese.
- **`LICENSE` e `package.json` declaram a mesma licença.** O campo `license` do `package.json` é
  `Apache-2.0`; alterar um dos dois sem o outro deixa o repositório afirmando duas licenças
  diferentes.
- **O crédito ao radar de origem permanece.** O projeto deriva do AOE Tech-Radar, sob licença
  aberta, e a atribuição no `README.md` faz parte do cumprimento dessa licença. Reescrever a seção é
  permitido; remover o crédito, não.
- **A licença cobre o código, não as opiniões.** O texto da Apache 2.0 vale para o que gera o radar;
  o conteúdo editorial publicado nele não é código licenciado, e o `README.md` não deve sugerir o
  contrário ao convidar à reutilização.
