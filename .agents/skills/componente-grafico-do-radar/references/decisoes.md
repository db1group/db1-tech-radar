# Decisões do componente gráfico do radar

> **Manutenção deste arquivo**
>
> Atualize-o quando uma decisão de arquitetura do gráfico for tomada ou revista: entra a decisão
> com o porquê e as alternativas descartadas. Refatoração que preserva a decisão não pede
> alteração aqui. Divergência entre o que este arquivo diz e o que o código faz, sem decisão que a
> resolva, é escalada para o humano.

## Geometria configurável, portada da v5 da AOE

A repartição do círculo é genérica para qualquer quantidade de setores e portada isoladamente da
branch `v5` de `AOEpeople/aoe_technology_radar` (PR #502, Apache-2.0). Alternativas descartadas:

- **Adotar integralmente a v5 de `AOEpeople/aoe_technology_radar`.** A v5 traz a geometria
  configurável pronta, mas este fork carrega uma camada própria que não existe lá — o acervo em
  `public/db1-opinion.json` editado à mão por pull request, o conteúdo em português, inglês e
  espanhol, a identidade institucional do DB1 e a publicação no S3 com CloudFront. Adotar a v5
  inteira significa substituir a aplicação e refazer essa camada para obter um cálculo angular
  que a licença comum permite portar isoladamente.
- **Trocar pelo Porsche Digital Technology Radar.** Vale a mesma objeção, agravada: além de
  substituir a aplicação e migrar acervo, traduções e identidade, o projeto deixa a linhagem de
  código que compartilha com `AOEpeople/aoe_technology_radar` — justamente a linhagem que torna a
  portabilidade barata e a procedência verificável.
- **Delegar o desenho a uma biblioteca genérica de gráfico.** O diagrama sorteia a posição de cada
  ponto dentro do setor com repulsão entre vizinhos e teto de tentativas, escolhe a forma do ponto
  pela marca de publicação do item, espelha o rótulo de cada anel dos dois lados do centro, pinta
  cada setor com um degradê e torna cada ponto um link para a página da tecnologia. Nenhuma
  biblioteca genérica entrega esse conjunto, e adotar uma seria introduzir uma dependência
  estrutural para reimplementar por cima dela o mesmo desenho.
- **Fixar o radar em cinco quadrantes.** O trabalho de reescrever a origem angular é o mesmo para
  cinco e para N — a fórmula sequencial, o slot de tela separado da posição e a trava de
  retrocompatibilidade. Fixar um teto recolocaria a mesma restrição, com o quadrante seguinte
  exigindo de novo a mesma reescrita.

## Slot de tela separado da posição

A `position` de cada quadrante serve ao número exibido no rótulo e ao canto do bloco, e a ordem
angular das posições 1 a 4 percorre o círculo embaralhada: a posição 1 ocupa o setor de 270° a
360°, a 2 o de 0° a 90°, a 3 o de 180° a 270° e a 4 o de 90° a 180°. Uma fórmula sequencial
aplicada direto sobre `position` trocaria os quatro quadrantes de lugar no site publicado. Por
isso o lugar no círculo vem de uma chave própria, `order`, e a `position` publicada não muda.
