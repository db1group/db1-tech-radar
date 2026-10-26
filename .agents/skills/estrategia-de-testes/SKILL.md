---
name: estrategia-de-testes
description: >
  Cobre com teste automatizado toda alteração de manutenção do radar: teste unitário
  para lógica nova (modelo, hooks, funções de geometria do gráfico) e teste de
  componente com Jest e Testing Library para cada tela alterada. Use ao escrever,
  revisar ou ajustar teste, ao decidir onde colocar o arquivo `.test.tsx` e a fixture,
  ao montar o `render` com `MemoryRouter` ou com provedor de contexto, ao rodar
  `yarn test`, e antes de abrir qualquer alteração de código em `src/`.
metadata:
  author: clovis-cli
  type: technical-skill
---

# Estratégia de testes

> **Manutenção desta skill**
>
> Atualize este documento sempre que **qualquer regra descrita aqui** mudar. O critério
> não é *qual* regra — é a natureza da mudança: decisão de cobertura, de montagem do
> teste, de ferramenta ou de portão de qualidade mudou → atualize; refatoração técnica
> que preserva o padrão (renomear um arquivo, extrair um helper, reorganizar imports)
> → não mexa. Quando esta skill disser X e o repositório fizer Y, sem decisão registrada
> que resolva o conflito, escale para o humano em vez de alinhar um lado ao outro.

## Visão geral do padrão

Toda alteração de manutenção entra acompanhada de teste automatizado, em dois níveis:

- **lógica nova exige teste unitário** — funções do modelo (`src/model.ts`), hooks
  (`src/hooks/`), helpers de configuração (`src/config.ts`), formatação
  (`src/date.ts`, `src/sanitize.ts`) e as funções de geometria do gráfico
  (`src/components/Chart/`);
- **tela alterada exige teste de componente** com Testing Library.

O produto é uma SPA estática sem backend: o build de produção apenas compila e o deploy
apenas sincroniza arquivos. A suíte local é o único mecanismo automatizado que verifica
comportamento antes da revisão humana do pull request, e por isso a cobertura é exigida
no próprio pull request que muda o código.

## Como aplicar

### Teste unitário para lógica nova

Deve existir teste unitário para cada função exportada criada ou com comportamento
alterado. O teste importa a função direto e afirma sobre o valor de retorno, sem
renderizar componente:

```tsx
import { getTags } from "./model";

describe("getTags", () => {
  it("should return a sorted list of unique tags", () => {
    expect(getTags(items)).toEqual(["ci", "cloud"]);
  });
});
```

A lógica do desenho é coberta por `src/components/Chart/geometry.ts`, que não importa `d3`: é lá
que vivem a repartição do círculo, o slot de tela de cada quadrante, a conversão para os radianos
que o gerador de arcos consome, a conversão de polar para cartesiano em pixels de tela, a forma do
brilho de fundo de cada setor e o sorteio da posição do ponto, e é `geometry.test.tsx` que as
exercita. Ao lado dele, `src/components/Chart/blips.ts` é o módulo puro que monta a lista de
pontos a partir dos itens e da configuração, coberto por `blips.test.tsx`.

Módulo que importa o `d3` não é alcançável pela suíte: o `d3` 7.8.0 é publicado como ESM e o
transform do `react-scripts` não entra em `node_modules`, de modo que um arquivo de teste que
traga `RadarChart.tsx`, `BlipPoints.tsx` ou `QuadrantRings.tsx` para o grafo de imports falha
com `SyntaxError` antes de rodar qualquer caso. Cálculo novo do desenho que precise de cobertura
automática nasce em `geometry.ts`, como função pura sobre números; o que depende das escalas
`d3` fica como função de módulo no componente, verificado pela conferência visual do pull
request.

O sorteio da posição do ponto recebe a fonte de aleatoriedade como parâmetro opcional, em
`blipPosition` e em `buildBlips`, com `Math.random` como padrão. Um teste afirma invariantes com o
padrão (o ponto cai dentro do setor do quadrante e da faixa do anel) ou injeta um gerador próprio
para afirmar o caminho determinado — por exemplo, a colisão entre dois pontos do mesmo setor:

```tsx
const alwaysHalf = () => 0.5;

buildBlips(items, config, alwaysHalf);
```

### O que conta como tela alterada

As telas do produto são os seis componentes de página selecionados por
`getPageByName` em `src/components/Router.tsx`: `PageIndex`, `PageOverview`,
`PageHelp`, `PageQuadrant`, `PageItem` e `PageItemMobile`.

