# Spec: tradução de quadrante por slug

## Visão geral

A descrição longa de cada quadrante passa a ser endereçada pelo slug do quadrante nos três
dicionários de tradução, de modo que o conteúdo traduzido acompanhe a quantidade de quadrantes
declarada na taxonomia e deixe de depender da posição de um item dentro de uma lista de quatro
entradas.

## Domínios envolvidos

| Domínio | Impacto desta unidade | Documentação autoritativa |
| --- | --- | --- |
| Taxonomia de Quadrantes e Anéis | A descrição longa do quadrante deixa de ser uma lista ordenada pela posição exibida e passa a ser um mapa endereçado pelo slug, nos três idiomas. O slug vira a única chave que liga a taxonomia ao texto traduzido — já era assim para o rótulo curto e passa a valer também para a descrição. O procedimento de acrescentar um quadrante deixa de exigir inserir a descrição na posição certa da lista. Uma verificação automática passa a exigir que todo slug declarado na taxonomia tenha rótulo e descrição nos três idiomas, e que nenhum dicionário descreva quadrante inexistente. | [`taxonomia-de-quadrantes-e-aneis/SKILL.md`](../../skills/taxonomia-de-quadrantes-e-aneis/SKILL.md) |
| Visualização do Radar | O bloco de rótulo de cada canto passa a resolver a descrição longa pelo slug do quadrante que ele apresenta. A posição exibida continua sendo o número que o leitor vê e o canto em que o bloco fica, e deixa de participar da busca do texto. Com uma taxonomia de cinco quadrantes a página inicial deixa de ser derrubada pela descrição ausente. | [`visualizacao-do-radar/SKILL.md`](../../skills/visualizacao-do-radar/SKILL.md) |
| Governança de Contribuição do Radar | A página de ajuda monta a lista de quadrantes a partir do mapa por slug, preservando a ordem publicada hoje, e o parágrafo que explica o agrupamento deixa de afirmar uma quantidade de quadrantes. O texto público do processo passa a valer para qualquer taxonomia declarada, nos três idiomas. | [`governanca-de-contribuicao-do-radar/SKILL.md`](../../skills/governanca-de-contribuicao-do-radar/SKILL.md) |

O mecanismo de tradução em si — sincronia das chaves entre `pt`, `en` e `es`, consumo por
`useTranslation` e sanitização do texto com marcação — é governado pela skill técnica
[`internacionalizacao-do-radar`](../../skills/internacionalizacao-do-radar/SKILL.md), que esta
unidade segue e cujo registro da forma de `pageHelp.quadrants` ela altera.

Os outros quatro domínios ficaram fora da análise, por não terem artefato tocado nem
comportamento alterado: **Catálogo de Opiniões Tecnológicas** (nenhum campo de item, nenhuma
classificação e nenhum corpo de opinião é lido ou alterado), **Navegação e Descoberta de
Tecnologias** (as telas desse domínio já resolvem o rótulo do quadrante por slug e nenhuma delas
exibe a descrição longa), **Publicação e Distribuição do Radar** (os dicionários são compilados
dentro do pacote e chegam ao navegador com ele; nenhuma chave de `public/config.json` muda, de
modo que o identificador de build não precisa ser trocado) e **Identidade Institucional DB1**
(sem relação com a taxonomia nem com a página de ajuda).

## Escopo

**Dentro:**

- A descrição longa de cada quadrante endereçada pelo slug do quadrante, nos três idiomas.
- O bloco de rótulo da página inicial exibindo a descrição do quadrante que ele apresenta,
  qualquer que seja a quantidade de quadrantes declarada.
- A lista de quadrantes da página de ajuda montada a partir do mapa por slug, na mesma ordem
  publicada hoje.
- A explicação pública do agrupamento em quadrantes escrita sem afirmar uma quantidade, nos três
  idiomas.
