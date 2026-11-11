# Casos de teste: validação multi-quadrante e aceite ponta a ponta

Catálogo derivado de [`spec.md`](./spec.md) e [`plan.md`](./plan.md), agrupado pelas cinco histórias de
usuário da spec, seguido do aceite manual (E2E), da documentação autoritativa e do portão de
qualidade. A unidade é transversal: o desenho montado travado pelo teste de integração pertence a
**Visualização do Radar** e a **Taxonomia de Quadrantes e Anéis**; a navegação para um quadrante novo
toca **Navegação e Descoberta de Tecnologias** e **Catálogo de Opiniões Tecnológicas**; o procedimento
documentado toca **Governança de Contribuição do Radar**; e o identificador de build e a trava de
`validateConfig` no deploy tocam **Publicação e Distribuição do Radar**.

Esta unidade registra um aceite manual (E2E) sem dependência de automação de navegador: a História 4
é executada à mão no navegador e o resultado de cada passo fica anotado aqui, na coluna de resultado
do próprio caso, no momento da execução.

## Pré-condições

- Repositório clonado na branch desta unidade, com as dependências instaladas (`yarn install`).
- Terminal aberto na raiz do repositório. Em ambiente sem o `yarn` instalado, cada comando tem o
  equivalente direto pelo Node: `node node_modules/typescript/bin/tsc --noEmit`,
  `node node_modules/eslint/bin/eslint.js "src/**/*.tsx"`,
  `CI=true node node_modules/react-scripts/bin/react-scripts.js test --watchAll=false`,
  `node node_modules/react-scripts/bin/react-scripts.js build` e
  `node node_modules/react-scripts/bin/react-scripts.js start`.
- Chave `jest` com `transformIgnorePatterns` já presente no `package.json`, liberando `d3`, os `d3-*`
  e suas dependências ESM (`internmap`, `delaunator`, `robust-predicates`) e `query-string` com as
  dependências dele (`decode-uri-component`, `split-on-first`, `filter-obj`), preservando o padrão de
  CSS modules.
- Arquivos novos ou alterados desta unidade: `package.json` (chave `jest`);
  `src/components/RadarGrid/RadarGrid.test.tsx` (integração multi-N); o teste de navegação sobre
  `Router`; `src/components/QuadrantGrid/testData.tsx` (fixturas de 3 e 6 quadrantes, e itens do
  quadrante novo); `src/date.test.tsx` (`import "./i18n";`); e `CONTRIBUTING.md`.
- `public/config.json` versionado, com quatro quadrantes (`languages-and-frameworks`,
  `methods-and-patterns`, `platforms-and-operations`, `tools`), quatro anéis (`adopt`, `trial`,
  `assess`, `hold`) e quatro entradas de `chartConfig.ringsAttributes` com raios crescentes.
- Aplicação servida por `yarn start` em `localhost:3000`, com inspetor de elementos e console do
  navegador abertos; o idioma é trocado pelas bandeiras do cabeçalho.
- As configurações de teste com 3, 5, 6 e 7 quadrantes e o slug sem tradução em `es` são usadas apenas
  em memória pelas suítes (fixturas de `QuadrantGrid/testData.tsx` ou cópia do objeto importado) ou
  como edição local descartável de `public/config.json` e dos dicionários, desfeita com `git restore`
  ao fim. Nada disso entra no commit.

## História 1 — teste de integração multi-N

### TC-1 (obrigatório) — paths de arco por N e uma forma de brilho por quadrante

1. No terminal, na raiz do repositório, rode
   `CI=true npx react-scripts test --watchAll=false src/components/RadarGrid/RadarGrid.test.tsx`.

**Esperado:** para N = 3, 4, 5 e 6, a partir das fixturas de `QuadrantGrid/testData.tsx`, o SVG do
`RadarGrid` renderizado tem `N × (quantidade de anéis)` paths de arco de anel e uma forma de brilho de
fundo por quadrante (um `glowElement` por `QuadrantRings`). A suíte roda até o fim, sem
`SyntaxError: Cannot use import statement outside a module`.

### TC-2 (obrigatório) — nenhuma coordenada inválida no SVG

1. Rode `CI=true npx react-scripts test --watchAll=false src/components/RadarGrid/RadarGrid.test.tsx`.

**Esperado:** para cada N (3, 4, 5, 6), nenhum atributo `d`, `points`, `cx`, `cy`, `x` ou `y` do SVG
contém `NaN` nem `undefined`.

