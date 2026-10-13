---
name: navegacao-e-descoberta-de-tecnologias
description: >
  Esta é a documentação autoritativa do domínio Navegação e Descoberta de Tecnologias: endereço e
  resolução de cada tela, transição entre telas, índice alfabético, busca textual, filtro por anel,
  recorte por tags na URL, listagens por quadrante e as duas versões da página do item. Carregue ao
  mexer em rota, no sufixo `.html` do endereço, nos parâmetros `search` e `tags`, no campo de busca
  do cabeçalho, no modal de tags, na navegação lateral da página do item ou no corte de largura que
  troca a versão dessa página.
metadata:
  author: clovis-cli
  type: domain-skill
---

# Navegação e Descoberta de Tecnologias

> **Manutenção desta skill**
>
> Atualize este documento sempre que **qualquer regra descrita aqui** mudar. O critério não é *qual*
> regra — é a natureza da mudança: mudou deliberadamente o comportamento ou a decisão (outro
> endereço de tela, outro critério de busca, outro escopo de filtro, outra regra de agrupamento,
> outro corte de largura) → atualize, registrando o novo comportamento como se sempre tivesse sido
> esse. Refatoração técnica que preserva o comportamento (renomear componente, extrair função,
> trocar a biblioteca que faz o roteamento ou serializa a querystring) → não mexa: a skill descreve
> a decisão, não a estrutura do código. Quando esta skill disser X e o sistema fizer Y sem decisão
> registrada que resolva o conflito, não "conserte" nem a skill nem o código: escale para o humano.

## Visão geral do domínio

O gráfico do radar é a porta de entrada, mas não é o único caminho até uma tecnologia. Este domínio
entrega os outros: o índice alfabético de todo o acervo, a busca por texto, o filtro por anel de
maturidade, o recorte por tags, as listagens por quadrante e a leitura da opinião na página do
item.

O domínio é dono de três coisas:

- **o conjunto de telas e os seus endereços** — quais páginas existem, como uma URL vira tela e o
  que acontece quando ela não corresponde a nada;
- **os recortes do acervo** — busca, filtro por anel e recorte por tags: o que cada um considera,
  onde cada um vive e sobre qual conjunto de itens age;
- **a apresentação em lista** — como o acervo é agrupado e ordenado no índice alfabético, nas
  listagens por quadrante e na navegação lateral da página do item.

Ele não cria conteúdo nem vocabulário: consome a taxonomia do radar (quais quadrantes e anéis
existem e em que ordem) e o acervo de opiniões (quais tecnologias existem, como estão classificadas
e qual o texto de cada uma). Por isso o conjunto de páginas é **derivado do dado**: cada quadrante
declarado na taxonomia ganha a sua página, e cada item do acervo ganha a sua, sem que nada precise
ser declarado tela a tela.

Não existe servidor por trás: a aplicação carrega a taxonomia e o acervo inteiros antes de montar
qualquer tela, e todo recorte — busca, anel, tags — é feito sobre o que já está no navegador. Não
há paginação, carregamento sob demanda nem índice de busca.

## Regras de negócio

A numeração abaixo é própria desta skill e serve apenas para referência interna.

### 1. Seis telas, endereçadas por um nome de página terminado em `.html`

O endereço de uma tela é o seu **nome de página** seguido de `.html`. A raiz do site redireciona
para o endereço da página inicial, substituindo a entrada no histórico do navegador em vez de
empilhá-la.

| Tela | Nome de página | Endereço |
| --- | --- | --- |
| Página inicial | `index` | `/index.html` |
| Visão geral das tecnologias | `overview` | `/overview.html` |
| Ajuda e sobre o radar | `help-and-about-tech-radar` | `/help-and-about-tech-radar.html` |
| Página de um quadrante | o slug do quadrante | `/<slug-do-quadrante>.html` |
| Página de um item, em janela larga | o par quadrante + nome do item | `/<slug-do-quadrante>/<nome-do-item>.html` |
| Página de um item, em janela estreita | o mesmo par | o mesmo endereço |

