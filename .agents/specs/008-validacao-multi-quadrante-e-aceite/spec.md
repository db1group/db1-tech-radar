# Spec: validação multi-quadrante e aceite ponta a ponta

## Visão geral

Esta unidade prova, de ponta a ponta, que o radar funciona com 3, 4, 5 e 6 quadrantes entregue nas
US1 a US7 e documenta como adicionar um quadrante: habilita a suíte a renderizar o desenho montado
(ajuste de transformação de ESM no Jest), trava com teste de integração o desenho multi-N e a
navegação para um quadrante novo, registra o aceite manual no `test-cases.md` e acrescenta o
procedimento ao `CONTRIBUTING.md` — sem alterar nenhum arquivo `.tsx` ou `.scss` de produção e sem
introduzir quadrante de teste nos dados publicados.

## Domínios envolvidos

Mudança transversal: não é filha de nenhum domínio. É a última entrega da iniciativa 2125624
(quadrantes configuráveis de 1 a 6), que fecha os critérios de aceite espalhados pelas US1 a US7. Os
domínios afetados, com o impacto em cada um:

| Domínio | Impacto desta unidade | Documentação autoritativa |
| --- | --- | --- |
| Taxonomia de Quadrantes e Anéis | O procedimento de adicionar ou reordenar um quadrante — slug nos dois mapas, `position`, `order`, rótulo e descrição nos três dicionários, itens no acervo — passa a ter documento público (`CONTRIBUTING.md`) e trava automatizada (teste de integração multi-N). A skill registra a referência ao procedimento e o teste como trava. | [`taxonomia-de-quadrantes-e-aneis/SKILL.md`](../../skills/taxonomia-de-quadrantes-e-aneis/SKILL.md) |
| Visualização do Radar | O desenho montado — arcos, brilho de fundo, rótulos de quadrante, rótulos de anel e blips — ganha teste de integração que renderiza `RadarGrid` para N = 3, 4, 5 e 6, travando o que hoje só é conferido à mão. A skill técnica do gráfico registra o teste como trava. | [`componente-grafico-do-radar/SKILL.md`](../../skills/componente-grafico-do-radar/SKILL.md) |
| Navegação e Descoberta de Tecnologias | A rota por quadrante, a busca, a página de item e a visão geral ganham teste de navegação para um quadrante novo, nos três idiomas, com `MemoryRouter`. Nenhuma tela de produção muda. | [`navegacao-e-descoberta-de-tecnologias/SKILL.md`](../../skills/navegacao-e-descoberta-de-tecnologias/SKILL.md) |
| Governança de Contribuição do Radar | O `CONTRIBUTING.md` ganha a seção "Adding or reordering a quadrant" e tem o link do fork corrigido de `db1group/dgs-tech-radar` para `db1group/db1-tech-radar`, alinhando-o ao nome do repositório que a skill já declara. | [`governanca-de-contribuicao-do-radar/SKILL.md`](../../skills/governanca-de-contribuicao-do-radar/SKILL.md) |
| Catálogo de Opiniões Tecnológicas | O procedimento documenta que um item recebe o slug do quadrante e que tecnologia nova entra no anel `assess`; o teste de navegação usa itens do quadrante novo em fixture. O acervo publicado (`public/db1-opinion.json`) não recebe quadrante de teste. | [`catalogo-de-opinioes-tecnologicas/SKILL.md`](../../skills/catalogo-de-opinioes-tecnologicas/SKILL.md) |
| Publicação e Distribuição do Radar | O procedimento documenta subir `REACT_APP_BUILDHASH` no `.env` ao mudar a configuração e que o teste de `src/validateConfig.test.ts` roda no deploy (trava entregue na US7). O portão de qualidade (lint, `tsc`, build) é reafirmado. Nenhum passo do workflow muda. | [`publicacao-e-distribuicao-do-radar/SKILL.md`](../../skills/publicacao-e-distribuicao-do-radar/SKILL.md) |

A convenção de testes com Jest e Testing Library, o que conta como lógica testável e a limitação de
transformação de ESM vêm da skill técnica
[`estrategia-de-testes`](../../skills/estrategia-de-testes/SKILL.md); a mecânica de i18next usada
para verificar os três idiomas vem da skill técnica
[`internacionalizacao-do-radar`](../../skills/internacionalizacao-do-radar/SKILL.md).

