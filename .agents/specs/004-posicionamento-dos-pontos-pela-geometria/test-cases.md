# Casos de teste: posicionamento dos pontos pela geometria compartilhada

Catálogo derivado de [`spec.md`](./spec.md) e [`plan.md`](./plan.md), agrupado pelas quatro
histórias de usuário da spec. A unidade atravessa três domínios: **Visualização do Radar**, dono do
sorteio da posição do ponto; **Taxonomia de Quadrantes e Anéis**, cujo slot de tela passa a decidir
o setor de todo o diagrama; e **Catálogo de Opiniões Tecnológicas**, cujo modelo de leitura `Blip`
perde um campo e cuja integridade no gráfico é conferida pela contagem de pontos.

## Pré-condições

- Repositório clonado na branch desta unidade, com as dependências instaladas (`yarn install`) e
  Node 16.
- Terminal aberto na raiz do repositório. Em ambiente sem o `yarn` instalado, cada comando tem o
  equivalente direto pelo Node: `node node_modules/typescript/bin/tsc --noEmit`,
  `node node_modules/eslint/bin/eslint.js "src/**/*.tsx"`,
  `CI=true node node_modules/react-scripts/bin/react-scripts.js test --watchAll=false` e
  `node node_modules/react-scripts/bin/react-scripts.js start`.
- Estado conhecido da base para comparação: `yarn ts:check` e `yarn lint` terminam limpos, e
  `yarn test` acusa 4 suítes — 2 passando e 2 falhando — com 60 testes, 58 passando e 2 falhando.
  Passam `src/components/Chart/geometry.test.tsx`, com 55 casos, e `src/sanitize.test.tsx`, com 3.
  Falham `src/date.test.tsx`, nos dois casos de `formatRelease`, por transformação de ESM de
  `moment`, e `src/components/Item/Item.test.tsx`, que nem carrega, com
  `SyntaxError: Cannot use import statement outside a module`, por `query-string`.
- Navegador de desktop, com a janela em pelo menos 800 px de largura; abaixo disso o conjunto da
  visualização fica oculto e a página inicial mostra só as listagens.
- Valores vigentes de `public/config.json` usados nas afirmações numéricas: `chartConfig.size` igual
  a 800, portanto centro do diagrama em 400 px; `chartConfig.blipSize` igual a 12, portanto
  distância mínima entre pontos do mesmo setor igual a 18 px; raios dos anéis em pixels iguais a
  200 (`adopt`), 275 (`trial`), 350 (`assess`) e 400 (`hold`); faixas de sorteio de 15 a 185, 215 a
  260, 290 a 335 e 365 a 385 px.
- Acervo vigente de `public/db1-opinion.json`: 53 itens, todos em destaque e todos com anel e
  quadrante válidos, sendo 3 com marca `new`, 8 com marca `changed` e 42 com marca `default`.

## História 1 — o sorteio deriva da definição única de geometria

### TC-1 (obrigatório) — a tabela por posição, o sorteio antigo e a guarda de eixos não existem mais

1. No terminal, na raiz do repositório, rode `grep -rn "generateCoordinates\|randomBetween" src/`.
2. Rode `grep -n "1, 4, 2, 3" src/components/Chart/BlipPoints.tsx`.
3. Rode `grep -n "xScale(0)\|yScale(0)\|do {\|while (" src/components/Chart/BlipPoints.tsx`.
4. Rode `grep -n "position" src/components/Chart/BlipPoints.tsx`.

**Esperado:** os passos 1, 2 e 3 não devolvem nenhuma ocorrência — as duas funções, o vetor de
deslocamento, a comparação com as linhas centrais e o laço `do/while` saíram do repositório. O passo
4 mostra apenas `ringPosition`, o índice do anel; o componente não lê `quadrant.position` nem indexa
nada por ela.

### TC-2 (obrigatório) — o sorteio vem do módulo de geometria

1. Abra `src/components/Chart/geometry.ts` e leia a função `blipPosition`.
2. Abra `src/components/Chart/blips.ts` e leia a função `buildBlips`.
3. Abra `src/components/Chart/BlipPoints.tsx` e leia o bloco de imports e o corpo do componente.

