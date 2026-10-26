# Spec: geometria única do radar e trava de retrocompatibilidade

## Visão geral

Estabelece a fonte única da convenção angular do gráfico, declara na taxonomia o lugar de tela
de cada quadrante separado do número exibido no rótulo, e prova por teste que a repartição atual
do círculo entre os quatro quadrantes publicados permanece a mesma.

## Domínios envolvidos

| Domínio | Impacto desta unidade | Documentação autoritativa |
| --- | --- | --- |
| Taxonomia de Quadrantes e Anéis | O atributo de quadrante ganha o slot de tela (`order`), declarado ao lado de `position`, que segue sendo o número exibido no rótulo "QUADRANTE N". | [`taxonomia-de-quadrantes-e-aneis/SKILL.md`](../../skills/taxonomia-de-quadrantes-e-aneis/SKILL.md) |
| Visualização do Radar | O cálculo que reparte o círculo passa a viver em um módulo próprio, genérico para 1 a 6 setores, e o diagrama perde os elementos que não renderizam nada. O desenho publicado continua idêntico. | [`visualizacao-do-radar/SKILL.md`](../../skills/visualizacao-do-radar/SKILL.md) |

Os outros cinco domínios do projeto ficaram fora da análise, por não terem artefato tocado nem
comportamento alterado por esta unidade: **Catálogo de Opiniões Tecnológicas** (o acervo não
muda de forma nem de conteúdo), **Navegação e Descoberta de Tecnologias** (rotas, busca e
listagens continuam resolvendo quadrante por slug), **Governança de Contribuição do Radar** (o
procedimento publicado de contribuição é alterado pela unidade que encerra a iniciativa),
**Publicação e Distribuição do Radar** (entra apenas como dependência, ver a seção própria) e
**Identidade Institucional DB1** (sem relação com a geometria).

## Escopo

**Dentro:**

- Uma definição única de como o círculo do radar é repartido entre os quadrantes, válida para
  qualquer quantidade de 1 a 6.
- A declaração, na configuração da taxonomia, de qual lugar da tela cada quadrante ocupa,
  independente do número que o leitor vê no rótulo do quadrante.
- A verificação automática de que os quatro quadrantes publicados continuam ocupando exatamente
  as mesmas faixas do círculo.
- A limpeza do diagrama: o que não aparece na tela sai do desenho.
- O registro da decisão de arquitetura que torna a quantidade de quadrantes uma escolha de
  configuração.

**Fora:**

- Qualquer alteração no que o leitor vê no radar publicado.
- Desenhar o radar com uma quantidade de quadrantes diferente de quatro.
- Repartir arcos, brilho de fundo, pontos e blocos de rótulo pela nova definição.
- O texto de ajuda e os rótulos de quadrante resolvidos por slug nos três idiomas.
- A mensagem legível para configuração inválida.
- O procedimento publicado para acrescentar um quadrante.
- Renomear "quadrante" para "segmento" e mover o posicionamento dos pontos para o momento da
  compilação.

## Fronteira de domínio

**Esta spec implementa:**

- Módulo `src/components/Chart/geometry.ts`, sem dependência de React nem de `d3`, exportando
  `DEG_TO_RAD`, `segmentCount(config)`, `slotOf(q)` e `segmentAngles(slot, numSegments)`.
- Campo `order?: number` no tipo `QuadrantConfig` (`src/model.ts`).
- Chave `order` nas quatro entradas de `quadrantsMap` em `public/config.json`.
- Suíte `src/components/Chart/geometry.test.tsx`, incluindo a trava de retrocompatibilidade
  lida do `public/config.json` do repositório.
- Remoção do módulo `src/components/Chart/Axes.tsx` e dos seus dois usos em
  `src/components/Chart/RadarChart.tsx`.
- Remoção do `.map` sobre `config.quadrantsMap` que escreve no console e devolve `null`, em
  `src/components/Chart/RadarChart.tsx`.
- ADR `docs/adr/0001-geometria-configuravel-do-grafico.md`, com status `Aceita`, que inaugura o
  diretório `docs/adr/`.

**Pertence a outras unidades (não vira tarefa aqui):**

- Tabela `arcAngel` e assinatura de `arcPath` em `src/components/Chart/QuadrantRings.tsx` —
  unidade da migração dos arcos.
