---
name: taxonomia-de-quadrantes-e-aneis
description: >
  Esta é a documentação autoritativa do domínio Taxonomia de Quadrantes e Anéis: os eixos de
  classificação do radar — slug, rótulo nos três idiomas, cor, posição e descrição de cada
  quadrante; ordem, cor e significado de cada anel de maturidade. Carregue ao criar, renomear ou
  remover quadrante ou anel, ao mexer em `config.json`, `quadrantsMap`, `rings` ou
  `showEmptyRings`, ao interpretar `adopt`, `trial`, `assess` e `hold`, e ao decidir em que
  quadrante uma tecnologia se encaixa.
metadata:
  author: clovis-cli
  type: domain-skill
---

# Taxonomia de Quadrantes e Anéis

> **Manutenção desta skill**
>
> Atualize este documento sempre que **qualquer regra descrita aqui** mudar. O critério não é
> *qual* regra — é a natureza da mudança: mudou o comportamento ou a decisão (outro quadrante,
> outro anel, outra cor, outra posição, outro significado de eixo) → atualize; refatoração
> técnica que preserva a taxonomia (renomear componente, reorganizar arquivo, trocar a
> biblioteca que desenha o gráfico) → não mexa. Quando esta skill disser X e o sistema fizer Y
> sem decisão registrada que resolva o conflito, não "conserte" nem a skill nem o código:
> escale para o humano.

## Visão geral do domínio

A taxonomia define os dois eixos pelos quais toda opinião do radar é classificada:

- **Quadrante** — o eixo temático, o *sobre o quê* da tecnologia (linguagem, método,
  plataforma, ferramenta);
- **Anel** — o eixo de maturidade, o *quanto a engenharia confia* naquela tecnologia hoje.

É o vocabulário que toda opinião precisa respeitar para existir no radar: um item sem um
quadrante e um anel declarados, ambos pertencentes à taxonomia, não é publicável. O domínio é a
raiz do modelo — não depende de nenhum outro e é consumido por todos: o acervo de opiniões
classifica por ele, o gráfico desenha por ele, as listagens agrupam por ele e o processo
editorial decide promoções dentro dele.

A taxonomia é **dado de configuração**, não código: ela vive em um documento de configuração do
radar (`config.json`), servido como arquivo estático e carregado pela aplicação antes de
qualquer tela. Os rótulos e as descrições que a pessoa lê vivem nos dicionários de tradução,
um por idioma (`pt`, `en`, `es`).

## Regras de negócio

A numeração abaixo é própria desta skill e serve apenas para referência interna.

### 1. Identidade por slug estável em inglês

Cada quadrante e cada anel é identificado por um slug em inglês, minúsculo, com hífen como
separador. O slug é a chave usada no dado, no agrupamento e na URL — a página de um quadrante é
o próprio slug e a página de um item é `<slug-do-quadrante>/<nome-do-item>`. Trocar um slug
desassocia todos os itens já classificados e quebra todo link publicado; renomear o **rótulo**
exibido não tem esse efeito, porque o rótulo vive na tradução.

### 2. Quatro quadrantes temáticos

| Slug | Posição | Cor | Cor do texto | pt | en | es |
| --- | --- | --- | --- | --- | --- | --- |
| `languages-and-frameworks` | 1 | `#cdcaeb` | `#444444` | Linguagens & Frameworks | Languages & Frameworks | Lenguajes y frameworks |
| `methods-and-patterns` | 2 | `#4867ff` | `white` | Métodos & Padrões | Methods & Patterns | Métodos y modelos |
| `platforms-and-operations` | 3 | `#ff2d5e` | `#444444` | Plataformas & Operações | Platforms & Operations | Plataformas y operaciones |
| `tools` | 4 | `#ffc000` | `white` | Ferramentas | Tools | Herramientas |

A **cor** do quadrante pinta o setor correspondente do gráfico e o ponto de cada item ali
classificado; a **cor do texto** é a usada sobre essa cor de fundo, para manter o contraste do
rótulo que acompanha o ponto.

