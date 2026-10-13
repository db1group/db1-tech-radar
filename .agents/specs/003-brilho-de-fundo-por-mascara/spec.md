# Spec: brilho de fundo por máscara compartilhada

## Visão geral

O brilho de fundo de cada quadrante passa a ser uma forma sólida recortada por uma máscara de
degradê compartilhada por todo o diagrama, de modo que o fundo colorido acompanhe a quantidade de
quadrantes declarada na taxonomia, mantendo o radar publicado idêntico ao que está no ar com os
quatro quadrantes atuais.

## Domínios envolvidos

| Domínio | Impacto desta unidade | Documentação autoritativa |
| --- | --- | --- |
| Visualização do Radar | O fundo colorido de cada quadrante deixa de ser um retângulo de canto com degradê próprio e passa a ser a fatia do círculo apontada pelo slot de tela, pintada em cor cheia e recortada por um degradê único do diagrama. Com quatro quadrantes o resultado visível é o mesmo. | [`visualizacao-do-radar/SKILL.md`](../../skills/visualizacao-do-radar/SKILL.md) |

Os outros seis domínios ficaram fora da análise, por não terem artefato tocado nem comportamento
alterado: **Taxonomia de Quadrantes e Anéis** (o slot de tela, a cor e a quantidade de quadrantes
já estão declarados; esta unidade apenas os consome — ver a seção de dependências), **Catálogo de
Opiniões Tecnológicas** (nenhum item muda e nenhum ponto é redesenhado), **Navegação e Descoberta
de Tecnologias** (rotas e listagens não tocam o desenho), **Governança de Contribuição do Radar**
(o procedimento publicado é alterado pela unidade que encerra a iniciativa), **Publicação e
Distribuição do Radar** (nenhuma chave de configuração nova chega ao navegador: a alteração vive
inteira no pacote compilado, que já troca a cada publicação) e **Identidade Institucional DB1**
(sem relação com a geometria).

## Escopo

**Dentro:**

- O fundo colorido de cada quadrante desenhado na fatia do círculo que ele ocupa, qualquer que
  seja a quantidade de quadrantes declarada, de uma a seis.
- O degradê do brilho — da cor cheia no centro até a transparência total na borda do círculo —
  definido uma única vez para o diagrama inteiro.
- O recorte do fundo colorido pelo círculo do radar, sem cor fora dele.
- A verificação automática de que, com os quatro quadrantes publicados, o fundo de cada quadrante
  continua na mesma fatia de tela que ocupa hoje.
- A verificação automática de que o fundo cobre a fatia inteira, sem faixa sem cor junto à borda,
  em qualquer quantidade de quadrantes.

**Fora:**

- Qualquer alteração no que o leitor vê no radar publicado com os quatro quadrantes atuais.
- Os arcos dos anéis e os rótulos de anel.
- A posição dos pontos dentro do setor.
- O rótulo de quadrante, a sua descrição e a grade ao redor do diagrama.
- O texto de ajuda e os rótulos resolvidos por slug nos três idiomas.
- A mensagem legível para configuração inválida.
- Publicar o radar com uma quantidade de quadrantes diferente de quatro.

## Fronteira de domínio

**Esta spec implementa:**

- Função `polarToCartesian` em `src/components/Chart/geometry.ts`, pura, convertendo ângulo em
  graus e raio em coordenada de tela sobre a convenção angular já estabelecida — 0° = 12 horas,
  sentido horário, eixo vertical crescendo para baixo.
- Bloco `<defs>` no `<svg>` de `src/components/Chart/RadarChart.tsx`, com `mask` de identificador
  `radar-mask`, `mask` de identificador `glow-mask` e `radialGradient` de identificador
  `glow-gradient`.
- Forma de brilho por quadrante em `src/components/Chart/QuadrantRings.tsx`: `<polygon>` para três
  ou mais quadrantes, `<circle>` para um e `<rect>` para dois, em cor cheia do quadrante, recortada
  por `glow-mask` dentro de um grupo recortado por `radar-mask`.
