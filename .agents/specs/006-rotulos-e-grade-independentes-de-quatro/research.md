# Research: rótulos de quadrante e grade responsiva independentes de quatro

Cada seção registra o contexto, as alternativas, a decisão e a evidência que a fecha. Os
vereditos aparecem em uma linha no [`plan.md`](./plan.md).

## Medidas do layout lidas do código

As decisões de espaço desta unidade partem destes números, todos lidos do repositório:

| Medida | Origem | Valor |
| --- | --- | --- |
| Largura da caixa de conteúdo da página (`W`) | `src/styles/components/page.scss` — `.page { max-width: 1200px; padding: 0 15px }` | `min(janela, 1200) - 30`; 1170 px a partir de 1200 px de janela, 770 px em 800 px de janela |
| Largura do bloco de rótulo | `src/components/RadarGrid/radar-grid.scss` — `.quadrant-label { position: absolute; width: 20% }` | `0,20 W` — 234 px a `W` = 1170 |
| Largura da legenda | `radar-grid.scss` — `.radar-legend { position: absolute; width: 15%; right: 0; top: 45% }` | `0,15 W` — 175 px a `W` = 1170 |
| Largura do gráfico | `src/components/Chart/chart.scss` — `.chart { margin: 0 auto }` e `style={{ maxWidth: '800px' }}` em `RadarChart.tsx` | `min(W, 800)` |
| Proporção do desenho | `RadarChart.tsx` — `viewBox="0 0 800 900"` | altura = 1,125 × largura do gráfico |
| Círculo do radar | `RadarChart.tsx` — `circle cx=400 cy=400 r=400` | diâmetro igual à largura do gráfico, com uma faixa livre abaixo dele de 100/800 = 12,5% dessa largura |

O bloco de rótulo e a legenda são posicionados contra a **caixa de padding** da `.radar-grid`, que
é o bloco contentor de qualquer descendente absoluto: `left: 0` encosta na borda interna, e
`width: 20%` mede os mesmos `0,20 W` independentemente do espaço interno que a `.radar-grid`
receba. É esse comportamento que permite reservar faixa para os blocos com `padding` no contêiner
sem alterar a largura deles.

Com quatro quadrantes e `W` = 1170 px, a sobra lateral de cada lado do gráfico é
`(1170 - 800) / 2` = 185 px, menor que os 234 px do bloco: cada bloco de canto avança 49 px sobre
a caixa do gráfico. Na altura do seu ponto mais baixo — cerca de 150 px a partir do topo — a borda
do círculo ainda está a 88 px da lateral da caixa (`400 - √(400² - 250²)`), de modo que a
sobreposição é com o canto vazio da caixa, nunca com o círculo.

## Origem do lugar do bloco: slot de tela, não posição exibida

**Contexto.** `src/components/RadarGrid/RadarGrid.tsx` escolhe o canto em
`stylesMap[quadrantConfig.position - 1]`, enquanto o setor que o bloco identifica é desenhado a
partir de `slotOf(quadrant)` — `order`, com recaída em `position` — em `QuadrantRings.tsx`,
`BlipPoints.tsx` e `blips.ts`.

**Alternativas:**

- **Manter a escolha pela posição exibida**, corrigindo apenas o estouro de índice.
- **Escolher pelo slot de tela**, o mesmo número que reparte o círculo.

**Decisão:** o lugar do bloco vem de `slotOf(quadrant)`.

**Evidência:** no `public/config.json` versionado, `position` e `order` divergem em todos os quatro
quadrantes — `languages-and-frameworks` tem posição 1 e slot 4, `methods-and-patterns` posição 2 e
slot 1, `platforms-and-operations` posição 3 e slot 3, `tools` posição 4 e slot 2. A tabela de
cantos indexada pela posição e os setores desenhados pelo slot coincidem hoje por conta da
combinação dos dois mapeamentos: a posição 1 cai no canto superior esquerdo, que é o setor do slot
4 (270° a 360°, conferido em `geometry.test.tsx`, bloco `publishedSectors`). Qualquer troca de
`order` desfaz a coincidência sem erro visível.

