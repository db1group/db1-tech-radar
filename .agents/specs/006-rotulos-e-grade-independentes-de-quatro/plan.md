# Plan: rótulos de quadrante e grade responsiva independentes de quatro

Visão técnica da unidade descrita em [`spec.md`](./spec.md).

## Stack e estrutura

A unidade trabalha dentro da SPA em React 18 com Create React App e TypeScript em modo `strict`,
sem acrescentar nem remover dependência. O layout em volta do diagrama vive em
`src/components/RadarGrid/` — `RadarGrid.tsx`, com o bloco de rótulo e a legenda, e
`radar-grid.scss` — e a grade de listagens da página inicial, em
`src/components/QuadrantGrid/quadrant-grid.scss`. As duas peças são montadas por
`src/components/PageIndex/PageIndex.tsx`, dentro da casca `.page` → `.page__content` → `.fadable`.

O slot de tela e a quantidade de setores já têm origem única em
`src/components/Chart/geometry.ts`, nas funções `slotOf` e `segmentCount`, criadas na unidade
[001](../001-geometria-unica-do-radar/spec.md) e consumidas pelos arcos, pelo brilho de fundo e
pelos pontos. Esta unidade leva as duas até o layout, sem fórmula angular nova.

O SCSS segue a convenção do `AGENTS.md`: arquivo por componente ao lado do `.tsx`, nomes de classe
em padrão BEM e variáveis de ponto de quebra em `src/styles/sccs-vars.scss`. Os imports seguem a
ordenação do `prettier.config.js`. A suíte roda na infraestrutura Jest embutida no `react-scripts`
5, sem arquivo de configuração próprio, e o portão de qualidade continua sendo `yarn ts:check`,
`yarn lint`, `yarn test` e `yarn build`.

## Decisões técnicas

Uma linha por veredito; contexto, alternativas e evidência em [`research.md`](./research.md).

- **Origem do lugar do bloco**: `slotOf(quadrantConfig)` de `src/components/Chart/geometry.ts`,
  aplicado como classe `quadrant-label--slot-${slot}`. `stylesMap` e o `style` inline de canto
  saem de `RadarGrid.tsx`.
- **Quantidade publicada no DOM**: `data-quadrants={segmentCount(config)}` na `div.radar-grid`, em
  `RadarGrid.tsx`. É o seletor de contexto de toda regra por contagem.
- **Extração do bloco**: `QuadrantLabel` passa a viver em
  `src/components/RadarGrid/QuadrantLabel.tsx`, com as mesmas props
  (`quadrantConfig`, `quadrantName`, `quadrantLabel`) e exportação padrão, importado por
  `RadarGrid.tsx`. A folha de estilo continua importada uma única vez, por `RadarGrid.tsx`. A
  extração é o que tira a escolha do lugar de dentro do grafo de importação do `d3`.
- **`Legend`**: fica em `RadarGrid.tsx`, sem alteração de JSX; só a sua regra de posição ganha um
  caso por contagem.
- **Número exibido**: `quadrantConfig.position` continua alimentando `{t('quadrant')} {position}`,
  e nenhuma outra leitura de `position` permanece no componente.
- **Cor da linha divisória**: segue em `style={{ borderColor: quadrantConfig.colour }}` no `<hr>`;
  propriedade personalizada de CSS exigiria asserção de tipo sobre `React.CSSProperties` sem mudar
  o que o leitor vê.
- **Tabela de lugares**: portada da branch `v5` de `AOEpeople/aoe_technology_radar` (PR #502,
  Apache-2.0), numerada por slot, conferida caso a caso contra `segmentAngles` para uma a seis
  contagens e adotada com um ajuste — os blocos das laterais, com seis quadrantes, ficam em
  `top: 38%`, a fração que alinha o bloco com o centro do círculo em qualquer largura de janela. A
  procedência é citada na mensagem de commit.
- **Espaço para os blocos**: espaço interno na `.radar-grid` por contagem —
  `[data-quadrants="5"] { padding-bottom: 200px }` e `[data-quadrants="6"] { padding: 0 22% 10% }`
  —, com a largura do bloco intocada. Nenhuma regra de espaço incide sobre uma, duas, três ou
  quatro contagens.
- **Legenda com seis quadrantes**: vai para o centro inferior, a única região livre nessa
  contagem; nas demais fica em `right: 0; top: 45%`, como hoje.
- **Grade de listagens**: `display: grid` com `grid-template-columns: repeat(2, minmax(0, 1fr))` e
  `column-gap: 10%`, que reproduz as colunas de 45% e a separação de 10% de hoje sem pressupor a
  quantidade de blocos; abaixo de `$until-lg`, uma coluna. O `margin-bottom` de 40 px por bloco
  permanece.
