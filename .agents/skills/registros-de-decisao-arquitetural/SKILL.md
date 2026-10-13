---
name: registros-de-decisao-arquitetural
description: Registrar, revisar ou substituir decisão de arquitetura em ADR — formato do documento, local e numeração dos arquivos em `docs/adr/`, valores de Status e o critério de quando uma mudança merece registro. Use ao decidir ou rever a geometria do gráfico do radar, a origem do acervo de opiniões, a forma de publicação do site ou a troca de biblioteca estrutural, ao reverter uma restrição ou convenção do `AGENTS.md`, e ao abrir o pull request que carrega essa decisão.
metadata:
  author: clovis-cli
  type: technical-skill
---

# Registros de decisão arquitetural

> **Manutenção desta skill**
>
> Atualize este documento sempre que **qualquer regra descrita aqui** mudar. O critério não é
> *qual* regra — é a natureza da mudança: mudou o comportamento ou a decisão (outro local, outro
> status, outro gatilho de registro) → atualize; refatoração técnica que preserva o padrão
> (renomear arquivo, reorganizar seção, ajustar exemplo cosmético) → não mexa. Quando esta skill
> disser X e o repositório fizer Y sem decisão registrada que resolva o conflito, não "conserte"
> nem a skill nem o código: escale para o humano.

## Visão geral do padrão e do problema que resolve

Um ADR (Architecture Decision Record) é um arquivo Markdown curto, versionado junto do código,
que registra uma decisão estrutural do projeto, o contexto que a motivou, as consequências que
ela impõe e as alternativas descartadas.

O problema que ele resolve é de rastreabilidade. Este repositório guarda o **resultado** das
decisões estruturais em vários lugares — a geometria do gráfico em `src/components/Chart/`, o
contrato de dados em `public/config.json`, o caminho de publicação em
`.github/workflows/prod-deploy-app-on-harbor.yml` —, e as regras operacionais que delas derivam
em `AGENTS.md`. Nenhum desses arquivos carrega o **porquê**. O histórico do Git carrega, mas em
mensagens de commit do tipo `changing <tecnologia> opinion` e em descrições de pull request que
ninguém reencontra meses depois, quando a pergunta volta como "por que não usamos uma biblioteca
de gráfico pronta?" ou "por que o acervo é um JSON único editado à mão?".

O ADR dá a esse porquê um endereço fixo, pesquisável e revisado no mesmo pull request da
mudança. Quem for rever a decisão lê o que já foi considerado e descartado, em vez de refazer a
análise do zero.

## Como aplicar

### Local e numeração

- Os ADRs vivem em `docs/adr/`, na raiz do repositório.
- Um arquivo Markdown por decisão, nomeado `NNNN-titulo-em-kebab-case.md`.
- `NNNN` tem quatro dígitos, com zeros à esquerda, sequencial a partir de `0001`.
- O slug reproduz o título do ADR em kebab-case ASCII, sem acento e sem artigo inicial —
  `0001-geometria-configuravel-do-grafico.md`, `0002-acervo-em-arquivo-json-unico.md`.
- Para descobrir o próximo número, liste `docs/adr/` e some um ao maior `NNNN` presente. Faça
  isso contra a `main` atualizada, nunca contra o estado da branch local.
- Número de ADR não se reaproveita. Um ADR rejeitado permanece no diretório com status
  `Rejeitada` e seu número morre com ele — a sequência registra o que foi considerado, não só o
  que vigora.

### Formato do documento

O documento segue o estilo Nygard, com as seções abaixo e nesta ordem:

```markdown
# NNNN. Título da decisão

- **Status:** Aceita
- **Data:** AAAA-MM-DD
- **Domínio afetado:** Visualização do Radar

## Contexto

O que no projeto forçou a decisão: restrição técnica, limite do dado, exigência de produto,
problema observado. Fatos verificáveis, sem opinião nem relato de reunião.

## Decisão

A escolha feita, em voz ativa e no presente. Uma frase que caiba sozinha fora do documento.

## Consequências

O que passa a valer por causa da decisão: o que fica mais fácil, o que fica mais caro, que
restrição nova entra, que trabalho ela obriga. Inclua as consequências ruins aceitas.

## Alternativas consideradas

Cada alternativa real que esteve em jogo, com o motivo concreto do descarte.
```

- O ADR é escrito em português do Brasil, como `AGENTS.md` e os artefatos de `.agents/`, que são
  a documentação dirigida a quem trabalha no repositório. `README.md` e `CONTRIBUTING.md` ficam
  em inglês porque falam com o público externo que contribui com opiniões.
