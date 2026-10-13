---
name: visualizacao-do-radar
description: >
  Esta é a documentação autoritativa do domínio Visualização do Radar: o diagrama circular da
  página inicial — geometria dos setores e das faixas, sorteio da posição de cada ponto, forma do
  ponto por marca de publicação, rótulo de anel, bloco de quadrante nos cantos e legenda das
  formas. Carregue ao mexer em `chartConfig`, `ringsAttributes`, `blipSize`, `scale` ou
  `homepageContent`, no desenho dos arcos e setores, na dica exibida ao passar o mouse sobre o
  ponto, no atalho de aproximação do quadrante ou na largura mínima que exibe o gráfico.
metadata:
  author: clovis-cli
  type: domain-skill
---

# Visualização do Radar

> **Manutenção desta skill**
>
> Atualize este documento sempre que **qualquer regra descrita aqui** mudar. O critério não é
> *qual* regra — é a natureza da mudança: mudou deliberadamente o comportamento ou a decisão
> (outra geometria, outro critério de sorteio, outra forma de ponto, outro conteúdo de legenda,
> outra condição de exibição) → atualize, registrando o novo comportamento como se sempre tivesse
> sido esse. Refatoração técnica que preserva o desenho (renomear componente, extrair função,
> trocar a biblioteca que calcula escalas e arcos) → não mexa: a skill descreve a decisão, não a
> estrutura do código. Quando esta skill disser X e o sistema fizer Y sem decisão registrada que
> resolva o conflito, não "conserte" nem a skill nem o código: escale para o humano.

## Visão geral do domínio

A visualização é o retrato do radar: um diagrama circular onde cada opinião em destaque vira um
ponto, posicionado no cruzamento do seu quadrante com o seu anel. É a peça que dá ao leitor a
leitura de conjunto — quantas tecnologias a engenharia adota, quantas está experimentando, como
elas se distribuem entre os eixos temáticos — antes de ele abrir qualquer opinião.

O domínio entrega três peças que funcionam como uma só:

- **o diagrama** — setores coloridos por quadrante, faixas concêntricas por anel e um ponto por
  tecnologia;
- **os blocos de rótulo de quadrante** — um em cada canto, identificando o quadrante daquele
  setor e oferecendo o atalho para a listagem completa dele;
- **a legenda das formas** — o que cada formato de ponto comunica.

O domínio não cria conteúdo nem vocabulário: consome a taxonomia (quais quadrantes e anéis
existem, com que cor e em que posição) e o acervo de opiniões (quais tecnologias existem, como
estão classificadas e qual a marca de cada uma na edição vigente). Ele é dono da **geometria** —
como esses dados viram desenho — e das regras de posicionamento, forma e legenda.

A posição exata de um ponto dentro do seu setor **não tem significado**: o que o radar comunica é
o setor, isto é, o par quadrante + anel. Nenhuma coordenada é guardada em lugar algum.

## Regras de negócio

A numeração abaixo é própria desta skill e serve apenas para referência interna.

### 1. O gráfico vive na página inicial, sob um interruptor de configuração

Um interruptor da configuração do radar (`homepageContent`) decide o que a página inicial
apresenta, com três valores possíveis:

| Valor | Página inicial |
| --- | --- |
| `chart` | apenas o gráfico |
| `columns` | apenas as listagens por quadrante |
| `both` | o gráfico seguido das listagens por quadrante |

O valor vigente é `both`. O gráfico não aparece em nenhuma outra tela: a página de um quadrante e
a página de um item apresentam o acervo em forma de lista, nunca em forma de diagrama.

### 2. Só entra no gráfico o item em destaque

O diagrama desenha exclusivamente os itens marcados como em destaque no acervo. Item fora de
destaque continua existindo e acessível por outros caminhos, mas não ganha ponto no radar.

### 3. O ponto é posicionado pelo cruzamento do quadrante com o anel

Cada item em destaque vira um ponto dentro do setor de 90° do seu quadrante, na faixa
circular do seu anel. O quadrante define o canto do diagrama; o anel define a distância ao
centro — quanto mais perto do centro, maior a confiança declarada na tecnologia.

### 4. A posição dentro do setor é sorteada a cada renderização

