---
name: publicacao-e-distribuicao-do-radar
description: >
  Esta é a documentação autoritativa do domínio Publicação e Distribuição do Radar: como uma
  alteração aprovada vira o site público `techradar.db1.com.br` — compilação, sincronismo com o
  bucket S3, invalidação do cache da distribuição CloudFront, raiz de publicação e identificador
  de build. Carregue ao mexer em deploy, pipeline, publicação, bucket, CDN, cache, `PUBLIC_URL` ou
  `REACT_APP_BUILDHASH`, e ao investigar alteração que não aparece no site, URL profunda quebrada
  ou tela em branco em produção.
metadata:
  author: clovis-cli
  type: domain-skill
---

# Publicação e Distribuição do Radar

> **Manutenção desta skill**
>
> Atualize este documento sempre que **qualquer regra descrita aqui** mudar. O critério não é *qual*
> regra — é a natureza da mudança: mudou o comportamento ou a decisão (outro gatilho de publicação,
> outro destino, outra etapa no caminho, outra forma de invalidar cache, outra raiz de publicação)
> → atualize. Refatoração técnica que preserva a regra (renomear um passo do fluxo, trocar a ação
> que executa um comando, reorganizar a ordem de passos equivalentes) → não mexa: a skill descreve
> a decisão, não a estrutura do fluxo. Quando esta skill disser X e o sistema fizer Y sem decisão
> registrada que resolva o conflito, não "conserte" nem a skill nem o código: escale para o humano.

## Visão geral do domínio

Este domínio responde por uma única pergunta: como o conteúdo aprovado no repositório chega ao
leitor em `techradar.db1.com.br`. Ele não decide **o que** é publicado — isso é do processo
editorial e do acervo de opiniões — e sim **como** e **quando** aquilo que foi aprovado vira site
no ar.

O radar é um site estático: não há servidor de aplicação, banco nem autenticação em produção. A
publicação entrega um conjunto de arquivos a uma hospedagem de objetos estáticos (bucket S3) com
uma rede de distribuição de conteúdo (CloudFront) à frente, e todo o comportamento do produto
acontece no navegador de quem acessa.

A consequência que atravessa todas as regras abaixo: **entre a aprovação do conteúdo e o leitor há
três camadas de armazenamento** — o destino estático, o cache da distribuição e o cache do
navegador. Uma publicação só é efetiva quando as três carregam a versão nova. A maior parte dos
problemas deste domínio é uma dessas camadas parada na versão anterior, e o sintoma é sempre o
mesmo: conteúdo correto no repositório, conteúdo antigo na tela.

## Regras de negócio

A numeração abaixo é própria desta skill e serve apenas para referência interna.

### 1. Integrar na linha principal é publicar

A publicação é disparada pela integração de uma alteração na linha principal do repositório. Não
existe passo manual de liberação, ambiente intermediário de homologação, janela de publicação nem
aprovação adicional depois da integração: o que entra na linha principal vai ao ar na sequência.

Alteração em qualquer outra branch não publica nada. A decisão de publicar é, portanto, a mesma
decisão de aceitar a alteração — a revisão humana que precede a integração é o último ponto de
controle antes do site público.

### 2. O caminho de publicação é único e tem cinco etapas

Toda publicação executa a mesma sequência, sem variação por tipo de alteração:

1. **Obter o repositório** na versão integrada.
2. **Instalar as dependências com o lockfile congelado** — a publicação usa exatamente as versões
   registradas; divergência entre lockfile e manifesto interrompe tudo aqui.
3. **Compilar o pacote de produção** — gera os arquivos finais do site a partir do código e dos
   arquivos estáticos.
4. **Obter credencial temporária na AWS por identidade federada** — o fluxo assume um papel de
   publicação; nenhuma chave de acesso permanente vive no repositório.
5. **Sincronizar o pacote com o bucket e invalidar o cache da distribuição.**

Qualquer etapa que falhe interrompe a publicação: o site continua servindo a versão anterior,
íntegra. Não há publicação parcial do pacote — o sincronismo é o primeiro momento em que o destino
muda.

