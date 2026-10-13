---
name: identidade-institucional-db1
description: >
  Esta é a documentação autoritativa do domínio Identidade Institucional DB1: como o radar se
  apresenta como peça institucional do DB1 Global Software — marca e logotipo, nome do produto na
  aba do navegador e na pré-visualização de link, nota institucional do rodapé, canais oficiais,
  link de crédito, tipografia e paleta. Carregue ao mexer em rodapé, cabeçalho, logotipo, marca,
  favicon, fontes, redes sociais, título da página ou metadados de compartilhamento.
metadata:
  author: clovis-cli
  type: domain-skill
---

# Identidade Institucional DB1

> **Manutenção desta skill**
>
> Atualize este documento sempre que **qualquer regra descrita aqui** mudar. O critério não é *qual*
> regra — é a natureza da mudança: mudou o comportamento ou a decisão (outro canal oficial, outro
> destino do link institucional, outra regra de exibição do rodapé, outro nome de produto, outra
> tipografia ou paleta) → atualize. Refatoração técnica que preserva a regra (renomear um
> componente, reorganizar os estilos, trocar a origem dos ícones) → não mexa: a skill descreve a
> decisão, não a estrutura do código. Quando esta skill disser X e o sistema fizer Y sem decisão
> registrada que resolva o conflito, não "conserte" nem a skill nem o código: escale para o humano.

## Visão geral do domínio

O radar é um produto público assinado pelo DB1 Global Software. Este domínio responde por essa
assinatura: quem publica o radar, como a empresa é apresentada a quem lê e por onde esse leitor
encontra a organização fora do site.

Ele atravessa todas as telas sem pertencer a nenhuma: a marca abre o cabeçalho, a nota
institucional e os canais oficiais fecham o rodapé, e o nome do produto identifica cada aba do
navegador e cada pré-visualização de link compartilhado. Nada aqui depende do acervo de opiniões,
da taxonomia ou da navegação — a identidade institucional continua correta mesmo em um radar vazio.

A característica que organiza todas as regras abaixo: **a identidade é dado publicado, nunca
código**. Canais oficiais e destino do link institucional vivem em um arquivo de dados; textos
vivem no conjunto de traduções; logotipo, ícone do site e tipografia vivem como arquivos
publicados. Mudar a identidade é editar dado — acrescentar um canal, trocar a nota, substituir o
logotipo — e não alterar comportamento.

## Regras de negócio

A numeração abaixo é própria desta skill e serve apenas para referência interna.

### 1. A marca abre o cabeçalho de todas as telas

Toda tela do radar começa com o bloco de marca: o logotipo do DB1 à esquerda e, à direita, o
conteúdo daquela tela de cabeçalho. O logotipo é sempre um link para a página inicial do radar,
em qualquer tela.

O bloco de marca é o mesmo elemento reaproveitado no fecho do rodapé, com o logotipo acompanhado
da nota institucional em vez da navegação.

### 2. O logotipo encolhe fora da página inicial

Na página inicial o logotipo aparece em tamanho cheio. Em qualquer outra tela ele é reduzido a
pouco mais da metade do tamanho, deslocado para a esquerda, e ganha ao lado o nome do radar no
idioma ativo, em meio-tom. Passar o mouse sobre o logotipo reduzido revela um indicador de volta e
desloca o conjunto de volta à posição plena, reforçando que ele leva à página inicial.

O texto alternativo da imagem do logotipo é sempre o nome do radar no idioma ativo.

### 3. O rodapé institucional tem dois blocos

O rodapé é a assinatura da empresa e é composto, de cima para baixo, por:

1. **Bloco de marca** — logotipo do DB1 ao lado da nota institucional sobre a empresa.
2. **Bloco de fecho** — os canais oficiais, precedidos de um rótulo de convite, e o link
   institucional.

Em telas estreitas o bloco de marca passa a empilhar logotipo e nota, centralizados, e o bloco de
fecho se empilha da mesma forma.

### 4. Cada parte do fecho aparece só quando seu dado existe

O bloco de canais oficiais — rótulo incluído — só é renderizado quando a lista de canais existe no
arquivo de links institucionais. O link institucional só é renderizado quando o endereço existe no
mesmo arquivo. As duas condições são independentes: um dos dois pode aparecer sem o outro.

A ausência do arquivo inteiro **não impede o radar de abrir**: todas as demais telas funcionam, e o
que se perde é a nota institucional do rodapé e os canais oficiais. Essa tolerância é deliberada e
distingue este domínio dos dados sem os quais nenhuma página renderiza.