- **Domínio afetado** usa o nome exato de um dos sete domínios de `.agents/maps/functional-map.md`
  — Taxonomia de Quadrantes e Anéis, Catálogo de Opiniões Tecnológicas, Visualização do Radar,
  Navegação e Descoberta de Tecnologias, Governança de Contribuição do Radar, Publicação e
  Distribuição do Radar, Identidade Institucional DB1. Uma decisão que atravessa mais de um
  domínio lista todos; uma que não cabe em nenhum usa `Transversal`.
- Caminhos de arquivo, nomes de biblioteca e identificadores de código aparecem como estão no
  repositório, sem tradução.

### Status

Os valores permitidos são exatamente estes:

| Status | Significado |
| --- | --- |
| `Proposta` | A decisão está em discussão no pull request e ainda não vale. |
| `Aceita` | A decisão vigora. |
| `Rejeitada` | A proposta foi descartada; o documento fica como registro do que se considerou. |
| `Depreciada` | A decisão deixou de valer e nada a substitui. |
| `Substituída por NNNN` | Outro ADR tomou o lugar deste. |

Um ADR com status `Aceita` é **imutável no conteúdo**: Contexto, Decisão, Consequências e
Alternativas consideradas não são reescritos. Corrigir erro de digitação ou link quebrado é
permitido; mudar o que o documento afirma, não.

Rever uma decisão aceita cria um **ADR novo**, que descreve a decisão atual e cita o número do
anterior no Contexto. No mesmo pull request, o ADR anterior recebe o status
`Substituída por NNNN`, apontando para o novo. A substituição toca dois arquivos, sempre.

### Quando uma mudança merece ADR

O critério é verificável: a mudança merece ADR quando pelo menos uma destas afirmações é
verdadeira.

- Ela altera, remove ou reverte uma restrição global ou uma convenção de arquitetura do
  `AGENTS.md`.
- Ela muda um contrato que outros arquivos consomem — a forma de `public/config.json`, de
  `public/db1-opinion.json` ou de `public/messages.json`.
- Outro time competente escolheria a alternativa descartada, e desfazer a escolha depois custa
  caro.

Quatro gatilhos deste projeto caem nesse critério por construção:

1. **Geometria do gráfico.** Mudança no desenho do radar e no contrato que o alimenta —
   `src/components/Chart/` (`RadarChart.tsx`, `BlipPoints.tsx`, `QuadrantRings.tsx`,
   `geometry.ts`)
   e as chaves `chartConfig` e `quadrantsMap` de `public/config.json`. A reescrita que torna o
   número de quadrantes configurável, em andamento nas branches `feat/us1-geometry-foundation` e
   `feat/us2-rings-arcs-geometry`, é o exemplo vivo: ela extrai o cálculo para
   `src/components/Chart/geometry.ts`, mexe em `public/config.json` e em `src/model.ts`, e
   derruba a restrição de quatro quadrantes declarada no `AGENTS.md`.
2. **Origem do acervo.** Hoje o acervo é o arquivo estático `public/db1-opinion.json`, editado à
   mão por pull request. Trocar essa origem — CMS, API, um arquivo por item, retomada de um
   pipeline de Markdown — é decisão de arquitetura e leva ADR.
3. **Forma de publicação.** O caminho é único e está em
   `.github/workflows/prod-deploy-app-on-harbor.yml`: push em `main`, Node 16.14,
   `yarn install --frozen-lockfile`, `yarn build`, credenciais AWS por OIDC,
   `aws s3 sync ./build s3://techradar.db1.com.br --delete` e invalidação do CloudFront. Trocar
   de provedor, de gatilho, de bucket ou acrescentar etapa que mude o que chega ao navegador leva
   ADR.
4. **Troca de biblioteca estrutural.** Substituir ou introduzir uma peça que sustenta a aplicação
   inteira — `react-scripts` (Create React App), `react-router-dom`, `i18next`, `d3`,
   `sanitize-html`, `sass`, Jest com Testing Library, o gerenciador de pacotes Yarn — ou adotar
   uma biblioteca de gerenciamento de estado onde hoje há estado local, Context e URL.

Não merece ADR, e deve ir direto ao pull request da mudança:

- ajuste de estilo, cor, espaçamento ou classe SCSS;
- renomeação de arquivo, componente, variável ou chave de tradução;
- correção ou inclusão de conteúdo no acervo — nova opinião, mudança de anel de um item, ajuste
  do texto traduzido —, que é decisão editorial regida pelo `CONTRIBUTING.md`;
- bump de versão de dependência, inclusive os abertos pelo Renovate, enquanto a biblioteca
  continuar a mesma.

### Fluxo

- O ADR entra no **mesmo pull request** da mudança que ele justifica, já com status `Aceita`.
- Quando a decisão precede o código — porque o trabalho é grande, ou porque a escolha precisa de
  acordo antes da implementação —, abra um pull request só com o ADR em status `Proposta`. O
  pull request que implementa muda o status para `Aceita` no mesmo commit em que o código entra.