- Remoção da tabela `gradientAttributes`, do `radialGradient` por quadrante, da variável
  `gradientId` e do `<rect>` de canto em `src/components/Chart/QuadrantRings.tsx`.
- Casos de `polarToCartesian` e das formas de brilho em
  `src/components/Chart/geometry.test.tsx`, com a trava de tela lida do `public/config.json` do
  repositório.
- Atualizações de documentação listadas na seção de impacto do [`plan.md`](./plan.md) desta
  unidade.

**Pertence a outras unidades (não vira tarefa aqui):**

- `generateCoordinates`, `randomBetween` e o vetor de deslocamento `[1, 4, 2, 3]` em
  `src/components/Chart/BlipPoints.tsx` — unidade do posicionamento dos pontos.
- Chave `pageHelp.quadrants` nos três dicionários de tradução e
  `src/components/PageHelp/PageHelp.tsx` — unidade do i18n por slug.
- `stylesMap`, a leitura de `quadrantConfig.position` em
  `src/components/RadarGrid/RadarGrid.tsx` e `src/components/RadarGrid/radar-grid.scss` — unidade
  dos blocos de rótulo e da grade responsiva.
- Validação da configuração no carregamento, em `src/components/App.tsx` — unidade da validação.
- `CONTRIBUTING.md` e a conferência final com três, cinco e seis quadrantes — unidade que encerra
  a iniciativa.
- `arcPath`, o bloco do `d3.arc` e `ringsAttributes` em
  `src/components/Chart/QuadrantRings.tsx` — já consomem a definição única de geometria e ficam
  intocados.
- `RingLabel` em `src/components/Chart/RadarChart.tsx` — o rótulo de anel é espelhado sobre a linha
  horizontal e não depende da repartição do círculo.
- `REACT_APP_BUILDHASH` em `.env` — esta unidade não acrescenta nem altera chave de configuração
  servida ao navegador.

## Histórias de usuário

1. Como pessoa que mantém o gráfico, quero que o brilho de fundo derive da definição única de
   geometria, para que o fundo colorido acompanhe a quantidade de quadrantes declarada.
2. Como pessoa que lê o radar publicado, quero o fundo colorido exatamente como está hoje, para
   que a migração do brilho não mude nada do que vejo.
3. Como pessoa que vai acrescentar um quinto quadrante, quero ver o fundo repartido em setores de
   72° sem lacuna nem sobreposição, para confirmar que o brilho responde à configuração antes de o
   restante do desenho ser migrado.
4. Como pessoa que configura um radar de um ou de dois quadrantes, quero o fundo colorido
   preenchendo o círculo inteiro ou as duas metades, para que o diagrama continue legível nos
   extremos do intervalo suportado.

## Critérios de aceite

**História 1 — brilho pela definição única:**

- Dado o repositório, quando `gradientAttributes` é procurada, então não existe em nenhum arquivo
  sob `src/`, e `src/components/Chart/QuadrantRings.tsx` não indexa nenhuma estrutura por
  `position`.
- Dado o repositório, quando `radialGradient` é procurado sob `src/`, então aparece uma única vez,
  em `src/components/Chart/RadarChart.tsx`, com o identificador `glow-gradient`.
- Dado um quadrante e a configuração do radar, quando a forma de brilho é montada para três ou
  mais quadrantes, então é um `<polygon>` de três vértices — o centro do diagrama e as duas pontas
  do setor —, com `fill` igual à cor do quadrante e `mask` apontando para `glow-mask`.
- Dado o grupo de cada quadrante, quando a forma de brilho é inspecionada, então ela está dentro de
  um grupo com `mask` apontando para `radar-mask`.
- Dado o repositório, quando as expressões angulares sob `src/` são procuradas, então a conversão
  de polar para cartesiano aparece apenas em `src/components/Chart/geometry.ts`: nem
  `QuadrantRings.tsx` nem `RadarChart.tsx` escrevem `Math.cos` ou `Math.sin`.
- Dado o cálculo das pontas do setor, quando o raio é lido, então vale `config.chartConfig.size` —
  o dobro do raio do círculo do radar.