**Esperado:** `blipPosition` obtém a faixa angular por `segmentAngles(slot, numSegments)`, desconta
`SECTOR_PADDING_ANGLE` de cada ponta e converte o par ângulo + raio por
`polarToCartesian(config.chartConfig.size / 2, raio, ângulo)`, sem nenhuma expressão angular
própria. `buildBlips` resolve o setor por `slotOf(quadrantConfig)` e a quantidade de setores por
`segmentCount(config)`, e delega o ponto a `blipPosition`. `BlipPoints.tsx` apenas chama
`buildBlips(items, config)` e mapeia o resultado em JSX, sem calcular coordenada alguma.

### TC-3 (obrigatório) — nenhuma trigonometria fora do módulo de geometria

1. No terminal, na raiz do repositório, rode
   `grep -rn "Math.cos\|Math.sin\|DEG_TO_RAD" src/ --include=*.ts --include=*.tsx`.

**Esperado:** as ocorrências de `Math.cos` e `Math.sin` aparecem apenas em
`src/components/Chart/geometry.ts`. Nem `BlipPoints.tsx`, nem `blips.ts`, nem `QuadrantRings.tsx`,
nem `RadarChart.tsx` escrevem conversão angular própria.

### TC-4 (obrigatório) — as escalas do `d3` saem do componente dos pontos

1. No terminal, na raiz do repositório, rode `grep -n "d3\|xScale\|yScale" src/components/Chart/BlipPoints.tsx`.
2. Rode `grep -n "d3" src/components/Chart/blips.ts src/components/Chart/geometry.ts`.
3. Abra `src/components/Chart/RadarChart.tsx` e leia a montagem de `<BlipPoints />`.

**Esperado:** os passos 1 e 2 não devolvem nenhuma ocorrência: nem o componente dos pontos nem os
dois módulos puros importam `d3` ou recebem escala. No passo 3, `BlipPoints` recebe apenas `items` e
`config`; `RadarChart` continua construindo `xScale` e `yScale`, porque `RingLabel` usa as duas e
`QuadrantRings` usa `xScale`.

### TC-5 (obrigatório) — o tipo `Blip` perde a posição exibida do quadrante

1. No terminal, na raiz do repositório, rode `grep -rn "quadrantPosition" src/`.
2. Abra `src/model.ts` e leia a declaração do tipo `Blip`.

**Esperado:** o passo 1 não devolve nenhuma ocorrência. O tipo `Blip` declara `ringPosition`,
`colour`, `txtColour` e `coordinates` sobre `Item`, sem campo de posição de quadrante. O slot de
tela não aparece no tipo: ele vive como variável local de `buildBlips`.

### TC-6 (obrigatório) — as suítes novas não alcançam o `d3` nem o `query-string`

1. Abra `src/components/Chart/geometry.test.tsx` e `src/components/Chart/blips.test.tsx` e leia os
   blocos de imports.
2. No terminal, na raiz do repositório, rode `yarn test`.
3. Na saída, compare o resultado das duas suítes com o de `src/components/Item/Item.test.tsx`.

**Esperado:** nenhum dos dois arquivos de teste importa `d3`, `react-router-dom` ou um componente
que os traga, direta ou indiretamente. As duas suítes são reportadas como passadas, sem a mensagem
`Cannot use import statement outside a module` que aparece na outra.

### TC-7 (obrigatório) — o raio do anel em pixels concorda com o dos arcos

1. No terminal, na raiz do repositório, rode `yarn test`.
2. Na saída, localize a suíte `src/components/Chart/geometry.test.tsx` e leia os casos de
   `radiusToPixels`.

**Esperado:** os casos passam afirmando que, com o `public/config.json` do repositório,
`radiusToPixels` devolve 200, 275, 350 e 400 px para `adopt`, `trial`, `assess` e `hold` — os mesmos
valores que `xScale(radius) - xScale(0)` entrega aos arcos em `QuadrantRings.tsx`.

