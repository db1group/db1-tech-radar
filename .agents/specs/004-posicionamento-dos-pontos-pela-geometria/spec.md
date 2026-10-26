# Spec: posicionamento dos pontos pela geometria compartilhada

## Visão geral

A posição de cada ponto do radar passa a ser sorteada dentro do setor apontado pelo slot de tela
do quadrante, pela mesma definição angular que já governa os arcos dos anéis e o brilho de fundo,
de modo que o sorteio acompanhe a quantidade de quadrantes declarada na taxonomia e deixe de
depender de uma tabela de quatro entradas indexada pela posição exibida.

## Domínios envolvidos

| Domínio | Impacto desta unidade | Documentação autoritativa |
| --- | --- | --- |
| Visualização do Radar | O sorteio da posição do ponto muda de regra: o ângulo vem da repartição do círculo pela quantidade de quadrantes, a folga das divisórias deixa de ser medida contra as duas linhas centrais e passa a ser uma margem angular dentro do próprio setor, a distância ao centro é sorteada por área dentro da faixa do anel, o afastamento entre pontos passa a valer apenas entre pontos do mesmo setor e o teto de tentativas sobe, com aviso registrado ao ser esgotado. | [`visualizacao-do-radar/SKILL.md`](../../skills/visualizacao-do-radar/SKILL.md) |
| Taxonomia de Quadrantes e Anéis | Concluída esta unidade, o diagrama inteiro — arcos, brilho e pontos — é desenhado a partir do slot de tela (`order`), e a posição exibida (`position`) deixa de participar de qualquer cálculo de desenho, restando-lhe o número e o canto do bloco de rótulo. A restrição de que a geometria assume quadrantes nas posições 1 a 4 deixa de valer para o diagrama. | [`taxonomia-de-quadrantes-e-aneis/SKILL.md`](../../skills/taxonomia-de-quadrantes-e-aneis/SKILL.md) |
| Catálogo de Opiniões Tecnológicas | O tipo `Blip` — o modelo de leitura que o desenho monta a partir de cada item e que vive em `src/model.ts`, junto com os tipos do acervo — deixa de carregar a posição exibida do quadrante. Nenhum campo de item, nenhuma regra de classificação e nenhum texto de opinião muda; a conferência de que o acervo continua inteiro no gráfico é a contagem de pontos. | [`catalogo-de-opinioes-tecnologicas/SKILL.md`](../../skills/catalogo-de-opinioes-tecnologicas/SKILL.md) |

Os outros quatro domínios ficaram fora da análise, por não terem artefato tocado nem
comportamento alterado: **Navegação e Descoberta de Tecnologias** (o destino do link de cada
ponto continua sendo o par quadrante + nome, e nenhuma rota, busca ou listagem é tocada),
**Governança de Contribuição do Radar** (o procedimento publicado para acrescentar um quadrante é
atualizado pela unidade que encerra a iniciativa), **Publicação e Distribuição do Radar** (nenhuma
chave de configuração nova chega ao navegador: a alteração vive inteira no pacote compilado, que
já troca a cada publicação) e **Identidade Institucional DB1** (sem relação com o desenho).

## Escopo

**Dentro:**

- O ponto de cada tecnologia sorteado dentro do setor do seu quadrante, qualquer que seja a
  quantidade de quadrantes declarada, de um a seis.
- A margem livre entre o ponto e cada uma das duas divisórias do seu setor, medida como fração do
  próprio setor e não contra as linhas que cruzam o centro do diagrama.
- A margem livre entre o ponto e cada um dos dois arcos que delimitam a faixa do seu anel.
- A distribuição dos pontos ao longo da faixa do anel sem acúmulo junto à borda interna.
- O afastamento entre pontos vizinhos restrito aos pontos do mesmo setor.
- O registro de aviso no console quando o teto de tentativas de reposicionamento é esgotado e o
  ponto é aceito sobreposto.
- A verificação automática de que todo ponto cai dentro do setor do seu quadrante e da faixa do
  seu anel, para três, quatro, cinco e seis quadrantes.
- A verificação automática de que, com os quatro quadrantes publicados, os pontos de cada
  quadrante caem no mesmo canto do diagrama em que estão hoje.
- A verificação automática de que todo item do acervo com anel e quadrante válidos vira um ponto.

**Fora:**

