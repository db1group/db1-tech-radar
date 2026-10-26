# Plan: arcos dos anéis pela geometria dinâmica

Visão técnica da unidade descrita em [`spec.md`](./spec.md).

## Stack e estrutura

A unidade trabalha dentro da SPA em React 18 com Create React App e TypeScript em modo `strict`,
sem acrescentar nem remover dependência. O desenho do radar vive em `src/components/Chart/`, com
um arquivo por peça: `RadarChart.tsx` compõe o SVG, `QuadrantRings.tsx` desenha o setor de cada
quadrante, `BlipPoints.tsx` posiciona os pontos e `geometry.ts` guarda a convenção angular, em
graus, 0° = 12 horas, sentido horário. Esta unidade acrescenta uma exportação a `geometry.ts`,
reescreve a entrada angular de `QuadrantRings.tsx` e troca uma variável de build em `.env`.

Os imports seguem a ordenação do `prettier.config.js`: pacotes primeiro, depois um bloco separado
com os caminhos relativos, com os especificadores em ordem alfabética — em `QuadrantRings.tsx`,
`./geometry` entra depois de `../../model`. A suíte roda na infraestrutura Jest embutida no
`react-scripts`, sem arquivo de configuração próprio, e o portão de qualidade continua sendo
`yarn ts:check`, `yarn lint` e `yarn test`.

## Decisões técnicas

Uma linha por veredito; contexto, alternativas e evidência em [`research.md`](./research.md).

- **Conversão para radianos**: `segmentRadians(slot, numSegments)` em
  `src/components/Chart/geometry.ts`, função pura que aplica `DEG_TO_RAD` sobre `segmentAngles` e
  devolve `{ startAngle, endAngle }` — o formato que o gerador de arcos recebe.
- **Convenção angular**: os radianos vão direto ao `d3.arc`, sem remapeamento, porque o gerador
  mede a partir do topo do círculo no sentido horário.
- **`arcPath`**: recebe `(slot, numSegments, ringPosition, xScale, config)` e tira os dois ângulos
  de `segmentRadians`; o bloco do `d3.arc` — `innerRadius`, `outerRadius` e o raio por anel vindos
  de `ringsAttributes` e da escala — fica como está.
- **`arcPath` sem exportação**: a função permanece de módulo, e a cobertura automática da sua
  entrada angular é a de `segmentRadians`, porque um arquivo de teste que alcance o `d3` não roda
  neste projeto.
- **Origem do slot**: `QuadrantRings` calcula `slotOf(quadrant)` e `segmentCount(config)` a partir
  das propriedades que já recebe; `RadarChart.tsx` fica intocado.
- **Tabela `arcAngel`**: apagada de `QuadrantRings.tsx`, sem substituta no componente — a
  repartição do círculo existe em um lugar só, `geometry.ts`.
- **Identificador de build**: `.env` passa a declarar `REACT_APP_BUILDHASH = "1.2"`, para que o
  `config.json` com `order` chegue a quem já visitou o site.
- **`research.md`**: gerado, em [`research.md`](./research.md) — a equivalência dos caminhos, o
  alcance do `d3` pela suíte e os pontos do desenho presos a quatro quadrantes são medições, e
  guardá-las fora do plano mantém o veredito legível.

## Modelo de dados

Nenhuma alteração de contrato: `order` já existe em `QuadrantConfig` e nas quatro entradas de
`quadrantsMap` em `public/config.json`, e esta unidade apenas passa a consumi-lo. `data-model.md`
fica dispensado.

## Contratos externos

Nenhum. A aplicação não expõe nem consome API, e os arquivos de `public/` são lidos pelo próprio
navegador a partir do mesmo domínio. `contracts/` fica dispensado.

## Interface

Nenhuma tela muda de aparência ou de comportamento: o critério de aceite da unidade é a
equivalência visual com o radar publicado. `ui/` fica dispensado.

## Estratégia de testes

A infraestrutura já existe e nada novo é introduzido: Jest e Testing Library vêm do
`react-scripts` 5, `src/setupTests.ts` é carregado automaticamente e a descoberta cobre qualquer
`*.test.tsx` sob `src/`.