### TC-8 (obrigatório) — as faixas de sorteio de cada anel

1. No terminal, na raiz do repositório, rode `yarn test`.
2. Na saída, localize a suíte `src/components/Chart/geometry.test.tsx` e leia os casos da faixa do
   anel.

**Esperado:** os casos passam afirmando que a faixa de sorteio vai de 15 a 185 px em `adopt`, de 215
a 260 px em `trial`, de 290 a 335 px em `assess` e de 365 a 385 px em `hold` — o raio do anel
anterior mais 15 px até o raio do próprio anel menos 15 px, com 0 como raio anterior do primeiro
anel.

### TC-9 (recomendado) — o bloco dos arcos fica como está

1. No terminal, na raiz do repositório, rode `git diff -- src/components/Chart/QuadrantRings.tsx`.

**Esperado:** o comando não devolve nenhuma diferença. `arcPath`, o bloco do `d3.arc` com
`innerRadius`, `outerRadius` e `xScale(arcAttrs.radius) - xScale(0)`, o brilho de fundo e a
translação dos `<path>` por `size / 2` permanecem com as mesmas expressões.

### TC-10 (recomendado) — o gerador injetado e o acumulador por setor

1. Abra `src/components/Chart/geometry.ts` e leia a assinatura de `blipPosition`.
2. Abra `src/components/Chart/blips.ts` e leia a assinatura de `buildBlips` e a declaração do
   acumulador de pontos.
3. No terminal, rode `grep -n "Math.random" src/components/Chart/geometry.ts src/components/Chart/blips.ts`.

**Esperado:** `blipPosition` recebe `(slot, numSegments, ringIndex, config, placed, rand?)` e
`buildBlips` recebe `(items, config, rand?)`, com `Math.random` como valor padrão do parâmetro em
ambas — as únicas duas ocorrências que o passo 3 devolve. O acumulador é um objeto local com
assinatura de índice `{ [slot: number]: Point[] }`, chaveado pelo slot de tela, e `blipPosition`
recebe a lista do setor sem alterá-la.

## História 2 — cada ponto no seu quadrante e no seu anel, com o acervo inteiro representado

### TC-11 (obrigatório) — o ângulo cai dentro do setor, de três a seis quadrantes

1. No terminal, na raiz do repositório, rode `yarn test`.
2. Na saída, localize a suíte `src/components/Chart/geometry.test.tsx` e leia os casos de
   `blipPosition` sobre o ângulo.

**Esperado:** para cada `N` em {3, 4, 5, 6}, cada slot de 1 a `N` e cada um dos quatro anéis, os
casos passam afirmando que as 200 posições sorteadas têm ângulo em relação ao centro — medido em
pixels de tela, com 0° às 12 horas e crescendo no sentido horário — entre o início do setor mais 10°
e o fim do setor menos 10°.

### TC-12 (obrigatório) — a distância ao centro cai dentro da faixa do anel

1. No terminal, na raiz do repositório, rode `yarn test`.
2. Na saída, localize a suíte `src/components/Chart/geometry.test.tsx` e leia os casos de
   `blipPosition` sobre a distância.

**Esperado:** para o mesmo conjunto de `N`, slots e anéis do TC-11, os casos passam afirmando que a
distância de cada ponto ao centro do diagrama cai entre a borda interna e a borda externa da faixa
de sorteio do seu anel.

### TC-13 (obrigatório) — cada quadrante publicado no seu canto de tela

1. No terminal, na raiz do repositório, rode `yarn test`.
2. Na saída, localize a suíte `src/components/Chart/geometry.test.tsx` e leia os casos de
   `blipPosition` sobre o `public/config.json` do repositório.

**Esperado:** os casos passam afirmando, para as 200 posições de cada quadrante publicado, que
`methods-and-patterns` cai com `x` maior e `y` menor que o centro — o canto superior direito —,
`tools` com os dois maiores — inferior direito —, `platforms-and-operations` com `x` menor e `y`
maior — inferior esquerdo — e `languages-and-frameworks` com os dois menores — superior esquerdo.

