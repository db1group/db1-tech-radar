# Spec: rótulos de quadrante e grade responsiva independentes de quatro

## Visão geral

O layout em volta do diagrama — o bloco de rótulo de cada quadrante, a legenda das formas e a
grade de listagens da página inicial — passa a acompanhar a quantidade de quadrantes declarada na
taxonomia, de uma a seis, com o bloco posicionado pelo slot de tela do seu quadrante em vez da
posição exibida.

## Domínios envolvidos

| Domínio | Impacto desta unidade | Documentação autoritativa |
| --- | --- | --- |
| Visualização do Radar | O canto do bloco de rótulo deixa de vir da posição exibida e passa a vir do slot de tela, o mesmo número que já escolhe o setor do diagrama, de modo que bloco e setor ficam do mesmo lado por construção. O conjunto de cantos deixa de ser quatro e passa a cobrir de um a seis blocos, com a lateral e o centro inferior entrando como lugares possíveis. A legenda das formas ganha um lugar que não colide com o bloco de lateral. A posição exibida segue respondendo apenas pelo número que o leitor lê no bloco. | [`visualizacao-do-radar/SKILL.md`](../../skills/visualizacao-do-radar/SKILL.md) |
| Taxonomia de Quadrantes e Anéis | Declarar um quadrante deixa de exigir uma posição entre 1 e 4: o canto do bloco passa a ser consequência do slot de tela, e a posição volta a ser só o número exibido. O limite da taxonomia passa a ser seis quadrantes, e ele vem da tabela de lugares do layout, não da geometria do diagrama. | [`taxonomia-de-quadrantes-e-aneis/SKILL.md`](../../skills/taxonomia-de-quadrantes-e-aneis/SKILL.md) |
| Navegação e Descoberta de Tecnologias | A grade compacta de listagens por quadrante da página inicial deixa de ter a largura de bloco fixada em 45% com quebra de linha, que só compõe uma grade inteira com quatro blocos. Qualquer quantidade de quadrantes declarada passa a ser apresentada inteira, mantendo as duas colunas em janela larga e a coluna única abaixo de `$until-lg`. | [`navegacao-e-descoberta-de-tecnologias/SKILL.md`](../../skills/navegacao-e-descoberta-de-tecnologias/SKILL.md) |

A convenção de SCSS por componente ao lado do `.tsx`, com nomes de classe em padrão BEM, é
convenção de `AGENTS.md`; o nível de cobertura exigido vem da skill técnica
[`estrategia-de-testes`](../../skills/estrategia-de-testes/SKILL.md).

Os outros quatro domínios ficaram fora da análise, por não terem artefato tocado nem comportamento
alterado: **Catálogo de Opiniões Tecnológicas** (nenhum campo de item, nenhuma classificação e
nenhum corpo de opinião é lido ou alterado), **Governança de Contribuição do Radar** (a página de
ajuda, o `CONTRIBUTING.md` e o processo editorial não participam do layout da página inicial),
**Publicação e Distribuição do Radar** (a mudança vive em `.tsx` e `.scss`, compilados dentro do
pacote; nenhum arquivo servido de `public/` muda, de modo que o identificador de build não precisa
ser trocado) e **Identidade Institucional DB1** (marca, rodapé e canais oficiais não aparecem na
área do gráfico).

## Escopo

**Dentro:**

- O bloco de rótulo de cada quadrante colocado do lado do setor que aquele quadrante ocupa no
  diagrama, para taxonomias de um a seis quadrantes.
- A página inicial publicada preservada, com quatro quadrantes, nos três idiomas: mesmos cantos,
  mesma cor de linha, mesma legenda e mesma grade de listagens.
- O espaço ao redor do diagrama suficiente para o bloco que cai na lateral ou no centro inferior,
  sem sobreposição com o círculo, com a legenda ou com outro bloco.
- A legenda das formas em um lugar que não colida com o bloco de lateral.
- A grade de listagens por quadrante da página inicial apresentando todos os quadrantes
  declarados, em qualquer quantidade.
- A largura mínima de 800 px que exibe o conjunto da visualização.

**Fora:**

- A mensagem legível para configuração inválida em tempo de execução.
- A conferência final com três, cinco e seis quadrantes, o aceite ponta a ponta e o guia de
  contribuição.
- O rótulo dos anéis espelhado nos dois lados do centro, que com quantidade ímpar de quadrantes
  passa sobre a divisória entre setores.
