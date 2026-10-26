# Casos de teste: rótulos de quadrante e grade responsiva independentes de quatro

Catálogo derivado de [`spec.md`](./spec.md) e [`plan.md`](./plan.md), agrupado pelas cinco
histórias de usuário da spec. A unidade atravessa três domínios: **Visualização do Radar**, dono do
bloco de rótulo e da legenda ao redor do diagrama; **Taxonomia de Quadrantes e Anéis**, dona dos
dois números de cada quadrante — a posição exibida e o slot de tela; e **Navegação e Descoberta de
Tecnologias**, dono da grade de listagens por quadrante da página inicial.

## Pré-condições

- Repositório clonado na branch desta unidade, com as dependências instaladas (`yarn install`) e
  Node 16.
- Terminal aberto na raiz do repositório. Em ambiente sem o `yarn` instalado, cada comando tem o
  equivalente direto pelo Node: `node node_modules/typescript/bin/tsc --noEmit`,
  `node node_modules/eslint/bin/eslint.js "src/**/*.tsx"`,
  `CI=true node node_modules/react-scripts/bin/react-scripts.js test --watchAll=false`,
  `node node_modules/react-scripts/bin/react-scripts.js build` e
  `node node_modules/react-scripts/bin/react-scripts.js start`.
- Estado conhecido da base para comparação: `yarn ts:check` e `yarn lint` terminam limpos, e
  `yarn test` acusa 7 suítes — 5 passando e 2 falhando — com 104 testes, 102 passando e 2 falhando.
  Passam `src/components/Chart/blips.test.tsx`, `src/components/Chart/geometry.test.tsx`,
  `src/components/PageHelp/PageHelp.test.tsx`, `src/i18n/translations.test.tsx` e
  `src/sanitize.test.tsx`. Falham `src/date.test.tsx`, por transformação de ESM de `moment`, e
  `src/components/Item/Item.test.tsx`, que nem carrega, com `SyntaxError: Cannot use import
  statement outside a module`, por `query-string`.
- Navegador de desktop com inspetor de elementos. O conjunto da visualização — diagrama, blocos de
  rótulo e legenda — só aparece em janela de 800 px de largura ou mais.
- Aplicação servida por `yarn start` em `localhost:3000`. A página inicial é a raiz; o idioma é
  trocado pelas bandeiras do cabeçalho e a escolha fica guardada no navegador.
- Radar publicado em `techradar.db1.com.br` aberto em outra aba, para a comparação visual nos três
  idiomas.
- Taxonomia versionada em `public/config.json`, com os dois números de cada quadrante:

  | Slug | Posição exibida | Slot de tela | Cor | Setor no diagrama |
  | --- | --- | --- | --- | --- |
  | `methods-and-patterns` | 2 | 1 | `#4867ff` | superior direito |
  | `tools` | 4 | 2 | `#ffc000` | inferior direito |
  | `platforms-and-operations` | 3 | 3 | `#ff2d5e` | inferior esquerdo |
  | `languages-and-frameworks` | 1 | 4 | `#cdcaeb` | superior esquerdo |

- Ponto de quebra da grade de listagens: `$until-lg`, declarado em `src/styles/sccs-vars.scss` como
  61,875em — 990 px com a fonte base de 16 px.
- Configurações de conferência com três, cinco e seis quadrantes: montadas localmente, uma contagem
  por vez, conforme o procedimento do [`plan.md`](./plan.md) — declarar os quadrantes de teste nos
  dois mapas de `public/config.json`, com `position`, `order` contíguo, cor própria e descrição;
  acrescentar `quadrants.<slug>` e `pageHelp.quadrants.<slug>` nos três arquivos de
  `src/i18n/translations/`; marcar alguns itens de `public/db1-opinion.json` com o quadrante novo,
  em destaque. Cada conferência termina com
  `git restore public/config.json public/db1-opinion.json src/i18n/translations/`.

## História 1 — o bloco posicionado pelo slot de tela

### TC-1 (obrigatório) — `stylesMap` e o posicionamento inline saem do componente

1. No terminal, na raiz do repositório, rode
   `grep -rn "stylesMap\|top:\|bottom:\|left:\|right:" src/components/RadarGrid/RadarGrid.tsx src/components/RadarGrid/QuadrantLabel.tsx`.
