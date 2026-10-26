# Casos de teste: arcos dos anéis pela geometria dinâmica

Catálogo derivado de [`spec.md`](./spec.md) e [`plan.md`](./plan.md), agrupado pelas histórias de
usuário da spec. Os casos cobrem os dois domínios atravessados pela unidade: **Visualização do
Radar**, na origem angular dos arcos e na equivalência do desenho (histórias 1, 2, 3 e 4), e
**Publicação e Distribuição do Radar**, na chegada da configuração ao navegador (história 5).

## Pré-condições

- Repositório clonado na branch desta unidade, com as dependências instaladas (`yarn install`) e
  Node 16.
- Terminal aberto na raiz do repositório. Em ambiente sem o `yarn` instalado, cada comando tem o
  equivalente direto pelo Node: `node node_modules/typescript/bin/tsc --noEmit`,
  `node node_modules/eslint/bin/eslint.js "src/**/*.tsx"`,
  `CI=true node node_modules/react-scripts/bin/react-scripts.js test --watchAll=false` e
  `node node_modules/react-scripts/bin/react-scripts.js start`.
- Estado conhecido da base para comparação: `yarn ts:check` e `yarn lint` terminam limpos, e
  `yarn test` acusa 4 suítes — 2 passando e 2 falhando, `Item.test.tsx` por `query-string` e
  `date.test.tsx` por `moment`, ambas por transformação de ESM — com 30 testes passando.
- Navegador de desktop, com a janela em pelo menos 800 px de largura; abaixo disso o conjunto da
  visualização fica oculto e a página inicial mostra só as listagens.
- Captura de tela da página inicial de `https://techradar.db1.com.br/`, tirada antes da alteração,
  guardada para comparação.
- Lista dos dezesseis atributos `d` dos arcos, coletada antes da alteração no console do
  navegador sobre a página inicial, com
  `Array.from(document.querySelectorAll(".quadrant-ring path")).map((p) => p.getAttribute("d"))`,
  e guardada para comparação.

## História 1 — arcos pela definição única

### TC-1 (obrigatório) — a tabela fixa de ângulos não existe mais

1. No terminal, na raiz do repositório, rode `grep -rn "arcAngel" src/`.
2. Abra `src/components/Chart/QuadrantRings.tsx` e leia o corpo de `arcPath`.

**Esperado:** a busca não devolve nenhuma ocorrência em `src/`, e `arcPath` não indexa nenhuma
estrutura por `position`.

### TC-2 (obrigatório) — os ângulos do arco vêm da geometria compartilhada

1. Abra `src/components/Chart/QuadrantRings.tsx` e leia o bloco de imports, o corpo do componente
   e o corpo de `arcPath`.

**Esperado:** o componente importa `segmentCount`, `segmentRadians` e `slotOf` de `./geometry`,
calcula `slotOf(quadrant)` e `segmentCount(config)` a partir das propriedades que recebe, e
`arcPath` — com a assinatura `(slot, numSegments, ringPosition, xScale, config)` — tira
`startAngle` e `endAngle` de `segmentRadians`, entregando-os ao gerador de arcos sem
remapeamento.

### TC-3 (obrigatório) — nenhuma fórmula angular fora do módulo de geometria

1. No terminal, na raiz do repositório, rode
   `grep -n "360\|Math.PI\|DEG_TO_RAD" src/components/Chart/QuadrantRings.tsx src/components/Chart/RadarChart.tsx`.
2. Rode `grep -n "360\|DEG_TO_RAD" src/components/Chart/geometry.ts`.

**Esperado:** o passo 1 não devolve nenhuma ocorrência: a repartição do círculo não é reescrita
nos componentes. O passo 2 mostra a fórmula e a conversão vivendo em `geometry.ts`.

### TC-4 (obrigatório) — o bloco do gerador de arcos fica como está

1. No terminal, na raiz do repositório, rode
   `git diff -- src/components/Chart/QuadrantRings.tsx`.

**Esperado:** o diff altera a origem dos ângulos e a assinatura de `arcPath`; `innerRadius`,
`outerRadius` e o cálculo do raio do anel a partir de `ringsAttributes` e da escala permanecem
com as mesmas expressões.

## História 2 — trava de equivalência dos arcos

### TC-5 (obrigatório) — cada quadrante na mesma faixa de radianos de hoje

1. No terminal, na raiz do repositório, rode `yarn test`.
2. Na saída, localize a suíte `src/components/Chart/geometry.test.tsx`.
3. Leia o resultado dos casos de `segmentRadians` sobre o `public/config.json` do repositório.

