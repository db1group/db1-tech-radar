# Casos de teste: brilho de fundo por máscara compartilhada

Catálogo derivado de [`spec.md`](./spec.md) e [`plan.md`](./plan.md), agrupado pelas quatro
histórias de usuário da spec. Todos os casos pertencem ao domínio **Visualização do Radar**, o
único atravessado por esta unidade.

## Pré-condições

- Repositório clonado na branch desta unidade, com as dependências instaladas (`yarn install`) e
  Node 16.
- Terminal aberto na raiz do repositório. Em ambiente sem o `yarn` instalado, cada comando tem o
  equivalente direto pelo Node: `node node_modules/typescript/bin/tsc --noEmit`,
  `node node_modules/eslint/bin/eslint.js "src/**/*.tsx"`,
  `CI=true node node_modules/react-scripts/bin/react-scripts.js test --watchAll=false` e
  `node node_modules/react-scripts/bin/react-scripts.js start`.
- Estado conhecido da base para comparação: `yarn ts:check` e `yarn lint` terminam limpos, e
  `yarn test` acusa 4 suítes — 2 passando e 2 falhando — com 42 testes, 40 passando e 2 falhando.
  Passam `src/components/Chart/geometry.test.tsx`, com 37 casos, e `src/sanitize.test.tsx`, com 3.
  Falham `src/date.test.tsx`, nos dois casos de `formatRelease`, por transformação de ESM de
  `moment`, e `src/components/Item/Item.test.tsx`, que nem carrega, com
  `SyntaxError: Cannot use import statement outside a module`, por `query-string`.
- Navegador de desktop, com a janela em pelo menos 800 px de largura; abaixo disso o conjunto da
  visualização fica oculto e a página inicial mostra só as listagens.
- Captura de tela da página inicial de `https://techradar.db1.com.br/`, tirada antes da alteração,
  guardada para comparação.
- Valores vigentes de `public/config.json` usados nas afirmações numéricas: `chartConfig.size` igual
  a 800, portanto centro do diagrama em 400 px e círculo do radar de raio 400 px.

## História 1 — o brilho deriva da definição única de geometria

### TC-1 (obrigatório) — a tabela de canto e o degradê por quadrante não existem mais

1. No terminal, na raiz do repositório, rode `grep -rn "gradientAttributes\|gradientId" src/`.
2. Rode `grep -rn "radialGradient" src/`.
3. Abra `src/components/Chart/QuadrantRings.tsx` e rode
   `grep -n "position" src/components/Chart/QuadrantRings.tsx`.

**Esperado:** o passo 1 não devolve nenhuma ocorrência. O passo 2 devolve uma única ocorrência, em
`src/components/Chart/RadarChart.tsx`, com o identificador `glow-gradient`. O passo 3 mostra apenas
`ringPosition`, o índice do anel; o componente não lê `quadrant.position` nem indexa nada por ela.

### TC-2 (obrigatório) — a forma do brilho vem do módulo de geometria

1. Abra `src/components/Chart/QuadrantRings.tsx` e leia o bloco de imports e o corpo do componente.

**Esperado:** o componente importa `glowShape`, `segmentCount` e `slotOf` de `./geometry`, monta a
forma com `glowShape(slotOf(quadrant), segmentCount(config), config.chartConfig.size)` e traduz o
`kind` devolvido em `<circle>`, `<rect>` ou `<polygon>`, com `fill` igual a `quadrant.colour` e
`mask="url(#glow-mask)"`. Nenhuma repartição do círculo é escrita no componente.

### TC-3 (obrigatório) — o brilho fica dentro do grupo recortado pelo círculo

1. Abra `src/components/Chart/QuadrantRings.tsx` e leia o JSX devolvido pelo componente.

**Esperado:** a forma do brilho está dentro de um `<g mask="url(#radar-mask)">`, e esse grupo
aparece antes dos `<path>` dos anéis, de modo que os arcos são desenhados por cima do brilho.

### TC-4 (obrigatório) — as definições globais existem uma vez no SVG