### 5. A nota institucional é HTML sanitizado com lista branca restrita

A nota institucional é texto traduzido que pode conter marcação, e é renderizada como HTML depois
de passar por sanitização. A lista branca é fechada:

- tags permitidas: `b`, `i`, `em`, `strong`, `a`, `ul`, `ol`, `li`;
- atributos permitidos: `href` e `target`, apenas em `a`.

Qualquer outra tag ou atributo é removido em silêncio, sem erro e sem aviso: a nota aparece com o
excedente descartado. Escrever a nota com marcação fora dessa lista é perder a formatação sem que
nada o sinalize.

### 6. Os canais oficiais são uma lista ordenada de pares

Cada canal oficial é um par de **endereço** e **nome do ícone**. A ordem das entradas no arquivo é
a ordem de exibição no rodapé — não há reordenação por nome, por rede ou por relevância.

Todo canal abre em uma nova aba, com a navegação de origem protegida contra acesso pela página de
destino. O nome do ícone também é o rótulo acessível do link: é o que um leitor de tela anuncia,
já que o link não tem texto visível.

### 7. O vocabulário de ícones é fechado, com queda para um ícone genérico

Os nomes de ícone reconhecidos são `facebook`, `twitter`, `linkedIn`, `xing`, `instagram`,
`youtube` e `github`. A grafia importa: `linkedIn` tem a segunda maiúscula.

Um nome fora dessa lista **não quebra a tela** — o canal é exibido com um ícone genérico de link
externo, e o endereço continua funcionando. Acrescentar uma rede com identidade visual própria
exige ampliar esse vocabulário; até lá, ela entra com o ícone genérico.

### 8. O link institucional credita o radar

O fecho do rodapé publica um único link institucional, com rótulo traduzido e destino vindo do
arquivo de links institucionais, aberto em nova aba.

Hoje esse link credita o produto e aponta para o repositório público do radar: o rótulo é
"Criado usando o Radar DB1" em português, "Created using DB1 Radar" em inglês e "Creado con el
radar DB1" em espanhol. O campo que guarda o destino chama-se `legalInformationLink` — o nome é
herança do material de origem do projeto e não descreve o uso atual do espaço.

### 9. O rodapé sai da leitura de uma tecnologia em tela larga

Na página de uma tecnologia, com a janela a partir de 1200 pixels de largura, o rodapé é tornado
transparente para que a leitura ocupe a tela. Abaixo desse limite ele aparece normalmente, como em
qualquer outra tela.

Duas consequências valem como regra:

- o rodapé continua ocupando seu espaço e permanece alcançável pela navegação por teclado enquanto
  invisível — ele é ocultado visualmente, não removido da página;
- nessa mesma tela larga, o bloco de fecho — canais oficiais e link institucional — é republicado
  dentro da coluna lateral da tecnologia, empilhado e alinhado à esquerda. A assinatura
  institucional nunca some por completo de uma tela.

A decisão de ocultar compara o endereço aberto com a lista de tecnologias em escopo naquele
momento. Um recorte ativo que exclua justamente a tecnologia aberta deixa o rodapé visível.

### 10. O nome do produto chega ao leitor por dois canais distintos

- **Metadado de compilação, em um idioma só.** O documento publicado carrega um nome fixo de
  produto no título, na descrição e no título de compartilhamento. É esse valor que buscadores,
  aplicativos de mensagem e pré-visualizações de link leem, porque a página é montada no navegador
  e nenhum desses leitores executa a aplicação. O valor é único para todos os endereços e para
  todos os idiomas.
- **Título da aba, traduzido, em tempo de execução.** Assim que a tela monta, o título da aba é
  reescrito como `<título da tela> | <nome do radar no idioma ativo>`. A página inicial é a tela do
  próprio produto e por isso escapa da composição: sua aba exibe o nome do radar uma única vez.

Disso decorre que o nome exibido na aba acompanha o idioma do leitor, enquanto o nome visto por
quem compartilha o link não acompanha. Tratar a pré-visualização de link como traduzida ou
específica por tecnologia é erro.

### 11. O nome do radar é texto traduzido, não constante de produto

O nome do radar é "Radar Tecnológico" em português e espanhol e "Tech Radar" em inglês. Ele aparece
em quatro lugares: no título da aba, no texto alternativo do logotipo, no rótulo ao lado do
logotipo reduzido e no título principal da página inicial.

### 12. Endereço institucional publicado é endereço público