- Dado o cálculo das pontas do setor, quando a origem das coordenadas é lida, então nenhuma escala
  do `d3` participa dela: `polarToCartesian` recebe o centro em pixels e devolve pixels de tela.

**História 1 — a conversão de polar para cartesiano:**

- Dado o centro `c` e o raio `r`, quando `polarToCartesian` recebe 0°, então devolve `x` igual a
  `c` e `y` igual a `c - r`, comparados com `toBeCloseTo`.
- Dado o centro `c` e o raio `r`, quando `polarToCartesian` recebe 90°, então devolve `x` igual a
  `c + r` e `y` igual a `c`.
- Dado o centro `c` e o raio `r`, quando `polarToCartesian` recebe 180°, então devolve `x` igual a
  `c` e `y` igual a `c + r`.
- Dado o centro `c` e o raio `r`, quando `polarToCartesian` recebe 270°, então devolve `x` igual a
  `c - r` e `y` igual a `c`.

**História 2 — trava de tela com os quatro quadrantes publicados:**

- Dado o `public/config.json` do repositório, lido pelo teste a partir do arquivo real e não de uma
  cópia, quando as duas pontas do setor de `methods-and-patterns` são calculadas, então a primeira
  tem `x` igual ao centro e `y` menor que o centro, e a segunda tem `x` maior que o centro e `y`
  igual ao centro — o setor superior direito.
- Dado o mesmo arquivo, quando as pontas de `tools` são calculadas, então a primeira fica à direita
  do centro e a segunda abaixo dele — o setor inferior direito.
- Dado o mesmo arquivo, quando as pontas de `platforms-and-operations` são calculadas, então a
  primeira fica abaixo do centro e a segunda à esquerda dele — o setor inferior esquerdo.
- Dado o mesmo arquivo, quando as pontas de `languages-and-frameworks` são calculadas, então a
  primeira fica à esquerda do centro e a segunda acima dele — o setor superior esquerdo.
- Dado o arquivo de teste, quando a suíte roda, então nenhum módulo que importe `d3` entra no grafo
  de importação e nenhuma suíte falha por transformação de ESM.

**História 2 — equivalência visual com o radar publicado:**

- Dado o radar com os quatro quadrantes publicados, quando a página inicial é comparada por captura
  de tela com `techradar.db1.com.br`, então cada setor tem a mesma cor, o mesmo degradê do centro
  para a borda e nenhuma cor fora do círculo.
- Dado o quadrante superior esquerdo, quando as duas capturas são sobrepostas, então a divergência
  aceita é de um pixel: o retângulo publicado desse canto começa em `x` igual a 1 e carrega o
  degradê deslocado na mesma medida.
- Dado o SVG renderizado, quando o fundo colorido é inspecionado, então a opacidade do brilho vem
  exclusivamente do degradê da máscara — branco com opacidade 0,5 no centro e opacidade 0 a 100% —,
  sem nenhum atributo de opacidade na forma do quadrante.

**História 3 — cobertura do setor sem lacuna:**

- Dado `N` em {3, 5, 6}, quando os três vértices do polígono de cada slot de 1 a `N` são
  calculados, então todas as coordenadas são números finitos.
- Dado `N` em {3, 5, 6}, quando a distância do centro do diagrama até a corda que liga as duas
  pontas de cada setor é calculada, então é maior ou igual ao raio do círculo do radar.
- Dado `N` igual a 3, quando essa distância é calculada, então é exatamente o raio do círculo do
  radar, comparada com `toBeCloseTo`: a corda tangencia o círculo e não sobra folga.
- Dado um `public/config.json` local com um quinto quadrante — `position` 5, `order` 5, cor própria
  e entrada no mapa de nomes —, quando a página inicial é aberta, então o fundo colorido aparece em
  cinco setores de 72°, sem lacuna sem cor entre eles e sem sobreposição de cores.
- Dado esse mesmo estado local, quando o restante do diagrama é observado, então os pontos, os
  blocos de rótulo e os textos do quinto quadrante aparecem errados ou ausentes, por continuarem
  indexados por `position` ou resolvidos posicionalmente.