**Consequências:** o bloco acompanha o setor por construção. A posição exibida responde apenas
pelo número que o leitor lê, e a restrição de posições de 1 a 4 sai da taxonomia.

## Conferência da tabela de lugares portada da v5

**Contexto.** A tabela de casos CSS da branch `v5` de `AOEpeople/aoe_technology_radar` (PR #502,
Apache-2.0) numera os blocos pelo slot, da mesma forma que `segmentAngles`. Era preciso conferir,
caso a caso, se o lugar que ela dá a cada bloco cai do lado do setor que `segmentAngles` desenha.

**Método.** Para `numSegments` = N, o slot `k` ocupa de `(k-1)·360/N` a `k·360/N` graus, medidos
no sentido horário a partir das 12 horas (`segmentAngles` em `src/components/Chart/geometry.ts`,
exercitada por `geometry.test.tsx`). O lado do setor é o do seu ângulo médio.

| N | Slot | Setor | Ângulo médio | Lado | Lugar pela tabela | Confere |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 0°–360° | — | círculo inteiro | superior esquerdo | sim |
| 2 | 1 | 0°–180° | 90° | direita | superior direito | sim |
| 2 | 2 | 180°–360° | 270° | esquerda | superior esquerdo | sim |
| 3 | 1 | 0°–120° | 60° | direita, acima | superior direito | sim |
| 3 | 2 | 120°–240° | 180° | metade inferior | inferior direito | sim |
| 3 | 3 | 240°–360° | 300° | esquerda, acima | superior esquerdo | sim |
| 4 | 1 | 0°–90° | 45° | superior direito | superior direito | sim |
| 4 | 2 | 90°–180° | 135° | inferior direito | inferior direito | sim |
| 4 | 3 | 180°–270° | 225° | inferior esquerdo | inferior esquerdo | sim |
| 4 | 4 | 270°–360° | 315° | superior esquerdo | superior esquerdo | sim |
| 5 | 1 | 0°–72° | 36° | superior direito | superior direito | sim |
| 5 | 2 | 72°–144° | 108° | direita, abaixo | inferior direito | sim |
| 5 | 3 | 144°–216° | 180° | inferior ao centro | inferior ao centro | sim |
| 5 | 4 | 216°–288° | 252° | esquerda, abaixo | inferior esquerdo | sim |
| 5 | 5 | 288°–360° | 324° | superior esquerdo | superior esquerdo | sim |
| 6 | 1 | 0°–60° | 30° | superior direito | superior direito | sim |
| 6 | 2 | 60°–120° | 90° | direita, ao meio | direita, ao meio | sim |
| 6 | 3 | 120°–180° | 150° | inferior direito | inferior direito | sim |
| 6 | 4 | 180°–240° | 210° | inferior esquerdo | inferior esquerdo | sim |
| 6 | 5 | 240°–300° | 270° | esquerda, ao meio | esquerda, ao meio | sim |
| 6 | 6 | 300°–360° | 330° | superior esquerdo | superior esquerdo | sim |

A conferência confirma os quatro lugares publicados hoje — `methods-and-patterns` no slot 1 e no
canto superior direito, `tools` no slot 2 e no inferior direito, `platforms-and-operations` no
slot 3 e no inferior esquerdo, `languages-and-frameworks` no slot 4 e no superior esquerdo.

**Único caso com mais de um lugar defensável:** com três quadrantes o slot 2 varre toda a metade
inferior do círculo, e tanto o canto inferior direito (o que a tabela dá) quanto o centro inferior
ficam dentro do setor. A tabela fica como está: o canto inferior é a única região da caixa do
gráfico que o círculo não ocupa, enquanto o centro inferior exigiria reservar faixa abaixo do
gráfico — espaço que a configuração de três quadrantes não precisa para mais nada.

**Ajuste aplicado:** com seis quadrantes os blocos das laterais ficam em `top: 38%` em vez do
`top: 50%` da tabela de origem, pelo cálculo da seção seguinte. Os demais casos entram sem
alteração.

## Espaço para os blocos com cinco e com seis quadrantes

