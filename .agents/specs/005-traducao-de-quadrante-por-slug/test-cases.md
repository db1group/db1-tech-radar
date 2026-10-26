# Casos de teste: tradução de quadrante por slug

Catálogo derivado de [`spec.md`](./spec.md) e [`plan.md`](./plan.md), agrupado pelas cinco
histórias de usuário da spec. A unidade atravessa três domínios: **Taxonomia de Quadrantes e
Anéis**, dona do endereçamento do texto de cada eixo; **Visualização do Radar**, dono do bloco de
rótulo que exibe a descrição na página inicial; e **Governança de Contribuição do Radar**, dono do
texto público da página de ajuda.

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
  `yarn test` acusa 5 suítes — 3 passando e 2 falhando — com 94 testes, 92 passando e 2 falhando.
  Passam `src/components/Chart/blips.test.tsx`, `src/components/Chart/geometry.test.tsx` e
  `src/sanitize.test.tsx`. Falham `src/date.test.tsx`, nos dois casos de `formatRelease`, por
  transformação de ESM de `moment`, e `src/components/Item/Item.test.tsx`, que nem carrega, com
  `SyntaxError: Cannot use import statement outside a module`, por `query-string`.
- Navegador de desktop, com a janela em pelo menos 800 px de largura; abaixo disso o conjunto da
  visualização fica oculto e a página inicial mostra só as listagens.
- Aplicação servida por `yarn start` em `localhost:3000`. A página inicial é a raiz; a página de
  ajuda é `/help-and-about-tech-radar.html`, alcançável pelo atalho de ajuda do cabeçalho. O idioma
  é trocado pelas bandeiras do cabeçalho, e a escolha fica guardada no navegador.
- Radar publicado em `techradar.db1.com.br` aberto em outra aba, para a comparação de texto nos
  três idiomas.
- Slugs declarados em `public/config.json`, na ordem de declaração de `quadrants`:
  `languages-and-frameworks`, `methods-and-patterns`, `platforms-and-operations` e `tools`, com as
  posições exibidas 1, 2, 3 e 4, nesta ordem.
- Rótulos curtos em português, de `quadrants.<slug>`: "Linguagens & Frameworks", "Métodos &
  Padrões", "Plataformas & Operações" e "Ferramentas".
- Nomes longos em português, de `pageHelp.quadrants.<slug>.name`: "Linguagens e frameworks",
  "Métodos e padrões", "Plataformas e operações" e "Ferramentas".

## História 1 — a descrição endereçada pelo slug

### TC-1 (obrigatório) — os três dicionários declaram um mapa por slug

1. Abra `src/i18n/translations/pt.json` e localize `translation.pageHelp.quadrants`.
2. Repita em `src/i18n/translations/en.json` e em `src/i18n/translations/es.json`.
3. No terminal, na raiz do repositório, rode
   `node -e "['pt','en','es'].forEach(l=>{const q=require('./src/i18n/translations/'+l+'.json').translation.pageHelp.quadrants;console.log(l,Array.isArray(q),Object.keys(q).join(','))})"`.

**Esperado:** nos três arquivos, `pageHelp.quadrants` é um objeto cujas chaves são
`languages-and-frameworks`, `methods-and-patterns`, `platforms-and-operations` e `tools`, nesta
ordem de declaração, cada uma com `name` e `description`. O passo 3 imprime `false` para
`Array.isArray` nos três idiomas e a mesma sequência de chaves nos três.

### TC-2 (obrigatório) — o bloco de rótulo resolve a descrição pelo slug

1. Abra `src/components/RadarGrid/RadarGrid.tsx` e leia o componente `QuadrantLabel`.
2. No terminal, rode `grep -n "position\|returnObjects\|QuadrantConfig\[\]" src/components/RadarGrid/RadarGrid.tsx`.

**Esperado:** a descrição é lida por ``t(`pageHelp.quadrants.${quadrantName}.description`)``, usando
o slug que `QuadrantLabel` já recebe, em uma única passagem pela tradução. O passo 2 não mostra
nenhuma leitura de `pageHelp.quadrants` com `returnObjects`, nenhuma tipagem como
`QuadrantConfig[]` e nenhuma indexação por `quadrantConfig.position - 1`; as ocorrências restantes
de `position` são o número exibido no rótulo e o índice de `stylesMap`, que decide o canto.

### TC-3 (obrigatório) — a página de ajuda percorre o mapa

