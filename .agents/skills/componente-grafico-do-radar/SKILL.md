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

A quantidade de quadrantes é escolha de configuração: com a migração do desenho concluída,
acrescentar um quadrante é alteração de `public/config.json` e das traduções, sem tocar no código
do gráfico.

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
| `order` | Slot do círculo, de 1 a N no sentido horário a partir das 12 horas. |
| `position` | Número exibido no rótulo "QUADRANTE N" e canto do bloco de rótulo. |

- Leia o slot sempre por `slotOf(quadrant)`, que devolve `order`. Sem `order`, as posições 1 a 4
  caem no slot que o desenho de quatro quadrantes sempre lhes deu (4, 1, 3 e 2), e posição acima
  de 4 cai no próprio número — assim uma configuração sem `order` desenha arcos, brilho, pontos e
  rótulos no mesmo lugar. Não leia `order` direto.
- Taxonomia com quantidade diferente de quatro declara `order` em todos os quadrantes: sem ele,
  de um a três quadrantes recebem slot inexistente.
- Os valores de `order` são contíguos de 1 a N, sem repetição.
- Mudar o lugar de um quadrante no círculo é mudar `order`; renumerar o rótulo é mudar
  `position`. Uma mudança não pode exigir a outra.

### Peças do desenho indexadas pela posição

Ao encontrar uma peça do desenho indexada por `quadrant.position`, migre-a para
`segmentAngles(slotOf(quadrant), segmentCount(config))`. As peças nesse estado são:

| Peça | Tabela | Convenção da tabela |
| --- | --- | --- |
| Pontos | `blipQuarterTurns` em `legacyAngles.ts` | quartos de volta anti-horários a partir das 3 horas, com o eixo y da escala invertido |
| Blocos de rótulo | canto por `position` em `RadarGrid` | canto da tela |

Toda peça desta tabela tem quatro entradas: posição fora de 1 a 4 produz `undefined` em tempo de
execução. Não acrescente quadrante enquanto a tabela tiver alguma peça.

Ao migrar uma peça, remova a sua tabela de `legacyAngles.ts` e o caso da trava que a compara,
porque o teste da peça migrada passa a consumir `segmentAngles` diretamente.

### Trava de retrocompatibilidade

Com quatro quadrantes, o desenho é idêntico ao publicado em `techradar.db1.com.br`. O bloco
`public/config.json` de `src/components/Chart/geometry.test.tsx` lê o `public/config.json` do
repositório — nunca uma cópia de fixture —, duas vezes: como publicado e com o `order` removido
de todos os quadrantes, o que prende o fallback de `slotOf` ao desenho publicado. Em cada uma:

- fixa a faixa angular publicada de cada slug (`publishedSectors`) e os radianos publicados que
  alimentam o gerador de arcos (`publishedArcs`), e os lados da tela onde caem as pontas do
  polígono de brilho de cada slug (`publishedGlowTips`);
- compara cada tabela de `legacyAngles.ts` com `segmentAngles(slotOf(quadrant), n)`: o setor dos
  pontos, convertido de `blipQuarterTurns` para graus no sentido horário a partir das 12 horas.

Alterar `blipQuarterTurns`, a `position` ou o `order` de um quadrante de forma que o desenho mude
derruba o teste. Os blocos de rótulo ficam fora da trava: a equivalência deles é conferida por
captura de tela, comparada à mão com o site publicado. Nenhum
teste compara o SVG com o publicado.

### Testes do componente

- Mantenha a lógica testada em módulos sem `d3` (`geometry.ts`, `legacyAngles.ts`). O `d3` v7 é
  ESM e o Jest do `react-scripts` não o transforma: um teste que importa um componente que importa
  `d3` falha ao carregar.
- Cubra cada função nova de `geometry.ts` para mais de uma quantidade de setores (3, 4, 5 e 6).

## Ferramentas e artefatos envolvidos

- `src/components/Chart/geometry.ts` — `DEG_TO_RAD`, `segmentCount`, `slotOf`, `segmentAngles`,
  `segmentRadians`, `polarToCartesian`, `glowShape`.
- `src/components/Chart/legacyAngles.ts` — tabelas das peças ainda indexadas pela posição.
- `src/components/Chart/geometry.test.tsx` — testes da geometria e trava de retrocompatibilidade.
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
- **Por que a geometria é genérica.** As alternativas descartadas — adotar a v5 inteira, trocar de
  radar, delegar o desenho a uma biblioteca de gráfico, fixar cinco quadrantes — e o motivo de
  cada uma estão em [`references/decisoes.md`](references/decisoes.md). Consulte antes de propor
  trocar a abordagem.
