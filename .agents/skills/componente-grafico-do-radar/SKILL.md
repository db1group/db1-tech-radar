---
name: componente-grafico-do-radar
description: >
  Governa o código do gráfico do radar em `src/components/Chart/`: a geometria única dos setores
  em `geometry.ts`, o slot de tela `order` separado da `position`, a trava de retrocompatibilidade
  com o desenho publicado e o porquê das escolhas. Use ao criar, alterar, revisar ou testar arcos,
  brilho de fundo, pontos, blocos de rótulo, ângulos, `segmentAngles` ou `slotOf`, e ao
  acrescentar, remover ou reordenar quadrantes no `config.json`.
metadata:
  type: technical-skill
---

# Componente gráfico do radar

> **Manutenção desta skill**
>
> Atualize este documento sempre que **qualquer regra descrita aqui** mudar: outra convenção
> angular, outra origem do slot de tela, outra cobertura da trava, uma peça do desenho que deixa
> de ler a `position`. Refatoração que preserva a regra — renomear arquivo, extrair função,
> reorganizar imports — não exige tocar aqui. Divergência entre esta skill e o código, sem
> decisão registrada que a resolva, é escalada para o humano.

## Visão geral

O diagrama é SVG escrito à mão em `src/components/Chart/`, com `d3` apenas para escalas e para o
gerador de arcos. A repartição do círculo entre os quadrantes tem **uma definição única**,
`segmentAngles` em `src/components/Chart/geometry.ts`, genérica para qualquer quantidade de
setores. Toda peça do desenho deriva dela os seus ângulos; qualquer outra expressão de ângulo no
repositório é defeito.

A quantidade de quadrantes, de um a seis, é escolha de configuração: acrescentar um quadrante é
alteração de `public/config.json` — slug, cor, `position` e `order` — e do rótulo com a descrição
nos três idiomas, sem tocar no código do gráfico.

## Como aplicar

### Convenção angular

- `segmentAngles(slot, numSegments)` devolve `startAngle`, `endAngle` e `angleIncrement` em
  **graus**, com 0° às 12 horas e sentido **horário**; o `slot` vai de 1 a `numSegments`.
- `segmentCount(config)` é a quantidade de entradas de `quadrantsMap`.
- `DEG_TO_RAD` é a única conversão para os radianos que o `d3` consome. `d3.arc` usa a mesma
  origem e o mesmo sentido, então a conversão é só de unidade; `segmentRadians(slot, n)` entrega
  o setor já convertido, e é dele que os arcos dos anéis tiram o ângulo. O brilho de fundo é o
  polígono de `glowShape(slot, n, size)`, recortado pela máscara do círculo do radar.

### Slot de tela e posição

Cada entrada de `quadrantsMap` declara dois números com papéis distintos:

| Chave | Papel |
| --- | --- |
| `order` | Slot de tela: setor do círculo, de 1 a N no sentido horário a partir das 12 horas, e lugar do bloco de rótulo. |
| `position` | Apenas o número exibido no rótulo "QUADRANTE N". |

- Leia o slot sempre por `slotOf(quadrant)`, que devolve `order`. Sem `order`, as posições 1 a 4
  caem no slot que o desenho de quatro quadrantes sempre lhes deu (4, 1, 3 e 2), e posição acima
  de 4 cai no próprio número — assim uma configuração sem `order` desenha arcos, brilho, pontos e
  rótulos no mesmo lugar. Não leia `order` direto.
- Taxonomia com quantidade diferente de quatro declara `order` em todos os quadrantes: sem ele,
  de um a três quadrantes recebem slot inexistente.
- Os valores de `order` são contíguos de 1 a N, sem repetição.
- Mudar o lugar de um quadrante no círculo é mudar `order`; renumerar o rótulo é mudar
  `position`. Uma mudança não pode exigir a outra.

Nenhuma peça do desenho nem do layout ao redor dele é indexada por `quadrant.position`. Uma peça
nova tira o seu lugar de `slotOf(quadrant)` e de `segmentCount(config)`.

### Bloco de rótulo e teto de seis quadrantes

- O bloco de rótulo (`src/components/RadarGrid/QuadrantLabel.tsx`) recebe a classe
  `quadrant-label--slot-N`, com N vindo de `slotOf`, e a `div.radar-grid` publica a quantidade de
  quadrantes em `data-quadrants`.
- O lugar de cada slot é declarado em `src/components/RadarGrid/radar-grid.scss`, numa tabela
  indexada pela classe do slot e por `data-quadrants`, com um lugar por slot de um a seis
  quadrantes. Essa tabela fixa o **teto de seis**: um sétimo quadrante ganha setor correto, mas o
  seu bloco fica sobreposto ao do slot 6. Elevar o teto é acrescentar lugares à tabela.