1. Abra `src/components/PageHelp/PageHelp.tsx` e leia a leitura de `pageHelp.quadrants` e a
   montagem da lista de quadrantes.

**Esperado:** o retorno de `t("pageHelp.quadrants", { returnObjects: true })` é tipado como
`QuadrantHelpMap` — `{ [slug: string]: { name: string; description: string } }` — e a lista é
montada por `Object.entries(...).map(([slug, { name, description }]) => ...)`, com `slug` como
`key` do `li`. Não existe acesso por índice numérico nem o tipo `Quadrant[]`. As props do
componente continuam sendo `leaving` e `onLeave`.

### TC-4 (obrigatório) — nenhum ponto do código tipa a descrição como lista

1. No terminal, na raiz do repositório, rode `grep -rn "pageHelp.quadrants" src/ --include=*.ts --include=*.tsx`.

**Esperado:** as ocorrências são a leitura por chave composta em `RadarGrid.tsx`, a leitura com
`returnObjects` em `PageHelp.tsx` e as asserções do arquivo de teste de consistência. Nenhuma delas
tipa o valor como `QuadrantConfig[]` nem como `Quadrant[]`.

### TC-5 (obrigatório) — as suítes novas não alcançam o `d3`

1. No terminal, na raiz do repositório, rode
   `CI=true npx react-scripts test --watchAll=false -t "" src/i18n/translations.test.tsx src/components/PageHelp/PageHelp.test.tsx`.
2. Abra os dois arquivos de teste e leia o bloco de imports.

**Esperado:** as duas suítes rodam até o fim, sem `SyntaxError: Cannot use import statement outside
a module`. Nenhum dos dois arquivos importa `RadarGrid`, `RadarChart` ou qualquer módulo de
`src/components/Chart/`, de modo que o `d3` não entra no grafo de importação.

## História 2 — o conteúdo publicado permanece

### TC-6 (obrigatório) — os quatro blocos de rótulo da página inicial em português

1. Suba a aplicação com `yarn start` e abra `localhost:3000` em janela de pelo menos 800 px.
2. Clique na bandeira do Brasil no cabeçalho.
3. Leia os quatro blocos de rótulo nos cantos da área do gráfico.

**Esperado:** o canto superior esquerdo traz "quadrante 1", o rótulo "Linguagens & Frameworks" e a
descrição "Aqui colocamos linguagens e frameworks de desenvolvimento que são úteis para a
implementação de software personalizado de todos os tipos."; o superior direito traz "quadrante 2",
"Métodos & Padrões" e a descrição que começa em "Padrões são muito importantes."; o inferior
esquerdo traz "quadrante 3", "Plataformas & Operações" e a descrição que começa em "Aqui incluímos
plataformas e serviços de infraestrutura."; o inferior direito traz "quadrante 4", "Ferramentas" e
a descrição que começa em "Aqui colocamos diferentes ferramentas de software". Cada bloco mantém o
atalho de aproximação e a linha divisória na cor do seu quadrante.

### TC-7 (obrigatório) — os blocos de rótulo em inglês e em espanhol

1. Com a aplicação aberta em `localhost:3000`, clique na bandeira do Reino Unido no cabeçalho.
2. Leia os quatro blocos de rótulo e compare com a página inicial de `techradar.db1.com.br` no
   mesmo idioma.
3. Clique na bandeira da Espanha no cabeçalho e repita a comparação.

**Esperado:** nos dois idiomas, cada bloco exibe a descrição do seu próprio quadrante, idêntica à
publicada, com o rótulo e o número no mesmo canto. Nenhum bloco exibe a descrição de outro
quadrante e nenhum exibe a chave crua `pageHelp.quadrants.<slug>.description`.

### TC-8 (obrigatório) — a lista da página de ajuda em português

1. Com a aplicação aberta em `localhost:3000` e o idioma em português, clique no atalho de ajuda do
   cabeçalho para abrir `/help-and-about-tech-radar.html`.
2. Role até a frase que abre a lista de quadrantes e leia os itens.

**Esperado:** a lista traz quatro itens, nesta ordem: "Linguagens e frameworks", "Métodos e
padrões", "Plataformas e operações" e "Ferramentas", cada um com o nome em negrito seguido da sua
descrição atual.

### TC-9 (obrigatório) — a lista da página de ajuda em inglês e em espanhol

1. Na página `/help-and-about-tech-radar.html`, clique na bandeira do Reino Unido no cabeçalho.
2. Leia a lista de quadrantes e compare com a mesma página de `techradar.db1.com.br`.
3. Clique na bandeira da Espanha e repita a comparação.

