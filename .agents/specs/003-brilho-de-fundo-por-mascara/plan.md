# Plan: brilho de fundo por máscara compartilhada

Visão técnica da unidade descrita em [`spec.md`](./spec.md).

## Stack e estrutura

A unidade trabalha dentro da SPA em React 18 com Create React App e TypeScript em modo `strict`,
sem acrescentar nem remover dependência. O desenho do radar vive em `src/components/Chart/`, com um
arquivo por peça: `RadarChart.tsx` compõe o SVG, `QuadrantRings.tsx` desenha o setor de cada
quadrante, `BlipPoints.tsx` posiciona os pontos e `geometry.ts` guarda a convenção angular, em
graus, 0° = 12 horas, sentido horário. Esta unidade acrescenta duas exportações a `geometry.ts`,
abre um bloco `<defs>` no `<svg>` de `RadarChart.tsx` e troca o bloco de brilho de
`QuadrantRings.tsx`.

Os imports seguem a ordenação do `prettier.config.js`: pacotes primeiro, depois um bloco separado
com os caminhos relativos, com os especificadores em ordem alfabética. A suíte roda na
infraestrutura Jest embutida no `react-scripts`, sem arquivo de configuração próprio, e o portão de
qualidade continua sendo `yarn ts:check`, `yarn lint` e `yarn test`.

## Decisões técnicas

Uma linha por veredito; contexto, alternativas e evidência em [`research.md`](./research.md).

- **`polarToCartesian`**: função pura em `src/components/Chart/geometry.ts`, com a assinatura
  `(centre: number, radius: number, angleInDegrees: number) => Point`, aplicando `DEG_TO_RAD` sobre
  `angleInDegrees - 90` e devolvendo o `Point` de `src/model.ts` em pixels de tela, com o eixo
  vertical crescendo para baixo.
- **Centro do diagrama**: `config.chartConfig.size / 2`, em `geometry.ts` e nos dois componentes;
  nenhuma escala `d3` participa do cálculo do brilho, e `yScale` em particular inverteria o eixo
  vertical.
- **Raio dos vértices do setor**: `config.chartConfig.size`, o dobro do raio do círculo, para a
  corda entre as duas pontas nunca entrar no círculo do radar.
- **Forma do brilho**: `glowShape(slot, numSegments, size)` em `geometry.ts`, devolvendo a união
  discriminada `GlowShape` — `{ kind: "circle", cx, cy, r }` para uma fatia,
  `{ kind: "rect", x, y, width, height }` para duas e `{ kind: "polygon", points: Point[] }` para
  três ou mais, com os vértices na ordem centro, ponta inicial, ponta final.
- **Fonte dos ângulos das pontas**: `segmentAngles(slot, numSegments)`, já exportada por
  `geometry.ts`; `glowShape` não escreve nenhuma repartição própria do círculo.
- **Tradução da forma em SVG**: função de módulo em `QuadrantRings.tsx` que faz o `switch` sobre
  `kind` e emite `<circle>`, `<rect>` ou `<polygon>`, com `fill` igual a `quadrant.colour` e
  `mask="url(#glow-mask)"`; o atributo `points` do polígono é a junção das coordenadas de
  `GlowShape`.
- **Recorte pelo círculo**: a forma do brilho fica dentro de um `<g mask="url(#radar-mask)">`,
  porque um elemento carrega uma única máscara e são duas em série.
- **`<defs>` global**: `mask` `radar-mask`, `radialGradient` `glow-gradient` e `mask` `glow-mask`
  declarados uma vez no `<svg>` de `RadarChart.tsx`, com identificadores fixos — o gráfico é
  renderizado uma única vez por página.
- **Região das máscaras**: `maskUnits="userSpaceOnUse"` com `x` 0, `y` 0, `width` e `height` iguais
  a `size`, nas duas, para a região de recorte não depender da forma mascarada.
- **Conteúdo de `radar-mask`**: `<rect>` de `fill="black"` cobrindo o quadrado do diagrama mais
  `<circle>` de `fill="white"` em `(centre, centre)` com raio `centre`. As duas cores são
  declaradas no elemento porque `.chart` em `src/components/Chart/chart.scss` define `fill: white`,
  que é herdado por quem não declara o seu.