### TC-3 (obrigatório) — número de blips igual ao de itens válidos (R9)

1. Rode `CI=true npx react-scripts test --watchAll=false src/components/RadarGrid/RadarGrid.test.tsx`.

**Esperado:** a quantidade de blips renderizados no SVG é igual à quantidade de itens da fixtura com
`ring` e `quadrant` existentes na configuração; nenhum item válido fica de fora.

### TC-4 (obrigatório) — cada blip dentro do setor do seu quadrante pelo ângulo renderizado (R1)

1. Rode `CI=true npx react-scripts test --watchAll=false src/components/RadarGrid/RadarGrid.test.tsx`.

**Esperado:** para cada blip, o ângulo medido a partir das coordenadas renderizadas do SVG (em pixels
de tela, convenção 0° = 12 horas no sentido horário) cai dentro do setor do quadrante do item. A
medição parte das coordenadas renderizadas, não da função de geometria, de modo que um espelhamento
vertical pelo `yScale` seria flagrado.

### TC-5 (obrigatório) — um bloco de rótulo por quadrante com classe de slot e data-quadrants

1. Rode `CI=true npx react-scripts test --watchAll=false src/components/RadarGrid/RadarGrid.test.tsx`.

**Esperado:** para cada N, há um bloco `QuadrantLabel` por quadrante, cada um com a classe
`quadrant-label--slot-N` correspondente ao seu slot, e a `div.radar-grid` carrega `data-quadrants`
igual à quantidade de quadrantes declarada.

### TC-6 (obrigatório) — dois rótulos por anel

1. Rode `CI=true npx react-scripts test --watchAll=false src/components/RadarGrid/RadarGrid.test.tsx`.

**Esperado:** para cada N, há dois rótulos de anel (`RingLabel`) por anel da configuração — o do lado
direito e o do lado esquerdo.

### TC-7 (obrigatório) — N = 4 com o config real: cada cor no setor de hoje

1. Rode `CI=true npx react-scripts test --watchAll=false src/components/RadarGrid/RadarGrid.test.tsx`.

**Esperado:** passa o caso que renderiza o `RadarGrid` com o `public/config.json` real (quatro
quadrantes) e confere que a cor de cada quadrante aparece no setor que ele ocupa hoje.

## História 2 — teste de navegação para um quadrante novo

### TC-8 (obrigatório) — a rota do quadrante novo abre a página dele

1. Rode o teste de navegação:
   `CI=true npx react-scripts test --watchAll=false` sobre a suíte de navegação do `Router`.

**Esperado:** com a fixtura de 5 quadrantes e um item do quadrante novo, montando o `Router` em
`MemoryRouter` na rota do quadrante novo, a página daquele quadrante é renderizada com o item listado.

### TC-9 (obrigatório) — a página de item do quadrante novo abre

1. Rode a suíte de navegação do `Router`.

**Esperado:** montando o `Router` na rota do item do quadrante novo, a página do item é renderizada com
o conteúdo do item. A viewport padrão do jsdom é 1024 (< 1200), então a versão móvel (`PageItemMobile`)
é a renderizada, salvo quando o teste ajusta `window.innerWidth` para a versão larga.

### TC-10 (obrigatório) — a busca encontra o item do quadrante novo

1. Rode a suíte de navegação do `Router`.

**Esperado:** com um termo de busca que casa com o item do quadrante novo, o item aparece no resultado
da busca.

### TC-11 (obrigatório) — a visão geral lista o item do quadrante novo

1. Rode a suíte de navegação do `Router`.

**Esperado:** na visão geral, o item do quadrante novo aparece listado.

### TC-12 (obrigatório) — os três idiomas, sem chave crua de tradução

1. Rode a suíte de navegação do `Router`.

**Esperado:** as telas de TC-8 a TC-11, exercitadas nos três idiomas (alternados por
`i18n.changeLanguage`), não exibem nenhuma chave crua de tradução (`quadrants.<slug>`,
`pageHelp...`) na tela.

## História 3 — a suíte destravada

### TC-13 (obrigatório) — Item.test.tsx passa sem ser editado

1. Rode `CI=true npx react-scripts test --watchAll=false src/components/Item/Item.test.tsx`.

**Esperado:** a suíte passa. Com a chave `jest` ajustada, `query-string` é transformado e o arquivo
carrega sem `SyntaxError: Cannot use import statement outside a module`. O arquivo de teste não foi
editado por esta unidade.

### TC-14 (obrigatório) — date.test.tsx passa com o conserto