- Quatro quadrantes não têm caso próprio na tabela: o layout publicado vem das regras de base, e
  nenhuma regra de espaço incide sobre ele.
- Cinco e seis quadrantes reservam espaço no contêiner — faixa abaixo do círculo para o bloco do
  centro inferior, faixas laterais para os blocos do meio. Com seis, o diagrama fica menor e a
  legenda das formas vai para o centro inferior.
- A tabela de lugares é portada da branch `v5` de `AOEpeople/aoe_technology_radar` (PR #502,
  Apache-2.0).

### Trava de retrocompatibilidade

Com quatro quadrantes, o desenho é idêntico ao publicado em `techradar.db1.com.br`. O bloco
`public/config.json` de `src/components/Chart/geometry.test.tsx` lê o `public/config.json` do
repositório — nunca uma cópia de fixture —, duas vezes: como publicado e com o `order` removido
de todos os quadrantes, o que prende o fallback de `slotOf` ao desenho publicado. Em cada uma,
fixa para cada slug:

- a faixa angular publicada (`publishedSectors`);
- os radianos que alimentam o gerador de arcos (`publishedArcs`);
- o canto da tela onde caem todos os pontos sorteados (`publishedCorners`);
- os lados da tela onde caem as pontas do polígono de brilho (`publishedGlowTips`).

`src/components/RadarGrid/QuadrantLabel.test.tsx` faz o mesmo para os blocos de rótulo: monta o
bloco de cada slug publicado, com e sem `order`, e exige que ele caia no slot de tela publicado e
exiba a `position` declarada. `radar-grid.scss.test.tsx` exige um lugar por slot de 1 a 6 e nenhum caso próprio para
quatro quadrantes.

Alterar a `position` ou o `order` de um quadrante, ou qualquer função de `geometry.ts`, de forma
que o desenho mude derruba o teste. O lugar em pixels que cada classe de slot produz e o SVG final
ficam fora da trava: a equivalência deles é conferida por captura de tela, comparada à mão com o
site publicado.

### Testes do componente

- Mantenha a lógica testada em módulos que o Jest consegue carregar (`geometry.ts`, `blips.ts`).
  O `d3` v7 é ESM e o Jest do `react-scripts` não o transforma, e o `Link` dos pontos traz o
  `query-string`, que tem o mesmo problema: um teste que importa um componente do gráfico falha
  ao carregar. Pelo mesmo motivo, `QuadrantLabel` vive em arquivo próprio, fora do grafo de
  importação do `d3`.
- Cubra cada função nova de `geometry.ts` para mais de uma quantidade de setores (3, 4, 5 e 6).
- Passe o gerador aleatório como parâmetro (`rand`) para fixar o sorteio no teste.

## Ferramentas e artefatos envolvidos

- `src/components/Chart/geometry.ts` — `DEG_TO_RAD`, `segmentCount`, `slotOf`, `segmentAngles`,
  `segmentRadians`, `polarToCartesian`, `glowShape`, `radiusToPixels`, `blipPosition`.
- `src/components/Chart/blips.ts` — `buildBlips`, que resolve o slot de cada item e sorteia a
  posição do ponto.
- `src/components/Chart/geometry.test.tsx` e `blips.test.tsx` — testes da geometria, dos pontos e
  trava de retrocompatibilidade.
- `src/components/RadarGrid/QuadrantLabel.tsx` e `radar-grid.scss` — bloco de rótulo pelo slot e
  tabela de lugares, com os testes `QuadrantLabel.test.tsx` e `radar-grid.scss.test.tsx`.
- `public/config.json` — `quadrantsMap` com `position` e `order`; `QuadrantConfig` em
  `src/model.ts` declara `order` como opcional.

## Restrições e armadilhas conhecidas

- **Cache do `config.json`.** O navegador guarda o `config.json` pela querystring
  `REACT_APP_BUILDHASH`. Uma mudança que faz o `config.json` alterar o desenho — como `order`
  passando a governar uma peça — troca esse valor em `.env`, senão quem já visitou o site continua
  vendo a configuração antiga.
- **Procedência.** O algoritmo de repartição do círculo é portado da branch `v5` de
  `AOEpeople/aoe_technology_radar`, PR #502, sob Apache-2.0 — a mesma origem e licença deste fork.
  Código novo portado de lá cita a origem na mensagem de commit.
- **Por que a geometria é genérica e o bloco segue o slot.** As alternativas descartadas — adotar
  a v5 inteira, trocar de radar, delegar o desenho a uma biblioteca de gráfico, fixar cinco
  quadrantes, calcular o lugar do bloco pelo ângulo, manter o bloco pela posição, encolher o bloco
  — e o motivo de cada uma estão em [`references/decisoes.md`](references/decisoes.md). Consulte
  antes de propor trocar a abordagem.