### TC-14 (obrigatório) — a trava acusa o setor espelhado ou trocado

1. Abra `public/config.json` e troque os valores de `order` entre `tools` e
   `platforms-and-operations`, de 2 e 3 para 3 e 2.
2. No terminal, na raiz do repositório, rode `yarn test`.
3. Leia o resultado da suíte `src/components/Chart/geometry.test.tsx`.
4. Desfaça a alteração com `git checkout -- public/config.json` e rode `yarn test` de novo.

**Esperado:** no passo 3 a suíte falha, acusando que os pontos de `tools` e de
`platforms-and-operations` caem no canto de tela errado; no passo 4 ela volta a passar inteira. A
falha prova que a trava lê o arquivo do repositório, e não uma cópia de fixture — é ela que pega
tanto o espelhamento pelo eixo vertical invertido quanto o uso da posição exibida no lugar do slot.

### TC-15 (obrigatório) — nenhuma coordenada inválida, de um a seis quadrantes

1. No terminal, na raiz do repositório, rode `yarn test`.
2. Na saída, localize a suíte `src/components/Chart/geometry.test.tsx` e leia os casos de coordenada
   finita.

**Esperado:** para cada `N` de 1 a 6, cada slot de 1 a `N` e cada um dos quatro anéis, os casos
passam afirmando que `x` e `y` do ponto devolvido passam em `Number.isFinite` — nenhum `NaN` e
nenhum `undefined`.

### TC-16 (obrigatório) — todo item com anel e quadrante válidos vira ponto

1. No terminal, na raiz do repositório, rode `yarn test`.
2. Na saída, localize a suíte `src/components/Chart/blips.test.tsx` e leia o caso de contagem.

**Esperado:** o caso passa afirmando que `buildBlips`, recebendo os itens em destaque de
`public/db1-opinion.json` e o `public/config.json` do repositório — os dois lidos dos arquivos reais
—, devolve 53 pontos, e que a cor de cada ponto é a do seu quadrante.

### TC-17 (obrigatório) — item sem anel, sem quadrante ou fora da taxonomia é descartado

1. No terminal, na raiz do repositório, rode `yarn test`.
2. Na saída, localize a suíte `src/components/Chart/blips.test.tsx` e leia o caso de descarte.

**Esperado:** o caso passa afirmando que uma lista com um item sem anel, um item sem quadrante e um
item cujo quadrante não existe em `quadrantsMap` devolve lista vazia, sem lançar erro — os três são
omitidos em silêncio, como hoje.

### TC-18 (obrigatório) — 53 pontos no SVG da página inicial

1. No terminal, na raiz do repositório, rode `yarn start` e aguarde a aplicação subir.
2. No navegador, abra `http://localhost:3000/`.
3. Abra as ferramentas de desenvolvedor, aba de console, e rode
   `document.querySelectorAll('.blips > a').length`.

**Esperado:** o console devolve 53, a mesma quantidade de itens do acervo com anel e quadrante
válidos. Nenhum ponto some por coordenada inválida.

### TC-19 (obrigatório) — cor, dica, link e as três formas de ponto

1. No terminal, na raiz do repositório, rode `yarn start` e abra `http://localhost:3000/`.
2. Passe o mouse sobre um ponto do setor de `methods-and-patterns` e leia a dica.
3. Clique nesse mesmo ponto.
4. Volte à página inicial e localize, no setor de `platforms-and-operations`, anel `adopt`, o ponto
   de **Loki** (marca `new`) e o de **Prometheus** (marca `changed`); observe a forma dos dois e a
   de um ponto `default` qualquer.

**Esperado:** no passo 2 a dica mostra o rótulo da tecnologia, com o fundo na cor do quadrante e o
texto na cor declarada para ele. No passo 3 a navegação leva à página do item, no endereço formado
pelo par quadrante + nome. No passo 4, o ponto `new` é um triângulo de cantos arredondados, o
`changed` é um losango e o `default` é um círculo, os três na cor do seu quadrante.

## História 3 — folga das divisórias, dos arcos e dos pontos vizinhos