Logotipo, ícone do site, folha de tipografia e arquivos de fonte são publicados junto com a
aplicação e ganham endereço público próprio. Qualquer arquivo colocado no diretório de arquivos
estáticos passa a ser baixável por qualquer pessoa, usado ou não por alguma tela.

## Fluxos e ciclo de vida

### Incluir ou remover um canal oficial

1. Editar a lista de canais no arquivo de links institucionais, na posição em que o canal deve
   aparecer no rodapé.
2. Conferir se o nome do ícone pertence ao vocabulário fechado (regra 7); se não pertencer,
   decidir entre ampliar o vocabulário ou aceitar o ícone genérico.
3. Verificar o rodapé nos três idiomas e em tela estreita.
4. Publicar pelo caminho de publicação do projeto.

### Atualizar a nota institucional

1. Alterar a chave da nota nos **três** idiomas na mesma edição — a nota é texto traduzido, e um
   idioma esquecido deixa o rodapé em outra língua para aquele leitor.
2. Manter a marcação dentro da lista branca (regra 5).
3. Verificar o rodapé em cada idioma.

### Trocar o logotipo ou a tipografia

1. Substituir o arquivo publicado mantendo o mesmo endereço, ou ajustar as referências em todos os
   pontos que o consomem: cabeçalho, rodapé e os metadados do documento publicado.
2. Para tipografia, ajustar a folha de fontes publicada: ela declara uma família única com dois
   pesos, e os estilos da aplicação referenciam essa família pelo apelido declarado ali.
3. Conferir cabeçalho, rodapé e página inicial, em tela larga e estreita.

## Entidades e dados

### Arquivo de links institucionais (`/messages.json`)

| Campo | Tipo | Obrigatório | Papel |
| --- | --- | --- | --- |
| `legalInformationLink` | endereço | não | destino do link institucional do rodapé |
| `socialLinks` | lista | não | canais oficiais, na ordem de exibição |
| `socialLinks[].href` | endereço | sim | destino do canal |
| `socialLinks[].iconName` | texto | sim | identificador do ícone e rótulo acessível do link |

Conteúdo publicado hoje:

| Canal | Endereço | `iconName` |
| --- | --- | --- |
| Facebook | `https://www.facebook.com/DB1Global/` | `facebook` |
| Twitter | `https://twitter.com/db1global` | `twitter` |
| LinkedIn | `https://www.linkedin.com/company/db1globalsoftware/` | `linkedIn` |
| Instagram | `https://www.instagram.com/db1global/` | `instagram` |
| YouTube | `https://www.youtube.com/channel/UCrwkPFAPgYRPziOaAzWlrqA` | `youtube` |
| GitHub | `https://github.com/db1group` | `github` |

O link institucional aponta para `https://github.com/db1group/db1-tech-radar`.

### Textos institucionais traduzidos

| Chave | Papel | Português | Inglês | Espanhol |
| --- | --- | --- | --- | --- |
| `footerFootnote` | nota institucional do rodapé, renderizada como HTML sanitizado | texto sobre a DB1 Global Software, sua experiência de mercado e a posição dentro do Grupo DB1 | mesmo conteúdo | mesmo conteúdo |
| `legalInformationLabel` | rótulo do link institucional | `Criado usando o Radar DB1` | `Created using DB1 Radar` | `Creado con el radar DB1` |
| `socialLinksLabel` | convite que precede os canais oficiais | `Siga-nos:` | `Follow us:` | `Síguenos:` |
| `radarName` | nome do produto | `Radar Tecnológico` | `Tech Radar` | `Radar Tecnológico` |

A nota institucional, em qualquer idioma, apresenta a DB1 Global Software como empresa de
desenvolvimento de software com vinte anos de experiência, integrante do Grupo DB1 — conglomerado
de tecnologia focado na transformação digital de empresas B2B, cuja marca se concentra em garantir
o crescimento futuro atendendo às necessidades atuais dos clientes.

### Endereços da identidade visual

| Endereço | Papel |
| --- | --- |
| `/logo/db1-logo.png` | logotipo do DB1, usado no cabeçalho, no rodapé e como ícone de aplicativo e imagem de compartilhamento do documento publicado |
| `/favicon.ico` | ícone do site na aba do navegador |
| `/fonts.css` | folha que declara a família tipográfica e associa cada peso ao seu arquivo |
| `/fonts/clanot-news.otf` | tipografia ClanOT, peso normal |
| `/fonts/clanot-thin.otf` | tipografia ClanOT, peso leve |
| `/logo.svg`, `/logo/logo-dgs.webp` | logotipos alternativos publicados, sem uso em nenhuma tela |
| `/logo/10 TONS.mp4`, `/logo/COROA 1.mp4` | peças de marca em vídeo publicadas, sem uso em nenhuma tela |