As duas últimas linhas são a **mesma** URL: a versão da página do item é escolhida pela largura da
janela, não pelo endereço (regra 3).

Todo endereço é profundo: não há fragmento (`#`) nem rota de servidor. O site inteiro é entregue
por um único documento, e é a distribuição que precisa devolver esse documento para qualquer
caminho pedido.

### 2. A resolução do nome da página segue uma ordem fixa, e três nomes são reservados

Dado o nome extraído do endereço, a tela é escolhida nesta ordem, parando no primeiro acerto:

1. `index` — página inicial;
2. `overview` — visão geral das tecnologias;
3. `help-and-about-tech-radar` — ajuda e sobre o radar;
4. um nome que seja **slug de quadrante** da taxonomia — página daquele quadrante;
5. um nome que seja o **par quadrante + nome de item** presente no acervo — página daquele item;
6. nenhum dos anteriores — não encontrado.

A ordem tem consequência prática: os três primeiros nomes são **reservados**. Um quadrante cujo
slug fosse `overview`, ou um item cujo par formasse `index`, nunca seria alcançado pelo seu próprio
endereço.

### 3. A página do item tem duas versões, escolhidas pela largura da janela

Abaixo de **1200 px** de largura o endereço do item abre a versão estreita; a partir de 1200 px,
a versão larga. As duas apresentam a mesma opinião, com layout e navegação lateral diferentes
(regra 12).

A largura é lida no momento em que a tela é resolvida. Redimensionar a janela não troca a versão
enquanto a tela não for resolvida de novo: o leitor que estica a janela continua na versão que
abriu.

### 4. Nome não resolvido abre uma área de conteúdo vazia

Um endereço que não corresponde a nenhuma das cinco telas não produz mensagem de erro, código de
status próprio nem redirecionamento. A casca da página — cabeçalho, área de conteúdo e rodapé —
continua montada, e a área de conteúdo fica em branco.

Isso vale tanto para um endereço inventado quanto para o endereço de um item que o recorte por tags
ativo deixou de fora do conjunto considerado (regra 10).

### 5. A troca de tela passa por uma transição de saída, e só entre telas de tipos diferentes

Quando o endereço aponta para uma tela de **tipo diferente** do que está montado, a tela atual
desaparece gradualmente (esmaecimento de 0,2 s) e só então a próxima é montada. O desaparecimento
acontece primeiro; nenhuma das duas telas aparece sobreposta à outra.

Quando o endereço aponta para outra tela do **mesmo tipo** — de um item para outro item, de um
quadrante para outro quadrante — não há transição: o conteúdo é trocado de imediato.

A página do item em janela larga é a exceção ao esmaecimento: ela tem a sua própria coreografia
(regra 6).

### 6. A página do item em janela larga entra e sai em sequência encenada

A tela é composta por uma faixa lateral de navegação e um painel de conteúdo, que entram em cinco
tempos. Os atrasos abaixo são contados a partir do início da sequência; cada peça leva de 150 ms a
450 ms para completar o seu próprio movimento.

| Peça | Movimento de entrada | Atraso na entrada | Atraso na saída |
| --- | --- | --- | --- |
| painel de conteúdo | desliza da direita para a posição final | imediato | 300 ms + 50 ms por item da lista lateral |
| cabeçalho da faixa lateral | entra pela esquerda, surgindo | 300 ms | imediato (sai pela direita) |
| itens da lista lateral | entram pela esquerda, um a um | 400 ms + 100 ms por item, na ordem da lista | 100 ms + 50 ms por item |
| texto da opinião | sobe para a posição final, surgindo | 600 ms | imediato (desce, sumindo) |
| encerramento da faixa lateral | entra pela esquerda, surgindo | 600 ms + 100 ms por item da lista | 200 ms + 50 ms por item |

A próxima tela só é montada depois que a mais longa dessas saídas termina. A duração total da saída
cresce com o número de itens no mesmo anel: um anel cheio faz a saída demorar visivelmente mais que
um anel com poucos itens.

