# Tarefas: validação multi-quadrante e aceite ponta a ponta

Checklist da unidade descrita em [`spec.md`](./spec.md), com as decisões técnicas em
[`plan.md`](./plan.md), a evidência que as fecha em [`research.md`](./research.md) e a cobertura em
[`test-cases.md`](./test-cases.md).

A unidade é transversal. As tarefas de documentação autoritativa vêm primeiro, antes das de código:
**Governança de Contribuição do Radar** em T1, cujo guia publicado (`CONTRIBUTING.md`) ganha o
procedimento de adicionar ou reordenar um quadrante e a correção do link do fork; a skill técnica de
testes em T2, que passa a registrar a transformação de ESM no Jest; **Visualização do Radar** em T3
(skill técnica do gráfico), que registra o teste de integração multi-N como trava do desenho montado; e
**Taxonomia de Quadrantes e Anéis** em T4, que aponta o procedimento do `CONTRIBUTING.md` e o teste
multi-N. As tarefas de código vêm depois: T5 destrava a suíte e entrega o teste de integração multi-N,
T6 o teste de navegação para um quadrante novo e T7 conserta o `src/date.test.tsx`.

**Navegação e Descoberta de Tecnologias** tem telas exercitadas pelo teste de navegação (T6), sem
alteração do comportamento documentado na sua skill. **Catálogo de Opiniões Tecnológicas** entra por
itens de fixtura e pela menção ao anel `assess` no `CONTRIBUTING.md`, e **Publicação e Distribuição do
Radar** pela menção ao `REACT_APP_BUILDHASH` e ao teste de `validateConfig` no deploy (trava já entregue
na US7) — nenhum dos dois com comportamento documentado alterado, então não têm tarefa de documentação
própria. **Identidade Institucional DB1** fica fora do alcance da alteração. `AGENTS.md`,
`.agents/maps/functional-map.md` e a skill `governanca-de-contribuicao-do-radar` não mudam (ver
[`plan.md`](./plan.md), *Impacto na documentação autoritativa*).

O portão de qualidade — TC-15 (suíte inteira verde), TC-25 (`ts:check`), TC-26 (lint sem avisos), TC-27
(build) e TC-28 (nenhum `.tsx`/`.scss` de produção alterado e dados sem quadrante de teste) — vale para
a unidade inteira e é conferido ao fim de cada tarefa que toca código (T5 a T7). O aceite manual (E2E)
da História 4 — TC-16 a TC-19 — é executado no checkpoint de implementação e registrado no
[`test-cases.md`](./test-cases.md), não é tarefa deste checklist.

- [x] **T1. Procedimento de quadrante no guia de contribuição (Governança)**
  - Depende de: nenhuma
  - Alvo: `CONTRIBUTING.md` (guia publicado do domínio Governança de Contribuição do Radar).
  - Seções afetadas: nova seção "Adding or reordering a quadrant" e o passo 1 de "Sending a Pull
    Request".
  - Delta: acrescenta, em inglês, o passo a passo de adicionar ou reordenar um quadrante — slug em
    `quadrants` e `quadrantsMap` (`colour`, `txtColour`, `position`, `order` contíguo de 1 a N),
    `quadrants.<slug>` e `pageHelp.quadrants.<slug>` nos três dicionários, itens em
    `public/db1-opinion.json` no anel `assess`, subir `REACT_APP_BUILDHASH` no `.env`, rodar os testes
    (com nota de que `src/validateConfig.test.ts` roda no deploy), reordenar mudando só `order`, os
    limites de 1 a 6 quadrantes (teto da tabela de `src/components/RadarGrid/radar-grid.scss`, R7), o
    sorteio da posição dos blips (R5) e os rótulos de anel com N ímpar (R10), afirmando que nada disso
    exige alterar `.tsx` ou `.scss`; e corrige o link do fork para
    `https://github.com/db1group/db1-tech-radar`.
  - Origem: História 5 da `spec.md` (critério 8 da iniciativa) e o critério de aceite do link do fork.
  - Casos de teste: TC-20, TC-21.

