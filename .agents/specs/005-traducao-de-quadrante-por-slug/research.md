# Research: tradução de quadrante por slug

Contexto, alternativas e evidência de cada decisão não trivial da unidade descrita em
[`spec.md`](./spec.md). Os vereditos estão em [`plan.md`](./plan.md).

## Forma de `pageHelp.quadrants` nos dicionários

**Contexto.** A descrição longa de cada quadrante precisa deixar de ser endereçada pela ordem de
uma lista. Duas formas resolvem isso: um objeto endereçado pelo slug e uma lista em que cada item
carrega o seu próprio slug.

**Alternativas:**

- **Objeto `{ [slug]: { name, description } }`** — o endereço é a própria chave; a leitura de uma
  descrição é uma chave de tradução composta, sem varredura.
- **Lista de `{ slug, name, description }`** — preserva a forma de lista das demais chaves de
  `pageHelp`; exige varrer a lista procurando o slug a cada leitura e permite slug repetido ou
  ausente sem que a estrutura acuse.

**Decisão:** objeto endereçado pelo slug.

**Evidência:** a descrição da unidade fixa a forma, com o JSON escrito por quem solicitou a
mudança, sem reserva. O `i18next` 22.5.1 instalado sustenta a leitura nos dois modos que a
aplicação precisa — ver a seção seguinte.

**Consequências:** o slug passa a ser a única chave que liga a taxonomia ao texto traduzido, para
o rótulo curto (`quadrants.<slug>`) e para a descrição longa
(`pageHelp.quadrants.<slug>`). As demais chaves de `pageHelp` continuam listas.

## Comportamento do `i18next` sobre um mapa endereçado por slug

**Contexto.** Duas leituras dependem do mesmo mapa com formas diferentes: a página de ajuda pede a
estrutura inteira com `returnObjects`, e o bloco de rótulo pede uma folha por chave composta. A
ordem das entradas devolvidas e o comportamento do idioma de recurso decidem a estratégia de
ordenação e a de proteção contra tradução faltante.

**Evidência.** Execução do `i18next` 22.5.1 instalado, com um mapa de quatro slugs em `en` e um
mapa parcial de dois slugs em `pt`, `fallbackLng: 'en'`:

```
isArray: false
keys(pt): tools,languages-and-frameworks
entry shape: {"name":"Ferramentas","description":"desc PT tools"}
leaf missing in pt, fallback en: desc MP
leaf present in pt: desc PT tools
keys(en): languages-and-frameworks,methods-and-patterns,platforms-and-operations,tools
unknown slug: pageHelp.quadrants.nope.description
```

O trecho correspondente do tradutor, em
`node_modules/i18next/dist/cjs/i18next.js`, monta a cópia percorrendo as chaves do objeto
resolvido e traduzindo cada uma pela chave profunda:

```js
var copy = resTypeIsArray ? [] : {};
for (var m in res) {
  if (Object.prototype.hasOwnProperty.call(res, m)) {
    var deepKey = "".concat(newKeyToUse).concat(keySeparator).concat(m);
    copy[m] = this.translate(deepKey, ...);
```

**O que isso estabelece:**

- `returnObjects` devolve um objeto, não uma lista, e a ordem das chaves é a ordem de declaração
  do dicionário do **idioma ativo** — `for...in` sobre chaves não numéricas percorre a ordem de
  inserção, e o `JSON.parse` do pacote preserva a ordem textual do arquivo.
- O aninhamento de dois níveis é resolvido: cada entrada volta como `{ name, description }`.
- O recurso por idioma não atua **dentro** da estrutura: um slug presente só em `en` não aparece
  no mapa devolvido em `pt`. É a mesma armadilha já registrada para `pageHelp.paragraphs`.
- A leitura por chave composta de folha **tem** recurso por idioma: a descrição ausente em `pt`
  volta em `en`. Ausente nos três, volta a própria chave como texto.
- O hífen do slug não interfere: o separador de chave é o ponto e o de namespace é o dois-pontos.

**Consequências:** a página de ajuda, que lê a estrutura inteira, depende de os três dicionários
declararem o mesmo conjunto de slugs, e é o teste de consistência que garante isso. O bloco de
rótulo, que lê a folha, degrada para o inglês e, no pior caso, para a chave crua — sem derrubar a
página inicial.

## Origem da ordem da lista da página de ajuda

**Contexto.** A lista precisa sair na ordem publicada hoje — `languages-and-frameworks`,
`methods-and-patterns`, `platforms-and-operations`, `tools` — e a spec exige que essa ordem não
dependa de comportamento implícito sem teste.

**Alternativas:**

- **Ordem de declaração no dicionário**, consumida por `Object.entries` sobre o mapa devolvido.
  Não mexe no contrato de `PageHelp`. A ordem pode divergir entre os três idiomas e da taxonomia
  sem que nada acuse, a menos que um teste a prenda.
- **Ordem da `position` declarada em `public/config.json`.** Fonte única e explícita, mas exige
  levar a configuração até `PageHelp`, que hoje recebe apenas `leaving` e `onLeave`, e amarra uma
  lista de texto ao número que decide o canto do bloco de rótulo — papel que a unidade seguinte
  revisita.

**Decisão:** ordem de declaração no dicionário, com um caso de teste afirmando que os três
dicionários declaram os slugs exatamente na ordem de `quadrants` em `public/config.json`.

**Evidência:** a execução acima mostra `keys(en)` na ordem de declaração do arquivo. A taxonomia
já estabelece que a ordem de declaração do mapa de nomes é a ordem das listagens por quadrante
(`.agents/skills/taxonomia-de-quadrantes-e-aneis/SKILL.md`, *Entidades e dados*), de modo que
prender o dicionário a essa ordem mantém `public/config.json` como a única origem da ordenação.
`src/components/Router.tsx` confirma que `PageHelp` é montado sem `config`.

