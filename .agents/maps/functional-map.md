---
name: functional-map
description: Mapa dos sete contextos delimitados do db1-tech-radar — taxonomia, catálogo de opiniões, visualização do radar, navegação e descoberta, governança de contribuição, publicação e distribuição, identidade institucional — com dependências entre domínios, dependências técnicas, nível de confiança e ordem sugerida. Sem lacunas em aberto.
metadata:
  author: clovis-cli
  responsibility: "Map of identification of the business domains (bounded contexts), their boundaries, dependencies and suggested implementation order. Index of domains for skill generation and the spec-driven flow; it does not detail business rules nor duplicate the cross-cutting decisions, which live in the discovery-answers.md."
---

# Mapa funcional do db1-tech-radar

Sete contextos delimitados de negócio. A organização por pastas do código é por tipo de
componente e não acompanha estas fronteiras: um mesmo domínio costuma atravessar
`src/components`, `src/model.ts` e `public/*.json`.

---

## 1. Taxonomia de Quadrantes e Anéis

**Objetivo de negócio.** Definir os eixos de classificação do radar — os quatro quadrantes
temáticos e os quatro anéis de maturidade — com o nome, a cor, a posição e a descrição de
cada um. É o vocabulário que toda opinião precisa respeitar para existir no radar.

**Evidência no código.**
- `public/config.json` — quadrantes `languages-and-frameworks`, `methods-and-patterns`,
  `platforms-and-operations`, `tools`; anéis `adopt`, `trial`, `assess`, `hold`;
  `quadrantsMap` com cor, cor de texto, posição e descrição por quadrante.
- `src/config.ts` — contrato `ConfigData` e a função `translate`.
- `src/i18n/translations/{pt,en,es}.json` — chaves `quadrants`, `rings` e
  `pageHelp.quadrants` / `pageHelp.rings`, com o significado de negócio de cada eixo.

**Dependências entre domínios.** Nenhuma. É a raiz do modelo.

**Regras inferidas.**
- Quadrante e anel são identificados por slug em inglês; o rótulo exibido vem sempre da
  tradução, nunca do dado.
- A posição do quadrante (1 a 4) determina o canto do gráfico e o canto do rótulo, e é
  consumida tanto pelo desenho quanto pela legenda.
- `showEmptyRings` controla se um anel sem itens aparece nas listagens; hoje está desligado.
- `hold` ("Evite") está definido na taxonomia mas nenhum item do acervo o usa atualmente.
- A conformidade entre o item e a taxonomia é garantida pela revisão do pull request: a
  aplicação simplesmente omite do gráfico o item cujo quadrante não exista na configuração,
  sem sinalizar o erro.

**Dependências externas relevantes.** Nenhuma biblioteca de terceiros. O domínio é dado de
configuração consumido por todos os demais.

**Dependências técnicas do domínio.**
- `public/config.json` servido como estático — a aplicação só renderiza qualquer página
  depois de carregar esse arquivo; sem ele `App` devolve `null` e a tela fica vazia.
- Arquivos de tradução `src/i18n/translations/*.json` — guardam o rótulo e a descrição de
  cada quadrante e anel; sem a chave correspondente o rótulo aparece como a própria chave
  crua na interface.
- Convenção de testes (skill `estrategia-de-testes`) — mudar a taxonomia exige teste
  unitário sobre quem a lê (`translate`, agrupamentos de `src/model.ts`); sem ele a quebra só
  aparece em produção, porque nada valida a configuração em tempo de build.

**Nível de confiança.** `high` — configuração e contrato explícitos no código.

---

## 2. Catálogo de Opiniões Tecnológicas

**Objetivo de negócio.** Guardar a opinião oficial do DB1 sobre cada tecnologia avaliada:
identidade, classificação, texto de opinião nos três idiomas, histórico de revisões e a
marca de novidade ou mudança na publicação mais recente.

**Evidência no código.**
- `public/db1-opinion.json` — 53 itens e três releases (`2025-05-20`, `2025-06-05`,
  `2026-03-22`); todos os itens trazem `bodyPt`, `bodyEn` e `bodyEs` preenchidos, nenhum
  usa `tags` e nenhum traz `revisions`.
- `src/model.ts` — tipos `Item`, `ItemAttributes`, `Revision`, `FlagType`; funções
  `groupByQuadrants`, `groupByFirstLetter`, `featuredOnly`, `filteredOnly`, `getTags`.