**Contexto.** Nos cantos, o bloco avança sobre a caixa do gráfico onde o círculo não alcança. No
meio da lateral (seis quadrantes) e no centro inferior (cinco quadrantes) não há canto vazio: o
bloco cairia sobre o círculo. A v5 resolve com espaço interno no contêiner por contagem
(`[data-segments="5"] { padding: 15px 15px 200px }`, `[data-segments="6"] { padding: 150px 300px }`).

**Alternativas:**

- **Espaço interno em pixels**, como na origem.
- **Espaço interno em porcentagem**, que acompanha a largura do contêiner.
- **Encolher o bloco** com `width` menor nas contagens altas, preservando o espaço.

**Decisão:** espaço interno no contêiner, em porcentagem nas laterais e em pixels embaixo —
`[data-quadrants="5"] { padding-bottom: 200px }` e `[data-quadrants="6"] { padding: 0 22% 10% }` —
com a largura do bloco intocada.

**Evidência e cálculo.** Com espaço interno lateral de 22%, a caixa de conteúdo da `.radar-grid`
fica com `0,56 W`, e o gráfico ocupa essa largura (o teto de 800 px só passaria a valer com
`W` > 1428 px, acima do máximo de 1170 px da página). Disso saem, em função de `W`:

- largura do gráfico `Wc = 0,56 W`, altura `Hc = 1,125 · Wc = 0,63 W`;
- espaço interno inferior `0,10 W`, e portanto altura da caixa de padding `H = 0,73 W`;
- bloco da lateral entre `0` e `0,20 W`, com o gráfico começando em `0,22 W` — folga de `0,02 W`,
  23 px a `W` = 1170 e 15 px a `W` = 770;
- centro vertical do círculo em `0,5 · Wc = 0,28 W`, que vale `0,28 / 0,73` = **38,4%** de `H`.

Como todas as parcelas escalam com `W`, essa fração não muda com a largura da janela: um único
`top: 38%` alinha o bloco da lateral com o centro do círculo em qualquer largura. É por isso que o
espaço inferior desta contagem é percentual — um valor em pixels tornaria a fração dependente da
janela. O mesmo cálculo explica o `top: 45%` que a legenda já usa com quatro quadrantes: sem
espaço interno, o centro do círculo fica a `400/900` = 44,4% da altura do desenho.

Com cinco quadrantes não há bloco de lateral para alinhar, e o que o espaço inferior precisa
garantir é a faixa abaixo do círculo: a faixa livre do próprio `viewBox` vale 12,5% da largura do
gráfico — 100 px a `W` = 1170 — e os 200 px herdados da v5 a levam a 300 px, contra os cerca de
150 px de altura do bloco. Na horizontal, o bloco central ocupa de `0,40 W` a `0,60 W` e os blocos
dos cantos inferiores vão até `0,20 W` e a partir de `0,80 W`, o que deixa `0,20 W` de folga de
cada lado.

**Consequências:** nenhuma regra de espaço incide sobre uma, duas, três ou quatro contagens, de
modo que o layout publicado fica intocado. Com seis quadrantes o gráfico fica menor, o que é a
contrapartida aceita por manter os seis blocos fora do círculo.

## Lugar da legenda com seis quadrantes

**Contexto.** A legenda vive em `right: 0; top: 45%`, exatamente onde o bloco da lateral direita
cai quando há seis quadrantes.

**Alternativas:**

- **Empilhar a legenda abaixo do bloco da lateral direita**, mantendo-a na coluna da direita.
- **Levar a legenda para o centro inferior**, a única região livre nessa contagem.
- **Ocultar a legenda** nas contagens altas.

**Decisão:** com seis quadrantes a legenda vai para o centro inferior
(`bottom: 0; right: 50%; transform: translateX(50%)`); nas demais contagens ela fica onde está.

