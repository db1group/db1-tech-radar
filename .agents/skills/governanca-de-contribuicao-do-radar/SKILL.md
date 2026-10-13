---
name: governanca-de-contribuicao-do-radar
description: >
  Esta é a documentação autoritativa do domínio Governança de Contribuição do Radar: o processo
  editorial que decide como uma tecnologia entra no radar, quem promove ou rebaixa o seu anel, o
  que a revisão do pull request controla, o texto público que explica o radar ao leitor e o atalho
  de edição da página do item. Carregue ao mexer no guia de contribuição, no template de pull
  request, na chave `pageHelp` das traduções, na página de ajuda do site ou em `editLink`, e ao
  decidir o anel de entrada, a promoção ou a saída de uma tecnologia.
metadata:
  author: clovis-cli
  type: domain-skill
---

# Governança de Contribuição do Radar

> **Manutenção desta skill**
>
> Atualize este documento sempre que **qualquer regra descrita aqui** mudar. O critério não é *qual*
> regra — é a natureza da mudança: mudou o comportamento ou a decisão (outro anel de entrada, outra
> autoridade para promover, outra pergunta no template, outro texto publicado do processo) →
> atualize. Refatoração técnica que preserva a regra (renomear um componente, mover um arquivo,
> extrair uma função) → não mexa: a skill descreve a decisão, não a estrutura do código. Quando esta
> skill disser X e o sistema fizer Y sem decisão registrada que resolva o conflito, não "conserte"
> nem a skill nem o código: escale para o humano.

## Visão geral do domínio

O radar publica a **opinião oficial da engenharia do DB1** sobre tecnologias. O que dá autoridade a
essa opinião não é o dado em si, e sim o processo editorial que a produz: quem pode propor, em que
anel a tecnologia entra, quem decide movê-la, o que é verificado antes de publicar e o que é
explicado ao leitor para que ele saiba como interpretar o que vê.

Este domínio é esse processo. Ele não guarda o texto das opiniões nem define os eixos de
classificação — rege **como** uma opinião entra, muda e sai, e **como** essa mecânica é explicada em
público.

O processo tem duas definições publicadas, cada uma para um público:

- **o guia de contribuição** (`CONTRIBUTING.md`, no repositório público) — dirigido a quem quer
  propor ou alterar uma opinião: o caminho do pull request, o template a responder e o anel de
  entrada;
- **a página pública de ajuda** (endereço `/help-and-about-tech-radar.html`) — dirigida a quem lê o
  radar: o que ele é, como é criado, como deve ser usado e o que cada eixo de classificação
  significa.

Não existe ferramenta própria de workflow editorial, fila de aprovação ou automação de validação. O
processo inteiro acontece sobre pull requests no repositório público, e a revisão humana é o único
controle de qualidade do conteúdo.

## Regras de negócio

A numeração abaixo é própria desta skill e serve apenas para referência interna.

### 1. Toda alteração do radar entra por pull request no repositório público

O radar é mantido em `github.com/db1group/db1-tech-radar`, repositório público. Acrescentar,
alterar ou remover uma opinião é abrir um pull request contra o ramo principal:

- quem não tem acesso de escrita faz um fork do repositório e cria a sua branch a partir do ramo
  principal;
- quem é do time trabalha em uma branch do próprio repositório; o pull request e a revisão são os
  mesmos nos dois casos.

O time de engenharia acompanha os pull requests abertos e responde a cada um de três formas:
**incorpora**, **pede alterações** ou **fecha com uma explicação**. Nenhuma alteração do acervo
chega ao site sem passar por essa revisão.

A unidade usual de contribuição é **uma tecnologia por pull request**. Tecnologias que só fazem
sentido avaliadas em comparação umas com as outras viajam juntas na mesma alteração, para que a
revisão possa compará-las.

### 2. Tecnologia nova entra obrigatoriamente no anel de avaliação

Toda tecnologia proposta entra no anel `assess` — o anel que comunica "experimentamos e achamos
promissor; olhe quando surgir a necessidade". Quem propõe **não escolhe** o anel: o anel de entrada
é fixo, e propor uma tecnologia já em `adopt` ou `trial` é pedido de alteração na revisão.

A razão é o significado dos anéis mais internos: eles afirmam uso prolongado e bem-sucedido em
várias equipes do DB1, e essa afirmação não pode ser feita por quem acabou de trazer a tecnologia.

### 3. A promoção entre anéis é decisão do time de engenharia