- O número "QUADRANTE N" exibido no bloco, que continua vindo da posição declarada.
- O nome, a descrição e o atalho de aproximação do bloco, já endereçados pelo slug.
- O diagrama — arcos, brilho de fundo e pontos —, já desenhado pelo slot de tela.
- Renomear o conceito de quadrante.
- Publicar o radar com mais de seis quadrantes.

## Fronteira de domínio

**Esta spec implementa:**

- Componente `QuadrantLabel`, hoje interno a `src/components/RadarGrid/RadarGrid.tsx`: classe de
  posicionamento derivada do slot de tela, com remoção de `stylesMap` e do `style` inline de canto.
- Atributo `data-quadrants` em `div.radar-grid`, em `src/components/RadarGrid/RadarGrid.tsx`,
  alimentado por `segmentCount` de `src/components/Chart/geometry.ts`.
- Regras de posicionamento por slot de 1 a 6, por quantidade de quadrantes, em
  `src/components/RadarGrid/radar-grid.scss`.
- Regra de espaço do contêiner `.radar-grid` por quantidade de quadrantes e regra de posição de
  `.radar-legend`, em `src/components/RadarGrid/radar-grid.scss`.
- Regra de grade de `.quadrant-grid` e `.quadrant-grid__quadrant` em
  `src/components/QuadrantGrid/quadrant-grid.scss`.
- Suíte sobre a escolha da classe do bloco, lendo o `public/config.json` do repositório e não uma
  cópia — arquivo e forma (função pura ou componente próprio) definidos no [`plan.md`](./plan.md).
- Suíte de componente `src/components/QuadrantGrid/QuadrantGrid.test.tsx`, com a fixture
  `src/components/QuadrantGrid/testData.tsx`.
- Suíte de conferência das regras por slot de `radar-grid.scss`.
- Atualizações de documentação listadas na seção de impacto do [`plan.md`](./plan.md) desta
  unidade.

**Pertence a outras unidades (não vira tarefa aqui):**

- `slotOf` e `segmentCount` em `src/components/Chart/geometry.ts` — origem única do slot de tela e
  da quantidade de setores, consumida sem alteração.
- `src/components/Chart/QuadrantRings.tsx`, `BlipPoints.tsx`, `blips.ts` e `RadarChart.tsx` — o
  diagrama já acompanha a quantidade de quadrantes.
- `RingLabel` em `src/components/Chart/RadarChart.tsx` — o rótulo de anel com quantidade ímpar de
  quadrantes é unidade própria.
- Validação da configuração no carregamento, em `src/components/App.tsx` — unidade da validação.
- `CONTRIBUTING.md`, conferência multi-N e aceite ponta a ponta — unidade que encerra a iniciativa.
- Chaves `quadrants.<slug>` e `pageHelp.quadrants.<slug>` nos três dicionários — o texto do bloco
  já é endereçado por slug.
- Campos `position` e `order` de `quadrantsMap` em `public/config.json` — o dado publicado não
  muda nesta unidade.
- `REACT_APP_BUILDHASH` em `.env` — esta unidade não altera arquivo servido de `public/`.
- `src/components/QuadrantSection/QuadrantSection.tsx` e `quadrant-section.scss` — o conteúdo de
  cada bloco da grade não muda.

## Histórias de usuário

1. Como pessoa que mantém a taxonomia, quero o bloco de rótulo colocado pelo slot de tela do seu
   quadrante, para que o bloco continue do lado do seu setor mesmo depois de alguém reordenar o
   desenho sem renumerar os quadrantes.
2. Como pessoa que lê o radar publicado, quero a página inicial com os quatro quadrantes de hoje
   idêntica à publicada, nos três idiomas e nas larguras de tela em que o gráfico aparece, para não
   perceber diferença alguma.
3. Como pessoa que vai publicar o radar com três, cinco ou seis quadrantes, quero cada bloco de
   rótulo do lado do seu setor e com espaço próprio, para que o conjunto continue legível sem
   sobreposição com o círculo, com a legenda ou com outro bloco.
4. Como pessoa que vai publicar o radar com uma quantidade de quadrantes diferente de quatro, quero
   a grade de listagens da página inicial mostrando todos os quadrantes declarados, para que
   nenhuma tecnologia fique inacessível em janela estreita.
