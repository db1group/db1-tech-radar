---
name: catalogo-de-opinioes-tecnologicas
description: >
  Esta é a documentação autoritativa do domínio Catálogo de Opiniões Tecnológicas: o acervo com a
  opinião oficial do DB1 sobre cada tecnologia — identidade, classificação, corpo nos três idiomas,
  marca de novidade, destaque, histórico de revisões e lista de publicações. Carregue ao
  acrescentar, alterar ou remover item em `db1-opinion.json`, ao mexer em `bodyPt`, `bodyEn`,
  `bodyEs`, `flag`, `featured`, `revisions`, `releases`, `tags` ou `info`, e ao decidir o que torna
  uma opinião publicável.
metadata:
  author: clovis-cli
  type: domain-skill
---

# Catálogo de Opiniões Tecnológicas

> **Manutenção desta skill**
>
> Atualize este documento sempre que **qualquer regra descrita aqui** mudar. O critério não é *qual*
> regra — é a natureza da mudança: mudou o comportamento ou a decisão (outro campo obrigatório,
> outro significado de marca, outra forma de guardar o histórico, outra regra de exibição do corpo)
> → atualize. Refatoração técnica que preserva a regra (renomear um componente, mover um arquivo,
> extrair uma função) → não mexa: a skill descreve a decisão, não a estrutura do código. Quando esta
> skill disser X e o sistema fizer Y sem decisão registrada que resolva o conflito, não "conserte"
> nem a skill nem o código: escale para o humano.

## Visão geral do domínio

O catálogo é o acervo de opiniões do radar: para cada tecnologia avaliada pela engenharia do DB1,
um registro que reúne a identidade da tecnologia, a sua classificação nos eixos do radar, o texto
da opinião nos três idiomas do produto e as marcas que contam o que mudou na edição mais recente.

É o conteúdo que dá propósito ao produto. Os demais domínios o consomem: o gráfico posiciona cada
item no cruzamento do seu quadrante com o seu anel, as listagens o agrupam e o apresentam, e o
processo editorial decide quando uma opinião muda.

O acervo é **dado**, não código: vive em um único documento de acervo (`db1-opinion.json`), servido
como arquivo estático e carregado inteiro pela aplicação antes de qualquer tela. Não existe banco,
API ou autenticação por trás dele — editar o acervo é editar esse documento. Não há camada de
busca, paginação ou carregamento parcial: todos os itens chegam ao navegador de uma vez.

O domínio depende da taxonomia do radar para existir: todo item declara um quadrante e um anel, e
esses valores precisam pertencer ao vocabulário definido pela taxonomia. O catálogo não define
quadrantes nem anéis — ele os referencia.

## Regras de negócio

A numeração abaixo é própria desta skill e serve apenas para referência interna.

### 1. Um item é a opinião oficial sobre uma tecnologia

Cada registro do acervo representa uma tecnologia avaliada e carrega a posição oficial da
engenharia sobre ela. Não existe item sem opinião: um registro sem corpo de texto não tem o que
comunicar ao leitor.

O item tem dois nomes, com papéis distintos:

- **Nome** (`name`) — a chave estável do item. É ela que forma o endereço público da página do item
  e que identifica o registro nas listas. Entra na URL **literalmente**, como foi escrita: o acervo
  atual tem nomes com espaço (`Open API`, `Easy Monitor`, `Claude Code`) e com ponto (`Agents.MD`),
  e o endereço os carrega como estão.
- **Rótulo exibido** (`title`) — o texto que o leitor vê no título da página, nas listagens, na
  dica do ponto no gráfico e no índice alfabético. Pode diferir do nome quando a grafia bonita não
  serve como chave: `csharp` é exibido como `C#`, `VueJS` como `Vue JS`, `CI CD` como `CI-CD`.

Renomear o rótulo é alteração de texto e não afeta nenhum endereço. Renomear o nome é migração:
quebra todo link publicado para aquela tecnologia.

### 2. O endereço do item é o par quadrante + nome

A página de um item é `<slug-do-quadrante>/<nome-do-item>`, e é por esse par que a aplicação
localiza o registro. O par é único no acervo. O nome, isoladamente, também é único em todo o
acervo: ele é usado como chave nas listas de itens, e dois registros com o mesmo nome colidem.