2. Abra `src/components/RadarGrid/QuadrantLabel.tsx` e leia a montagem da `div` do bloco.

**Esperado:** o passo 1 não encontra `stylesMap` nem nenhuma das quatro propriedades de canto em
`style` inline. O único `style` inline que resta no bloco é o `borderColor` do `<hr>`, com a cor do
quadrante.

### TC-2 (obrigatório) — a classe do bloco vem de `slotOf`

1. Abra `src/components/RadarGrid/QuadrantLabel.tsx` e leia o cálculo da classe.
2. No terminal, rode `grep -n "slotOf\|position" src/components/RadarGrid/QuadrantLabel.tsx`.

**Esperado:** a classe é `quadrant-label--slot-${slotOf(quadrantConfig)}`, com `slotOf` importado de
`src/components/Chart/geometry.ts`. A única leitura de `quadrantConfig.position` que resta é o
número exibido ao lado da palavra traduzida "quadrante"; nenhuma fórmula angular nova é escrita no
componente.

### TC-3 (obrigatório) — a quantidade de quadrantes é publicada no DOM

1. Abra `src/components/RadarGrid/RadarGrid.tsx` e leia a `div.radar-grid`.
2. Suba a aplicação com `yarn start`, abra `localhost:3000` em janela de pelo menos 800 px e
   inspecione o elemento `div.radar-grid`.

**Esperado:** o componente escreve `data-quadrants={segmentCount(config)}`, com `segmentCount`
importado de `src/components/Chart/geometry.ts`. No navegador, com a taxonomia versionada, o
elemento carrega `data-quadrants="4"`.

### TC-4 (obrigatório) — cada slug recebe a classe do seu slot

1. No terminal, na raiz do repositório, rode
   `CI=true npx react-scripts test --watchAll=false src/components/RadarGrid/QuadrantLabel.test.tsx`.

**Esperado:** a suíte passa. O caso que renderiza cada entrada de `quadrantsMap` do
`public/config.json` do repositório — o arquivo real, nunca uma cópia de fixture — afirma que
`methods-and-patterns` carrega `quadrant-label--slot-1`, `tools` carrega `--slot-2`,
`platforms-and-operations` carrega `--slot-3` e `languages-and-frameworks` carrega `--slot-4`.

### TC-5 (obrigatório) — o número exibido continua vindo da posição

1. Rode
   `CI=true npx react-scripts test --watchAll=false src/components/RadarGrid/QuadrantLabel.test.tsx`.
2. Com a aplicação aberta em `localhost:3000` e o idioma em português, leia os quatro blocos de
   rótulo.

**Esperado:** no passo 1 passa o caso que, com o idioma fixado em português, encontra "quadrante 2"
no bloco de `methods-and-patterns`, "quadrante 4" no de `tools`, "quadrante 3" no de
`platforms-and-operations` e "quadrante 1" no de `languages-and-frameworks`. No passo 2 os mesmos
textos aparecem em caixa alta na tela, pelo `text-transform` da folha de estilo.

### TC-6 (obrigatório) — reordenar o desenho move o bloco e preserva o número

1. Em uma cópia local de `public/config.json`, troque os valores de `order` de
   `methods-and-patterns` e de `tools` entre si, mantendo as `position` como estão.
2. Suba a aplicação com `yarn start`, abra `localhost:3000` e inspecione os dois blocos.
3. Desfaça o estado local com `git restore public/config.json`.

**Esperado:** o bloco de `methods-and-patterns` passa a carregar `quadrant-label--slot-2` e aparece
no canto inferior direito, junto do setor que o diagrama desenha para ele; o de `tools` passa a
`--slot-1`, no canto superior direito. Os números exibidos continuam "quadrante 2" e "quadrante 4".

## História 2 — a página inicial publicada permanece

### TC-7 (obrigatório) — os quatro blocos nos mesmos cantos, em português

1. Suba a aplicação com `yarn start` e abra `localhost:3000` em janela de 1200 px de largura.
2. Clique na bandeira do Brasil no cabeçalho.
3. Compare os quatro cantos da área do gráfico com a página inicial de `techradar.db1.com.br` no
   mesmo idioma, aberta lado a lado.