**Evidência.** Com seis quadrantes, as duas colunas laterais ficam inteiramente ocupadas — slots
1, 2 e 3 à direita, 4, 5 e 6 à esquerda —, e o topo ao centro é o ponto em que o círculo encosta na
borda da caixa. Resta o centro inferior: a legenda ocupa de `0,425 W` a `0,575 W` na horizontal,
contra `0 a 0,20 W` e `0,80 W a W` dos blocos dos cantos inferiores. Na vertical, o espaço livre
abaixo do círculo é a faixa do `viewBox` mais o espaço interno inferior — `0,049 W + 0,10 W`, ou
174 px a `W` = 1170 e 115 px a `W` = 770 —, contra cerca de 80 px de altura da legenda, que são
três linhas de texto com 10 px de separação (`.radar-legend .wrapper { margin-bottom: 10px }`).
Ocultar a legenda foi descartado porque ela é o que explica as três formas de ponto, conteúdo que
não existe em nenhum outro lugar da tela.

## Cor da linha divisória do bloco

**Contexto.** A cor vem do dado (`quadrantsMap[slug].colour`) e hoje chega ao DOM como
`style={{ borderColor }}` no `<hr>` do bloco. A descrição da unidade admite trocá-la por uma
propriedade personalizada de CSS, desde que a cor exibida continue a mesma.

**Alternativas:**

- **Manter o `style` inline no `<hr>`.**
- **Publicar `--quadrant-color` no bloco** e consumi-la no SCSS.

**Decisão:** manter o `style` inline.

**Evidência:** `React.CSSProperties` não aceita chave de propriedade personalizada, e o projeto
compila com `strict` em `tsconfig.json` e trata aviso do ESLint como erro no build
(`CI=true` no workflow). Publicar a propriedade exigiria uma asserção de tipo no único ponto que
hoje é direto, sem mudar o que o leitor vê — a cor continua vindo do mesmo dado, pelo mesmo
elemento. O critério de aceite da unidade, por sua vez, proíbe o `style` inline apenas para o
**posicionamento** do bloco.

**Consequências:** a linha segue com a cor do quadrante em qualquer contagem, e o SCSS fica sem
dependência do dado.

## Grade de quadrantes da página inicial

**Contexto.** `src/components/QuadrantGrid/quadrant-grid.scss` monta a grade com
`display: flex`, `flex-wrap: wrap`, `justify-content: space-between` e `flex: 0 0 45%` por bloco,
com `flex-basis: 100%` abaixo de `$until-lg` (61,875em). A largura de 45% só fecha uma grade
inteira com uma quantidade par de blocos.

**Alternativas:**

- **`repeat(auto-fit, minmax(...))`**, que acompanha a largura disponível.
- **Grade de duas colunas explícitas**, com a separação entre elas declarada.
- **Manter o flex**, trocando a base por um cálculo.

**Decisão:** `display: grid` com `grid-template-columns: repeat(2, minmax(0, 1fr))` e
`column-gap: 10%`, caindo para uma coluna abaixo de `$until-lg`.

**Evidência:** com duas colunas e separação de 10%, cada coluna mede `(100% - 10%) / 2` = 45% da
largura do contêiner, e a separação entre elas é de 10% — exatamente a geometria que
`flex: 0 0 45%` com `justify-content: space-between` produz hoje, agora sem depender da quantidade
de blocos. `repeat(auto-fit, minmax(...))` foi descartado porque a quantidade de colunas passaria a
ser função da largura da janela: na faixa de 800 px a 1200 px, uma largura mínima pequena o
bastante para caber duas colunas em 770 px abre três colunas em 1170 px, o que mudaria o layout
publicado. `minmax(0, 1fr)` evita que um rótulo longo estoure a coluna, comportamento que a base
fixa de 45% já garantia.

**Consequências:** a grade apresenta qualquer quantidade de quadrantes, em linhas de duas colunas,
e o espaço entre linhas continua vindo do `margin-bottom` de 40 px de cada bloco.

## Alcance da suíte sobre os componentes alterados

**Contexto.** `RadarGrid` importa `RadarChart`, que importa `d3` 7.8.0, publicado como ESM que o
transform do `react-scripts` não alcança em `node_modules`. `QuadrantGrid` não traz `d3`, mas
chega a `Link`, que importa `query-string` 8.1.0 — também ESM.

