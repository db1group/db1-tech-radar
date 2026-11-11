# Research: posicionamento dos pontos pela geometria compartilhada

Decisões técnicas da unidade descrita em [`spec.md`](./spec.md), com a evidência que fecha cada
uma.

## Distância mínima entre pontos do mesmo setor

**Contexto.** O sorteio rejeita a posição que caia perto demais de um ponto já colocado no mesmo
setor. A referência da `v5` de `AOEpeople/aoe_technology_radar` usa 20 px fixos; a regra em vigor
neste repositório é `blipSize + blipSize / 2` (`src/components/Chart/BlipPoints.tsx`, linhas 118 a
122), hoje 18 px.

**Alternativas:**

- **20 px fixos** — o número da referência portada, igual em qualquer configuração.
- **1,5 × `config.chartConfig.blipSize`** — a regra em vigor, proporcional ao tamanho do ponto.

**Decisão:** `1.5 * config.chartConfig.blipSize`.

**Evidência:** `blipSize` é chave de configuração (`public/config.json`, `chartConfig.blipSize`,
hoje 12) e é o diâmetro desenhado do ponto — `DefaultBlip` emite `<circle r={blipSize / 2}>` e as
outras duas formas usam `blipSize` como lado (`src/components/Chart/BlipShapes.tsx`, linhas 26, 27
e 59). Dois pontos se tocam quando a distância entre os centros fica abaixo de `blipSize`. Um
limiar fixo de 20 px deixa de garantir o afastamento assim que `blipSize` passa de 20: com
`blipSize` 24 os pontos chegam a se sobrepor em 4 px sem que o sorteio rejeite a posição. A regra
proporcional mantém meio diâmetro de folga em qualquer valor configurado, e preserva o
espaçamento do radar publicado, que é o que os 18 px produzem hoje.

**Consequências:** a constante numérica 20 da referência não entra no código; o limiar é derivado
da configuração dentro de `blipPosition`. Os dois pontos da unidade em que a referência e o
repositório divergem — este e a folga do anel — ficam resolvidos em sentidos opostos e por motivos
próprios, registrados cada um na sua seção.

## Teto de tentativas e a densidade real do acervo

**Contexto.** O sorteio tem teto de 150 tentativas e, ao esgotá-lo, aceita a última posição ainda
que sobreposta, com aviso. Vale saber se o acervo publicado chega perto desse teto.

**Decisão:** teto de 150 tentativas, sem mecanismo de alívio — nem redução do limiar, nem segunda
passada reposicionando pontos já colocados.

**Evidência:** o sorteio é uniforme por área dentro da faixa angular útil, de modo que a chance de
uma tentativa falhar é, no máximo, a fração da área da célula coberta pelos discos de exclusão de
raio 18 px ao redor dos pontos já colocados. Contagem do acervo em `public/db1-opinion.json`
cruzada com `public/config.json` — 53 itens, todos em destaque, todos com anel e quadrante
válidos —, com a célula mais cheia tendo 12 pontos:

| Célula | Pontos | Área da faixa | Área excluída | Chance de falha por tentativa | Chance de esgotar 150 |
| --- | --- | --- | --- | --- | --- |
| `languages-and-frameworks`/`adopt` | 12 | 20 769 px² | 11 197 px² | 0,539 | 5,6 × 10⁻⁴¹ |
| `methods-and-patterns`/`adopt` | 11 | 20 769 px² | 10 179 px² | 0,490 | 3,5 × 10⁻⁴⁷ |
| `platforms-and-operations`/`adopt` | 9 | 20 769 px² | 8 143 px² | 0,392 | 1,0 × 10⁻⁶¹ |
| `tools`/`assess` | 6 | 17 181 px² | 5 089 px² | 0,296 | 5,6 × 10⁻⁸⁰ |

A estimativa é conservadora: ela soma os discos de exclusão como se não se sobrepusessem entre si
nem transbordassem a faixa. Mesmo assim o aviso de esgotamento não acontece com o acervo atual, e
só passa a ser plausível com uma célula várias vezes mais cheia.

**Consequências:** o `console.warn` é caminho de exceção, não ruído de operação. Com o acervo de
hoje o teste que o exercita precisa forçar a colisão por um gerador injetado — o acervo real não a
produz.

## Folga nas bordas da faixa do anel