### 3. Significado de cada quadrante

- **Linguagens & Frameworks** — linguagens e frameworks de desenvolvimento úteis para a
  implementação de software personalizado de todos os tipos.
- **Métodos & Padrões** — padrões são muito importantes e muitos deles duram mais que
  ferramentas ou frameworks; esta categoria determina **como** o software é desenvolvido.
- **Plataformas & Operações** — plataformas e serviços de infraestrutura. A categoria também
  comunica novidades sobre os serviços da própria DB1 que todas as equipes devem conhecer.
- **Ferramentas** — ferramentas de software, das pequenas auxiliares aos projetos maiores.

Quando não está totalmente claro a qual quadrante um item pertence, escolhe-se o mais adequado:
a classificação é um julgamento editorial, não uma regra mecânica.

### 4. A posição do quadrante é o seu canto no radar

A posição é um número de 1 a 4 e determina simultaneamente o setor do gráfico e o canto onde
fica o bloco de rótulo daquele quadrante:

| Posição | Canto |
| --- | --- |
| 1 | superior esquerdo |
| 2 | superior direito |
| 3 | inferior esquerdo |
| 4 | inferior direito |

O bloco de rótulo apresenta o quadrante como "quadrante *N*", com a posição visível para o
leitor, seguida do rótulo traduzido e da descrição do quadrante.

### 5. Quatro anéis de maturidade, ordenados do centro para a borda

A lista de anéis é **ordenada**, e a ordem é o próprio significado: o primeiro anel é o mais
interno do gráfico e o último é o mais externo. Quanto mais perto do centro, maior a confiança
da engenharia na tecnologia.

| Ordem | Slug | Cor do selo | pt | en | es |
| --- | --- | --- | --- | --- | --- |
| 1 (mais interno) | `adopt` | verde `#5cb449` | adote | adopt | adoptar |
| 2 | `trial` | laranja `#faa03d` | experimente | trial | ensayo |
| 3 | `assess` | azul `#40a7d1` | avalie | assess | evalúe |
| 4 (mais externo) | `hold` | marinho `#688190` | evite | hold | evitar |

A cor do anel pinta o **selo** que acompanha o item nas listagens e no filtro por anel. Ela é
independente da cor do quadrante, que pinta o setor e o ponto.

### 6. Significado de cada anel

- **adote** — tecnologia claramente recomendada. Foi usada por um longo período em muitas
  equipes e provou ser estável e útil.
- **experimente** — usada com sucesso; a recomendação é olhar de perto. O objetivo dos itens
  aqui é serem examinados com a intenção de levá-los ao nível de adoção.
- **avalie** — experimentada e considerada promissora. A recomendação é olhar quando surgir uma
  necessidade específica daquela tecnologia no projeto.
- **evite** — categoria especial: ao contrário das outras, recomenda-se **parar** de fazer ou
  usar. Não significa que a tecnologia seja ruim, e muitas vezes é razoável mantê-la em
  projetos existentes; um item vem para cá quando já existem opções ou alternativas melhores.

### 7. Toda opinião declara exatamente um quadrante e um anel

A classificação é o par quadrante + anel, e esse par é o endereço do item no radar: o cruzamento
entre o setor do quadrante e a faixa do anel. O par também define o agrupamento de todas as
listagens — primeiro por quadrante, depois por anel, na ordem declarada na taxonomia.

### 8. O rótulo e a descrição exibidos vêm do dicionário de tradução

Cada quadrante e cada anel tem rótulo e descrição nos três idiomas, e os dicionários de tradução
são o único lugar onde esse texto vive. Toda tela resolve o rótulo pelo dicionário do idioma
ativo — inclusive a página de um item aberta em tela estreita, que segue a mesma regra das
demais. O slug nunca é exibido como rótulo e o nome em inglês guardado na configuração é chave
de dado, não texto de interface.