- Dado o commit da unidade, quando o diff é lido, então o quadrante de teste não aparece nele:
  `public/config.json` fica como está versionado.

**História 4 — os extremos do intervalo suportado:**

- Dado `N` igual a 1, quando a forma de brilho é montada, então é um `<circle>` centrado no centro
  do diagrama com raio igual ao raio do círculo do radar.
- Dado `N` igual a 2, quando a forma de brilho do slot 1 é montada, então é um `<rect>` com `x`
  igual ao centro, `y` igual a 0, largura igual ao centro e altura igual ao lado do diagrama — a
  metade direita.
- Dado `N` igual a 2, quando a forma de brilho do slot 2 é montada, então é o mesmo `<rect>` com
  `x` igual a 0 — a metade esquerda.

**Portão de qualidade:**

- Dado o repositório alterado, quando `yarn ts:check` roda, então termina com código 0.
- Dado o repositório alterado, quando `yarn lint` roda, então termina com código 0.
- Dado o repositório alterado, quando `yarn test` roda, então os testes novos passam e nenhuma
  suíte que passava antes falha. `Item.test.tsx` e `date.test.tsx` seguem falhando por
  transformação de ESM de `query-string` e de `moment`, condição que já existe na base e que esta
  unidade não altera.
- Dado o commit da alteração, quando a mensagem é lida, então cita a procedência da técnica.

## Comportamento atual → novo

| Aspecto | Hoje | Depois desta unidade |
| --- | --- | --- |
| Forma do brilho | `<rect>` de `size/2` por `size/2` encaixado em um canto do SVG. | Forma do setor: polígono de três vértices para três ou mais quadrantes, círculo para um, retângulo de meia largura para dois. |
| Origem da forma e do degradê | Tabela `gradientAttributes` de quatro entradas, indexada por `quadrant.position - 1`, que define ao mesmo tempo o canto do retângulo e o centro do degradê. | Forma vinda de `segmentAngles(slotOf(quadrant), segmentCount(config))` convertida por `polarToCartesian`; degradê vindo de uma máscara única do diagrama. |
| Onde o degradê é declarado | Um `radialGradient` por quadrante, com identificador `${quadrant.position}-radial-gradient`. | Um `radialGradient` de identificador `glow-gradient`, em `<defs>` do `<svg>`, consumido pela máscara `glow-mask`. |
| Origem da meia opacidade | Atributo de estilo `opacity: 0.5` no `<rect>`. | Parada inicial da máscara, branco com opacidade 0,5 no centro. |
| Recorte pelo círculo | Consequência do raio do degradê: fora do círculo o alfa já é zero. | Máscara `radar-mask`, um retângulo preto cobrindo tudo mais um círculo branco de raio igual ao centro. |
| Quantidade de quadrantes que o brilho suporta | Quatro. Com cinco, `gradientAttributes[4]` é `undefined` e a leitura de `.x` lança `TypeError`, derrubando o radar inteiro. | Qualquer quantidade declarada na taxonomia, de uma a seis, cada quadrante no setor de 360°/N do seu slot. |
| Conversão de polar para cartesiano | Não existe: o retângulo é posicionado por canto. | Função pura em `geometry.ts`, coberta por teste, em pixels de tela. |

O que permanece intocado: os arcos dos anéis e o bloco do `d3.arc`, o sorteio e as formas dos
pontos, os rótulos de anel, os blocos de rótulo de quadrante, os três dicionários de tradução, o
acervo, as rotas, o identificador de build e o workflow de publicação.

## Dependências entre domínios

- **Taxonomia de Quadrantes e Anéis** — `order` em `quadrantsMap` é o slot de tela que a forma do
  brilho consome, `colour` é a cor que ela recebe e a quantidade de entradas do mapa é a
  repartição do círculo. A exigência de slots contíguos de 1 a N é regra da taxonomia, e nada a
  verifica no carregamento da aplicação: a unidade da validação de configuração é que fecha esse
  ponto.
- **Catálogo de Opiniões Tecnológicas** — cada item continua declarando quadrante por slug; o
  brilho não lê o acervo.