- `src/hooks/get-item-body.tsx` — escolhe o corpo conforme o idioma ativo.

**Dependências entre domínios.** Depende de **Taxonomia de Quadrantes e Anéis**.

**Regras inferidas.**
- Cada item é único pelo par quadrante + nome, que também forma a URL da página do item.
- Uma opinião existe nos três idiomas; o idioma ativo escolhe qual corpo é exibido.
- O corpo da opinião é HTML pronto dentro do JSON, escrito à mão junto com o resto do item.
- `flag` distingue item novo, item alterado e item estável na release mais recente, e
  alimenta a forma do ponto no gráfico e o selo nas listagens. É preenchido pela pessoa que
  edita o acervo.
- `revisions` guarda o histórico da opinião e só aparece na página do item quando há mais de
  uma entrada; o acervo atual não tem histórico registrado.
- `tags` é opcional e hoje não é usado por nenhum item, o que mantém o filtro por tags
  invisível na interface.
- `title` recai sobre `name` quando ausente.

**Dependências externas relevantes.** Nenhuma biblioteca de terceiros participa da leitura do
acervo. `marked`, `highlight.js` e `front-matter` serviam ao pipeline Markdown descartado e
saem do projeto junto com ele (decisão registrada no `discovery-answers.md`); a conversão de
Markdown em HTML passa a ser feita por quem escreve a opinião, fora do repositório.

**Dependências técnicas do domínio.**
- `public/db1-opinion.json` servido como estático — é a única origem do acervo; sem ele a
  aplicação não renderiza nenhuma página.
- Internacionalização ativa (`i18next`) — `getItemBody` lê `i18n.language` para escolher o
  corpo; sem a inicialização do i18n o texto da opinião não é selecionado.
- `sanitize-html` — disponível no projeto, mas o corpo da opinião é injetado com
  `dangerouslySetInnerHTML` sem passar por ele, o que torna o acervo conteúdo confiável por
  definição e faz da revisão do pull request a única barreira.
- `src/styles/components/hljs.scss` — tema local que estiliza os blocos de código embutidos
  nos corpos das opiniões; sem ele o código no texto perde o realce.
- Convenção de testes (skill `estrategia-de-testes`) — as funções de `src/model.ts` e
  `getItemBody` concentram a regra do domínio e são cobertas por teste unitário.

**Nível de confiança.** `high` — modelo, dado e transformações explícitos.

---

## 3. Visualização do Radar

**Objetivo de negócio.** Desenhar o radar: o diagrama circular onde cada opinião vira um
ponto posicionado no cruzamento do seu quadrante com o seu anel, legendado e navegável.

**Evidência no código.**
- `src/components/Chart/RadarChart.tsx` — escalas e composição do SVG.
- `src/components/Chart/geometry.ts` — a convenção angular única do desenho: graus, 0° = 12
  horas, sentido horário.
- `src/components/Chart/BlipPoints.tsx` — posicionamento dos pontos, com ângulo e raio
  sorteados dentro do setor e repulsão entre pontos vizinhos.
- `src/components/Chart/QuadrantRings.tsx`, `BlipShapes.tsx` — arcos e as três formas de
  ponto.
- `src/components/RadarGrid/RadarGrid.tsx` — rótulo de cada quadrante, atalho de aproximação
  e legenda das três formas.
- `public/config.json` (`chartConfig`) — tamanho, escala, raio e espessura de cada anel.

**Dependências entre domínios.** Depende de **Taxonomia de Quadrantes e Anéis** e de
**Catálogo de Opiniões Tecnológicas**.

**Regras inferidas.**
- A posição exata do ponto dentro do setor é sorteada a cada renderização, com até cem
  tentativas para não encostar em outro ponto nem nos eixos. O radar não guarda coordenada;
  o que importa é o setor.
- Item sem anel ou sem quadrante válido é omitido do gráfico em vez de quebrar o desenho.
- A forma do ponto comunica a marca do item: novo, alterado ou estável.
- Só itens em destaque (`featured`) entram no gráfico.
- A geometria assume quatro quadrantes em posições fixas; a ordem de desenho é
  anti-horária e a tradução entre posição de negócio e posição geométrica está embutida no
  cálculo do deslocamento angular.

**Dependências externas relevantes.** `d3` (escalas lineares), `react-tooltip` (rótulo do
ponto ao passar o mouse).