### TC-20 (obrigatório) — nenhum ponto encosta na divisória nem nos arcos

1. No terminal, na raiz do repositório, rode `yarn start` e abra `http://localhost:3000/`.
2. Observe o diagrama quadrante a quadrante e anel a anel, com atenção às fronteiras entre setores
   vizinhos e aos arcos que delimitam cada faixa.
3. Recarregue a página mais três vezes e repita a observação.

**Esperado:** em todas as recargas, cada ponto fica dentro do seu quadrante e do seu anel, com um
corredor livre junto a cada divisória entre setores e sem encostar nos arcos. A posição exata muda a
cada recarga, então a conferência é por quadrante e anel, nunca por comparação de captura de tela.

### TC-21 (obrigatório) — esgotado o teto, o sorteio avisa e aceita a última posição

1. No terminal, na raiz do repositório, rode `yarn test`.
2. Na saída, localize a suíte `src/components/Chart/geometry.test.tsx` e leia os casos de colisão e
   teto de tentativas.

**Esperado:** os casos passam afirmando que, com `placed` contendo um ponto e um gerador injetado
que devolve sempre o mesmo valor, `blipPosition` esgota as 150 tentativas, chama `console.warn` uma
única vez — com a mensagem nomeando o slot e o índice do anel — e devolve o candidato repetido. Com
`placed` vazio e o mesmo gerador, nenhuma chamada a `console.warn` acontece: o primeiro ponto do
setor não tem com o que colidir.

### TC-22 (obrigatório) — a colisão só vale entre pontos do mesmo setor

1. No terminal, na raiz do repositório, rode `yarn test`.
2. Na saída, localize a suíte `src/components/Chart/blips.test.tsx` e leia os casos de colisão por
   setor.

**Esperado:** os casos passam afirmando que, com um gerador injetado que devolve sempre o mesmo
valor, dois itens do mesmo quadrante e do mesmo anel disparam um `console.warn`, enquanto dois itens
de quadrantes diferentes não disparam nenhum — o segundo ponto é aceito na primeira tentativa,
porque o afastamento não é exigido entre setores distintos.

### TC-23 (recomendado) — a raiz desfaz o acúmulo na borda interna

1. Abra `src/components/Chart/geometry.ts` e leia o sorteio da distância ao centro em
   `blipPosition`.
2. No terminal, rode `yarn start`, abra `http://localhost:3000/` e observe a distribuição radial dos
   pontos no anel `adopt`, o mais interno e o mais cheio, em algumas recargas.

**Esperado:** o passo 1 mostra `inner + Math.sqrt(rand()) * (outer - inner)`. No passo 2, os pontos
do anel `adopt` aparecem espalhados ao longo de toda a faixa, sem a concentração junto à borda
interna que o sorteio linear produz.

## História 4 — um quinto quadrante

### TC-24 (obrigatório) — os pontos do quinto quadrante no setor de 72°

1. Com a unidade já commitada, abra `public/config.json` e acrescente uma quinta entrada a
   `quadrantsMap`, com `position` 5, `order` 5 e cor própria.
2. Abra `src/i18n/translations/pt.json`, `en.json` e `es.json` e acrescente uma quinta entrada à
   lista `pageHelp.quadrants` de cada um — `RadarGrid.tsx` percorre `quadrantsMap` e monta um bloco
   de rótulo por entrada, lendo a descrição por `position - 1`, e derruba a página inicial inteira
   sem ela.
3. Abra `public/db1-opinion.json` e troque o `quadrant` de alguns itens para o slug novo.
4. No terminal, rode `yarn start`, abra `http://localhost:3000/` e observe o diagrama; mantenha o
   console das ferramentas de desenvolvedor aberto.

**Esperado:** a página inicial renderiza e nenhum `TypeError` aparece no console. Os pontos dos itens
reclassificados aparecem dentro do setor de 72° do quadrante novo, na cor dele, dentro dos seus
anéis, e nenhum deles some do SVG.

### TC-25 (recomendado) — o restante do desenho segue preso a quatro posições

