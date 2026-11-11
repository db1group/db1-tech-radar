# Plan: validação multi-quadrante e aceite ponta a ponta

Visão técnica da unidade descrita em [`spec.md`](./spec.md).

## Stack e estrutura

A unidade trabalha dentro da SPA em React 18 com Create React App e TypeScript `strict`, acrescentando
apenas uma chave de configuração ao `package.json` — nenhuma dependência de runtime nem de
desenvolvimento entra. O desenho montado vive em `src/components/Chart/` (`RadarChart.tsx`,
`QuadrantRings.tsx`, `BlipPoints.tsx`, `BlipShapes.tsx`) e em `src/components/RadarGrid/RadarGrid.tsx`,
que compõe `RadarChart` com os blocos de rótulo (`QuadrantLabel`) e a legenda; a quantidade de
quadrantes e o slot de tela têm origem única em `src/components/Chart/geometry.ts` (`segmentCount`,
`slotOf`, `segmentAngles`, `glowShape`). A lógica pura de `geometry.ts` e `blips.ts` já tem cobertura
unitária para N de 1 a 6.

A suíte roda na infraestrutura Jest embutida no `react-scripts` 5, com `src/setupTests.ts` carregado
automaticamente. As fixturas de teste vivem em `src/components/QuadrantGrid/testData.tsx`, que já
exporta `configWithFourQuadrants`, `configWithFiveQuadrants` e `items`. O portão de qualidade continua
sendo `yarn ts:check`, `yarn lint` e `yarn build`; o workflow `.github/workflows/prod-deploy-app-on-harbor.yml`
não muda nesta unidade. O `CONTRIBUTING.md` e as fixturas são os únicos arquivos novos ou editados fora
dos testes.

## Decisões técnicas

Uma linha por veredito; contexto, alternativas e evidência em [`research.md`](./research.md).

- **Transformação de ESM**: chave `jest` no `package.json` com `transformIgnorePatterns` que libera
  `d3`, os `d3-*` e suas dependências ESM (`internmap`, `delaunator`, `robust-predicates`) e
  `query-string` com as dependências dele (`decode-uri-component`, `split-on-first`, `filter-obj`),
  preservando o padrão de CSS modules. Padrão verificado rodando a suíte com o override, sem gravar em
  disco: `Item.test.tsx` passa e as 11 demais suítes seguem verdes.
- **`src/date.test.tsx`**: entra nesta unidade, consertado só no arquivo de teste com `import "./i18n";`
  para inicializar o i18next antes de `formatRelease` ler `i18n.language`; a causa (getter de locale do
  `moment` com idioma `undefined`) está em [`research.md`](./research.md). Nenhum arquivo de produção
  muda.
- **Alvo do teste de integração multi-N**: renderizar `RadarGrid` embrulhado em `MemoryRouter`, com o
  i18next inicializado, para cobrir num só render os arcos, o brilho, os blocos de rótulo, os rótulos
  de anel e os blips. `RadarGrid` traz `RadarChart` (que agora é alcançável pela suíte) e os
  `QuadrantLabel`.
- **Fixturas multi-N**: estender `src/components/QuadrantGrid/testData.tsx` com
  `configWithThreeQuadrants` e `configWithSixQuadrants`, tipadas por `ConfigData`, reaproveitando o
  `chartConfig` e o padrão `quadrantAttributes(order, colour)` já presentes; os quadrantes de teste não
  entram em `public/config.json`. Para N = 4 com o desenho publicado, o teste importa o
  `public/config.json` real.
- **Medição do ângulo do blip (R1)**: o teste lê as coordenadas renderizadas do SVG (atributos de
  posição em pixels de tela), converte para ângulo na convenção 0° = 12h no sentido horário e confere
  que cai no setor do quadrante, em vez de reusar a função de geometria — assim um espelhamento pelo
  `yScale` é flagrado.
- **Contagem de peças por N**: paths de arco de anel = `segmentCount × config.rings.length` (cada
  `QuadrantRings` emite um path por anel); uma forma de brilho por quadrante (um `glowElement` por
  `QuadrantRings`); um bloco `QuadrantLabel` por quadrante, com a classe `quadrant-label--slot-N` e
  `data-quadrants` igual a N na `div.radar-grid`; dois `text` por anel (`RingLabel`, direito e
  esquerdo). Blips = itens com `ring` e `quadrant` existentes na configuração (R9).