- **Ponto de quebra do conjunto**: `@media screen and (min-width: 800px)` segue governando a
  exibição da `.radar-grid`, casado com `chartConfig.size`.
- **Teto de seis quadrantes**: é a última contagem com caso declarado na tabela. Um sétimo
  quadrante ganha setor no diagrama e um bloco que cai no lugar da base, sobreposto ao do slot 6.
  O teto entra na documentação do domínio e em um ADR próprio.
- **Sem troca de `REACT_APP_BUILDHASH`**: a unidade altera `.tsx` e `.scss`, compilados dentro do
  pacote; a querystring de invalidação serve aos três `fetch` de `public/`, que ficam intocados.
- **`research.md`**: gerado, em [`research.md`](./research.md) — as medidas do layout, a
  conferência da tabela por slot e o alcance da suíte são medições, e guardá-las fora do plano
  mantém o veredito legível.

## Modelo de dados

Nenhuma alteração de contrato de dados: `public/config.json`, `ConfigData` e `QuadrantConfig`
ficam como estão, e a unidade consome `quadrantsMap`, `position` e `order`, que já existem.
`data-model.md` fica dispensado.

## Contratos externos

Nenhum. A aplicação não expõe nem consome API, e os arquivos de `public/` são lidos pelo próprio
navegador a partir do mesmo domínio. `contracts/` fica dispensado.

## Interface

Uma tela é tocada — a página inicial — e nenhum componente muda de conteúdo, de fluxo ou de
estado: o que muda é onde cada peça fica. Por isso `ui/` fica dispensado, e o lugar de cada peça
está abaixo.

Regras de `src/components/RadarGrid/radar-grid.scss`, todas sob `.radar-grid`:

| Seletor | Declarações |
| --- | --- |
| `.quadrant-label` | `position: absolute; width: 20%; top: 0; left: 0` |
| `.quadrant-label--slot-1, .quadrant-label--slot-2` | `left: auto; right: 0` |
| `.quadrant-label--slot-2, .quadrant-label--slot-3` | `top: auto; bottom: 0` |
| `[data-quadrants="1"] .quadrant-label--slot-1`, `[data-quadrants="2"] .quadrant-label--slot-2`, `[data-quadrants="3"] .quadrant-label--slot-3` | `top: 0; bottom: auto; left: 0; right: auto` |
| `[data-quadrants="5"]` | `padding-bottom: 200px` |
| `[data-quadrants="5"] .quadrant-label--slot-3` | `left: 50%; transform: translateX(-50%)` |
| `[data-quadrants="5"] .quadrant-label--slot-4` | `top: auto; bottom: 0` |
| `[data-quadrants="6"]` | `padding: 0 22% 10%` |
| `[data-quadrants="6"] .quadrant-label--slot-2`, `[data-quadrants="6"] .quadrant-label--slot-5` | `bottom: auto; top: 38%; transform: translateY(-50%)` |
| `[data-quadrants="6"] .quadrant-label--slot-3` | `left: auto; right: 0` |
| `[data-quadrants="6"] .quadrant-label--slot-4` | `top: auto; bottom: 0` |
| `[data-quadrants="6"] .radar-legend` | `top: auto; bottom: 0; right: 50%; transform: translateX(50%)` |

O resultado por contagem, do slot 1 ao slot N: com um quadrante, superior esquerdo; com dois,
superior direito e superior esquerdo; com três, superior direito, inferior direito e superior
esquerdo; com quatro, superior direito, inferior direito, inferior esquerdo e superior esquerdo;
com cinco, superior direito, inferior direito, inferior ao centro, inferior esquerdo e superior
esquerdo; com seis, superior direito, direita ao meio, inferior direito, inferior esquerdo,
esquerda ao meio e superior esquerdo. A conferência de cada um desses lugares contra o setor que
`segmentAngles` desenha está em [`research.md`](./research.md).

Na grade de listagens, cada bloco continua com o mesmo conteúdo — rótulo do quadrante, atalho de
aproximação e, por anel, o selo seguido dos rótulos das tecnologias — e a mesma largura de 45% em
janela larga, com 10% de separação entre as colunas e uma coluna abaixo de `$until-lg`.

## Estratégia de testes

A infraestrutura já existe e nada novo é introduzido: Jest e Testing Library vêm do
`react-scripts` 5, `src/setupTests.ts` é carregado automaticamente e a descoberta cobre qualquer
`*.test.tsx` sob `src/`. Os três arquivos desta unidade ficam ao lado do código, com extensão
`.tsx` e nomes de caso em inglês, conforme a skill
[`estrategia-de-testes`](../../skills/estrategia-de-testes/SKILL.md).