Mover um item de quadrante muda o seu endereço público, mesmo sem mudar nada no texto da opinião.

### 3. Toda opinião existe nos três idiomas

Cada item carrega três corpos de opinião obrigatórios, um por idioma do produto: português, inglês
e espanhol. Os três vivem no mesmo registro, em campos distintos, e todos os itens do acervo atual
têm os três preenchidos.

A tela exibe o corpo correspondente ao idioma ativo da sessão. O código de idioma é normalizado
pelo prefixo antes da escolha, para que uma variante regional caia no idioma base.

Criar um item ou alterar o texto de uma opinião significa escrever ou atualizar os **três** corpos
na mesma alteração. Um corpo vazio deixa a página do item em branco naquele idioma, sem erro
visível.

### 4. O corpo da opinião é HTML pronto, escrito à mão

O corpo não é Markdown nem texto simples: é o HTML final, armazenado já formatado dentro do
registro. A conversão de qualquer formato de origem para HTML acontece fora do acervo, por quem
escreve a opinião.

- A marcação em uso no acervo é a de um texto editorial: parágrafos, títulos de seção, listas
  ordenadas e não ordenadas, ênfase, texto riscado, linha divisória, trecho de código embutido e
  links. Links externos abrem em nova aba.
- O corpo chega à tela **sem passar por sanitização**. Isso torna o acervo conteúdo confiável por
  definição: o único controle sobre o HTML que entra é a revisão humana da alteração.
- Não há estrutura obrigatória de seções. A forma predominante no acervo abre com a opinião em si
  ("Nossa opinião") seguida da justificativa ("Por que"), e vários itens acrescentam seções de
  considerações, vantagens ou custos. Cerca de um terço dos itens não usa títulos de seção.

### 5. Toda opinião declara exatamente um quadrante e um anel

A classificação é obrigatória e é o endereço do item no radar. Os dois valores são slugs que
precisam existir no vocabulário da taxonomia.

Um item com classificação fora do vocabulário não é rejeitado em nenhuma etapa automática — ele
falha na apresentação (ver *Restrições e validações*).

### 6. A marca de publicação conta o que mudou na edição vigente

Cada item carrega uma marca (`flag`) com um de três valores:

| Marca | Significado | Como aparece |
| --- | --- | --- |
| `new` | tecnologia que entrou no radar na edição vigente | selo com o rótulo traduzido ao lado do título, nas listagens; forma própria do ponto no gráfico |
| `changed` | opinião alterada na edição vigente | selo com o rótulo traduzido ao lado do título, nas listagens; forma própria do ponto no gráfico |
| `default` | inalterada na edição vigente | sem selo; forma padrão do ponto no gráfico |

A marca é sempre relativa à **edição vigente** — a última entrada da lista de edições. Quem edita o
acervo a preenche à mão: nada a calcula, e nada a devolve a `default` quando a edição seguinte é
publicada, de modo que atualizar as marcas de todo o acervo faz parte de publicar. Um item sem
marca declarada cai no comportamento de `default`.

As duas marcas que exibem selo têm rótulo nos três idiomas do produto. Nas listagens compactas de
um quadrante o selo aparece abreviado, reduzido à inicial da marca; nas listagens completas aparece
com o rótulo inteiro. Item marcado como inalterado nunca exibe selo.

### 7. Destaque decide se o item entra no radar

O destaque (`featured`) separa o que compõe o radar daquilo que apenas existe no acervo:

- **item em destaque** — entra no gráfico e nas listagens por quadrante;
- **item fora de destaque** — fica fora do gráfico e das listagens por quadrante, mas continua
  acessível: aparece no índice alfabético de tecnologias, tem página própria e aparece esmaecido na
  navegação lateral da página de outro item do mesmo anel.

Todos os 53 itens do acervo atual estão em destaque.

### 8. O histórico de revisões preserva as opiniões anteriores

Um item pode guardar uma lista de revisões, **ordenada da mais recente para a mais antiga**. Cada
revisão é um retrato da opinião em uma edição passada: a classificação que o item tinha, a data da
edição e o texto daquela época.

- A **primeira** entrada da lista é a opinião vigente — a mesma que o corpo do item apresenta. Ela
  não é exibida como histórico.
