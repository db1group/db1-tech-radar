# Research: validação multi-quadrante e aceite ponta a ponta

Cada decisão não trivial do [`plan.md`](./plan.md), com contexto, alternativas, decisão, evidência e
consequências. A evidência é concreta: o arquivo lido, o comando rodado e o seu resultado.

## Transformar os pacotes ESM no Jest

**Contexto.** O Jest do `react-scripts` não transforma `node_modules`, e `d3` 7.8.0 e `query-string`
8.1.0 são publicados como ESM. Um teste que traz `RadarChart`, `RadarGrid` ou `App` ao grafo de
imports falha ao carregar, e o mesmo motivo mantém `src/components/Item/Item.test.tsx` vermelho na
base. Para travar o desenho montado com teste de integração, a suíte precisa alcançar esses módulos.

**Alternativas:**

- **`jest.transformIgnorePatterns` no `package.json`** — a chave `jest` suportada pelo Create React
  App permite reescrever a lista de padrões ignorados pela transformação, liberando os pacotes ESM
  para passarem pelo babel; sem dependência nova.
- **`moduleNameMapper` para versões CJS** — apontar `d3` e `query-string` para builds CommonJS; exige
  caçar e fixar caminhos internos de cada subpacote, frágil a atualização.
- **Mockar `d3` e `query-string`** — substitui o comportamento real por dublê; o teste de integração
  deixaria de exercitar a geometria e o roteamento reais, esvaziando a trava.

**Decisão.** `jest.transformIgnorePatterns` no `package.json`, com um padrão de negative lookahead que
libera para transformação `d3`, os pacotes `d3-*`, suas dependências ESM (`internmap`, `delaunator`,
`robust-predicates`) e `query-string` com as dependências dele (`decode-uri-component`,
`split-on-first`, `filter-obj`), preservando o padrão de CSS modules:

```json
"jest": {
  "transformIgnorePatterns": [
    "node_modules/(?!(d3|d3-[a-z-]+|internmap|delaunator|robust-predicates|query-string|decode-uri-component|split-on-first|filter-obj)/)",
    "^.+\\.module\\.(css|sass|scss)$"
  ]
}
```

**Evidência.**

- `node_modules/d3/package.json` traz `"type": "module"` e depende de 30 pacotes `d3-*`; cada um
  (`d3-array`, `d3-scale`, `d3-shape`, `d3-delaunay`, `d3-path`, …) traz `"type": "module"`;
  `internmap`, `delaunator`, `robust-predicates` (transitivas de `d3-array` e `d3-delaunay`) também.
- `node_modules/query-string/package.json` traz `"type": "module"` e depende de `decode-uri-component`,
  `split-on-first` e `filter-obj`, todos `"type": "module"`.
- `node_modules/react-scripts/scripts/utils/createJestConfig.js` lista `transformIgnorePatterns` em
  `supportedKeys` (linha 91) e lê `require(paths.appPackageJson).jest` (linha 73); por ser array, o
  override substitui o valor inteiro (linhas 97–99), então o padrão de CSS modules é reincluído de
  propósito. O padrão padrão (linhas 51–54) usa `node_modules` com separador, e o Jest normaliza o
  caminho para barra na correspondência, de modo que a forma com `/` casa também no Windows.
- Baseline, sem ajuste:
  `CI=true npx react-scripts test src/components/Item/Item.test.tsx --watchAll=false` →
  `Test suite failed to run … SyntaxError: Cannot use import statement outside a module` em
  `node_modules/query-string/index.js`.
- Com o padrão acima passado por `--transformIgnorePatterns` (sem gravar em disco):
  `Item.test.tsx` → `PASS` (1 teste).
- Suíte inteira com o mesmo override:
  `CI=true npx react-scripts test --watchAll=false --transformIgnorePatterns "<padrão>"` →
  `Test Suites: 1 failed, 11 passed`; `Tests: 2 failed, 178 passed`. O único vermelho é
  `src/date.test.tsx` (ver abaixo), que já falha na base por motivo próprio. Nenhum teste que passava
  antes passou a falhar.