**Contexto.** A folga separa o ponto dos dois arcos que delimitam o seu anel. Hoje ela é de 0,7
unidade de coordenada, ou 17,5 px (`src/components/Chart/BlipPoints.tsx`, linha 26); a referência
portada usa 15 px.

**Decisão:** 15 px, constante em pixels de tela.

**Evidência:** o arco de um anel é desenhado para dentro a partir do raio do anel, com espessura
`arcWidth` em pixels (`src/components/Chart/QuadrantRings.tsx`, linhas 56 a 67). Com o
`public/config.json` do repositório, a folga de 15 px produz:

| Anel | Raio em px | Borda interna do arco | Faixa de sorteio | Folga até o arco do próprio anel | Folga até o arco do anel anterior |
| --- | --- | --- | --- | --- | --- |
| `adopt` | 200 | 194 | 15 a 185 | 9,0 px | 15,0 px |
| `trial` | 275 | 271 | 215 a 260 | 11,0 px | 15,0 px |
| `assess` | 350 | 348 | 290 a 335 | 13,0 px | 15,0 px |
| `hold` | 400 | 398 | 365 a 385 | 13,0 px | 15,0 px |

Nenhum ponto encosta em arco algum, e a folga até o arco do próprio anel é maior que o raio do
ponto (6 px) nos quatro anéis. A folga em pixels também é a única que se mede na mesma unidade do
que precisa evitar: `arcWidth` e o tamanho do ponto são pixels, enquanto `radius` é unidade de
coordenada, e a conversão entre as duas depende de `scale` e de `size`.

**Consequências:** o parâmetro da folga deixa de depender da escala de coordenadas. A exigência de
que a faixa comporte o sorteio passa a ser "raios consecutivos afastados por mais de 30 px",
verificada pela revisão humana enquanto a validação de configuração não existir.

## Raio do anel em pixels sem o `d3`

**Contexto.** `blipPosition` precisa do raio de cada anel em pixels de tela e não pode importar
`d3`. Os arcos tiram esse mesmo número de `xScale(radius) - xScale(0)`
(`src/components/Chart/QuadrantRings.tsx`, linha 57), e os dois precisam concordar, senão o ponto
cai fora do arco que deveria contê-lo.

**Decisão:** `radiusToPixels(radius, config)` em `src/components/Chart/geometry.ts`, calculando
`radius * size / (scale[1] - scale[0])`. `arcPath` fica como está, e a concordância entre as duas
expressões é travada por teste.

**Evidência:** a igualdade é exata, não aproximada. `node_modules/d3-scale/src/continuous.js`
monta a escala por `bimap`, que compõe `normalize(d0, d1)(x) = (x - d0) / (d1 - d0)` com
`interpolateNumber(r0, r1)(t) = r0 + t * (r1 - r0)`; o recorte por `clamp` só entra quando
`.clamp(true)` é chamado, e a inicialização é `clamp = identity` (linha 72). Logo
`xScale(r) - xScale(0) = r * (r1 - r0) / (d1 - d0)`, que é a expressão adotada, para qualquer
domínio linear — inclusive assimétrico. Com o `public/config.json` do repositório os dois caminhos
dão 200, 275, 350 e 400 px, os quatro valores que o teste fixa.

**Consequências:** `geometry.ts` ganha uma conversão de raio, ao lado da conversão angular que já
tem, e segue sem importar `d3`. A duplicação da expressão com `arcPath` é deliberada — reescrever
`arcPath` está fora da fronteira desta unidade — e fica coberta pelos quatro valores travados no
teste.

## Distribuição do raio pela raiz quadrada

**Contexto.** O sorteio da distância ao centro usa `inner + Math.sqrt(rand()) * (outer - inner)`,
como na referência portada. Hoje o sorteio é linear entre as duas bordas.

**Decisão:** manter a raiz quadrada, conforme a referência.

**Evidência:** a densidade de pontos por unidade de área vale `1 / r` no sorteio linear e
`(r - inner) / r` com a raiz. Medida nas quatro faixas do `public/config.json`:

| Anel | Faixa | Linear: densidade na borda interna ÷ na externa | Raiz: densidade na borda externa ÷ no meio |
| --- | --- | --- | --- |
| `adopt` | 15 a 185 | 12,33 | 1,08 |
| `trial` | 215 a 260 | 1,21 | 1,83 |
| `assess` | 290 a 335 | 1,16 | 1,87 |
| `hold` | 365 a 385 | 1,05 | 1,95 |

