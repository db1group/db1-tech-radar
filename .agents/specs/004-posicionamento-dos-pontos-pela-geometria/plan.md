# Plan: posicionamento dos pontos pela geometria compartilhada

Visão técnica da unidade descrita em [`spec.md`](./spec.md).

## Stack e estrutura

A unidade trabalha dentro da SPA em React 18 com Create React App e TypeScript em modo `strict`,
sem acrescentar nem remover dependência. O desenho do radar vive em `src/components/Chart/`, com
um arquivo por peça: `RadarChart.tsx` compõe o SVG, `QuadrantRings.tsx` desenha o setor de cada
quadrante, `BlipPoints.tsx` emite os pontos e `geometry.ts` guarda a convenção angular — graus,
0° = 12 horas, sentido horário — junto com `segmentAngles`, `segmentRadians`, `polarToCartesian`,
`slotOf`, `segmentCount` e `glowShape`. Esta unidade acrescenta duas exportações e três constantes
a `geometry.ts`, cria `blips.ts` ao lado, esvazia `BlipPoints.tsx` até a emissão do JSX e tira um
campo de `src/model.ts`.

Os imports seguem a ordenação do `prettier.config.js`: pacotes primeiro, depois um bloco separado
com os caminhos relativos, com os especificadores em ordem alfabética. A suíte roda na
infraestrutura Jest embutida no `react-scripts`, sem arquivo de configuração próprio, e o portão
de qualidade continua sendo `yarn ts:check`, `yarn lint` e `yarn test`.

## Decisões técnicas

Uma linha por veredito; contexto, alternativas e evidência em [`research.md`](./research.md).

- **`blipPosition`**: função pura em `src/components/Chart/geometry.ts`, com a assinatura
  `(slot: number, numSegments: number, ringIndex: number, config: ConfigData, placed: Point[], rand?: () => number) => Point`,
  onde `rand` tem `Math.random` como valor padrão e `placed` são os pontos já colocados no mesmo
  setor. A função não altera `placed` nem guarda estado entre chamadas.
- **Constantes do sorteio**: `RING_PADDING = 15`, `SECTOR_PADDING_ANGLE = 10` e
  `POSITION_ATTEMPTS = 150`, exportadas de `geometry.ts` ao lado de `DEG_TO_RAD`, para o teste ler
  os mesmos valores que o cálculo.
- **Distância mínima entre pontos**: `1.5 * config.chartConfig.blipSize`, derivada da
  configuração dentro de `blipPosition` — hoje 18 px. Um limiar fixo de 20 px deixa de garantir o
  afastamento quando `blipSize` passa de 20.
- **Faixa do anel em pixels**: `radiusToPixels(radius, config)` em `geometry.ts`, calculando
  `radius * config.chartConfig.size / (config.chartConfig.scale[1] - config.chartConfig.scale[0])`;
  a borda interna é `radiusToPixels` do anel anterior — 0 no primeiro — mais `RING_PADDING`, e a
  externa é `radiusToPixels` do próprio anel menos `RING_PADDING`.
- **Faixa angular**: `segmentAngles(slot, numSegments)` com `SECTOR_PADDING_ANGLE` descontado de
  cada ponta; `blipPosition` não escreve nenhuma repartição própria do círculo.
- **Sorteio**: `raio = inner + Math.sqrt(rand()) * (outer - inner)` e
  `ângulo = início + rand() * largura`, nesta ordem de consumo do gerador, convertidos em ponto por
  `polarToCartesian(config.chartConfig.size / 2, raio, ângulo)`. Nenhuma escala `d3` participa, e
  `yScale` em particular inverteria o eixo vertical.
- **Teto e aviso**: até `POSITION_ATTEMPTS` candidatos; o primeiro que ficar a `1.5 * blipSize` ou
  mais de todo ponto de `placed` é devolvido na hora. Esgotado o teto, um
  `console.warn` nomeando o slot e o índice do anel precede a devolução do último candidato.
- **`buildBlips`**: função pura em `src/components/Chart/blips.ts`, com a assinatura
  `(items: Item[], config: ConfigData, rand?: () => number) => Blip[]`, que descarta o item sem
  anel, sem quadrante ou com quadrante ausente de `quadrantsMap`, resolve cor, cor de texto e
  índice do anel, chama `blipPosition` e acumula o ponto devolvido.
- **Acumulador por setor**: objeto local com assinatura de índice `{ [slot: number]: Point[] }`,
  chaveado pelo slot de `slotOf(quadrantConfig)`; `tsconfig.json` tem `target` `es5` sem
  `downlevelIteration`, o que impede percorrer um `Map`.