1. Rode `CI=true npx react-scripts test --watchAll=false src/date.test.tsx`.

**Esperado:** os dois casos de `formatRelease` passam (`"January 2022"` e `"05.01.2022"`). Com
`import "./i18n";` no topo do teste, o i18next é inicializado e `i18n.language` fica definido, de modo
que `moment(...).locale(i18n.language).format(...)` formata corretamente em vez de cair no getter de
locale. `src/date.ts` não é alterado.

### TC-15 (obrigatório) — suíte inteira verde, sem regressão

1. Rode `yarn test`.

**Esperado:** a suíte inteira passa, incluindo `Item.test.tsx`, `date.test.tsx`, a suíte de
integração `RadarGrid.test.tsx`, a suíte de navegação e as suítes já existentes. Nenhuma suíte que
passava antes do ajuste da chave `jest` entra em falha por causa da transformação de ESM.

## História 4 — aceite manual (E2E)

### TC-16 (obrigatório) — N = 4 equivalente ao site publicado, nos três idiomas e três larguras

1. Com o `public/config.json` versionado (quatro quadrantes), suba a aplicação com `yarn start` e abra
   `localhost:3000`.
2. Em cada largura de janela ~800px, ~1000px e 1200px, e em português, inglês e espanhol (trocando
   pelo cabeçalho), compare a home local com `techradar.db1.com.br` por captura de tela.
3. Anote o resultado de cada combinação (idioma × largura) neste caso.

**Esperado:** as cores, os cantos, a numeração "QUADRANTE N", a legenda e a grade de quadrantes são
iguais às do site publicado. Os blips mudam de lugar a cada carga (R5), então a conferência deles é por
quadrante e anel, não por posição.

### TC-17 (obrigatório) — N = 3, 5 e 6 com configuração de teste local

1. Numa edição local e não commitada, configure `public/config.json` com 3 quadrantes (slot `order`
   contíguo de 1 a 3, `position` sem repetição), acrescentando as entradas `quadrants.<slug>` e
   `pageHelp.quadrants.<slug>` nos três dicionários e itens correspondentes em
   `public/db1-opinion.json`.
2. Suba a aplicação com `yarn start`, abra `localhost:3000` e confira a home nos três idiomas.
3. Repita o passo 1 e 2 para 5 e para 6 quadrantes, um de cada vez.
4. Desfaça o estado local com `git restore public/config.json public/db1-opinion.json src/i18n/translations/*.json`.
5. Anote o resultado de cada N (3, 5, 6) neste caso.

**Esperado:** em cada N, os arcos e o brilho de fundo são desenhados sem fio sem cor (R3, conferir
principalmente em N = 3, em que a corda do brilho é tangente); os blocos de rótulo não sobrepõem o
círculo nem a legenda; os rótulos de anel aparecem (com N ímpar podem encostar em blips — limitação
cosmética conhecida R10); e as rotas, a busca, a página de item e os três idiomas funcionam.

### TC-18 (obrigatório) — configuração inválida mostra a tela de erro da US7

1. Numa edição local, acrescente um sétimo quadrante de teste nos dois mapas de `public/config.json` e
   remova a tradução em espanhol de um slug em `src/i18n/translations/es.json`.
2. Suba a aplicação com `yarn start`, abra `localhost:3000` e leia a tela.
3. Desfaça o estado local com `git restore public/config.json src/i18n/translations/es.json`.

**Esperado:** aparece a tela de erro legível entregue na US7, com uma mensagem correspondente ao sétimo
quadrante (teto de seis ultrapassado) e ao slug sem tradução em `es`, no lugar do radar.

### TC-19 (obrigatório) — o aceite manual não entra no commit

1. Depois de TC-16, TC-17 e TC-18, rode `git status --porcelain`.

**Esperado:** nem `public/config.json`, nem `public/db1-opinion.json`, nem os dicionários de
`src/i18n/translations/` aparecem como alterados; nenhum quadrante de teste entra no commit da unidade.

## História 5 — o procedimento documentado

### TC-20 (obrigatório) — a seção "Adding or reordering a quadrant" no CONTRIBUTING.md

1. Abra `CONTRIBUTING.md` e leia a seção "Adding or reordering a quadrant".