1. Abra `src/components/Chart/RadarChart.tsx` e leia o bloco `<defs>` dentro do `<svg>`.

**Esperado:** o bloco traz três definições. `mask` de identificador `radar-mask`, com
`maskUnits="userSpaceOnUse"`, `x` 0, `y` 0, `width` e `height` iguais a `config.chartConfig.size`,
contendo um `<rect>` de `fill="black"` cobrindo o quadrado e um `<circle>` de `fill="white"` em
`(centro, centro)` com raio igual ao centro. `radialGradient` de identificador `glow-gradient`, sem
atributos de posição, com parada de branco e `stopOpacity` 0,5 em 0% e parada de branco e
`stopOpacity` 0 em 100%. `mask` de identificador `glow-mask`, com a mesma região, contendo um
`<circle>` em `(centro, centro)` com raio igual ao centro, pintado por `url(#glow-gradient)`.

### TC-5 (obrigatório) — nenhuma fórmula trigonométrica fora do módulo de geometria

1. No terminal, na raiz do repositório, rode
   `grep -n "Math.cos\|Math.sin\|DEG_TO_RAD" src/components/Chart/QuadrantRings.tsx src/components/Chart/RadarChart.tsx`.
2. Rode `grep -n "Math.cos\|Math.sin\|DEG_TO_RAD" src/components/Chart/geometry.ts`.

**Esperado:** o passo 1 não devolve nenhuma ocorrência. O passo 2 mostra a conversão de polar para
cartesiano vivendo em `geometry.ts`.

### TC-6 (obrigatório) — o raio dos vértices é o lado do diagrama

1. Abra `src/components/Chart/geometry.ts` e leia `polarToCartesian` e `glowShape`.
2. Rode `grep -n "d3" src/components/Chart/geometry.ts`.

**Esperado:** `glowShape` calcula o centro como `size / 2` e passa `size` — o dobro do centro — como
raio nas duas chamadas de `polarToCartesian` que produzem as pontas do setor. `polarToCartesian`
recebe o centro como número, aplica `DEG_TO_RAD` sobre `angleInDegrees - 90` e devolve `Point` em
pixels de tela. O passo 2 não devolve nenhuma ocorrência: o módulo não importa `d3`.

### TC-7 (obrigatório) — a conversão aponta para cima em 0°

1. No terminal, na raiz do repositório, rode `yarn test`.
2. Na saída, localize a suíte `src/components/Chart/geometry.test.tsx` e leia os casos de
   `polarToCartesian`.

**Esperado:** os casos passam afirmando, com `toBeCloseTo`, que para um centro `c` e um raio `r` o
ângulo 0° devolve `x` igual a `c` e `y` igual a `c - r`, 90° devolve `x` igual a `c + r` e `y` igual
a `c`, 180° devolve `x` igual a `c` e `y` igual a `c + r`, e 270° devolve `x` igual a `c - r` e `y`
igual a `c`.

### TC-8 (recomendado) — a escala invertida não alcança o brilho

1. No terminal, na raiz do repositório, rode `grep -n "yScale" src/components/Chart/QuadrantRings.tsx`.
2. Abra `src/components/Chart/QuadrantRings.tsx` e leia as propriedades que o componente recebe.

**Esperado:** o passo 1 não devolve nenhuma ocorrência, e o componente continua recebendo apenas
`quadrant`, `xScale` e `config`. O centro usado pelo brilho vem de `config.chartConfig.size / 2`.

### TC-9 (obrigatório) — o bloco dos arcos fica como está

1. No terminal, na raiz do repositório, rode `git diff -- src/components/Chart/QuadrantRings.tsx`.

**Esperado:** o diff troca o bloco de brilho de fundo; `arcPath`, o bloco do `d3.arc` com
`innerRadius`, `outerRadius` e o raio por anel vindos de `ringsAttributes` e da escala, e a
translação dos `<path>` por `size / 2` permanecem com as mesmas expressões.

## História 2 — o radar publicado permanece idêntico

### TC-10 (obrigatório) — cada quadrante no seu quadrante de tela

