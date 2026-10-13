# Dependências técnicas do domínio Navegação e Descoberta de Tecnologias

> **Manutenção deste arquivo**
>
> Atualize-o sempre que uma precondição técnica deste domínio mudar: entrou uma nova dependência,
> saiu uma existente, ou mudou o que acontece quando ela falta. Refatoração que preserva a
> precondição (renomear arquivo, trocar a biblioteca que faz o roteamento) não pede alteração aqui.
> Divergência entre o que este arquivo diz e o que o repositório faz, sem decisão registrada que a
> resolva, é escalada para o humano.

Cada item diz o que é e o que deixa de funcionar no domínio se ele faltar.

- **Casca de navegação em `src/components/App.tsx`** — cabeçalho, conteúdo e rodapé; as telas deste
  domínio só existem dentro dela e dependem do `basename` derivado de `PUBLIC_URL`.

- **`#root` registrado como elemento da aplicação para o modal** — `ReactModal.setAppElement`; sem
  isso o modal de tags perde o tratamento de acessibilidade.

- **Internacionalização ativa** — todo texto de interface da navegação vem das traduções: rótulos de
  anel e de quadrante, itens do cabeçalho, campo de busca, atalho e janela de seleção de tags,
  atalho de aproximação e título de cada tela. Sem a inicialização do idioma, a navegação exibe as
  chaves cruas no lugar dos rótulos.

- **Convenção de testes do projeto** — é o domínio com mais telas, e cada uma alterada leva teste de
  componente com Testing Library cobrindo busca, filtro e índice.

- **`react-router-dom`** — resolve a rota coringa que captura qualquer caminho, aplica o `basename`,
  faz o redirecionamento da raiz para a página inicial, monta cada link interno e expõe o endereço e
  a querystring às telas. Sem ela nenhum endereço vira tela e nenhum recorte sobrevive na URL.

- **`query-string`** — interpreta e reescreve os parâmetros `search` e `tags` do endereço, incluindo
  a serialização da lista de tags com o separador `|`, que cada link interno precisa reproduzir
  igual para o recorte sobreviver à navegação. Sem ela o recorte por tags deixa de ser legível a
  partir do endereço.

- **`react-modal`** — monta a janela modal de seleção de tags sobre a tela corrente, com o
  fechamento por clique fora e o atraso de fechamento. Sem ela o filtro por tags não tem interface
  de seleção, restando apenas a edição do endereço à mão.

- **`classnames`** — compõe as classes condicionais que exprimem estado de navegação: campo de busca
  aberto, item ativo na faixa lateral, item esmaecido por estar fora de destaque, tela esmaecida na
  transição de saída e rodapé oculto na página do item. Sem ela esses estados deixam de ser
  distinguíveis na tela.

- **`public/config.json` servido como estático** — a lista de quadrantes decide quais páginas de
  quadrante existem e a ordem dos blocos na página inicial; a lista ordenada de anéis alimenta o
  agrupamento das listagens e as opções do filtro por anel; o interruptor de anel vazio decide se
  anel sem item aparece. Sem esse arquivo a aplicação não monta tela nenhuma.

- **`public/db1-opinion.json` servido como estático** — define quais páginas de item existem, o que
  cada listagem apresenta e sobre o que a busca age. Sem o acervo nenhuma página renderiza.

- **Distribuição devolvendo o documento único para qualquer caminho** — todo endereço deste domínio
  é profundo (`/<quadrante>/<item>.html`) e não existe arquivo correspondente no servidor. Sem a
  distribuição entregar o documento único para caminhos não encontrados, apenas a raiz abre e todo
  link compartilhado quebra.

- **`PUBLIC_URL` coerente com o caminho real de publicação** — alimenta o `basename` do roteador e,
  com ele, o prefixo de todos os endereços internos. Divergência entre o valor de build e o caminho
  publicado faz todo link interno apontar para fora do site.

- **Folhas de estilo da navegação (`src/components/Fadeable/fadeable.scss`,
  `src/components/Search/search.scss`, `src/components/TagsModal/tags-modal.scss`,
  `src/components/QuadrantGrid/quadrant-grid.scss`, `src/components/ItemList/item-list.scss`,
  `src/components/PageItem/item-page.scss`, `src/components/Footer/footer.scss`)** — definem o
  esmaecimento de 0,2 s da transição de saída, a abertura do campo de busca no cabeçalho, o corte de
  duas colunas para uma nas listagens da página inicial, o esmaecimento do item fora de destaque na
  faixa lateral e a ocultação do rodapé na página do item. Sem elas a navegação continua funcional,
  mas perde as distinções visuais que comunicam estado.

- **Invalidação de cache do navegador e do CDN na publicação** — a taxonomia e o acervo são buscados
  com o identificador de build na querystring e o deploy invalida o cache da distribuição. Sem trocar
  esse identificador e sem a invalidação, um quadrante ou um item novo não ganha página para quem já
  visitou o site, mesmo com os arquivos novos publicados.