Ficou fora da análise, por não ter artefato tocado nem comportamento alterado, o domínio
**Identidade Institucional DB1**: marca, rodapé, canais sociais e `public/messages.json` não
participam da validação multi-N; a comparação de tela do aceite manual observa o rodapé e a marca,
mas nenhum artefato desse domínio muda.

## Escopo

**Dentro:**

- Habilitar a suíte a renderizar o desenho montado (`RadarChart`, `RadarGrid`, `App`), hoje bloqueado
  porque o Jest deste projeto não transforma os pacotes ESM de `node_modules`.
- Teste de integração que renderiza o radar com 3, 4, 5 e 6 quadrantes e trava, para cada N, os
  arcos, o brilho de fundo, os rótulos de quadrante, os rótulos de anel e os blips.
- Teste de navegação para um quadrante novo — rota, página de item, busca e visão geral — nos três
  idiomas, sem chave crua de tradução na tela.
- Aceite manual (E2E) no navegador registrado no `test-cases.md`, com o resultado de cada passo: N = 4
  comparado ao site publicado, N = 3/5/6 com configuração de teste local e o caso de configuração
  inválida.
- Seção "Adding or reordering a quadrant" no `CONTRIBUTING.md`, em inglês, com o passo a passo, os
  limites de 1 a 6 quadrantes e as limitações cosméticas conhecidas; e a correção do link do fork.
- Correção de defeito de produção **somente** se o aceite encontrar um; nesse caso, o defeito e a
  correção ficam descritos nesta spec.

**Fora:**

- Criar o quadrante de IA ou qualquer quadrante real — decisão editorial, trabalho separado.
- Rediscutir os quatro quadrantes atuais.
- Acrescentar Cypress, Playwright ou outra dependência de E2E — o aceite é manual, registrado no
  `test-cases.md`; qualquer dependência nova exige decisão explícita no `plan.md`, justificando o
  custo ao mantenedor.
- Tornar o posicionamento dos blips determinístico (R5), padding angular dependente do raio (R6) e
  corrigir os rótulos de anel com N ímpar (R10) — limitações conhecidas, documentadas, não corrigidas.
- Suportar mais de seis quadrantes (R7) e renomear `quadrant` para `segment`.
- Remover os artefatos não usados de `scripts/` e `dist_scripts/` (R11, decisão `g4` da descoberta).
- Alterar `public/config.json`, `public/db1-opinion.json` ou os dicionários para incluir quadrante de
  teste.

## Fronteira de domínio

**Esta spec implementa:**

- Chave `jest.transformIgnorePatterns` em `package.json` (suportada pelo Create React App) que
  transforma `d3`, os pacotes `d3-*` e suas dependências ESM (`internmap`, `delaunator`,
  `robust-predicates`), além de `query-string` e suas dependências — destravando a renderização de
  `RadarChart`, `RadarGrid` e `App` e o `src/components/Item/Item.test.tsx` sem editá-lo. O padrão
  exato, a decisão sobre `src/date.test.tsx` e a confirmação de que a suíte inteira segue verde ficam
  no [`plan.md`](./plan.md).
- Suíte de integração multi-N (ex.: `src/components/RadarGrid/RadarGrid.test.tsx`) que renderiza
  `RadarGrid` com Testing Library e fixtures de 3, 4, 5 e 6 quadrantes.
- Extensão de `src/components/QuadrantGrid/testData.tsx` com fixtures de 3 e 6 quadrantes (as de 4 e 5
  já existem ali), tipadas por `ConfigData` e `Item[]`; os quadrantes de teste não entram em
  `public/config.json`.
- Suíte de navegação (ex.: sobre `Router` com `MemoryRouter`) com fixture de 5 quadrantes, exercitando
  a rota do quadrante novo, a página de item, a busca e a visão geral nos três idiomas.
- Nova seção "Adding or reordering a quadrant" no `CONTRIBUTING.md` e correção do link do fork no
  passo 1 do arquivo.
- `test-cases.md` desta unidade com o roteiro e o resultado de cada passo do aceite manual.
- Atualizações de documentação listadas na seção de impacto do [`plan.md`](./plan.md).

**Pertence a outras unidades (não vira tarefa aqui):**

