# Spec: arcos dos anéis pela geometria dinâmica

## Visão geral

Os arcos dos anéis passam a tirar o seu setor da definição única de geometria, de modo que o
desenho das faixas acompanhe a quantidade de quadrantes declarada na taxonomia, mantendo o radar
publicado idêntico ao que está no ar com os quatro quadrantes atuais.

## Domínios envolvidos

| Domínio | Impacto desta unidade | Documentação autoritativa |
| --- | --- | --- |
| Visualização do Radar | O setor de cada arco vem do slot de tela do quadrante e da quantidade de quadrantes declarados, e não de uma tabela de quatro pares de ângulos. Com quatro quadrantes o desenho é o mesmo. | [`visualizacao-do-radar/SKILL.md`](../../skills/visualizacao-do-radar/SKILL.md) |
| Publicação e Distribuição do Radar | O identificador de build acompanha a publicação, porque a repartição do círculo passa a depender de uma chave da configuração e um `config.json` guardado no navegador rotacionaria o radar. | [`publicacao-e-distribuicao-do-radar/SKILL.md`](../../skills/publicacao-e-distribuicao-do-radar/SKILL.md) |

Os outros cinco domínios ficaram fora da análise, por não terem artefato tocado nem comportamento
alterado: **Taxonomia de Quadrantes e Anéis** (o slot de tela e as suas restrições já estão
declarados; esta unidade apenas o consome — ver a seção de dependências), **Catálogo de Opiniões
Tecnológicas** (nenhum item muda), **Navegação e Descoberta de Tecnologias** (rotas e listagens
continuam resolvendo quadrante por slug), **Governança de Contribuição do Radar** (o procedimento
publicado é alterado pela unidade que encerra a iniciativa) e **Identidade Institucional DB1**
(sem relação com a geometria).

## Escopo

**Dentro:**

- O arco de cada anel desenhado na fatia do círculo que o quadrante ocupa, qualquer que seja a
  quantidade de quadrantes declarada, de uma a seis.
- A verificação automática de que, com os quatro quadrantes publicados, cada arco continua na
  mesma fatia do círculo que ocupa hoje.
- A chegada da configuração alterada ao navegador de quem já visitou o site.
- A documentação de apoio apontando os arquivos que compõem o desenho do radar.

**Fora:**

- Qualquer alteração no que o leitor vê no radar publicado.
- O brilho de fundo de cada setor.
- A posição dos pontos dentro do setor.
- O rótulo de quadrante, o rótulo de anel e a grade ao redor do diagrama.
- O texto de ajuda e os rótulos resolvidos por slug nos três idiomas.
- A mensagem legível para configuração inválida.
- Publicar o radar com uma quantidade de quadrantes diferente de quatro.

## Fronteira de domínio

**Esta spec implementa:**

- Função `arcPath` em `src/components/Chart/QuadrantRings.tsx`, recebendo o slot de tela e a
  quantidade de segmentos no lugar da posição do quadrante.
- Remoção da tabela `arcAngel` de `src/components/Chart/QuadrantRings.tsx`.
- Conversão de graus para radianos exportada por `src/components/Chart/geometry.ts`, como função
  pura sobre `segmentAngles` e `DEG_TO_RAD`, consumida por `arcPath`.
- Trava de equivalência dos arcos em `src/components/Chart/geometry.test.tsx`, lida do
  `public/config.json` do repositório.
- `REACT_APP_BUILDHASH` em `.env`.
- Atualizações de documentação listadas na seção de impacto do [`plan.md`](./plan.md) desta
  unidade.

**Pertence a outras unidades (não vira tarefa aqui):**

- `<defs>` de degradê radial e o `<rect>` de brilho em `src/components/Chart/QuadrantRings.tsx`,
  indexados por `position` — unidade do brilho de fundo.
- `generateCoordinates`, `randomBetween` e o laço de sorteio em
  `src/components/Chart/BlipPoints.tsx` — unidade do posicionamento dos pontos.