- A verificação automática de que todo quadrante declarado na taxonomia tem rótulo curto e
  descrição longa preenchidos nos três idiomas, e de que nenhum dicionário descreve quadrante que
  a taxonomia não declara.
- A verificação automática de que nenhum dos três dicionários guarda a descrição de quadrante como
  lista.

**Fora:**

- O canto em que cada bloco de rótulo fica, a grade ao redor do diagrama e o comportamento em
  janela estreita.
- A mensagem legível para configuração inválida, incluindo o slug declarado na taxonomia sem
  tradução em algum idioma, que continua sem aviso em tempo de execução.
- O guia de contribuição e a conferência final com três, cinco e seis quadrantes.
- O rótulo curto do quadrante, que já é endereçado por slug e permanece como está.
- A descrição do quadrante guardada na taxonomia, que existe no dado e nunca é exibida.
- A lista de descrições dos anéis, que permanece ordenada do centro para a borda.
- O texto das descrições e dos rótulos, que não muda em nenhum idioma.
- Publicar o radar com uma quantidade de quadrantes diferente de quatro.
- Renomear o conceito de quadrante.

## Fronteira de domínio

**Esta spec implementa:**

- Chave `pageHelp.quadrants` em `src/i18n/translations/pt.json`, `en.json` e `es.json`, como
  objeto `{ [slug]: { name, description } }` com as quatro entradas atuais e os mesmos textos.
- Quarto parágrafo de `pageHelp.paragraphs` da seção "Como deve ser usado" em
  `src/i18n/translations/pt.json`, `en.json` e `es.json`, sem o numeral.
- Resolução da descrição do bloco de rótulo por slug em
  `src/components/RadarGrid/RadarGrid.tsx`, com remoção da indexação por
  `quadrantConfig.position - 1` e da segunda passagem do texto traduzido por `t`.
- Tipo local do mapa de descrições e iteração sobre ele em
  `src/components/PageHelp/PageHelp.tsx`, com remoção do tipo `Quadrant[]`.
- Suíte de consistência dos dicionários em `src/i18n/translations.test.tsx`, lendo o
  `public/config.json` do repositório e os três dicionários reais.
- Suíte de componente em `src/components/PageHelp/PageHelp.test.tsx`.
- Atualizações de documentação listadas na seção de impacto do [`plan.md`](./plan.md) desta
  unidade.

**Pertence a outras unidades (não vira tarefa aqui):**

- `stylesMap`, o canto do bloco de rótulo, `data-quadrants` e
  `src/components/RadarGrid/radar-grid.scss` — unidade dos blocos de rótulo e da grade responsiva.
- Validação da configuração no carregamento, em `src/components/App.tsx` — unidade da validação.
- `CONTRIBUTING.md` e a conferência final com três, cinco e seis quadrantes — unidade que encerra
  a iniciativa.
- Chave `quadrants` nos três dicionários e `translate` em `src/config.ts` — o rótulo curto já é
  endereçado por slug e fica intocado.
- Campo `description` de `quadrantsMap` em `public/config.json` — dado que nenhuma tela exibe.
- Chaves `pageHelp.rings`, `pageHelp.ringsPreDescription`, `pageHelp.sourcecodeLink` e
  `pageHelp.headlinePrefix` — fora do endereçamento por slug desta unidade.
- `src/components/Chart/geometry.ts`, `blips.ts`, `QuadrantRings.tsx`, `BlipPoints.tsx` e
  `RadarChart.tsx` — o diagrama já acompanha a quantidade de quadrantes e não lê texto traduzido
  de descrição.
- `REACT_APP_BUILDHASH` em `.env` — esta unidade não altera arquivo servido de `public/`.

## Histórias de usuário

1. Como pessoa que mantém a taxonomia, quero a descrição longa de cada quadrante endereçada pelo
   slug nos três idiomas, para que acrescentar um quadrante seja declarar o slug e escrever o seu
   texto, sem depender da ordem de uma lista.