O ponto não tem coordenada guardada: ela é sorteada toda vez que o gráfico é desenhado, e o mesmo
item aparece em lugares diferentes do mesmo setor entre uma visita e outra. O sorteio segue
quatro regras:

1. **ângulo** — um valor aleatório dentro dos 90° do setor do quadrante;
2. **distância do centro** — um valor aleatório dentro da faixa do anel, com uma folga de 0,7
   unidade de coordenada afastando o ponto de cada uma das duas bordas da faixa, para que ele não
   encoste nos arcos;
3. **afastamento das linhas centrais** — o ponto não pode cair a menos de 15 px da linha vertical
   nem da linha horizontal que cruzam o centro do diagrama, para não invadir o setor vizinho;
4. **afastamento dos outros pontos** — o ponto não pode cair a menos de 1,5 vez o tamanho do ponto
   de distância de um ponto **já posicionado**.

O sorteio é repetido enquanto alguma das duas últimas condições for violada, com um teto de cem
tentativas. Esgotado o teto, a última posição sorteada é aceita como está, ainda que em conflito.
O teto é o que impede o desenho de travar quando um setor tem itens demais para a área
disponível.

Os itens são posicionados em sequência e cada um se afasta apenas dos que já foram posicionados;
nenhum ponto já colocado é movido por causa dos seguintes.

### 5. A forma do ponto comunica a marca de publicação

A marca que o item carrega na edição vigente do radar escolhe o formato do ponto:

| Marca | Forma do ponto |
| --- | --- |
| novo na edição vigente | triângulo de cantos arredondados, apontando para cima |
| alterado na edição vigente | quadrado de cantos arredondados, girado 45° (losango) |
| inalterado, ou sem marca declarada | círculo |

A **cor** do ponto é sempre a cor do seu quadrante, qualquer que seja a forma. Forma e cor são,
portanto, eixos independentes de leitura: a forma conta o que mudou, a cor conta o tema.

### 6. Cada ponto é um link para a opinião

O ponto inteiro é clicável e leva à página do item correspondente, no endereço formado pelo par
quadrante + nome do item. Um recorte por tags ativo na URL é preservado na navegação, de modo que
voltar ao radar mantém o filtro que o leitor tinha aplicado.

### 7. Ao passar o mouse, o ponto se identifica

O ponto exibe uma dica com o **rótulo exibido** da tecnologia. A dica é pintada com a cor do
quadrante ao fundo e com a cor de texto declarada para aquele quadrante, de modo que o contraste
acompanhe a paleta do setor. Sem essa dica o diagrama é ilegível: nenhum ponto traz texto fixo ao
seu lado.

### 8. O setor de cada quadrante é pintado por um brilho de fundo mais os arcos dos anéis

Cada quadrante ocupa a fatia do círculo apontada pelo seu slot de tela e recebe duas camadas:

- um **brilho de fundo** — uma forma sólida na cor cheia do quadrante, cobrindo a fatia inteira e
  recortada tanto pelo círculo do radar quanto por um degradê único do diagrama, que vai de meia
  opacidade no centro à transparência total na borda externa. É ele que colore o fundo do setor
  sem competir com os pontos, e toda a sua opacidade vem desse degradê;
- um **arco por anel**, na cor cheia do quadrante, desenhado na faixa daquele anel e limitado ao
  setor do quadrante.

O degradê é um só para o diagrama inteiro: todos os setores compartilham a mesma rampa do centro
para a borda, e nenhuma cor de quadrante aparece fora do círculo do radar.

### 9. Todo anel da taxonomia ganha arco e rótulo, tenha ou não itens

O diagrama desenha a faixa e o rótulo de **todos** os anéis declarados na taxonomia. Um anel sem
nenhum item classificado nele continua visível no gráfico, como moldura: a régua de maturidade é
apresentada inteira ao leitor, independentemente de o acervo ocupar todos os seus níveis. O
interruptor que oculta anel vazio governa apenas as listagens, não o diagrama.

### 10. O rótulo do anel aparece espelhado dos dois lados do centro

O nome de cada anel é escrito duas vezes, sobre a linha horizontal que cruza o centro: uma à
esquerda e uma à direita, ambas no meio da faixa daquele anel — isto é, na metade da distância
entre a borda interna e a borda externa do anel. O texto é o rótulo traduzido do anel no idioma
ativo, apresentado em caixa alta.

