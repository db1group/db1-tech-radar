# Plan: tradução de quadrante por slug

Visão técnica da unidade descrita em [`spec.md`](./spec.md).

## Stack e estrutura

A unidade trabalha dentro da SPA em React 18 com Create React App e TypeScript em modo `strict`,
sem acrescentar nem remover dependência. O texto de interface vive em
`src/i18n/translations/{pt,en,es}.json`, sob a raiz `translation`, importado em tempo de build por
`src/i18n/index.ts` e resolvido pelo `i18next` 22.5.1 com `react-i18next` 12.3.1 e
`fallbackLng: 'en'`. Os dois pontos de consumo da descrição longa são
`src/components/RadarGrid/RadarGrid.tsx`, no bloco de rótulo de cada canto da página inicial, e
`src/components/PageHelp/PageHelp.tsx`, na lista da página de ajuda.

A unidade altera uma chave e um parágrafo nos três dicionários, uma linha em `RadarGrid.tsx`, o
tipo e a iteração em `PageHelp.tsx`, e acrescenta dois arquivos de teste. Nenhum arquivo de
`public/` muda, nenhuma prop de componente de página muda e nenhuma rota é tocada.

Os imports seguem a ordenação do `prettier.config.js`: pacotes primeiro, depois um bloco separado
com os caminhos relativos, com os especificadores em ordem alfabética. A suíte roda na
infraestrutura Jest embutida no `react-scripts` 5, sem arquivo de configuração próprio, e o portão
de qualidade continua sendo `yarn ts:check`, `yarn lint` e `yarn test`.

## Decisões técnicas

Uma linha por veredito; contexto, alternativas e evidência em [`research.md`](./research.md).

- **Forma da chave**: `pageHelp.quadrants` vira `{ [slug]: { name, description } }` nos três
  dicionários, com as quatro entradas atuais declaradas na ordem de `quadrants` em
  `public/config.json` e os textos copiados sem alteração de caractere.
- **Ordem da lista da página de ajuda**: ordem de declaração no dicionário, consumida por
  `Object.entries` sobre o mapa devolvido pelo `i18next`, que preserva a ordem do arquivo do idioma
  ativo. A ordem fica presa por um caso de teste contra `public/config.json`, de modo que a
  taxonomia permanece a única origem da ordenação.
- **`PageHelp.tsx`**: o tipo `Quadrant` é substituído por `QuadrantHelpMap`
  (`{ [slug: string]: { name: string; description: string } }`), aplicado por asserção ao retorno
  de `t("pageHelp.quadrants", { returnObjects: true })`; a lista é montada por
  `Object.entries(...).map(([slug, { name, description }]) => ...)`, com `slug` como `key` do `li`.
  As props `leaving` e `onLeave` ficam como estão e `config` não é levado até a página.
- **`RadarGrid.tsx`**: a descrição do bloco de rótulo passa a ser
  ``t(`pageHelp.quadrants.${quadrantName}.description`)``, usando o slug que `QuadrantLabel` já
  recebe em `quadrantName`. A linha que lê `pageHelp.quadrants` com `returnObjects` e a tipa como
  `QuadrantConfig[]` sai, junto com a indexação por `quadrantConfig.position - 1` e com a segunda
  passagem do texto por `t`. `stylesMap`, o número exibido e o atalho de aproximação ficam
  intocados.
- **Sem módulo extraído para a leitura da descrição**: a chave composta fica no próprio
  `RadarGrid.tsx`. A resolução dessa chave é exercitada sobre a instância real do `i18next` pelo
  teste de consistência, que não traz `d3` ao grafo de importação.
- **Parágrafo do agrupamento**: `pageHelp.paragraphs[3].values[3]`, da seção "Como deve ser usado",
  perde o numeral nos três idiomas; o restante da frase, inclusive o parêntese sobre o melhor
  encaixe, fica idêntico. É o único ponto dos dicionários que afirma uma quantidade de quadrantes.
- **Teste de consistência**: `src/i18n/translations.test.tsx`, importando
  `../../public/config.json`, os três dicionários de `./translations/` e `./index` — os arquivos
  reais, nunca uma cópia de fixture. O JSON importado é tratado por asserção estrutural, seguindo o
  `as unknown as ConfigData` já em uso em `geometry.test.tsx`.