### 3. O que vai ao ar é o pacote compilado somado aos arquivos estáticos

O conteúdo publicado é o resultado da compilação **mais** o conteúdo do diretório de arquivos
estáticos, copiado para a raiz do pacote durante a compilação.

Os três arquivos de dados do produto — o acervo de opiniões, a configuração da taxonomia e do
gráfico, e os links institucionais — chegam ao navegador como **arquivos baixados em tempo de
execução**, publicados lado a lado com a aplicação. Eles não são embutidos no pacote compilado.

Duas consequências valem como regra:

- alterar conteúdo é alterar um arquivo publicado, e não recompilar a aplicação por causa do
  conteúdo em si — mas a publicação continua passando pela compilação inteira, porque é ela que
  monta o pacote;
- esses arquivos são endereços públicos do site: qualquer pessoa pode baixá-los diretamente.

### 4. O destino é espelho exato do pacote

O sincronismo apaga do destino tudo o que não existe no pacote recém-compilado. O bucket é um
espelho, não um acúmulo de publicações.

Arquivo colocado à mão no destino desaparece na publicação seguinte. Arquivo removido do
repositório desaparece do site na primeira publicação posterior à remoção — inclusive páginas e
recursos que estavam no ar há anos. Não existe versionamento de publicações no destino: a única
forma de voltar atrás é publicar novamente a partir do repositório.

### 5. A publicação só termina com a invalidação do cache da distribuição

Há uma rede de distribuição de conteúdo à frente do bucket, e é ela que responde ao leitor. A
publicação se encerra invalidando o cache de todos os caminhos da distribuição.

Sincronizar o bucket sem invalidar o cache entrega uma publicação invisível: os arquivos estão no
destino, e o site continua servindo a versão anterior até o cache expirar por conta própria. Esta é
a falha mais traiçoeira do domínio, porque todas as etapas anteriores terminam com sucesso.

### 6. Conteúdo novo exige um identificador de build novo

Os três arquivos de dados são buscados pelo navegador com o identificador de build na querystring.
É ele que distingue uma busca da outra para o cache do navegador.

Publicar conteúdo novo **sem** alterar o identificador deixa quem já visitou o site lendo a cópia
antiga guardada no próprio navegador, mesmo com o destino atualizado e o cache da distribuição
invalidado. O identificador é mantido à mão, junto com as demais variáveis de build versionadas:
nada o gera e nada o incrementa automaticamente.

Toda alteração nos três arquivos de dados leva, na mesma publicação, um identificador de build
diferente do que está no ar.

### 7. A raiz de publicação é fixada na compilação

O site é publicado na raiz do domínio público. Esse valor é lido em tempo de compilação e alimenta
duas coisas ao mesmo tempo: o prefixo de todas as rotas do navegador e o endereço dos três arquivos
de dados.

Divergência entre a raiz usada na compilação e o caminho real de publicação quebra o carregamento
dos dados. O sintoma é uma **tela em branco sem mensagem de erro**: a aplicação não renderiza nada
enquanto não tiver o acervo e a configuração, e a falha de carga é registrada apenas no console do
navegador. Publicar em um subcaminho exige recompilar com a raiz correspondente.

### 8. Toda URL do site é servida pelo mesmo documento inicial

O destino publica **um único documento de página**; não existe um arquivo por endereço. Quem
resolve o endereço pedido em uma tela é a aplicação, no navegador.

Para isso, a hospedagem precisa devolver o documento inicial para qualquer caminho solicitado,
inclusive os que não correspondem a nenhum objeto no destino. Sem essa configuração, só a raiz
abre: todo endereço profundo — a página de um quadrante, a página de um item compartilhada por
link, um endereço colado direto na barra do navegador — devolve o erro da hospedagem em vez do
site.

### 9. O site não publica mapa do site nem documento próprio por tecnologia

Cada tecnologia tem endereço público, mas não tem documento próprio no destino: o conteúdo da
página é montado no navegador a partir do acervo baixado. O site também não publica um mapa do site.