1. No terminal, na raiz do repositório, rode `yarn test`.
2. Na saída, localize a suíte `src/components/Chart/geometry.test.tsx` e leia os casos de
   `glowShape` sobre o `public/config.json` do repositório.

**Esperado:** os casos passam afirmando, para os quatro quadrantes publicados, de que lado do centro
cai cada ponta do polígono — `methods-and-patterns` com a primeira ponta no topo (`x` igual ao
centro por `toBeCloseTo`, `y` menor que o centro) e a segunda à direita (`x` maior que o centro, `y`
igual ao centro); `tools` à direita e abaixo; `platforms-and-operations` abaixo e à esquerda; e
`languages-and-frameworks` à esquerda e no topo.

### TC-11 (obrigatório) — a trava acusa o radar espelhado ou rotacionado

1. Abra `public/config.json` e troque os valores de `order` entre `tools` e
   `platforms-and-operations`, de 2 e 3 para 3 e 2.
2. No terminal, na raiz do repositório, rode `yarn test`.
3. Leia o resultado da suíte `src/components/Chart/geometry.test.tsx`.
4. Desfaça a alteração com `git checkout -- public/config.json` e rode `yarn test` de novo.

**Esperado:** no passo 3 a suíte falha, acusando que as pontas de `tools` e de
`platforms-and-operations` caem no quadrante de tela errado; no passo 4 ela volta a passar inteira.
A falha prova que a trava lê o arquivo do repositório, e não uma cópia de fixture.

### TC-12 (obrigatório) — a suíte de geometria não alcança o `d3`

1. Abra `src/components/Chart/geometry.ts` e `src/components/Chart/geometry.test.tsx` e leia os
   blocos de imports.
2. No terminal, na raiz do repositório, rode `yarn test`.
3. Na saída, compare o resultado da suíte `src/components/Chart/geometry.test.tsx` com o de
   `src/components/Item/Item.test.tsx`.

**Esperado:** nenhum dos dois arquivos importa `d3`, direta ou indiretamente, e a suíte de geometria
é reportada como passada, sem a mensagem `Cannot use import statement outside a module` que aparece
na outra.

### TC-13 (obrigatório) — diagrama idêntico ao radar publicado

1. No terminal, na raiz do repositório, rode `yarn start` e aguarde a aplicação subir.
2. No navegador, abra `http://localhost:3000/`.
3. Compare a página inicial com a captura de tela de `https://techradar.db1.com.br/` guardada nas
   pré-condições, conferindo os quatro setores.

**Esperado:** cada setor tem a mesma cor, o mesmo degradê do centro para a borda e nenhuma cor fora
do círculo. A divergência aceita é de um pixel no quadrante superior esquerdo, onde o `<rect>`
publicado começa em `x` igual a 1 e carrega o degradê deslocado na mesma medida.

### TC-14 (obrigatório) — a meia opacidade vem só da máscara

1. No terminal, na raiz do repositório, rode `yarn start` e abra `http://localhost:3000/`.
2. Abra as ferramentas de desenvolvedor, aba de elementos, e localize dentro de um grupo
   `.quadrant-ring` a forma do brilho, filha do `<g mask="url(#radar-mask)">`.
3. Leia os atributos e o estilo computado dessa forma.

**Esperado:** a forma traz `fill` igual à cor do quadrante e `mask="url(#glow-mask)"`, sem atributo
nem estilo de opacidade. A meia opacidade do brilho vem da parada inicial de `glow-gradient`, branco
com `stopOpacity` 0,5.

### TC-15 (recomendado) — nada de cor fora do círculo

1. No terminal, na raiz do repositório, rode `yarn start` e abra `http://localhost:3000/`.
2. Amplie a página e observe os quatro cantos do quadrado que contém o diagrama, fora do círculo.

**Esperado:** os quatro cantos não mostram cor de quadrante nenhuma: o recorte de `radar-mask` para
o brilho na borda do círculo.

## História 3 — cinco quadrantes sem lacuna nem sobreposição

### TC-16 (obrigatório) — polígonos válidos e corda cobrindo o arco