2. Como pessoa que lê o radar publicado, quero a página inicial e a página de ajuda com os mesmos
   nomes, as mesmas descrições e a mesma ordem de hoje, nos três idiomas, para não perceber
   diferença alguma de conteúdo.
3. Como pessoa que lê a página de ajuda, quero a explicação do agrupamento em quadrantes escrita
   sem afirmar uma quantidade, para que ela continue verdadeira quando a taxonomia mudar.
4. Como pessoa que vai acrescentar um quinto quadrante, quero a página inicial e a página de ajuda
   de pé com cinco quadrantes declarados, para prosseguir com a migração do bloco de rótulo.
5. Como pessoa que revisa um pull request, quero a suíte acusando o quadrante declarado sem
   tradução em algum idioma, para que o esquecimento apareça antes da publicação.

## Critérios de aceite

**História 1 — a descrição endereçada pelo slug:**

- Dado cada um dos três dicionários, quando `translation.pageHelp.quadrants` é lido, então ele é
  um objeto com as chaves `languages-and-frameworks`, `methods-and-patterns`,
  `platforms-and-operations` e `tools`, nessa ordem de declaração, cada uma com `name` e
  `description`.
- Dado cada um dos três dicionários, quando `translation.pageHelp.quadrants` é lido, então
  `Array.isArray` sobre ele é falso.
- Dado o repositório, quando `src/components/RadarGrid/RadarGrid.tsx` é lido, então nenhuma
  expressão indexa a descrição por `position`, e a descrição exibida não passa por `t` depois de
  resolvida.
- Dado o repositório, quando `src/components/PageHelp/PageHelp.tsx` é lido, então o valor de
  `pageHelp.quadrants` é tipado como mapa de slug para `{ name, description }` e percorrido por
  `Object.entries` ou `Object.values`, sem nenhum acesso por índice numérico.
- Dado o repositório, quando `src/` é varrido, então nenhum arquivo tipa o retorno de
  `pageHelp.quadrants` como `QuadrantConfig[]`.

**História 2 — o conteúdo publicado permanece:**

- Dada a página inicial em `pt`, quando os quatro blocos de rótulo são lidos, então o bloco do
  canto superior esquerdo apresenta "quadrante 1", o rótulo "Linguagens & Frameworks" e a
  descrição "Aqui colocamos linguagens e frameworks de desenvolvimento que são úteis para a
  implementação de software personalizado de todos os tipos."; o superior direito, "quadrante 2",
  "Métodos & Padrões" e a descrição dos padrões; o inferior esquerdo, "quadrante 3", "Plataformas
  & Operações" e a descrição das plataformas; o inferior direito, "quadrante 4", "Ferramentas" e a
  descrição das ferramentas.
- Dada a página inicial em `en` e em `es`, quando os quatro blocos de rótulo são lidos, então cada
  um exibe a descrição do seu quadrante no idioma ativo, com os mesmos textos publicados hoje em
  `techradar.db1.com.br`.
- Dada a página de ajuda em `pt`, quando a lista de quadrantes é renderizada, então ela traz quatro
  itens, na ordem "Linguagens e frameworks", "Métodos e padrões", "Plataformas e operações" e
  "Ferramentas", cada um com a sua descrição atual.
- Dada a página de ajuda em `en` e em `es`, quando a lista de quadrantes é renderizada, então a
  ordem é a mesma e os textos são os publicados hoje naquele idioma.
- Dado o diff da unidade, quando os valores de `name` e `description` dos três dicionários são
  comparados com os de origem, então nenhum caractere de texto mudou em nenhum idioma.
- Dada a página de ajuda, quando a lista de quadrantes é renderizada, então a descrição continua
  passando pela sanitização antes de chegar à tela.

**História 3 — a explicação sem numeral:**

- Dado `pt.json`, quando o quarto parágrafo da seção "Como deve ser usado" é lido, então ele é
  "Agrupamos ou categorizamos os itens em quadrantes (às vezes, quando não está 100% claro onde um
  item pertence, escolhemos o mais adequado)."