**Esperado:** `methods-and-patterns` ("quadrante 2", "Métodos & Padrões") no canto superior direito;
`tools` ("quadrante 4", "Ferramentas") no inferior direito; `platforms-and-operations` ("quadrante
3", "Plataformas & Operações") no inferior esquerdo; `languages-and-frameworks` ("quadrante 1",
"Linguagens & Frameworks") no superior esquerdo. Cada bloco mantém o atalho de aproximação, o nome e
a descrição que o publicado exibe, e nenhum bloco se sobrepõe ao círculo.

### TC-8 (obrigatório) — os mesmos cantos em inglês e em espanhol

1. Com a aplicação aberta em `localhost:3000` a 1200 px, clique na bandeira do Reino Unido no
   cabeçalho e compare os quatro blocos com o publicado no mesmo idioma.
2. Clique na bandeira da Espanha e repita a comparação.

**Esperado:** nos dois idiomas cada bloco fica no mesmo canto do português e do publicado, com o
texto traduzido daquele idioma. A troca de idioma não move nenhum bloco.

### TC-9 (obrigatório) — a cor da linha divisória de cada bloco

1. Com a aplicação aberta em `localhost:3000`, inspecione o `<hr>` de cada um dos quatro blocos.

**Esperado:** a cor da borda é `#4867ff` no bloco de `methods-and-patterns`, `#ffc000` no de
`tools`, `#ff2d5e` no de `platforms-and-operations` e `#cdcaeb` no de `languages-and-frameworks` —
as mesmas cores declaradas em `quadrantsMap`.

### TC-10 (obrigatório) — a legenda no lugar de sempre

1. Com a aplicação aberta em `localhost:3000` a 1200 px, localize a legenda das três formas de
   ponto.
2. Inspecione o elemento `.radar-legend` e leia as propriedades de posição aplicadas.
3. Compare com a legenda do radar publicado.

**Esperado:** a legenda fica à direita do diagrama, com `right: 0`, `top: 45%` e 15% de largura,
exibindo as três formas com os rótulos traduzidos. Nenhuma regra por contagem incide sobre ela com
quatro quadrantes.

### TC-11 (obrigatório) — as três larguras de janela acima do ponto de quebra

1. Com a aplicação aberta em `localhost:3000`, ajuste a janela para cerca de 800 px de largura e
   percorra a página inicial.
2. Repita em cerca de 1000 px e em 1200 px.
3. Em cada largura, compare o conjunto com o radar publicado na mesma largura.

**Esperado:** nas três larguras o diagrama, os quatro blocos e a legenda ficam nos mesmos lugares do
publicado, sem sobreposição nova entre bloco e círculo, entre bloco e legenda ou entre dois blocos,
e sem barra de rolagem horizontal.

### TC-12 (obrigatório) — a grade de listagens em duas colunas e em uma

1. Com a aplicação aberta em `localhost:3000` a 1200 px, role até as listagens por quadrante abaixo
   do diagrama e conte as colunas.
2. Ajuste a janela para 900 px de largura — abaixo de `$until-lg` — e conte as colunas de novo.
3. Inspecione `.quadrant-grid` nas duas larguras.

**Esperado:** acima de 990 px a grade mostra duas colunas, com cada bloco ocupando 45% da largura e
10% de separação entre as colunas; abaixo de 990 px mostra uma coluna, com os blocos em largura
cheia. O espaço entre as linhas continua vindo do `margin-bottom` de 40 px de cada bloco.

### TC-13 (obrigatório) — a grade nunca abre uma terceira coluna

1. Com a aplicação aberta em `localhost:3000`, varra a largura da janela de 800 px até 1200 px,
   observando as listagens por quadrante.

**Esperado:** em nenhuma largura da faixa a grade mostra três ou mais colunas: ela passa de uma para
duas colunas em 990 px e permanece em duas até 1200 px.

### TC-14 (obrigatório) — abaixo de 800 px o conjunto da visualização fica oculto

1. Com a aplicação aberta em `localhost:3000`, ajuste a janela para cerca de 780 px de largura.
2. Percorra a página inicial.

