# Research: brilho de fundo por máscara compartilhada

Decisões técnicas da unidade descrita em [`spec.md`](./spec.md), com a evidência que fecha cada
uma.

## Raio dos vértices do setor

**Contexto.** O brilho de três ou mais quadrantes é um triângulo com um vértice no centro do
diagrama e os outros dois nas pontas do setor. O desenho visível é esse triângulo recortado pelo
círculo do radar, e a corda que liga as duas pontas é o que decide se o recorte cobre o arco
inteiro.

**Alternativas:**

- **Vértices no raio do círculo (`size / 2`)** — o triângulo fica inscrito no círculo e a corda
  passa por dentro dele.
- **Vértices no lado do diagrama (`size`)** — o triângulo transborda o círculo e a corda passa por
  fora ou tangencia.

**Decisão:** raio igual a `config.chartConfig.size`, o dobro do raio do círculo.

**Evidência:** a corda de um setor de 360°/N com vértices no raio `R` fica a `R·cos(180°/N)` do
centro. Com `size` igual a 800 e o círculo de raio 400, a distância medida da corda ao centro, para
cada slot de cada quantidade:

| N | Vértices em `size` | Vértices em `size / 2` | Falta até a borda com `size / 2` |
| --- | --- | --- | --- |
| 3 | 400,0000 px | 200,0000 px | 200,0000 px |
| 4 | 565,6854 px | 282,8427 px | 117,1573 px |
| 5 | 647,2136 px | 323,6068 px | 76,3932 px |
| 6 | 692,8203 px | 346,4102 px | 53,5898 px |

Com os vértices no raio do círculo sobra uma faixa sem cor junto à borda em qualquer quantidade de
quadrantes, e ela é maior justamente onde há menos quadrantes. Com os vértices no lado do diagrama
a corda nunca entra no círculo; três quadrantes é o caso apertado, em que ela tangencia o círculo
exatamente — 400,0000 px, sem folga.

**Consequências:** o polígono tem área fora do `viewBox`, descartada pelo recorte de `radar-mask`.
O teste de cobertura afirma que a distância da corda ao centro é maior ou igual ao raio do círculo,
com igualdade exata em três quadrantes.

## Onde vive a forma do brilho

**Contexto.** Os critérios de aceite exigem teste automatizado sobre a forma produzida para uma,
duas e três ou mais fatias, e sobre o quadrante de tela em que caem os vértices com os quatro
quadrantes publicados.

**Alternativas:**

- **Montar a forma dentro do JSX de `QuadrantRings.tsx`** — menos indireção, e nenhuma das três
  formas fica coberta por teste.
- **Função pura em `geometry.ts` devolvendo a descrição da forma, renderizada pelo componente** —
  uma indireção a mais e as três formas cobertas por teste.

**Decisão:** `glowShape(slot, numSegments, size)` em `src/components/Chart/geometry.ts`, devolvendo
uma união discriminada por `kind` — `circle`, `rect` ou `polygon` —; `QuadrantRings.tsx` traduz
essa descrição no elemento SVG correspondente.

**Evidência:** `geometry.ts` não importa `d3`, e a suíte do módulo roda —
`CI=true npx react-scripts test --watchAll=false --testPathPattern geometry` devolve 37 testes
passando em 1 arquivo. Um arquivo de teste que alcance `QuadrantRings.tsx` traz o `d3` 7.8.0, que é
ESM, e `node_modules/react-scripts/scripts/utils/createJestConfig.js` fixa
`transformIgnorePatterns` em `[/\\]node_modules[/\\].+\.(js|jsx|mjs|cjs|ts|tsx)$`, de modo que nada
sob `node_modules` é transformado: o arquivo falha com `SyntaxError: Unexpected token 'export'`
antes de rodar qualquer caso. Dentro do componente, portanto, a forma não é afirmável por teste.

**Consequências:** `geometry.ts` ganha a união `GlowShape` e a função que a produz, ambas
exportadas. O que resta no componente é a tradução de cada `kind` em elemento SVG, conferida pela
comparação visual do pull request.

## Centro do diagrama em pixels

**Contexto.** As três formas e as duas máscaras precisam do centro do diagrama em pixels de tela.
`RadarChart.tsx` tem duas escalas `d3` à mão, e `QuadrantRings.tsx` já calcula `size / 2` para
transladar os arcos.

**Alternativas:**

- **`xScale(0)`** — usa a escala já construída.
- **`config.chartConfig.size / 2`** — aritmética direta sobre a configuração.

**Decisão:** `config.chartConfig.size / 2`, em `geometry.ts` e nos dois componentes.

**Evidência:** as duas expressões coincidem apenas porque `scale` é simétrica —
`public/config.json` declara `[-16, 16]` —; uma escala assimétrica separaria as duas. Mais
decisivo, `yScale` tem imagem `[size, 0]` (`src/components/Chart/RadarChart.tsx`, linhas 62 a 65) e
inverte o eixo vertical: qualquer coordenada vertical tirada dele espelha o brilho sobre a linha
horizontal. `size / 2` mantém `geometry.ts` livre de `d3` e com o eixo vertical crescendo para
baixo, que é a convenção do SVG.

**Consequências:** `polarToCartesian` recebe o centro como número e devolve pixels de tela. Nenhuma
escala `d3` participa do cálculo do brilho.

## Região das duas máscaras

**Contexto.** Um `<mask>` tem uma região de recorte fora da qual o conteúdo da máscara não é
aplicado, e o elemento mascarado some. O padrão do atributo `maskUnits` é `objectBoundingBox`, com
a região valendo a caixa delimitadora do elemento mascarado acrescida de 10% para cada lado.

**Alternativas:**