### 11. O diagrama não desenha linha de eixo visível

A divisão entre os quatro quadrantes é comunicada pela cor de cada setor e pelo corredor livre de
pontos ao redor das duas linhas centrais, garantido pela regra de afastamento do sorteio. Nenhum
traço, régua ou marca de escala é desenhado sobre o diagrama.

### 12. Cada quadrante tem um bloco de rótulo no seu canto

Os quatro cantos da área do gráfico recebem um bloco de identificação, posicionado pela posição
do quadrante na taxonomia:

| Posição do quadrante | Canto do bloco |
| --- | --- |
| 1 | superior esquerdo |
| 2 | superior direito |
| 3 | inferior esquerdo |
| 4 | inferior direito |

O bloco apresenta, nesta ordem:

1. a palavra "quadrante" traduzida, seguida do número da posição — o leitor vê "quadrante 1",
   "quadrante 2" e assim por diante;
2. um atalho de aproximação, rotulado "Ampliar" (no idioma ativo), que leva à página daquele
   quadrante com a listagem completa dos seus itens;
3. uma linha divisória pintada com a cor do quadrante;
4. o rótulo traduzido do quadrante;
5. a descrição longa do quadrante, no idioma ativo, lida da lista de descrições **pela posição do
   quadrante** — a primeira descrição da lista descreve o quadrante de posição 1, e assim por
   diante.

### 13. A legenda explica as três formas de ponto

Ao lado do diagrama, uma legenda lista as três formas com o seu significado, traduzido para o
idioma ativo:

| Forma | Rótulo (pt) | Rótulo (en) | Rótulo (es) |
| --- | --- | --- | --- |
| triângulo | Novidade nesta versão | New in this version | Nueva en esta versión |
| losango | Recentemente alterado | Recently changed | Cambiado recientemente |
| círculo | Inalterada | Unchanged | Sin alterar |

A legenda mostra sempre as três formas, mesmo quando a edição vigente não tem nenhum item novo ou
alterado.

### 14. O gráfico exige janela larga

O conjunto da visualização — diagrama, blocos de rótulo e legenda — só é exibido em janela com
**800 px de largura ou mais**. Abaixo disso o conjunto inteiro fica oculto, e a página inicial
apresenta apenas as listagens por quadrante. O radar não tem versão reduzida do diagrama para
tela estreita: a leitura de conjunto é substituída pela leitura em lista.

### 15. A ordem de empilhamento do desenho é fixa

As camadas são desenhadas nesta ordem, de baixo para cima: os setores de cada quadrante (brilho
de fundo e arcos), depois os rótulos de anel, e por último os pontos. Essa ordem é o que mantém
todo ponto clicável e visível sobre o seu setor.

### 16. Os arcos e o brilho acompanham a quantidade de quadrantes; o resto do desenho, não

Os arcos dos anéis e o brilho de fundo são desenhados na fatia do slot de tela de cada quadrante,
repartindo o círculo pela quantidade de quadrantes declarada na taxonomia, qualquer que seja ela.
O restante do desenho continua preso a quatro posições: o deslocamento angular que sorteia a
posição dos pontos e os blocos de rótulo nos cantos leem tabelas de quatro entradas indexadas
pela posição exibida do quadrante, e um quinto quadrante declarado as faz devolver valor
inexistente.

Publicar o radar com uma quantidade de quadrantes diferente de quatro depende de migrar essas
duas peças, e carrega a exigência de que o desenho permaneça idêntico ao publicado hoje sempre
que houver quatro quadrantes. Cada passo dessa migração é decisão de arquitetura, sujeita a
registro próprio.

### 17. Item que o gráfico não consegue posicionar é omitido, sem aviso

Um item sem quadrante declarado, sem anel declarado, ou com um quadrante que não existe na
taxonomia, é simplesmente deixado de fora do diagrama. Nada é registrado e nada é exibido ao
leitor: a tecnologia some do radar enquanto continua aparecendo nas listagens alfabéticas. O
controle contra esse silêncio é a revisão humana da alteração do acervo.

