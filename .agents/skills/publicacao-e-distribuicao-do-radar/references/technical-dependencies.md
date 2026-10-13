# Dependências técnicas do domínio Publicação e Distribuição do Radar

> **Manutenção deste arquivo**
>
> Atualize-o sempre que uma precondição técnica deste domínio mudar: entrou uma nova dependência,
> saiu uma existente, ou mudou o que acontece quando ela falta. Refatoração que preserva a
> precondição (renomear um passo do fluxo, trocar a ação que executa um comando) não pede alteração
> aqui. Divergência entre o que este arquivo diz e o que o repositório faz, sem decisão registrada
> que a resolva, é escalada para o humano.

Cada item diz o que é e o que deixa de funcionar no domínio se ele faltar.

- **Papel AWS assumido por OIDC (`vars.AWS_DEPLOY_ROLE_ARN`)** — sem ele o passo de deploy falha e
  nada chega ao bucket; o papel precisa de permissão de `cloudfront:CreateInvalidation` além da
  escrita no bucket.

- **Identificador da distribuição CloudFront (`vars.CLOUDFRONT_DISTRIBUTION_ID`)** — alimenta a
  invalidação; ausente, o deploy publica no bucket e o site continua servindo a versão anterior até
  o cache expirar.

- **Bucket S3 e distribuição configurados para site estático com `index.html` como documento de
  erro** — é o que faz as URLs profundas do roteador funcionarem; sem isso só a raiz abre.

- **`PUBLIC_URL` igual a `/`** — alimenta o `basename` do roteador e o caminho dos `fetch`;
  divergência entre o valor de build e o caminho real de publicação quebra o carregamento dos três
  JSON.

- **Registro da decisão de arquitetura** — mudança na forma de publicar é decisão de arquitetura e
  fica registrada; sem o registro, a rota de publicação vigente deixa de ser rastreável e rotas
  abandonadas voltam a parecer alternativas válidas.

- **Gatilho do fluxo preso à linha principal** — a publicação é disparada pela integração em `main`.
  Sem o gatilho, nenhuma alteração aprovada chega ao ar; alteração em qualquer outra branch não
  publica nada, por construção.

- **Permissão de escrita do token de identidade no fluxo (`id-token: write`)** — é ela que permite
  obter a credencial temporária da AWS por identidade federada. Sem a permissão, o passo de
  credenciais falha e a publicação para antes de tocar o bucket.

- **Região AWS e nome do bucket declarados no fluxo (`us-east-1`, `techradar.db1.com.br`)** — são o
  endereço de destino do sincronismo. Divergentes do bucket real, o passo falha; apontados para
  outro bucket, a publicação vai parar em um destino que o domínio público não serve.

- **Executor com Node 16 e Yarn com lockfile congelado** — a compilação do pacote assume essa
  versão de Node, e a instalação roda com o lockfile congelado. Lockfile divergente do manifesto
  aborta a instalação e nada é publicado; versão de Node diferente da fixada publica um pacote
  compilado em condições que ninguém validou.

- **Hook de preparação do repositório executado na instalação** — a instalação do fluxo dispara o
  passo de preparação declarado no manifesto do projeto. Se esse passo apontar para um artefato
  removido do repositório, a instalação falha antes da compilação e a publicação inteira para.

- **Cópia do diretório de arquivos estáticos para o pacote durante a compilação** — é ela que leva
  o acervo, a configuração, os links institucionais e a identidade visual para a raiz do pacote.
  Sem essa cópia a compilação conclui, o pacote vai ao ar e nenhuma página renderiza, porque os
  três arquivos de dados não existem no endereço publicado.

- **Identificador de build versionado no arquivo de variáveis de build** — acompanha cada busca dos
  três arquivos de dados e é o que obriga o navegador a baixá-los de novo. Ausente, as buscas vão
  sem querystring e quem já visitou o site continua lendo a cópia em cache do navegador mesmo
  depois da publicação e da invalidação do cache da distribuição.