- O histórico exibido na página do item é a lista **a partir da segunda entrada**, e só aparece
  quando há mais de uma entrada. Um item com nenhuma ou uma revisão não mostra seção de histórico.
- A revisão é **monolíngue**: guarda um único texto, no idioma em que foi escrito, qualquer que
  seja o idioma ativo.
- Cada entrada do histórico é apresentada com o anel daquela revisão e a data da edição
  correspondente.

Nenhum item do acervo atual registra histórico: a lista existe e está vazia em todos.

### 9. Informação complementar é uma linha curta sob o título

Um item pode trazer uma informação complementar (`info`) — uma linha curta que acompanha o título
nas listagens e também é considerada na busca textual. Quando vazia, nada é exibido. Está vazia em
todo o acervo atual.

### 10. Tags são opcionais e hoje não classificam nenhum item

Um item pode declarar tags, um eixo de agrupamento transversal independente de quadrante e anel.
Enquanto nenhum item do acervo tiver tag, o filtro por tags não tem o que oferecer e permanece
invisível. Nenhum item do acervo atual usa tags.

Quando há tags, o filtro é **conjuntivo**: pedir duas tags devolve apenas itens que tenham as duas.
Item sem tag nenhuma fica de fora de qualquer recorte por tag.

### 11. A edição do radar é uma data, e a lista de edições é ordenada

O acervo guarda, ao lado dos itens, a lista das edições publicadas do radar. Cada edição é uma data
no formato ano-mês-dia.

- A lista é **ordenada da edição mais antiga para a mais recente**: a última entrada é a edição
  vigente, e é a data de publicação apresentada ao leitor na página inicial. Uma data inserida fora
  dessa ordem faz o radar anunciar como publicação uma edição que não é a sua.
- A **quantidade** de entradas é o número da versão do radar exibido ao lado do nome do produto.

Cada item também declara a edição em que a sua opinião foi revista pela última vez. Esse dado é do
registro e não precisa coincidir com nenhuma entrada da lista de edições.

### 12. Datas são exibidas no formato configurado e no idioma ativo

Toda data do domínio — a data de publicação e as datas do histórico de revisões — é apresentada no
formato definido na configuração do radar (hoje, mês por extenso e ano) e no idioma ativo da
sessão. O dado permanece sempre em ano-mês-dia; a formatação é de apresentação.

## Fluxos e ciclo de vida

### Acrescentar uma tecnologia ao acervo

1. Escolher o nome que servirá de chave e endereço, e o rótulo exibido quando a grafia diferir.
2. Classificar: um quadrante e um anel, ambos pertencentes ao vocabulário da taxonomia.
3. Escrever a opinião nos três idiomas, já em HTML.
4. Declarar a marca da edição, o destaque e a edição em que o item entra.
5. Publicar, acompanhado de um novo identificador de build, para que o acervo alterado chegue a
   quem já visitou o site.

A promoção direta para um anel de maior confiança não é decisão de quem acrescenta o item — o anel
de entrada de uma tecnologia nova é regra do processo editorial.

### Alterar a opinião de uma tecnologia

1. Atualizar os três corpos de opinião na mesma alteração, mantendo-os equivalentes em conteúdo.
2. Quando a mudança de posição for relevante, atualizar o anel — mover de anel é alteração do
   acervo, não da taxonomia.
3. Quando a opinião anterior precisar permanecer legível, acrescentá-la ao histórico de revisões,
   mantendo a lista da mais recente para a mais antiga e a opinião vigente na primeira posição.
4. Atualizar a marca da edição e a edição do item.

### Publicar uma nova edição do radar

1. Acrescentar a data da nova edição ao final da lista de edições do acervo, preservando a ordem
   da mais antiga para a mais recente.
2. Rever as marcas de todos os itens, para que `new` e `changed` descrevam a edição que está
   entrando e os demais voltem a `default`.
3. Publicar com um novo identificador de build, para que o acervo alterado chegue a quem já
   visitou o site.

### Remover uma tecnologia do acervo

Remover o registro apaga a página do item e todo o seu histórico, e quebra qualquer link publicado
para ele. Tirar o destaque é a alternativa que preserva a página e o endereço, retirando a
tecnologia apenas do gráfico e das listagens por quadrante.

## Entidades e dados

