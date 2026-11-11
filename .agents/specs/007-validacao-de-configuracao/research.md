# Research: validação de configuração com erro legível

Para cada decisão não trivial: contexto, alternativas, decisão, razão, a evidência que a fecha e as
consequências.

## Origem da verificação das traduções

**Contexto.** A regra exige que cada slug de quadrante tenha `quadrants.<slug>` e
`pageHelp.quadrants.<slug>` com `name` e `description` nos três idiomas (`pt`, `en`, `es`). A
função de validação precisa consultar as traduções sem deixar de ser pura e sem importar `d3`.

**Alternativas:**

- **i18next já carregado** — `i18n.exists(key, { lng })`, com o i18n inicializado com os três
  dicionários em `src/i18n/index.ts`.
- **Dicionários importados** — `validateConfig` importa `pt.json`/`en.json`/`es.json` e caminha
  pelas chaves, como `src/i18n/translations.test.tsx` faz.
- **Predicado injetado** — `validateConfig` recebe `(key, lng) => boolean` e não conhece a origem;
  quem chama decide.

**Decisão:** predicado injetado. Em `src/components/App.tsx` o predicado é
`(key, lng) => i18n.exists(key, { lng })`; na suíte, um predicado sobre os dicionários importados,
com a mesma semântica de "valor presente e não vazio".

**Evidência:** `node_modules/i18next/dist/cjs/i18next.js` define `exists(key, options)` como
`this.resolve(key, options)` seguido de `resolved.res !== undefined`; `resolve` usa `options.lng`
para escolher o idioma e o separador padrão `.` para caminhar chaves aninhadas, de modo que
`i18n.exists("pageHelp.quadrants.<slug>.name", { lng: "es" })` devolve `false` quando a folha falta
naquele idioma. `src/i18n/index.ts` inicializa o i18n com `resources` para `en`, `pt` e `es`, então
os três bundles estão carregados quando o `config` chega por `fetch`. Os slugs não contêm ponto, o
que mantém a chave aninhada íntegra.

**Consequências:** `validateConfig` fica pura e sem `d3`; a suíte roda sem depender do estado de
idioma do i18n, lendo os dicionários direto; a produção reaproveita os bundles já carregados.

## Relação com a suíte de consistência dos dicionários

**Contexto.** `src/i18n/translations.test.tsx` já confere a consistência dos dicionários contra a
taxonomia. A unidade não pode duplicar essa regra.

**Alternativas:**

- **Função compartilhada** entre a validação de runtime e a suíte dos dicionários.
- **Superfícies separadas** — cada uma cobre o que lhe cabe, sem código comum.

**Decisão:** superfícies separadas. `validateConfig` é dona da regra "a configuração carregada tem
tradução de cada quadrante nos três idiomas", expressa uma vez, pelo predicado injetado.
`translations.test.tsx` segue conferindo o que `validateConfig` não cobre: slug órfão no dicionário
(presente na tradução e ausente na taxonomia), ordem das entradas de `pageHelp.quadrants` e a
ausência de número de quadrantes no texto da página de ajuda.

**Evidência:** `translations.test.tsx` lê os dicionários como dado e cobre órfãos e ordem
(`should not describe a quadrant the taxonomy does not declare`,
`should declare the quadrant help entries in the taxonomy order`); nada ali valida um `ConfigData`
recebido em runtime. As duas superfícies não se sobrepõem em código, só concordam que a configuração
publicada está completa.

**Consequências:** a suíte dos dicionários fica intocada; a regra de completude da configuração vive
só em `validateConfig`.

## Formato do problema devolvido

**Contexto.** Cada problema precisa de mensagem legível que nomeie campo, slug e valor; `App` os
registra em `console.error` e a tela de erro os lista.

**Alternativas:**

- **`string[]`** — cada item é a mensagem pronta.
- **Objeto estruturado** (`{ field, slug, value, message }`) — permite formatar depois.

**Decisão:** `string[]`. A mensagem é montada dentro de `validateConfig`, nomeando campo, slug e
valor.

**Evidência:** os consumidores — `console.error(problem)` e a lista `<li>` da tela de erro — só
precisam do texto; a suíte afirma a presença de trechos (o slug, o idioma) na mensagem. Um objeto
estruturado acrescentaria formatação sem consumidor que a peça.

**Consequências:** sem novo tipo de dado exportado; `data-model.md` fica dispensado.

## Reuso de `segmentCount` e `slotOf`

**Contexto.** A contagem de quadrantes e o slot de tela resolvido (que cai para `position` quando
`order` falta) já têm origem única em `src/components/Chart/geometry.ts`. A validação precisa dos
dois sem arrastar `d3` para o grafo de importação da suíte.

**Decisão:** `validateConfig` importa `segmentCount` e `slotOf` de
`src/components/Chart/geometry.ts`.