**Esperado:** o diagrama, os blocos de rótulo e a legenda não são exibidos, e a página inicial
apresenta apenas as listagens por quadrante, em uma coluna.

## História 3 — de um a seis quadrantes

### TC-15 (obrigatório) — três quadrantes

1. Monte a configuração local de três quadrantes conforme as pré-condições.
2. Suba a aplicação com `yarn start`, abra `localhost:3000` a 1200 px e inspecione
   `div.radar-grid`.
3. Observe os três blocos de rótulo e o diagrama.
4. Desfaça o estado local com
   `git restore public/config.json public/db1-opinion.json src/i18n/translations/`.

**Esperado:** o elemento carrega `data-quadrants="3"`. O bloco do slot 1 fica no canto superior
direito, o do slot 2 no inferior direito e o do slot 3 no superior esquerdo, cada um do lado do
setor que o diagrama desenha para ele. Nenhum bloco se sobrepõe ao círculo, à legenda ou a outro
bloco, e a legenda permanece à direita.

### TC-16 (obrigatório) — cinco quadrantes

1. Monte a configuração local de cinco quadrantes conforme as pré-condições.
2. Suba a aplicação com `yarn start`, abra `localhost:3000` a 1200 px e inspecione
   `div.radar-grid`.
3. Observe os cinco blocos de rótulo, o espaço abaixo do diagrama e a legenda.
4. Desfaça o estado local com
   `git restore public/config.json public/db1-opinion.json src/i18n/translations/`.

**Esperado:** o elemento carrega `data-quadrants="5"` e recebe 200 px de espaço interno inferior. O
bloco do slot 1 fica no canto superior direito, o do slot 2 no inferior direito, o do slot 3 no
centro inferior, o do slot 4 no inferior esquerdo e o do slot 5 no superior esquerdo. O bloco
central fica abaixo do círculo, sem tocá-lo, e sem encostar nos blocos dos cantos inferiores. A
legenda permanece à direita, sem sobreposição com nenhum bloco.

### TC-17 (obrigatório) — seis quadrantes

1. Monte a configuração local de seis quadrantes conforme as pré-condições.
2. Suba a aplicação com `yarn start`, abra `localhost:3000` a 1200 px e inspecione
   `div.radar-grid`.
3. Observe os seis blocos de rótulo, o tamanho do diagrama e a legenda.
4. Repita a observação com a janela em cerca de 800 px.
5. Desfaça o estado local com
   `git restore public/config.json public/db1-opinion.json src/i18n/translations/`.

**Esperado:** o elemento carrega `data-quadrants="6"` e recebe 22% de espaço interno em cada lateral
e 10% abaixo; o diagrama ocupa a largura restante. O bloco do slot 1 fica no canto superior direito,
o do slot 2 no meio da lateral direita, o do slot 3 no canto inferior direito, o do slot 4 no
inferior esquerdo, o do slot 5 no meio da lateral esquerda e o do slot 6 no superior esquerdo, cada
um alinhado com o seu setor. Os blocos das laterais ficam fora da caixa do diagrama, sem tocar o
círculo. A legenda aparece inteira no centro inferior, sem sobreposição com nenhum bloco. As duas
larguras de janela preservam esse arranjo.

### TC-18 (obrigatório) — nenhuma regra por contagem incide sobre quatro quadrantes

1. Abra `src/components/RadarGrid/radar-grid.scss` e leia os seletores por `data-quadrants`.
2. No terminal, rode `grep -n "data-quadrants" src/components/RadarGrid/radar-grid.scss`.
3. Rode
   `CI=true npx react-scripts test --watchAll=false src/components/RadarGrid/radar-grid.scss.test.tsx`.

**Esperado:** existem seletores para as contagens 1, 2, 3, 5 e 6, e nenhum para
`[data-quadrants="4"]`: com quatro quadrantes valem apenas as regras de base, que reproduzem o
layout publicado. O caso correspondente da suíte passa.

### TC-19 (obrigatório) — existe regra de lugar para cada slot de 1 a 6

1. Rode
   `CI=true npx react-scripts test --watchAll=false src/components/RadarGrid/radar-grid.scss.test.tsx`.