Isso define o que o produto entrega hoje a buscadores e a pré-visualizações de link: um único
documento inicial, com os mesmos metadados para todos os endereços. Tratar indexação por tecnologia
ou pré-visualização de link por item como comportamento existente é erro — é funcionalidade a
construir, com mudança no caminho de publicação.

### 10. A compilação é a única barreira automática antes do ar

O caminho de publicação instala e compila; ele não roda testes, não roda verificação de estilo e
não valida o conteúdo do acervo contra a taxonomia.

- Erro de compilação ou de tipo interrompe a publicação.
- Item do acervo com classificação inexistente, corpo de opinião faltando ou marcação malformada
  **passa** pelo caminho inteiro e chega ao ar.

A qualidade do conteúdo é responsabilidade da revisão humana que antecede a integração. Nenhuma
etapa automática a substitui.

### 11. Tudo que é publicado é público, inclusive as variáveis de build

O destino serve conteúdo aberto na internet. Os valores das variáveis de build são versionados no
repositório e entram no pacote entregue ao navegador: eles são legíveis por qualquer pessoa que
acesse o site.

Disso decorrem duas proibições permanentes: nenhum segredo, credencial ou dado sigiloso entra nas
variáveis de build, e nenhum arquivo que não deva ser público entra no diretório de arquivos
estáticos — tudo o que está lá vai para o destino e ganha endereço público. O acesso de escrita ao
destino é obtido em tempo de execução do fluxo, por identidade federada, e nunca guardado no
repositório.

### 12. Existe uma só rota de publicação

O repositório carrega artefatos de rotas de publicação abandonadas — definição de imagem de
contêiner e configuração de hospedagem alternativa. Nenhum deles participa de qualquer publicação:
ao encontrá-los, trate-os como material a remover, nunca como alternativa de publicação disponível.

Mudar a forma de publicar — outro destino, outra distribuição, outra hospedagem, geração de
documentos por endereço — é decisão de arquitetura e exige registro próprio da decisão antes da
mudança.

## Fluxos e ciclo de vida

### Publicar uma alteração de conteúdo do acervo

1. Alterar os arquivos de dados no repositório, pelo processo editorial.
2. Atualizar o identificador de build na mesma alteração.
3. Integrar na linha principal.
4. Acompanhar o fluxo até o fim: instalação, compilação, credencial, sincronismo e invalidação.
5. Conferir no site publicado, em uma sessão que já tenha visitado o radar antes — é essa sessão
   que revela um identificador de build esquecido.

### Publicar uma alteração de interface ou de comportamento

Igual ao fluxo acima, sem o passo do identificador de build: o nome dos arquivos compilados muda a
cada compilação, o que já obriga o navegador a buscar o pacote novo. O identificador de build
protege apenas os três arquivos de dados, cujo endereço é fixo.

### Diagnosticar uma alteração que não aparece no site

Percorrer as camadas na ordem, da mais próxima do leitor para a mais distante:

1. **Cache do navegador** — alteração em arquivo de dados publicada sem identificador de build
   novo. Confirma-se abrindo em uma sessão que nunca visitou o site.
2. **Cache da distribuição** — publicação encerrada sem a invalidação. O arquivo está no destino e
   o leitor recebe a versão anterior.
3. **Destino** — o sincronismo não rodou ou falhou; o fluxo de publicação registra a falha.
4. **Compilação** — a publicação parou antes do sincronismo, e o site inteiro continua na versão
   anterior.

### Mudar a raiz ou o endereço público do site

1. Registrar a decisão de arquitetura antes da mudança.
2. Ajustar a raiz de publicação usada na compilação.
3. Garantir que a hospedagem de destino devolva o documento inicial para qualquer caminho.
4. Publicar e verificar, além da página inicial, **um endereço profundo** aberto diretamente —
   é ele que prova a configuração da hospedagem.

## Entidades e dados

### Endereços publicados