- Tornar o sorteio determinístico ou calculá-lo em tempo de publicação: a posição continua sendo
  sorteada a cada carregamento da página.
- Margem angular proporcional à distância do centro.
- As três formas de ponto, a dica exibida ao passar o mouse e o link para a página da tecnologia.
- Os arcos dos anéis, o brilho de fundo e os rótulos de anel.
- O bloco de rótulo de quadrante, a sua descrição e a grade ao redor do diagrama.
- Os rótulos resolvidos por slug nos três idiomas.
- A mensagem legível para configuração inválida, incluindo o item cujo anel não existe na
  taxonomia, que continua derrubando a tela do radar.
- Publicar o radar com uma quantidade de quadrantes diferente de quatro.

## Fronteira de domínio

**Esta spec implementa:**

- Função `blipPosition` em `src/components/Chart/geometry.ts`, pura, sem React e sem `d3`,
  recebendo o slot de tela, a quantidade de setores, o índice do anel, a configuração do radar, os
  pontos já posicionados no mesmo setor e a fonte de aleatoriedade como parâmetro opcional
  (padrão `Math.random`), e devolvendo um ponto em pixels de tela.
- Consumo de `segmentAngles` e `polarToCartesian` por `blipPosition`, sem nenhuma expressão
  angular própria.
- Constantes de sorteio em `src/components/Chart/geometry.ts`: folga de 15 px em cada borda da
  faixa do anel, margem de 10° em cada divisória do setor, distância mínima entre pontos do mesmo
  setor e teto de 150 tentativas.
- Módulo `src/components/Chart/blips.ts` com a função `buildBlips`, pura, sem React e sem `d3`,
  que converte a lista de itens e a configuração do radar na lista de `Blip` com coordenada
  resolvida, mantendo o acumulador de pontos já posicionados por setor.
- Remoção de `generateCoordinates`, de `randomBetween`, do vetor de deslocamento `[1, 4, 2, 3]`,
  da guarda contra as linhas centrais e do laço de reposicionamento em
  `src/components/Chart/BlipPoints.tsx`.
- Alteração do tipo `Blip` em `src/model.ts`, que deixa de carregar a posição exibida do
  quadrante.
- Casos de `blipPosition` em `src/components/Chart/geometry.test.tsx`, com a trava de tela lida do
  `public/config.json` do repositório.
- Casos de `buildBlips` em `src/components/Chart/blips.test.tsx`, com a contagem lida do
  `public/db1-opinion.json` do repositório.
- Atualizações de documentação listadas na seção de impacto do [`plan.md`](./plan.md) desta
  unidade.

**Pertence a outras unidades (não vira tarefa aqui):**

- Chaves `quadrants` e `pageHelp.quadrants` nos três dicionários de tradução,
  `src/components/PageHelp/PageHelp.tsx` e a resolução de rótulo por slug — unidade do i18n por
  slug.
- `stylesMap`, a leitura de `quadrantConfig.position` em
  `src/components/RadarGrid/RadarGrid.tsx` e `src/components/RadarGrid/radar-grid.scss` — unidade
  dos blocos de rótulo e da grade responsiva.
- Validação da configuração no carregamento, em `src/components/App.tsx` — unidade da validação.
- `CONTRIBUTING.md` e a conferência final com três, cinco e seis quadrantes — unidade que encerra
  a iniciativa.
- `arcPath`, `glowShape`, `glowElement` e o bloco do `d3.arc` em
  `src/components/Chart/QuadrantRings.tsx` — já consomem a definição única de geometria e ficam
  intocados.
- `RingLabel` em `src/components/Chart/RadarChart.tsx` — o rótulo de anel é espelhado sobre a
  linha horizontal e não depende da repartição do círculo.
- `ChangedBlip`, `NewBlip` e `DefaultBlip` em `src/components/Chart/BlipShapes.tsx` — as três
  formas leem a coordenada pronta e não participam do sorteio.
- `REACT_APP_BUILDHASH` em `.env` — esta unidade não acrescenta nem altera chave de configuração
  servida ao navegador.

## Histórias de usuário

1. Como pessoa que mantém o gráfico, quero que a posição dos pontos derive da definição única de
   geometria, para que o sorteio acompanhe a quantidade de quadrantes declarada e nenhuma tabela
   indexada pela posição exibida reste no desenho.