- **Conteúdo de `glow-mask`**: `<circle>` em `(centre, centre)` com raio `centre`, pintado por
  `url(#glow-gradient)`; o degradê vai de branco com `stopOpacity` 0,5 em 0% a branco com
  `stopOpacity` 0 em 100%, sem atributos de posição, porque o padrão `objectBoundingBox` já
  descreve o círculo inscrito na caixa do elemento pintado.
- **Opacidade do brilho**: vem exclusivamente da parada inicial da máscara; a forma do quadrante
  não leva atributo de opacidade.
- **Remoções em `QuadrantRings.tsx`**: a constante `gradientAttributes`, a variável `gradientId`, o
  `<defs>` com o `radialGradient` por quadrante e o `<rect>` de canto saem juntos; o componente
  deixa de ler `quadrant.position`.
- **Arcos dos anéis**: `arcPath`, o bloco do `d3.arc` e a translação por `size / 2` ficam como
  estão, desenhados depois do brilho para continuarem por cima dele.
- **`research.md`**: gerado, em [`research.md`](./research.md) — a cobertura da corda, o alcance do
  `d3` pela suíte, a região das máscaras e a equivalência do degradê são medições, e guardá-las
  fora do plano mantém o veredito legível.

## Modelo de dados

Nenhuma alteração de contrato: `public/config.json`, `ConfigData` e `QuadrantConfig` ficam como
estão, e a unidade só consome `chartConfig.size`, `colour` e o slot de tela que já existem.
`GlowShape` é tipo interno de `geometry.ts`, não estado nem dado persistido. `data-model.md` fica
dispensado.

## Contratos externos

Nenhum. A aplicação não expõe nem consome API, e os arquivos de `public/` são lidos pelo próprio
navegador a partir do mesmo domínio. `contracts/` fica dispensado.

## Interface

Nenhuma tela muda de aparência ou de comportamento com os quatro quadrantes publicados: o critério
de aceite da unidade é a equivalência visual com o radar no ar. `ui/` fica dispensado.

## Estratégia de testes

A infraestrutura já existe e nada novo é introduzido: Jest e Testing Library vêm do `react-scripts`
5, `src/setupTests.ts` é carregado automaticamente e a descoberta cobre qualquer `*.test.tsx` sob
`src/`.

- **Unitário** — `src/components/Chart/geometry.test.tsx` ganha dois blocos, ao lado dos que já
  cobrem o módulo:
  - `polarToCartesian` — 0° devolve `x` no centro e `y` acima dele, 90° à direita, 180° abaixo e
    270° à esquerda. As comparações com o centro usam `toBeCloseTo`, porque a aritmética de ponto
    flutuante devolve 400,00000000000006 onde o centro é 400.
  - `glowShape` — a trava de tela lê o `public/config.json` do repositório, já importado pelo
    arquivo, e afirma, para cada um dos quatro quadrantes publicados, de que lado do centro cai
    cada ponta do polígono: `methods-and-patterns` com a primeira no topo e a segunda à direita,
    `tools` à direita e abaixo, `platforms-and-operations` abaixo e à esquerda, e
    `languages-and-frameworks` à esquerda e no topo. Para `N` em {3, 5, 6}, todas as coordenadas
    são finitas e a distância do centro à corda que liga as duas pontas é maior ou igual ao raio do
    círculo, com igualdade por `toBeCloseTo` em `N` igual a 3. Para `N` igual a 1 o resultado é o
    círculo de raio `size / 2` centrado no centro, e para `N` igual a 2 são os dois retângulos de
    meia largura e altura cheia, com `x` no centro para o slot 1 e em 0 para o slot 2.
- **Componente** — não exigido e não possível: um teste que renderize `QuadrantRings` ou
  `RadarChart` importa o `d3` e falha com `SyntaxError` antes de rodar qualquer caso. Nenhum
  componente de página muda o que apresenta.
- **Equivalência visual** — conferência manual, comparando por captura de tela a página inicial
  servida por `yarn start` com `techradar.db1.com.br`: mesma cor em cada setor, mesmo degradê do
  centro para a borda e nenhuma cor fora do círculo. A divergência aceita é de um pixel no
  quadrante superior esquerdo, onde o `<rect>` publicado começa em `x` igual a 1 e carrega o
  degradê deslocado na mesma medida.
