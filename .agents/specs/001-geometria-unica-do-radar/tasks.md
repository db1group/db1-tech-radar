# Tarefas: geometria única do radar e trava de retrocompatibilidade

Checklist da unidade descrita em [`spec.md`](./spec.md), com as decisões técnicas em
[`plan.md`](./plan.md) e a cobertura em [`test-cases.md`](./test-cases.md). A unidade atravessa
dois domínios: **Taxonomia de Quadrantes e Anéis**, no contrato de quadrante da configuração
(T1 e T3), e **Visualização do Radar**, na geometria e na limpeza do diagrama (T2, T3 e T4).

- [x] **T1. Documentação autoritativa da taxonomia com o slot de tela**
  - Depende de: nenhuma
  - Alvo: `.agents/skills/taxonomia-de-quadrantes-e-aneis/SKILL.md`.
  - Seções afetadas: *Entidades e dados* (tabela de chaves do documento de configuração), a
    regra 4 sobre a posição do quadrante e *Restrições e validações*.
  - Delta: `quadrantsMap` passa a ser descrito com `colour`, `txtColour`, `position`,
    `description` — texto presente no dado e nunca exibido, porque toda descrição que o leitor
    vê vem dos dicionários de tradução — e `order`, o slot de tela contado de 1 a N no sentido
    horário a partir das 12 horas; a regra 4 distingue os dois números do quadrante, e as
    restrições ganham a exigência de `order` contíguos de 1 a N, sem repetição.
  - Origem: histórias 2 e 3 da `spec.md`, e os critérios de aceite de `order` no tipo e na
    configuração.

- [x] **T2. Registro da decisão de arquitetura e os ponteiros para ele**
  - Depende de: nenhuma
  - `docs/adr/0001-geometria-configuravel-do-grafico.md`, inaugurando o diretório, em português
    do Brasil, com status `Aceita`, a data do registro, o campo **Domínio afetado** nomeando
    "Taxonomia de Quadrantes e Anéis" e "Visualização do Radar", e as seções Contexto, Decisão,
    Consequências e Alternativas consideradas, nessa ordem. A Decisão registra a portabilidade
    do algoritmo da branch `v5` de `AOEpeople/aoe_technology_radar` (PR #502, Apache-2.0, mesma
    origem deste fork); as Alternativas cobrem a adoção integral da v5, o Porsche Digital
    Technology Radar, as bibliotecas genéricas de gráfico e a fixação em cinco quadrantes, cada
    uma com o motivo concreto do descarte.
  - Alvos de documentação: `.agents/skills/visualizacao-do-radar/references/technical-dependencies.md`,
    no item de registro em ADR das decisões de arquitetura do desenho, e `AGENTS.md`, na
    restrição global sobre a quantidade de quadrantes.
  - Delta: os dois passam a citar o caminho do ADR 0001 como o registro vigente da reescrita da
    geometria.
  - Origem: história 5 da `spec.md`.
  - Casos de teste: TC-18, TC-19, TC-20.

- [x] **T3. Definição única da geometria com o slot declarado na configuração**
  - Depende de: nenhuma
  - `src/components/Chart/geometry.ts` como fonte única da convenção angular — graus, 0° = 12
    horas, sentido horário —, exportando `DEG_TO_RAD`, `segmentCount`, `slotOf` e
    `segmentAngles`, sem importar React nem `d3`.
  - `order?: number` em `QuadrantConfig` e a chave `order` nas quatro entradas de
    `quadrantsMap` em `public/config.json`, com os valores dos critérios de aceite da `spec.md`
    e sem tocar em `position`, cor, cor de texto ou `description`.
  - `src/components/Chart/geometry.test.tsx` cobrindo contiguidade, ausência de sobreposição e
    soma de 360° para N em {3, 4, 5, 6}; o primeiro setor e o incremento por quantidade de
    segmentos; a precedência de `order` sobre `position` em `slotOf`; a contagem de segmentos;
    a conversão de `DEG_TO_RAD`; e a trava de retrocompatibilidade sobre o `public/config.json`
    do repositório, incluindo a contiguidade dos `order`.
  - A mensagem do commit que entrega o módulo cita a procedência do algoritmo.
  - Casos de teste: TC-1 a TC-13, TC-21, TC-22, TC-23, TC-24.

- [x] **T4. Limpeza do diagrama**
  - Depende de: nenhuma
  - Remoção de `src/components/Chart/Axes.tsx` e dos dois grupos que o usam em
    `src/components/Chart/RadarChart.tsx`, junto com o import.
  - Remoção, no mesmo componente, do `.map` sobre `config.quadrantsMap` que escreve no console
    e devolve `null`.
  - Sem teste de componente: a alteração remove código que não renderiza nada e um log de
    depuração, caso que a convenção de testes do projeto dispensa. A conferência é o SVG sem os
    grupos de eixo e o console limpo ao abrir a página inicial.
  - Casos de teste: TC-14, TC-15, TC-16, TC-17.

- [ ] **T5. Referências de arquivo do gráfico na documentação de apoio**
  - Depende de: nenhuma
  - Alvo: `.agents/skills/registros-de-decisao-arquitetural/SKILL.md`, no gatilho "Geometria do
    gráfico".
  - Delta: a lista de arquivos de `src/components/Chart/` que compõem o desenho passa a ser
    `RadarChart.tsx`, `BlipPoints.tsx`, `QuadrantRings.tsx` e `geometry.ts`.
  - Alvo: `.agents/maps/functional-map.md`, na evidência no código do domínio Visualização do
    Radar.
  - Delta: `RadarChart.tsx` é descrito como escalas e composição do SVG, `geometry.ts` entra como
    a convenção angular única do desenho — graus, 0° = 12 horas, sentido horário — e a linha de
    arcos e formas passa a citar `QuadrantRings.tsx` e `BlipShapes.tsx`.
  - Origem: histórias 1 e 4 da `spec.md` — a criação de `src/components/Chart/geometry.ts` como
    fonte única da geometria e a remoção de `src/components/Chart/Axes.tsx`.
