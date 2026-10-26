# Research: geometria única do radar e trava de retrocompatibilidade

As evidências abaixo foram obtidas lendo o código do repositório, lendo a implementação das
dependências instaladas e executando os comandos do portão de qualidade do projeto. Neste
ambiente o `yarn` não está instalado; os comandos foram executados direto pelo Node
(`node node_modules/<pacote>/bin/...`), com o mesmo efeito dos scripts de `package.json`.

## Convenção angular compartilhada entre arcos e pontos

**Contexto.** Os arcos dos anéis são desenhados pelo gerador de arcos do `d3`, que recebe
ângulos em radianos, e os pontos são posicionados por `cos`/`sin` com uma tabela de
deslocamentos. Para que `geometry.ts` sirva aos dois, a convenção escolhida precisa ser a mesma
que o `d3.arc` já adota, senão a migração dos arcos exige remapeamento.

**Alternativas:**

- **Graus, 0° = 12 horas, sentido horário, convertidos para radianos na borda do `d3`** — é a
  convenção do algoritmo portado da v5 do projeto de origem.
- **Radianos puros em todo o módulo** — dispensa a constante de conversão; afasta o módulo da
  forma em que o algoritmo de referência e a configuração são lidos por quem mantém o radar.

**Decisão:** graus, 0° = 12 horas, sentido horário, com `DEG_TO_RAD` como única conversão para o
`d3`.

**Evidência:** `node_modules/d3-shape/src/arc.js:93-94` calcula
`a0 = startAngle.apply(this, arguments) - halfPi` e `a1 = endAngle.apply(this, arguments) - halfPi`
antes de aplicar `cos`/`sin`. Com `startAngle` 0 o ponto resultante é `(0, -r)`, o topo do
círculo, e ângulos crescentes caminham para a direita — 0 = 12 horas, sentido horário. A única
diferença em relação à convenção escolhida é a unidade.

**Consequências:** `segmentAngles` devolve graus e cada consumidor do `d3` multiplica por
`DEG_TO_RAD`. A tabela `arcAngel` de `QuadrantRings.tsx` continua sendo a origem dos ângulos dos
arcos até a unidade que a migra, e a trava de retrocompatibilidade é o que prova que as duas
concordam.

## Isolamento de `geometry.ts` em relação a React e ao `d3`

**Contexto.** O teste precisa rodar na infraestrutura Jest embutida no `react-scripts`, sem
configuração própria. Duas suítes do repositório já falham por transformação de ESM.

**Alternativas:**

- **Módulo puro, sem React e sem `d3`** — o teste importa só funções e números.
- **Módulo que recebe as escalas do `d3`** — aproxima a assinatura da de `arcPath`; arrasta o
  `d3` para dentro do teste.

**Decisão:** módulo puro, sem React e sem `d3`, em `src/components/Chart/geometry.ts`.

**Evidência:** `node_modules/react-scripts/scripts/utils/createJestConfig.js` define
`transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|cjs|ts|tsx)$', ...]`, ou
seja, nenhum arquivo JavaScript de `node_modules` passa pelo Babel. `d3` 7 é distribuído em
ESM, e a execução de `react-scripts test --watchAll=false` neste repositório termina com
`2 failed, 1 passed, 3 total`, com `Item.test.tsx` quebrando em
`node_modules/query-string/index.js:1 ... SyntaxError: Cannot use import statement outside a module`
— a mesma classe de falha que um `import` de `d3` produziria.

**Consequências:** o arquivo é `.ts`, como `src/model.ts`, `src/config.ts`, `src/date.ts` e
`src/sanitize.ts`, e fica fora do glob do ESLint, sendo coberto pelo `tsc --noEmit`, que inclui
`src` inteiro. Quando a unidade dos arcos consumir `segmentAngles`, a conversão para radianos
acontece em `QuadrantRings.tsx`, que já importa o `d3`.

## Extensão e localização do arquivo de teste

**Contexto.** O portão de qualidade inclui o ESLint, e o glob do script `lint` é
`src/**/*.tsx`.

**Decisão:** `src/components/Chart/geometry.test.tsx`, ao lado do módulo sob teste.

**Evidência:** `node node_modules/eslint/bin/eslint.js "src/**/*.tsx" --format json` percorre 47
arquivos, entre eles `src/components/Chart/RadarChart.tsx` e `src/components/Item/Item.test.tsx`,
o que confirma que o glob alcança três níveis de diretório e que arquivos de teste entram nele.
`createJestConfig.js` declara
`testMatch: ['<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}', '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}']`,
de modo que a suíte é descoberta sem configuração adicional.

**Consequências:** o arquivo é lintado e checado por tipo junto com o resto de `src`. O script
`lint` depende de o ESLint expandir o glob por conta própria, o que acontece quando o shell não
o expande — é o caso do `cmd.exe` do Windows, ambiente de desenvolvimento do time. Em um shell
POSIX, `**` sem `globstar` se reduz a um nível e arquivos em `src/components/Chart/` ficam de
fora do lint.

## Leitura do `public/config.json` real pelo teste

**Contexto.** A trava de retrocompatibilidade só tem valor se ler o arquivo publicado: uma
fixture copiada continuaria passando com o arquivo real errado. `public/` fica fora de `src/`.

**Alternativas:**

- **`import` relativo do JSON** — valor tipado, resolvido em tempo de compilação, e o arquivo
  entra no programa do `tsc`.