| Endereço | Conteúdo |
| --- | --- |
| `/` | redireciona para `/index.html` |
| `/index.html` | página inicial, com o gráfico do radar |
| `/overview.html` | índice de tecnologias |
| `/help-and-about-tech-radar.html` | página de ajuda sobre o radar |
| `/<quadrante>.html` | recorte por quadrante |
| `/<quadrante>/<nome-da-tecnologia>.html` | página de uma tecnologia |
| `/db1-opinion.json` | acervo de opiniões, baixado pelo navegador |
| `/config.json` | taxonomia e geometria do gráfico, baixada pelo navegador |
| `/messages.json` | links institucionais, baixados pelo navegador |
| `/favicon.ico`, `/fonts.css`, `/fonts/…`, `/logo/…` | identidade visual |

Todos os endereços de página são resolvidos pelo mesmo documento inicial (regra 8). Os três
arquivos de dados são buscados com o identificador de build na querystring (regra 6).

### Destino da publicação

| Elemento | Papel |
| --- | --- |
| Bucket de objetos estáticos nomeado como o domínio público | guarda o espelho exato do pacote |
| Distribuição de conteúdo à frente do bucket | serve o leitor e guarda o cache invalidado a cada publicação |
| Papel de publicação assumido por identidade federada | permite escrever no bucket e invalidar o cache, sem credencial permanente |

As precondições técnicas de cada um estão em
[`references/technical-dependencies.md`](references/technical-dependencies.md).

## Restrições e validações

- **Nenhuma validação de conteúdo no caminho de publicação.** Nada verifica o acervo, a taxonomia
  ou a marcação das opiniões antes do ar.
- **Nenhuma verificação de regressão automática.** Testes e verificação de estilo não participam do
  caminho; só a compilação barra a publicação.
- **Falha de carga de dados é silenciosa para o leitor.** Quando um dos arquivos de dados não
  responde, a aplicação não renderiza e nenhuma mensagem aparece na tela; o erro fica no console do
  navegador.
- **Ausência dos links institucionais não impede o site de abrir** — o produto renderiza sem eles,
  perdendo o rodapé institucional e os canais oficiais. A ausência do acervo ou da configuração, ao
  contrário, deixa o site inteiro em branco.
- **Sem rollback no destino.** Voltar à versão anterior significa publicar novamente a partir do
  repositório.
- **Sem publicação parcial.** Não há como enviar ao ar apenas um arquivo alterado: toda publicação
  reconstrói e reespelha o pacote inteiro.
- **Sem ambiente publicado de validação.** O único ambiente publicado é o de produção; a
  verificação prévia acontece na execução local do projeto.

## Variáveis de ambiente do domínio

Valores versionados junto com o repositório e lidos em tempo de compilação. Nenhum deles aceita
segredo (regra 11).

| Variável | Papel no domínio |
| --- | --- |
| `PUBLIC_URL` | raiz de publicação do site. Define o prefixo das rotas no navegador e o endereço dos três arquivos de dados. Valor divergente do caminho real de publicação deixa o site em branco. |
| `REACT_APP_BUILDHASH` | identificador de build que acompanha a busca dos três arquivos de dados. Trocá-lo é o que faz o navegador de quem já visitou o site baixar o conteúdo novo. |

Variáveis de infraestrutura do fluxo — região, nome do bucket, identificador da distribuição e
papel assumido — são configuração do ambiente de publicação, e estão descritas em
[`references/technical-dependencies.md`](references/technical-dependencies.md).

## Integrações e dependências externas

- **GitHub** — hospeda o repositório e executa o fluxo de publicação (GitHub Actions) a cada
  integração na linha principal.
- **AWS S3** — bucket de objetos estáticos que recebe o espelho do pacote compilado, nomeado como o
  domínio público do radar.
- **AWS CloudFront** — distribuição à frente do bucket; serve o leitor, guarda o cache e recebe a
  invalidação que encerra cada publicação.
- **AWS IAM com identidade federada (OIDC)** — concede ao fluxo uma credencial temporária com
  permissão de escrita no bucket e de invalidação do cache.
- **Yarn** — instala as dependências na publicação, com o lockfile congelado.

As precondições técnicas deste domínio — o que precisa existir para ele entregar comportamento
completo e o que quebra na ausência de cada uma — estão em
[`references/technical-dependencies.md`](references/technical-dependencies.md).