- `<defs>` de máscara e polígono de brilho em `RadarChart.tsx` e `QuadrantRings.tsx` — unidade
  do brilho de fundo.
- `generateCoordinates`, `randomBetween` e o laço de sorteio em
  `src/components/Chart/BlipPoints.tsx` — unidade do posicionamento dos pontos.
- Chave `pageHelp.quadrants` nos três dicionários de tradução e
  `src/components/PageHelp/PageHelp.tsx` — unidade do i18n por slug.
- `stylesMap`, `data-quadrants` e `src/components/RadarGrid/radar-grid.scss` — unidade dos
  blocos de rótulo e da grade responsiva.
- Validação da configuração no carregamento, em `src/components/App.tsx` — unidade da validação.
- `CONTRIBUTING.md` — unidade que documenta o procedimento de acrescentar um quadrante.

## Histórias de usuário

1. Como pessoa que mantém o gráfico, quero uma única definição da convenção angular, para que
   arcos e pontos derivem do mesmo cálculo e não possam divergir entre si.
2. Como pessoa que mantém a taxonomia, quero declarar o lugar de tela de cada quadrante separado
   do número exibido no rótulo, para reorganizar o radar sem renumerar os quadrantes.
3. Como pessoa que lê o radar publicado, quero o diagrama exatamente como está hoje, para que a
   preparação da evolução não mude nada do que vejo.
4. Como pessoa que abre o código do gráfico, quero que o componente contenha apenas o que
   aparece na tela, para que o desenho seja legível sem decifrar o que é inerte.
5. Como pessoa que for rever a geometria no futuro, quero a decisão e as alternativas descartadas
   registradas em endereço fixo, para não refazer a análise do zero.

## Critérios de aceite

**História 1 — definição única da convenção angular:**

- Dado `N` em {3, 4, 5, 6}, quando `segmentAngles(slot, N)` é avaliada para cada `slot` de 1 a
  `N`, então o `endAngle` de cada setor é igual ao `startAngle` do setor seguinte, nenhum par de
  setores se sobrepõe, o primeiro começa em 0 e o último termina em 360.
- Dado `N` em {3, 4, 5, 6}, quando os `angleIncrement` dos `N` setores são somados, então o
  resultado é exatamente 360.
- Dado qualquer `N`, quando `segmentAngles(1, N)` é avaliada, então devolve
  `startAngle` 0, `endAngle` 360/`N` e `angleIncrement` 360/`N`.
- Dado um quadrante com `order` declarado, quando `slotOf` é avaliada, então devolve o `order`;
  dado um quadrante sem `order`, então devolve o `position`.
- Dado um `ConfigData` com `M` chaves em `quadrantsMap`, quando `segmentCount` é avaliada, então
  devolve `M`.
- Dado o módulo `geometry.ts`, quando ele é importado por um teste, então nenhum módulo de React
  ou de `d3` entra no grafo de importação e a suíte roda sem erro de transformação de ESM.
- Dado `DEG_TO_RAD`, quando multiplicado por um valor em graus, então produz o mesmo valor em
  radianos que `d3.arc` consome, na convenção 0° = 12 horas, sentido horário.

**História 2 — slot de tela separado do número exibido:**

- Dado o tipo `QuadrantConfig`, quando um quadrante declara `order` numérico e outro o omite,
  então a checagem de tipos passa nos dois casos.
- Dado `public/config.json`, quando as entradas de `quadrantsMap` são lidas, então
  `methods-and-patterns` tem `position` 2 e `order` 1, `tools` tem `position` 4 e `order` 2,
  `platforms-and-operations` tem `position` 3 e `order` 3 e `languages-and-frameworks` tem
  `position` 1 e `order` 4.
- Dado `public/config.json`, quando os valores de `order` são reunidos, então formam a sequência
  de 1 a `N` contígua, sem repetição, com `N` igual ao número de entradas de `quadrantsMap`.
- Dado `public/config.json`, quando comparado ao publicado, então nenhum `position`, cor, cor de
  texto ou descrição foi alterado.

**História 3 — trava de retrocompatibilidade:**