**Esperado:** nos dois idiomas a lista traz os quatro quadrantes na mesma ordem do português, com
os nomes e as descrições idênticos aos publicados naquele idioma.

### TC-10 (obrigatório) — nenhum texto de nome ou descrição muda

1. No terminal, na raiz do repositório, rode `git diff HEAD~1 -- src/i18n/translations/`.
2. Leia as linhas removidas e acrescentadas de `pageHelp.quadrants` nos três arquivos.

**Esperado:** para cada slug e cada idioma, os valores de `name` e de `description` aparecem
exatamente iguais aos removidos, caractere por caractere, inclusive acentos e pontuação. A única
diferença estrutural é a troca da lista pelo objeto endereçado por slug.

### TC-11 (obrigatório) — a descrição da página de ajuda continua sanitizada

1. Abra `src/components/PageHelp/PageHelp.tsx` e leia a renderização de cada item da lista de
   quadrantes.
2. Com a aplicação aberta em `/help-and-about-tech-radar.html`, inspecione um item da lista pelo
   inspetor do navegador.

**Esperado:** a descrição chega à tela por `dangerouslySetInnerHTML={sanitize(description, {})}`, a
mesma chamada aplicada à lista de anéis. O HTML renderizado não traz marcação fora do que a
sanitização permite.

### TC-12 (obrigatório) — a suíte afirma o conteúdo e a ordem da página de ajuda

1. No terminal, na raiz do repositório, rode
   `CI=true npx react-scripts test --watchAll=false src/components/PageHelp/PageHelp.test.tsx`.

**Esperado:** a suíte passa. Ela renderiza `PageHelp` com o idioma fixado em português, encontra os
quatro nomes e as quatro descrições publicadas no documento e afirma que os itens da lista de
quadrantes aparecem na ordem "Linguagens e frameworks", "Métodos e padrões", "Plataformas e
operações" e "Ferramentas".

## História 3 — a explicação do agrupamento sem numeral

### TC-13 (obrigatório) — a frase do agrupamento nos três dicionários

1. Abra `src/i18n/translations/pt.json` e localize o quarto parágrafo da seção "Como deve ser
   usado", em `pageHelp.paragraphs`.
2. Repita em `src/i18n/translations/en.json` e em `src/i18n/translations/es.json`.

**Esperado:** em `pt.json` a frase é "Agrupamos ou categorizamos os itens em quadrantes (às vezes,
quando não está 100% claro onde um item pertence, escolhemos o mais adequado)."; em `en.json` é "We
group or categorize the items in quadrants (sometimes, when it's not 100% clear where a item
belongs, we choose the best fit)."; em `es.json` é "Agrupamos o clasificamos los artículos en
cuadrantes (a veces, cuando no está 100% claro a qué cuadrante pertenece un artículo, elegimos el
que mejor encaja)." O restante de cada frase, inclusive o parêntese sobre o melhor encaixe, fica
idêntico ao publicado.

### TC-14 (obrigatório) — nenhuma frase da ajuda afirma uma quantidade de quadrantes

1. No terminal, na raiz do repositório, rode
   `node -e "['pt','en','es'].forEach(l=>console.log(l,JSON.stringify(JSON.stringify(require('./src/i18n/translations/'+l+'.json').translation.pageHelp).match(/\d+\s+(quadrantes|quadrants|cuadrantes)/gi))))"`.
2. Rode a suíte de consistência com
   `CI=true npx react-scripts test --watchAll=false src/i18n/translations.test.tsx`.

**Esperado:** o passo 1 imprime `null` para os três idiomas. No passo 2 o caso que procura esse
mesmo padrão passa.

### TC-15 (recomendado) — a frase sem numeral na página publicada

1. Suba a aplicação com `yarn start` e abra `/help-and-about-tech-radar.html` pelo atalho de ajuda
   do cabeçalho.
2. Role até a seção "Como deve ser usado" e leia o último parágrafo.
3. Repita nos outros dois idiomas, pelas bandeiras do cabeçalho.

**Esperado:** nos três idiomas o parágrafo descreve o agrupamento em quadrantes sem citar nenhum
número, e o restante da seção fica idêntico ao publicado em `techradar.db1.com.br`.

## História 4 — um quinto quadrante

### TC-16 (obrigatório) — a página inicial de pé com cinco quadrantes