- O texto descreve a **decisão tomada**, não o debate que levou a ela: sem ata de reunião, sem
  nomes de pessoas, sem "discutimos" ou "chegamos à conclusão". O que foi descartado aparece em
  Alternativas consideradas, com o motivo.
- O ADR descreve o estado que passa a valer, sem narrar a própria edição: quem o abre meses
  depois não viu o diff nem a conversa.

### Relação com as convenções sempre-ligadas

`AGENTS.md` e o ADR têm papéis distintos e não competem:

- uma regra **curta e estável**, que vale em quase toda tarefa, vive como convenção ou restrição
  global no `AGENTS.md` — é texto sempre carregado, e precisa ser enxuto;
- o ADR guarda o **porquê** dessa regra, as consequências aceitas e as alternativas descartadas —
  texto longo, lido só quando a decisão é questionada.

A mesma decisão não é registrada duas vezes em forma de regra. Quando um ADR aceito cria ou muda
uma convenção, o `AGENTS.md` é atualizado **no mesmo pull request**, e a convenção pode apontar o
ADR pelo caminho do arquivo, como já faz com `.agents/context/discovery-answers.md`.

## Ferramentas e artefatos envolvidos

| Artefato | Onde vive | Papel |
| --- | --- | --- |
| ADRs | `docs/adr/NNNN-*.md` | Os registros em si. |
| `AGENTS.md` | raiz | Convenções de arquitetura e restrições globais derivadas das decisões. |
| `functional-map.md` | `.agents/maps/` | Nomes dos sete domínios, usados no campo **Domínio afetado**. |
| `discovery-answers.md` | `.agents/context/` | Decisões transversais da descoberta funcional e o registro das decisões humanas `g1` a `g7`. Um ADR que formaliza uma delas cita o gap correspondente no Contexto. |
| `config.json`, `db1-opinion.json`, `messages.json` | `public/` | Os três contratos de dado cuja forma dispara ADR quando muda. |
| Componentes do gráfico | `src/components/Chart/` | A geometria, assunto recorrente de ADR. |
| Workflow de deploy | `.github/workflows/prod-deploy-app-on-harbor.yml` | A forma de publicação. |
| `CONTRIBUTING.md` | raiz | Fluxo de fork e pull request, e o template de contribuição de tecnologia. |

A revisão do ADR acontece no pull request do GitHub, em
`github.com/db1group/db1-tech-radar` — o mesmo controle humano que já é a única barreira de
qualidade do repositório. Não há template de pull request versionado em `.github/`: o template
que existe está no corpo do `CONTRIBUTING.md` e cobre a entrada de uma tecnologia no acervo, não
a decisão de arquitetura.

## Restrições e armadilhas conhecidas

- **Colisão de número entre pull requests concorrentes.** Dois pull requests abertos ao mesmo
  tempo escolhem o mesmo `NNNN` e o Git não acusa conflito, porque são arquivos de nomes
  diferentes. Quem fizer o rebase por último renumera: renomeia o arquivo, corrige o `# NNNN.`
  do título e todas as referências àquele número — em outro ADR e no `AGENTS.md` — antes do
  merge. Confira o número livre contra a `main` atualizada no momento do rebase, não contra o
  número que estava livre quando a branch nasceu.
- **Status pendurado na substituição.** Um ADR novo sem a atualização do status do anterior
  deixa dois documentos afirmando coisas diferentes, ambos com status `Aceita`. Trate os dois
  arquivos como uma mudança só.
- **ADR virando documentação de uso.** O ADR registra a escolha e o porquê; ele não descreve
  como o código funciona nem como operá-lo — isso vive no `AGENTS.md`, nas demais fontes de
  `.agents/` e no próprio código. Um ADR que precisa ser atualizado toda vez que o código muda
  está documentando implementação, e por isso colide com a regra de imutabilidade.
- **Preservar o comportamento não isenta de ADR.** A reescrita da geometria mantém o desenho
  idêntico ao publicado quando há quatro quadrantes e ainda assim exige ADR, porque muda o
  contrato de `public/config.json` e derruba uma restrição global. Refatoração interna que não
  toca contrato nem convenção é que fica de fora.
- **Decisão antiga sem registro.** O repositório carrega escolhas estruturais anteriores a
  `docs/adr/` — SPA estática sem backend, três idiomas codificados no enum `Language`, Node 16
  fixado em `engines`. Escreva um ADR retroativo apenas quando a decisão estiver sendo revista ou
  quando ela for premissa da decisão que você está registrando agora; nesse caso, a **Data** é a
  do dia em que o ADR foi escrito e o Contexto diz que a decisão é anterior ao registro.
- **Sem backend, sem ADR de API.** A aplicação não expõe nem consome API, não tem banco nem
  autenticação. Decisões sobre contrato de dado neste projeto são sobre os três JSON de
  `public/`.
