# Casos de teste: geometria única do radar e trava de retrocompatibilidade

Catálogo derivado de [`spec.md`](./spec.md) e [`plan.md`](./plan.md), agrupado pelas histórias
de usuário da spec. Os casos cobrem os dois domínios atravessados pela unidade: **Taxonomia de
Quadrantes e Anéis**, no contrato de quadrante de `public/config.json` e de `QuadrantConfig`
(histórias 2 e 3), e **Visualização do Radar**, na geometria e na limpeza do diagrama
(histórias 1, 3 e 4).

## Pré-condições

- Repositório clonado na branch desta unidade, com as dependências instaladas
  (`yarn install`) e Node 16.
- Terminal aberto na raiz do repositório. Em ambiente sem o `yarn` instalado, cada comando tem
  o equivalente direto pelo Node: `node node_modules/typescript/bin/tsc --noEmit`,
  `node node_modules/eslint/bin/eslint.js "src/**/*.tsx"` e
  `CI=true node node_modules/react-scripts/bin/react-scripts.js test --watchAll=false`.
- Estado conhecido da base para comparação: `yarn ts:check` e `yarn lint` terminam limpos, e
  `yarn test` acusa 3 suítes, com `Item.test.tsx` e `date.test.tsx` falhando por transformação
  de ESM de `query-string` e de `moment`.
- Navegador de desktop, com a janela em pelo menos 800 px de largura — abaixo disso o conjunto
  da visualização fica oculto e a página inicial mostra só as listagens.
- Captura de tela da página inicial de `https://techradar.db1.com.br/`, tirada antes da
  alteração, guardada para comparação.

## História 1 — definição única da convenção angular

### TC-1 (obrigatório) — setores contíguos, sem sobreposição, somando 360°

1. No terminal, na raiz do repositório, rode `yarn test`.
2. Na saída, localize a suíte `src/components/Chart/geometry.test.tsx`.
3. Leia o resultado dos casos que avaliam `segmentAngles` para N = 3, 4, 5 e 6.

**Esperado:** para cada N, os casos passam afirmando que o `endAngle` de cada setor é igual ao
`startAngle` do setor seguinte, que nenhum par de setores se sobrepõe, que o primeiro setor
começa em 0, que o último termina em 360 e que a soma dos `angleIncrement` dos N setores é
exatamente 360.

### TC-2 (obrigatório) — primeiro setor e incremento por quantidade de segmentos

1. No terminal, na raiz do repositório, rode `yarn test`.
2. Na saída, localize a suíte `src/components/Chart/geometry.test.tsx`.
3. Leia o resultado do caso que avalia `segmentAngles(1, N)`.

**Esperado:** o caso passa afirmando `startAngle` 0, `endAngle` 360/N e `angleIncrement` 360/N.

### TC-3 (obrigatório) — `slotOf` usa `order` quando declarado

1. No terminal, na raiz do repositório, rode `yarn test`.
2. Na saída, localize a suíte `src/components/Chart/geometry.test.tsx`.
3. Leia o resultado do caso que avalia `slotOf` sobre um quadrante com `order` declarado.

**Esperado:** o caso passa afirmando que o valor devolvido é o `order` do quadrante.

### TC-4 (obrigatório) — `slotOf` cai para `position` sem `order`

1. No terminal, na raiz do repositório, rode `yarn test`.
2. Na saída, localize a suíte `src/components/Chart/geometry.test.tsx`.
3. Leia o resultado do caso que avalia `slotOf` sobre um quadrante sem `order`.

**Esperado:** o caso passa afirmando que o valor devolvido é o `position` do quadrante.

### TC-5 (obrigatório) — `segmentCount` conta as chaves de `quadrantsMap`

1. No terminal, na raiz do repositório, rode `yarn test`.
2. Na saída, localize a suíte `src/components/Chart/geometry.test.tsx`.
3. Leia o resultado do caso que avalia `segmentCount` sobre uma configuração com M quadrantes.

**Esperado:** o caso passa afirmando que o valor devolvido é M, o número de entradas de
`quadrantsMap`.

### TC-6 (obrigatório) — a suíte de geometria roda sem erro de transformação de ESM

1. Abra `src/components/Chart/geometry.ts` e leia o bloco de imports.
2. No terminal, na raiz do repositório, rode `yarn test`.
3. Na saída, compare o resultado da suíte `src/components/Chart/geometry.test.tsx` com o das
   suítes `Item.test.tsx` e `date.test.tsx`.