2. Abra `src/components/RadarGrid/radar-grid.scss` e confira os seletores
   `.quadrant-label--slot-1` a `.quadrant-label--slot-6`.

**Esperado:** a suíte passa, lendo o arquivo com `fs.readFileSync` a partir de `__dirname`, e
confirma que cada slot de 1 a 6 tem regra de lugar — seja pela base, seja por um caso de contagem.

### TC-20 (obrigatório) — as configurações de conferência não entram no commit

1. Depois de rodar TC-15, TC-16 e TC-17, rode `git status --porcelain`.
2. Rode `git show --stat HEAD` e leia a lista de arquivos do commit da unidade.

**Esperado:** o passo 1 não lista `public/config.json`, `public/db1-opinion.json` nem nenhum dos
três dicionários como alterado. O commit da unidade não traz quadrante de teste algum.

## História 4 — a grade de listagens com qualquer quantidade

### TC-21 (obrigatório) — um bloco por quadrante declarado

1. No terminal, na raiz do repositório, rode
   `CI=true npx react-scripts test --watchAll=false src/components/QuadrantGrid/QuadrantGrid.test.tsx`.

**Esperado:** a suíte passa. Com o `ConfigData` de quatro quadrantes da fixture
`src/components/QuadrantGrid/testData.tsx` a grade renderiza quatro blocos; com o de cinco
quadrantes, cinco.

### TC-22 (recomendado) — a ordem dos blocos acompanha a declaração

1. Rode
   `CI=true npx react-scripts test --watchAll=false src/components/QuadrantGrid/QuadrantGrid.test.tsx`.

**Esperado:** passa o caso que afirma que os rótulos aparecem na ordem de declaração de
`config.quadrants`.

### TC-23 (obrigatório) — a folha de estilo da grade não pressupõe quatro blocos

1. Abra `src/components/QuadrantGrid/quadrant-grid.scss`.
2. No terminal, rode `grep -n "45%\|flex\|grid-template-columns\|column-gap" src/components/QuadrantGrid/quadrant-grid.scss`.

**Esperado:** a grade é montada com `display: grid`,
`grid-template-columns: repeat(2, minmax(0, 1fr))` e `column-gap: 10%`, caindo para uma coluna
abaixo de `$until-lg`. Nenhuma regra fixa a largura do bloco em 45% nem depende da quantidade de
blocos.

### TC-24 (obrigatório) — a grade mostra todos os quadrantes nas três contagens

1. Com a configuração local de três quadrantes ativa (TC-15), role a página inicial até as
   listagens por quadrante e conte os blocos.
2. Repita com a configuração de cinco (TC-16) e com a de seis (TC-17), a 1200 px e a 900 px de
   largura.

**Esperado:** em cada contagem a grade mostra um bloco por quadrante declarado — três, cinco e seis
—, sem bloco cortado e sem coluna vazia entre eles. Acima de 990 px os blocos ficam em linhas de
duas colunas; abaixo, em uma coluna.

## História 5 — a trava contra o posicionamento pela posição exibida

### TC-25 (obrigatório) — a suíte prende a escolha ao slot

1. Rode
   `CI=true npx react-scripts test --watchAll=false src/components/RadarGrid/QuadrantLabel.test.tsx`.

**Esperado:** passam os casos que, com um `QuadrantConfig` de `order` 2 e `position` 5, afirmam que
o bloco carrega `quadrant-label--slot-2`, e que, com `order` ausente, afirmam que o bloco carrega a
classe do slot igual à `position` — a recaída de `slotOf`. Uma implementação que escolhesse a classe
pela posição exibida reprova o primeiro desses casos.

### TC-26 (obrigatório) — as suítes novas não alcançam o `d3`

1. Abra `src/components/RadarGrid/QuadrantLabel.test.tsx`,
   `src/components/QuadrantGrid/QuadrantGrid.test.tsx` e
   `src/components/RadarGrid/radar-grid.scss.test.tsx` e leia os blocos de imports.
2. Rode `CI=true npx react-scripts test --watchAll=false src/components/RadarGrid src/components/QuadrantGrid`.