- Chave `pageHelp.quadrants` nos três dicionários de tradução e
  `src/components/PageHelp/PageHelp.tsx` — unidade do i18n por slug.
- `stylesMap`, `data-quadrants` e `src/components/RadarGrid/radar-grid.scss` — unidade dos blocos
  de rótulo e da grade responsiva.
- Validação da configuração no carregamento, em `src/components/App.tsx` — unidade da validação.
- `RingLabel` em `src/components/Chart/RadarChart.tsx` — o rótulo de anel é espelhado sobre a
  linha horizontal e não depende da repartição do círculo.

## Histórias de usuário

1. Como pessoa que mantém o gráfico, quero que os arcos dos anéis derivem da definição única de
   geometria, para que o desenho das faixas acompanhe a quantidade de quadrantes declarada.
2. Como pessoa que lê o radar publicado, quero o diagrama exatamente como está hoje, para que a
   migração dos arcos não mude nada do que vejo.
3. Como pessoa que vai acrescentar um quinto quadrante, quero ver os arcos repartidos em setores
   de 72°, para confirmar que a geometria responde à configuração antes de o restante do desenho
   ser migrado.
4. Como pessoa que já visitou o radar, quero receber a configuração alterada na primeira visita
   depois da publicação, para não ver o radar rotacionado por causa do que ficou guardado no meu
   navegador.
5. Como pessoa que carrega a documentação de apoio antes de mexer no gráfico, quero que ela
   nomeie os arquivos que existem no desenho, para não procurar um arquivo que não está lá nem
   perder o módulo que guarda a geometria.

## Critérios de aceite

**História 1 — arcos pela definição única:**

- Dado o repositório, quando `arcAngel` é procurada, então não existe em nenhum arquivo sob
  `src/`, e `arcPath` não indexa nenhuma estrutura por `position`.
- Dado um quadrante e a configuração do radar, quando `arcPath` monta o caminho de um anel, então
  os ângulos vêm de `segmentAngles(slotOf(quadrant), segmentCount(config))`, convertidos para
  radianos por `DEG_TO_RAD`, na convenção 0° = 12 horas, sentido horário, sem remapeamento.
- Dado o repositório, quando as expressões angulares sob `src/` são procuradas, então a repartição
  do círculo aparece apenas em `src/components/Chart/geometry.ts`: nem `QuadrantRings.tsx` nem
  `RadarChart.tsx` escrevem `(slot - 1) * 360 / N` ou equivalente.
- Dado o bloco do `d3.arc`, quando comparado ao vigente, então `innerRadius`, `outerRadius` e o
  raio de cada anel continuam calculados a partir de `ringsAttributes` e da escala, sem alteração.

**História 2 — trava de equivalência dos arcos:**

- Dado o `public/config.json` do repositório, lido pelo teste a partir do arquivo real e não de
  uma cópia, quando o par de radianos que alimenta o `d3.arc` é calculado para cada quadrante com
  quatro segmentos, então `languages-and-frameworks` cai em `[3π/2, 2π]`, `methods-and-patterns`
  em `[0, π/2]`, `platforms-and-operations` em `[π, 3π/2]` e `tools` em `[π/2, π]`, comparados com
  `toBeCloseTo`.
- Dado `N` em {3, 5, 6}, quando cada slot de 1 a `N` é convertido para radianos, então os dois
  ângulos são números finitos, o final é maior que o inicial, e os `N` setores somam 2π.
- Dado o arquivo de teste, quando a suíte roda, então nenhum módulo que importe `d3` entra no
  grafo de importação e nenhuma suíte falha por transformação de ESM.

**História 3 — equivalência visual com o radar publicado:**

- Dado o radar com os quatro quadrantes publicados, quando os dezesseis `<path>` dos grupos
  `.quadrant-ring` — quatro quadrantes por quatro anéis — são comparados antes e depois da
  alteração, então cada atributo `d` é igual, aceita divergência apenas na última casa decimal de
  ponto flutuante.
