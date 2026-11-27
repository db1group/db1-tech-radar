# Plan: geometria única do radar e trava de retrocompatibilidade

Visão técnica da unidade descrita em [`spec.md`](./spec.md).

## Stack e estrutura

A unidade trabalha dentro da SPA em React 18 com Create React App e TypeScript em modo `strict`,
sem acrescentar dependência alguma. O gráfico vive em `src/components/Chart/`, com um arquivo por
peça do desenho, e é dessa pasta que sai o novo módulo de geometria. O contrato de dados muda em
`src/model.ts` e em `public/config.json`, os dois arquivos que a aplicação já usa para descrever a
taxonomia. A suíte roda na infraestrutura Jest embutida no `react-scripts`, sem arquivo de
configuração próprio, e o portão de qualidade continua sendo `yarn ts:check`, `yarn lint` e
`yarn test`.

Módulo sem JSX é `.ts` e arquivo de teste é `.tsx`, como o restante de `src/`. Os imports seguem
a ordenação do `prettier.config.js`: pacotes primeiro, depois um bloco separado com os caminhos
relativos, com os especificadores em ordem alfabética.

## Decisões técnicas

Uma linha por veredito; contexto, alternativas e evidência em [`research.md`](./research.md).

- **Convenção angular**: graus, 0° = 12 horas, sentido horário, com `DEG_TO_RAD` como única
  conversão para os radianos que o `d3.arc` consome.
- **`src/components/Chart/geometry.ts`**: módulo puro, sem React e sem `d3`, exportando
  `DEG_TO_RAD`, `segmentCount`, `slotOf` e `segmentAngles`.
- **`slotOf`**: `q.order ?? q.position`, de modo que um quadrante sem `order` continue caindo no
  slot da sua posição.
- **`order`**: campo opcional em `QuadrantConfig` e chave nova em cada entrada de `quadrantsMap`,
  declarada ao lado de `position`, que segue sendo o número exibido no rótulo e o índice do canto
  do bloco.
- **Teste em `src/components/Chart/geometry.test.tsx`**: `.tsx` para entrar no glob do ESLint, ao
  lado do módulo sob teste.
- **Trava de retrocompatibilidade**: o teste importa `../../../public/config.json` e converte o
  valor uma única vez com `as unknown as ConfigData`, porque o JSON chega com
  `homepageContent: string` e o contrato pede o enum `HomepageOption`.
- **`Axes.tsx`**: apagado, junto com o import e os dois grupos que o envolvem em
  `RadarChart.tsx`; o componente remove do DOM os únicos elementos que o gerador de eixos do `d3`
  desenha, e nenhuma regra de estilo depende das classes que ele produz.
- **Log de depuração**: o `.map` sobre `config.quadrantsMap` que escreve no console e devolve
  `null` sai de `RadarChart.tsx`.
- **`docs/adr/0001-geometria-configuravel-do-grafico.md`**: ADR com status `Aceita`, no mesmo
  pull request da mudança, inaugurando o diretório; o número `0001` está livre em todas as
  referências do repositório.
- **Publicação**: `.env` permanece com `REACT_APP_BUILDHASH = "1.1"`, porque nenhum módulo lê
  `order` ao final desta unidade e um `config.json` em cache produz o mesmo desenho.

## Modelo de dados

O contrato de dados muda em um ponto: `QuadrantConfig` ganha `order?: number` e cada entrada de
`quadrantsMap` em `public/config.json` ganha a chave correspondente, com os valores fixados nos
critérios de aceite da [`spec.md`](./spec.md). `data-model.md` fica dispensado — um campo
opcional e quatro valores não sustentam um artefato próprio, e copiá-los criaria uma segunda
fonte para o mesmo dado.

## Contratos externos

Nenhum. A aplicação não expõe nem consome API, e os arquivos de `public/` são lidos pelo próprio
navegador a partir do mesmo domínio. `contracts/` fica dispensado.

## Interface

Nenhuma tela muda de aparência ou de comportamento: o critério de aceite desta unidade é
justamente a equivalência visual com o radar publicado. `ui/` fica dispensado.