- **Conferência com cinco quadrantes** — feita depois do commit da unidade, sobre a cópia local, em
  quatro passos: acrescentar um quinto quadrante a `quadrantsMap` em `public/config.json`
  (`position` 5, `order` 5, cor própria), sem declará-lo no mapa `quadrants`; acrescentar uma quinta
  entrada à lista `pageHelp.quadrants` nos três dicionários de `src/i18n/translations/`, porque
  `RadarGrid.tsx` a lê por `position - 1` e derruba a página inicial inteira sem ela; abrir a página
  inicial com `yarn start` e conferir os cinco setores de 72°, sem lacuna nem sobreposição; conferir
  também que nenhum fio sem cor aparece no meio do arco com três quadrantes, reduzindo o
  `quadrantsMap` a três entradas. Os quatro arquivos voltam ao estado versionado com `git restore`
  ao fim.
- **Portão de qualidade** — `yarn ts:check` e `yarn lint` terminam limpos e precisam continuar
  assim. `yarn test` já tem `Item.test.tsx` e `date.test.tsx` falhando por transformação de ESM de
  `query-string` e de `moment`; a exigência é que `geometry.test.tsx` passe inteiro — hoje são 37
  casos, todos passando — e que nenhuma suíte que passava entre em falha.

## Impacto na documentação autoritativa

Esta unidade altera deliberadamente a composição do fundo colorido de cada setor e o que decide a
sua fatia, com a decisão registrada em
[`docs/adr/0001-geometria-configuravel-do-grafico.md`](../../../docs/adr/0001-geometria-configuravel-do-grafico.md).
Cada item abaixo vira tarefa de documentação na fase `tasks`, executada junto com o código.

- **`.agents/skills/visualizacao-do-radar/SKILL.md`** — a regra 8 passa a descrever o fundo do setor
  como uma forma sólida na cor do quadrante, recortada pelo círculo do radar e por um degradê único
  do diagrama, que vai de meia opacidade no centro a transparência total na borda; a fatia é a do
  slot de tela, e não um quarto fixo da área. A regra 16 registra que os arcos e o brilho de fundo
  acompanham a quantidade de quadrantes declarada, enquanto o deslocamento angular que sorteia a
  posição dos pontos e os blocos de rótulo nos cantos seguem presos a quatro posições. Em
  *Restrições e validações*, a restrição de posições de 1 a 4 sem repetição passa a dizer que duas
  posições iguais sobrepõem dois blocos de rótulo no mesmo canto, e que é o slot repetido que
  desenha dois setores sobre a mesma área.
- **`.agents/skills/estrategia-de-testes/SKILL.md`** — a descrição do que vive em
  `src/components/Chart/geometry.ts` passa a incluir a conversão de polar para cartesiano em pixels
  de tela e a forma do brilho de cada setor. A armadilha sobre quadrantes fixos nomeia o vetor de
  deslocamento de `BlipPoints.tsx` como a tabela indexada por posição que resta, com os arcos e o
  brilho de fundo tirando o setor de `geometry.ts`.
- **`.agents/maps/functional-map.md`** — na seção do domínio Visualização do Radar, a regra inferida
  sobre geometria passa a dizer que a repartição do círculo acompanha a quantidade de quadrantes
  declarada, e que o que continua preso a quatro posições é o sorteio dos pontos — com a sua ordem
  anti-horária e a tradução embutida entre posição de negócio e posição geométrica — junto com os
  blocos de rótulo. A dependência técnica que cita o andamento da reescrita nomeia também a branch
  `feat/us3-glow-mask`.

Sem impacto em `.agents/skills/taxonomia-de-quadrantes-e-aneis/SKILL.md`: o slot de tela, a cor do
quadrante e a exigência de slots contíguos de 1 a N já estão descritos, e esta unidade apenas os
consome. Sem impacto em `.agents/skills/registros-de-decisao-arquitetural/SKILL.md`: o gatilho
"Geometria do gráfico" já nomeia os três arquivos que esta unidade toca, e a decisão desta migração
está registrada na ADR 0001, que segue valendo — nenhuma ADR nova e nenhuma substituição. Sem
impacto em `AGENTS.md`: a restrição global continua valendo, porque publicar com uma quantidade de
quadrantes diferente de quatro depende do sorteio dos pontos e dos blocos de rótulo, que esta
unidade não toca.