**Consequências:** `PageHelp` mantém as duas props atuais; a ordenação vira invariante verificada
em vez de efeito colateral da estrutura de dados. Acrescentar um quadrante exige declará-lo na
mesma posição relativa nos três dicionários, e o teste acusa quem esquecer.

## Leitura da descrição no bloco de rótulo

**Contexto.** A spec permite extrair a leitura para uma função pura, para que a suíte alcance um
ponto que hoje só a conferência visual cobre: `RadarGrid.tsx` importa `RadarChart`, que importa
`d3` 7.8.0, publicado como ESM e fora do alcance do transform do Jest deste projeto.

**Alternativas:**

- **Chave composta direto no componente** — `t(\`pageHelp.quadrants.${slug}.description\`)`, uma
  linha, sem módulo novo. A expressão em si fica fora da suíte.
- **Módulo puro com a montagem da chave** — alcançável pela suíte, ao custo de um módulo cuja
  única lógica é concatenar o slug em um texto.

**Decisão:** chave composta direto em `src/components/RadarGrid/RadarGrid.tsx`.

**Evidência:** a skill `estrategia-de-testes` registra o critério já praticado no repositório —
"cálculo novo do desenho que precise de cobertura automática nasce em `geometry.ts`, como função
pura sobre números; o que depende das escalas `d3` fica como função de módulo no componente,
verificado pela conferência visual do pull request". Aqui não há cálculo: a leitura é uma chave de
tradução. O risco real — slug declarado sem tradução — é coberto pelo teste de consistência, e a
resolução da chave composta é exercitada pelo caso que resolve
`pageHelp.quadrants.<slug>.description` para cada slug e cada idioma sobre a instância real do
`i18next`, sem trazer `d3` ao grafo de importação.

**Consequências:** nenhum módulo novo nasce para ser testado. O que a suíte não alcança é a
montagem do JSX do bloco de rótulo, conferida visualmente, como já acontece com o restante do
desenho.

## Alcance da suíte sobre `PageHelp`

**Contexto.** A spec exige teste de componente da página de ajuda, e vários componentes deste
repositório estão fora do alcance do Jest por dependência ESM.

**Evidência:** `PageHelp.tsx` importa `sanitize`, `Fadeable`, `HeroHeadline`, `SetTitle` e
`react-i18next`. As importações diretas desses quatro módulos são `sanitize-html`, `classnames`,
`react` e `react-i18next` — nenhuma traz `d3`, `query-string`, `moment` ou `react-router-dom`.
`Fadeable` renderiza os filhos na primeira passagem, com `leaving={false}`, sem esperar transição.
A execução de `CI=true npx react-scripts test --watchAll=false` na base devolve `PASS` para
`blips.test.tsx`, `sanitize.test.tsx` e `geometry.test.tsx`, e `FAIL` para `Item.test.tsx` — por
`query-string` trazido pelo `Link` — e `date.test.tsx` — por `moment`: 2 suítes em falha, 3
passando, 92 casos verdes em 94.

**Decisão:** teste de componente em `src/components/PageHelp/PageHelp.test.tsx`, renderizando a
página sem `MemoryRouter` e sem provedor de contexto.

**Consequências:** a página de ajuda passa a ter cobertura automática de conteúdo e de ordem. O
bloco de rótulo da página inicial permanece fora da suíte.

## Leitura dos arquivos reais pelo teste

**Contexto.** O teste de consistência precisa comparar a taxonomia publicada com os três
dicionários, e uma cópia de fixture deixaria de acusar justamente o esquecimento que ele existe
para pegar.

**Evidência:** `src/components/Chart/blips.test.tsx` e `geometry.test.tsx` já importam
`../../../public/config.json` e `../../../public/db1-opinion.json` e passam na suíte;
`tsconfig.json` traz `resolveJsonModule: true`, e `yarn ts:check` cobre esses arquivos. O padrão
em vigor para tipar o JSON importado é `realConfig as unknown as ConfigData`, em
`geometry.test.tsx`.

**Decisão:** `src/i18n/translations.test.tsx` importa `../../public/config.json` e os três
dicionários de `./translations/`, e importa `./index` para exercitar a resolução pelo `i18next`
real.

**Consequências:** acrescentar um quadrante a `public/config.json` sem traduzi-lo quebra a suíte
sem que nada precise ser duplicado no teste.

## Tipagem do mapa em TypeScript

**Contexto.** `t("pageHelp.quadrants", { returnObjects: true })` devolve um tipo amplo, e o
componente precisa de uma forma concreta para percorrer. Os dicionários importados como JSON têm
tipo inferido literal, com as chaves com hífen, o que impede indexar por um slug vindo de variável.

**Decisão:** tipo local `QuadrantHelpMap` em `PageHelp.tsx`, aplicado por asserção ao retorno de
`t`; no arquivo de teste, os dicionários importados são tratados por uma asserção estrutural
equivalente.

**Evidência:** `PageHelp.tsx` já aplica `as Quadrant[]` ao mesmo retorno, e `Quadrant[]` é tipo de
objeto — a asserção para um mapa de objetos é aceita pelo mesmo motivo. `geometry.test.tsx` já usa
`as unknown as ConfigData` sobre JSON importado. Nenhuma das duas formas exige `any`, o que
mantém o ESLint limpo com `CI=true`.

**Consequências:** nenhuma dependência de tipagem de recursos do `i18next` é introduzida; o
contrato continua declarado no componente que o consome.
</content>