**Dependências técnicas do domínio.**
- `chartConfig` em `public/config.json` — raio e espessura por anel; a quantidade de entradas
  em `ringsAttributes` precisa acompanhar a de anéis, senão o cálculo do raio do ponto lê
  posição inexistente.
- Camada de roteamento interna (`Link` + `react-router-dom`) — cada ponto é um link para a
  página do item; sem ela o gráfico vira ilustração sem navegação.
- Convenção de testes (skill `estrategia-de-testes`) — a geometria é a lógica mais densa do
  projeto e pede teste unitário que verifique se o ponto cai no setor correto.
- Registro em ADR (skill `registros-de-decisao-arquitetural`) — a reescrita da geometria para
  suportar de um a seis quadrantes, em andamento nas branches
  `feat/us1-geometry-foundation` e `feat/us2-rings-arcs-geometry`, é decisão de arquitetura e
  exige o desenho idêntico ao atual quando houver quatro quadrantes.

**Nível de confiança.** `high` — geometria e regras legíveis diretamente no componente.

---

## 4. Navegação e Descoberta de Tecnologias

**Objetivo de negócio.** Permitir que a pessoa encontre uma tecnologia por caminhos
diferentes do gráfico: busca textual, índice alfabético, filtro por anel, filtro por tags,
recorte por quadrante e leitura da página de um item.

**Evidência no código.**
- `src/components/Router.tsx` — resolve o nome da página em uma das seis telas e trata o não
  encontrado.
- `src/components/PageOverview/PageOverview.tsx` — índice por letra inicial, busca em título,
  corpo e informação, e filtro por anel.
- `src/components/PageQuadrant/PageQuadrant.tsx`, `QuadrantSection`, `QuadrantGrid` — recorte
  por quadrante, agrupado por anel.
- `src/components/PageItem/PageItem.tsx` e `PageItemMobile/PageItemMobile.tsx` — duas versões
  da página do item, escolhidas pela largura da janela.
- `src/components/Header/Header.tsx`, `Search/Search.tsx`, `TagsModal/TagsModal.tsx` — busca
  no cabeçalho e seleção de tags.
- `src/hooks/use-search-param-state.tsx` — busca e tags vivem na URL.

**Dependências entre domínios.** Depende de **Taxonomia de Quadrantes e Anéis** e de
**Catálogo de Opiniões Tecnológicas**.

**Regras inferidas.**
- A busca é por substring sem acento removido nem ranqueamento, aplicada sobre título, corpo
  traduzido e campo de informação.
- Busca e tags viajam na URL, o que torna um recorte compartilhável por link; as tags são
  serializadas separadas por `|`.
- O filtro por tags fica oculto enquanto nenhum item tiver tag.
- A página do item lista as demais tecnologias do mesmo anel e quadrante como navegação
  lateral.
- Abaixo de 1200 pixels de largura a página do item troca para a versão móvel, decidida na
  renderização e não reavaliada ao redimensionar.
- A troca entre páginas passa por uma transição de saída antes de montar a próxima.

**Dependências externas relevantes.** `react-router-dom`, `query-string`, `react-modal`,
`classnames`.

**Dependências técnicas do domínio.**
- Casca de navegação em `src/components/App.tsx` — cabeçalho, conteúdo e rodapé; as telas
  deste domínio só existem dentro dela e dependem do `basename` derivado de `PUBLIC_URL`.
- `#root` registrado como elemento da aplicação para o modal — `ReactModal.setAppElement`;
  sem isso o modal de tags perde o tratamento de acessibilidade.
- Internacionalização ativa — rótulos de anel, quadrante e navegação vêm das traduções.
- Convenção de testes (skill `estrategia-de-testes`) — é o domínio com mais telas, e cada uma
  alterada leva teste de componente com Testing Library cobrindo busca, filtro e índice.

**Nível de confiança.** `high` — telas, rotas e filtros explícitos.

---

## 5. Governança de Contribuição do Radar

**Objetivo de negócio.** Reger como uma tecnologia entra no radar, como sua opinião muda de
anel ao longo do tempo e como isso é explicado a quem lê. É o processo editorial que dá
autoridade ao conteúdo.

**Evidência no código.**
- `CONTRIBUTING.md` — fluxo de fork e pull request, template com nome da tecnologia,
  justificativa, benefícios e riscos, e a regra de que toda tecnologia nova entra no anel
  `assess` até o time de engenharia decidir promovê-la.
