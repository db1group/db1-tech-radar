# Tarefas: posicionamento dos pontos pela geometria compartilhada

Checklist da unidade descrita em [`spec.md`](./spec.md), com as decisões técnicas em
[`plan.md`](./plan.md), a evidência que as fecha em [`research.md`](./research.md) e a cobertura em
[`test-cases.md`](./test-cases.md).

A unidade atravessa três domínios. **Visualização do Radar** e **Taxonomia de Quadrantes e Anéis**
têm comportamento documentado alterado e recebem tarefa de documentação própria — T1 e T2. O
**Catálogo de Opiniões Tecnológicas** é atravessado apenas pela remoção de um campo do modelo de
leitura `Blip` em `src/model.ts`: o acervo, os campos do item e as regras de classificação ficam
como estão, a skill do domínio não descreve esse tipo, e por isso ele não recebe tarefa de
documentação — a integridade do acervo no gráfico é conferida pela contagem de pontos entregue em
T5.

Os outros quatro domínios não têm artefato tocado nem comportamento documentado alterado:
**Navegação e Descoberta de Tecnologias**, **Governança de Contribuição do Radar**, **Publicação e
Distribuição do Radar** e **Identidade Institucional DB1**.

- [x] **T1. Documentação autoritativa da Visualização do Radar**
  - Depende de: nenhuma
  - Alvo: `.agents/skills/visualizacao-do-radar/SKILL.md`.
  - Seções afetadas: regras 3, 4, 11 e 16; passo 4 do fluxo *Desenhar o radar*; passo 2 do fluxo
    *Acrescentar um anel ao desenho*; em *Restrições e validações*, a folga de sorteio e a
    degradação por densidade alta.
  - Delta: o ponto cai no setor apontado pelo slot de tela, de 360° dividido pela quantidade de
    quadrantes declarada, e o sorteio passa a ter ângulo dentro do setor com 10° livres junto a
    cada divisória, distância do centro na faixa do anel com 15 px livres junto a cada arco pela
    raiz do valor sorteado, afastamento de 1,5 vez o tamanho do ponto apenas dos pontos já
    colocados no mesmo setor e teto de 150 tentativas com aviso no console ao esgotá-lo; o
    corredor livre entre setores vem da margem angular, não das linhas centrais; arcos, brilho e
    pontos acompanham a quantidade de quadrantes declarada, restando presos a quatro posições os
    blocos de rótulo nos cantos e as listas posicionais de descrição; a folga do sorteio é medida
    em pixels, exigindo raios consecutivos afastados por mais de 30 px.
  - Origem: histórias 1, 2 e 3 da `spec.md`, e os critérios de aceite do ângulo dentro do setor,
    da faixa de sorteio por anel e do teto de tentativas com aviso.
  - Casos de teste: TC-27.

- [x] **T2. Documentação autoritativa da Taxonomia de Quadrantes e Anéis**
  - Depende de: nenhuma
  - Alvo: `.agents/skills/taxonomia-de-quadrantes-e-aneis/SKILL.md`.
  - Seção afetada: *Restrições e validações*, na restrição sobre o número de quadrantes.
  - Delta: o diagrama é desenhado a partir do slot de tela para qualquer quantidade de quadrantes
    declarada, e o que ainda prende o radar a quatro é o bloco de rótulo nos cantos com a sua lista
    posicional de descrições.
  - Alvo: `AGENTS.md`, em *Restrições globais*, na restrição dos quatro quadrantes.
  - Delta: o limite passa a ser atribuído aos blocos de rótulo em `src/components/RadarGrid`, às
    listas posicionais de descrição nos dicionários de tradução e à ausência de validação da
    configuração; a exigência de manter o desenho idêntico ao publicado com quatro quadrantes e o
    ponteiro para a ADR 0001 permanecem.
  - Origem: história 1 da `spec.md` e os critérios de aceite de o setor do ponto vir de
    `slotOf(quadrantConfig)` e de o tipo `Blip` não declarar a posição exibida.
  - Casos de teste: TC-28, TC-31.