### 7. O índice alfabético agrupa pela inicial do rótulo exibido

A visão geral das tecnologias lista **todo** o acervo — itens em destaque e fora de destaque —
agrupado pela **primeira letra do rótulo exibido** da tecnologia, convertida para maiúscula.

- Os grupos são apresentados em ordem crescente do caractere que os nomeia. A ordenação é por
  código de caractere: dígitos vêm antes de letras, e uma inicial acentuada não é dobrada na letra
  sem acento — ela forma um grupo próprio, depois de todas as letras sem acento.
- O agrupamento usa o **rótulo exibido**, não o nome que forma o endereço: uma tecnologia com nome
  `csharp` e rótulo `C#` aparece no grupo `C`.
- Um grupo que fica sem nenhum item depois da busca e do filtro por anel não é exibido.
- Cada linha leva à página do item e apresenta, além do rótulo, o quadrante e o anel da tecnologia.

### 8. A busca textual é por trecho contido, sem dobra de acento e sem ranqueamento

Um item casa com o termo buscado quando o termo aparece, como trecho contínuo, em pelo menos um
destes três campos:

1. o rótulo exibido da tecnologia;
2. o corpo da opinião **no idioma ativo** da sessão;
3. a informação complementar do item.

Regras do casamento:

- a comparação ignora maiúsculas e minúsculas, aplicando a conversão para minúsculas do idioma;
- espaços no início e no fim são descartados, tanto do termo quanto do campo;
- termo vazio ou só com espaços casa com todos os itens;
- **não há dobra de acento**: buscar `codigo` não encontra `código`;
- **não há separação em palavras nem relevância**: o termo é procurado inteiro, e o resultado sai
  na ordem do índice alfabético, não por proximidade com o termo.

Buscar no corpo da opinião significa buscar no HTML já montado: um termo que coincida com marcação
pode casar sem aparecer como texto para o leitor.

### 9. A busca do cabeçalho leva à visão geral; a busca da própria tela filtra ao digitar

São dois campos de busca, com papéis distintos.

**No cabeçalho**, presente em todas as telas: acionar a busca abre um campo e coloca o cursor nele.
Enviar o termo navega para a visão geral das tecnologias, levando o termo no parâmetro `search` do
endereço e preservando o recorte por tags que estiver ativo. O campo do cabeçalho é fechado e
esvaziado após o envio — ele não guarda o último termo buscado.

**Na visão geral**, acima do índice: o campo nasce preenchido com o termo que veio no endereço e é
reposto sempre que esse parâmetro muda. Digitar filtra a lista imediatamente, sem envio. O que é
digitado ali **não** volta para o endereço: só o termo que chegou pelo cabeçalho é compartilhável
por link.

### 10. O filtro por anel vive na visão geral e começa em "todos"

Ao lado da busca, a visão geral oferece uma opção por anel da taxonomia, na ordem em que os anéis
estão declarados, precedida da opção "todos". A escolha é **única**: selecionar um anel substitui o
anterior.

O filtro não viaja no endereço e não é compartilhável por link. Sair da tela e voltar o devolve a
"todos".

Busca e filtro por anel se combinam: um item só aparece quando satisfaz os dois.

### 11. O recorte por tags vive no endereço, é conjuntivo e vale para o site inteiro

O recorte por tags é o único filtro que atravessa todas as telas. Ele é aplicado ao acervo **antes**
de qualquer tela ser montada, de modo que gráfico, listagens, índice alfabético e o próprio conjunto
de páginas de item existentes passam a enxergar apenas os itens que sobraram.

- O recorte viaja no parâmetro `tags` do endereço, com os valores separados por `|`.
- O recorte é **conjuntivo**: pedir duas tags devolve apenas os itens que tenham as duas. Item sem
  nenhuma tag fica de fora de qualquer recorte por tag.
- A porta de entrada é um atalho de filtro no cabeçalho, exibido apenas quando pelo menos um item
  do acervo carrega tag. Essa verificação é feita sobre o acervo **inteiro**, não sobre o recorte
  vigente: aplicar um recorte nunca faz o atalho desaparecer.