## Estratégia de testes

A infraestrutura já existe e nada novo é introduzido: Jest e Testing Library vêm do
`react-scripts` 5, `src/setupTests.ts` é carregado automaticamente e a descoberta de testes
cobre qualquer `*.test.tsx` sob `src/`.

- **Unitário** — `src/components/Chart/geometry.test.tsx` cobre as quatro exportações de
  `geometry.ts`: contiguidade, ausência de sobreposição e soma de 360° para N em {3, 4, 5, 6};
  precedência de `order` sobre `position` em `slotOf`; contagem de segmentos; e a trava de
  retrocompatibilidade sobre o `public/config.json` do repositório, incluindo a verificação de
  que os `order` formam de 1 a N sem repetição.
- **Componente** — não exigido. A alteração em `RadarChart.tsx` remove código que não renderiza
  nada e um log de depuração, e a convenção de testes do projeto dispensa teste de componente
  para remoção de código morto.
- **Equivalência visual** — conferência manual, comparando captura de tela da página inicial com
  `techradar.db1.com.br` antes e depois. Nenhum caminho de desenho é tocado nesta unidade, o que
  reduz a conferência a uma confirmação.
- **Portão de qualidade** — `yarn ts:check` e `yarn lint` terminam limpos na base e precisam
  continuar assim. `yarn test` já tem `Item.test.tsx` e `date.test.tsx` falhando por
  transformação de ESM de `query-string` e de `moment`; a exigência é que `geometry.test.tsx`
  passe inteiro e que nenhuma suíte que passava entre em falha.

## Impacto na documentação autoritativa

Esta unidade altera deliberadamente o contrato que a taxonomia publica e cria o registro de
arquitetura que faltava. Cada item abaixo vira tarefa de documentação na fase `tasks`, executada
junto com o código.

- **`.agents/skills/taxonomia-de-quadrantes-e-aneis/SKILL.md`** — a tabela de *Entidades e dados*
  descreve `quadrantsMap` com `colour`, `txtColour`, `position`, `description` e `order`, sendo
  `description` um texto presente no dado e nunca exibido, porque toda descrição que o leitor vê
  vem dos dicionários de tradução. A regra 4 passa a distinguir os dois números do quadrante:
  `position` é o número exibido no rótulo "QUADRANTE N" e o canto do bloco; `order` é o slot de
  tela, contado de 1 a N no sentido horário a partir das 12 horas. *Restrições e validações*
  ganha a regra de que os `order` são contíguos de 1 a N, sem repetição.
- **`.agents/skills/visualizacao-do-radar/references/technical-dependencies.md`** — a precondição
  de registro em ADR passa a apontar `docs/adr/0001-geometria-configuravel-do-grafico.md` como o
  registro vigente da reescrita da geometria.
- **`AGENTS.md`** — a restrição global sobre a quantidade de quadrantes passa a citar o caminho
  do ADR 0001, que guarda o porquê da escolha e as alternativas descartadas.
- **`.agents/skills/registros-de-decisao-arquitetural/SKILL.md`** — o gatilho "Geometria do
  gráfico" lista como arquivos de `src/components/Chart/` que compõem o desenho
  `RadarChart.tsx`, `BlipPoints.tsx`, `QuadrantRings.tsx` e `geometry.ts`, que é o destino do
  cálculo extraído descrito no próprio parágrafo.
- **`.agents/maps/functional-map.md`** — na seção do domínio Visualização do Radar, a evidência
  no código aponta `RadarChart.tsx` como escalas e composição do SVG, traz `geometry.ts` como a
  convenção angular única do desenho e reúne `QuadrantRings.tsx` e `BlipShapes.tsx` como os
  arcos e as três formas de ponto.

Sem impacto em `.agents/skills/visualizacao-do-radar/SKILL.md`: a extração do cálculo para um
módulo próprio é refatoração que preserva o desenho, caso que a própria skill manda não
registrar, e o setor de cada quadrante continua sendo decidido pela posição declarada na
taxonomia.