- [x] **T2. Documentação autoritativa da estratégia de testes (transformação de ESM)**
  - Depende de: nenhuma
  - Alvo: `.agents/skills/estrategia-de-testes/SKILL.md`.
  - Seções afetadas: *Como montar o teste de componente* (afirmação de que não há chave `jest` no
    `package.json`) e *Restrições e armadilhas conhecidas* (os pontos "O gráfico é SVG escrito à mão e a
    suíte não o renderiza" e "`Link` é alcançável; o `d3`, não"), além da parte de *Teste unitário para
    lógica nova* que afirma que módulo com `d3` não é alcançável.
  - Delta: a chave `jest` com `transformIgnorePatterns` é descrita; `d3`, os `d3-*` e `query-string`
    passam a ser transformados, de modo que `RadarChart`, `RadarGrid` e `App` são renderizáveis e
    `Item.test.tsx` passa; o `jest.mock("../Link/Link")` fica como isolamento, não necessidade. As
    armadilhas da viewport móvel do jsdom e da formatação de data por idioma permanecem.
  - Origem: Histórias 1 e 3 da `spec.md` (critérios 2, 3 e 6 da iniciativa) e o escopo 1 e 6 da
    descrição da unidade.
  - Estrutura: edição no próprio `SKILL.md`; `description` mantida, porque o escopo da skill não muda;
    sem reestruturação; critério de conclusão: a skill permanece dentro das regras de `skill-authoring`.
  - Casos de teste: TC-22.

- [x] **T3. Documentação autoritativa da Visualização do Radar (gráfico)**
  - Depende de: nenhuma
  - Alvo: `.agents/skills/componente-grafico-do-radar/SKILL.md`.
  - Seções afetadas: *Testes do componente*.
  - Delta: o desenho montado passa a ser descrito como testável via `transformIgnorePatterns`, e o teste
    de integração multi-N (`src/components/RadarGrid/RadarGrid.test.tsx`) entra como trava do desenho
    para N = 3/4/5/6, ao lado das travas de retrocompatibilidade de `geometry.test.tsx` e
    `QuadrantLabel.test.tsx`.
  - Origem: Histórias 1 e 3 da `spec.md` (critérios 2 e 3 da iniciativa) e o escopo 2 e 6 da descrição
    da unidade, mais os riscos R1 e R3.
  - Estrutura: edição no próprio `SKILL.md`; `description` mantida; sem reestruturação; critério de
    conclusão: a skill permanece dentro das regras de `skill-authoring`.
  - Casos de teste: TC-23.

- [x] **T4. Documentação autoritativa da Taxonomia de Quadrantes e Anéis**
  - Depende de: T1
  - Alvo: `.agents/skills/taxonomia-de-quadrantes-e-aneis/SKILL.md`.
  - Seções afetadas: *Fluxos e ciclo de vida > Acrescentar um quadrante*.
  - Delta: o passo a passo aponta o procedimento público detalhado no `CONTRIBUTING.md` (seção "Adding
    or reordering a quadrant") e registra o teste de integração multi-N como trava automatizada de que o
    desenho acompanha a quantidade de quadrantes declarada.
  - Origem: Histórias 1 e 5 da `spec.md` (critérios 1, 2 e 8 da iniciativa) e o escopo 6 da descrição da
    unidade.
  - Estrutura: edição no próprio `SKILL.md`; `description` mantida; sem reestruturação; critério de
    conclusão: a skill permanece dentro das regras de `skill-authoring`.
  - Casos de teste: TC-24.

- [x] **T5. Destravamento da suíte e teste de integração multi-N**
  - Depende de: T2, T3
  - Pré-requisito (infra de teste, nomeado): acrescentar a chave `jest` ao `package.json` com
    `transformIgnorePatterns` liberando `d3`, os `d3-*` e suas dependências ESM (`internmap`,
    `delaunator`, `robust-predicates`) e `query-string` com as dependências dele
    (`decode-uri-component`, `split-on-first`, `filter-obj`), preservando o padrão de CSS modules. Isso
    destrava `src/components/Item/Item.test.tsx` sem editá-lo.
  - `src/components/QuadrantGrid/testData.tsx` estendido com `configWithThreeQuadrants` e
    `configWithSixQuadrants` (as de 4 e 5 quadrantes já existem), tipadas por `ConfigData`.
  - `src/components/RadarGrid/RadarGrid.test.tsx` renderizando `RadarGrid` em `MemoryRouter`, com o
    i18next inicializado, para N = 3, 4, 5 e 6: paths de arco = `segmentCount × anéis`; uma forma de
    brilho por quadrante; nenhum `d`, `points`, `cx`, `cy`, `x` ou `y` com `NaN` ou `undefined`; blips =
    itens com `ring` e `quadrant` válidos (R9); cada blip no setor do seu quadrante pelo ângulo medido
    nas coordenadas renderizadas (R1); um bloco de rótulo por quadrante com a classe do slot e
    `data-quadrants`; dois `RingLabel` por anel; e, com N = 4 e o `public/config.json` real, a cor de
    cada quadrante no setor de hoje.
  - Casos de teste: TC-1 a TC-7, TC-13.

- [x] **T6. Teste de navegação para um quadrante novo**
  - Depende de: T5
  - Suíte de navegação sobre `Router` em `MemoryRouter`, com a fixtura de 5 quadrantes e itens do
    quadrante novo (estendendo `src/components/QuadrantGrid/testData.tsx` quando preciso): a rota do
    quadrante novo abre a página dele com o item listado; a página de item do quadrante novo abre
    (`PageItemMobile` na viewport padrão do jsdom, ou a versão larga ajustando `window.innerWidth`); a
    busca encontra o item; e a visão geral o lista — tudo nos três idiomas (alternados por
    `i18n.changeLanguage`), sem chave crua de tradução na tela.
  - Casos de teste: TC-8 a TC-12.

- [x] **T7. Conserto do src/date.test.tsx**
  - Depende de: nenhuma
  - `src/date.test.tsx` com `import "./i18n";` no topo, para inicializar o i18next antes de
    `formatRelease` ler `i18n.language`, fazendo os dois casos (`"January 2022"` e `"05.01.2022"`)
    passarem. `src/date.ts` não é alterado.
  - Casos de teste: TC-14.