- O atalho abre uma janela modal com a lista de todas as tags do acervo, em ordem alfabética e sem
  repetição, cada uma com uma caixa de seleção que reflete o recorte vigente. Marcar acrescenta a
  tag ao recorte; desmarcar a retira.
- Todo link interno — linha de listagem, entrada do índice alfabético, ponto do gráfico, item da
  faixa lateral e atalho de quadrante — leva o recorte adiante íntegro, com **todas** as tags
  selecionadas e o mesmo separador. O recorte sobrevive a qualquer quantidade de tags e a qualquer
  número de saltos entre telas, e o endereço de chegada reproduz o mesmo recorte quando
  compartilhado.
- Enquanto o recorte estiver ativo, o item que ficar de fora **perde a sua página**: o endereço
  dele deixa de ser resolvido e a área de conteúdo fica vazia (regra 4).

### 12. A página do item apresenta a opinião ao lado da navegação pelo mesmo anel

O item é localizado pelo par quadrante + nome do endereço; havendo mais de um registro com o mesmo
par, o primeiro do acervo é o que responde.

A tela tem duas partes:

**A faixa de navegação lateral** lista todas as tecnologias do **mesmo quadrante e do mesmo anel**
do item aberto, cada uma como link para a sua página:

- os itens em destaque vêm primeiro, na ordem do acervo; os fora de destaque vêm depois, esmaecidos
  — esta é a única listagem do produto que mostra item fora de destaque ao lado dos demais;
- o item aberto aparece destacado na lista;
- cada linha traz o rótulo exibido, a marca de publicação e a informação complementar, quando há;
- o bloco traz o quadrante do item, o anel e um atalho para a página do quadrante.

**O painel de conteúdo** traz, nesta ordem: o rótulo exibido como título, o anel em destaque, o
corpo da opinião no idioma ativo, a linha de tags do item e o histórico de revisões anteriores —
este último apenas quando o item guarda mais de uma revisão.

Em janela larga a nota institucional do rodapé da página é ocultada nesta tela, para a leitura da
opinião ocupar a altura disponível; a faixa lateral traz o seu próprio encerramento.

### 13. As listagens por quadrante existem em duas formas: compacta e completa

Ambas mostram **apenas itens em destaque**, agrupados por quadrante e, dentro dele, por anel, na
ordem em que os anéis estão declarados na taxonomia. O interruptor da taxonomia que governa anel
vazio decide se um anel sem nenhum item aparece com o cabeçalho vazio ou é omitido.

**Compacta — na página inicial.** Um bloco por quadrante, na ordem em que os quadrantes estão
declarados na taxonomia. Cada bloco traz o rótulo do quadrante, um atalho de aproximação para a
página daquele quadrante e, por anel, o selo do anel seguido dos rótulos das tecnologias em
sequência, cada um como link, com a marca de publicação abreviada. Os blocos ocupam duas colunas em
janela larga e passam a uma coluna abaixo de aproximadamente 990 px.

**Completa — na página do quadrante.** O rótulo do quadrante é o título da tela. Por anel, o selo
do anel seguido de uma linha por tecnologia, com o rótulo exibido, a marca de publicação por extenso
e a informação complementar quando há. Esta tela não repete o atalho de aproximação: ela já é o
destino dele.

### 14. Todo texto de interface da navegação é traduzido para os três idiomas

Nenhum rótulo deste domínio chega ao leitor preso a um idioma nem como identificador cru. Rótulo de
quadrante, rótulo de anel, itens do menu do cabeçalho, textos do campo de busca, atalho de filtro e
conteúdo da janela de seleção de tags, atalho de aproximação do quadrante e título de cada tela são
todos resolvidos pelo idioma ativo da sessão, em português, inglês e espanhol.

A regra vale igualmente nas duas versões da página do item: a versão estreita apresenta o quadrante
e o anel com os mesmos rótulos traduzidos da versão larga.

### 15. O título do documento identifica a tela e o produto