1. Com o estado local do TC-24 aplicado, observe o diagrama e a área ao redor dele em
   `http://localhost:3000/`.

**Esperado:** o quinto quadrante aparece com brilho de fundo, arcos dos anéis e pontos desenhados no
seu setor, enquanto o seu bloco de rótulo não é posicionado em um canto e o seu rótulo é exibido como
a chave crua de tradução. Esses dois desvios são esperados: cada um é migrado por uma unidade
própria.

### TC-26 (obrigatório) — o estado de conferência não entra no commit

1. No terminal, na raiz do repositório, rode
   `git restore public/config.json public/db1-opinion.json src/i18n/translations/pt.json src/i18n/translations/en.json src/i18n/translations/es.json`.
2. Rode `git status --short`.
3. Rode `git show --stat HEAD`.

**Esperado:** o passo 2 não lista nenhum dos cinco arquivos como modificado, e o passo 3 mostra o
commit da unidade sem o quadrante de teste, sem a reclassificação dos itens e sem as entradas extras
de tradução.

## Documentação autoritativa

Os casos abaixo cobrem o desvio deliberado registrado na seção de impacto do
[`plan.md`](./plan.md).

### TC-27 (obrigatório) — a skill do domínio descreve o sorteio pelo setor

1. Abra `.agents/skills/visualizacao-do-radar/SKILL.md`.
2. Leia as regras 3, 4, 11 e 16, o passo 4 do fluxo *Desenhar o radar*, o passo 2 do fluxo
   *Acrescentar um anel ao desenho* e, em *Restrições e validações*, a folga de sorteio e a
   degradação por densidade alta.

**Esperado:** a regra 3 diz que o ponto cai no setor apontado pelo slot de tela, de 360° dividido
pela quantidade de quadrantes declarada. A regra 4 descreve as quatro regras do sorteio no formato
vigente: ângulo dentro do setor com 10° livres junto a cada divisória; distância do centro na faixa
do anel com 15 px livres junto a cada arco, pela raiz do valor sorteado; afastamento de 1,5 vez o
tamanho do ponto apenas dos pontos já colocados no mesmo setor; teto de 150 tentativas, com aviso no
console e a última posição aceita ao esgotá-lo. A regra 11 atribui o corredor livre entre setores à
margem angular do sorteio, sem citar as linhas centrais. A regra 16 registra que arcos, brilho e
pontos acompanham a quantidade de quadrantes declarada, restando presos a quatro posições os blocos
de rótulo nos cantos e as listas posicionais de descrição. O passo 4 do fluxo acompanha as regras
novas, o passo 2 exige raios consecutivos afastados por mais de 30 px, e as restrições medem a folga
em pixels e citam o teto de 150 tentativas com o aviso no console.

### TC-28 (obrigatório) — a skill da taxonomia atribui o limite ao bloco de rótulo

1. Abra `.agents/skills/taxonomia-de-quadrantes-e-aneis/SKILL.md`.
2. Em *Restrições e validações*, leia a restrição sobre o número de quadrantes.

**Esperado:** a restrição diz que o diagrama é desenhado a partir do slot de tela para qualquer
quantidade declarada, e que o que ainda prende o radar a quatro quadrantes é o bloco de rótulo nos
cantos com a sua lista posicional de descrições.

### TC-29 (obrigatório) — a skill de testes nomeia as funções puras do sorteio

1. Abra `.agents/skills/estrategia-de-testes/SKILL.md`.
2. Leia a descrição do que vive em `src/components/Chart/geometry.ts`, o trecho sobre aleatoriedade
   e, em *Restrições e armadilhas conhecidas*, as armadilhas sobre o alcance da suíte.

**Esperado:** a descrição inclui o sorteio da posição do ponto e nomeia `src/components/Chart/blips.ts`
como o módulo puro que monta a lista de pontos. O trecho sobre aleatoriedade descreve a injeção do
gerador como parâmetro de `blipPosition` e de `buildBlips`. A armadilha sobre o vetor de deslocamento
não existe mais, e a armadilha sobre o alcance da suíte registra que `BlipPoints.tsx` continua fora
dela pelo `query-string` que o `Link` de cada ponto traz, mesmo sem importar `d3`.