- Dado o radar publicado em `techradar.db1.com.br`, quando a página inicial é comparada por
  captura de tela, então o diagrama é idêntico: mesmas cores nos mesmos setores, mesmos arcos e
  mesmos rótulos de anel.

**História 4 — radar com cinco quadrantes:**

- Dado um `public/config.json` local com um quinto quadrante — `position` 5, `order` 5, cor
  própria e entrada no mapa de nomes — e o `<rect>` de brilho de fundo removido do
  `QuadrantRings.tsx` da cópia local, quando a página inicial é aberta, então os arcos de todos os
  cinco quadrantes são desenhados, sem `TypeError`, cada um em um setor de 72°.
- Dado esse mesmo estado local, quando o restante do diagrama é observado, então os pontos, os
  blocos de rótulo e os textos do quinto quadrante aparecem errados ou ausentes, por continuarem
  indexados por `position` ou resolvidos posicionalmente.
- Dado o commit da unidade, quando o diff é lido, então nem o quadrante de teste nem a remoção do
  `<rect>` aparecem nele: `public/config.json` e o bloco de brilho de `QuadrantRings.tsx` ficam
  como estão versionados.

**História 5 — a configuração alterada chega ao navegador:**

- Dado `.env`, quando `REACT_APP_BUILDHASH` é lido, então o valor difere do que está publicado.
- Dado o site publicado, quando aberto em uma sessão que já tinha visitado o radar antes, então os
  quatro quadrantes aparecem nos mesmos setores do radar publicado hoje.

**História 6 — documentação de apoio:**

- Dado o gatilho "Geometria do gráfico" em
  `.agents/skills/registros-de-decisao-arquitetural/SKILL.md`, quando a lista de arquivos de
  `src/components/Chart/` é lida, então nomeia `RadarChart.tsx`, `BlipPoints.tsx`,
  `QuadrantRings.tsx` e `geometry.ts`.
- Dado o domínio Visualização do Radar em `.agents/maps/functional-map.md`, quando a evidência no
  código é lida, então `RadarChart.tsx` aparece como escalas e composição do SVG, `geometry.ts`
  como a convenção angular única do desenho — graus, 0° = 12 horas, sentido horário — e a linha de
  arcos e formas cita `QuadrantRings.tsx` e `BlipShapes.tsx`.

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
| Origem do setor do arco | Tabela `arcAngel` de quatro pares em radianos, indexada por `quadrant.position - 1`. | `segmentAngles(slotOf(quadrant), segmentCount(config))`, convertida por `DEG_TO_RAD`. |
| Quantidade de quadrantes que os arcos suportam | Quatro. Com cinco, `arcAngel[4]` é `undefined` e o destructuring lança `TypeError`, derrubando o radar inteiro. | Qualquer quantidade declarada na taxonomia, cada quadrante no setor de 360°/N do seu slot. |
| Lugar de tela do setor | Embutido na ordem embaralhada da tabela, indexada pela posição exibida. | O slot declarado em `order`, lido por `slotOf`. |
| Assinatura de `arcPath` | Recebe a posição do quadrante. | Recebe o slot de tela e a quantidade de segmentos. |
| Conversão para radianos | Literais em radianos dentro da tabela. | Função pura em `geometry.ts`, coberta por teste. |
| Identificador de build | O mesmo que está publicado. | Valor novo, que faz o `config.json` com `order` chegar a quem já visitou o site. |

O que permanece intocado: o bloco do `d3.arc` com os raios por anel, o brilho de fundo de cada
setor, o sorteio e as formas dos pontos, os rótulos de anel, os blocos de rótulo de quadrante, os
três dicionários de tradução, o acervo, as rotas e o workflow de publicação.

## Dependências entre domínios