**Esperado:** o módulo não importa React nem `d3`, e a suíte de geometria é reportada como
passada, sem a mensagem `Cannot use import statement outside a module` que aparece nas outras
duas.

### TC-7 (recomendado) — `DEG_TO_RAD` converte graus em radianos

1. No terminal, na raiz do repositório, rode `yarn test`.
2. Na saída, localize a suíte `src/components/Chart/geometry.test.tsx`.
3. Leia o resultado do caso que avalia `DEG_TO_RAD`.

**Esperado:** o caso passa afirmando que multiplicar um valor em graus por `DEG_TO_RAD` produz
o mesmo valor em radianos que o gerador de arcos consome, na convenção 0° = 12 horas, sentido
horário.

## História 2 — slot de tela separado do número exibido

### TC-8 (obrigatório) — os quatro pares de `position` e `order` na configuração

1. Abra `public/config.json`.
2. Leia as quatro entradas de `quadrantsMap`.

**Esperado:** `methods-and-patterns` tem `position` 2 e `order` 1; `tools` tem `position` 4 e
`order` 2; `platforms-and-operations` tem `position` 3 e `order` 3;
`languages-and-frameworks` tem `position` 1 e `order` 4.

### TC-9 (obrigatório) — os `order` formam 1 a N, contíguos e sem repetição

1. No terminal, na raiz do repositório, rode `yarn test`.
2. Na saída, localize a suíte `src/components/Chart/geometry.test.tsx`.
3. Leia o resultado do caso que verifica os valores de `order` do `public/config.json`.

**Esperado:** o caso passa afirmando que os `order` cobrem a sequência de 1 até o número de
entradas de `quadrantsMap`, sem buraco e sem repetição.

### TC-10 (obrigatório) — `QuadrantConfig` aceita quadrante com e sem `order`

1. No terminal, na raiz do repositório, rode `yarn ts:check`.

**Esperado:** o comando termina com código 0, com `order` declarado como opcional em
`QuadrantConfig` e com as entradas de `public/config.json` — que declaram `order` — e as
fixtures de teste sem o campo aceitas pelo mesmo tipo.

### TC-11 (obrigatório) — nenhum outro atributo de quadrante alterado

1. No terminal, na raiz do repositório, rode `git diff -- public/config.json`.

**Esperado:** o diff mostra apenas a inclusão da chave `order` em cada entrada de
`quadrantsMap`; `position`, `colour`, `txtColour` e `description` de todos os quadrantes
permanecem com os mesmos valores, e as demais chaves do arquivo ficam intactas.

## História 3 — trava de retrocompatibilidade

### TC-12 (obrigatório) — cada quadrante na mesma faixa angular de hoje

1. No terminal, na raiz do repositório, rode `yarn test`.
2. Na saída, localize a suíte `src/components/Chart/geometry.test.tsx`.
3. Leia o resultado do caso que combina `slotOf`, `segmentCount` e `segmentAngles` sobre o
   `public/config.json` do repositório.

**Esperado:** o caso passa afirmando `methods-and-patterns` em 0°–90°, `tools` em 90°–180°,
`platforms-and-operations` em 180°–270° e `languages-and-frameworks` em 270°–360°.

### TC-13 (obrigatório) — a trava acusa divergência no arquivo real

1. Abra `public/config.json` e troque o `order` de `tools` de 2 para 3.
2. No terminal, na raiz do repositório, rode `yarn test`.
3. Leia o resultado da suíte `src/components/Chart/geometry.test.tsx`.
4. Desfaça a alteração com `git checkout -- public/config.json` e rode `yarn test` de novo.

**Esperado:** no passo 3 a suíte falha, acusando tanto a faixa angular divergente quanto a
repetição no conjunto de `order`; no passo 4 ela volta a passar inteira. A falha prova que a
trava lê o arquivo publicado, e não uma cópia de fixture.

### TC-14 (obrigatório) — radar idêntico ao publicado

1. No terminal, na raiz do repositório, rode `yarn start` e aguarde a aplicação subir.
2. No navegador, abra `http://localhost:3000/`.
3. Compare a página inicial com a captura de tela de `https://techradar.db1.com.br/` guardada
   nas pré-condições, conferindo os quatro setores.

**Esperado:** o diagrama é idêntico — mesmas cores nos mesmos setores, mesmos arcos de anel,
mesmos rótulos de anel dos dois lados do centro e o bloco de cada canto com a mesma numeração
"QUADRANTE N" sobre o mesmo quadrante.