- **Unitário** — `src/components/Chart/geometry.test.tsx` ganha a cobertura de `segmentRadians`,
  ao lado das demais exportações do módulo sob teste. A trava de equivalência lê o
  `public/config.json` do repositório, já importado pelo arquivo, e compara o par de radianos de
  cada quadrante com o par vigente no radar publicado, por `toBeCloseTo` com precisão 10. Para
  `N` em {3, 5, 6} a afirmação é de invariante: os dois ângulos finitos, o final maior que o
  inicial e os `N` setores somando 2π.
- **Componente** — não exigido e não possível: um teste que renderize `QuadrantRings` importa o
  `d3` e falha antes de rodar qualquer caso.
- **Equivalência visual** — conferência manual, em duas partes. Os dezesseis caminhos são
  comparados por texto, lendo `document.querySelectorAll(".quadrant-ring path")` e mapeando o
  atributo `d` antes e depois da alteração; a comparação é de igualdade exata. A página inicial é
  comparada por captura de tela com `techradar.db1.com.br`.
- **Conferência com cinco quadrantes** — feita depois do commit da unidade, sobre a cópia local,
  em quatro passos: acrescentar um quinto quadrante a `quadrantsMap` em `public/config.json`
  (`position` 5, `order` 5, cor própria), sem declará-lo no mapa `quadrants`; acrescentar uma
  quinta entrada à lista `pageHelp.quadrants` nos três dicionários de
  `src/i18n/translations/`; remover de `QuadrantRings.tsx` o bloco de brilho de fundo — a
  constante `gradientAttributes`, o `gradientId`, o `<defs>` e o `<rect>`; abrir a página inicial
  com `yarn start` e conferir os cinco setores de 72°. Os quatro arquivos voltam ao estado
  versionado com `git restore` ao fim.
- **Portão de qualidade** — `yarn ts:check` e `yarn lint` terminam limpos e precisam continuar
  assim. `yarn test` já tem `Item.test.tsx` e `date.test.tsx` falhando por transformação de ESM de
  `query-string` e de `moment`; a exigência é que `geometry.test.tsx` passe inteiro e que nenhuma
  suíte que passava entre em falha.

## Impacto na documentação autoritativa

Esta unidade altera deliberadamente o que decide o setor de cada arco e o que a suíte consegue
alcançar. Cada item abaixo vira tarefa de documentação na fase `tasks`, executada junto com o
código.

- **`.agents/skills/visualizacao-do-radar/SKILL.md`** — a seção *Setor de cada quadrante* passa a
  dizer que o setor é a fatia apontada pelo slot de tela do quadrante, com a tabela relacionando
  slot e faixa angular e a nota de que a numeração exibida percorre o círculo em outra ordem. A
  regra 16 registra que os arcos dos anéis acompanham a quantidade de quadrantes declarada,
  enquanto o brilho de fundo, os pontos e os blocos de rótulo seguem presos a quatro posições.
- **`.agents/skills/estrategia-de-testes/SKILL.md`** — a orientação de exportar e cobrir por
  unidade as funções de geometria do gráfico passa a dizer que módulo que importa o `d3` não é
  alcançável pela suíte, porque o `d3` 7.8.0 é ESM e o transform do `react-scripts` não entra em
  `node_modules`; a lógica angular do desenho é coberta por `src/components/Chart/geometry.ts`. A
  armadilha sobre quadrantes fixos nomeia o vetor de deslocamento de `BlipPoints.tsx` como a
  tabela indexada por posição que resta.
- **`.agents/skills/registros-de-decisao-arquitetural/SKILL.md`** — o gatilho "Geometria do
  gráfico" lista como arquivos de `src/components/Chart/` que compõem o desenho `RadarChart.tsx`,
  `BlipPoints.tsx`, `QuadrantRings.tsx` e `geometry.ts`.
- **`.agents/maps/functional-map.md`** — na seção do domínio Visualização do Radar, a evidência no
  código aponta `RadarChart.tsx` como escalas e composição do SVG, traz `geometry.ts` como a
  convenção angular única do desenho e reúne `QuadrantRings.tsx` e `BlipShapes.tsx` como os arcos
  e as três formas de ponto.

Sem impacto em `.agents/skills/taxonomia-de-quadrantes-e-aneis/SKILL.md`: o slot de tela, a sua
relação com a posição exibida e a exigência de slots contíguos de 1 a N já estão descritos, e esta
unidade apenas os consome. Sem impacto em
`.agents/skills/publicacao-e-distribuicao-do-radar/SKILL.md`: a troca do identificador de build na
publicação que leva dado novo ao ar é a regra 6 da própria skill.