- Dado `en.json`, quando o parágrafo correspondente é lido, então ele é "We group or categorize the
  items in quadrants (sometimes, when it's not 100% clear where a item belongs, we choose the best
  fit)."
- Dado `es.json`, quando o parágrafo correspondente é lido, então ele é "Agrupamos o clasificamos
  los artículos en cuadrantes (a veces, cuando no está 100% claro a qué cuadrante pertenece un
  artículo, elegimos el que mejor encaja)."
- Dados os três dicionários, quando o texto de `pageHelp` é varrido, então nenhuma frase afirma uma
  quantidade de quadrantes.

**História 4 — um quinto quadrante:**

- Dado um `public/config.json` local com um quinto quadrante — slug próprio, entrada nos dois mapas
  da taxonomia, `position` 5, `order` 5 e cor própria — e a tradução dele acrescentada nos três
  dicionários, quando a página inicial é aberta, então nenhum `TypeError` de leitura de
  `description` é lançado e os quatro blocos de rótulo publicados continuam com o seu texto.
- Dado esse mesmo estado local, quando a página de ajuda é aberta nos três idiomas, então a lista
  de quadrantes traz cinco itens, o quinto com o nome e a descrição declarados para o slug novo.
- Dado esse mesmo estado local, quando o bloco de rótulo do quinto quadrante é observado, então ele
  aparece sem posicionamento correto na grade — consequência esperada, migrada pela unidade dos
  blocos de rótulo.
- Dado o commit da unidade, quando o diff é lido, então o quadrante de teste não aparece nele:
  `public/config.json` fica como está versionado.

**História 5 — a suíte acusa a tradução faltante:**

- Dado o `public/config.json` do repositório, lido pelo teste a partir do arquivo real e não de uma
  cópia, quando cada slug declarado em `quadrants` e em `quadrantsMap` é percorrido, então cada um
  dos três dicionários tem `quadrants.<slug>` como texto não vazio e `pageHelp.quadrants.<slug>`
  com `name` e `description` como textos não vazios.
- Dados os três dicionários, quando as chaves de `pageHelp.quadrants` são percorridas, então toda
  chave existe entre os quadrantes declarados na taxonomia.
- Dado o `public/config.json` do repositório, quando `quadrants` e `quadrantsMap` são comparados,
  então declaram o mesmo conjunto de slugs.
- Dado um slug acrescentado à taxonomia sem a entrada correspondente em um dos dicionários, quando
  a suíte roda, então ela falha nomeando o slug e o idioma em falta.
- Dado o arquivo de teste de consistência, quando a suíte roda, então nenhum módulo que importe
  `d3` entra no grafo de importação, e nem `RadarGrid` nem `RadarChart` são renderizados.
- Dado `src/components/PageHelp/PageHelp.test.tsx`, quando a suíte roda, então a página é
  renderizada com o `i18next` inicializado e o idioma fixado antes da asserção.

**Portão de qualidade:**

- Dado o repositório alterado, quando `yarn ts:check` roda, então termina com código 0.
- Dado o repositório alterado, quando `yarn lint` roda, então termina com código 0 e sem nenhum
  aviso do ESLint, porque o build do GitHub Actions roda com `CI=true` e trata aviso como erro.
- Dado o repositório alterado, quando `yarn build` roda, então o pacote de produção é gerado sem
  erro.
- Dado o repositório alterado, quando `yarn test` roda, então os testes novos passam e nenhuma
  suíte que passava antes falha. `Item.test.tsx` e `date.test.tsx` seguem falhando por
  transformação de ESM de `query-string` e de `moment`, condição que já existe na base e que esta
  unidade não altera.

## Comportamento atual → novo