**Consequências.** O desenho montado fica testável e `Item.test.tsx` passa sem ser editado. A
transformação de `node_modules` deixa a suíte um pouco mais lenta (cada suíte de componente roda em
5–10 s), aceitável para rodar localmente e no portão. O `jest.mock("../Link/Link")` usado em
`QuadrantLabel.test.tsx` e `QuadrantGrid.test.tsx` deixa de ser necessário para alcançar o `Link`,
mas continua válido como isolamento e esses testes seguem verdes.

## Destino do `src/date.test.tsx`

**Contexto.** `src/date.test.tsx` falha com dois testes, independentemente do ajuste de ESM. A spec
(História 3) delega ao plano decidir se o conserto entra nesta unidade.

**Alternativas:**

- **Consertar nesta unidade** — alteração só no arquivo de teste, sem tocar produção, deixando a
  suíte inteira verde e fechando o critério 6 da iniciativa ("lint e testes passando").
- **Deixar vermelho** — tratar como defeito pré-existente fora do escopo; a suíte segue com um
  vermelho, contrariando o critério 6.

**Decisão.** Consertar nesta unidade, com `import "./i18n";` no topo de `src/date.test.tsx`, para
inicializar o i18next antes de `formatRelease` ler `i18n.language`. Nenhum arquivo de produção muda.

**Evidência.**

- `src/date.ts` linha 12: `isoDateToMoment(isoDate).locale(i18n.language).format(format)`.
- `src/date.test.tsx` não importa `src/i18n`, então `i18n.language` é `undefined` quando o teste roda.
- Causa confirmada por `node -e`:
  `moment("2022-01-05","YYYY-MM-DD").locale(undefined)` devolve a string `"en"` (modo getter), e
  `.format` sobre ela é `undefined` → `TypeError: isoDateToMoment(...).locale(...).format is not a function`.
  `moment("2022-01-05","YYYY-MM-DD").locale("en").format("MMMM YYYY")` devolve `"January 2022"`.
- `src/i18n/index.ts` inicializa o i18next de forma síncrona (recursos embutidos, sem backend) com
  `fallbackLng: Language.en`. `src/i18n/translations.test.tsx` e `src/components/PageHelp/PageHelp.test.tsx`
  importam `src/i18n` e passam asserções em inglês na suíte, confirmando que `i18n.language` resolve
  para um locale inglês carregado no ambiente de teste. Com isso, `formatRelease` passa a formatar por
  `.locale("en")` e os dois casos (`"January 2022"` e `"05.01.2022"`) passam.

**Consequências.** A suíte inteira fica verde (180/180). O conserto segue a convenção da skill
`estrategia-de-testes`, que exige inicializar o i18next no teste quando a asserção depende do idioma
ativo.

## Aceite ponta a ponta sem dependência de E2E

**Contexto.** O aceite compara a home local com o site publicado e confere N = 3/5/6 e a configuração
inválida no navegador. A spec proíbe acrescentar dependência de E2E sem decisão explícita no plano.

**Alternativas:**

- **Aceite manual registrado no `test-cases.md`** — roteiro executado à mão no navegador, com o
  resultado de cada passo versionado; custo zero de dependência e manutenção.
- **Cypress/Playwright** — automação de navegador; acrescenta dependência pesada, runner próprio e
  manutenção, para um aceite que roda uma vez ao fechar a iniciativa.

**Decisão.** Aceite manual registrado no `test-cases.md`. Nenhuma dependência de E2E entra.

**Evidência.** `package.json` não traz Cypress, Playwright nem runner de E2E; a infraestrutura de
teste é a embutida no `react-scripts` 5. A iniciativa é a última entrega de um fork mantido por uma
pessoa, e a descrição da unidade pede justificar ao mantenedor qualquer dependência nova — custo que o
aceite único não compensa.

**Consequências.** A conferência visual (cores, cantos, numeração, legenda, grade, brilho sem fio sem
cor em N = 3) e a comparação por captura de tela ficam a cargo de quem executa o aceite, com o
resultado por passo no `test-cases.md`. A posição dos blips, sorteada a cada carga (R5), é conferida
por quadrante e anel, não por posição.