Acrescentar um eixo sem acrescentar a chave correspondente nos três dicionários faz a interface
exibir a chave crua.

O dicionário de anéis carrega, além dos quatro anéis, um rótulo para a opção "todos"
(`todos` / `all` / `todos`), usado pelos filtros por anel como seleção neutra — ele não é um
anel da taxonomia e nenhum item pode ser classificado nele.

### 9. `hold` existe na taxonomia e hoje não classifica nenhum item

O anel `hold` está declarado, com rótulo e descrição nos três idiomas, e nenhum item do acervo
atual o usa. A taxonomia continua declarando-o porque ele é a única forma de comunicar "pare de
usar" — a ausência de itens é um retrato do acervo, não um sinal de que o anel deva sair.

### 10. Anel vazio não aparece nas listagens

Um interruptor da taxonomia (`showEmptyRings`) decide se um anel sem itens aparece nas
listagens por quadrante. Ele está **desligado**: a listagem de um quadrante mostra apenas os
anéis que têm pelo menos um item. Ligado, cada quadrante passaria a exibir todos os anéis,
inclusive os vazios.

O interruptor governa somente as listagens. O gráfico desenha o arco e o rótulo de **todos** os
anéis da taxonomia, tenham eles itens ou não.

### 11. A conformidade do item com a taxonomia é garantida por revisão humana

Nada valida, em tempo de build, que o quadrante e o anel declarados por um item existam na
taxonomia. O controle é a revisão do pull request que altera o acervo. As consequências de uma
violação diferem por eixo:

- **quadrante inexistente** — o item é omitido do gráfico silenciosamente, sem erro visível; ele
  continua aparecendo nas listagens alfabéticas;
- **anel inexistente** — o desenho do gráfico não encontra a faixa correspondente e a tela do
  radar deixa de renderizar.

Item sem quadrante ou sem anel declarado também é omitido do gráfico.

## Fluxos e ciclo de vida

### Acrescentar um quadrante

1. Escolher o slug em inglês, estável e válido como segmento de URL.
2. Declará-lo nos dois mapas da taxonomia: o de nomes e o de atributos (ver *Entidades e dados*).
3. Atribuir a posição (o canto do radar), a cor do setor e a cor do texto.
4. Acrescentar o rótulo e a descrição nos três dicionários de idioma, mantendo a ordem das
   listas de descrição igual à ordem das posições.
5. Acrescentar a entrada de geometria correspondente, para que o novo setor tenha onde ser
   desenhado.
6. Publicar com um novo identificador de build, para que a configuração alterada chegue a quem
   já visitou o site.

A geometria publicada hoje pressupõe quatro quadrantes em posições de 1 a 4; um quinto
quadrante exige, antes, tornar esse número configurável.

### Acrescentar um anel

1. Escolher o slug e **a posição na lista ordenada** — ela é a distância do centro, e inserir no
   meio desloca todos os anéis seguintes para fora.
2. Acrescentar a entrada de geometria do anel (raio e espessura do arco), mantendo os raios
   crescentes do centro para a borda.
3. Acrescentar o rótulo e a descrição nos três dicionários de idioma.
4. Definir a cor do selo do anel no estilo correspondente ao slug; sem ela o selo aparece sem
   cor de fundo.
5. Publicar com um novo identificador de build.

### Remover ou renomear um eixo

Remover um quadrante ou um anel exige reclassificar antes todos os itens que o usam — itens
órfãos deixam de aparecer no gráfico ou impedem o radar de renderizar, conforme a regra 11.
Renomear o **rótulo** é alteração de tradução e não afeta o dado. Renomear o **slug** é
migração: ele é chave do dado e endereço público.

### Mudança de anel de um item

Mover um item de anel é alteração do acervo, não da taxonomia: nenhum arquivo de configuração
muda. A taxonomia apenas garante que o anel de destino exista e que o seu significado seja o
que a promoção pretende comunicar.

