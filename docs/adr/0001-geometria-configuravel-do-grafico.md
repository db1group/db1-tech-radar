# 0001. Geometria configurável do gráfico

- **Status:** Aceita
- **Data:** 2026-10-07
- **Domínio afetado:** Taxonomia de Quadrantes e Anéis, Visualização do Radar

## Contexto

O diagrama do radar é SVG escrito à mão em `src/components/Chart/`, e a repartição do círculo
entre os quadrantes está codificada em dois lugares independentes: a tabela `arcAngel` de quatro
pares em radianos, em `QuadrantRings.tsx`, que alimenta os arcos dos anéis, e o vetor de
deslocamento `[1, 4, 2, 3]`, em `BlipPoints.tsx`, que posiciona os pontos. As duas tabelas são
indexadas por `quadrant.position - 1`, têm quatro entradas cada, usam convenções angulares
diferentes — uma horária a partir do topo, outra anti-horária — e concordam entre si por
coincidência, sem nada que verifique o acordo.

Essa codificação é o que sustenta a restrição global do `AGENTS.md` de que o radar tem quatro
quadrantes: uma taxonomia com três ou com cinco quadrantes lê posição inexistente nas duas
tabelas e produz `undefined` em tempo de execução. A taxonomia, por sua vez, é dado de
configuração em `public/config.json`, e a numeração `position` que ela declara serve
simultaneamente ao número que o leitor vê no rótulo "QUADRANTE N", ao canto do bloco de rótulo e
ao setor do círculo — três papéis em um número só, o que impede reorganizar o desenho sem
renumerar os quadrantes publicados.

A ordem angular das posições de 1 a 4 percorre o círculo embaralhada: a posição 1 ocupa o setor
de 270° a 360°, a 2 o de 0° a 90°, a 3 o de 180° a 270° e a 4 o de 90° a 180°. Qualquer fórmula
sequencial aplicada diretamente sobre `position` troca os quatro quadrantes de lugar no site
publicado.

## Decisão

A quantidade de quadrantes é escolha de configuração, e a repartição do círculo tem uma
definição única em `src/components/Chart/geometry.ts`, genérica para qualquer quantidade de
setores: graus, 0° = 12 horas, sentido horário, com `DEG_TO_RAD` como única conversão para os
radianos que o `d3` consome.

O algoritmo é portado da branch `v5` de `AOEpeople/aoe_technology_radar`, introduzido no PR #502
daquele repositório, sob licença Apache-2.0 — a mesma origem e a mesma licença deste fork.

A taxonomia passa a declarar o lugar de tela de cada quadrante em `order`, separado de
`position`: `order` é o slot do círculo, contado de 1 a N no sentido horário a partir das 12
horas; `position` continua sendo o número exibido no rótulo e o canto do bloco. O desenho
publicado é preservado por uma trava de retrocompatibilidade que lê o `public/config.json` do
repositório — não uma cópia de fixture — e exige que cada quadrante caia na mesma faixa angular
que ocupa hoje.

## Consequências

- `public/config.json` ganha a chave `order` em cada entrada de `quadrantsMap`, e
  `QuadrantConfig` ganha o campo opcional correspondente. É mudança no contrato de dados que a
  aplicação inteira consome.
- Quadrante sem `order` declarado cai no slot da sua `position`, o que mantém válida qualquer
  configuração anterior à chave.
- A migração do desenho é gradual. Arcos, brilho de fundo, pontos e blocos de rótulo passam a
  consumir `segmentAngles` em unidades próprias; enquanto isso não acontece, `arcAngel` e o vetor
  de deslocamento seguem sendo as origens angulares do desenho, e a trava de retrocompatibilidade
  é o que garante que concordam com a definição única.
- Daqui em diante, qualquer outra expressão de ângulo no repositório é defeito: a origem é
  `segmentAngles`.
- Enquanto `order` não governa a repartição do círculo, ele é dado que nenhum módulo lê, e um
  `config.json` servido do cache do navegador produz o mesmo desenho. A unidade que fizer `order`
  governar o desenho precisa trocar `REACT_APP_BUILDHASH`, senão quem já visitou o site continua
  vendo a configuração antiga.
- A equivalência visual com `techradar.db1.com.br` é conferida por captura de tela, comparada à
  mão. Nenhum teste automatizado compara o SVG com o publicado.
- Concluída a migração do desenho, acrescentar um quadrante é alteração de configuração — slug,
  cor, `position`, `order` e o rótulo com a descrição nos três idiomas —, sem toque no código do
  gráfico.

## Alternativas consideradas

- **Adotar integralmente a v5 de `AOEpeople/aoe_technology_radar`.** A v5 traz a geometria
  configurável pronta, mas este fork carrega uma camada própria que não existe lá — o acervo em
  `public/db1-opinion.json` editado à mão por pull request, o conteúdo em português, inglês e
  espanhol, a identidade institucional do DB1 e a publicação no S3 com CloudFront. Adotar a v5
  inteira significa substituir a aplicação e refazer essa camada para obter um cálculo angular
  que a licença Apache-2.0 comum permite portar isoladamente.
- **Trocar pelo Porsche Digital Technology Radar.** É outro radar de código aberto com
  quantidade de quadrantes configurável, e vale a mesma objeção, agravada: além de substituir a
  aplicação e migrar acervo, traduções e identidade, o projeto deixa a linhagem de código que
  compartilha com `AOEpeople/aoe_technology_radar` — justamente a linhagem que torna a
  portabilidade barata e a procedência verificável.
- **Delegar o desenho a uma biblioteca genérica de gráfico.** O diagrama não é um gráfico de
  catálogo: ele sorteia a posição de cada ponto dentro do setor com repulsão entre vizinhos e
  teto de tentativas, escolhe a forma do ponto pela marca de publicação do item, espelha o
  rótulo de cada anel dos dois lados do centro, pinta cada setor com um degradê radial e torna
  cada ponto um link para a página da tecnologia. Nenhuma biblioteca genérica entrega esse
  conjunto, e adotar uma seria introduzir uma dependência estrutural para reimplementar por cima
  dela o mesmo desenho que já existe.
- **Fixar o radar em cinco quadrantes.** Atenderia a necessidade imediata com menos código, mas
  o trabalho de reescrever a origem angular é o mesmo para cinco e para N — a fórmula sequencial,
  o slot de tela separado da posição e a trava de retrocompatibilidade. O que mudaria é só o
  teto, e ele recolocaria no `AGENTS.md` a mesma restrição que esta decisão remove, com o sexto
  quadrante exigindo de novo a mesma reescrita.