1. Em uma cópia local, acrescente um quinto quadrante a `public/config.json`: a entrada do slug novo
   em `quadrants` e, em `quadrantsMap`, `position` 5, `order` 5 e cor própria.
2. Acrescente a entrada desse slug em `quadrants` e em `pageHelp.quadrants`, com `name` e
   `description`, nos três arquivos de `src/i18n/translations/`.
3. Suba a aplicação com `yarn start`, abra `localhost:3000` e abra o console do navegador.
4. Leia os quatro blocos de rótulo dos quadrantes publicados.

**Esperado:** a página inicial renderiza. O console não acusa
`TypeError: Cannot read properties of undefined (reading 'description')` nem qualquer outro erro de
leitura de descrição. Os quatro blocos publicados continuam com o número, o rótulo e a descrição
que tinham antes do quinto quadrante.

### TC-17 (obrigatório) — a página de ajuda lista cinco quadrantes nos três idiomas

1. Com o estado local de TC-16 ativo, abra `/help-and-about-tech-radar.html` pelo atalho de ajuda do
   cabeçalho.
2. Leia a lista de quadrantes.
3. Repita nos outros dois idiomas, pelas bandeiras do cabeçalho.

**Esperado:** nos três idiomas a lista traz cinco itens, os quatro publicados na ordem de sempre e o
quinto com o nome e a descrição declarados para o slug novo.

### TC-18 (recomendado) — o bloco de rótulo do quinto quadrante sem posicionamento

1. Com o estado local de TC-16 ativo, observe a área do gráfico na página inicial.

**Esperado:** o bloco de rótulo do quinto quadrante aparece sem posicionamento correto na grade, por
`stylesMap` continuar com quatro entradas indexadas pela posição exibida. É o resultado esperado
nesta unidade: a grade é migrada pela unidade dos blocos de rótulo.

### TC-19 (obrigatório) — o estado de conferência não entra no commit

1. Desfaça o estado local com `git restore public/config.json src/i18n/translations/`.
2. Rode `git status --porcelain`.
3. Rode `git show --stat HEAD` e leia a lista de arquivos do commit da unidade.

**Esperado:** o passo 2 não lista `public/config.json` nem nenhum dos três dicionários como
alterado. O commit da unidade não traz o quadrante de teste: `public/config.json` fica como está
versionado e os dicionários trazem apenas os quatro slugs publicados.

### TC-20 (obrigatório) — a suíte afirma que a lista acompanha o dicionário

1. No terminal, na raiz do repositório, rode
   `CI=true npx react-scripts test --watchAll=false src/components/PageHelp/PageHelp.test.tsx`.

**Esperado:** passa o caso que acrescenta um pacote de idioma por `i18n.addResourceBundle`, sob um
código próprio, com cinco slugs em `pageHelp.quadrants`: a lista renderiza cinco itens, as demais
chaves da página vêm do idioma de recurso e o idioma volta ao valor anterior ao fim do caso.

## História 5 — a suíte acusa a tradução faltante

### TC-21 (obrigatório) — todo quadrante da taxonomia tem rótulo e descrição nos três idiomas

1. No terminal, na raiz do repositório, rode
   `CI=true npx react-scripts test --watchAll=false src/i18n/translations.test.tsx`.

**Esperado:** passa o caso que percorre cada slug declarado em `public/config.json` e afirma, para
`pt`, `en` e `es`, que `quadrants.<slug>` é texto não vazio e que `pageHelp.quadrants.<slug>` traz
`name` e `description` não vazios. O arquivo de teste lê `../../public/config.json` e os três
dicionários reais, nunca uma cópia de fixture.

### TC-22 (obrigatório) — nenhum dicionário descreve quadrante fora da taxonomia

1. Rode `CI=true npx react-scripts test --watchAll=false src/i18n/translations.test.tsx`.

**Esperado:** passa o caso que percorre as chaves de `quadrants` e de `pageHelp.quadrants` nos três
dicionários e afirma que todas existem entre os quadrantes declarados na taxonomia.

### TC-23 (obrigatório) — os dois mapas da taxonomia declaram o mesmo conjunto

1. Rode `CI=true npx react-scripts test --watchAll=false src/i18n/translations.test.tsx`.

**Esperado:** passa o caso que compara `Object.keys(config.quadrants)` com
`Object.keys(config.quadrantsMap)` e afirma que declaram o mesmo conjunto de slugs.

### TC-24 (obrigatório) — a suíte falha nomeando o slug e o idioma em falta

