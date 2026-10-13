# Tarefas: brilho de fundo por máscara compartilhada

Checklist da unidade descrita em [`spec.md`](./spec.md), com as decisões técnicas em
[`plan.md`](./plan.md) e a cobertura em [`test-cases.md`](./test-cases.md). A unidade atravessa um
único domínio, **Visualização do Radar**, na composição do fundo colorido de cada setor e no que
decide a sua fatia. Os outros seis domínios do projeto não têm artefato tocado nem comportamento
documentado alterado, e por isso não recebem tarefa de documentação: **Taxonomia de Quadrantes e
Anéis**, **Catálogo de Opiniões Tecnológicas**, **Navegação e Descoberta de Tecnologias**,
**Governança de Contribuição do Radar**, **Publicação e Distribuição do Radar** e **Identidade
Institucional DB1**.

- [x] **T1. Documentação autoritativa da Visualização do Radar**
  - Depende de: nenhuma
  - Alvo: `.agents/skills/visualizacao-do-radar/SKILL.md`.
  - Seções afetadas: regra 8, regra 16 e, em *Restrições e validações*, a restrição sobre posições
    de quadrante de 1 a 4 sem repetição.
  - Delta: o fundo do setor é uma forma sólida na cor do quadrante, recortada pelo círculo do radar
    e por um degradê único do diagrama que vai de meia opacidade no centro a transparência total na
    borda, ocupando a fatia do slot de tela; os arcos e o brilho de fundo acompanham a quantidade de
    quadrantes declarada, com o deslocamento angular dos pontos e os blocos de rótulo presos a
    quatro posições; duas posições iguais sobrepõem dois blocos de rótulo no mesmo canto, e é o slot
    repetido que desenha dois setores sobre a mesma área.
  - Origem: histórias 1 e 3 da `spec.md` e o critério de aceite da forma de brilho montada a partir
    de `segmentAngles(slotOf(quadrant), segmentCount(config))`.
  - Casos de teste: TC-23.

- [x] **T2. Convenção de testes do gráfico e mapa funcional**
  - Depende de: nenhuma
  - Alvo: `.agents/skills/estrategia-de-testes/SKILL.md`.
  - Seções afetadas: *Teste unitário para lógica nova*, no parágrafo que descreve o conteúdo de
    `src/components/Chart/geometry.ts`, e *Restrições e armadilhas conhecidas*, no item sobre a
    tabela indexada por posição.
  - Delta: `geometry.ts` guarda também a conversão de polar para cartesiano em pixels de tela e a
    forma do brilho de cada setor; a armadilha nomeia o vetor de deslocamento de `BlipPoints.tsx`
    como a tabela indexada por posição que resta, com os arcos e o brilho de fundo tirando o setor
    de `geometry.ts`.
  - Origem: história 1 da `spec.md` e o critério de aceite de a conversão de polar para cartesiano
    viver apenas em `geometry.ts`.
  - Alvo: `.agents/maps/functional-map.md`, nas regras inferidas e nas dependências técnicas do
    domínio Visualização do Radar.
  - Delta: a repartição do círculo acompanha a quantidade de quadrantes declarada, e o que continua
    preso a quatro posições é o sorteio dos pontos — com a sua ordem anti-horária e a tradução
    embutida entre posição de negócio e posição geométrica — junto com os blocos de rótulo; a
    dependência técnica que cita o andamento da reescrita nomeia a branch `feat/us3-glow-mask`.
  - Origem: histórias 1 e 3 da `spec.md`.
  - Casos de teste: TC-24, TC-25.

- [x] **T3. Brilho de fundo por máscara compartilhada**
  - Depende de: nenhuma
  - `polarToCartesian` e `glowShape` em `src/components/Chart/geometry.ts`, funções puras sobre
    números: a primeira converte ângulo em graus e raio em coordenada de tela na convenção já
    estabelecida, e a segunda devolve a forma da fatia — círculo para um quadrante, retângulo de
    meia largura para dois e polígono do centro às duas pontas do setor para três ou mais, com os
    vértices no raio igual ao lado do diagrama.
  - `<defs>` no `<svg>` de `src/components/Chart/RadarChart.tsx` com as duas máscaras e o degradê
    que as alimenta, declarados uma vez para o diagrama inteiro.
  - `src/components/Chart/QuadrantRings.tsx` sem a tabela `gradientAttributes`, sem o `gradientId`,
    sem o `radialGradient` por quadrante e sem o `<rect>` de canto: o componente monta a forma a
    partir do slot de tela e da quantidade de quadrantes, pinta-a na cor cheia do quadrante sob a
    máscara de degradê e a coloca dentro do grupo recortado pelo círculo, antes dos arcos.
    `arcPath` e o bloco do `d3.arc` ficam como estão.
  - `src/components/Chart/geometry.test.tsx` com a cobertura das duas funções novas: a direção de
    cada quarto de volta, a trava de tela lida do `public/config.json` do repositório, a corda
    cobrindo o arco inteiro para N em {3, 5, 6} e as formas dos extremos de uma e de duas fatias.
  - A mensagem do commit que entrega o brilho cita a procedência da técnica.
  - Casos de teste: TC-1 a TC-22, TC-26 a TC-29.