2. Como pessoa que lê o radar publicado, quero cada ponto dentro do quadrante e do anel que a
   opinião declara, com todas as tecnologias do acervo representadas, para confiar no que o
   diagrama mostra.
3. Como pessoa que lê o radar publicado, quero os pontos espalhados pela faixa do anel sem
   encostar nos arcos nem nas divisórias entre setores, para distinguir a que setor cada ponto
   pertence.
4. Como pessoa que vai acrescentar um quinto quadrante, quero ver os pontos do quadrante novo
   dentro do setor de 72° dele, para confirmar que o sorteio responde à configuração antes de o
   restante do desenho ser migrado.

## Critérios de aceite

**História 1 — o sorteio pela definição única:**

- Dado o repositório, quando `src/components/Chart/BlipPoints.tsx` é lido, então não existe nele
  nenhuma estrutura indexada por `position`, nenhuma comparação com as linhas centrais do diagrama
  e nenhum laço de reposicionamento; `generateCoordinates` e `randomBetween` não existem em
  nenhum arquivo sob `src/`.
- Dado o repositório, quando as expressões angulares sob `src/` são procuradas, então `Math.cos` e
  `Math.sin` aparecem apenas em `src/components/Chart/geometry.ts`.
- Dado o repositório, quando `blipPosition` é lida, então ela obtém a faixa angular do setor por
  `segmentAngles` e converte o par ângulo + raio em coordenada por `polarToCartesian`, sem
  nenhuma fórmula angular própria.
- Dado o repositório, quando `src/components/Chart/BlipPoints.tsx` é lido, então o setor de cada
  ponto vem de `slotOf(quadrantConfig)` e de `segmentCount(config)`, e nenhuma escala do `d3`
  participa do cálculo da coordenada.
- Dado o repositório, quando `src/model.ts` é lido, então o tipo `Blip` não declara a posição
  exibida do quadrante.
- Dado o arquivo de teste de cada função nova, quando a suíte roda, então nenhum módulo que
  importe `d3` entra no grafo de importação e nenhuma suíte falha por transformação de ESM.

**História 1 — o raio do anel em pixels:**

- Dado o `public/config.json` do repositório, quando o raio de um anel é convertido para pixels
  dentro de `blipPosition`, então o valor é `radius * size / (scale[1] - scale[0])`, o mesmo que
  `xScale(radius) - xScale(0)` devolve aos arcos: 200 px para `adopt`, 275 px para `trial`, 350 px
  para `assess` e 400 px para `hold`.
- Dado o mesmo arquivo, quando a faixa de sorteio de cada anel é calculada, então vai de 15 px a
  185 px em `adopt`, de 215 px a 260 px em `trial`, de 290 px a 335 px em `assess` e de 365 px a
  385 px em `hold` — o raio do anel anterior mais 15 px até o raio do anel menos 15 px, com 0 como
  raio anterior do primeiro anel.

**História 2 — o ponto cai no setor e no anel:**

- Dado `N` em {3, 4, 5, 6}, cada slot de 1 a `N` e cada anel, quando 200 posições são sorteadas,
  então o ângulo de cada ponto em relação ao centro do diagrama — medido em pixels de tela, com 0°
  às 12 horas e crescendo no sentido horário — cai entre o início do setor mais 10° e o fim do
  setor menos 10°.
- Dado o mesmo conjunto, quando a distância de cada ponto ao centro do diagrama é medida, então
  ela cai entre a borda interna e a borda externa da faixa de sorteio do seu anel.
- Dado o `public/config.json` do repositório, lido pelo teste a partir do arquivo real e não de
  uma cópia, quando posições de `methods-and-patterns` são sorteadas, então todas têm `x` maior
  que o centro e `y` menor que o centro — o canto superior direito.
- Dado o mesmo arquivo, quando posições de `tools` são sorteadas, então todas têm `x` maior que o
  centro e `y` maior que o centro — o canto inferior direito.
- Dado o mesmo arquivo, quando posições de `platforms-and-operations` são sorteadas, então todas
  têm `x` menor que o centro e `y` maior que o centro — o canto inferior esquerdo.
- Dado o mesmo arquivo, quando posições de `languages-and-frameworks` são sorteadas, então todas
  têm `x` menor que o centro e `y` menor que o centro — o canto superior esquerdo.