- **Fonte de aleatoriedade**: `rand` atravessa `buildBlips` até `blipPosition` como um único
  parâmetro opcional; nenhuma das duas chama `Math.random` diretamente.
- **Tipo `Blip`**: `quadrantPosition` sai de `src/model.ts`; `ringPosition`, `colour`, `txtColour`
  e `coordinates` ficam. O slot de tela vive apenas como variável local de `buildBlips`.
- **`BlipPoints.tsx`**: perde as props `xScale` e `yScale` e o `import` de `d3`, e fica com
  `renderBlip`, a chamada a `buildBlips` e o `<g className="blips">`; `RadarChart.tsx` deixa de
  passar as duas escalas ao componente e continua construindo-as para `RingLabel` e
  `QuadrantRings`.
- **Remoções em `BlipPoints.tsx`**: `generateCoordinates`, `randomBetween`, `distanceBetween`, o
  vetor `[1, 4, 2, 3]`, a guarda contra as linhas centrais e o laço `do/while` saem juntos; a
  comparação de distância passa a viver em `geometry.ts`, dentro de `blipPosition`.
- **`arcPath`**: fica como está, com `xScale(radius) - xScale(0)`. A igualdade dessa expressão com
  `radiusToPixels` é exata para qualquer domínio linear e fica travada pelos quatro valores em
  pixels afirmados no teste.
- **`research.md`**: gerado, em [`research.md`](./research.md) — a distância mínima, a folga do
  anel, a densidade do acervo e a distribuição do raio são medições, e guardá-las fora do plano
  mantém o veredito legível.

## Modelo de dados

Nenhuma alteração de contrato de dados: `public/config.json`, `ConfigData` e `QuadrantConfig`
ficam como estão, e a unidade consome `quadrantsMap`, `rings` e `chartConfig`, que já existem. A
única alteração de tipo é a remoção de um campo do modelo de leitura `Blip`, registrada acima em
uma linha. `data-model.md` fica dispensado.

## Contratos externos

Nenhum. A aplicação não expõe nem consome API, e os arquivos de `public/` são lidos pelo próprio
navegador a partir do mesmo domínio. `contracts/` fica dispensado.

## Interface

Nenhuma tela muda de estrutura ou de comportamento: o diagrama continua com os mesmos pontos, nas
mesmas cores, com a mesma dica e o mesmo link. O que muda é a posição sorteada dentro do setor,
que já varia a cada carregamento. `ui/` fica dispensado.

## Estratégia de testes

A infraestrutura já existe e nada novo é introduzido: Jest e Testing Library vêm do
`react-scripts` 5, `src/setupTests.ts` é carregado automaticamente e a descoberta cobre qualquer
`*.test.tsx` sob `src/`. Os dois arquivos de teste desta unidade ficam ao lado do código, com
extensão `.tsx` e nomes de caso em inglês, conforme a skill `estrategia-de-testes`.

- **Unitário, `src/components/Chart/geometry.test.tsx`** — ganha um bloco de `blipPosition`, ao
  lado dos que já cobrem o módulo:
  - **Ponto dentro do setor e do anel** — para cada `N` em {3, 4, 5, 6}, cada slot de 1 a `N` e
    cada um dos quatro anéis, 200 posições sorteadas com `Math.random`. De cada ponto o teste
    recupera o ângulo por `((Math.atan2(x - centre, centre - y) / DEG_TO_RAD) + 360) % 360` e a
    distância por `Math.sqrt((x - centre)² + (y - centre)²)`, e afirma que o ângulo cai entre
    `startAngle + 10` e `endAngle - 10` e que a distância cai entre as duas bordas da faixa do
    anel. A configuração de cada `N` vem do auxiliar `configWithQuadrants` já presente no arquivo,
    que passa a devolver `rings` e `chartConfig.ringsAttributes` copiados do `public/config.json`
    do repositório — hoje ele devolve as duas listas vazias, e os casos de `glowShape` e
    `segmentAngles` que já o usam não leem nenhuma das duas.
  - **Trava de tela** — com o `public/config.json` do repositório, já importado pelo arquivo, 200
    posições por quadrante publicado: `methods-and-patterns` com `x` maior e `y` menor que o
    centro, `tools` com os dois maiores, `platforms-and-operations` com `x` menor e `y` maior, e
    `languages-and-frameworks` com os dois menores.
  - **Faixa do anel em pixels** — `radiusToPixels` devolve 200, 275, 350 e 400 para os quatro
    anéis publicados, e as faixas de sorteio resultantes são 15 a 185, 215 a 260, 290 a 335 e 365
    a 385.
  - **Coordenada finita** — para cada `N` de 1 a 6, cada slot e cada anel, `x` e `y` passam em
    `Number.isFinite`.
  - **Colisão e teto** — com `placed` contendo um ponto e um gerador que devolve sempre o mesmo
    valor, `console.warn` — espionado por `jest.spyOn` e restaurado ao fim — é chamado uma vez e o
    ponto devolvido é o candidato repetido. Com `placed` vazio e o mesmo gerador, nenhuma chamada
    a `console.warn`.