**Esperado:** os casos passam afirmando, com `toBeCloseTo` de precisão 10, que
`languages-and-frameworks` cai em `[3π/2, 2π]`, `methods-and-patterns` em `[0, π/2]`,
`platforms-and-operations` em `[π, 3π/2]` e `tools` em `[π/2, π]`.

### TC-6 (obrigatório) — a trava acusa o radar rotacionado

1. Abra `public/config.json` e troque o `order` de `tools` de 2 para 3.
2. No terminal, na raiz do repositório, rode `yarn test`.
3. Leia o resultado da suíte `src/components/Chart/geometry.test.tsx`.
4. Desfaça a alteração com `git checkout -- public/config.json` e rode `yarn test` de novo.

**Esperado:** no passo 3 a suíte falha, acusando a faixa de radianos divergente de `tools`; no
passo 4 ela volta a passar inteira. A falha prova que a trava lê o arquivo do repositório, e não
uma cópia de fixture.

### TC-7 (obrigatório) — pares de radianos válidos para três, cinco e seis segmentos

1. No terminal, na raiz do repositório, rode `yarn test`.
2. Na saída, localize a suíte `src/components/Chart/geometry.test.tsx`.
3. Leia o resultado dos casos de `segmentRadians` para N = 3, 5 e 6.

**Esperado:** para cada N, os casos passam afirmando que cada slot de 1 a N produz dois ângulos
finitos, com o final maior que o inicial, e que os N setores somam 2π.

### TC-8 (obrigatório) — a suíte de geometria não alcança o `d3`

1. Abra `src/components/Chart/geometry.ts` e `src/components/Chart/geometry.test.tsx` e leia os
   blocos de imports.
2. No terminal, na raiz do repositório, rode `yarn test`.
3. Na saída, compare o resultado da suíte `src/components/Chart/geometry.test.tsx` com o das
   suítes `Item.test.tsx` e `date.test.tsx`.

**Esperado:** nenhum dos dois arquivos importa `d3`, direta ou indiretamente, e a suíte de
geometria é reportada como passada, sem a mensagem `Cannot use import statement outside a module`
que aparece nas outras duas.

## História 3 — equivalência visual com o radar publicado

### TC-9 (obrigatório) — os dezesseis caminhos idênticos

1. No terminal, na raiz do repositório, rode `yarn start` e aguarde a aplicação subir.
2. No navegador, abra `http://localhost:3000/`.
3. Abra as ferramentas de desenvolvedor na aba de console e rode
   `Array.from(document.querySelectorAll(".quadrant-ring path")).map((p) => p.getAttribute("d"))`.
4. Compare a lista devolvida, item a item, com a lista guardada nas pré-condições.

**Esperado:** as duas listas têm dezesseis entradas — quatro quadrantes por quatro anéis — e cada
atributo `d` é igual como texto ao da lista guardada.

### TC-10 (obrigatório) — diagrama idêntico ao radar publicado

1. No terminal, na raiz do repositório, rode `yarn start` e aguarde a aplicação subir.
2. No navegador, abra `http://localhost:3000/`.
3. Compare a página inicial com a captura de tela de `https://techradar.db1.com.br/` guardada nas
   pré-condições, conferindo os quatro setores.

**Esperado:** o diagrama é idêntico — mesmas cores nos mesmos setores, mesmos arcos de anel e
mesmos rótulos de anel dos dois lados do centro.

## História 4 — radar com cinco quadrantes

### TC-11 (obrigatório) — cinco setores de 72°, sem exceção

1. Com a unidade já commitada, abra `public/config.json` e acrescente uma quinta entrada a
   `quadrantsMap`, com `position` 5, `order` 5 e cor própria, sem declarar o slug no mapa
   `quadrants`.
2. Abra `src/i18n/translations/pt.json`, `en.json` e `es.json` e acrescente uma quinta entrada à
   lista `pageHelp.quadrants` de cada um.
3. Abra `src/components/Chart/QuadrantRings.tsx` e remova o bloco de brilho de fundo: a constante
   `gradientAttributes`, o `gradientId`, o `<defs>` e o `<rect>`.
4. No terminal, rode `yarn start`, abra `http://localhost:3000/` e observe o diagrama; mantenha o
   console das ferramentas de desenvolvedor aberto.
5. No console, rode
   `Array.from(document.querySelectorAll(".quadrant-ring path")).map((p) => p.getAttribute("d")).length`.

**Esperado:** a página inicial renderiza, nenhum `TypeError` aparece no console, o diagrama mostra
cinco setores de 72° cobrindo o círculo inteiro, e o passo 5 devolve 20 — cinco quadrantes por
quatro anéis.

### TC-12 (recomendado) — o restante do desenho segue preso a quatro posições