- **Navegação e Descoberta de Tecnologias** — a página de um quadrante e a de um item continuam
  endereçadas pelo slug; o slot de tela não participa de nenhuma URL.
- **Governança de Contribuição do Radar** — o procedimento publicado para acrescentar um quadrante
  é atualizado pela unidade que encerra a iniciativa.

## Riscos e observações

- **Espelhamento vertical (R1, crítico).** `yScale` tem imagem `[size, 0]` e inverte o eixo
  vertical: alimentar a conversão de polar para cartesiano com ele reflete o brilho de cada
  quadrante sobre a linha horizontal, trocando os setores de cima com os de baixo. A conversão
  trabalha em pixels de tela, com o eixo vertical crescendo para baixo, e a trava de tela da
  história 3 é o que pega o erro.
- **Rotação do radar inteiro (R2, crítico).** A sequência de slots percorre o círculo em ordem e a
  numeração exibida dos quadrantes, não. Alimentar a fórmula com `position` troca os quadrantes de
  lugar — regressão visual total no site publicado. É por isso que a trava de tela lê o
  `public/config.json` do repositório, e não uma cópia de fixture.
- **Raio dos vértices (R3, alto).** A corda que liga as duas pontas do setor passa por dentro do
  círculo quando o raio dos vértices é o do próprio círculo, e sobra uma faixa sem cor junto à
  borda em qualquer quantidade de quadrantes. Com o raio igual ao lado do diagrama — o dobro do
  raio do círculo —, a corda fica a `2·centro·cos(180°/N)` do centro, que é o próprio raio do
  círculo em N igual a 3 e cresce a partir daí. Três quadrantes é o caso apertado: a corda
  tangencia o círculo, sem folga.
- **Uma única origem angular (R4).** A fórmula de polar para cartesiano vive só em `geometry.ts`.
  Qualquer outra expressão de ângulo escrita no componente reabre a divergência silenciosa entre
  tabelas que a iniciativa está eliminando.
- **Identificadores globais no SVG.** `radar-mask`, `glow-mask` e `glow-gradient` são
  identificadores de documento, e duas instâncias do `RadarChart` na mesma página colidiriam. O
  gráfico é renderizado uma única vez, dentro do `RadarGrid`, que por sua vez só aparece na página
  inicial, sob o interruptor `homepageContent`.
- **A equivalência visual é verificada à mão.** Não há teste automatizado que compare o SVG com o
  publicado: a comparação por captura de tela com `techradar.db1.com.br` é feita por quem abre o
  pull request, com a divergência de um pixel do canto superior esquerdo aceita de antemão.
- **A conferência com cinco quadrantes é local e descartável.** Outras partes do desenho ainda
  presas a quatro — pontos, blocos de rótulo e textos — aparecem erradas nessa conferência, e isso
  é esperado: cada uma é migrada por uma unidade própria. O quadrante de teste não entra no commit.
- **Procedência.** A técnica vem da branch `v5` de `AOEpeople/aoe_technology_radar` (PR #502), sob
  Apache-2.0 e com a mesma origem deste fork; a função correspondente é `renderGlow`, em
  `src/components/Radar/Chart.tsx` daquela branch. A citação é obrigatória no commit.
- **O portão de qualidade local já nasce parcialmente vermelho.** `Item.test.tsx` e
  `date.test.tsx` falham na base por transformação de ESM, e a suíte não roda no CI — o único
  workflow do repositório compila e publica. A conferência de que nenhuma suíte nova quebrou é
  manual.
- **Impacto na documentação autoritativa.** A skill `visualizacao-do-radar` descreve o fundo do
  setor como um degradê radial por quadrante ocupando um quarto da área, nomeia o brilho entre as
  peças ainda presas a quatro posições e afirma que duas posições iguais desenham dois setores
  sobre a mesma área; a skill `estrategia-de-testes` descreve o conteúdo de `geometry.ts` sem a
  conversão de polar para cartesiano. O impacto e as tarefas de atualização são registrados no
  [`plan.md`](./plan.md) desta unidade.