- `src/i18n/translations/{pt,en,es}.json`, chave `pageHelp` — o texto público que explica o
  que é o radar, como ele é criado, como deve ser usado e o que cada anel significa.
- `src/components/PageHelp/PageHelp.tsx` — a página que publica esse texto.
- `src/components/EditButton/EditButton.tsx` — atalho para editar a origem de um item,
  condicionado a `editLink` na configuração.
- Histórico do repositório — pull requests por tecnologia, com mensagens do tipo
  "changing <tecnologia> opinion" e "adding <tecnologia> opinion".

**Dependências entre domínios.** Depende de **Taxonomia de Quadrantes e Anéis** e de
**Catálogo de Opiniões Tecnológicas**.

**Regras inferidas.**
- Tecnologia nova entra obrigatoriamente em `assess`; a promoção para outro anel é decisão
  do time de engenharia, não de quem contribui.
- Cada alteração de opinião é um pull request revisado; a revisão humana é o controle de
  qualidade do conteúdo, inclusive do HTML embutido no corpo e da conformidade com a
  taxonomia.
- O release é uma data; a publicação mais recente é a que define quais itens aparecem como
  novos ou alterados.
- O atalho de edição monta a URL de um arquivo Markdown por release e só aparece quando
  `editLink` está definido em `public/config.json`. Com o acervo vivendo em um único JSON,
  essa chave permanece ausente.

**Dependências externas relevantes.** GitHub (fork, pull request e revisão) é onde o processo
acontece; o repositório público é `github.com/db1group/db1-tech-radar`.

**Dependências técnicas do domínio.**
- `CONTRIBUTING.md` e a página de ajuda — são a definição publicada do processo; divergência
  entre os dois deixa contribuinte e leitor com regras diferentes.
- Chave `pageHelp` nos três arquivos de tradução — a página de ajuda lê listas inteiras de
  objetos da tradução; faltando a chave em um idioma, a página quebra naquele idioma.
- Convenção de testes (skill `estrategia-de-testes`) — a página de ajuda depende da forma dos
  objetos vindos da tradução e leva teste de componente quando essa estrutura muda.

**Nível de confiança.** `medium` — as regras estão escritas, mas a decisão de promoção entre
anéis acontece fora do repositório e não é observável no código.

---

## 6. Publicação e Distribuição do Radar

**Objetivo de negócio.** Transformar o conteúdo do repositório no site público
`techradar.db1.com.br` a cada alteração aprovada.

**Evidência no código.**
- `.github/workflows/prod-deploy-app-on-harbor.yml` — a cada push em `main`: Node 16.14,
  `yarn install --frozen-lockfile`, `yarn build`, credenciais AWS por OIDC e
  `aws s3 sync ./build s3://techradar.db1.com.br --delete`.
- `package.json` — `build` executa `react-scripts build`.
- `.env` — `PUBLIC_URL` e `REACT_APP_BUILDHASH`.

**Dependências entre domínios.** Depende de **Catálogo de Opiniões Tecnológicas**.

**Regras inferidas.**
- O que vai ao ar é o resultado de `react-scripts build` somado ao conteúdo de `public/`;
  o acervo chega ao navegador como arquivo estático, não embutido no bundle.
- O `--delete` no sincronismo torna o bucket um espelho exato do diretório de build.
- Há CloudFront à frente do bucket: o deploy termina invalidando o cache da distribuição,
  senão a alteração sincronizada no S3 continua invisível para quem acessa o site.
- O site é servido inteiro pelo `index.html`; as URLs profundas do roteador dependem de a
  distribuição devolver esse arquivo como documento de erro. Não há `sitemap.xml` nem uma
  página `.html` por item.
- A troca de bundle é percebida pelo navegador via `REACT_APP_BUILDHASH` na querystring dos
  três `fetch` de dados.
- Este é o único caminho de publicação. O pipeline Markdown (`scripts/`, `dist_scripts/`,
  `tsconfig.scripts.json`, script `build:scripts`), o `Dockerfile` com o `.dockerignore` e a
  configuração do Firebase Hosting (`firebase.json`, `.firebaserc`, `.firebase/`) são
  descartados — decisão registrada no `discovery-answers.md`.