- `src/validateConfig.ts` e `src/validateConfig.test.ts` — validação da configuração e tela de erro
  legível entregues na US7; consumidas sem alteração. O aceite manual de configuração inválida apenas
  exercita o que a US7 já entrega.
- `src/components/Chart/geometry.ts` e `src/components/Chart/blips.ts` — lógica pura já coberta por
  teste unitário para N de 1 a 6; consumidas sem alteração.
- `src/components/Chart/RadarChart.tsx`, `QuadrantRings.tsx`, `BlipPoints.tsx`, `BlipShapes.tsx` — SVG
  de produção; renderizados pelo teste, não alterados (salvo defeito encontrado pelo aceite).
- `src/components/RadarGrid/RadarGrid.tsx`, `QuadrantLabel.tsx` e `radar-grid.scss` — produção; a
  tabela de lugares dos blocos de rótulo é a origem do teto de seis, consumida como regra, não
  alterada.
- `public/config.json`, `public/db1-opinion.json` e `src/i18n/translations/{pt,en,es}.json` — dados
  publicados; não recebem quadrante de teste.
- `.env` (`REACT_APP_BUILDHASH`) — esta unidade não altera arquivo servido de `public/`; subir o
  identificador de build é parte do procedimento documentado, não uma alteração desta US.
- `.github/workflows/prod-deploy-app-on-harbor.yml` — o passo que roda `validateConfig.test` no deploy
  veio da US7; não muda aqui.

## Histórias de usuário

1. Como pessoa que mantém o radar, quero um teste de integração que desenhe o radar com 3, 4, 5 e 6
   quadrantes, para provar que arcos, brilho, rótulos e blips saem corretos para qualquer quantidade
   suportada, e não só na conferência visual.
2. Como pessoa que mantém o radar, quero um teste de navegação que abra a rota, a página de item, a
   busca e a visão geral de um quadrante novo nos três idiomas, para provar que adicionar um quadrante
   só por configuração e dicionário mantém a navegação inteira funcionando.
3. Como pessoa que mantém o radar, quero que o `src/components/Item/Item.test.tsx` passe sem ser
   editado depois do ajuste do Jest, para que a transformação de ESM destrave a suíte em vez de
   contorná-la.
4. Como pessoa que publica o radar, quero o aceite manual registrado passo a passo, comparando N = 4
   ao site publicado e conferindo N = 3/5/6 e a configuração inválida, para ter evidência de que os
   oito critérios da iniciativa valem no navegador real.
5. Como pessoa que quer adicionar um quadrante, quero o procedimento documentado no `CONTRIBUTING.md`,
   com os limites e as limitações conhecidas, para fazê-lo editando só configuração, dicionários e
   acervo, sem tocar em `.tsx` nem `.scss`.

## Critérios de aceite

**História 1 — teste de integração multi-N:**

- Dada uma fixture de configuração com N quadrantes (N = 3, 4, 5 e 6), quando o `RadarGrid` é
  renderizado, então o SVG tem `N × (quantidade de anéis)` paths de arco de anel e uma forma de brilho
  de fundo por quadrante.
- Dada a renderização de cada N, quando o SVG é inspecionado, então nenhum atributo `d`, `points`,
  `cx`, `cy`, `x` ou `y` contém `NaN` nem `undefined`.
- Dada uma fixture com itens de quadrante e anel válidos, quando o `RadarGrid` é renderizado, então a
  quantidade de blips no SVG é igual à quantidade de itens com `ring` e `quadrant` existentes na
  configuração, e nenhum item válido fica de fora (R9).
- Dado cada blip renderizado, quando o seu ângulo é medido a partir das coordenadas renderizadas (em
  pixels de tela, convenção 0° = 12 horas no sentido horário) e não da função que as gerou, então ele
  cai dentro do setor do seu quadrante — o que flagra um eventual espelhamento vertical pelo `yScale`
  (R1).
- Dada a renderização de cada N, quando os blocos de rótulo são inspecionados, então há um bloco por
  quadrante, cada um com a classe do seu slot (`quadrant-label--slot-N`) e com `data-quadrants` igual
  a N na `div.radar-grid`.
- Dada a renderização de cada N, quando os rótulos de anel são inspecionados, então há dois rótulos
  por anel (`RingLabel`, lado direito e lado esquerdo).