- **Teste de navegação**: renderizar `Router` em `MemoryRouter` com a fixtura de 5 quadrantes e itens
  do quadrante novo, exercitando a rota do quadrante, a página de item, a busca e a visão geral nos
  três idiomas (alternando com `i18n.changeLanguage`), afirmando ausência de chave crua de tradução. A
  viewport do jsdom é 1024 (< 1200), então a rota de item cai em `PageItemMobile`; o teste ajusta
  `window.innerWidth` quando precisar da versão larga, conforme a skill `estrategia-de-testes`.
- **Aceite manual (E2E)**: registrado no `test-cases.md` desta unidade, sem dependência de E2E nova. N
  = 4 comparado a `techradar.db1.com.br` por captura de tela nos três idiomas e larguras ~800px,
  ~1000px e 1200px; N = 3/5/6 com configuração de teste local não commitada; configuração inválida (um
  sétimo quadrante e um slug sem tradução em `es`) exercitando a tela de erro da US7. Ao fim, `git
  restore` nos arquivos de `public/`.
- **`CONTRIBUTING.md`**: nova seção "Adding or reordering a quadrant" em inglês e correção do link do
  fork no passo 1 (`db1group/dgs-tech-radar` → `db1group/db1-tech-radar`), alinhando-o ao repositório
  que a aplicação e a skill de governança já declaram.
- **`research.md`**: gerado, em [`research.md`](./research.md).

## Modelo de dados

Nenhuma alteração de contrato: `public/config.json`, `ConfigData`, `QuadrantConfig` e `Item` ficam como
estão. As fixturas multi-N são dados de teste tipados pelos tipos existentes, não um modelo novo.
`data-model.md` fica dispensado.

## Contratos externos

Nenhum. A aplicação não expõe nem consome API. `contracts/` fica dispensado.

## Interface

Nenhuma tela nova nem alterada: o teste de integração e o de navegação renderizam componentes de
produção sem modificá-los, e o aceite manual confere as telas publicadas. A descrição do roteiro de
aceite por tela, idioma e largura vive no `test-cases.md` da sub-fase seguinte; `ui/` fica dispensado.

## Estratégia de testes

A infraestrutura já existe; esta unidade só a destrava para os módulos ESM, ajustando
`transformIgnorePatterns` no `package.json`. Os arquivos ficam ao lado do código, com nomes de caso em
inglês, conforme a skill [`estrategia-de-testes`](../../skills/estrategia-de-testes/SKILL.md).

- **Integração, `src/components/RadarGrid/RadarGrid.test.tsx`** (nova) — renderiza `RadarGrid` em
  `MemoryRouter`, com o i18next inicializado, para N = 3, 4, 5 e 6 a partir das fixturas de
  `QuadrantGrid/testData.tsx`:
  - paths de arco = `segmentCount × rings`; uma forma de brilho por quadrante;
  - nenhum `d`, `points`, `cx`, `cy`, `x` ou `y` com `NaN` ou `undefined`;
  - blips = itens com `ring` e `quadrant` válidos (R9); cada blip no setor do seu quadrante, com o
    ângulo medido nas coordenadas renderizadas (R1);
  - um bloco de rótulo por quadrante, com a classe do slot e o `data-quadrants` corretos;
  - dois `RingLabel` por anel;
  - com N = 4 e o `public/config.json` real, a cor de cada quadrante no setor de hoje.
- **Navegação, teste sobre `Router`** (novo) — fixtura de 5 quadrantes e item do quadrante novo; a rota
  do quadrante abre a página, a página de item abre, a busca encontra o item e a visão geral o lista,
  nos três idiomas, sem chave crua de tradução.
- **Fixturas, `src/components/QuadrantGrid/testData.tsx`** — acrescenta `configWithThreeQuadrants` e
  `configWithSixQuadrants` e, se preciso, itens do quadrante novo para a navegação.
- **`src/date.test.tsx`** — `import "./i18n";` conserta os dois casos sem tocar `src/date.ts`.
- **Conferência manual (nada commitado)** — roteiro de aceite no `test-cases.md`, com `yarn start` e
  configurações de teste locais; ao fim, `git restore` em `public/`.