Uma tela está alterada quando a mudança altera o que a pessoa vê ou faz nela. Exige
teste de componente:

- edição do JSX, das props ou de um ramo de renderização de um `src/components/Page*/`;
- edição de um componente que a página renderiza (`Item`, `ItemList`, `QuadrantSection`,
  `RadarGrid`, `Search`, `Header`, `Footer`) quando o resultado visível muda;
- mudança em `getPageByName` ou nas regras de seleção de página em `Router.tsx`;
- chave de tradução nova ou renomeada que a página exibe.

Não dispara a exigência:

- mudança apenas em arquivo `.scss`;
- renomeação interna de variável, função privada ou prop sem alteração do que é
  renderizado;
- edição de conteúdo em `public/db1-opinion.json`, `public/config.json` ou
  `public/messages.json`;
- formatação, ordenação de imports e remoção de código morto.

O teste deve cobrir o menor componente que contém a mudança. Quando o comportamento só
aparece na composição da página — prop nova, ramo de renderização, filtro aplicado antes
do render —, o teste vai no `Page*` correspondente.

### Onde colocar o arquivo

- O teste fica **ao lado do código sob teste**, com o nome do módulo e o sufixo
  `.test.tsx`: `src/model.test.tsx` para `src/model.ts`,
  `src/components/PageQuadrant/PageQuadrant.test.tsx` para a página.
- A extensão é sempre `.tsx`, inclusive quando o módulo sob teste é `.ts` —
  `src/date.test.tsx` cobre `src/date.ts` e `src/sanitize.test.tsx` cobre
  `src/sanitize.ts`. O glob do ESLint (`eslint src/**/*.tsx`) só alcança `.tsx`.
- Os dados de teste vivem em `testData.tsx`, ao lado do componente, exportando
  constantes tipadas pelos tipos de `src/model.ts` e `src/config.ts` —
  `src/components/Item/testData.tsx` é o exemplo vigente. Reaproveite uma fixture
  existente quando ela bastar; crie `testData.tsx` novo no diretório do componente
  quando a página precisar de `Item[]`, `ConfigData` ou `releases` próprios.
- `describe` nomeia o módulo ou componente sob teste; cada caso é um
  `it("should ...")`. Nomes de teste em inglês.

### Como montar o teste de componente

`react-scripts test` descobre sozinho qualquer `*.test.tsx` sob `src/`. Não existe
arquivo de configuração Jest no repositório nem chave `jest` no `package.json`: a
configuração é a embutida no `react-scripts`. `src/setupTests.ts` é carregado
automaticamente antes de cada arquivo de teste e importa `@testing-library/jest-dom`,
de modo que os matchers de DOM já estão disponíveis sem import por arquivo.

Componente que renderiza `Link` (`src/components/Link/Link.tsx`) ou usa
`useSearchParamState` depende do contexto do `react-router-dom` e deve ser embrulhado
em `MemoryRouter` pela opção `wrapper`:

```tsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { config, items } from "./testData";
import PageQuadrant from "./PageQuadrant";

describe("PageQuadrant", () => {
  it("should render the featured items of the quadrant", () => {
    render(
      <PageQuadrant
        leaving={false}
        onLeave={() => undefined}
        pageName="tools"
        items={items}
        config={config}
      />,
      { wrapper: MemoryRouter }
    );

    expect(screen.getByText("Yarn")).toBeInTheDocument();
  });
});
```

Componente que lê os links institucionais por `useMessages` deve ser embrulhado em
`MessagesProvider` (`src/context/MessagesContext/index.tsx`), com as mensagens vindas
da fixture:

```tsx
render(
  <MessagesProvider messages={{ legalInformationLink: "https://db1.com.br" }}>
    <FooterEnd />
  </MessagesProvider>,
  { wrapper: MemoryRouter }
);
```

Quando a asserção depende de um rótulo traduzido, o arquivo de teste deve importar
`src/i18n` (por exemplo `import "../../i18n";`) antes de renderizar, para inicializar o
`i18next`.

### Como consultar e afirmar

- Prefira as queries acessíveis do Testing Library: `screen.getByRole`,
  `screen.getByText`, `screen.getByLabelText`. Use `queryBy*` apenas para afirmar
  ausência e `findBy*` para resultado assíncrono.
- Afirme com os matchers do `jest-dom`: `toBeInTheDocument`, `toHaveTextContent`,
  `toHaveAttribute`, `toBeVisible`.