5. Como pessoa que revisa um pull request, quero a suíte acusando o bloco posicionado pela posição
   exibida, para que o desalinhamento entre bloco e setor não chegue à publicação.

## Critérios de aceite

**História 1 — o bloco posicionado pelo slot de tela:**

- Dado `src/components/RadarGrid/RadarGrid.tsx`, quando o arquivo é lido, então `stylesMap` não
  existe e nenhum bloco de rótulo recebe `top`, `right`, `bottom` ou `left` por `style` inline.
- Dado `src/components/RadarGrid/RadarGrid.tsx`, quando o bloco de rótulo é montado, então a classe
  que o posiciona é derivada do slot de tela do quadrante, obtido por `slotOf` de
  `src/components/Chart/geometry.ts`, sem nenhuma fórmula angular nova.
- Dado `src/components/RadarGrid/RadarGrid.tsx`, quando `div.radar-grid` é montada, então ela
  carrega `data-quadrants` com o valor de `segmentCount(config)`.
- Dado o `public/config.json` do repositório, quando os quatro blocos são montados, então
  `methods-and-patterns` recebe a classe do slot 1, `tools` a do slot 2,
  `platforms-and-operations` a do slot 3 e `languages-and-frameworks` a do slot 4.
- Dado o `public/config.json` do repositório, quando os quatro blocos são montados, então os textos
  exibidos continuam "QUADRANTE 2", "QUADRANTE 4", "QUADRANTE 3" e "QUADRANTE 1", respectivamente.
- Dado um quadrante cujo `order` é trocado no `public/config.json`, quando o bloco é montado, então
  a classe de posicionamento acompanha o novo `order` e o número exibido continua vindo de
  `position`.

**História 2 — a página inicial publicada permanece:**

- Dada a página inicial com os quatro quadrantes versionados, em `pt`, `en` e `es`, quando ela é
  comparada por captura de tela com `techradar.db1.com.br`, então cada bloco está no mesmo canto:
  `methods-and-patterns` no superior direito, `tools` no inferior direito,
  `platforms-and-operations` no inferior esquerdo e `languages-and-frameworks` no superior
  esquerdo.
- Dada a mesma página, quando a linha divisória de cada bloco é inspecionada, então ela tem a cor
  declarada em `colour` para aquele quadrante — `#4867ff`, `#ffc000`, `#ff2d5e` e `#cdcaeb` —, seja
  ela aplicada por `style` inline ou por propriedade personalizada de CSS.
- Dada a mesma página, quando a legenda das formas é observada, então ela permanece à direita, na
  mesma altura e com a mesma largura de hoje.
- Dada a mesma página em larguras de janela de aproximadamente 800 px, 1000 px e 1200 px, quando
  ela é comparada com a publicada, então o diagrama, os blocos e a legenda ocupam os mesmos
  lugares, sem sobreposição nova em nenhuma das três larguras.
- Dada a grade de listagens por quadrante com os quatro quadrantes versionados, quando a janela tem
  mais de `$until-lg` (61.875em), então os blocos ficam em duas colunas; quando tem até
  `$until-lg`, ficam em uma coluna.
- Dada a grade de listagens em qualquer largura entre 800 px e 1200 px, quando o número de colunas
  é contado, então ele nunca passa de duas.
- Dada uma janela com menos de 800 px de largura, quando a página inicial é aberta, então o
  conjunto diagrama, blocos e legenda continua oculto e apenas as listagens por quadrante aparecem.

**História 3 — de um a seis quadrantes:**

- Dado um `public/config.json` local com três, com cinco e com seis quadrantes — cada um com slug
  próprio, `position`, `order` contíguo de 1 a N, cor própria, tradução nos três dicionários e
  alguns itens no acervo —, quando a página inicial é aberta em cada uma das três configurações,
  então cada bloco de rótulo aparece do lado do setor do seu quadrante, conforme a tabela abaixo.

  | Quantidade | Slot 1 | Slot 2 | Slot 3 | Slot 4 | Slot 5 | Slot 6 |
  | --- | --- | --- | --- | --- | --- | --- |
  | 3 | direita, acima | direita, abaixo | esquerda, acima | — | — | — |
  | 4 | superior direito | inferior direito | inferior esquerdo | superior esquerdo | — | — |
  | 5 | superior direito | inferior direito | inferior ao centro | inferior esquerdo | superior esquerdo | — |
  | 6 | superior direito | direita, ao meio | inferior direito | inferior esquerdo | esquerda, ao meio | superior esquerdo |

