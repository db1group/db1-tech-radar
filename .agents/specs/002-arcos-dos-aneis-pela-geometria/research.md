# Research: arcos dos anéis pela geometria dinâmica

Contexto, alternativas e evidência das decisões registradas no [`plan.md`](./plan.md).

## Convenção angular que o gerador de arcos consome

**Contexto.** A definição única de `src/components/Chart/geometry.ts` trabalha em graus, com 0° =
12 horas e sentido horário. Os arcos são desenhados pelo gerador do `d3`, que recebe ângulos em
radianos. Se as duas convenções não coincidirem, cada arco precisa de um remapeamento antes de
chegar ao gerador.

**Alternativas:**

- **Multiplicar por `DEG_TO_RAD` e entregar direto** — vale se o gerador adota a mesma origem e o
  mesmo sentido.
- **Remapear o ângulo antes de converter** — necessário se o gerador medir a partir do eixo
  horizontal ou no sentido anti-horário.

**Decisão:** multiplicar por `DEG_TO_RAD` e entregar direto, sem remapeamento.

**Evidência:** `node_modules/d3-shape/src/arc.js`, linhas 93 e 94, subtrai `halfPi` dos dois
ângulos recebidos (`a0 = startAngle.apply(...) - halfPi`) antes de projetar com `cos` e `sin`. O
deslocamento de −90° sobre o sistema de coordenadas do SVG, com o eixo vertical crescendo para
baixo, coloca o ângulo 0 no topo do círculo e faz o ângulo crescer no sentido horário — a mesma
convenção de `geometry.ts`.

**Consequências:** a conversão é uma multiplicação, e nenhum componente precisa conhecer a origem
ou o sentido dos ângulos.

## Equivalência dos caminhos dos arcos com a tabela fixa

**Contexto.** O critério de aceite exige que os dezesseis caminhos dos anéis fiquem idênticos aos
do radar publicado. Os ângulos vinham de literais em radianos (`(3 * Math.PI) / 2`, `Math.PI / 2`)
e passam a vir de uma multiplicação em ponto flutuante (`270 * DEG_TO_RAD`). Duas expressões
matematicamente iguais podem produzir bits diferentes e, com eles, caminhos diferentes no último
dígito.

**Alternativas:**

- **Aceitar divergência na última casa decimal** — exigiria comparar os caminhos com tolerância e
  conviver com um `d` diferente do publicado.
- **Confirmar a igualdade exata antes de decidir** — resolve a dúvida com o próprio `d3`
  instalado.

**Decisão:** a comparação dos caminhos é por igualdade exata de texto; nenhuma tolerância é
necessária.

**Evidência:** execução com o `d3-shape` 3.2.0 de `node_modules`, montando os dezesseis caminhos
— quatro quadrantes por quatro anéis, com os raios e espessuras de `public/config.json` — pelos
dois caminhos de cálculo. Os pares de radianos saem estritamente iguais (`===`) nos quatro
quadrantes, e os dezesseis atributos `d` saem idênticos como texto: `total paths 16, differing: 0`.
A igualdade vem de `360 / 4` dar exatamente 90 e de `90`, `180`, `270` e `360` multiplicados por
`Math.PI / 180` caírem nos mesmos bits de `Math.PI / 2`, `Math.PI`, `3 * Math.PI / 2` e
`2 * Math.PI`.

**Consequências:** a conferência manual dos dezesseis `d` é uma comparação de texto, e qualquer
diferença encontrada é defeito, não ruído de ponto flutuante. Para outras quantidades de
segmentos — `360 / 3`, `360 / 7` — a igualdade exata deixa de valer, e por isso a trava sobre
`N` diferente de 4 afirma invariantes, não valores.

## Alcance do `d3` pela suíte de testes

**Contexto.** A skill `estrategia-de-testes` manda exportar a função de geometria alterada e
cobri-la por teste unitário, passando as escalas do `d3`. `arcPath` importa o `d3`, e a suíte do
projeto é a embutida no `react-scripts`.

**Alternativas:**

- **Exportar `arcPath` e cobri-la diretamente** — segue a skill ao pé da letra.
- **Acrescentar uma chave `jest` ao `package.json` com `transformIgnorePatterns` próprio** —
  faria o Babel transformar o `d3` e abriria qualquer componente do gráfico para teste.
- **Cobrir a entrada angular de `arcPath` por uma função pura em `geometry.ts`** — mantém a
  infraestrutura de teste como está.

**Decisão:** a conversão para radianos é função pura em `geometry.ts` e é ela que o teste
exercita; `arcPath` permanece como função de módulo, sem exportação.

**Evidência:** `node_modules/d3/package.json` declara `"type": "module"` com `main` apontando
para `src/index.js`, que é ESM. `node_modules/react-scripts/scripts/utils/createJestConfig.js`,
linha 52, fixa `transformIgnorePatterns` em `[/\\]node_modules[/\\].+\.(js|jsx|mjs|cjs|ts|tsx)$`,
de modo que nada sob `node_modules` é transformado. Um arquivo de teste que alcance o `d3` falha
com `SyntaxError: Unexpected token 'export'` em `node_modules/d3/src/index.js:1`, antes de rodar
qualquer caso — o mesmo modo de falha que `Item.test.tsx` já apresenta com `query-string` e
`date.test.tsx` com `moment`. A segunda alternativa é aceita pelo `react-scripts`
(`transformIgnorePatterns` está na lista de chaves sobrescrevíveis, linha 91 do mesmo arquivo),
mas introduz configuração de Jest onde hoje não existe nenhuma, o que é mudança na infraestrutura
de teste do repositório inteiro e cai no gatilho de ADR de troca de biblioteca estrutural.