- **Teste de componente**: `src/components/PageHelp/PageHelp.test.tsx`, com `render` sem
  `MemoryRouter` e sem provedor de contexto, importando `src/i18n` e fixando o idioma antes de cada
  asserção.
- **Sem troca de `REACT_APP_BUILDHASH`**: os dicionários são compilados dentro do pacote e chegam
  ao navegador com ele; a querystring de invalidação serve aos três `fetch` de `public/`, que esta
  unidade não toca.
- **`research.md`**: gerado, em [`research.md`](./research.md) — o comportamento do `i18next` sobre
  o mapa por slug, a ordem das chaves devolvidas e o alcance da suíte são medições, e guardá-las
  fora do plano mantém o veredito legível.

## Modelo de dados

Nenhuma alteração de contrato de dados: `public/config.json`, `ConfigData` e `QuadrantConfig`
ficam como estão, e a unidade consome `quadrants` e `quadrantsMap`, que já existem. A forma do
texto traduzido muda apenas dentro dos dicionários e está registrada acima em uma linha.
`data-model.md` fica dispensado.

## Contratos externos

Nenhum. A aplicação não expõe nem consome API, e os arquivos de `public/` são lidos pelo próprio
navegador a partir do mesmo domínio. `contracts/` fica dispensado.

## Interface

Duas telas são tocadas e nenhuma muda de estrutura, de fluxo ou de estado. A página inicial
continua com quatro blocos de rótulo, cada um com o número, o atalho de aproximação, a linha
colorida, o rótulo e a descrição, nos mesmos cantos. A página de ajuda continua com a mesma lista
não ordenada, com o nome em negrito seguido da descrição sanitizada, na mesma ordem. O único texto
diferente é a frase do agrupamento, sem o numeral. `ui/` fica dispensado.

## Estratégia de testes

A infraestrutura já existe e nada novo é introduzido: Jest e Testing Library vêm do
`react-scripts` 5, `src/setupTests.ts` é carregado automaticamente e a descoberta cobre qualquer
`*.test.tsx` sob `src/`. Os dois arquivos desta unidade ficam ao lado do código, com extensão
`.tsx` e nomes de caso em inglês, conforme a skill `estrategia-de-testes`.

- **Unitário, `src/i18n/translations.test.tsx`** — novo arquivo, sem `d3` e sem renderizar
  componente:
  - **Forma da chave** — `Array.isArray(pageHelp.quadrants)` é falso nos três dicionários.
  - **Conjunto de slugs da taxonomia** — `Object.keys(config.quadrants)` e
    `Object.keys(config.quadrantsMap)` declaram o mesmo conjunto.
  - **Cobertura de tradução** — para cada slug declarado em `public/config.json` e cada um dos três
    dicionários, `quadrants.<slug>` é texto não vazio e `pageHelp.quadrants.<slug>` traz `name` e
    `description` não vazios. É o caso que pega o esquecimento de tradução ao acrescentar um
    quadrante.
  - **Sem slug órfão** — toda chave de `quadrants` e de `pageHelp.quadrants`, nos três
    dicionários, existe entre os quadrantes declarados na taxonomia.
  - **Ordem declarada** — `Object.keys(pageHelp.quadrants)` dos três dicionários é igual a
    `Object.keys(config.quadrants)`, elemento a elemento. É este caso que prende a ordem da lista
    da página de ajuda.
  - **Resolução por slug** — com `i18n.changeLanguage` em `pt`, `en` e `es`, e para cada slug,
    ``t(`pageHelp.quadrants.${slug}.description`)`` devolve o texto do dicionário daquele idioma e
    é diferente da própria chave. É o caso que exercita a expressão usada pelo bloco de rótulo.
  - **Agrupamento sem numeral** — o texto de `pageHelp`, nos três dicionários, não casa com
    `/\d+\s+(quadrantes|quadrants|cuadrantes)/i`.