- Dadas as mesmas três configurações locais, quando a página inicial é observada, então nenhum
  bloco de rótulo se sobrepõe ao círculo do diagrama, à legenda das formas ou a outro bloco.
- Dada a configuração local com seis quadrantes, quando a legenda das formas é observada, então ela
  está visível por inteiro e não se sobrepõe ao bloco da lateral direita.
- Dado o `public/config.json` versionado, quando as regras de espaço do contêiner são aplicadas,
  então nenhuma delas altera o espaço vigente com quatro quadrantes.
- Dado `src/components/RadarGrid/radar-grid.scss`, quando o arquivo é lido, então existe regra de
  posicionamento para cada slot de 1 a 6.
- Dado o commit desta unidade, quando o diff é lido, então os quadrantes de teste não aparecem
  nele: `public/config.json` e `public/db1-opinion.json` ficam como estão versionados.

**História 4 — a grade de listagens com qualquer quantidade:**

- Dado um `ConfigData` com quatro quadrantes, quando `QuadrantGrid` é renderizado, então há quatro
  blocos, um por quadrante declarado, na ordem de declaração de `quadrants`.
- Dado um `ConfigData` com cinco quadrantes, quando `QuadrantGrid` é renderizado, então há cinco
  blocos, um por quadrante declarado.
- Dado `src/components/QuadrantGrid/quadrant-grid.scss`, quando o arquivo é lido, então nenhuma
  regra fixa a largura do bloco em 45% nem pressupõe quatro blocos.
- Dada a grade com três, cinco ou seis quadrantes em janela larga, quando ela é observada, então
  todos os blocos aparecem, sem bloco cortado e sem coluna vazia entre eles.

**História 5 — a trava contra o posicionamento pela posição exibida:**

- Dado o `public/config.json` do repositório, lido pela suíte a partir do arquivo real e não de uma
  cópia, quando a escolha da classe de cada bloco é exercitada, então ela devolve a classe do slot
  de tela declarado em `order`, e não a da `position`.
- Dada uma configuração de teste em que `order` e `position` divergem em todos os quadrantes,
  quando a suíte roda, então ela falha se a classe escolhida acompanhar `position`.
- Dado o arquivo de teste da escolha da classe, quando a suíte roda, então nenhum módulo que
  importe `d3` entra no grafo de importação.
- Dado `src/components/QuadrantGrid/QuadrantGrid.test.tsx`, quando a suíte roda, então ela passa
  sem que `query-string` seja carregado pelo grafo de importação de `Link`.
- Dada a conferência das regras por slot de `radar-grid.scss`, quando a suíte roda, então ela
  acusa a ausência de regra para qualquer slot de 1 a 6.

**Portão de qualidade:**

- Dado o repositório alterado, quando `yarn ts:check` roda, então termina com código 0.
- Dado o repositório alterado, quando `yarn lint` roda, então termina com código 0 e sem nenhum
  aviso do ESLint, porque o build do GitHub Actions roda com `CI=true` e trata aviso como erro.
- Dado o repositório alterado, quando `yarn build` roda, então o pacote de produção é gerado sem
  erro.
- Dado o repositório alterado, quando `yarn test` roda, então os testes novos passam e nenhuma
  suíte que passava antes falha. `Item.test.tsx` e `date.test.tsx` seguem falhando por
  transformação de ESM de `query-string` e de `moment`, condição que já existe na base e que esta
  unidade não altera.

## Comportamento atual → novo