| Aspecto | Hoje | Depois desta unidade |
| --- | --- | --- |
| Forma de `pageHelp.quadrants` nos três dicionários | Lista de quatro objetos `{ name, description }`, ordenada pelas posições 1 a 4. | Objeto endereçado pelo slug do quadrante, com `{ name, description }` em cada entrada. |
| Origem da descrição no bloco de rótulo | `quadrants[quadrantConfig.position - 1].description`, sobre a lista traduzida tipada como `QuadrantConfig[]`, com o texto resultante passado de novo por `t` usando o próprio texto como chave. | Resolução direta pelo slug do quadrante que o bloco apresenta, em uma única passagem pela tradução. |
| Montagem da lista da página de ajuda | `map` sobre a lista traduzida, tipada como `Quadrant[]`. | Iteração sobre o mapa por slug, tipada como mapa de slug para `{ name, description }`, preservando a ordem publicada. |
| Acrescentar um quadrante à taxonomia | Exige inserir a descrição na posição certa das três listas; a descrição fora de ordem é atribuída ao quadrante errado, sem erro visível. | Exige declarar a entrada do slug nos três dicionários; a ordem de escrita não altera a associação. |
| Taxonomia com cinco quadrantes | A página inicial é derrubada por `Cannot read properties of undefined (reading 'description')` ao montar o bloco de rótulo do quinto quadrante, e a página de ajuda lista apenas quatro. | A página inicial monta os blocos dos cinco quadrantes e a página de ajuda lista os cinco. |
| Quadrante declarado sem tradução | Nada acusa a falta; o rótulo aparece como a chave crua e a descrição ausente derruba a página inicial. | A suíte falha nomeando o slug e o idioma em falta, antes da publicação. |
| Explicação pública do agrupamento | "Agrupamos ou categorizamos os itens em 4 quadrantes", com o numeral escrito nos três idiomas. | A mesma frase sem o numeral, nos três idiomas. |

O que permanece intocado: os textos de `name` e de `description` de cada quadrante nos três
idiomas, o rótulo curto `quadrants.<slug>`, a descrição de `quadrantsMap` em `public/config.json`,
a lista de descrições dos anéis, o número "QUADRANTE N" e o canto de cada bloco de rótulo — ambos
vindos da posição exibida —, o atalho de aproximação, a legenda das formas, o diagrama inteiro, o
acervo, o identificador de build e o workflow de publicação.

## Dependências entre domínios

- **Taxonomia de Quadrantes e Anéis** — `public/config.json` é o conjunto autoritativo de slugs de
  quadrante, declarado nos dois mapas `quadrants` e `quadrantsMap`; é dele que a verificação de
  consistência parte, e é a `position` declarada ali que continua fornecendo o número e o canto do
  bloco de rótulo.
- **Visualização do Radar** — o bloco de rótulo é a única peça do desenho que consome a descrição
  longa; os arcos, o brilho de fundo e os pontos leem apenas o slot de tela e as cores.
- **Governança de Contribuição do Radar** — a página de ajuda é a definição publicada do processo
  para quem lê o radar; o procedimento dirigido a quem contribui vive em `CONTRIBUTING.md` e é
  atualizado pela unidade que encerra a iniciativa.
- **Navegação e Descoberta de Tecnologias** — `PageItem`, `PageOverview`, `PageQuadrant` e
  `QuadrantSection` resolvem o rótulo curto por `quadrants.<slug>` e nenhum deles exibe a descrição
  longa; a verificação de consistência cobre esse rótulo, mas nenhuma dessas telas muda.

## Riscos e observações

- **A ordem da lista da página de ajuda é parâmetro atribuído ao plano.** Ela pode vir da ordem de
  declaração das chaves no dicionário, que o `Object.entries` preserva para chaves não numéricas,
  ou da `position` declarada na taxonomia — o que exigiria levar a configuração até `PageHelp`,
  que hoje recebe apenas `leaving` e `onLeave`. A escolha e a sua justificativa ficam registradas
  no [`plan.md`](./plan.md), a pedido de quem solicitou a mudança; nas duas saídas a ordem exibida
  é a publicada hoje, e o critério de aceite da História 2 a prende com teste, para que ela não
  dependa de comportamento implícito.