Mover uma tecnologia de anel — para dentro, aproximando-a da recomendação, ou para fora, até o anel
que pede para parar de usar — é decisão do time de engenharia, tomada depois de estudar a
tecnologia. Não é decisão de quem contribui e não acontece junto com a entrada da tecnologia no
radar.

Um item recém-aceito passa por uma **etapa de pesquisa conduzida pelo time de Staff Engineering**,
que é o que sustenta a decisão de promovê-lo ou mantê-lo em avaliação. A decisão também se apoia nas
discussões de grupos de especialistas sobre a classificação e os detalhes de cada tecnologia.

A movimentação em si é uma alteração do acervo, aberta e revisada como qualquer outra.

### 4. Nada entra no radar sem ter sido experimentado

Os itens do radar são levantados pelas equipes a partir do trabalho e dos desafios reais dos
projetos. A regra publicada é explícita: **não se inclui no radar nada que não tenha sido
experimentado pelo menos uma vez**. O radar não registra expectativa sobre tecnologia não usada.

### 5. O radar não é um catálogo exaustivo

O radar cobre o que é novo ou digno de nota para o contexto de projeto que o DB1 atende —
aplicações corporativas — e não pretende descrever todas as tecnologias estabelecidas do mercado.
Ele se concentra em itens que ganharam importância ou mudaram recentemente.

Esse recorte é critério de aceitação: uma proposta que não traz novidade nem mudança relevante para
esse contexto não tem lugar no radar, mesmo sendo uma tecnologia legítima.

### 6. A classificação ambígua escolhe o melhor encaixe

Quando não está totalmente claro a qual quadrante uma tecnologia pertence, a regra publicada é
escolher o **mais adequado**, e não criar um eixo novo nem deixar o item sem classificação. A
decisão sobre qual encaixe é o melhor faz parte da revisão.

### 7. O pull request responde quatro perguntas

O guia de contribuição define um template a ser respondido na abertura do pull request:

1. nome da tecnologia;
2. por que ela merece estar no radar;
3. quais são os principais benefícios da adoção;
4. quais são as potenciais desvantagens da adoção.

As quatro respostas são o material que a revisão avalia: elas registram a justificativa da entrada,
que o texto da opinião depois comunica ao leitor. O template vive como seção do guia de
contribuição, para ser copiado à mão — o repositório não injeta template automaticamente ao abrir um
pull request, de modo que preenchê-lo é responsabilidade de quem contribui e cobrá-lo é
responsabilidade de quem revisa.

### 8. A revisão humana é o único controle de qualidade

Nada no caminho entre o pull request e o site verifica o conteúdo automaticamente. A revisão é o
único ponto em que se confere:

- se a tecnologia cabe no recorte do radar e no quadrante escolhido;
- se o anel declarado respeita a regra de entrada e as decisões de promoção já tomadas;
- se o texto da opinião existe em todos os idiomas do produto e diz o mesmo em cada um;
- se a marcação do texto da opinião é segura e bem formada, já que ela chega à tela sem filtro
  automático;
- se o item é coerente com o vocabulário de quadrantes e anéis em vigor — uma classificação
  inexistente não produz erro visível, apenas desaparece do gráfico ou impede a tela de montar.

Uma falha que passa pela revisão só aparece em produção.

### 9. Publicar uma edição é um ato editorial separado

Toda alteração incorporada ao ramo principal vai ao ar imediatamente: a edição **não é um portão de
publicação**. Declarar uma nova edição do radar é um ato editorial próprio, feito em alteração
própria, que agrupa as mudanças do período e dá ao leitor a data e o número da versão exibidos na
página inicial.

Daí decorre a disciplina: a edição é decidida pelo time de engenharia quando o conjunto de mudanças
justifica anunciar uma nova publicação, e não automaticamente a cada opinião incorporada.

### 10. Uma tecnologia sai do radar por decisão editorial

Remover uma opinião é tão editorial quanto acrescentá-la, e acontece pelo mesmo caminho de pull
request e revisão. Os motivos praticados:

- **obsolescência** — a tecnologia deixou de existir ou de ser relevante, e manter a opinião
  enganaria o leitor;
- **avaliação adiada** — a tecnologia foi retirada para ser avaliada mais tarde, junto com as
  concorrentes, quando a comparação entre elas for mais útil que a opinião isolada.

Retirar o item do radar sem apagar a sua página é a alternativa quando a opinião ainda interessa a
quem a procura diretamente.

### 11. O texto público do processo é parte do produto

A página de ajuda é a explicação oficial do radar ao leitor, e a sua estrutura é fixa:

| Seção | O que publica |
| --- | --- |
| Introdução | por que acompanhar inovação importa e por que escolher bem também importa |
| O que é o Radar Tecnológico DB1 | o recorte do radar: tecnologias relevantes para aplicações corporativas |
| Como ele é criado | itens levantados pelas equipes, nada incluído sem ter sido experimentado, discussão em grupos de especialistas e a etapa de pesquisa do time de Staff Engineering |
| Como deve ser usado | o radar como guia e inspiração para o trabalho diário, para decisões mais bem informadas e alinhadas; também endereçado a quem é de fora do DB1 |
| Lista dos quadrantes | nome e descrição de cada eixo temático |
| Lista dos anéis | nome e descrição de cada eixo de maturidade |
| Link do código-fonte | o convite à contribuição, apontando para o repositório público |

O título da página é a composição de um prefixo traduzido com o nome do radar ("Como usar o Radar
Tecnológico"). As duas listas de eixos exibem o texto definido pela taxonomia de quadrantes e anéis;
este domínio governa as seções narrativas, o convite à contribuição e a coerência do conjunto.

### 12. O texto publicado aceita marcação simples e é sanitizado

Os parágrafos do processo são armazenados com marcação HTML e passam por sanitização antes de chegar
à tela, com lista branca restrita: negrito, itálico, ênfase, link, lista ordenada, lista não
ordenada e item de lista. No link, só os atributos de endereço e de alvo sobrevivem. Qualquer outra
marcação é descartada silenciosamente — o texto aparece, a marcação não.

### 13. O convite à contribuição fecha a página de ajuda

A última seção da página de ajuda apresenta uma frase de chamada, o nome do repositório e o seu
endereço, em um link que abre em nova aba. É por ele que o leitor chega ao processo de contribuição.
O endereço publicado é o mesmo repositório em que o processo acontece.

### 14. O atalho de edição da página do item é opcional e hoje não aparece

A página de um item pode exibir, ao lado do título, um atalho que leva à origem editável daquela
opinião. Ele só existe quando o atalho está configurado, e o seu endereço é montado como
`<endereço base>/<edição do item>/<nome do item>.md`.

Esse formato pressupõe **um documento Markdown por tecnologia e por edição** — uma origem que o
acervo atual, concentrado em um único documento de dados, não tem. Por isso a configuração do atalho
permanece ausente e o atalho não aparece em nenhuma das duas versões da página do item.

## Fluxos e ciclo de vida

### Entrada de uma tecnologia nova

1. Ler o texto público de ajuda para entender os eixos e escolher o quadrante da tecnologia.
2. Criar a branch a partir do ramo principal — em um fork, quando não há acesso de escrita.
3. Acrescentar o item ao acervo, classificado no anel de avaliação, com a opinião escrita em todos
   os idiomas do produto.
4. Abrir o pull request respondendo às quatro perguntas do template.
5. Revisão do time de engenharia: incorporação, pedido de alteração ou fechamento com explicação.
6. Incorporada a alteração, a tecnologia entra no radar em avaliação e passa pela etapa de pesquisa
   do time de Staff Engineering.

### Promoção ou rebaixamento de anel

1. O time de engenharia decide o movimento a partir da pesquisa e da experiência acumulada de uso.
2. A mudança de anel é aberta como alteração do acervo e revisada como qualquer outra.
3. Quando a opinião anterior precisa continuar legível, ela é preservada no histórico do item em vez
   de ser sobrescrita.
4. O movimento entra na próxima edição declarada, que é o que o anuncia ao leitor.

Mover para dentro afirma confiança crescente; mover para o anel mais externo é a única forma de
comunicar "pare de usar" e exige a mesma autoridade das promoções.

### Mudança de opinião sem mudança de anel

Rever o texto de uma opinião — porque a tecnologia evoluiu, porque surgiu experiência nova ou porque
a justificativa mudou — segue o mesmo caminho: pull request, revisão e incorporação. O anel
permanece; o que muda é o que o DB1 afirma sobre a tecnologia.

### Publicação de uma edição

1. O time de engenharia decide que o conjunto de mudanças incorporadas justifica anunciar uma nova
   publicação.
2. A data da edição é declarada no acervo, em alteração própria.
3. As marcas de novidade e de alteração dos itens são revistas, para que descrevam a edição que está
   sendo anunciada.
4. A edição passa a ser a publicação vigente apresentada ao leitor.

### Alteração do processo publicado

Mudar a regra do processo exige atualizar as **duas** definições publicadas — o guia de contribuição
e a página de ajuda — na mesma alteração, e o texto da página de ajuda em todos os idiomas do
produto. Uma mudança em apenas um dos lados publica processos diferentes para o contribuinte e para
o leitor.

## Entidades e dados

O domínio não tem registro próprio no acervo: ele vive em três artefatos.

| Artefato | Onde vive | Papel |
| --- | --- | --- |
| Guia de contribuição | documento público do repositório (`CONTRIBUTING.md`) | o processo dirigido a quem contribui, com o template de pull request e o anel de entrada |
| Texto da página de ajuda | chave `pageHelp` nos dicionários de tradução, um por idioma | o processo dirigido a quem lê, publicado dentro do produto |
| Atalho de edição | chave `editLink` no documento de configuração | liga, quando presente, o atalho para a origem editável da opinião |

### Texto da página de ajuda — chaves deste domínio

| Chave | Forma | Papel |
| --- | --- | --- |
| `pageHelp.headlinePrefix` | texto | prefixo do título da página, composto com o nome do radar |
| `pageHelp.paragraphs` | lista de `{ headline, values[] }` | as seções narrativas, na ordem em que são exibidas; cada `headline` é o título da seção e cada entrada de `values` é um parágrafo, com marcação sanitizada |
| `pageHelp.sourcecodeLink.description` | texto | frase que apresenta o convite à contribuição |
| `pageHelp.sourcecodeLink.href` | endereço | endereço do repositório público |
| `pageHelp.sourcecodeLink.name` | texto | rótulo exibido do link |

A mesma página exibe também as listas de descrição dos quadrantes e dos anéis e as frases que as
abrem; esse texto pertence à taxonomia do radar, que define os eixos.

### Atalho de edição

| Chave | Forma | Obrigatório | Papel |
| --- | --- | --- | --- |
| `editLink.radarLink` | endereço base | sim, quando o atalho existe | prefixo do endereço do documento editável |
| `editLink.title` | texto | não | rótulo do atalho; sem ele o rótulo é `Edit`, fixo e não traduzido |

Com a chave ausente, nenhuma das duas versões da página do item exibe o atalho.

## Restrições e validações

- **Nenhuma automação sustenta o processo.** Não há template de pull request injetado pela
  plataforma, lista de responsáveis por revisão, validação do acervo em tempo de build nem
  verificação de que a tecnologia nova entrou no anel de avaliação. Tudo repousa sobre a revisão
  humana.
- **As duas definições publicadas precisam concordar.** Divergência entre o guia de contribuição e a
  página de ajuda deixa contribuinte e leitor com regras diferentes sobre o mesmo processo.
- **O texto do processo existe em todos os idiomas do produto e precisa dizer o mesmo em todos.** A
  página de ajuda lê listas inteiras de objetos do dicionário do idioma ativo; a chave ausente em um
  idioma quebra a página naquele idioma. Como o idioma de recurso é o inglês, uma chave faltante cai
  no texto em inglês, e um item faltante *dentro* de uma lista existente simplesmente não é exibido,
  sem erro visível. Hoje o texto em espanhol da seção "como ele é criado" não traz o parágrafo da
  etapa de pesquisa do time de Staff Engineering, e o leitor em espanhol recebe a descrição do
  processo sem essa etapa.
- **O texto do processo é compilado junto com a aplicação.** Alterar o guia de contribuição é
  alterar um documento do repositório, de efeito imediato para quem o lê lá; alterar a página de
  ajuda só chega ao leitor com uma nova publicação do site.
- **Marcação fora da lista branca é descartada.** Imagem, tabela, título e qualquer atributo de
  estilo escritos no texto do processo desaparecem na sanitização.
- **O endereço do atalho de edição não é validado.** Configurar o atalho apontando para uma origem
  que não existe produz um link quebrado na página do item, sem aviso.
- **O repositório é público e licenciado sob Apache 2.0**, e o texto da licença declara cobrir o
  código que gera o radar, não os textos de opinião publicados nele.

## Integrações e dependências externas

- **GitHub** — hospeda o repositório público `github.com/db1group/db1-tech-radar` e fornece todo o
  maquinário do processo: fork, branch, pull request, revisão, incorporação e histórico. Não existe
  ferramenta editorial alternativa; sem a plataforma, o processo não tem onde acontecer nem onde
  registrar a decisão.

As precondições técnicas para que o domínio entregue comportamento completo estão em
[`references/technical-dependencies.md`](references/technical-dependencies.md).