- Dado N = 4 com o `public/config.json` real, quando o `RadarGrid` é renderizado, então a cor de cada
  quadrante aparece no setor que ele ocupa hoje.

**História 2 — teste de navegação para um quadrante novo:**

- Dada uma fixture de 5 quadrantes com um quadrante novo e um item dele, quando a rota do quadrante
  novo é aberta, então a página daquele quadrante é renderizada com o item listado.
- Dado o item do quadrante novo, quando a sua página de item é aberta, então ela renderiza; quando o
  termo é buscado, então a busca encontra o item; e na visão geral o item aparece listado.
- Dado cada um dos três idiomas, quando as telas acima são abertas, então nenhuma chave crua de
  tradução (`quadrants.<slug>`, `pageHelp...`) aparece na tela.

**História 3 — a suíte destravada:**

- Dado o ajuste de `transformIgnorePatterns`, quando `yarn test` roda, então
  `src/components/Item/Item.test.tsx` passa sem ter sido editado.
- Dada a suíte inteira, quando ela roda antes e depois do ajuste, então nenhum teste que passava antes
  passa a falhar por causa da mudança de transformação; o destino de `src/date.test.tsx`, que já falha
  na base por data e locale, é decidido no [`plan.md`](./plan.md).

**História 4 — o aceite manual registrado:**

- Dado N = 4 no navegador local, quando a home é comparada a `techradar.db1.com.br` por captura de
  tela, nos três idiomas e nas larguras ~800px, ~1000px e 1200px, então as cores, os cantos, a
  numeração "QUADRANTE N", a legenda e a grade de quadrantes são iguais; os blips, que mudam de lugar a
  cada carga (R5), são conferidos por quadrante e anel, não por posição.
- Dado N = 3, 5 e 6 com configuração de teste local e não commitada, quando a home é aberta, então os
  arcos, o brilho sem fio sem cor (R3, principalmente em N = 3), os blocos de rótulo sem sobrepor o
  círculo nem a legenda, os rótulos de anel, as rotas, a busca, a página de item e os três idiomas
  funcionam.
- Dado um sétimo quadrante de teste e um slug sem tradução em `es`, quando a home é aberta, então
  aparece a tela de erro legível entregue na US7.
- Dado cada passo do aceite, quando ele é executado, então o resultado fica registrado no
  `test-cases.md` desta unidade.

**História 5 — o procedimento documentado:**

- Dado o `CONTRIBUTING.md`, quando a seção "Adding or reordering a quadrant" é lida, então ela
  descreve, em inglês: o slug em `quadrants` (nome) e em `quadrantsMap` (`colour`, `txtColour`,
  `position` = número de "QUADRANT N", `order` = fatia da tela de 1 a N no sentido horário a partir das
  12h, contígua e sem repetição); as entradas `quadrants.<slug>` e `pageHelp.quadrants.<slug>` com
  `name` e `description` nos três dicionários; os itens em `public/db1-opinion.json` com o slug do
  quadrante, entrando no anel `assess`; subir `REACT_APP_BUILDHASH` no `.env`; rodar os testes, com
  nota de que `src/validateConfig.test.ts` também roda no deploy; que reordenar é mudar só `order`; os
  limites de 1 a 6 quadrantes, com o teto vindo da tabela de lugares em
  `src/components/RadarGrid/radar-grid.scss` e, para 7 ou mais, a necessidade de acrescentar casos a
  ela (R7); que a posição dos blips é sorteada a cada carga (R5); e que com N ímpar os rótulos de anel
  podem encostar em blips (R10); afirmando que nada disso exige alterar `.tsx` ou `.scss`.
- Dado o passo 1 do `CONTRIBUTING.md`, quando o link do fork é lido, então ele aponta para
  `https://github.com/db1group/db1-tech-radar`.

**Rastreabilidade dos oito critérios da iniciativa 2125624:**