- [x] **T3. Convenção de testes, mapa funcional e gatilho de ADR**
  - Depende de: nenhuma
  - Alvo: `.agents/skills/estrategia-de-testes/SKILL.md`.
  - Seções afetadas: *Teste unitário para lógica nova*, no parágrafo que descreve o conteúdo de
    `src/components/Chart/geometry.ts` e no trecho sobre aleatoriedade; *Restrições e armadilhas
    conhecidas*, nos itens sobre a tabela indexada por posição e sobre o alcance da suíte.
  - Delta: `geometry.ts` guarda também o sorteio da posição do ponto, e
    `src/components/Chart/blips.ts` é o módulo puro que monta a lista de pontos; a aleatoriedade é
    injetada como parâmetro de `blipPosition` e de `buildBlips`; a armadilha sobre o vetor de
    deslocamento deixa de existir e a do alcance da suíte registra que `BlipPoints.tsx` continua
    fora dela pelo `query-string` que o `Link` de cada ponto traz.
  - Alvo: `.agents/maps/functional-map.md`, na evidência no código, nas regras inferidas e nas
    dependências técnicas do domínio Visualização do Radar.
  - Delta: o sorteio tem teto de 150 tentativas e afastamento por setor, sem as linhas de eixo;
    arcos, brilho e pontos acompanham a quantidade de quadrantes declarada, restando os blocos de
    rótulo presos a quatro posições; a dependência técnica que cita o andamento da reescrita nomeia
    também a branch `feat/us4-blip-positioner`.
  - Alvo: `.agents/skills/registros-de-decisao-arquitetural/SKILL.md`, no gatilho *Geometria do
    gráfico*.
  - Delta: a lista de arquivos de `src/components/Chart/` inclui `blips.ts`, e a lista de branches
    da reescrita acompanha as unidades já entregues e esta. A decisão desta unidade continua
    coberta pela ADR 0001, sem ADR nova.
  - Origem: histórias 1 e 2 da `spec.md` e o critério de aceite de nenhum módulo que importe `d3`
    entrar no grafo de importação das suítes novas.
  - Casos de teste: TC-29, TC-30, TC-32.

- [x] **T4. Sorteio da posição do ponto no módulo de geometria**
  - Depende de: nenhuma
  - `radiusToPixels` e `blipPosition` em `src/components/Chart/geometry.ts`, funções puras sobre
    números, sem React e sem `d3`: a primeira converte o raio de um anel em pixels de tela pela
    mesma medida que os arcos usam; a segunda recebe o slot de tela, a quantidade de setores, o
    índice do anel, a configuração do radar, os pontos já colocados no mesmo setor e a fonte de
    aleatoriedade como parâmetro opcional, e devolve um ponto em pixels de tela — faixa angular
    vinda de `segmentAngles` com margem descontada de cada ponta, distância do centro sorteada na
    faixa do anel pela raiz do valor sorteado, conversão por `polarToCartesian` e repetição até
    o ponto se afastar de todos os já colocados, com aviso no console e a última posição aceita ao
    esgotar o teto de tentativas. As constantes da folga do anel, da margem angular e do teto de
    tentativas são exportadas pelo módulo, para o teste ler os mesmos valores que o cálculo.
  - `src/components/Chart/geometry.test.tsx` com a cobertura das duas funções novas: o ângulo e a
    distância de cada ponto dentro do setor e da faixa do seu anel para N em {3, 4, 5, 6}, a trava
    de tela lida do `public/config.json` do repositório para os quatro quadrantes publicados, os
    raios e as faixas em pixels de cada anel, a coordenada finita para N de 1 a 6 e o
    comportamento do teto de tentativas com um gerador injetado. O auxiliar de configuração já
    presente no arquivo passa a devolver os anéis e a sua geometria copiados do `public/config.json`
    do repositório.
  - A mensagem do commit que entrega o sorteio cita a procedência do algoritmo.
  - Casos de teste: TC-2, TC-3, TC-6, TC-7, TC-8, TC-10 a TC-15, TC-21, TC-23, TC-36.

- [x] **T5. Pontos do radar montados pelo sorteio compartilhado**
  - Depende de: T4
  - `buildBlips` em `src/components/Chart/blips.ts`, função pura sem React e sem `d3`, que converte
    a lista de itens e a configuração do radar na lista de pontos com coordenada resolvida: descarta
    o item sem anel, sem quadrante ou com quadrante ausente da taxonomia, resolve cor, cor de texto
    e índice do anel, delega a posição ao sorteio entregue em T4 e acumula os pontos já colocados
    por setor, de modo que a comparação de distância só aconteça entre pontos do mesmo setor.
  - `src/components/Chart/BlipPoints.tsx` reduzido à chamada dessa função e à emissão do JSX, sem o
    sorteio próprio, sem a tabela indexada pela posição exibida, sem a guarda contra as linhas
    centrais, sem o laço de reposicionamento e sem as escalas do `d3`;
    `src/components/Chart/RadarChart.tsx` deixa de passar as escalas ao componente e continua
    construindo-as para o rótulo de anel e para os arcos.
  - `src/model.ts` com o tipo `Blip` sem o campo da posição exibida do quadrante.
  - `src/components/Chart/blips.test.tsx` cobrindo a contagem de pontos sobre o acervo e a
    configuração lidos dos arquivos reais do repositório, o descarte do item inválido sem erro, a
    cor de cada ponto e a colisão restrita ao mesmo setor com um gerador injetado.
  - Casos de teste: TC-1, TC-2, TC-4, TC-5, TC-6, TC-9, TC-10, TC-16 a TC-20, TC-22, TC-24 a TC-26,
    TC-33 a TC-35, TC-37.