1. Em uma cópia local, acrescente um quinto quadrante aos dois mapas de `public/config.json`, como
   em TC-16.
2. Acrescente a tradução desse slug apenas em `pt.json`, deixando `en.json` e `es.json` sem ela.
3. Rode `CI=true npx react-scripts test --watchAll=false src/i18n/translations.test.tsx`.
4. Desfaça o estado local com `git restore public/config.json src/i18n/translations/`.

**Esperado:** no passo 3 a suíte falha, e a mensagem de falha nomeia o slug acrescentado e o idioma
em que a entrada falta. É esse caso que pega o esquecimento de tradução ao acrescentar um
quadrante.

### TC-25 (obrigatório) — a descrição resolve pelo slug nos três idiomas

1. Rode `CI=true npx react-scripts test --watchAll=false src/i18n/translations.test.tsx`.

**Esperado:** passa o caso que, com `i18n.changeLanguage` em `pt`, `en` e `es`, resolve
``t(`pageHelp.quadrants.${slug}.description`)`` para cada slug e afirma que o retorno é o texto do
dicionário daquele idioma e é diferente da própria chave. É a expressão que o bloco de rótulo usa,
exercitada sobre a instância real do `i18next`.

### TC-26 (obrigatório) — a ordem declarada acompanha a taxonomia

1. Rode `CI=true npx react-scripts test --watchAll=false src/i18n/translations.test.tsx`.
2. Em uma cópia local, troque a ordem de duas entradas de `pageHelp.quadrants` em `pt.json` e rode a
   suíte de novo.
3. Desfaça o estado local com `git restore src/i18n/translations/`.

**Esperado:** no passo 1 passa o caso que compara `Object.keys(pageHelp.quadrants)` de cada
dicionário com `Object.keys(config.quadrants)`, elemento a elemento. No passo 2 esse caso falha, o
que confirma que a ordem da lista da página de ajuda está presa por teste e não depende de
comportamento implícito.

### TC-27 (obrigatório) — o teste de componente inicializa o `i18next`

1. Abra `src/components/PageHelp/PageHelp.test.tsx` e leia o bloco de imports e o preparo de cada
   caso.

**Esperado:** o arquivo importa `src/i18n` e fixa o idioma por `i18n.changeLanguage` antes de
renderizar. `render` é chamado sem `MemoryRouter` e sem provedor de contexto, porque `PageHelp` não
usa `Link`, `useSearchParamState` nem `useMessages`.

## Documentação autoritativa

### TC-28 (obrigatório) — a skill da taxonomia descreve o mapa por slug

1. Abra `.agents/skills/taxonomia-de-quadrantes-e-aneis/SKILL.md`.
2. Leia a tabela de *Entidades e dados*, a regra 8, o fluxo *Acrescentar um quadrante* e
   *Restrições e validações*.

**Esperado:** a linha de `pageHelp.quadrants` descreve um mapa `slug → { name, description }`, e o
parágrafo sobre listas posicionais vale apenas para a de anéis, ordenada do centro para a borda. A
regra 8 registra que rótulo curto e descrição longa são ambos endereçados pelo slug. O passo 4 do
fluxo pede a entrada do slug nos três dicionários, e a observação final aponta o bloco de rótulo nos
cantos como o que pressupõe quatro posições. Em *Restrições e validações*, a restrição do número de
quadrantes atribui o limite ao bloco de rótulo nos cantos, e a restrição dos três idiomas descreve o
slug ausente sumindo da página de ajuda e caindo no inglês no bloco de rótulo.

### TC-29 (obrigatório) — a skill da visualização descreve a leitura por slug

1. Abra `.agents/skills/visualizacao-do-radar/SKILL.md`.
2. Leia a regra 12, a regra 16, o fluxo *Acrescentar um quadrante ao desenho* e *Restrições e
   validações*.

**Esperado:** a regra 12 diz que o bloco de rótulo lê a descrição longa pelo slug do quadrante que
apresenta, com a posição exibida restrita ao número e ao canto. A regra 16 registra que o que resta
preso a quatro posições é o canto do bloco de rótulo. No fluxo, o passo 2 pede a entrada do slug nos
três dicionários e o passo 3 restringe a migração pendente aos blocos de rótulo nos cantos. Em
*Restrições e validações*, a restrição sobre a descrição de quadrante descreve a cobertura por slug
e o que acontece quando ela falta.

### TC-30 (obrigatório) — a skill de internacionalização separa mapa de lista