| # | Critério da iniciativa | Onde é verificado |
| --- | --- | --- |
| 1 | Adicionar quadrante = editar `config.json`, os três dicionários e itens em `db1-opinion.json`, zero alteração em `.tsx`/`.scss` | Teste de navegação (fixture só de configuração e dicionário) + seção do `CONTRIBUTING.md` + critério "nenhum `.tsx`/`.scss` de produção alterado" |
| 2 | Radar renderiza com 3/4/5/6: arcos, brilho, rótulos de quadrante e de anel | Teste de integração multi-N (História 1) + aceite manual N = 3/5/6 (História 4) |
| 3 | Nenhum blip com coordenada inválida; nº de blips = nº de itens; nenhum blip fora do setor | Teste de integração multi-N (sem `NaN`/`undefined`; contagem; ângulo nas coordenadas renderizadas — História 1) |
| 4 | Com 4 quadrantes, equivalência visual ao site publicado, mesmas cores e numeração "QUADRANTE N" | Teste de integração N = 4 com `public/config.json` real + aceite manual por captura de tela (História 4) |
| 5 | Rotas por quadrante, busca, página de item, visão geral e os três idiomas para um quadrante novo | Teste de navegação (História 2) + aceite manual (História 4) |
| 6 | Lint e testes passando; responsivo validado, incluindo o breakpoint de 800px casado com `chartConfig.size = 800` | Portão de qualidade (abaixo) + aceite manual nas três larguras (História 4) |
| 7 | Configuração inválida produz erro legível | Entregue na US7 (`validateConfig`); reconfirmado pelo aceite manual (História 4) |
| 8 | Procedimento de adicionar quadrante documentado no `CONTRIBUTING.md` | Seção "Adding or reordering a quadrant" (História 5) |

**Portão de qualidade:**

- Dado o repositório alterado, quando `yarn ts:check` roda, então termina com código 0.
- Dado o repositório alterado, quando `yarn lint` roda, então termina com código 0 e sem nenhum aviso
  do ESLint, porque o build do GitHub Actions roda com `CI=true` e trata aviso como erro.
- Dado o repositório alterado, quando `yarn build` roda, então o pacote de produção é gerado sem erro.
- Dado o commit desta unidade, quando o diff é lido, então nenhum arquivo `.tsx` ou `.scss` de
  produção foi alterado (a não ser para corrigir defeito encontrado pelo aceite, descrito nesta spec),
  e `public/config.json`, `public/db1-opinion.json` e os dicionários ficam sem quadrante de teste.

## Comportamento atual → novo

| Aspecto | Hoje | Depois desta unidade |
| --- | --- | --- |
| Transformação de ESM no Jest | Sem chave `jest` no `package.json`; `d3` e `query-string` são ESM e não são transformados; nenhum teste renderiza `RadarChart`, `RadarGrid` ou `App`; `Item.test.tsx` falha com "Cannot use import statement outside a module". | `jest.transformIgnorePatterns` transforma `d3`, os `d3-*`, as dependências ESM e `query-string`; o desenho montado é testável e `Item.test.tsx` passa sem ser editado. |
| Cobertura do desenho montado | Só a lógica pura (`geometry.ts`, `blips.ts`, `validateConfig.ts`, dicionários, CSS dos rótulos) tem teste, para N de 1 a 6; o SVG montado é conferido só à mão. | Teste de integração trava arcos, brilho, rótulos de quadrante, rótulos de anel e blips para N = 3/4/5/6; teste de navegação trava o quadrante novo nos três idiomas. |
| Procedimento de adicionar quadrante | Não documentado; o link do fork no `CONTRIBUTING.md` aponta para `db1group/dgs-tech-radar`. | Seção "Adding or reordering a quadrant" no `CONTRIBUTING.md`; link do fork corrigido para `db1group/db1-tech-radar`. |
| Aceite ponta a ponta | Nunca registrado. | `test-cases.md` com N = 4 contra o site publicado, N = 3/5/6 local e configuração inválida, nos três idiomas e três larguras. |

O que permanece intocado: o comportamento do produto com quatro quadrantes, o desenho publicado, as
telas de navegação, os três idiomas, o acervo, a taxonomia publicada, a validação e a tela de erro da
US7, o identificador de build e o fluxo de publicação.

## Dependências entre domínios

- **Visualização do Radar** — `segmentCount`, `slotOf`, `segmentAngles`, `segmentRadians`,
  `glowShape` e `blipPosition` em `src/components/Chart/geometry.ts`, e `buildBlips` em
  `src/components/Chart/blips.ts`, são a lógica consumida pelo desenho que o teste de integração
  renderiza, sem alteração; a tabela de lugares em `src/components/RadarGrid/radar-grid.scss` é a
  origem do teto de seis citado no procedimento.