- **Componente, `src/components/PageHelp/PageHelp.test.tsx`** — novo arquivo:
  - **Nomes e descrições em `pt`** — com o idioma fixado, os quatro nomes e as quatro descrições
    publicadas aparecem no documento.
  - **Ordem exibida** — os itens da lista de quadrantes aparecem na ordem "Linguagens e
    frameworks", "Métodos e padrões", "Plataformas e operações" e "Ferramentas".
  - **A lista acompanha o dicionário** — com um pacote de idioma acrescentado por
    `i18n.addResourceBundle` sob um código próprio, trazendo cinco slugs em `pageHelp.quadrants`, a
    lista renderiza cinco itens; as demais chaves da página vêm do idioma de recurso. O idioma é
    devolvido ao valor anterior ao fim do caso.
- **Conferência visual** — com `yarn start`, nos três idiomas: na página inicial, cada bloco de
  rótulo exibe o número do seu quadrante, o rótulo e a descrição correspondente, nos mesmos cantos
  de hoje; na página de ajuda, a lista de quadrantes traz os quatro nomes e descrições na ordem
  publicada, e a frase do agrupamento aparece sem numeral. A comparação é contra
  `techradar.db1.com.br`, aberto lado a lado.
- **Conferência com cinco quadrantes** — feita depois do commit da unidade, sobre a cópia local, em
  três passos: acrescentar um quinto quadrante aos dois mapas de `public/config.json` (`position`
  5, `order` 5, cor própria); acrescentar a entrada do slug novo em `quadrants` e em
  `pageHelp.quadrants` nos três dicionários; abrir a página inicial e a página de ajuda com
  `yarn start` e conferir que nenhum `TypeError` é lançado, que os quatro blocos publicados seguem
  com o seu texto e que a página de ajuda lista cinco quadrantes nos três idiomas. O bloco de
  rótulo do quinto quadrante aparece sem posicionamento correto, o que é esperado nesta unidade.
  Os arquivos voltam ao estado versionado com `git restore` ao fim.
- **Portão de qualidade** — `yarn ts:check` e `yarn lint` terminam limpos e precisam continuar
  assim, com `CI=true` tratando aviso do ESLint como erro no build do GitHub Actions; `yarn build`
  compila. A execução de `CI=true npx react-scripts test --watchAll=false` na base devolve
  `PASS` para `blips.test.tsx`, `sanitize.test.tsx` e `geometry.test.tsx` e `FAIL` para
  `Item.test.tsx` — por transformação de ESM de `query-string` — e `date.test.tsx` — por `moment`:
  2 suítes em falha, 3 passando, 92 casos verdes em 94. A exigência é que
  `translations.test.tsx` e `PageHelp.test.tsx` passem inteiros e que nenhuma suíte que passava
  entre em falha.

## Impacto na documentação autoritativa

Esta unidade troca deliberadamente o endereçamento posicional da descrição de quadrante por
endereçamento por slug, com a decisão registrada na descrição da unidade e apoiada na
[ADR 0001](../../../docs/adr/0001-geometria-configuravel-do-grafico.md), que estabelece a
quantidade de quadrantes como escolha de configuração e prevê que acrescentar um quadrante seja
declarar slug, cor, `position`, `order` e o rótulo com a descrição nos três idiomas. Cada item
abaixo vira tarefa de documentação na fase `tasks`, executada junto com o código.

- **`.agents/skills/taxonomia-de-quadrantes-e-aneis/SKILL.md`** — em *Entidades e dados*, a linha
  de `pageHelp.quadrants` passa a descrever um mapa `slug → { name, description }`, e o parágrafo
  que afirma que as duas listas de descrição são posicionais passa a valer apenas para a de anéis,
  que continua ordenada do centro para a borda. A regra 8 registra que rótulo curto e descrição
  longa são ambos endereçados pelo slug. No fluxo *Acrescentar um quadrante*, o passo 4 passa a
  pedir a entrada do slug nos três dicionários, e a observação final deixa de citar a lista
  posicional, restando o bloco de rótulo nos cantos como o que pressupõe quatro posições. Em
  *Restrições e validações*, a restrição do número de quadrantes atribui o limite ao bloco de
  rótulo nos cantos, e a restrição dos três idiomas obrigatórios passa a dizer que o slug sem
  entrada no dicionário do idioma ativo desaparece da página de ajuda e cai no inglês no bloco de
  rótulo.