- **Componente, `src/components/RadarGrid/QuadrantLabel.test.tsx`** — novo arquivo, com
  `jest.mock("../Link/Link")` devolvendo um `<a>` e com `i18n.changeLanguage(Language.pt)` antes de
  cada caso, no padrão de `PageHelp.test.tsx`:
  - **Lugar pelo slot** — renderizando cada entrada de `quadrantsMap` do `public/config.json` do
    repositório, importado como `geometry.test.tsx` já faz, o bloco de `methods-and-patterns`
    carrega `quadrant-label--slot-1`, o de `tools` `--slot-2`, o de `platforms-and-operations`
    `--slot-3` e o de `languages-and-frameworks` `--slot-4`.
  - **Número pela posição** — os mesmos quatro blocos exibem "quadrante 2", "quadrante 4",
    "quadrante 3" e "quadrante 1".
  - **Trava contra a posição exibida** — com um `QuadrantConfig` de `order` 2 e `position` 5, o
    bloco carrega `--slot-2`; com `order` ausente, carrega a classe do slot igual à `position`,
    que é a recaída de `slotOf`.
  - **Cor da linha** — o `<hr>` do bloco leva a cor declarada em `colour`.
- **Componente, `src/components/QuadrantGrid/QuadrantGrid.test.tsx`** — novo arquivo, com a mesma
  substituição de `Link` e com a fixture `src/components/QuadrantGrid/testData.tsx`, que exporta um
  `ConfigData` de quatro quadrantes, um de cinco e os `Item[]` correspondentes, com `featured: true`
  e `flag` declarada:
  - **Um bloco por quadrante** — com quatro quadrantes declarados, quatro blocos; com cinco, cinco.
  - **Ordem de declaração** — os rótulos aparecem na ordem de `config.quadrants`.
- **Unitário, `src/components/RadarGrid/radar-grid.scss.test.tsx`** — novo arquivo, lendo o SCSS
  com `fs.readFileSync` a partir de `__dirname`:
  - **Regra por slot** — existe regra para cada slot de 1 a 6, e o caso falha nomeando o slot em
    falta.
  - **Casos por contagem** — existem regras sob `[data-quadrants="5"]` e `[data-quadrants="6"]`,
    e nenhuma regra por contagem incide sobre `[data-quadrants="4"]`.
- **Conferência visual com quatro quadrantes** — com `yarn start`, nos três idiomas e em janelas de
  cerca de 800 px, 1000 px e 1200 px de largura: cada bloco no mesmo canto, a mesma cor de linha, a
  legenda no mesmo lugar e a grade de listagens em duas colunas acima de `$until-lg` e em uma
  abaixo. A comparação é contra `techradar.db1.com.br`, aberto lado a lado.
- **Conferência com três, cinco e seis quadrantes** — sobre a cópia local, uma contagem por vez:
  declarar os quadrantes de teste nos dois mapas de `public/config.json`, com `position`, `order`
  contíguo, cor própria e descrição; acrescentar `quadrants.<slug>` e
  `pageHelp.quadrants.<slug>` nos três dicionários; marcar alguns itens de
  `public/db1-opinion.json` com o quadrante novo, em destaque; abrir a página inicial e conferir
  que cada bloco está do lado do seu setor, sem sobreposição com o círculo, com a legenda ou com
  outro bloco, e que a grade de listagens mostra todos os quadrantes. Os arquivos voltam ao estado
  versionado com `git restore` ao fim, antes do commit.
- **Portão de qualidade** — `yarn ts:check`, `yarn lint` e `yarn build` terminam limpos, com
  `CI=true` tratando aviso do ESLint como erro no build do GitHub Actions. A execução de
  `CI=true react-scripts test --watchAll=false` na base desta unidade devolve 5 suítes passando e
  2 falhando — `Item.test.tsx` por transformação de ESM de `query-string` e `date.test.tsx` por
  `moment` —, com 102 casos verdes em 104. A exigência é que os três arquivos novos passem
  inteiros e que nenhuma suíte que passava entre em falha.

## Impacto na documentação autoritativa

Esta unidade troca deliberadamente a origem do lugar do bloco de rótulo — da posição exibida para
o slot de tela — e substitui o teto de quatro quadrantes por um teto de seis, vindo da tabela de
lugares do layout. A decisão está registrada na descrição da unidade e apoiada na
[ADR 0001](../../../docs/adr/0001-geometria-configuravel-do-grafico.md), que estabelece a
quantidade de quadrantes como escolha de configuração e prevê que os blocos de rótulo passem a
consumir a geometria compartilhada. Cada item abaixo vira tarefa de documentação na fase `tasks`,
executada junto com o código.