- **Taxonomia de Quadrantes e Anéis** — a estrutura de `quadrants`, `quadrantsMap` (`position`,
  `order`, `colour`, `txtColour`), `rings` e `chartConfig.ringsAttributes` em `public/config.json`, e
  de `quadrants.<slug>` e `pageHelp.quadrants.<slug>` nos dicionários, é a que o procedimento descreve
  e as fixturas reproduzem.
- **Navegação e Descoberta de Tecnologias** — `Router`, `PageQuadrant`, `PageItem`, `PageOverview` e a
  busca são as telas exercitadas pelo teste de navegação; nenhuma muda.
- **Catálogo de Opiniões Tecnológicas** — a regra de que tecnologia nova entra no anel `assess` e de
  que o item carrega o slug do quadrante é citada no procedimento; o acervo publicado não muda.
- **Publicação e Distribuição do Radar** — `REACT_APP_BUILDHASH` no `.env` e o teste de
  `src/validateConfig.test.ts` no workflow de deploy (US7) são citados no procedimento; nenhum passo do
  deploy muda.

## Riscos e observações

- **R1 — espelhamento vertical imperceptível com N = 4.** Um espelhamento pelo `yScale` passaria
  despercebido na conferência visual de quatro quadrantes. O teste de integração mede o ângulo de cada
  blip nas coordenadas renderizadas (pixels de tela), e não na função que as gera, para flagrá-lo.
- **R3 — corda do brilho tangente em N = 3.** Com três quadrantes, a corda do polígono de brilho fica
  exatamente tangente ao círculo; o aceite manual confere visualmente que não sobra fio sem cor,
  principalmente em N = 3.
- **R10 — rótulos de anel com N ímpar.** Com quantidade ímpar de quadrantes, os rótulos de anel podem
  encostar em blips. É limitação cosmética conhecida, documentada no `CONTRIBUTING.md` e não corrigida
  nesta unidade.
- **Ajuste do Jest pode afetar a suíte.** Mexer em `transformIgnorePatterns` pode deixar a suíte mais
  lenta ou quebrar outro teste. A suíte inteira é rodada antes e depois; a confirmação de que nada que
  passava passa a falhar é critério da História 3, e o destino de `src/date.test.tsx` fica no
  [`plan.md`](./plan.md).
- **Sem dependência de E2E nova.** O aceite é manual e registrado no `test-cases.md`. Cypress,
  Playwright ou equivalente só entram por decisão explícita no `plan.md`, com o custo justificado ao
  mantenedor.
- **As configurações de teste são locais e descartáveis.** As quantidades de 3, 5 e 6 quadrantes, o
  sétimo quadrante e o slug sem tradução usados no aceite manual, e as fixturas de teste, não entram em
  `public/config.json`, `public/db1-opinion.json` nem nos dicionários.
- **A seção nova do `CONTRIBUTING.md` é procedimento de manutenção, não processo editorial.** Ela trata
  de como editar configuração, dicionários e acervo para acrescentar um quadrante — assunto distinto do
  processo de contribuição de uma opinião (fork, pull request, anel de entrada) que a página de ajuda
  publica —, então não dispara a regra de manter guia e página de ajuda em sincronia.
- **Impacto na documentação autoritativa.** A skill técnica `estrategia-de-testes` afirma que não
  existe chave `jest` no `package.json` e que módulo que importa `d3` ou `query-string` não é
  alcançável pela suíte, mantendo `Item.test.tsx` vermelho — afirmações que deixam de valer com o
  ajuste de `transformIgnorePatterns` e passam a registrar a configuração de transformação de ESM. A
  skill técnica `componente-grafico-do-radar` passa a registrar o teste de integração multi-N como
  trava do desenho montado, ao lado das travas de retrocompatibilidade já descritas. A skill
  `taxonomia-de-quadrantes-e-aneis` passa a apontar o procedimento do `CONTRIBUTING.md` e o teste
  multi-N como trava. A mudança é deliberada, apoiada na descrição desta unidade. O impacto e as
  tarefas de atualização da documentação são registrados no [`plan.md`](./plan.md) desta unidade e
  executados na etapa de implementação.