- **`.agents/skills/visualizacao-do-radar/SKILL.md`** — a regra 12 passa a dizer que o bloco de
  rótulo lê a descrição longa pelo slug do quadrante que apresenta, mantendo a posição exibida como
  o número e o canto. A regra 16 registra que o que resta preso a quatro posições é o canto do
  bloco de rótulo. No fluxo *Acrescentar um quadrante ao desenho*, o passo 2 passa a pedir a
  entrada do slug nos três dicionários e o passo 3 restringe a migração pendente aos blocos de
  rótulo nos cantos. Em *Restrições e validações*, a restrição sobre a lista posicional de
  descrições passa a descrever a cobertura por slug e o que acontece quando ela falta.
- **`.agents/skills/internacionalizacao-do-radar/SKILL.md`** — em *Adicionar ou renomear uma chave
  de interface*, `pageHelp.quadrants` sai da lista de valores em lista cujo número de elementos
  precisa coincidir, e a enumeração dos dicionários indexados pelo slug do dado passa a incluir
  `pageHelp.quadrants.<slug>` ao lado de `quadrants.<slug>`, `rings.<anel>` e `flags.<flag>`. Em
  *Restrições e armadilhas conhecidas*, a armadilha da estrutura fora de sincronia passa a
  registrar que a ausência de um slug no idioma ativo o faz sumir da página de ajuda, enquanto a
  leitura por chave composta de folha cai no inglês.
- **`.agents/skills/governanca-de-contribuicao-do-radar/SKILL.md`** — em *Texto da página de
  ajuda*, a frase que remete as duas listas de eixos à taxonomia passa a nomear o mapa de
  descrições de quadrante endereçado por slug e a lista de descrições de anel. Em *Restrições e
  validações*, a restrição sobre o texto do processo em todos os idiomas acompanha a mesma
  distinção.
- **`.agents/maps/functional-map.md`** — na seção do domínio Governança de Contribuição do Radar, a
  dependência técnica da chave `pageHelp` passa a distinguir o mapa de quadrantes endereçado por
  slug das listas narrativas. Na seção do domínio Visualização do Radar, a dependência técnica que
  cita o andamento da reescrita nomeia também a branch `feat/us5-i18n-by-slug`.
- **`AGENTS.md`** — em *Restrições globais*, a restrição dos quatro quadrantes deixa de atribuir o
  limite às listas posicionais de descrição dos dicionários de tradução, restando os blocos de
  rótulo em `src/components/RadarGrid` e a ausência de validação da configuração. A exigência de
  manter o desenho idêntico ao publicado com quatro quadrantes e o ponteiro para a ADR 0001
  permanecem.
- **`.agents/skills/registros-de-decisao-arquitetural/SKILL.md`** — no gatilho *Geometria do
  gráfico*, a lista de branches da reescrita em andamento acompanha esta unidade.

Sem ADR nova: a ADR 0001 já decide que acrescentar um quadrante é alteração de configuração com o
rótulo e a descrição nos três idiomas; esta unidade executa essa decisão, não a altera nem a
substitui. Sem impacto em `.agents/skills/estrategia-de-testes/SKILL.md`: nada do que ela afirma
deixa de valer — `RadarGrid` e `RadarChart` continuam fora do alcance da suíte pelo `d3`, a
colocação dos arquivos de teste segue a regra descrita e o portão de qualidade não muda. Sem
impacto em `.agents/skills/catalogo-de-opinioes-tecnologicas/SKILL.md`,
`.agents/skills/navegacao-e-descoberta-de-tecnologias/SKILL.md`,
`.agents/skills/publicacao-e-distribuicao-do-radar/SKILL.md`,
`.agents/skills/identidade-institucional-db1/SKILL.md`, `CONTRIBUTING.md` e `.env`: o acervo, as
telas de navegação, o caminho de publicação, o conteúdo institucional, o processo dirigido a quem
contribui e as variáveis de build ficam como estão.
</content>