### Tipografia

Uma única família tipográfica atende o produto inteiro, declarada sob o apelido `DIN` e servida
pelos dois arquivos ClanOT: o peso normal e o peso leve (`300`). O corpo do site usa essa família
em 14 pixels, com altura de linha 1,5.

### Paleta institucional

| Nome | Valor | Papel |
| --- | --- | --- |
| `--color-brand` | `#f59134` | cor de marca, aplicada a destaques de interação |
| `--color-dark` | `#0a0a0a` | fundo do site inteiro |
| `--color-white` | `#fff` | texto sobre o fundo escuro e disco de fundo dos ícones de canal |
| `--color-gray-normal` | `#7f858a` | nota institucional, fecho do rodapé e a linha que o separa do conteúdo |
| `--color-gray-dark` | `#475157` | glifo dos ícones de canal, sobre o disco branco |

Cada ícone de canal é um glifo escuro centralizado em um disco branco de 30 pixels.

## Restrições e validações

- **Nenhuma validação do dado institucional.** Endereço inválido, canal duplicado, nome de ícone
  desconhecido e lista vazia passam sem erro: o radar publica o que estiver no arquivo. A revisão
  humana da alteração é o único controle.
- **Falha ao carregar o arquivo de links institucionais é silenciosa.** O radar abre sem o rodapé
  institucional e sem os canais, e a falha fica registrada apenas no console do navegador.
- **Nenhum texto institucional tem posição de reserva.** Chave de tradução ausente em um idioma faz
  a interface exibir o identificador cru da chave naquele idioma, não o texto de outro idioma.
- **A nota institucional não aceita marcação fora da lista branca** (regra 5), e a remoção é
  silenciosa.
- **O nome de produto dos metadados do documento é único.** Não há variação por idioma nem por
  endereço; todo compartilhamento de link exibe o mesmo nome, a mesma descrição e a mesma imagem.
- **A identidade visual não tem variação por tema.** Existe um único fundo escuro, sem modo claro
  nem alternativa de alto contraste.
- **Tudo que é publicado é público.** Nenhum arquivo restrito entra no diretório de arquivos
  estáticos: ele ganha endereço acessível a qualquer pessoa (regra 12).

## Variáveis de ambiente do domínio

| Variável | Papel no domínio |
| --- | --- |
| `REACT_APP_RADAR_NAME` | nome institucional do produto gravado no documento publicado — título da aba antes de a aplicação montar, descrição e título de compartilhamento. Hoje identifica o radar junto da empresa que o assina. Ausente, o documento publica o marcador cru no lugar do nome. |

Variáveis de infraestrutura e de publicação não pertencem a este domínio.

## Integrações e dependências externas

- **Canais oficiais do DB1** — Facebook, Twitter, LinkedIn, Instagram, YouTube e GitHub. São
  destinos externos: o radar apenas os endereça, não lê nem publica nada neles.
- **Repositório público do radar no GitHub** — destino do link institucional do rodapé.

As precondições técnicas deste domínio — o que precisa existir para ele entregar comportamento
completo e o que deixa de funcionar na ausência de cada uma — estão em
[`references/technical-dependencies.md`](references/technical-dependencies.md).

## Débito técnico conhecido

### Ativos de identidade publicados sem consumo

Quatro arquivos de identidade visual são mantidos publicados sem que nenhuma tela os consuma: os
dois logotipos alternativos e as duas peças de marca em vídeo listados entre os endereços da
identidade visual. Os vídeos respondem por cerca de 1,3 MB desse conjunto.

A permanência é deliberada, e o custo aceito tem duas faces. Cada publicação os espelha de novo no
destino, somando peso a um produto que de resto carrega apenas um logotipo, um ícone de site e duas
fontes. E cada um deles tem endereço público próprio (regra 12): uma peça de marca que saia de
circulação continua baixável por qualquer pessoa enquanto estiver ali, sem que nada no site a
apresente.

O conjunto fica maior que o que o produto serve, e a estrutura do diretório de arquivos estáticos
não distingue um do outro — a lista de endereços da identidade visual desta skill é o único lugar
que registra quais arquivos sustentam uma tela e quais estão publicados sem uso.