- **Padrão (`objectBoundingBox`)** — a região muda a cada forma mascarada: a caixa de um polígono
  com vértices ao dobro do raio do círculo é diferente da do círculo de uma fatia única e da do
  retângulo de meia largura.
- **`userSpaceOnUse` fixada no quadrado do diagrama** — a mesma região para todas as formas.

**Decisão:** `maskUnits="userSpaceOnUse"` com `x` 0, `y` 0, `width` e `height` iguais a
`config.chartConfig.size`, nas duas máscaras.

**Evidência:** o círculo branco de `radar-mask` e o círculo com degradê de `glow-mask` têm centro
`(size/2, size/2)` e raio `size/2`, e portanto estão inscritos no quadrado `[0, size]²`: a região
fixa não corta nada do que as máscaras precisam pintar. `maskContentUnits` fica no padrão
`userSpaceOnUse`, que é o que faz o círculo da máscara ser lido nas mesmas coordenadas das formas
que ela recorta.

**Consequências:** a região de recorte deixa de depender da forma mascarada, e acrescentar uma
quinta ou sexta fatia não muda o que as máscaras cobrem.

## Equivalência do degradê com o publicado

**Contexto.** O critério de aceite exige que o brilho dos quatro quadrantes publicados permaneça
visualmente idêntico, com tolerância de um pixel no canto superior esquerdo.

**Decisão:** máscara de luminância com parada inicial branca de opacidade 0,5 e parada final branca
de opacidade 0, aplicada sobre a forma pintada na cor cheia do quadrante.

**Evidência:** hoje (`src/components/Chart/QuadrantRings.tsx`, linhas 36 a 72) o `<rect>` é um
quadrado de 400 px por 400 px e o `radialGradient` que o pinta não declara `gradientUnits`, ficando
no padrão `objectBoundingBox`: `cx` e `cy` em 0 ou 1 apontam o canto do retângulo que toca o centro
do radar e `r` igual a 1 vale 400 px, por a caixa ser quadrada. O degradê vai da cor com alfa 1 no
centro do radar até alfa 0 a 400 px dele, e o `<rect>` inteiro leva `opacity: 0.5` — o resultado é
alfa 0,5 no centro caindo linearmente até 0 no raio 400, e nada fora desse círculo. Uma máscara de
luminância multiplica a cobertura do elemento pela luminância vezes a opacidade de cada ponto da
máscara: branco com `stopOpacity` 0,5 dá 0,5 e branco com `stopOpacity` 0 dá 0, sobre a mesma
geometria de círculo. As duas composições produzem a mesma rampa.

**Consequências:** a forma do quadrante não leva atributo de opacidade: a meia opacidade vem
exclusivamente da parada inicial da máscara. O `radialGradient` de `glow-mask` fica sem atributos
de posição, porque o padrão `objectBoundingBox` — `cx`, `cy` e `r` em 0,5 — já descreve o círculo
inscrito na caixa do elemento que ele pinta.

## Identificadores fixos no SVG

**Contexto.** As duas máscaras e o degradê são referenciados por `url(#...)`, o que exige
identificador único no documento.

**Decisão:** identificadores fixos `radar-mask`, `glow-mask` e `glow-gradient`, declarados uma vez
em `<defs>` no `<svg>` de `RadarChart.tsx`.

**Evidência:** `RadarChart` é renderizado em um único lugar — `src/components/RadarGrid/RadarGrid.tsx`,
linha 73 —, e `RadarGrid` em outro único lugar, `src/components/PageIndex/PageIndex.tsx`, linha 47,
sob a condição `showChart`. A busca por `RadarChart` e por `RadarGrid` sob `src/` não devolve
nenhum outro ponto de renderização. Duas instâncias simultâneas do gráfico não existem.

**Consequências:** o degradê e as máscaras deixam de ser por quadrante, e a quantidade de nós de
definição no SVG passa a ser constante.

## Suporte dos atributos de máscara no React e no TypeScript

**Contexto.** O JSX precisa emitir `<mask>`, `<polygon>` e os atributos `mask`, `maskUnits` e
`points`, com `tsc` em modo `strict`.

**Decisão:** escrever os elementos e atributos diretamente em JSX, sem `dangerouslySetInnerHTML`
nem criação manual de nó.

**Evidência:** `node_modules/@types/react/index.d.ts` declara `mask`, `polygon`, `circle`, `rect` e
`defs` em `JSX.IntrinsicElements` (linhas 3271 a 3316) e `mask`, `maskContentUnits`, `maskUnits` e
`points` em `SVGAttributes` (linhas 2651 a 2675). `node_modules/react-dom/cjs/react-dom.development.js`,
linhas 3296 a 3298, mapeia os nomes `mask`, `maskcontentunits` e `maskunits` para a forma do DOM.
`radialGradient` e `stop` já são emitidos pelo componente vigente.

**Consequências:** nenhuma dependência nova e nenhum escape de tipagem.

## Precisão das afirmações sobre coordenada

**Contexto.** A trava de tela compara as pontas do setor com o centro do diagrama, e a aritmética de
ponto flutuante não devolve o valor redondo.

**Decisão:** comparar coordenada com `toBeCloseTo`, nunca com `toBe`.

**Evidência:** com `size` 800 e os quatro quadrantes publicados, as pontas calculadas são
`x` 400,00000000000006 em 0°, `y` 400,0000000000001 em 270° e `x` 399,99999999999983 em 360° — o
centro é 400 em todos os três casos. A trava já existente sobre `segmentRadians` usa `toBeCloseTo`
com precisão 10 pelo mesmo motivo (`src/components/Chart/geometry.test.tsx`, linhas 209 a 219).

**Consequências:** as comparações de igualdade com o centro usam `toBeCloseTo`; as de lado do eixo
— maior que o centro, menor que o centro — usam a diferença, que é de 800 px e não sofre com a
precisão.