- **Portão de qualidade** — `yarn ts:check`, `yarn lint` e `yarn build` terminam limpos, com `CI=true`
  tratando aviso do ESLint como erro. `yarn test` roda a suíte inteira verde: `Item.test.tsx`,
  `date.test.tsx`, os testes de integração e de navegação novos e as 11 suítes já existentes.

Nenhuma dependência de teste nova é introduzida: Jest e Testing Library vêm do `react-scripts` 5, e o
aceite E2E é manual.

## Impacto na documentação autoritativa

Esta unidade destrava, deliberadamente, a renderização do desenho montado na suíte e passa a travá-lo
com teste de integração; a decisão está na descrição da unidade (escopo 1, 2 e 6). Cada item abaixo
vira tarefa de documentação na fase `tasks`, executada junto com o código, reescrevendo as seções
afetadas no estado final. A medida contra a skill
[`skill-authoring`](../../skills/skill-authoring/SKILL.md) indica que as três skills estão dentro das
regras — bloco de manutenção presente, corpo abaixo de 500 linhas e `description` cobrindo o escopo sem
mudança —, então o `description` de cada uma permanece e nenhuma reestruturação acompanha a mudança, só
a reescrita das passagens abaixo.

- **`.agents/skills/estrategia-de-testes/SKILL.md`** — em *Como montar o teste de componente*, a frase
  "Não existe arquivo de configuração Jest no repositório nem chave `jest` no `package.json`" passa a
  descrever a chave `jest` com `transformIgnorePatterns`; em *Restrições e armadilhas conhecidas*, os
  pontos "O gráfico é SVG escrito à mão e a suíte não o renderiza", "`Link` é alcançável; o `d3`, não"
  e a parte de *Teste unitário para lógica nova* que afirma que módulo com `d3` não é alcançável passam
  a registrar que `d3`, os `d3-*` e `query-string` são transformados, de modo que `RadarChart`,
  `RadarGrid` e `App` são renderizáveis e `Item.test.tsx` passa; o `jest.mock("../Link/Link")` de
  `QuadrantLabel.test.tsx` e `QuadrantGrid.test.tsx` fica como isolamento, não como necessidade. A
  armadilha da viewport móvel do jsdom e a da formatação de data por idioma permanecem.
- **`.agents/skills/componente-grafico-do-radar/SKILL.md`** — em *Testes do componente*, a afirmação de
  que o `d3` v7 ESM impede carregar um componente do gráfico e de que `QuadrantLabel` vive em arquivo
  próprio para ficar fora do grafo do `d3` passa a registrar que o desenho montado é testável via
  `transformIgnorePatterns`; acrescenta o teste de integração multi-N (`RadarGrid.test.tsx`) como trava
  do desenho montado para N = 3/4/5/6, ao lado das travas de retrocompatibilidade de `geometry.test.tsx`
  e `QuadrantLabel.test.tsx` já descritas.
- **`.agents/skills/taxonomia-de-quadrantes-e-aneis/SKILL.md`** — em *Fluxos e ciclo de vida >
  Acrescentar um quadrante*, o passo a passo passa a apontar o procedimento público detalhado no
  `CONTRIBUTING.md` (seção "Adding or reordering a quadrant") e registra o teste de integração multi-N
  como trava automatizada de que o desenho acompanha a quantidade de quadrantes declarada.

Sem impacto em `AGENTS.md`: a Stack já descreve "Jest + Testing Library, pela infraestrutura do
`react-scripts`", e a chave `jest` com `transformIgnorePatterns` é um override suportado por essa mesma
infraestrutura; a restrição "De um a seis quadrantes" e as demais seguem válidas. Sem impacto em
`.agents/maps/functional-map.md`: o domínio Visualização do Radar já registra a geometria coberta por
teste unitário e não afirma que o desenho montado seja intestável. Sem impacto na skill
`governanca-de-contribuicao-do-radar`: a nova seção do `CONTRIBUTING.md` é procedimento de manutenção
de quadrante (editar configuração, dicionários e acervo), distinto do processo editorial de
contribuição de opinião que a skill governa, e a correção do link apenas alinha o arquivo ao
repositório que a skill já declara. Sem impacto nas demais skills de domínio: nenhuma tela, rota, dado
publicado ou regra de negócio muda.