- **Extrair ou não uma função pura para a leitura da descrição é decisão do plano.** O critério de
  aceite exige que a descrição seja resolvida pelo slug e que nada dependa da posição; se isso vive
  dentro do componente ou em uma função própria é escolha técnica registrada no
  [`plan.md`](./plan.md). `RadarGrid` traz `RadarChart` — e com ele o `d3` — para o grafo de
  importação, de modo que a asserção automática sobre essa leitura só existe se a função for
  extraída.
- **A conferência dos blocos de rótulo é visual.** `RadarGrid` e `RadarChart` ficam fora do alcance
  da suíte pela transformação de ESM do `d3` 7.8.0, que o transform do `react-scripts` não alcança
  em `node_modules`. Os critérios da História 2 sobre a página inicial são conferidos abrindo o
  radar nos três idiomas e comparando com `techradar.db1.com.br`.
- **O `i18next` pode estar sem inicialização no teste.** `src/i18n/index.ts` só entra no grafo de
  importação pela importação feita em `ButtonFlag`; um teste que renderiza `PageHelp` isolado roda
  com o idioma indefinido e produz saída em inglês. O teste de componente importa `src/i18n` e fixa
  o idioma antes de renderizar.
- **A segunda passagem por `t` hoje é inofensiva por acaso.** O texto traduzido não corresponde a
  nenhuma chave, e o `i18next` devolve a própria string. Removê-la não muda o que o leitor vê e
  elimina a chance de um texto de descrição que colida com um caminho de chave ser substituído.
- **O espanhol segue com um parágrafo a menos.** `pageHelp.paragraphs[2].values[2]` — a etapa de
  pesquisa do time de Staff Engineering — existe em `pt.json` e em `en.json` e falta em `es.json`.
  A verificação de consistência desta unidade cobre o mapa de quadrantes, não as listas narrativas,
  e a falta permanece.
- **`pageHelp.quadrantsPreDescription` em `en.json` está em português.** O valor é "Os quadrantes
  são:". A chave está fora do escopo desta unidade e a dessincronia permanece: estrutura
  sincronizada não garante tradução feita.
- **A conferência com cinco quadrantes é local e descartável.** O bloco de rótulo do quinto
  quadrante aparece sem posicionamento correto, e isso é esperado — a grade é migrada pela unidade
  seguinte. O quadrante de teste não entra no commit.
- **O portão de qualidade local já nasce parcialmente vermelho.** `Item.test.tsx` e
  `date.test.tsx` falham na base por transformação de ESM, e a suíte não roda no CI — o único
  workflow do repositório compila e publica. A conferência de que nenhuma suíte nova quebrou é
  manual.
- **Impacto na documentação autoritativa.** A skill `taxonomia-de-quadrantes-e-aneis` descreve
  `pageHelp.quadrants` como lista de `{ name, description }` ordenada pela posição, afirma que as
  duas listas de descrição são posicionais e inclui, no procedimento de acrescentar um quadrante, o
  passo de manter a ordem das listas igual à das posições; a skill `visualizacao-do-radar` descreve
  a descrição do bloco de rótulo como lida da lista pela posição (regra 12), nomeia as listas
  posicionais entre as peças presas a quatro (regra 16) e repete o passo posicional no
  procedimento de acrescentar um quadrante; a skill `internacionalizacao-do-radar` cita
  `pageHelp.quadrants` entre os valores em lista cujo número de elementos deve coincidir nos três
  idiomas. A mudança é deliberada e está apoiada na descrição desta unidade e na
  [ADR 0001](../../../docs/adr/0001-geometria-configuravel-do-grafico.md), que registra a
  quantidade de quadrantes como escolha de configuração. O impacto e as tarefas de atualização são
  registrados no [`plan.md`](./plan.md) desta unidade.
</content>
</invoke>