- **`docs/adr/0002-*.md`** — ADR novo, em status `Aceita`, com domínio afetado "Visualização do
  Radar, Taxonomia de Quadrantes e Anéis": o lugar do bloco de rótulo vem do slot de tela e a
  tabela de lugares por contagem fixa o teto de seis quadrantes. O registro é exigido pela skill
  [`registros-de-decisao-arquitetural`](../../skills/registros-de-decisao-arquitetural/SKILL.md),
  cujo critério inclui alterar restrição global do `AGENTS.md` — é esta unidade que remove a
  restrição de quatro quadrantes e coloca outra em seu lugar. As alternativas descartadas a
  registrar são a fórmula que calcularia o lugar de cada bloco em tempo de renderização, sem teto,
  e manter a escolha pela posição exibida. O número é conferido contra a `main` atualizada no
  momento do rebase. A ADR 0001 permanece `Aceita` e não é substituída: ela decide a geometria
  configurável, que esta unidade executa.
- **`AGENTS.md`** — em *Restrições globais*, a restrição de quadrantes passa a declarar o teto de
  seis, atribuído à tabela de lugares dos blocos em `src/components/RadarGrid/radar-grid.scss`,
  mantendo a ausência de validação da configuração, a exigência do desenho idêntico ao publicado
  com quatro quadrantes e o ponteiro para a ADR 0001, acrescido do ponteiro para o ADR novo.
- **`.agents/skills/visualizacao-do-radar/SKILL.md`** — a regra 12 passa a dizer que o bloco fica
  do lado do setor do seu quadrante, apontado pelo slot de tela, com a tabela de lugares por
  contagem de um a seis, e mantém a posição exibida como o número que o leitor lê. A regra 16 deixa
  de registrar os blocos como peça presa a quatro e passa a registrar o teto de seis e a sua
  origem. A regra 13 registra que a legenda fica ao lado do diagrama, no centro inferior quando há
  seis quadrantes. Na *Visão geral do domínio*, o bloco deixa de ser descrito como "um em cada
  canto". No fluxo *Desenhar o radar*, o passo 6 passa a posicionar um bloco por quadrante. No
  fluxo *Acrescentar um quadrante ao desenho*, o passo 1 atribui o slot e a posição com os papéis
  corretos e o passo 3 troca a migração pendente pelo teto de seis. Em *Restrições e validações*, a
  restrição de posições de 1 a 4 passa a tratar de número exibido repetido, e entra a restrição do
  teto de seis.
- **`.agents/skills/taxonomia-de-quadrantes-e-aneis/SKILL.md`** — a regra 4 deixa de mapear posição
  para canto: a posição é o número exibido e o slot de tela decide o setor e o lugar do bloco. No
  fluxo *Acrescentar um quadrante*, o passo 3 atribui a posição como número exibido e o slot como
  lugar de tela, e a observação final troca a migração pendente pelo teto de seis. Em *Restrições e
  validações*, a restrição de posições de 1 a 4 passa a tratar de número repetido e a restrição do
  número de quadrantes passa a declarar o teto de seis, com a sua origem.
- **`.agents/skills/estrategia-de-testes/SKILL.md`** — em *Restrições e armadilhas conhecidas*, a
  armadilha do alcance da suíte passa a registrar que um componente cujo único import ESM é `Link`
  é alcançável substituindo esse módulo no arquivo de teste, enquanto o que importa `d3` continua
  fora de alcance. Em *O que conta como tela alterada*, a lista de componentes alcançados inclui
  `QuadrantLabel` e `QuadrantGrid`.
- **`.agents/maps/functional-map.md`** — no domínio Taxonomia de Quadrantes e Anéis, a regra
  inferida que dá à posição o papel de decidir o canto passa a distinguir slot e posição. No
  domínio Visualização do Radar, a regra inferida que registra os blocos como peça presa a quatro
  sai, e a dependência técnica que lista as branches da reescrita inclui `feat/us6-labels-grid`.
- **`.agents/skills/registros-de-decisao-arquitetural/SKILL.md`** — no gatilho *Geometria do
  gráfico*, a lista de branches da reescrita acompanha esta unidade.

Sem impacto em `.agents/skills/navegacao-e-descoberta-de-tecnologias/SKILL.md`: a regra 13 descreve
a grade compacta em duas colunas em janela larga e em uma coluna abaixo de aproximadamente 990 px,
e é isso que a grade continua fazendo, para qualquer quantidade de quadrantes. Sem impacto em
`.agents/skills/catalogo-de-opinioes-tecnologicas/SKILL.md`,
`.agents/skills/governanca-de-contribuicao-do-radar/SKILL.md`,
`.agents/skills/publicacao-e-distribuicao-do-radar/SKILL.md`,
`.agents/skills/identidade-institucional-db1/SKILL.md`,
`.agents/skills/internacionalizacao-do-radar/SKILL.md`, `CONTRIBUTING.md` e `.env`: o acervo, o
processo editorial, o caminho de publicação, o conteúdo institucional, o mecanismo de tradução e
as variáveis de build ficam como estão.