## Entidades e dados

A taxonomia é um documento de configuração estático, carregado antes de qualquer tela. A
aplicação não renderiza nada sem ele. As chaves do domínio:

| Chave | Forma | Papel |
| --- | --- | --- |
| `quadrants` | mapa `slug → nome` | conjunto autoritativo de quadrantes; a ordem de declaração é a ordem das listagens por quadrante, e a existência do slug aqui é o que faz a página daquele quadrante existir |
| `rings` | lista ordenada de slugs | conjunto autoritativo de anéis; a ordem é a distância do centro |
| `showEmptyRings` | booleano | exibe ou oculta anel sem itens nas listagens |
| `quadrantsMap` | mapa `slug → atributos` | atributos visuais e de posicionamento de cada quadrante: `colour`, `txtColour` e `position` |

O mesmo documento de configuração carrega chaves de outros domínios (geometria do gráfico,
conteúdo da página inicial, formato de data, atalho de edição); elas não pertencem à taxonomia.

Nos dicionários de tradução, um por idioma, o domínio ocupa:

| Chave | Forma | Papel |
| --- | --- | --- |
| `quadrants.<slug>` | texto | rótulo do quadrante naquele idioma |
| `rings.<slug>` | texto | rótulo do anel naquele idioma, mais a entrada `all` do seletor "todos" |
| `pageHelp.quadrants` | lista de `{ name, description }` | nome e descrição longa de cada quadrante, **ordenada pela posição do quadrante** |
| `pageHelp.rings` | lista de `{ name, description }` | nome e descrição longa de cada anel, **ordenada do centro para a borda** |
| `pageHelp.quadrantsPreDescription` e `pageHelp.ringsPreDescription` | texto | frase que abre cada uma das duas listas na página de ajuda, escrita no idioma do dicionário |

A descrição de cada eixo vive apenas aqui: a configuração guarda a identidade e os atributos
visuais, os dicionários guardam todo o texto que o leitor vê.

As duas listas de descrição são posicionais: o item de índice *N* descreve o eixo de posição
*N*. Uma lista fora de ordem faz a interface atribuir a descrição de um eixo a outro, sem erro
visível. As descrições longas são o texto público que explica ao leitor o significado de cada
eixo, e aceitam marcação HTML simples, sanitizada antes de ser exibida.

## Restrições e validações

- **Os dois mapas de quadrante declaram o mesmo conjunto de slugs.** Um slug presente só no mapa
  de nomes tem página própria mas não é desenhado; presente só no mapa de atributos, é desenhado
  mas não tem página nem listagem.
- **Posições de 1 a 4, sem repetição.** Duas posições iguais sobrepõem rótulos no mesmo canto.
- **Uma entrada de geometria por anel**, com raios crescentes. Menos entradas do que anéis
  impede o gráfico de renderizar.
- **O slug é segmento de URL**: sem barra, sem espaço e sem acento. A barra separa quadrante e
  nome do item no endereço da página de um item.
- **O número de quadrantes é quatro.** A geometria publicada hoje assume quadrantes nas posições
  1 a 4. Tornar esse número configurável é alteração de arquitetura e exige que o desenho
  permaneça idêntico ao publicado hoje quando houver quatro quadrantes.
- **Os três idiomas são obrigatórios.** Um eixo sem rótulo em um dos idiomas aparece com a chave
  crua naquele idioma; a lista de descrições faltante quebra a página de ajuda naquele idioma.
- **Não há validação automática.** A conformidade entre acervo e taxonomia depende da revisão
  humana do pull request (regra 11).

## Integrações e dependências externas

Nenhum serviço externo e nenhuma biblioteca de terceiros participa da definição da taxonomia:
ela é dado de configuração estático, consumido por todos os demais domínios do radar.

As precondições técnicas para que o domínio entregue comportamento completo estão em
[`references/technical-dependencies.md`](references/technical-dependencies.md).