- **`fs.readFileSync` mais `JSON.parse`** — independe da resolução de módulos; devolve valor sem
  tipo e deixa o arquivo fora da checagem de tipos.

**Decisão:** `import` relativo de `../../../public/config.json` dentro do teste.

**Evidência:** `tsconfig.json` traz `resolveJsonModule: true`, recurso já exercitado por
`src/i18n/index.ts`, que importa os três dicionários de tradução. `include: ["src"]` define os
arquivos raiz do programa; o JSON importado entra como arquivo do programa, e sem `rootDir` e
com `noEmit: true` não há restrição de localização. No Jest, `node_modules/jest-resolve` não usa
`roots` em nenhum dos seus arquivos de build — `roots` governa a varredura e a descoberta de
testes, não a resolução de caminhos relativos — e `node_modules/jest-runtime/build/index.js:1168`
trata `.json` lendo o arquivo e aplicando `JSON.parse`, sem depender de transformação. O
`ModuleScopePlugin` do `react-scripts` atua apenas na resolução do webpack, e o arquivo de teste
não é alcançável a partir de `src/index.tsx`, logo não é compilado pelo `build`.

**Consequências:** uma alteração em `public/config.json` que quebre a correspondência de ângulos
falha o teste, e uma alteração que quebre a forma do arquivo falha o `tsc --noEmit`.

## Conversão do JSON importado para `ConfigData`

**Contexto.** `segmentCount` recebe `ConfigData`, e o teste precisa passar o conteúdo importado
do arquivo real.

**Decisão:** o teste converte o valor importado uma única vez, com
`realConfig as unknown as ConfigData`, e usa o resultado em todas as asserções.

**Evidência:** com `resolveJsonModule`, o TypeScript amplia os literais de texto do JSON para
`string`. `public/config.json` traz `"homepageContent": "both"`, que chega como `string`, e
`ConfigData.homepageContent` é o enum `HomepageOption` (`src/config.ts:15`, `src/model.ts:1-5`):
`string` não é atribuível a um enum de texto. Os demais campos do arquivo correspondem ao
contrato — `quadrantsMap` infere `colour`, `txtColour`, `position` e `description`, todos
compatíveis com `QuadrantConfig`, cujo `order` é opcional.

**Consequências:** a conversão fica concentrada em uma linha, no topo do arquivo de teste, e as
asserções trabalham sobre um valor tipado.

## Remoção de `Axes.tsx` sem efeito visual

**Contexto.** O critério de aceite exige o radar idêntico ao publicado, e a remoção de um
componente de desenho é a alteração com maior aparência de risco visual.

**Decisão:** apagar `src/components/Chart/Axes.tsx` e os dois grupos que o usam em
`RadarChart.tsx`.

**Evidência:** `Axes.tsx` cria o eixo com `d3.axisLeft`/`d3.axisBottom` e, na mesma cadeia,
remove `.tick text`, `.tick line` e `.domain` (linhas 17-19 e 38-40) — os únicos elementos que o
gerador de eixos do `d3` produz. A busca por `Axes`, `XAxis` e `YAxis` em `src/` devolve apenas a
própria definição e o uso em `RadarChart.tsx` (import na linha 7, usos nas linhas 73-78). A busca
por `axis` em `src/components/Chart/chart.scss` e em `src/styles/` não devolve nada, de modo que
nenhuma regra de estilo depende das classes `.x-axis` e `.y-axis`.

**Consequências:** o SVG perde dois grupos vazios. Nenhum caminho, preenchimento ou
transformação de desenho é tocado nesta unidade, o que torna a conferência visual uma
confirmação, e não uma investigação.

## Numeração e momento do ADR

**Contexto.** A decisão de arquitetura precisa de registro, e o diretório de ADRs ainda não
existe no repositório.

**Decisão:** `docs/adr/0001-geometria-configuravel-do-grafico.md`, com status `Aceita` e data do
dia do registro, entrando no mesmo pull request desta unidade.

**Evidência:** `git log --all --oneline -- docs/adr` não devolve nenhum commit, em nenhuma
referência local ou remota, o que deixa o número `0001` livre segundo a regra de numeração da
skill `registros-de-decisao-arquitetural`. A mesma skill nomeia a geometria do gráfico como
gatilho por construção, cita esta reescrita pelos arquivos que ela toca e registra que preservar
o comportamento não isenta de ADR.

**Consequências:** o diretório `docs/adr/` nasce nesta unidade, e as unidades seguintes da
iniciativa citam o ADR 0001 em vez de abrir um novo.

## Identificador de build na publicação

**Contexto.** Os três `fetch` de dados levam `REACT_APP_BUILDHASH` na querystring, e quem já
visitou o site mantém a versão em cache até esse valor mudar. Esta unidade altera
`public/config.json`.

**Decisão:** `.env` permanece com `REACT_APP_BUILDHASH = "1.1"`.

**Evidência:** `order` não é lido por nenhum módulo ao final desta unidade — `QuadrantRings.tsx`
indexa `arcAngel` por `quadrant.position`, `BlipPoints.tsx` lê `quadrantConfig.position` e
`RadarGrid.tsx` usa `quadrantConfig.position` para o canto e para o número exibido. Um
`config.json` servido do cache produz exatamente o mesmo desenho que o arquivo novo.

**Consequências:** a troca do identificador acompanha a unidade que fizer `order` governar a
repartição do círculo, quando um `config.json` em cache passaria a divergir do código.