**Esperado:** a seção, em inglês, descreve: o slug em `quadrants` (nome) e em `quadrantsMap` (`colour`,
`txtColour`, `position` = número de "QUADRANT N", `order` = fatia da tela de 1 a N no sentido horário a
partir das 12h, contígua e sem repetição); as entradas `quadrants.<slug>` e `pageHelp.quadrants.<slug>`
com `name` e `description` nos três dicionários; os itens em `public/db1-opinion.json` com o slug do
quadrante, entrando no anel `assess`; subir `REACT_APP_BUILDHASH` no `.env`; rodar os testes, com a nota
de que `src/validateConfig.test.ts` também roda no deploy; que reordenar é mudar só `order`; os limites
de 1 a 6 quadrantes, com o teto vindo da tabela de lugares em
`src/components/RadarGrid/radar-grid.scss` e, para 7 ou mais, a necessidade de acrescentar casos a ela
(R7); que a posição dos blips é sorteada a cada carga (R5); e que com N ímpar os rótulos de anel podem
encostar em blips (R10); afirmando que nada disso exige alterar `.tsx` ou `.scss`.

### TC-21 (obrigatório) — o link do fork corrigido

1. Abra `CONTRIBUTING.md` e leia o passo 1 de "Sending a Pull Request".

**Esperado:** o link do fork aponta para `https://github.com/db1group/db1-tech-radar`.

## Documentação autoritativa

### TC-22 (obrigatório) — a skill de testes registra a transformação de ESM

1. Abra `.agents/skills/estrategia-de-testes/SKILL.md` e leia *Como montar o teste de componente* e
   *Restrições e armadilhas conhecidas*.

**Esperado:** a seção descreve a chave `jest` com `transformIgnorePatterns` no `package.json`; `d3`, os
`d3-*` e `query-string` são descritos como transformados, de modo que `RadarChart`, `RadarGrid` e `App`
são renderizáveis pela suíte e `Item.test.tsx` passa; o `jest.mock("../Link/Link")` é descrito como
isolamento, não como necessidade. As armadilhas da viewport móvel do jsdom e da formatação de data por
idioma permanecem.

### TC-23 (obrigatório) — a skill do gráfico registra o teste multi-N como trava

1. Abra `.agents/skills/componente-grafico-do-radar/SKILL.md` e leia *Testes do componente*.

**Esperado:** a seção descreve o desenho montado como testável via `transformIgnorePatterns` e registra
o teste de integração multi-N (`RadarGrid.test.tsx`) como trava do desenho para N = 3/4/5/6, ao lado
das travas de retrocompatibilidade de `geometry.test.tsx` e `QuadrantLabel.test.tsx`.

### TC-24 (obrigatório) — a skill da taxonomia aponta o CONTRIBUTING.md e o teste multi-N

1. Abra `.agents/skills/taxonomia-de-quadrantes-e-aneis/SKILL.md` e leia *Fluxos e ciclo de vida >
   Acrescentar um quadrante*.

**Esperado:** o passo a passo aponta o procedimento público detalhado no `CONTRIBUTING.md` (seção
"Adding or reordering a quadrant") e registra o teste de integração multi-N como trava automatizada de
que o desenho acompanha a quantidade de quadrantes declarada.

## Portão de qualidade

### TC-25 (obrigatório) — checagem de tipos

1. No terminal, na raiz do repositório, rode `yarn ts:check`.

**Esperado:** o comando termina com código 0, sem nenhum erro reportado.

### TC-26 (obrigatório) — lint sem avisos

1. No terminal, na raiz do repositório, rode `CI=true yarn lint`.

**Esperado:** o comando termina com código 0, sem erro e sem nenhum aviso do ESLint — a condição em que
o build do GitHub Actions roda, onde aviso é tratado como erro.

### TC-27 (obrigatório) — build de produção

1. No terminal, na raiz do repositório, rode `yarn build`.

**Esperado:** o comando termina com código 0 e gera o pacote em `build/`, sem erro de compilação.

### TC-28 (obrigatório) — nenhum .tsx/.scss de produção alterado e dados sem quadrante de teste

1. No terminal, rode `git diff --name-only main...HEAD` (ou `git status --porcelain` ao fim da unidade).

**Esperado:** nenhum arquivo `.tsx` ou `.scss` de produção aparece alterado — as mudanças se limitam a
`package.json`, aos arquivos de teste (`*.test.tsx`), à fixtura `QuadrantGrid/testData.tsx` e ao
`CONTRIBUTING.md` —, e `public/config.json`, `public/db1-opinion.json` e os dicionários ficam como
versionados. Se o aceite tiver encontrado um defeito de produção, a exceção e a correção estão
descritas em [`spec.md`](./spec.md).