- Dado `N` de 1 a 6, cada slot de 1 a `N` e cada anel, quando uma posição é sorteada, então `x` e
  `y` são números finitos.

**História 2 — todo item válido vira ponto:**

- Dado o `public/db1-opinion.json` e o `public/config.json` do repositório, lidos pelo teste a
  partir dos arquivos reais, quando `buildBlips` recebe os itens em destaque, então devolve 53
  pontos — a quantidade de itens com anel e quadrante existentes na taxonomia.
- Dada uma lista com um item sem anel, um item sem quadrante e um item cujo quadrante não existe
  na taxonomia, quando `buildBlips` a recebe, então os três são omitidos e nenhum erro é lançado.
- Dado o radar com os quatro quadrantes publicados, quando a página inicial é aberta e os
  elementos `.blips > a` do SVG são contados, então são 53.
- Dado cada ponto do SVG, quando ele é inspecionado, então tem a cor do seu quadrante, exibe a
  dica com o rótulo da tecnologia ao passar o mouse e leva à página do par quadrante + nome, nas
  três formas de ponto — novo, alterado e inalterado.

**História 3 — folga das divisórias, dos arcos e dos vizinhos:**

- Dado o radar com os quatro quadrantes publicados, quando a página inicial é observada quadrante
  a quadrante e anel a anel, então nenhum ponto encosta na divisória entre dois setores nem nos
  arcos que delimitam a sua faixa. A posição exata muda a cada carregamento, de modo que a
  conferência é visual, por quadrante e anel, e não por comparação de captura de tela.
- Dado um gerador de aleatoriedade injetado que devolve sempre o mesmo valor, quando `buildBlips`
  posiciona dois pontos no mesmo setor e no mesmo anel, então o segundo esgota as 150 tentativas,
  `console.warn` é chamado uma vez e a última posição sorteada é devolvida.
- Dado o mesmo gerador, quando os dois pontos ficam em setores diferentes, então nenhuma tentativa
  extra acontece e `console.warn` não é chamado: o afastamento só é exigido entre pontos do mesmo
  setor.
- Dado o sorteio da distância ao centro, quando ele é lido, então aplica a raiz quadrada do valor
  sorteado sobre a largura da faixa, o que desfaz o acúmulo de pontos junto à borda interna.

**História 4 — um quinto quadrante:**

- Dado um `public/config.json` local com um quinto quadrante — `position` 5, `order` 5, cor
  própria e entrada no mapa de nomes — e alguns itens do acervo classificados nele, quando a
  página inicial é aberta, então os pontos do quadrante novo aparecem dentro do setor de 72° dele,
  na cor dele, sem coordenada inválida e sem ponto desaparecido.
- Dado esse mesmo estado local, quando o restante do diagrama é observado, então o bloco de rótulo
  e os textos do quinto quadrante aparecem errados ou ausentes, por continuarem indexados por
  `position` ou resolvidos posicionalmente.
- Dado o commit da unidade, quando o diff é lido, então o quadrante de teste não aparece nele:
  `public/config.json` fica como está versionado.

**Portão de qualidade:**

- Dado o repositório alterado, quando `yarn ts:check` roda, então termina com código 0.
- Dado o repositório alterado, quando `yarn lint` roda, então termina com código 0.
- Dado o repositório alterado, quando `yarn test` roda, então os testes novos passam e nenhuma
  suíte que passava antes falha. `Item.test.tsx` e `date.test.tsx` seguem falhando por
  transformação de ESM de `query-string` e de `moment`, condição que já existe na base e que esta
  unidade não altera.
- Dado o commit da alteração, quando a mensagem é lida, então cita a procedência do algoritmo.

## Comportamento atual → novo