**Evidência:** `geometry.ts` importa apenas `ConfigData` de `../../config` e `Point, QuadrantConfig`
de `../../model`; nenhum deles importa `d3`. O `d3` entra só em `RadarChart.tsx`, `QuadrantRings.tsx`
e `BlipShapes.tsx`, fora do grafo de `geometry.ts`.

**Consequências:** a contagem e o slot validados são exatamente os que o desenho usa; a suíte carrega
sem o erro de ESM que derruba `Item.test.tsx`.

## Alcance do passo de teste no deploy

**Contexto.** A decisão registrada torna o teste do `public/config.json` real uma trava de
publicação, acrescentando um passo ao workflow de deploy. O comando precisa falhar o deploy quando a
configuração publicada for inválida, sem quebrar por uma condição pré-existente.

**Alternativas:**

- **Suíte inteira** — `yarn test` (`react-scripts test --watchAll=false`), que roda todos os
  `*.test.tsx`.
- **Só a suíte de validação** — `CI=true yarn test src/validateConfig.test.ts`.

**Decisão:** só a suíte de validação, num passo entre a instalação e a compilação de
`.github/workflows/prod-deploy-app-on-harbor.yml`:
`CI=true yarn test src/validateConfig.test.ts`.

**Evidência:** `package.json` define `test` como `react-scripts test --watchAll=false`, que descobre
todos os arquivos de teste; `Item.test.tsx` e `date.test.tsx` falham na base por transformação de
ESM de `query-string` e de `moment` — condição registrada e não alterada por esta unidade. Rodar a
suíte inteira faria a trava falhar por esses dois arquivos, sem relação com a configuração.
`validateConfig.test.ts` importa `public/config.json`, os dicionários, `validateConfig` e, por ele,
`geometry.ts` — nenhum arrasta `d3` nem `query-string` —, então roda limpo no CI.

**Consequências:** o passo falha o deploy exatamente quando a configuração publicada é inválida; as
duas suítes vermelhas da base não entram na trava.

## Idioma da tela de erro

**Contexto.** Os textos fixos da tela (título e instrução) e as mensagens de cada problema precisam
de um idioma. O público da tela é quem edita a configuração, não o leitor do radar.

**Alternativas:**

- **Três dicionários** — somar título e instrução a `pt`, `en` e `es`.
- **Um idioma só**, fixo no componente e na validação.

**Decisão:** um idioma só — inglês —, escrito no componente da tela de erro e nas mensagens de
`validateConfig`, fora dos dicionários de tradução.

**Razão e evidência:** a tela só aparece para quem quebrou a configuração (um mantenedor do
`public/config.json`), nunca no site publicado; `src/i18n/index.ts` já define `fallbackLng: en`; as
mensagens nomeiam campos (`quadrantsMap`, `order`, `ringsAttributes`) e slugs, que são identificadores
em inglês. Somar o texto aos três dicionários o espalharia pelo dado trilíngue sem benefício para o
leitor e o sujeitaria à própria regra de completude que esta unidade valida.

**Consequências:** o texto fica fora da regra de tradução dos três idiomas; a tela de erro não
depende do i18n para renderizar.

## Estado de carga e de erro no `useFetch`

**Contexto.** Hoje `useFetch` devolve `D | undefined`, em que `undefined` é tanto "carregando" quanto
"falhou", e registra a URL e a resposta a cada carregamento. A unidade precisa distinguir falha de
carregamento para mostrar a tela de erro, sem alterar o comportamento com dados válidos.

**Alternativas:**

- **Lançar e capturar com um limite de erro de React** — muda a arquitetura de montagem.
- **Objeto `{ data, error }`** — o hook sinaliza os dois estados.

**Decisão:** `useFetch` devolve `{ data?: D; error?: boolean }`. A falha é detectada por
`!response.ok` (rede e 404) e pela exceção de `response.json()` (JSON inválido); os dois `console.log`
de depuração saem e a falha é registrada por `console.error`. Em `App`, qualquer um dos três com
`error` renderiza a tela de erro; enquanto o acervo ou a configuração não chegam, `App` devolve
`null`, como hoje; com os dois presentes, roda `validateConfig`.

**Evidência:** `src/components/App.tsx` hoje renderiza quando `data && config`, sem exigir
`messages`; manter `messages` sem bloquear a renderização, mas tratar o seu `error`, preserva o
comportamento publicado e cobre o critério de falha de `messages.json`. `fetch` resolve com
`response.ok === false` em 404 e rejeita em falha de rede; `response.json()` lança em corpo não-JSON.

**Consequências:** a tela branca permanente dá lugar à tela de erro em qualquer falha de carga; o
caminho feliz com configuração válida fica idêntico ao de hoje.
</content>