**Esperado:** nenhum dos três arquivos importa `RadarGrid`, `RadarChart` ou qualquer módulo de
`src/components/Chart/` que traga o `d3`; a única importação de `src/components/Chart/` presente é
`geometry.ts`, que não importa `d3`. As suítes rodam até o fim, sem
`SyntaxError: Cannot use import statement outside a module`.

### TC-27 (obrigatório) — o teste de componente contorna o `query-string`

1. Abra `src/components/RadarGrid/QuadrantLabel.test.tsx` e
   `src/components/QuadrantGrid/QuadrantGrid.test.tsx` e leia a substituição do módulo `Link`.
2. Rode
   `CI=true npx react-scripts test --watchAll=false src/components/QuadrantGrid/QuadrantGrid.test.tsx`.

**Esperado:** os dois arquivos declaram `jest.mock("../Link/Link")` com uma fábrica que devolve um
`<a>`, de modo que `src/hooks/use-search-param-state.tsx` e o `query-string` não entram no grafo de
importação. A suíte do passo 2 passa, sem o `SyntaxError` que derruba `Item.test.tsx`.

### TC-28 (obrigatório) — a conferência do SCSS acusa slot sem regra

1. Em uma cópia local de `src/components/RadarGrid/radar-grid.scss`, remova a regra que posiciona o
   bloco do slot 6.
2. Rode
   `CI=true npx react-scripts test --watchAll=false src/components/RadarGrid/radar-grid.scss.test.tsx`.
3. Desfaça o estado local com `git restore src/components/RadarGrid/radar-grid.scss`.

**Esperado:** no passo 2 a suíte falha, nomeando o slot sem regra. É o que impede que um lugar seja
perdido em uma alteração futura da folha de estilo.

## Documentação autoritativa

### TC-29 (obrigatório) — o ADR do lugar pelo slot e do teto de seis

1. Abra o ADR novo em `docs/adr/`, criado por esta unidade.
2. Leia o cabeçalho, as seções *Decisão*, *Consequências* e *Alternativas consideradas*.
3. Abra `docs/adr/0001-geometria-configuravel-do-grafico.md` e leia o seu status.

**Esperado:** o arquivo segue `NNNN-titulo-em-kebab-case.md` com o próximo número livre conferido
contra a `main`, status `Aceita`, data do dia e domínio afetado "Visualização do Radar, Taxonomia de
Quadrantes e Anéis". A decisão registra que o lugar do bloco de rótulo vem do slot de tela e que a
tabela de lugares por contagem fixa o teto de seis quadrantes. As alternativas descartadas incluem
calcular o lugar de cada bloco em tempo de renderização, sem teto, e manter a escolha pela posição
exibida. A ADR 0001 continua `Aceita`, sem substituição.

### TC-30 (obrigatório) — o `AGENTS.md` declara o teto de seis

1. Abra `AGENTS.md` e leia a restrição global sobre a quantidade de quadrantes.

**Esperado:** a restrição declara o teto de seis quadrantes, atribuído à tabela de lugares dos
blocos em `src/components/RadarGrid/radar-grid.scss`, e mantém a ausência de validação da
configuração, a exigência do desenho idêntico ao publicado com quatro quadrantes e os ponteiros para
a ADR 0001 e para o ADR novo.

### TC-31 (obrigatório) — a skill da visualização descreve o lugar pelo slot

1. Abra `.agents/skills/visualizacao-do-radar/SKILL.md`.
2. Leia a *Visão geral do domínio*, as regras 12, 13 e 16, os fluxos *Desenhar o radar* e
   *Acrescentar um quadrante ao desenho* e *Restrições e validações*.

**Esperado:** a regra 12 descreve o bloco do lado do setor do seu quadrante, apontado pelo slot de
tela, com a tabela de lugares por contagem de um a seis, e mantém a posição exibida como o número
que o leitor lê. A regra 13 registra a legenda no centro inferior quando há seis quadrantes. A regra
16 registra o teto de seis e a sua origem na tabela de lugares. A visão geral deixa de descrever o
bloco como "um em cada canto", o passo 6 do fluxo de desenho posiciona um bloco por quadrante, e no
fluxo de acrescentar um quadrante o passo 1 atribui slot e posição com os papéis corretos e o passo
3 cita o teto de seis. Em *Restrições e validações*, a restrição de posições de 1 a 4 trata de
número exibido repetido e entra a restrição do teto de seis.