| Aspecto | Hoje | Depois desta unidade |
| --- | --- | --- |
| Origem do setor do ponto | Deslocamento de múltiplos de 90° lido do vetor `[1, 4, 2, 3]` por `quadrantPosition - 1`, em convenção anti-horária. | `segmentAngles(slotOf(quadrante), segmentCount(config))`, a mesma faixa que alimenta os arcos e o brilho. |
| Conversão para coordenada de tela | `xScale` e `yScale` do `d3` aplicados ao cosseno e ao seno, com o eixo vertical invertido pelo `yScale`. | `polarToCartesian`, em pixels de tela, com o eixo vertical crescendo para baixo. |
| Folga das divisórias | Rejeição da posição a menos de 15 px da linha vertical ou da horizontal que cruzam o centro. | Margem de 10° descontada de cada ponta do setor antes do sorteio do ângulo. |
| Folga dos arcos | 0,7 unidade de coordenada — 17,5 px — em cada borda da faixa do anel. | 15 px em cada borda da faixa do anel. |
| Sorteio da distância ao centro | Uniforme entre as duas bordas da faixa, o que acumula pontos junto à borda interna — doze vezes mais densos ali do que na borda externa, no anel mais interno. | Raiz quadrada do valor sorteado aplicada sobre a largura da faixa, o que desfaz esse acúmulo. |
| Afastamento entre pontos | Comparação com todos os pontos já posicionados, de qualquer quadrante. | Comparação apenas com os pontos já posicionados no mesmo setor. |
| Teto de tentativas | Cem, e a última posição é aceita em silêncio ao esgotá-lo. | Cento e cinquenta, com `console.warn` ao esgotá-lo antes de aceitar a última posição. |
| Fonte de aleatoriedade | `Math.random` chamado dentro do cálculo. | Parâmetro opcional da função, com `Math.random` como padrão, o que torna o sorteio verificável por teste. |
| Quantidade de quadrantes que o sorteio suporta | Quatro. Com cinco, o vetor devolve `undefined`, o deslocamento vira `NaN` e o ponto some do SVG sem erro. | Qualquer quantidade declarada na taxonomia, de uma a seis, cada quadrante no setor de 360°/N do seu slot. |
| Alcance do cálculo pela suíte | Nenhum: o cálculo vive dentro de um módulo que importa `d3`. | Funções puras sem `d3`, cobertas por teste unitário. |

O que permanece intocado: os arcos dos anéis, o brilho de fundo, os rótulos de anel, as três
formas de ponto, a dica ao passar o mouse, o link de cada ponto, os blocos de rótulo de quadrante,
os três dicionários de tradução, o acervo, o identificador de build e o workflow de publicação. A
posição de cada ponto continua sendo sorteada a cada renderização, e o mesmo item continua
aparecendo em lugares diferentes do mesmo setor entre uma visita e outra.

## Dependências entre domínios

- **Taxonomia de Quadrantes e Anéis** — `order` é o slot de tela que decide o setor do ponto,
  `colour` e `txtColour` são as cores do ponto e da sua dica, a quantidade de entradas de
  `quadrantsMap` é a repartição do círculo, e a lista ordenada de anéis com as suas entradas de
  geometria é a faixa de distância ao centro. A exigência de slots contíguos de 1 a N é regra da
  taxonomia, e nada a verifica no carregamento da aplicação: a unidade da validação de
  configuração é que fecha esse ponto.
- **Catálogo de Opiniões Tecnológicas** — cada item declara quadrante e anel por slug e marca de
  publicação; o desenho os lê e não os altera. Item fora de destaque não vira ponto.
- **Navegação e Descoberta de Tecnologias** — o ponto continua sendo um link para o par
  quadrante + nome, com o recorte por tags preservado na URL; o slot de tela não participa de
  nenhum endereço.
- **Governança de Contribuição do Radar** — o procedimento publicado para acrescentar um quadrante
  é atualizado pela unidade que encerra a iniciativa.

## Riscos e observações

- **Espelhamento vertical (R1, crítico).** `yScale` tem imagem `[size, 0]` e inverte o eixo
  vertical: alimentar a conversão de polar para cartesiano com ele manda cada ponto para o setor
  espelhado sobre a linha horizontal. Com quatro quadrantes a simetria do desenho disfarça o erro,
  e é a verificação de que o ângulo do ponto cai dentro do setor, para três, cinco e seis
  quadrantes, que o expõe.
- **Setor errado por usar a posição exibida (R2).** A sequência de slots percorre o círculo em
  ordem e a numeração exibida dos quadrantes, não. Alimentar a fórmula com `position` põe o ponto
  em um setor de cor diferente do arco que o circunda. É por isso que a trava de tela lê o
  `public/config.json` do repositório, e não uma cópia de fixture.
- **Uma única origem angular (R4).** A fórmula de ângulo vive só em `geometry.ts`. Qualquer outra
  expressão angular escrita no componente reabre a divergência silenciosa entre tabelas que a
  iniciativa está eliminando.