| Aspecto | Hoje | Depois desta unidade |
| --- | --- | --- |
| Origem do canto do bloco de rótulo | `stylesMap[quadrantConfig.position - 1]`, uma tabela de quatro cantos aplicada por `style` inline. | A classe do slot de tela do quadrante, resolvida por `slotOf`, com o lugar definido em `radar-grid.scss`. |
| Quantidade de quadrantes que o layout comporta | Quatro. A quinta posição lê entrada inexistente na tabela e o bloco perde o posicionamento. | De um a seis, com um lugar declarado para cada slot em cada quantidade. |
| Quantidade de quadrantes publicada no DOM | Nenhuma: o `.radar-grid` não expõe a taxonomia. | `data-quadrants` em `div.radar-grid`, com o valor de `segmentCount(config)`. |
| Lugar do bloco quando o setor cai na lateral ou no centro inferior | Não existe: todo bloco vai para um dos quatro cantos. | Lateral ao meio (seis quadrantes) e centro inferior (cinco quadrantes) entram como lugares próprios. |
| Espaço ao redor do diagrama | Margem lateral menor que a largura do bloco; nos cantos o círculo deixa a folga, na lateral e no centro inferior não haveria folga. | O contêiner reserva espaço por quantidade de quadrantes, sem alterar o espaço vigente com quatro. |
| Lugar da legenda das formas | À direita, na altura do meio, fixa para qualquer taxonomia. | O mesmo lugar com quatro quadrantes, e um lugar livre do bloco de lateral quando há seis. |
| Grade de listagens da página inicial | Bloco com largura fixa de 45%, com quebra de linha e distribuição nas extremidades — uma grade inteira só com quatro blocos. | Regra que apresenta qualquer quantidade de blocos, mantendo duas colunas em janela larga e uma abaixo de `$until-lg`. |
| Consequência de reordenar o desenho | Trocar `order` move o setor no diagrama e deixa o bloco no canto antigo, sem erro visível. | O bloco acompanha o setor, porque os dois leem o mesmo número. |

O que permanece intocado: o número "QUADRANTE N" e a sua origem na `position` declarada, o atalho
de aproximação, o rótulo e a descrição do bloco, a cor da linha divisória, a legenda das formas com
quatro quadrantes, a largura mínima de 800 px que exibe o conjunto, o diagrama inteiro, o rótulo
dos anéis, o conteúdo de cada bloco da grade de listagens, o acervo, a taxonomia publicada, o
identificador de build e o workflow de publicação.

## Dependências entre domínios

- **Visualização do Radar** — `slotOf` e `segmentAngles` em `src/components/Chart/geometry.ts` são
  a origem única do slot de tela e da repartição do círculo; o bloco de rótulo passa a consumir o
  mesmo slot que o arco, o brilho de fundo e o ponto já consomem, sem nenhum cálculo angular
  próprio.
- **Taxonomia de Quadrantes e Anéis** — `public/config.json` declara `order` e `position` por
  quadrante; o layout lê `order` para o lugar do bloco e `position` para o número exibido, e a
  contagem de entradas de `quadrantsMap` é a quantidade publicada no DOM.
- **Navegação e Descoberta de Tecnologias** — a grade de listagens da página inicial monta um bloco
  por quadrante declarado em `quadrants`, e cada bloco é um `QuadrantSection`, cujo conteúdo e
  atalho de aproximação esta unidade não altera.

## Riscos e observações

- **O desalinhamento entre bloco e setor é silencioso.** Escolher o canto pela posição exibida
  continua produzindo o layout correto enquanto `order` e `position` coincidirem em consequência,
  como hoje coincidem, e passa a errar assim que alguém reordenar o desenho. O critério da História
  5 prende a escolha ao slot com teste, porque nenhuma conferência visual com a taxonomia atual
  acusaria a troca.
- **O limite de seis quadrantes vem da tabela de lugares do layout.** A repartição do círculo é
  genérica para qualquer N; o que termina em seis é o conjunto de lugares declarados para os
  blocos. Uma taxonomia com sete quadrantes desenha o diagrama corretamente e deixa o sétimo bloco
  sem lugar declarado. O limite precisa ficar registrado na documentação do domínio.
- **A tabela de lugares é portada da v5 de `AOEpeople/aoe_technology_radar`.** A origem é o PR #502
  daquele repositório, sob Apache-2.0 — a mesma licença deste fork —, onde a tabela é indexada por
  `data-segments` e por classe de slot. A procedência é citada na mensagem de commit, como manda a
  [ADR 0001](../../../docs/adr/0001-geometria-configuravel-do-grafico.md). A tabela portada é
  conferida slot a slot no [`plan.md`](./plan.md) contra os setores que a geometria desenha para
  três, cinco e seis quadrantes, e ajustada onde não cair do lado certo — com três quadrantes o
  setor do slot 2 abrange toda a metade inferior e o seu bloco tem mais de um lugar defensável.