1. No terminal, na raiz do repositório, rode `yarn test`.
2. Na saída, localize a suíte `src/components/Chart/geometry.test.tsx` e leia os casos de
   `glowShape` para `N` em {3, 5, 6}.

**Esperado:** para cada `N`, os casos passam afirmando que os três vértices de cada slot de 1 a `N`
têm coordenadas finitas e que a distância do centro do diagrama à corda que liga as duas pontas é
maior ou igual ao raio do círculo. Para `N` igual a 3 a distância é exatamente o raio do círculo,
comparada com `toBeCloseTo`: a corda tangencia o círculo, sem folga.

### TC-17 (obrigatório) — cinco setores de 72° na página

1. Com a unidade já commitada, abra `public/config.json` e acrescente uma quinta entrada a
   `quadrantsMap`, com `position` 5, `order` 5 e cor própria, sem declarar o slug no mapa
   `quadrants`.
2. Abra `src/i18n/translations/pt.json`, `en.json` e `es.json` e acrescente uma quinta entrada à
   lista `pageHelp.quadrants` de cada um.
3. No terminal, rode `yarn start`, abra `http://localhost:3000/` e observe o diagrama; mantenha o
   console das ferramentas de desenvolvedor aberto.

**Esperado:** a página inicial renderiza, nenhum `TypeError` aparece no console, e o brilho de fundo
mostra cinco setores de 72° cobrindo o círculo inteiro — sem faixa sem cor entre dois setores e sem
sobreposição de cores na fronteira entre eles.

### TC-18 (obrigatório) — três quadrantes sem fio sem cor no meio do arco

1. Com o estado local do TC-17 aplicado, reduza `quadrantsMap` em `public/config.json` a três
   entradas, com `order` 1, 2 e 3, e deixe três entradas em `pageHelp.quadrants` nos três
   dicionários.
2. No terminal, rode `yarn start`, abra `http://localhost:3000/` e amplie a borda do círculo no meio
   de cada um dos três arcos de 120°.

**Esperado:** o brilho alcança a borda do círculo ao longo dos 120° inteiros de cada setor; nenhum
fio sem cor aparece no meio do arco, que é onde a corda do polígono passa mais perto do centro.

### TC-19 (recomendado) — o restante do desenho segue preso a quatro posições

1. Com o estado local do TC-17 reaplicado — cinco quadrantes —, observe o diagrama e a área ao redor
   dele em `http://localhost:3000/`.

**Esperado:** o quinto quadrante aparece com brilho de fundo e com os arcos dos anéis desenhados no
seu setor, enquanto os seus pontos aparecem errados ou ausentes, o seu bloco de rótulo não é
posicionado em um canto e o seu rótulo é exibido como a chave crua de tradução.

### TC-20 (obrigatório) — o estado de conferência não entra no commit

1. No terminal, na raiz do repositório, rode
   `git restore public/config.json src/i18n/translations/pt.json src/i18n/translations/en.json src/i18n/translations/es.json`.
2. Rode `git status --short`.
3. Rode `git show --stat HEAD`.

**Esperado:** o passo 2 não lista nenhum dos quatro arquivos como modificado, e o passo 3 mostra o
commit da unidade sem o quadrante de teste e sem as entradas extras de tradução.

## História 4 — os extremos do intervalo suportado

### TC-21 (obrigatório) — uma fatia vira círculo

1. No terminal, na raiz do repositório, rode `yarn test`.
2. Na saída, localize a suíte `src/components/Chart/geometry.test.tsx` e leia o caso de `glowShape`
   para `N` igual a 1.

**Esperado:** o caso passa afirmando que a forma devolvida é `kind` `circle`, com `cx` e `cy` no
centro do diagrama e `r` igual ao centro — 400, 400 e 400 para o lado 800.

### TC-22 (obrigatório) — duas fatias viram metades opostas

1. No terminal, na raiz do repositório, rode `yarn test`.
2. Na saída, localize a suíte `src/components/Chart/geometry.test.tsx` e leia os casos de
   `glowShape` para `N` igual a 2.