O acúmulo que se vê no radar está no anel interno, o mais largo e o mais cheio — 38 dos 53 itens
estão em `adopt` —, e é ali que o sorteio linear concentra doze vezes mais pontos junto à borda
interna do que junto à externa. A raiz desfaz justamente esse caso: com a borda interna quase no
centro, ela é uniforme por área. Nos três anéis externos, estreitos e com poucos itens, ela
inclina os pontos para fora, cerca de duas vezes mais densos na borda externa que no meio da
faixa.

**Consequências:** a frase "distribui por área" vale exatamente para o anel interno; nos demais a
raiz troca um desvio pequeno para dentro por um desvio para fora de tamanho parecido, sobre faixas
de 20 a 45 px, onde a diferença não é legível no desenho. Uma distribuição uniforme por área em
qualquer anel exigiria `Math.sqrt(inner² + rand() * (outer² - inner²))`, que não é a fórmula da
referência e não entra nesta unidade.

## Destino do campo de posição no tipo `Blip`

**Contexto.** `Blip` declara `quadrantPosition: number` (`src/model.ts`, linha 43). A unidade
remove o cálculo que o consome.

**Alternativas:**

- **Passar a guardar o slot de tela** — mantém um campo de posicionamento no modelo de leitura.
- **Remover o campo** — o modelo de leitura guarda só o que alguém lê.

**Decisão:** remover `quadrantPosition` de `Blip`. `ringPosition` permanece.

**Evidência:** a busca por `quadrantPosition` sob `src/` devolve três ocorrências — a declaração
em `src/model.ts`, linha 43; a escrita em `src/components/Chart/BlipPoints.tsx`, linha 99; e a
única leitura, na indexação do vetor de deslocamento em `BlipPoints.tsx`, linha 39. Removido o
vetor, nada lê o campo, e mantê-lo com o slot criaria um dado que só é escrito. `ringPosition` tem
situação diferente: ele é o índice do anel resolvido a partir da taxonomia, continua sendo o
parâmetro que `blipPosition` consome durante a montagem e permanece no tipo. A ocorrência de
`ringPosition` em `src/components/Chart/QuadrantRings.tsx`, linha 51, é um parâmetro local
homônimo de `arcPath`, sem relação com o tipo.

**Consequências:** o slot de tela vive apenas como variável local de `buildBlips`, calculado por
`slotOf(quadrantConfig)` e usado como chave do acumulador por setor.

## Onde vive a montagem da lista de pontos

**Contexto.** O critério de aceite exige afirmar que todo item com anel e quadrante válidos vira
ponto — a contagem que pega o ponto perdido por coordenada inválida.

**Alternativas:**

- **Teste de componente sobre `BlipPoints`** — conta os elementos renderizados, como a skill de
  testes pede para tela alterada.
- **Função pura `buildBlips`, com o componente apenas mapeando o resultado em JSX** — a contagem é
  afirmada sobre o valor de retorno.

**Decisão:** `buildBlips(items, config, rand?)` em `src/components/Chart/blips.ts`, com
`BlipPoints.tsx` reduzido a chamar essa função e mapear o resultado.

**Evidência:** renderizar `BlipPoints` é impossível na suíte deste projeto. Cada ponto é
embrulhado por `Link`, que importa `use-search-param-state`, que importa `query-string`. A
execução de `CI=true npx react-scripts test --watchAll=false` devolve, em `Item.test.tsx`,
`SyntaxError: Cannot use import statement outside a module` apontando
`node_modules/query-string/index.js:1`, com a pilha
`src/hooks/use-search-param-state.tsx:3` → `src/components/Link/Link.tsx:4` →
`src/components/Item/Item.tsx:6`. A causa é a mesma do `d3`: `transformIgnorePatterns` do
`react-scripts` não transforma nada sob `node_modules`. O estado atual da suíte é 2 arquivos em
falha — `Item.test.tsx` e `date.test.tsx` —, 2 passando e 58 casos verdes, dos quais 55 em
`geometry.test.tsx`.

**Consequências:** a contagem e o descarte de item inválido são afirmados sobre `buildBlips`; a
contagem dos elementos `.blips > a` no SVG fica como conferência manual. `blips.ts` não importa
`d3`, `react-router-dom` nem React.