- **Taxonomia de Quadrantes e Anéis** — `order` em `quadrantsMap` é o slot de tela que os arcos
  consomem, e a exigência de slots contíguos de 1 a N é regra da taxonomia. Nada verifica essa
  contiguidade no carregamento da aplicação: a unidade da validação de configuração é que fecha
  esse ponto.
- **Catálogo de Opiniões Tecnológicas** — cada item continua declarando quadrante por slug e o
  gráfico continua resolvendo o atributo do quadrante por esse slug.
- **Navegação e Descoberta de Tecnologias** — a página de um quadrante e a de um item continuam
  endereçadas pelo slug; o slot de tela não participa de nenhuma URL.
- **Governança de Contribuição do Radar** — o procedimento publicado para acrescentar um quadrante
  é atualizado pela unidade que encerra a iniciativa.

## Riscos e observações

- **Rotação do radar inteiro (crítico).** A sequência de slots percorre o círculo em ordem e a
  numeração exibida dos quadrantes, não: alimentar a fórmula com `position` troca os quatro
  quadrantes de lugar, o que é regressão visual total no site publicado. A trava de equivalência
  dos arcos é o que pega esse erro, e é por isso que ela lê o `public/config.json` do repositório
  em vez de uma cópia de fixture.
- **Cache do navegador.** A repartição do círculo passa a depender de uma chave da configuração.
  Publicar sem trocar o identificador de build deixa quem já visitou o site com um `config.json`
  guardado sem `order`: cada quadrante cai no slot da sua posição exibida e o radar aparece
  rotacionado, apesar de o arquivo novo estar no destino. A consequência está registrada em
  [`docs/adr/0001-geometria-configuravel-do-grafico.md`](../../../docs/adr/0001-geometria-configuravel-do-grafico.md).
- **Uma única origem angular.** Arcos e pontos consomem a mesma função. Qualquer outra expressão
  de ângulo escrita no componente reabre a divergência silenciosa entre as duas tabelas que a
  iniciativa está eliminando.
- **O teste não alcança `d3`.** O `d3` 7.8.0 é publicado como ESM e o transform do Jest deste
  projeto não alcança `node_modules`: um arquivo de teste que importe `QuadrantRings.tsx`, e com
  ele o `d3`, falha com `SyntaxError` antes de rodar qualquer caso. Por isso a conversão para
  radianos é função pura em `geometry.ts`, e é ela que a trava de equivalência exercita.
- **A equivalência visual é verificada à mão.** Não há teste automatizado que compare o SVG com o
  publicado: a conferência dos dezesseis `d` e a comparação por captura de tela com
  `techradar.db1.com.br` são feitas por quem abre o pull request.
- **A conferência com cinco quadrantes é local e descartável.** O brilho de fundo do mesmo
  componente lê uma tabela de quatro entradas pela posição do quadrante e derruba a página antes
  de qualquer arco ser desenhado, de modo que a conferência é feita com esse `<rect>` removido da
  cópia local. Nem o quadrante de teste nem essa remoção entram no commit.
- **Procedência.** A geometria vem da branch `v5` de `AOEpeople/aoe_technology_radar` (PR #502),
  sob Apache-2.0 e com a mesma origem deste fork. A citação é obrigatória no commit.
- **O portão de qualidade local já nasce parcialmente vermelho.** `Item.test.tsx` e
  `date.test.tsx` falham na base por transformação de ESM, e a suíte não roda no CI — o único
  workflow do repositório compila e publica. A conferência de que nenhuma suíte nova quebrou é
  manual.
- **Impacto na documentação autoritativa.** A skill `visualizacao-do-radar` descreve o setor de
  cada quadrante decidido pela posição exibida, a skill `estrategia-de-testes` manda cobrir
  `arcPath` por teste unitário e descreve `arcAngel` como a origem angular dos arcos, e a
  documentação de apoio da história 6 nomeia um arquivo do gráfico que não existe. O impacto e as
  tarefas de atualização são registrados no [`plan.md`](./plan.md) desta unidade.