1. Com o estado local do TC-11 ainda aplicado, observe o diagrama e a área ao redor dele em
   `http://localhost:3000/`.

**Esperado:** o quinto quadrante aparece sem brilho de fundo, sem bloco de rótulo posicionado em
um canto e com o rótulo exibido como a chave crua de tradução. Os arcos dos cinco setores
continuam desenhados.

### TC-13 (obrigatório) — o estado de conferência não entra no commit

1. No terminal, na raiz do repositório, rode
   `git restore public/config.json src/i18n/translations/pt.json src/i18n/translations/en.json src/i18n/translations/es.json src/components/Chart/QuadrantRings.tsx`.
2. Rode `git status --short`.
3. Rode `git show --stat HEAD`.

**Esperado:** o passo 2 não lista nenhum dos cinco arquivos como modificado, e o passo 3 mostra o
commit da unidade sem o quadrante de teste, sem as entradas extras de tradução e com o bloco de
brilho de fundo presente em `QuadrantRings.tsx`.

## História 5 — a configuração alterada chega ao navegador

### TC-14 (obrigatório) — identificador de build diferente do publicado

1. Abra `.env` e leia a linha de `REACT_APP_BUILDHASH`.

**Esperado:** o valor declarado é `"1.2"`, diferente do `"1.1"` que está publicado.

### TC-15 (obrigatório) — a sessão que já visitou o site recebe a configuração nova

1. Depois da publicação, abra `https://techradar.db1.com.br/` em um navegador que já tenha
   visitado o radar antes, sem limpar o cache.
2. Confira os quatro setores do diagrama contra a captura de tela guardada nas pré-condições.

**Esperado:** os quatro quadrantes aparecem nos mesmos setores do radar publicado hoje, com as
mesmas cores nos mesmos lugares.

### TC-16 (recomendado) — configuração sem o slot rotaciona o radar

1. Abra `public/config.json` e remova a chave `order` das quatro entradas de `quadrantsMap`.
2. No terminal, rode `yarn start` e abra `http://localhost:3000/`.
3. Desfaça a alteração com `git checkout -- public/config.json` e recarregue a página.

**Esperado:** no passo 2 o diagrama aparece rotacionado — cada quadrante cai no setor da sua
posição exibida —, o que demonstra o efeito de um `config.json` guardado no navegador sem o slot;
no passo 3 o desenho volta ao publicado.

## História 6 — documentação de apoio

### TC-17 (obrigatório) — o gatilho de ADR nomeia os arquivos do desenho

1. Abra `.agents/skills/registros-de-decisao-arquitetural/SKILL.md`.
2. Leia o gatilho "Geometria do gráfico", em *Quando uma mudança merece ADR*.

**Esperado:** a lista de arquivos de `src/components/Chart/` que compõem o desenho nomeia
`RadarChart.tsx`, `BlipPoints.tsx`, `QuadrantRings.tsx` e `geometry.ts`.

### TC-18 (obrigatório) — o mapa funcional aponta a geometria

1. Abra `.agents/maps/functional-map.md`.
2. Leia a evidência no código do domínio Visualização do Radar.

**Esperado:** `RadarChart.tsx` aparece como escalas e composição do SVG, `geometry.ts` como a
convenção angular única do desenho — graus, 0° = 12 horas, sentido horário — e a linha de arcos e
formas cita `QuadrantRings.tsx` e `BlipShapes.tsx`.

## Portão de qualidade

### TC-19 (obrigatório) — checagem de tipos

1. No terminal, na raiz do repositório, rode `yarn ts:check`.

**Esperado:** o comando termina com código 0, sem nenhum erro reportado.

### TC-20 (obrigatório) — lint

1. No terminal, na raiz do repositório, rode `yarn lint`.

**Esperado:** o comando termina com código 0, sem erro e sem aviso novo.

### TC-21 (obrigatório) — suíte de testes

1. No terminal, na raiz do repositório, rode `yarn test`.
2. Compare o resumo final com o estado conhecido da base, descrito nas pré-condições.

**Esperado:** a suíte `src/components/Chart/geometry.test.tsx` passa inteira, com os casos novos
de `segmentRadians`; `Item.test.tsx` e `date.test.tsx` continuam falhando pela transformação de
ESM já existente na base; nenhuma suíte que passava antes entra em falha.

### TC-22 (obrigatório) — procedência na mensagem do commit

1. No terminal, na raiz do repositório, rode `git log -1`.
2. Leia a mensagem do commit da unidade.

**Esperado:** a mensagem cita a procedência da geometria — a branch `v5` de
`AOEpeople/aoe_technology_radar`, o PR #502, sob Apache-2.0 e com a mesma origem deste fork.