**Alternativas:**

- **Declarar `transformIgnorePatterns` no `package.json`**, alcançando os pacotes ESM para a suíte
  inteira.
- **Substituir o módulo `Link` no arquivo de teste**, mantendo a configuração do Jest como está.
- **Afirmar apenas sobre função pura**, sem renderizar componente.

**Decisão:** substituir o módulo `Link` no próprio arquivo de teste, com `jest.mock("../Link/Link")`
e uma fábrica que devolve um `<a>`.

**Evidência:** medições feitas neste repositório, com o `react-scripts` instalado.

- `CI=true react-scripts test --testPathPattern "Item.test"` falha com
  `SyntaxError: Cannot use import statement outside a module` em
  `node_modules/query-string/index.js`, carregado por
  `src/hooks/use-search-param-state.tsx` a partir de `Link`.
- Um arquivo de teste que renderiza `QuadrantGrid` com `jest.mock("../Link/Link")` devolveu `PASS`,
  com os quatro blocos no documento e o rótulo de um item encontrado por `screen.getByText`. O
  arquivo foi descartado depois da medição.
- `Link` é o único módulo do subgrafo de `QuadrantGrid` que chega ao `query-string`: os imports de
  `QuadrantSection`, `ItemList`, `Item`, `Badge` e `Flag` ficam em `react`, `classnames`,
  `react-i18next` e módulos do próprio `src/`.
- `CI=true react-scripts test --watchAll=false` na base desta unidade devolve 5 suítes passando e 2
  falhando — `Item.test.tsx` pelo `query-string` e `date.test.tsx` pelo `moment` —, com 102 casos
  verdes em 104.

Mexer em `transformIgnorePatterns` foi descartado por alcançar a suíte inteira, inclusive o `d3`,
e mudar o portão de qualidade de todo o repositório para resolver dois arquivos de teste desta
unidade.

**Consequências:** `QuadrantLabel` e `QuadrantGrid` ficam cobertos por teste de componente;
`RadarGrid` e o desenho continuam fora do alcance da suíte, conferidos por captura de tela.

## Leitura do SCSS pelo teste

**Contexto.** O critério de aceite pede que a suíte acuse a ausência de regra para qualquer slot de
1 a 6 em `radar-grid.scss`. O transform do `react-scripts` substitui o import de `.scss` por um
objeto vazio, de modo que importar o arquivo não dá acesso ao seu texto.

**Decisão:** o teste lê o arquivo com `fs.readFileSync` a partir de `__dirname`.

**Evidência:** `jest --env=jsdom` sobre um arquivo de teste que lê
`src/components/RadarGrid/radar-grid.scss` com `fs.readFileSync` devolveu `PASS`, com `window`
disponível no mesmo caso — o ambiente jsdom do Jest não remove os módulos do Node. O arquivo da
medição foi descartado.

**Consequências:** a conferência é sobre o texto do arquivo, não sobre o estilo calculado pelo
navegador; a ausência de sobreposição continua sendo conferência visual.

## Extração do bloco de rótulo para arquivo próprio

**Contexto.** `QuadrantLabel` vive dentro de `RadarGrid.tsx`, que importa `RadarChart` e, com ele,
o `d3`. Qualquer teste sobre o bloco carregaria o `d3` junto.

**Decisão:** `QuadrantLabel` passa a viver em `src/components/RadarGrid/QuadrantLabel.tsx`, com as
mesmas três props, e `RadarGrid.tsx` o importa.

**Evidência:** os imports do bloco são `react`, `src/model`, `src/components/Chart/geometry`,
`Link` e `react-i18next` — nenhum deles chega ao `d3`, e o único que chega ao `query-string` é
`Link`, resolvido pela substituição do módulo no teste. A folha de estilo continua sendo importada
uma vez, por `RadarGrid.tsx`, porque as regras dos dois componentes vivem em `radar-grid.scss`.

**Consequências:** a escolha do lugar do bloco passa a ser afirmável por teste de componente, com o
número exibido e a classe do slot no mesmo caso.