### TC-32 (obrigatório) — a skill da taxonomia separa posição de slot

1. Abra `.agents/skills/taxonomia-de-quadrantes-e-aneis/SKILL.md`.
2. Leia a regra 4, o fluxo *Acrescentar um quadrante* e *Restrições e validações*.

**Esperado:** a regra 4 descreve a posição como o número exibido e o slot de tela como o que decide
o setor e o lugar do bloco, sem tabela de posição para canto. No fluxo, o passo 3 atribui os dois
números com esses papéis e a observação final cita o teto de seis. Em *Restrições e validações*, a
restrição de posições de 1 a 4 trata de número repetido e a restrição da quantidade de quadrantes
declara o teto de seis com a sua origem.

### TC-33 (obrigatório) — a skill de testes registra o alcance da suíte

1. Abra `.agents/skills/estrategia-de-testes/SKILL.md`.
2. Leia *O que conta como tela alterada* e *Restrições e armadilhas conhecidas*.

**Esperado:** a armadilha do alcance da suíte registra que um componente cujo único import ESM é
`Link` é alcançável substituindo esse módulo no arquivo de teste, enquanto o que importa `d3`
continua fora de alcance. A lista de componentes alcançados inclui `QuadrantLabel` e `QuadrantGrid`.

### TC-34 (obrigatório) — o mapa funcional acompanha os dois números e a branch

1. Abra `.agents/maps/functional-map.md`.
2. Leia as regras inferidas do domínio Taxonomia de Quadrantes e Anéis e do domínio Visualização do
   Radar, e a dependência técnica de registro em ADR.

**Esperado:** a regra inferida da taxonomia distingue o slot de tela, que decide o setor e o lugar
do bloco, da posição exibida. A regra inferida da visualização deixa de registrar os blocos como
peça presa a quatro, e a dependência técnica de registro em ADR inclui `feat/us6-labels-grid` entre
as branches da reescrita.

### TC-35 (recomendado) — a skill de ADR acompanha a branch da unidade

1. Abra `.agents/skills/registros-de-decisao-arquitetural/SKILL.md` e leia o gatilho *Geometria do
   gráfico*.

**Esperado:** a lista de branches da reescrita em andamento inclui a branch desta unidade.

## Portão de qualidade

### TC-36 (obrigatório) — checagem de tipos

1. No terminal, na raiz do repositório, rode `yarn ts:check`.

**Esperado:** o comando termina com código 0, sem nenhum erro reportado.

### TC-37 (obrigatório) — lint sem avisos

1. No terminal, na raiz do repositório, rode `CI=true yarn lint`.

**Esperado:** o comando termina com código 0, sem erro e sem nenhum aviso do ESLint. É a condição em
que o build do GitHub Actions roda, onde aviso é tratado como erro.

### TC-38 (obrigatório) — suíte de testes

1. No terminal, na raiz do repositório, rode `yarn test`.
2. Compare o resumo final com o estado conhecido da base, descrito nas pré-condições.

**Esperado:** `src/components/RadarGrid/QuadrantLabel.test.tsx`,
`src/components/QuadrantGrid/QuadrantGrid.test.tsx` e
`src/components/RadarGrid/radar-grid.scss.test.tsx` passam inteiras, e as cinco suítes que já
passavam continuam passando com a mesma contagem. `src/date.test.tsx` e
`src/components/Item/Item.test.tsx` continuam falhando pela transformação de ESM já existente na
base; nenhuma suíte que passava antes entra em falha.

### TC-39 (obrigatório) — build de produção

1. No terminal, na raiz do repositório, rode `yarn build`.

**Esperado:** o comando termina com código 0 e gera o pacote em `build/`, sem erro de compilação.

### TC-40 (recomendado) — nenhum arquivo servido ao navegador muda

1. No terminal, na raiz do repositório, rode `git diff HEAD~1 --stat -- .env public/`.

**Esperado:** o comando não devolve nenhuma diferença. A unidade altera apenas `.tsx` e `.scss`,
compilados dentro do pacote, de modo que `REACT_APP_BUILDHASH` não precisa ser trocado.