## Acumulador de pontos por setor

**Contexto.** A colisão passa a ser avaliada apenas contra os pontos já colocados no mesmo setor,
o que exige acumular as posições por slot durante a montagem.

**Alternativas:**

- **`Map<number, Point[]>`** — a estrutura natural para a chave numérica.
- **Objeto com assinatura de índice `{ [slot: number]: Point[] }`** — o padrão já usado no modelo.

**Decisão:** objeto com assinatura de índice, chaveado pelo slot de tela.

**Evidência:** `tsconfig.json` declara `target: "es5"` e não declara `downlevelIteration`;
percorrer um `Map` com `for...of` nessa configuração é erro de compilação. Os agrupamentos do
projeto já usam assinatura de índice — `Group` e `Quadrant` em `src/model.ts`, linhas 56 a 75 — e
o acesso por chave não precisa de iteração.

**Consequências:** o acumulador é local a `buildBlips` e some ao fim da montagem; `blipPosition`
recebe a lista do setor já pronta e não a altera.

## As escalas `d3` nas props de `BlipPoints`

**Contexto.** `BlipPoints` recebe `xScale` e `yScale` e importa o tipo `ScaleLinear` de `d3`
(`src/components/Chart/BlipPoints.tsx`, linhas 1, 83 e 84). As duas escalas só alimentam
`generateCoordinates` e a guarda contra as linhas centrais.

**Decisão:** as duas props saem de `BlipPoints`, junto com o `import` de `d3`;
`RadarChart.tsx` deixa de passá-las ao componente.

**Evidência:** a varredura das ocorrências de `xScale` e `yScale` em `BlipPoints.tsx` — linhas 16,
17, 42, 43, 110, 125 e 126 — mostra que todas estão dentro do código que a unidade remove.
`RadarChart.tsx` continua construindo as duas escalas, porque `RingLabel` usa as duas (linhas 34,
35, 43 e 44) e `QuadrantRings` usa `xScale` (linha 94).

**Consequências:** `BlipPoints.tsx` fica sem dependência de `d3`. Isso não o torna alcançável pela
suíte: o `Link` de cada ponto continua trazendo `query-string`, conforme a seção anterior.

## Identificador de build e o cache do navegador

**Contexto.** A ADR 0001 registra que a unidade que fizer `order` governar o desenho precisa
trocar `REACT_APP_BUILDHASH`, senão quem já visitou o site continua lendo um `public/config.json`
em cache, sem a chave.

**Decisão:** `.env` fica como está.

**Evidência:** `REACT_APP_BUILDHASH` está em `"1.2"` e foi alterado no commit `c085977`
(`feat(chart): derive ring arcs from the shared geometry (US2)`), que é exatamente a unidade em
que `order` passou a governar o desenho. Esta unidade não acrescenta nem altera chave de
`public/config.json`: `git log` sobre o arquivo mostra a última alteração em `26e9d75` (US1), e a
unidade consome apenas `quadrantsMap`, `rings` e `chartConfig`, que já estão publicados.

**Consequências:** nenhuma alteração em `.env` e nenhuma tarefa de invalidação de cache.

## Conferência do ângulo no teste

**Contexto.** O teste precisa recuperar, de um ponto em pixels de tela, o ângulo na convenção do
desenho — 0° às 12 horas, crescendo no sentido horário — para afirmar que ele cai dentro do setor.

**Decisão:** o teste calcula `((Math.atan2(x - centre, centre - y) / DEG_TO_RAD) + 360) % 360` e a
distância por `Math.sqrt((x - centre)² + (y - centre)²)`.

**Evidência:** é a inversa exata de `polarToCartesian` (`src/components/Chart/geometry.ts`, linhas
54 a 65). Dela, `x - centre = r·cos(θ - 90°) = r·sen θ` e `centre - y = -r·sen(θ - 90°) = r·cos θ`,
de modo que `atan2(x - centre, centre - y)` devolve θ. O intervalo útil de qualquer setor vai de
`startAngle + 10°` a `endAngle - 10°`, o que mantém o resultado entre 10° e 350° em qualquer `N` de
1 a 6: nenhum setor cruza a origem dos ângulos e a normalização não precisa tratar a volta.

**Consequências:** o teste afirma o ângulo e a distância sem reimplementar o sorteio, e sem
importar `d3`.