**Dependências externas relevantes.** GitHub Actions, AWS S3 (bucket
`techradar.db1.com.br`), AWS CloudFront, AWS IAM por OIDC e Yarn. Firebase Hosting e Docker
são caminhos de publicação descartados e saem do repositório; as bibliotecas que só o
pipeline Markdown usava — `marked`, `highlight.js`, `front-matter`, `walk`, `fs-extra`,
`xml-sitemap` e os `@types` correspondentes — saem com ele.

**Dependências técnicas do domínio.**
- Papel AWS assumido por OIDC (`vars.AWS_DEPLOY_ROLE_ARN`) — sem ele o passo de deploy falha
  e nada chega ao bucket; o papel precisa de permissão de `cloudfront:CreateInvalidation`
  além da escrita no bucket.
- Identificador da distribuição CloudFront (`vars.CLOUDFRONT_DISTRIBUTION_ID`) — alimenta a
  invalidação; ausente, o deploy publica no bucket e o site continua servindo a versão
  anterior até o cache expirar.
- Bucket S3 e distribuição configurados para site estático com `index.html` como documento de
  erro — é o que faz as URLs profundas do roteador funcionarem; sem isso só a raiz abre.
- `PUBLIC_URL` igual a `/` — alimenta o `basename` do roteador e o caminho dos `fetch`;
  divergência entre o valor de build e o caminho real de publicação quebra o carregamento
  dos três JSON.
- Registro em ADR (skill `registros-de-decisao-arquitetural`) — mudança na forma de publicar
  é decisão de arquitetura e fica registrada.

**Nível de confiança.** `medium` — o fluxo e a presença do CloudFront estão confirmados, mas
a configuração do bucket e da distribuição vive fora do repositório e não é verificável aqui.

---

## 7. Identidade Institucional DB1

**Objetivo de negócio.** Apresentar o radar como peça institucional do DB1 Global Software:
marca, logotipo, canais oficiais e informação legal.

**Evidência no código.**
- `public/messages.json` — links sociais oficiais (Facebook, Twitter, LinkedIn, Instagram,
  YouTube, GitHub) e link de informação legal.
- `src/context/MessagesContext/index.tsx` — distribui esse conteúdo para a árvore de
  componentes.
- `src/components/Branding/`, `LogoLink/`, `Footer/`, `FooterEnd/`, `SocialLink/` — cabeçalho
  com marca, rodapé com nota institucional e ícones sociais.
- `public/fonts/` (ClanOT), `public/logo/`, `src/styles/` — tipografia e identidade visual.
- `src/i18n/translations/*.json`, chaves `footerFootnote`, `legalInformationLabel`,
  `socialLinksLabel` — o texto institucional traduzido.

**Dependências entre domínios.** Nenhuma.

**Regras inferidas.**
- Os canais oficiais são dado, não código: entram e saem editando `public/messages.json`.
- A nota de rodapé é HTML traduzido e passa pelo sanitizador antes de ser renderizada.
- O logotipo encolhe fora da página inicial.
- O rodapé some na página do item quando a janela não é móvel, para a leitura ocupar a tela.

**Dependências externas relevantes.** `react-icons` para os ícones dos canais sociais.

**Dependências técnicas do domínio.**
- `public/messages.json` servido como estático — a ausência do arquivo não impede a aplicação
  de carregar, mas apaga rodapé institucional e canais sociais.
- Fontes ClanOT em `public/fonts/` e `public/fonts.css` — sustentam a identidade visual; sem
  elas o site cai em fonte alternativa.
- Convenção de testes (skill `estrategia-de-testes`) — o rodapé leva teste de componente
  quando sua estrutura muda, porque ele aparece em todas as telas.

**Nível de confiança.** `high` — componentes, dado institucional e textos traduzidos
explícitos no repositório.

---

## Ordem sugerida

A ordem reflete a dependência entre os domínios: a taxonomia define o vocabulário, o catálogo
o preenche, visualização e navegação o apresentam, governança rege sua evolução, publicação o
leva ao ar e a identidade institucional é independente das demais.

1. Taxonomia de Quadrantes e Anéis
2. Catálogo de Opiniões Tecnológicas
3. Visualização do Radar
4. Navegação e Descoberta de Tecnologias
5. Governança de Contribuição do Radar
6. Publicação e Distribuição do Radar
7. Identidade Institucional DB1

---

## Lacunas em aberto

Nenhuma.