- Não afirme sobre detalhe de implementação: nome de classe BEM, aninhamento de `div`,
  props recebidas ou estado interno do componente.
- Interação usa `fireEvent`, exportado por `@testing-library/react`.
  `@testing-library/user-event` não faz parte das dependências do projeto.

### Como rodar

| Comando | O que faz |
| --- | --- |
| `yarn test` | Roda a suíte Jest uma vez (`react-scripts test --watchAll=false`). |
| `yarn ts:check` | `tsc --noEmit` sobre `src`, incluindo os arquivos de teste. |
| `yarn lint` | `ts:check` seguido do ESLint sobre `src/**/*.tsx`. |

Os três compõem o portão de qualidade e devem passar localmente antes de abrir o pull
request descrito em `CONTRIBUTING.md`.

## Ferramentas e artefatos envolvidos

| Artefato | Onde vive | Papel |
| --- | --- | --- |
| Jest + `@testing-library/react` 13 | infraestrutura do `react-scripts` 5 | Executor e render dos testes. |
| `@testing-library/jest-dom` 5 | importado em `src/setupTests.ts` | Matchers de DOM, carregados automaticamente. |
| `@types/jest` 29 | `package.json` | Tipos de `describe`, `it` e `expect`. |
| `src/setupTests.ts` | raiz de `src/` | Único ponto de configuração global da suíte. |
| `<Nome>.test.tsx` | ao lado do código sob teste | O teste em si. |
| `testData.tsx` | no diretório do componente | Fixtures tipadas de `Item`, `ConfigData` e afins. |
| `.eslintrc` | raiz do repositório | Estende `react-app/jest`, com as regras de lint de teste. |
| `.github/workflows/prod-deploy-app-on-harbor.yml` | `.github/workflows/` | Único workflow do repositório: compila e publica. |

## Restrições e armadilhas conhecidas

- **O portão é local e a revisão do pull request.** O único workflow do repositório
  roda `actions/checkout`, `actions/setup-node`, `yarn install --frozen-lockfile`,
  `yarn build`, a configuração de credenciais AWS e `aws s3 sync`. A suíte não é
  executada no CI: um teste quebrado chega a `main` se ninguém rodar `yarn test` antes
  do merge.
- **Dado vem de fixture, nunca de mock de rede.** `src/components/App.tsx` é o único
  ponto com `fetch` — três chamadas dentro do hook `useFetch`, para
  `db1-opinion.json`, `messages.json` e `config.json` — e devolve `null` enquanto os
  dados não chegam. Teste os componentes `Page*` direto, passando `items`, `releases` e
  `config` por props; não renderize `App` em teste.
- **`featuredOnly` esvazia a lista.** `PageIndex` e `PageQuadrant` renderizam apenas
  `featuredOnly(items)`. A fixture `src/components/Item/testData.tsx` traz
  `featured: false`; a fixture de página precisa de ao menos um item com
  `featured: true` para que a asserção encontre algo.
- **Formatação de data depende do idioma ativo.** `formatRelease` (`src/date.ts`)
  aplica `.locale(i18n.language)` antes de formatar, e o `i18next` só é inicializado
  quando `src/i18n` entra no grafo de imports do teste. Afirme sobre um formato
  independente de locale (`"DD.MM.YYYY"`) ou fixe o idioma no teste antes de esperar
  um nome de mês.
- **O gráfico é SVG escrito à mão e a suíte não o renderiza.** `RadarChart` e `QuadrantRings`
  importam `d3` e ficam fora do alcance do Jest deste projeto. `BlipPoints.tsx` fica fora pelo
  `query-string` que o `Link` de cada ponto traz, mesmo sem importar `d3`. O que é afirmável por
  teste são as funções puras de `geometry.ts` e de `blips.ts`; a conferência do SVG — valores de
  `d`, `cx`, `cy` e `transform` — é manual, comparando a página com o radar publicado.
- **A viewport do jsdom é móvel.** `isMobileViewport()` (`src/config.ts`) compara
  `window.innerWidth` com 1200, e o padrão do jsdom é 1024. Um teste que renderiza
  `Router` numa rota de item cai em `PageItemMobile`. Renderize o `Page*` desejado
  direto, ou ajuste `window.innerWidth` antes do render.
- **Item sem quadrante correspondente some em silêncio.** `buildBlips` descarta o item
  cujo `quadrant` não existe em `config.quadrantsMap`, sem erro. O teste que espera um
  blip deve usar uma fixture em que `item.quadrant` e `item.ring` existam no
  `ConfigData` passado.