Toda tela escreve o título do documento como `<identificação da tela> | <nome do radar>`:

| Tela | Identificação |
| --- | --- |
| Página inicial | o nome do radar |
| Visão geral das tecnologias | o título traduzido da tela |
| Ajuda e sobre o radar | o título traduzido da tela |
| Página de um quadrante | o rótulo traduzido do quadrante |
| Página de um item | o rótulo exibido da tecnologia |

### 16. O número de telas acompanha a taxonomia e o acervo, sem alteração de código

Acrescentar um quadrante à taxonomia cria a sua página e o seu bloco nas listagens; acrescentar um
item ao acervo cria a sua página. Nada neste domínio pressupõe uma quantidade fixa de quadrantes ou
de anéis: as listagens percorrem o que a taxonomia declarar, na ordem em que estiver declarado.

## Fluxos e ciclo de vida

### Abrir um endereço

1. Extrair o nome da página do caminho, descartando o sufixo `.html`.
2. Aplicar o recorte por tags do endereço sobre o acervo, quando houver.
3. Resolver o nome em uma das cinco telas, na ordem da regra 2, usando o acervo já recortado.
4. Não resolvendo, montar a casca com a área de conteúdo vazia.
5. Resolvendo para a página de um item, escolher a versão pela largura da janela.

### Encontrar uma tecnologia por busca

1. Acionar a busca no cabeçalho, de qualquer tela, e enviar o termo.
2. Chegar à visão geral com o termo já aplicado e visível no campo.
3. Refinar digitando no campo da própria tela, que filtra a cada tecla.
4. Estreitar por anel, se quiser — a escolha se combina com o termo.
5. Abrir a tecnologia pelo índice. O termo de busca **não** acompanha a navegação para a página do
   item.

### Percorrer um quadrante

1. Chegar ao quadrante pelo bloco da página inicial, pelo atalho de aproximação do gráfico ou pela
   faixa lateral de uma página de item.
2. Ler as tecnologias agrupadas por anel, da maior para a menor confiança declarada, na ordem da
   taxonomia.
3. Abrir uma tecnologia e seguir pela faixa lateral entre as demais do mesmo anel.

### Acrescentar uma tela ao domínio

1. Escolher um nome de página que não colida com os nomes reservados, com nenhum slug de quadrante
   e com nenhum par quadrante + nome de item do acervo.
2. Encaixar o nome na ordem de resolução da regra 2, ciente de que posições anteriores têm
   precedência.
3. Decidir se a tela usa a transição de saída padrão ou coreografia própria (regras 5 e 6).
4. Definir a identificação da tela no título do documento (regra 15) e os seus rótulos nos três
   idiomas (regra 14).

## Entidades e dados

O domínio não guarda dado próprio: ele consome a taxonomia e o acervo e mantém estado apenas no
endereço e na memória da tela aberta.

### Endereço de uma tela

```
/<nome-da-página>.html[?search=<termo>][&tags=<tag>|<tag>...]
```

O nome da página pode ter uma barra, e tem exatamente quando é a página de um item: a barra separa
o slug do quadrante do nome do item. O nome do item entra no endereço como está escrito no acervo,
sem transformação — nomes com espaço e com ponto são carregados literalmente.

### Parâmetros do endereço

| Parâmetro | Forma | Escopo | Sobrevive à troca de tela |
| --- | --- | --- | --- |
| `search` | texto livre | apenas a visão geral das tecnologias | não: só chega à tela pelo envio da busca do cabeçalho |
| `tags` | tags separadas por `\|` | o acervo inteiro, antes de qualquer tela | sim: todo link interno o reproduz íntegro, com todas as tags |

### Estado que vive apenas na tela

| Estado | Onde | O que acontece ao sair da tela |
| --- | --- | --- |
| termo digitado no campo da visão geral | visão geral | é perdido |
| anel selecionado no filtro | visão geral | volta para "todos" |
| campo de busca do cabeçalho aberto e preenchido | cabeçalho | é fechado e esvaziado ao enviar |
| janela modal de tags aberta | cabeçalho | é fechada; o recorte permanece no endereço |