1. Abra `.agents/skills/internacionalizacao-do-radar/SKILL.md`.
2. Leia *Adicionar ou renomear uma chave de interface* e *Restrições e armadilhas conhecidas*.

**Esperado:** `pageHelp.quadrants` não aparece entre os valores em lista cujo número de elementos
precisa coincidir, e a enumeração dos dicionários indexados pelo slug do dado inclui
`pageHelp.quadrants.<slug>` ao lado de `quadrants.<slug>`, `rings.<anel>` e `flags.<flag>`. A
armadilha da estrutura fora de sincronia registra que a ausência de um slug no idioma ativo o faz
sumir da página de ajuda, enquanto a leitura por chave composta de folha cai no inglês.

### TC-31 (obrigatório) — a skill da governança nomeia o mapa de quadrantes

1. Abra `.agents/skills/governanca-de-contribuicao-do-radar/SKILL.md`.
2. Leia *Texto da página de ajuda — chaves deste domínio* e *Restrições e validações*.

**Esperado:** a frase que remete as duas listas de eixos à taxonomia nomeia o mapa de descrições de
quadrante endereçado por slug e a lista de descrições de anel. Em *Restrições e validações*, a
restrição sobre o texto do processo em todos os idiomas faz a mesma distinção.

### TC-32 (obrigatório) — o mapa funcional acompanha a chave e a branch

1. Abra `.agents/maps/functional-map.md`.
2. Leia a dependência técnica da chave `pageHelp` no domínio Governança de Contribuição do Radar e
   a dependência técnica de registro em ADR no domínio Visualização do Radar.

**Esperado:** a dependência da chave `pageHelp` distingue o mapa de quadrantes endereçado por slug
das listas narrativas. A dependência de registro em ADR nomeia também a branch
`feat/us5-i18n-by-slug` entre as da reescrita em andamento.

### TC-33 (obrigatório) — o `AGENTS.md` atribui o limite ao bloco de rótulo

1. Abra `AGENTS.md` e leia a restrição global dos quatro quadrantes.

**Esperado:** a restrição atribui o limite aos blocos de rótulo em `src/components/RadarGrid` e à
ausência de validação da configuração, sem citar listas posicionais de descrição nos dicionários de
tradução. A exigência de manter o desenho idêntico ao publicado com quatro quadrantes e o ponteiro
para a ADR 0001 permanecem.

### TC-34 (recomendado) — a skill de ADR acompanha a branch da unidade

1. Abra `.agents/skills/registros-de-decisao-arquitetural/SKILL.md` e leia o gatilho *Geometria do
   gráfico*.

**Esperado:** a lista de branches da reescrita em andamento inclui a branch desta unidade.

## Portão de qualidade

### TC-35 (obrigatório) — checagem de tipos

1. No terminal, na raiz do repositório, rode `yarn ts:check`.

**Esperado:** o comando termina com código 0, sem nenhum erro reportado.

### TC-36 (obrigatório) — lint sem avisos

1. No terminal, na raiz do repositório, rode `CI=true yarn lint`.

**Esperado:** o comando termina com código 0, sem erro e sem nenhum aviso do ESLint. É a condição em
que o build do GitHub Actions roda, onde aviso é tratado como erro.

### TC-37 (obrigatório) — suíte de testes

1. No terminal, na raiz do repositório, rode `yarn test`.
2. Compare o resumo final com o estado conhecido da base, descrito nas pré-condições.

**Esperado:** `src/i18n/translations.test.tsx` e `src/components/PageHelp/PageHelp.test.tsx` passam
inteiras, e as três suítes que passavam — `blips.test.tsx`, `geometry.test.tsx` e
`sanitize.test.tsx` — continuam passando com a mesma contagem. `src/date.test.tsx` e
`src/components/Item/Item.test.tsx` continuam falhando pela transformação de ESM já existente na
base; nenhuma suíte que passava antes entra em falha.

### TC-38 (obrigatório) — build de produção

1. No terminal, na raiz do repositório, rode `yarn build`.

**Esperado:** o comando termina com código 0 e gera o pacote em `build/`, sem erro de compilação.

### TC-39 (recomendado) — nenhum arquivo servido ao navegador muda

1. No terminal, na raiz do repositório, rode `git diff HEAD~1 --stat -- .env public/`.

**Esperado:** o comando não devolve nenhuma diferença. Os dicionários são compilados dentro do
pacote, de modo que a unidade não altera `public/config.json` nem exige trocar
`REACT_APP_BUILDHASH`.
</content>
