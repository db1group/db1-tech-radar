# Tarefas: arcos dos anéis pela geometria dinâmica

Checklist da unidade descrita em [`spec.md`](./spec.md), com as decisões técnicas em
[`plan.md`](./plan.md) e a cobertura em [`test-cases.md`](./test-cases.md). A unidade atravessa
dois domínios: **Visualização do Radar**, na origem angular dos arcos (T1, T2, T3 e T4), e
**Publicação e Distribuição do Radar**, na chegada da configuração ao navegador (T5).

- [x] **T1. Documentação autoritativa da Visualização do Radar**
  - Depende de: nenhuma
  - Alvo: `.agents/skills/visualizacao-do-radar/SKILL.md`.
  - Seções afetadas: *Entidades e dados*, em "Setor de cada quadrante", e a regra 16.
  - Delta: o setor de cada quadrante é a fatia apontada pelo seu slot de tela, com a tabela
    relacionando slot e faixa angular e a nota de que a numeração exibida percorre o círculo em
    outra ordem; a regra 16 registra que os arcos dos anéis acompanham a quantidade de quadrantes
    declarada, enquanto o brilho de fundo, os pontos e os blocos de rótulo seguem presos a quatro
    posições.
  - Origem: história 1 da `spec.md` e o critério de aceite dos ângulos vindos de
    `segmentAngles(slotOf(quadrant), segmentCount(config))`.

- [x] **T2. Convenção de testes do gráfico**
  - Depende de: nenhuma
  - Alvo: `.agents/skills/estrategia-de-testes/SKILL.md`.
  - Seções afetadas: *Teste unitário para lógica nova*, no parágrafo das funções de geometria, e
    *Restrições e armadilhas conhecidas*, nos itens do SVG escrito à mão e dos quatro quadrantes.
  - Delta: módulo que importa o `d3` não é alcançável pela suíte, porque o `d3` 7.8.0 é ESM e o
    transform do `react-scripts` não entra em `node_modules`; a lógica angular do desenho é
    coberta por `src/components/Chart/geometry.ts`, e a armadilha dos quadrantes fixos nomeia o
    vetor de deslocamento de `BlipPoints.tsx` como a tabela indexada por posição que resta.
  - Origem: história 2 da `spec.md` e o critério de aceite de a suíte não alcançar o `d3`.

- [x] **T3. Referências de arquivo do desenho na documentação de apoio**
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
  - Origem: história 6 da `spec.md`.
  - Casos de teste: TC-17, TC-18.

- [x] **T4. Arcos dos anéis pela geometria compartilhada**
  - Depende de: nenhuma
  - `segmentRadians(slot, numSegments)` em `src/components/Chart/geometry.ts`, função pura que
    aplica `DEG_TO_RAD` sobre `segmentAngles` e devolve o par de ângulos no formato que o gerador
    de arcos recebe.
  - `src/components/Chart/QuadrantRings.tsx` sem a tabela `arcAngel`: o componente calcula
    `slotOf(quadrant)` e `segmentCount(config)` a partir das propriedades que já recebe, e
    `arcPath` — recebendo o slot e a quantidade de segmentos — tira os dois ângulos de
    `segmentRadians`, preservando o bloco do `d3.arc` com os raios por anel. `RadarChart.tsx`
    fica intocado.
  - `src/components/Chart/geometry.test.tsx` com a trava de equivalência dos arcos, lida do
    `public/config.json` do repositório, e a cobertura de invariantes para N em {3, 5, 6}.
  - A mensagem do commit que entrega os arcos cita a procedência da geometria.
  - Casos de teste: TC-1 a TC-13, TC-19, TC-20, TC-21, TC-22.

- [x] **T5. Identificador de build da publicação**
  - Depende de: T4
  - `REACT_APP_BUILDHASH` em `.env` com o valor `1.2`, para que o `config.json` com `order` chegue
    ao navegador de quem já visitou o site — sem a troca, a configuração guardada em cache coloca
    cada quadrante no setor da sua posição exibida.
  - Casos de teste: TC-14, TC-15, TC-16.