Um anel que não existe na taxonomia é tratado de outra forma: o desenho não encontra a faixa
correspondente e a tela inteira do radar deixa de renderizar (ver *Restrições e validações*).

## Fluxos e ciclo de vida

### Desenhar o radar

1. Carregar a configuração do radar e o acervo de opiniões.
2. Selecionar apenas os itens em destaque.
3. Para cada item, resolver a posição do seu quadrante e o índice do seu anel na taxonomia, e
   descartar o item quando qualquer um dos dois não for resolvível (regra 17).
4. Sortear a posição do ponto de cada item, na ordem em que eles aparecem no acervo, aplicando as
   quatro regras de sorteio e o teto de tentativas.
5. Desenhar os setores de cada quadrante, os rótulos de anel e os pontos, na ordem de
   empilhamento fixa.
6. Posicionar os quatro blocos de rótulo de quadrante nos cantos e a legenda das formas ao lado
   do diagrama.

### Acrescentar um anel ao desenho

1. Acrescentar a entrada de geometria correspondente — raio e espessura do arco — **na mesma
   posição** que o anel ocupa na lista ordenada de anéis da taxonomia.
2. Manter os raios estritamente crescentes do centro para a borda, e cada raio afastado do
   anterior por mais que o dobro da folga do sorteio, para que a faixa comporte pontos.
3. Conferir que o rótulo do anel existe nos três idiomas: ele é escrito dentro do diagrama.

### Acrescentar um quadrante ao desenho

1. Atribuir a posição do quadrante na taxonomia — ela decide o canto do bloco de rótulo e o setor
   do círculo.
2. Acrescentar a descrição longa do quadrante na mesma posição da lista de descrições de cada
   idioma, porque o bloco de rótulo a lê posicionalmente.
3. Antes de passar de quatro quadrantes, tornar a geometria configurável (regra 16).

### Alterar o tamanho ou a escala do diagrama

A escala de coordenadas e o lado do desenho são lidos juntos: alterar um sem o outro muda a
conversão entre unidade de coordenada e pixel, e com ela a espessura aparente dos arcos, a folga
entre os pontos e o corredor livre ao redor das linhas centrais — que são medidos em pixels, não
em unidades de coordenada.

## Entidades e dados

A visualização não guarda dado próprio. Ela consome a classificação e a marca de cada item do
acervo, os atributos de cada quadrante e a lista ordenada de anéis da taxonomia, e a sua própria
seção de geometria na configuração do radar.

### Geometria do diagrama (`chartConfig`)

| Chave | Valor vigente | Papel |
| --- | --- | --- |
| `size` | 800 | lado, em px, do quadrado que contém o diagrama; a área de desenho reserva ainda 100 px livres abaixo dele |
| `scale` | `[-16, 16]` | domínio das coordenadas, do canto negativo ao positivo em cada eixo |
| `blipSize` | 12 | tamanho do ponto em px — diâmetro do círculo e lado do quadrado e do triângulo |
| `ringsAttributes` | lista ordenada | uma entrada por anel, na ordem dos anéis da taxonomia |

A conversão entre as duas unidades é linear: o domínio de 32 unidades é esticado sobre os 800 px
do lado, o que dá **25 px por unidade de coordenada**. O eixo vertical é invertido, de modo que
valores maiores de coordenada ficam mais acima na tela. O centro do diagrama é o ponto zero dos
dois eixos, no meio do quadrado.

### Geometria por anel (`ringsAttributes`)

| Anel | `radius` (unidades) | `arcWidth` (px) | Raio em px |
| --- | --- | --- | --- |
| `adopt` | 8 | 6 | 200 |
| `trial` | 11 | 4 | 275 |
| `assess` | 14 | 2 | 350 |
| `hold` | 16 | 2 | 400 |

- `radius` é a distância do centro até a **borda externa** do anel, em unidades de coordenada. A
  borda interna de um anel é o raio do anel anterior; a do primeiro anel é o próprio centro.
- `arcWidth` é a espessura do arco desenhado, **em pixels**, medida para dentro a partir da borda
  externa. As duas chaves não compartilham unidade: o arco fica mais fino à medida que os anéis
  se afastam do centro, e é isso que dá ao diagrama a leitura de que o centro "pesa" mais.