## História 4 — limpeza do desenho

### TC-15 (obrigatório) — `Axes.tsx` ausente e sem referências

1. No terminal, na raiz do repositório, rode `ls src/components/Chart/`.
2. Rode `grep -rn "Axes\|XAxis\|YAxis" src/`.

**Esperado:** `Axes.tsx` não aparece na listagem e a busca não devolve nenhuma ocorrência em
`src/`.

### TC-16 (obrigatório) — SVG sem os grupos de eixo

1. No terminal, na raiz do repositório, rode `yarn start` e aguarde a aplicação subir.
2. No navegador, abra `http://localhost:3000/`.
3. Abra as ferramentas de desenvolvedor, inspecione o `<svg>` do gráfico e percorra os seus
   filhos diretos.

**Esperado:** o SVG não contém `g.x-axis` nem `g.y-axis`, e nenhum grupo vazio ocupa o lugar
deles; os filhos diretos são os grupos de setor de cada quadrante, os rótulos de anel e o grupo
dos pontos.

### TC-17 (obrigatório) — console do navegador limpo

1. No terminal, na raiz do repositório, rode `yarn start` e aguarde a aplicação subir.
2. No navegador, abra as ferramentas de desenvolvedor na aba de console e limpe o que estiver
   registrado.
3. Abra `http://localhost:3000/` e recarregue a página.

**Esperado:** nenhuma entrada escrita pelo componente do gráfico aparece no console — em
particular, nenhum objeto de quadrante é registrado a cada renderização.

## História 5 — registro da decisão

### TC-18 (obrigatório) — ADR presente e no formato do padrão

1. Abra `docs/adr/0001-geometria-configuravel-do-grafico.md`.
2. Leia o cabeçalho e a sequência de seções.

**Esperado:** o documento está em português do Brasil, com `Status: Aceita`, a data do registro
e o campo **Domínio afetado** nomeando "Taxonomia de Quadrantes e Anéis" e "Visualização do
Radar", seguido das seções Contexto, Decisão, Consequências e Alternativas consideradas, nessa
ordem.

### TC-19 (obrigatório) — alternativas descartadas com o motivo

1. Abra `docs/adr/0001-geometria-configuravel-do-grafico.md`.
2. Leia a seção Alternativas consideradas.

**Esperado:** a seção cita a adoção integral da v5 do projeto de origem, o Porsche Digital
Technology Radar, as bibliotecas genéricas de gráfico e a fixação em cinco quadrantes, cada uma
com o motivo concreto do descarte.

### TC-20 (obrigatório) — a decisão registra a procedência

1. Abra `docs/adr/0001-geometria-configuravel-do-grafico.md`.
2. Leia a seção Decisão.

**Esperado:** a seção registra a portabilidade do algoritmo da branch `v5` de
`AOEpeople/aoe_technology_radar`, citando o PR #502, a licença Apache-2.0 e a origem comum com
este fork.

## Portão de qualidade

### TC-21 (obrigatório) — checagem de tipos

1. No terminal, na raiz do repositório, rode `yarn ts:check`.

**Esperado:** o comando termina com código 0, sem nenhum erro reportado.

### TC-22 (obrigatório) — lint alcançando o novo arquivo de teste

1. No terminal, na raiz do repositório, rode `yarn lint`.
2. Rode `node node_modules/eslint/bin/eslint.js "src/**/*.tsx" --format json` e procure
   `geometry.test.tsx` na lista de arquivos percorridos.

**Esperado:** `yarn lint` termina com código 0, e `src/components/Chart/geometry.test.tsx`
aparece entre os arquivos percorridos pelo ESLint.

### TC-23 (obrigatório) — suíte de testes

1. No terminal, na raiz do repositório, rode `yarn test`.
2. Compare o resumo final com o estado conhecido da base, descrito nas pré-condições.

**Esperado:** a suíte `src/components/Chart/geometry.test.tsx` passa inteira; `Item.test.tsx` e
`date.test.tsx` continuam falhando pela transformação de ESM já existente na base; nenhuma
suíte que passava antes entra em falha.

### TC-24 (obrigatório) — procedência na mensagem do commit

1. No terminal, na raiz do repositório, rode `git log -1`.
2. Leia a mensagem do commit da unidade.

**Esperado:** a mensagem cita a procedência do algoritmo — a branch `v5` de
`AOEpeople/aoe_technology_radar`, sob Apache-2.0 e com a mesma origem deste fork.