**Esperado:** os casos passam afirmando que a forma devolvida é `kind` `rect` nos dois slots, com
`y` 0, largura igual ao centro e altura igual ao lado do diagrama; o slot 1 tem `x` igual ao centro
— a metade direita — e o slot 2 tem `x` igual a 0 — a metade esquerda.

## Documentação autoritativa

Os casos abaixo cobrem o desvio deliberado registrado na seção de impacto do
[`plan.md`](./plan.md).

### TC-23 (obrigatório) — a skill do domínio descreve o brilho por máscara

1. Abra `.agents/skills/visualizacao-do-radar/SKILL.md`.
2. Leia a regra 8, a regra 16 e, em *Restrições e validações*, a restrição sobre posições de
   quadrante.

**Esperado:** a regra 8 descreve o fundo do setor como forma sólida na cor do quadrante, recortada
pelo círculo do radar e por um degradê único do diagrama, de meia opacidade no centro a
transparência total na borda, na fatia do slot de tela. A regra 16 registra que os arcos e o brilho
de fundo acompanham a quantidade de quadrantes declarada, com o deslocamento angular dos pontos e os
blocos de rótulo presos a quatro posições. A restrição diz que duas posições iguais sobrepõem dois
blocos de rótulo no mesmo canto e que é o slot repetido que desenha dois setores sobre a mesma área.

### TC-24 (obrigatório) — a skill de testes nomeia o conteúdo do módulo de geometria

1. Abra `.agents/skills/estrategia-de-testes/SKILL.md`.
2. Leia a descrição do que vive em `src/components/Chart/geometry.ts` e a armadilha sobre
   quadrantes fixos.

**Esperado:** a descrição inclui a conversão de polar para cartesiano em pixels de tela e a forma do
brilho de cada setor. A armadilha nomeia o vetor de deslocamento de `BlipPoints.tsx` como a tabela
indexada por posição que resta, com os arcos e o brilho de fundo tirando o setor de `geometry.ts`.

### TC-25 (obrigatório) — o mapa funcional acompanha a repartição do círculo

1. Abra `.agents/maps/functional-map.md`.
2. Leia as regras inferidas e as dependências técnicas do domínio Visualização do Radar.

**Esperado:** a regra sobre geometria diz que a repartição do círculo acompanha a quantidade de
quadrantes declarada e que o sorteio dos pontos — com a sua ordem anti-horária e a tradução
embutida entre posição de negócio e posição geométrica — e os blocos de rótulo continuam presos a
quatro posições. A dependência técnica que cita o andamento da reescrita nomeia a branch
`feat/us3-glow-mask`.

## Portão de qualidade

### TC-26 (obrigatório) — checagem de tipos

1. No terminal, na raiz do repositório, rode `yarn ts:check`.

**Esperado:** o comando termina com código 0, sem nenhum erro reportado.

### TC-27 (obrigatório) — lint

1. No terminal, na raiz do repositório, rode `yarn lint`.

**Esperado:** o comando termina com código 0, sem erro e sem aviso novo.

### TC-28 (obrigatório) — suíte de testes

1. No terminal, na raiz do repositório, rode `yarn test`.
2. Compare o resumo final com o estado conhecido da base, descrito nas pré-condições.

**Esperado:** a suíte `src/components/Chart/geometry.test.tsx` passa inteira, com os casos novos de
`polarToCartesian` e de `glowShape` somados aos 37 já existentes; `src/date.test.tsx` e
`src/components/Item/Item.test.tsx` continuam falhando pela transformação de ESM já existente na
base; nenhuma suíte que passava antes entra em falha.

### TC-29 (obrigatório) — procedência na mensagem do commit

1. No terminal, na raiz do repositório, rode `git log -1`.
2. Leia a mensagem do commit da unidade.

**Esperado:** a mensagem cita a procedência da técnica — a função `renderGlow` em
`src/components/Radar/Chart.tsx` da branch `v5` de `AOEpeople/aoe_technology_radar`, introduzida no
PR #502, sob Apache-2.0 e com a mesma origem deste fork.