- Dado o `public/config.json` do repositório, lido pelo teste a partir do arquivo real e não de
  uma cópia, quando `segmentAngles(slotOf(q), segmentCount(config))` é avaliada para cada
  quadrante, então `methods-and-patterns` cai em 0°–90°, `tools` em 90°–180°,
  `platforms-and-operations` em 180°–270° e `languages-and-frameworks` em 270°–360°.
- Dado o radar publicado em `techradar.db1.com.br`, quando a página inicial é comparada por
  captura de tela antes e depois da alteração, então o diagrama é idêntico: mesmas cores nos
  mesmos setores, mesmos arcos, mesmos rótulos de anel e mesma numeração "QUADRANTE N" em cada
  canto.

**História 4 — limpeza do desenho:**

- Dado o repositório, quando `src/components/Chart/Axes.tsx` é procurado, então o arquivo não
  existe e nenhum módulo sob `src/` referencia `XAxis` ou `YAxis`.
- Dado o `RadarChart` renderizado, quando o SVG é inspecionado, então não contém `g.x-axis`,
  `g.y-axis` nem grupo vazio no lugar deles.
- Dado o `RadarChart` renderizado, quando o console é observado, então nada é escrito por ele.

**História 5 — registro da decisão:**

- Dado `docs/adr/0001-geometria-configuravel-do-grafico.md`, quando aberto, então está escrito em
  português do Brasil, com `Status: Aceita`, a data do registro, o campo **Domínio afetado**
  nomeando "Taxonomia de Quadrantes e Anéis" e "Visualização do Radar", e as seções Contexto,
  Decisão, Consequências e Alternativas consideradas nessa ordem.
- Dado o ADR, quando a seção Alternativas consideradas é lida, então cita a adoção integral da
  v5 do projeto de origem, o Porsche Digital Technology Radar, as bibliotecas genéricas de
  gráfico e a fixação em cinco quadrantes, cada uma com o motivo concreto do descarte.
- Dado o ADR, quando a seção Decisão é lida, então registra a portabilidade do algoritmo da
  branch `v5` de `AOEpeople/aoe_technology_radar` (PR #502, Apache-2.0, mesma origem deste
  fork).

**Portão de qualidade:**

- Dado o repositório alterado, quando `yarn ts:check` roda, então termina com código 0.
- Dado o repositório alterado, quando `yarn lint` roda, então termina com código 0, com
  `geometry.test.tsx` alcançado pelo glob `src/**/*.tsx`.
- Dado o repositório alterado, quando `yarn test` roda, então a suíte `geometry.test.tsx` passa
  inteira e nenhuma suíte que passava antes falha. `Item.test.tsx` e `date.test.tsx` seguem
  falhando por transformação de ESM de `query-string` e de `moment`, condição que já existe na
  base e que esta unidade não altera.
- Dado o commit da alteração, quando a mensagem é lida, então cita a procedência do algoritmo.

## Comportamento atual → novo

| Aspecto | Hoje | Depois desta unidade |
| --- | --- | --- |
| Origem dos ângulos | Duas convenções: a tabela `arcAngel` de quatro pares em radianos para os arcos e `cos`/`sin` com a tabela de deslocamentos `[1, 4, 2, 3]` para os pontos. | `geometry.ts` é a definição única, em graus, 0° = 12 horas, sentido horário, genérica para qualquer quantidade de setores. As duas tabelas continuam em uso pelo desenho até as unidades que as migram. |
| Lugar de tela do quadrante | Embutido na ordem embaralhada da tabela `arcAngel`, indexada por `position`. | Declarado como `order` em `public/config.json`, legível na configuração. |
| `position` | Decide o setor do círculo, o canto do bloco de rótulo e o número exibido. | Continua decidindo o setor, o canto e o número exibido; o `order` ainda não é consumido pelo desenho. |
| Eixos do diagrama | `Axes.tsx` cria dois eixos `d3` e remove em seguida os únicos elementos que o `d3` desenha, deixando dois grupos vazios no SVG. | Os grupos vazios somem do SVG. A divisão entre quadrantes continua sendo cromática, como no radar publicado. |
| Console do navegador | Um `.map` sobre `config.quadrantsMap` escreve cada quadrante no console a cada renderização. | O `RadarChart` não escreve no console. |
| Decisão de arquitetura | Sem registro: o porquê da geometria configurável vive apenas em documento fora do repositório. | `docs/adr/0001-geometria-configuravel-do-grafico.md`, com o contexto, a decisão, as consequências e as alternativas descartadas. |