- **Unitário, `src/components/Chart/blips.test.tsx`** — novo arquivo:
  - **Contagem** — com `public/db1-opinion.json` e `public/config.json` lidos dos arquivos reais,
    `buildBlips` sobre `featuredOnly(items)` devolve 53 pontos.
  - **Descarte** — uma lista com um item sem anel, um sem quadrante e um com quadrante ausente de
    `quadrantsMap` devolve lista vazia, sem lançar.
  - **Coordenada resolvida** — nenhum ponto devolvido tem `x` ou `y` fora de `Number.isFinite`, e
    a cor de cada ponto é a do seu quadrante.
  - **Colisão por setor** — com um gerador que devolve sempre o mesmo valor, dois itens do mesmo
    quadrante e anel disparam um `console.warn`, e dois itens de quadrantes diferentes não
    disparam nenhum.
- **Componente** — não exigido e não possível. Um teste que renderize `BlipPoints` traz
  `query-string` pelo `Link` de cada ponto e falha com `SyntaxError` antes de rodar qualquer caso,
  pela mesma causa que derruba `Item.test.tsx` na base. Nenhum componente de página muda o que
  apresenta.
- **Conferência visual** — com `yarn start`, na página inicial: cada ponto dentro do seu quadrante
  e do seu anel, na cor do quadrante, nenhum encostando na divisória entre setores nem nos arcos,
  a dica aparecendo ao passar o mouse, o link levando à página do item e as três formas presentes.
  A posição exata muda a cada recarga, então a conferência é por quadrante e anel, repetida em
  algumas recargas, e não por comparação de captura de tela. A contagem dos elementos
  `.blips > a` no SVG, pelo inspetor do navegador, precisa dar 53.
- **Conferência com cinco quadrantes** — feita depois do commit da unidade, sobre a cópia local,
  em quatro passos: acrescentar um quinto quadrante a `quadrantsMap` em `public/config.json`
  (`position` 5, `order` 5, cor própria); acrescentar uma quinta entrada à lista
  `pageHelp.quadrants` nos três dicionários de `src/i18n/translations/`, porque `RadarGrid.tsx`
  percorre `quadrantsMap` e monta um bloco de rótulo por entrada, lendo a descrição por
  `position - 1`, o que derruba a página inicial inteira sem ela; mudar o `quadrant` de alguns
  itens de `public/db1-opinion.json` para o slug novo, que é o que `BlipPoints` procura em
  `quadrantsMap`; abrir a página inicial com `yarn start` e conferir que os pontos do quadrante
  novo caem no setor de 72° dele, na cor dele, sem ponto faltando. Os arquivos voltam ao estado
  versionado com `git restore` ao fim.
- **Portão de qualidade** — `yarn ts:check` e `yarn lint` terminam limpos e precisam continuar
  assim. A execução de `CI=true npx react-scripts test --watchAll=false` na base devolve 2
  arquivos em falha — `Item.test.tsx` e `date.test.tsx`, por transformação de ESM de
  `query-string` e de `moment` —, 2 passando e 58 casos verdes, dos quais 55 em
  `geometry.test.tsx`. A exigência é que `geometry.test.tsx` e `blips.test.tsx` passem inteiros e
  que nenhuma suíte que passava entre em falha.

## Impacto na documentação autoritativa

Esta unidade altera deliberadamente as regras de sorteio da posição dos pontos e o que decide o
setor de cada um, com a decisão registrada em
[`docs/adr/0001-geometria-configuravel-do-grafico.md`](../../../docs/adr/0001-geometria-configuravel-do-grafico.md),
que prevê a migração gradual de arcos, brilho, pontos e blocos de rótulo para `segmentAngles`.
Cada item abaixo vira tarefa de documentação na fase `tasks`, executada junto com o código.