### Setor de cada quadrante

O setor é a fatia do círculo apontada pelo **slot de tela** do quadrante, declarado na taxonomia.
O círculo é repartido em fatias iguais de 360° dividido pela quantidade de quadrantes declarados,
e o slot escolhe qual delas o quadrante ocupa, varrendo o círculo em ordem a partir do topo, no
sentido horário. Com os quatro quadrantes publicados:

| Slot | Setor | Canto |
| --- | --- | --- |
| 1 | 0° a 90° | superior direito |
| 2 | 90° a 180° | inferior direito |
| 3 | 180° a 270° | inferior esquerdo |
| 4 | 270° a 360° | superior esquerdo |

O slot de tela e a posição exibida do quadrante são dados distintos: a numeração que o leitor vê
nos blocos de rótulo percorre o círculo em outra ordem, e é o slot — não ela — que decide a fatia
do arco.

### Dados de item consumidos pelo desenho

| Dado | Uso no diagrama |
| --- | --- |
| quadrante | setor, cor do ponto e cor da dica |
| anel | faixa de distância do centro |
| marca de publicação | forma do ponto |
| destaque | entra ou não no diagrama |
| rótulo exibido | texto da dica ao passar o mouse |
| nome | endereço de destino do link do ponto |

## Restrições e validações

- **Uma entrada de geometria por anel, na mesma ordem.** Com menos entradas do que anéis, o
  desenho procura uma faixa inexistente e a tela do radar deixa de renderizar.
- **Anel fora do vocabulário da taxonomia derruba a tela.** Um item cujo anel não consta na lista
  ordenada não tem faixa onde ser posicionado, e a falha não se limita ao ponto: o radar inteiro
  deixa de renderizar.
- **Quadrante fora do vocabulário, quadrante ausente ou anel ausente apenas omitem o item.** O
  diagrama é desenhado sem ele, sem erro visível.
- **Raios estritamente crescentes.** Raios fora de ordem crescente fazem as faixas se sobrepor e
  podem inverter o intervalo de sorteio da distância, jogando o ponto fora do seu anel.
- **A folga de sorteio precisa caber na faixa.** Uma faixa mais estreita que o dobro da folga não
  tem onde posicionar o ponto.
- **Posições de quadrante de 1 a 4, sem repetição.** Duas posições iguais sobrepõem dois blocos de
  rótulo no mesmo canto. Dois setores desenhados sobre a mesma área são consequência de um slot de
  tela repetido, que é dado distinto da posição.
- **A lista de descrições de quadrante é posicional e precisa cobrir todas as posições.** Uma
  descrição faltando na posição de um quadrante impede o bloco de rótulo daquele canto de ser
  montado e derruba a página inicial; uma lista fora de ordem atribui silenciosamente a descrição
  de um quadrante a outro.
- **Rótulo de anel ausente em um idioma** faz o diagrama exibir a chave crua no lugar do nome do
  anel, nos dois lados do centro.
- **Nenhuma validação automática.** Nada verifica, em tempo de build ou de carga, que a geometria
  acompanhe a taxonomia, que os raios estejam ordenados ou que as descrições estejam completas. O
  único controle é a revisão humana da alteração.
- **Densidade alta degrada o desenho antes de quebrá-lo.** Quando um setor recebe mais itens do
  que a sua área comporta com folga, o teto de cem tentativas é atingido e pontos passam a se
  sobrepor. O diagrama continua funcionando; o que se perde é a legibilidade.
- **O diagrama não é acessível por leitura sequencial nem em tela estreita.** Abaixo de 800 px de
  largura ele não é exibido, e toda a informação que ele carrega precisa continuar disponível nas
  listagens.

## Integrações e dependências externas

Nenhum serviço externo participa da visualização: o diagrama é inteiramente desenhado no
navegador, a partir da configuração e do acervo publicados como arquivos estáticos junto com o
site. As dependências de negócio do domínio são a taxonomia do radar, que define os eixos, as
cores e as posições, e o acervo de opiniões, que define o que é desenhado.

As precondições técnicas para que o domínio entregue comportamento completo estão em
[`references/technical-dependencies.md`](references/technical-dependencies.md).