- **Margem angular constante em graus (R6).** Dez graus valem muito menos em pixels perto do
  centro do que na borda: no anel mais interno a margem real é de poucos pixels, e um ponto pode
  parecer encostado na divisória. Trocar a margem fixa por uma dependente da distância está fora
  do escopo desta unidade e só se justifica se a conferência visual do anel interno mostrar o
  encosto.
- **Ponto com coordenada inválida some sem aviso (R9).** Um ponto com coordenada `NaN` não é
  desenhado pelo navegador e não gera erro. A contagem de pontos contra o acervo é o que pega
  isso, tanto no teste sobre `buildBlips` quanto na conferência dos elementos `.blips > a` no SVG.
- **A margem angular deixa uma fatia vazia com um único quadrante.** Com `N` igual a 1 o setor é o
  círculo inteiro e não há divisória alguma, mas a margem de 10° em cada ponta continua sendo
  descontada, o que deixa uma cunha de 20° às 12 horas sem nenhum ponto. É consequência aceita de
  aplicar a mesma constante a qualquer `N`; nenhuma configuração publicada tem um quadrante só.
- **A distância mínima entre pontos do mesmo setor é parâmetro atribuído ao plano.** A referência
  da v5 é 20 px e a regra vigente neste repositório é 1,5 vez o tamanho do ponto, hoje 18 px. A
  escolha entre as duas é registrada no [`plan.md`](./plan.md) desta unidade, a pedido de quem
  solicitou a mudança. Nos dois valores o setor mais carregado do acervo — doze itens em `adopt`
  de `languages-and-frameworks`, sobre uma faixa de cerca de 20 000 px² — cabe sem esgotar as 150
  tentativas.
- **O destino do campo de posição no tipo `Blip` é atribuído ao plano.** O campo existe hoje só
  para alimentar o vetor de deslocamento; se ele passa a guardar o slot de tela ou desaparece do
  tipo é decisão registrada no [`plan.md`](./plan.md), também a pedido de quem solicitou a
  mudança. Nas duas saídas o comportamento visível é o mesmo.
- **A contagem de pontos não é verificável renderizando o componente.** Cada ponto é embrulhado
  por `Link`, que usa `useSearchParamState` e traz `query-string` para o grafo de importação —
  pacote ESM que o transform do Jest deste projeto não alcança, a mesma causa de `Item.test.tsx`
  falhar na base. Por isso a montagem da lista de pontos é função pura e a contagem é afirmada
  sobre ela, com a contagem dos elementos `.blips > a` no SVG ficando como conferência manual.
- **A conferência com cinco quadrantes é local e descartável.** Outras partes do desenho ainda
  presas a quatro — o bloco de rótulo no canto e os textos resolvidos por posição — aparecem
  erradas nessa conferência, e isso é esperado: cada uma é migrada por uma unidade própria. O
  quadrante de teste não entra no commit.
- **O portão de qualidade local já nasce parcialmente vermelho.** `Item.test.tsx` e
  `date.test.tsx` falham na base por transformação de ESM, e a suíte não roda no CI — o único
  workflow do repositório compila e publica. A conferência de que nenhuma suíte nova quebrou é
  manual.
- **Procedência.** O algoritmo vem do `Positioner` da branch `v5` de
  `AOEpeople/aoe_technology_radar` (`scripts/positioner.ts`, PR #502), sob Apache-2.0 e com a
  mesma origem deste fork. A citação é obrigatória no commit.
- **Impacto na documentação autoritativa.** A skill `visualizacao-do-radar` descreve o setor do
  ponto como uma fatia de 90°, as quatro regras do sorteio com a folga de 0,7 unidade, o
  afastamento de 15 px das linhas centrais, o afastamento de todos os pontos já posicionados e o
  teto de cem tentativas, e nomeia o sorteio entre as peças ainda presas a quatro posições; a
  skill `taxonomia-de-quadrantes-e-aneis` afirma que a geometria publicada assume quadrantes nas
  posições 1 a 4; a skill `estrategia-de-testes` descreve `generateCoordinates` como o alvo do
  teste de sorteio e o vetor de deslocamento como a tabela por posição que resta. O impacto e as
  tarefas de atualização são registrados no [`plan.md`](./plan.md) desta unidade.