- **O espaço para o bloco de lateral e de centro inferior é parâmetro atribuído ao plano.** A
  página tem 1200 px de largura máxima, o diagrama ocupa 800 px centralizados e o bloco tem 20% da
  largura do contêiner, mais do que a margem lateral livre. A v5 resolve com espaço interno no
  contêiner por contagem; qual solução equivalente adotar aqui, e para onde vai a legenda com seis
  quadrantes, ficam registrados no [`plan.md`](./plan.md), a pedido de quem solicitou a mudança. Em
  nenhuma saída o layout com quatro quadrantes muda.
- **A cor da linha divisória pode migrar para propriedade personalizada de CSS.** Trocar o `style`
  inline por `--quadrant-color` é opcional e preso a um único critério: a cor exibida continua a
  mesma. A escolha fica no [`plan.md`](./plan.md).
- **A conferência dos blocos é visual.** `RadarGrid` traz `RadarChart` — e com ele o `d3` 7.8.0,
  publicado como ESM que o transform do `react-scripts` não alcança em `node_modules` — para o
  grafo de importação, de modo que a página inicial inteira fica fora do alcance da suíte. A
  asserção automática sobre a escolha da classe do bloco só existe se ela viver em uma função pura
  ou em um componente sem `d3`; a forma fica no [`plan.md`](./plan.md), e os critérios da História
  2 são conferidos por captura de tela comparada com `techradar.db1.com.br`.
- **O teste de componente do `QuadrantGrid` depende de isolar o `Link`.**
  `QuadrantGrid → QuadrantSection → Link → use-search-param-state` traz `query-string` 8.1.0, ESM
  que derruba a suíte com `SyntaxError: Cannot use import statement outside a module` antes de
  qualquer caso rodar — é o que já mantém `Item.test.tsx` vermelho. Substituir o módulo `Link` no
  próprio arquivo de teste foi exercitado neste repositório e faz a suíte passar sem tocar na
  configuração do Jest; `Link` é o único módulo do subgrafo do `QuadrantGrid` que carrega
  `query-string`. A forma fica no [`plan.md`](./plan.md).
- **A conferência da `radar-grid.scss` lê o arquivo como texto.** Nenhuma suíte deste projeto
  avalia CSS aplicado: o que é afirmável é a presença da regra de cada slot no arquivo, não o lugar
  que o navegador calcula. A ausência de sobreposição é conferida à mão, nas três configurações de
  teste.
- **As configurações de teste são locais e descartáveis.** Três, cinco e seis quadrantes exigem
  slug, cor, `position`, `order`, tradução nos três dicionários e alguns itens no acervo para que o
  setor tenha o que desenhar. Nada disso entra no commit.
- **A regressão visual tem duas frentes independentes.** O layout vigente pressupõe quatro blocos
  em dois lugares — os blocos de rótulo e a grade de listagens —, e a conferência precisa cobrir os
  três idiomas e as larguras próximas de 800 px, onde o conjunto da visualização aparece e a grade
  ainda está em coluna única.
- **O portão de qualidade local já nasce parcialmente vermelho.** `Item.test.tsx` e `date.test.tsx`
  falham na base por transformação de ESM, e a suíte não roda no CI — o único workflow do
  repositório compila e publica. A conferência de que nenhuma suíte nova quebrou é manual.
- **Impacto na documentação autoritativa.** A skill `visualizacao-do-radar` descreve o canto do
  bloco como escolhido pela posição exibida, com tabela de quatro entradas (regra 12), afirma que o
  bloco de rótulo é a peça presa a quatro posições (regra 16), fala em "quatro cantos" e em "quatro
  blocos" no fluxo de desenho e condiciona acrescentar um quadrante a migrar esse bloco antes; a
  skill `taxonomia-de-quadrantes-e-aneis` traz a mesma tabela de posição para canto (regra 4),
  restringe as posições a 1 a 4 sem repetição, afirma que o número de quadrantes é quatro e inclui
  no fluxo de acrescentar um quadrante o passo de atribuir a posição como canto do radar; a skill
  `navegacao-e-descoberta-de-tecnologias` descreve a grade compacta da página inicial em duas
  colunas (regra 13), descrição que permanece verdadeira. A restrição global de quatro quadrantes
  do `AGENTS.md` e o novo teto de seis entram no mesmo conjunto. A mudança é deliberada e está
  apoiada na descrição desta unidade e na
  [ADR 0001](../../../docs/adr/0001-geometria-configuravel-do-grafico.md), que registra a
  quantidade de quadrantes como escolha de configuração. O impacto e as tarefas de atualização são
  registrados no [`plan.md`](./plan.md) desta unidade.