### TC-30 (obrigatório) — o mapa funcional acompanha o sorteio

1. Abra `.agents/maps/functional-map.md`.
2. Leia a evidência no código, as regras inferidas e as dependências técnicas do domínio
   Visualização do Radar.

**Esperado:** a regra sobre o sorteio cita o teto de 150 tentativas e o afastamento por setor, sem as
linhas de eixo; a regra sobre a repartição do círculo diz que arcos, brilho e pontos acompanham a
quantidade de quadrantes declarada, restando os blocos de rótulo presos a quatro posições. A
evidência de `BlipPoints.tsx` acompanha o novo papel do arquivo, e a dependência técnica que cita o
andamento da reescrita nomeia também a branch `feat/us4-blip-positioner`.

### TC-31 (obrigatório) — o `AGENTS.md` atribui o limite ao bloco de rótulo

1. Abra `AGENTS.md`.
2. Em *Restrições globais*, leia a restrição dos quatro quadrantes.

**Esperado:** a restrição atribui o limite aos blocos de rótulo em `src/components/RadarGrid`, às
listas posicionais de descrição nos dicionários de tradução e à ausência de validação da
configuração, sem apontar o desenho em `src/components/Chart`. A exigência de manter o desenho
idêntico ao publicado com quatro quadrantes e o ponteiro para a ADR 0001 permanecem.

### TC-32 (recomendado) — a skill de ADR nomeia o módulo novo do gráfico

1. Abra `.agents/skills/registros-de-decisao-arquitetural/SKILL.md`.
2. No gatilho *Geometria do gráfico*, leia a lista de arquivos de `src/components/Chart/` e a lista
   de branches da reescrita.
3. No terminal, rode `ls docs/adr/`.

**Esperado:** a lista de arquivos inclui `blips.ts`, e a lista de branches acompanha as unidades já
entregues e esta. O passo 3 mostra que nenhuma ADR nova foi criada: a decisão desta unidade está
coberta pela ADR 0001, que segue valendo.

## Portão de qualidade

### TC-33 (obrigatório) — checagem de tipos

1. No terminal, na raiz do repositório, rode `yarn ts:check`.

**Esperado:** o comando termina com código 0, sem nenhum erro reportado.

### TC-34 (obrigatório) — lint

1. No terminal, na raiz do repositório, rode `yarn lint`.

**Esperado:** o comando termina com código 0, sem erro e sem aviso novo.

### TC-35 (obrigatório) — suíte de testes

1. No terminal, na raiz do repositório, rode `yarn test`.
2. Compare o resumo final com o estado conhecido da base, descrito nas pré-condições.

**Esperado:** `src/components/Chart/geometry.test.tsx` passa inteira, com os casos novos de
`blipPosition` e de `radiusToPixels` somados aos 55 já existentes, e
`src/components/Chart/blips.test.tsx` passa inteira. `src/date.test.tsx` e
`src/components/Item/Item.test.tsx` continuam falhando pela transformação de ESM já existente na
base; nenhuma suíte que passava antes entra em falha.

### TC-36 (obrigatório) — procedência na mensagem do commit

1. No terminal, na raiz do repositório, rode `git log -1`.
2. Leia a mensagem do commit da unidade.

**Esperado:** a mensagem cita a procedência do algoritmo — o `Positioner` em `scripts/positioner.ts`
da branch `v5` de `AOEpeople/aoe_technology_radar`, introduzido no PR #502, sob Apache-2.0 e com a
mesma origem deste fork.

### TC-37 (recomendado) — nenhuma chave de configuração ou de build muda

1. No terminal, na raiz do repositório, rode `git diff HEAD~1 --stat -- .env public/config.json`.

**Esperado:** o comando não devolve nenhuma diferença. `REACT_APP_BUILDHASH` continua em `"1.2"`,
trocado pela unidade que fez o slot de tela governar o desenho, e a unidade não acrescenta nem altera
chave servida ao navegador.