- **`.agents/skills/visualizacao-do-radar/SKILL.md`** — a regra 3 passa a dizer que o ponto cai no
  setor apontado pelo slot de tela do quadrante, de 360° dividido pela quantidade de quadrantes
  declarada. A regra 4 descreve as quatro regras do sorteio no novo formato: ângulo sorteado
  dentro do setor com 10° livres junto a cada divisória; distância do centro sorteada na faixa do
  anel com 15 px livres junto a cada arco, pela raiz do valor sorteado; afastamento de 1,5 vez o
  tamanho do ponto apenas dos pontos já colocados no mesmo setor; teto de 150 tentativas, com
  aviso registrado no console e a última posição aceita ao esgotá-lo. A regra 11 passa a atribuir
  o corredor livre entre setores à margem angular do sorteio, sem citar as linhas centrais. A
  regra 16 registra que o diagrama inteiro — arcos, brilho e pontos — acompanha a quantidade de
  quadrantes declarada, e que o que resta preso a quatro posições são os blocos de rótulo nos
  cantos e as listas posicionais de descrição. No fluxo *Desenhar o radar*, o passo 4 acompanha as
  regras novas. Em *Acrescentar um anel ao desenho*, o passo 2 passa a exigir raios consecutivos
  afastados por mais de 30 px. Em *Restrições e validações*, a folga de sorteio é medida em pixels
  e a degradação por densidade alta cita o teto de 150 tentativas e o aviso no console.
- **`.agents/skills/taxonomia-de-quadrantes-e-aneis/SKILL.md`** — em *Restrições e validações*, a
  restrição que afirma que o número de quadrantes é quatro porque a geometria publicada assume
  posições 1 a 4 passa a dizer que o diagrama é desenhado a partir do slot de tela para qualquer
  quantidade declarada, e que o que ainda prende o radar a quatro quadrantes é o bloco de rótulo
  nos cantos com a sua lista posicional de descrições.
- **`.agents/skills/estrategia-de-testes/SKILL.md`** — a descrição do que vive em
  `src/components/Chart/geometry.ts` passa a incluir o sorteio da posição do ponto, e nomeia
  `src/components/Chart/blips.ts` como o módulo puro que monta a lista de pontos. O trecho que
  trata a aleatoriedade troca `generateCoordinates` e a fixação de `Math.random` por `jest.spyOn`
  pela injeção do gerador como parâmetro de `blipPosition` e de `buildBlips`. Em *Restrições e
  armadilhas conhecidas*, a armadilha sobre o vetor de deslocamento sai, e a armadilha sobre o
  alcance da suíte passa a registrar que `BlipPoints.tsx` continua fora dela pelo `query-string`
  que o `Link` de cada ponto traz, mesmo sem importar `d3`.
- **`.agents/maps/functional-map.md`** — na seção do domínio Visualização do Radar, a regra
  inferida sobre o sorteio passa a citar o teto de 150 tentativas e o afastamento por setor, sem
  as linhas de eixo; a regra sobre a repartição do círculo passa a dizer que arcos, brilho e
  pontos acompanham a quantidade de quadrantes declarada, restando os blocos de rótulo presos a
  quatro posições. A evidência de `BlipPoints.tsx` acompanha o novo papel do arquivo, e a
  dependência técnica que cita o andamento da reescrita nomeia também a branch
  `feat/us4-blip-positioner`.
- **`AGENTS.md`** — em *Restrições globais*, a restrição dos quatro quadrantes deixa de atribuir o
  limite ao desenho em `src/components/Chart` e passa a atribuí-lo aos blocos de rótulo em
  `src/components/RadarGrid`, às listas posicionais de descrição nos dicionários de tradução e à
  ausência de validação da configuração. A exigência de manter o desenho idêntico ao publicado com
  quatro quadrantes e o ponteiro para a ADR 0001 permanecem.
- **`.agents/skills/registros-de-decisao-arquitetural/SKILL.md`** — no gatilho *Geometria do
  gráfico*, a lista de arquivos de `src/components/Chart/` passa a incluir `blips.ts`, e a lista
  de branches da reescrita em andamento acompanha as unidades já entregues e esta.

Sem ADR nova: a ADR 0001 já decide que a repartição do círculo tem definição única em
`geometry.ts` e que pontos e blocos de rótulo migram para ela em unidades próprias; esta unidade
executa essa decisão, não a altera nem a substitui. Sem impacto em
`.agents/skills/catalogo-de-opinioes-tecnologicas/SKILL.md`: o acervo, os campos do item e as
regras de classificação ficam como estão, e a skill não descreve o tipo `Blip`. Sem impacto em
`.agents/skills/internacionalizacao-do-radar/SKILL.md`, em `CONTRIBUTING.md` e em `.env`: nenhuma
chave de tradução, nenhum passo do processo editorial e nenhuma variável de build mudam.