**Consequências:** a trava de equivalência afirma sobre os radianos que alimentam o gerador, não
sobre o atributo `d` resultante. A conferência do caminho desenhado continua sendo manual, e a
skill `estrategia-de-testes` passa a descrever esse limite.

## Origem do slot e da quantidade de segmentos

**Contexto.** `arcPath` passa a receber o slot de tela e a quantidade de segmentos. Os dois saem
de `slotOf(quadrant)` e `segmentCount(config)`, e podem ser calculados dentro de
`QuadrantRings.tsx` ou entregues por `RadarChart.tsx` como propriedades.

**Alternativas:**

- **Calcular dentro de `QuadrantRings`** — usa as propriedades que o componente já recebe.
- **Passar por propriedade a partir de `RadarChart`** — calcula uma vez por renderização do
  gráfico, em vez de uma vez por quadrante.

**Decisão:** `QuadrantRings` calcula os dois a partir de `quadrant` e `config`.

**Evidência:** `src/components/Chart/RadarChart.tsx`, linhas 72 a 79, já entrega `quadrant` e
`config` a cada `QuadrantRings`, e `slotOf` lê apenas o quadrante enquanto `segmentCount` lê
apenas a configuração — nenhum dado novo precisa atravessar a fronteira. O custo da segunda
alternativa é o inverso do esperado: `segmentCount` é um `Object.keys().length` sobre um mapa de
no máximo seis entradas, e a economia não paga duas propriedades a mais na assinatura do
componente. As unidades seguintes do brilho de fundo e dos blocos de rótulo precisam do mesmo
slot dentro do próprio componente.

**Consequências:** `RadarChart.tsx` fica intocado por esta unidade. A assinatura de
`QuadrantRings` permanece `{ quadrant, xScale, config }`.

## Identificador de build

**Contexto.** A repartição do círculo passa a depender da chave `order` de `public/config.json`.
Os três arquivos de dados são buscados com `REACT_APP_BUILDHASH` na querystring, e quem já
visitou o site mantém a cópia guardada enquanto esse valor não mudar.

**Alternativas:**

- **Manter `1.1`** — vale enquanto nenhum módulo lê `order`.
- **Trocar o valor** — faz o navegador buscar o `config.json` com `order`.

**Decisão:** `.env` passa a declarar `REACT_APP_BUILDHASH = "1.2"`.

**Evidência:** `src/components/App.tsx`, linha 104, busca `config.json?${REACT_APP_BUILDHASH}`;
`.env` declara `1.1`, o valor que está publicado. Com `slotOf` definido como
`quadrant.order ?? quadrant.position` em `src/components/Chart/geometry.ts`, um `config.json`
guardado sem `order` coloca `languages-and-frameworks` no slot 1 e `methods-and-patterns` no slot
2, rotacionando o radar. A regra 6 da skill `publicacao-e-distribuicao-do-radar` e a consequência
registrada em `docs/adr/0001-geometria-configuravel-do-grafico.md` atribuem a troca à publicação
que leva o dado novo ao ar.

**Consequências:** a primeira visita depois da publicação baixa os três arquivos de dados de novo.
`package.json` fica intocado: a versão do pacote não é lida pela aplicação.

## Conferência local com cinco quadrantes

**Contexto.** A conferência do radar com cinco quadrantes é feita com o `<rect>` de brilho de
fundo removido da cópia local. O brilho não é o único ponto do desenho indexado por `position`, e
qualquer outro que lance exceção derruba a página antes de qualquer arco aparecer.

**Alternativas:** não se aplica — o que a investigação precisa responder é quais pontos do desenho
precisam ser neutralizados para que os arcos fiquem visíveis.

**Decisão:** a conferência acrescenta o quinto quadrante apenas ao mapa de atributos, acrescenta
uma quinta descrição aos três dicionários de tradução e remove o bloco de brilho do componente dos
arcos.

**Evidência:** três pontos do desenho leem tabela de quatro entradas pela posição do quadrante.

- `src/components/Chart/QuadrantRings.tsx`, linhas 71 e 72, leem
  `gradientAttributes[quadrant.position - 1].x` — com `position` 5 o acesso é sobre `undefined` e
  lança `TypeError`.
- `src/components/RadarGrid/RadarGrid.tsx`, linha 41, lê
  `quadrants[quadrantConfig.position - 1].description` sobre a lista `pageHelp.quadrants`, que tem
  quatro entradas nos três dicionários — mesmo `TypeError`, em um componente irmão do gráfico. A
  linha 26 do mesmo arquivo lê `stylesMap[quadrantConfig.position - 1]` e entrega `undefined` ao
  atributo `style`, que o React aceita sem erro.
- `src/components/Chart/BlipPoints.tsx`, linha 39, lê `[1, 4, 2, 3][blip.quadrantPosition - 1]` e
  produz `NaN` nas coordenadas, sem lançar exceção — e só para item classificado no quadrante de
  teste, que o acervo não tem.

As listagens por quadrante percorrem `config.quadrants`
(`src/components/QuadrantGrid/QuadrantGrid.tsx`), e não `quadrantsMap`: declarar o quadrante de
teste apenas no mapa de atributos o mantém fora delas. O rótulo traduzido ausente aparece como a
chave crua, sem erro.

**Consequências:** a conferência toca quatro arquivos, todos restaurados a partir do commit depois
dela. O que ela demonstra é a repartição do círculo em cinco setores de 72°; o brilho de fundo, os
blocos de rótulo e os pontos continuam presos a quatro quadrantes até as unidades que os migram.