### Dados do acervo e da taxonomia consumidos

| Dado | Uso na navegação |
| --- | --- |
| slug do quadrante | nome da página do quadrante e primeiro segmento do endereço do item |
| nome do item | segundo segmento do endereço do item e chave na lista lateral |
| rótulo exibido | texto das listagens, título da tela e letra do índice alfabético |
| anel | agrupamento das listagens, selo e filtro por anel |
| lista ordenada de anéis | ordem dos grupos nas listagens e das opções do filtro |
| lista de quadrantes | quais páginas de quadrante existem e a ordem dos blocos na página inicial |
| destaque | entra ou não nas listagens por quadrante; posição na lista lateral do item |
| corpo da opinião no idioma ativo | campo considerado pela busca e conteúdo da página do item |
| informação complementar | campo considerado pela busca e linha sob o rótulo nas listagens |
| tags | recorte global por tags |
| marca de publicação | selo ao lado do rótulo nas listagens |
| histórico de revisões | seção final da página do item, a partir da segunda entrada |

## Restrições e validações

- **Nenhuma validação automática de endereço.** Nada confere, em tempo de carga, que um slug de
  quadrante não colida com um nome reservado ou com o par de um item. A colisão não produz erro:
  simplesmente a tela de maior precedência responde e a outra fica inalcançável.
- **O nome do item não pode conter barra.** A barra é o separador entre quadrante e item no
  endereço; um nome com barra parte o endereço no lugar errado e a página deixa de ser encontrada.
- **Nome de página não resolvido falha em silêncio.** Não há mensagem, registro nem redirecionamento
   — a área de conteúdo fica vazia, e o leitor não distingue um endereço errado de um item retirado
  pelo recorte por tags.
- **A página do quadrante e as listagens pressupõem que o quadrante tenha ao menos um item em
  destaque.** Com o interruptor de anel vazio ligado, um quadrante declarado na taxonomia e sem
  nenhum item em destaque não tem grupo para percorrer e a tela que o apresenta deixa de renderizar.
  Com o interruptor desligado — a configuração vigente — o quadrante simplesmente aparece vazio.
- **A página do item pressupõe que o item exista no conjunto considerado.** O endereço é resolvido
  contra a lista já recortada por tags: o item que não estiver nela não tem página.
- **Rótulo exibido ausente impede o índice alfabético.** O agrupamento lê a primeira letra do
  rótulo; sem rótulo não há grupo e a visão geral das tecnologias deixa de renderizar.
- **Qualquer rótulo da navegação ausente em um idioma** faz a interface exibir a chave crua da
  tradução no lugar do texto, naquele idioma. Acrescentar um rótulo significa acrescentá-lo aos três
  idiomas na mesma alteração.
- **A busca percorre o acervo inteiro a cada tecla.** Não há índice, memorização de resultado nem
  carregamento parcial: o custo cresce com o tamanho do acervo e com o tamanho dos corpos de
  opinião, que são percorridos por inteiro.
- **O corte de 1200 px é avaliado uma vez.** Redimensionar a janela entre as duas faixas não troca a
  versão da página do item enquanto a tela não for resolvida de novo.
- **URLs profundas dependem da publicação.** Todo endereço deste domínio é servido pelo mesmo
  documento único; sem a distribuição devolver esse documento para qualquer caminho, apenas a raiz
  abre e todo link compartilhado quebra.

## Integrações e dependências externas

Nenhum serviço externo participa da navegação: todas as telas são montadas no navegador, a partir da
taxonomia e do acervo publicados como arquivos estáticos junto com o site. Não há API de busca,
índice remoto nem autenticação.

As dependências de negócio do domínio são a taxonomia do radar, que define quais quadrantes e anéis
existem e em que ordem as listagens os percorrem, e o acervo de opiniões, que define quais páginas
de item existem e o que cada recorte encontra.

As precondições técnicas para que o domínio entregue comportamento completo estão em
[`references/technical-dependencies.md`](references/technical-dependencies.md).