O que permanece intocado: o acervo `public/db1-opinion.json`, as escalas e o `viewBox` do SVG, o
desenho dos arcos, o brilho de fundo, o sorteio e as formas dos pontos, os rótulos de anel, os
blocos de rótulo de quadrante, as rotas, a busca, os três dicionários de tradução e o workflow de
publicação.

## Dependências entre domínios

- **Publicação e Distribuição do Radar** — `public/config.json` chega ao navegador com
  `REACT_APP_BUILDHASH` na querystring, e quem já visitou o site mantém a versão em cache até
  esse identificador mudar. Nesta unidade `order` é dado que nenhum código lê, de modo que um
  `config.json` em cache produz exatamente o mesmo desenho; a troca do identificador acompanha a
  unidade que fizer o `order` governar a repartição do círculo.
- **Catálogo de Opiniões Tecnológicas** — cada item continua declarando quadrante por slug, e o
  gráfico continua resolvendo o atributo do quadrante por esse slug. Nenhuma alteração no acervo.
- **Navegação e Descoberta de Tecnologias** — a página de um quadrante e a de um item continuam
  endereçadas pelo slug; `order` não participa de nenhuma URL.
- **Governança de Contribuição do Radar** — o procedimento publicado para acrescentar um
  quadrante passa a mencionar `order` quando a iniciativa se encerrar, na unidade que atualiza o
  `CONTRIBUTING.md`.

## Riscos e observações

- **Rotação do radar inteiro (crítico).** A fórmula da definição única é sequencial e a tabela
  angular em uso está em ordem embaralhada; aplicar a fórmula com `slot = position` troca os
  quatro quadrantes de lugar, o que é regressão visual total no site publicado. É por isso que o
  `order` e a trava de retrocompatibilidade vêm antes de qualquer migração de desenho, e é por
  isso que a trava lê o `public/config.json` do repositório: uma cópia de fixture passaria no
  teste enquanto o arquivo publicado estivesse errado.
- **Duplicação da fórmula angular.** O projeto de origem escreve o cálculo duas vezes, em
  arquivos diferentes, e elas coincidem por acidente. A regra desta unidade em diante é que
  arcos e pontos consumam `segmentAngles`; qualquer outra expressão de ângulo no repositório é
  defeito. Enquanto a migração dos arcos não acontece, `arcAngel` em `QuadrantRings.tsx` e o
  vetor `[1, 4, 2, 3]` em `BlipPoints.tsx` seguem sendo as origens angulares do desenho, e a
  trava de retrocompatibilidade é o que garante que a nova definição concorda com elas.
- **`geometry.ts` entra sem consumidor.** Nenhum componente o importa nesta unidade; o primeiro
  consumidor é a migração dos arcos. A cobertura por teste unitário é o que impede o módulo de
  envelhecer errado nesse intervalo.
- **Procedência.** O algoritmo vem da branch `v5` de `AOEpeople/aoe_technology_radar` (PR #502),
  sob Apache-2.0 e com a mesma origem deste fork. A citação é obrigatória no commit, e o ADR
  guarda o registro permanente.
- **Impacto na documentação autoritativa.** A skill `taxonomia-de-quadrantes-e-aneis` descreve os
  atributos de quadrante sem o `order`, a precondição de registro em ADR da skill
  `visualizacao-do-radar` ainda não tem um documento para apontar, e a restrição de quantidade de
  quadrantes do `AGENTS.md` não cita o porquê. O impacto e as tarefas de atualização são
  registrados no [`plan.md`](./plan.md) desta unidade.
- **O portão de qualidade local já nasce parcialmente vermelho.** `Item.test.tsx` e
  `date.test.tsx` falham na base por transformação de ESM, e a suíte não roda no CI — o único
  workflow do repositório compila e publica. A conferência de que nenhuma suíte nova quebrou é
  manual, feita por quem abre o pull request.
- **A equivalência visual é verificada por captura de tela.** Não há teste automatizado que
  compare o SVG com o publicado; a comparação antes e depois da página inicial, nos quatro
  quadrantes, é parte do critério de aceite e precisa ser feita à mão.