O acervo é um documento estático único, com duas chaves de topo:

| Chave | Forma | Papel |
| --- | --- | --- |
| `items` | lista de itens | o acervo de opiniões |
| `releases` | lista ordenada de datas | as edições publicadas do radar, da mais antiga para a mais recente |

### Item

| Campo | Forma | Obrigatório | Papel |
| --- | --- | --- | --- |
| `name` | texto | sim | chave estável do item e segmento do endereço público |
| `title` | texto | sim | rótulo exibido ao leitor; é também o que define a letra do índice alfabético |
| `quadrant` | slug de quadrante | sim | eixo temático; primeiro segmento do endereço público |
| `ring` | slug de anel | sim | eixo de maturidade |
| `bodyPt` | HTML | sim | corpo da opinião em português |
| `bodyEn` | HTML | sim | corpo da opinião em inglês |
| `bodyEs` | HTML | sim | corpo da opinião em espanhol |
| `flag` | `new`, `changed` ou `default` | sim | marca da edição vigente |
| `featured` | booleano | sim | entra ou não no gráfico e nas listagens por quadrante |
| `revisions` | lista de revisões | sim | histórico, da mais recente para a mais antiga; lista vazia quando não há |
| `info` | texto | não | linha complementar sob o título nas listagens |
| `tags` | lista de textos | não | eixo transversal opcional de agrupamento |
| `release` | data ano-mês-dia | não | edição em que a opinião foi revista pela última vez |

### Revisão

| Campo | Forma | Papel |
| --- | --- | --- |
| `name` | texto | nome do item na época da revisão |
| `title` | texto | rótulo exibido na época da revisão |
| `quadrant` | slug de quadrante | classificação temática na época |
| `ring` | slug de anel | classificação de maturidade na época — é o que o histórico exibe |
| `release` | data ano-mês-dia | edição à qual a revisão pertence; identifica a entrada do histórico |
| `body` | HTML | texto da opinião naquela edição, em um único idioma |
| `fileName` | texto | referência ao documento de origem da revisão; nenhuma tela a lê |

## Restrições e validações

- **Nenhuma validação automática.** Nada verifica, em tempo de build ou de carga, que os campos
  obrigatórios estejam presentes, que a classificação exista na taxonomia, que os três corpos
  estejam preenchidos, que a lista de edições esteja ordenada ou que as marcas descrevam a edição
  vigente. O único controle é a revisão humana da alteração do acervo.
- **Marca sem rótulo traduzido.** Uma marca que exibe selo e não tenha rótulo nos três idiomas faz
  o selo apresentar a chave crua no lugar do texto, em qualquer idioma.
- **Quadrante fora da taxonomia** — o item é omitido do gráfico silenciosamente, sem erro visível,
  e continua aparecendo no índice alfabético. Também não existe página de quadrante para onde
  apontar.
- **Anel fora da taxonomia** — o desenho do gráfico não encontra a faixa correspondente e a tela do
  radar deixa de renderizar.
- **Item sem quadrante ou sem anel declarado** — omitido do gráfico.
- **Item sem rótulo exibido** — o índice alfabético não consegue classificá-lo e a tela de visão
  geral das tecnologias deixa de renderizar.
- **Nome e par quadrante + nome únicos.** Dois itens com o mesmo nome colidem nas listas; dois com
  o mesmo par disputam o mesmo endereço, e a aplicação resolve sempre para o primeiro encontrado.
- **O nome é segmento de URL.** Ele entra no endereço sem transformação, o que inviabiliza barra no
  nome: a barra é o separador entre quadrante e item.
- **O acervo é carregado inteiro antes de qualquer tela.** Sem o documento de acervo, nenhuma
  página do site renderiza.
- **O corpo da opinião não é sanitizado.** Todo HTML escrito no acervo chega à tela como está.

## Integrações e dependências externas

Nenhum serviço externo participa do acervo: não há API, banco de dados nem provedor de conteúdo. O
catálogo é um documento estático publicado junto com o site, e a sua única dependência de negócio é
a taxonomia do radar, que define o vocabulário de quadrantes e anéis que todo item precisa
respeitar.

As precondições técnicas para que o domínio entregue comportamento completo estão em
[`references/technical-dependencies.md`](references/technical-dependencies.md).
