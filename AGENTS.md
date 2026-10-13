# AGENTS.md — db1-tech-radar

## Visão geral

O `db1-tech-radar` é o Tech Radar público do DB1 Global Software, publicado em
`techradar.db1.com.br`. Ele expõe a opinião oficial da engenharia do DB1 sobre tecnologias —
linguagens, frameworks, métodos, plataformas e ferramentas — classificadas em quadrantes
temáticos e anéis de maturidade, com o texto de opinião em português, inglês e espanhol.

O produto é uma SPA estática: todo o conteúdo vive em arquivos JSON servidos de `public/` e o
acervo é editado à mão, por pull request. O repositório público é
`github.com/db1group/db1-tech-radar`.

## Stack

- **TypeScript** em modo `strict`, alvo ES5.
- **React 18** com Create React App (`react-scripts` 5).
- **react-router-dom** v6 para o roteamento no navegador.
- **i18next** + **react-i18next** com detector de idioma para o conteúdo trilíngue.
- **d3** (escalas) e SVG escrito à mão para o gráfico do radar.
- **SCSS** (`sass`) para os estilos.
- **Jest** + **Testing Library**, pela infraestrutura do `react-scripts`.
- **Yarn** como gerenciador de pacotes; **Renovate** cuida das atualizações.

## Estrutura do repositório

| Caminho | Conteúdo |
| --- | --- |
| `public/db1-opinion.json` | O acervo: itens e releases. Única origem das opiniões. |
| `public/config.json` | Taxonomia (quadrantes e anéis) e geometria do gráfico. |
| `public/messages.json` | Links institucionais e canais oficiais do DB1. |
| `public/fonts/`, `public/logo/` | Tipografia ClanOT e identidade visual. |
| `src/components/<Nome>/` | Um diretório por componente, com o `.tsx`, o `.scss` e o teste ao lado. |
| `src/model.ts` | Tipos do domínio (`Item`, `Blip`, `Revision`) e as funções de agrupamento e filtro. |
| `src/config.ts` | Contrato `ConfigData`, `publicUrl` e `translate`. |
| `src/hooks/`, `src/context/` | Hooks compartilhados e o contexto dos links institucionais. |
| `src/i18n/translations/{pt,en,es}.json` | Todos os rótulos e textos da interface, incluindo a página de ajuda (chave `pageHelp`). |
| `src/styles/` | Variáveis globais e estilos transversais. |
| `.github/workflows/` | Deploy para o S3. |
| `.agents/` | Artefatos de agentes (veja a seção própria abaixo). |

A organização por pastas é por tipo de componente e não acompanha as fronteiras de negócio: um
mesmo domínio costuma atravessar `src/components`, `src/model.ts` e `public/*.json`. O mapa dos
domínios está em `.agents/maps/functional-map.md`.

## Comandos essenciais

| Comando | Para quê |
| --- | --- |
| `yarn install` | Instala as dependências. O CI usa `yarn install --frozen-lockfile`. |
| `yarn start` | Sobe o modo de desenvolvimento em `localhost:3000`. |
| `yarn build` | Gera o pacote de produção em `build/`. |
| `yarn test` | Roda a suíte Jest uma vez (`--watchAll=false`). |
| `yarn ts:check` | Checagem de tipos sem emitir arquivos. |
| `yarn lint` | `ts:check` seguido do ESLint sobre `src/**/*.tsx`. |

## Variáveis de ambiente

As variáveis de build estão declaradas e versionadas em [`.env`](.env) — essa é a fonte da lista.

## Convenções de arquitetura

- **Estado sem biblioteca externa.** Estado local do React; Context apenas para os links
  institucionais; busca e filtros vivem na URL (`src/hooks/use-search-param-state.tsx`), o que
  torna qualquer recorte compartilhável por link.
- **Persistência limitada.** Arquivos estáticos em `public/` e `localStorage` só para o idioma
  escolhido (`StorageKey` em `src/model.ts`).
- **Roteamento.** `react-router-dom` v6 em rota coringa, `basename` derivado de `PUBLIC_URL` e
  nomes de página terminados em `.html`.
- **Invalidação de cache do navegador.** Os três `fetch` de dados levam
  `REACT_APP_BUILDHASH` na querystring; subir dado novo exige mudar esse valor.
- **Sanitização.** Todo HTML vindo de tradução ou de dado institucional passa por `sanitize`
  (`src/sanitize.ts`), com lista branca restrita de tags.
- **Estilos.** SCSS com um arquivo por componente ao lado do `.tsx`, variáveis CSS globais em
  `src/styles/` e nomes de classe em padrão BEM.
- **Dependências em versão exata.** `.npmrc` usa `save-exact=true` e o CI roda com o lockfile
  congelado.
- **Lint e formatação.** ESLint (`react-app` + `prettier`), Prettier com ordenação de imports
  (`prettier.config.js`) e Husky instalado no `prepare`.
- **Sem instrumentação.** O site público não recebe analytics nem monitoramento de erro.
- **Caminho único de publicação.** O push em `main` dispara
  `.github/workflows/prod-deploy-app-on-harbor.yml`, que compila e sincroniza `build/` com o
  bucket S3 `techradar.db1.com.br`; há CloudFront à frente do bucket, e a invalidação do cache
  da distribuição faz parte do deploy.

## Restrições globais

- **Sem backend.** Não existe API, banco nem autenticação: a aplicação lê três JSON estáticos.
  Sem `config.json` e sem `db1-opinion.json` nenhuma página renderiza.
- **Node 16**, fixado em `engines` no `package.json` e no workflow de deploy.
- **Três idiomas.** `pt`, `en` e `es` estão codificados no enum `Language` e nos campos
  `bodyPt`, `bodyEn` e `bodyEs` do tipo `Item`. Um quarto idioma exige mudar modelo, dado e
  componentes.
- **Quatro quadrantes na geometria.** O desenho em `src/components/Chart` assume quadrantes nas
  posições 1 a 4. A reescrita que torna esse número configurável precisa manter o desenho
  idêntico ao publicado hoje quando houver quatro quadrantes.
- **Acervo editado à mão.** `public/db1-opinion.json` é alterado por pull request, com `flag` e
  `revisions` preenchidos por quem edita. Tecnologia nova entra no anel `assess`; a promoção é
  decisão do time de engenharia (`CONTRIBUTING.md`).
- **Revisão humana como único controle.** Nada valida a conformidade do item com a taxonomia em
  tempo de build: o item com quadrante inexistente é simplesmente omitido do gráfico, sem erro.
- **Artefatos sem publicação associada.** O pipeline Markdown (`scripts/`, `dist_scripts/`,
  `tsconfig.scripts.json`, script `build:scripts`), o `Dockerfile` com o `.dockerignore` e a
  configuração do Firebase Hosting (`firebase.json`, `.firebaserc`, `.firebase/`) não
  participam de nenhuma publicação e estão marcados para remoção — decisão registrada em
  `.agents/context/discovery-answers.md`.

## Skills e estrutura de `.agents/`

O diretório `.agents/` guarda o que os agentes precisam saber sobre este projeto:

- `.agents/context/` — o contexto consolidado da descoberta funcional: objetivo, escopo,
  restrições declaradas e as decisões transversais com seu destino.
- `.agents/maps/` — o mapa dos domínios de negócio (contextos delimitados), suas fronteiras,
  dependências e a ordem sugerida de trabalho.
- `.agents/skills/` — as skills, de negócio (domínio) e técnicas (transversais), carregadas sob
  demanda pelo `description` do frontmatter de cada uma. Não há índice a consultar: a própria
  descrição da skill determina quando ela entra em contexto.

**Antes de criar ou editar arquivos, ou de implementar qualquer funcionalidade, verifique se
alguma skill governa o caso** — pela tecnologia, pelo padrão de código ou pela arquitetura
envolvida, ou pelo domínio de negócio, funcionalidade ou módulo em questão — e siga essa skill
antes de agir. As skills de `.agents/skills/` são autoritativas e têm precedência sobre padrões
inferidos do código existente. O corpo de cada skill indica onde vive a documentação completa
do seu assunto e qual fonte guarda a verdade, dentro ou fora do repositório; siga esse ponteiro
a partir da skill.

## Escrita de comentários e documentação

Todo texto que vive neste repositório — comentário de código, docstring, skill, `AGENTS.md`,
README, spec — descreve o estado atual, escrito para quem abre o arquivo hoje sem conhecer nem
o histórico do arquivo nem a conversa que o produziu.

- **Descreva o que é, nunca a transição.** Ao editar um texto existente, reescreva a passagem a
  partir do resultado final, como se ela sempre tivesse sido assim. Uma frase que só faz sentido
  para quem viu a versão anterior — ou o seu próprio diff — não pertence ao arquivo: o que mudou
  é assunto da mensagem de commit e da descrição do pull request.
- **Negue apenas para evitar um erro plausível.** Uma negação merece seu lugar quando um leitor
  competente realmente tentaria a alternativa e a frase diz por que ela falha, protegendo assim
  uma mudança futura. Contraste com a versão anterior, com uma alternativa que ninguém tentaria
  ou com o que o código já mostra é ruído que custa atenção ao leitor.
- **Corte o excesso antes de encerrar a tarefa.** Releia os textos que criou ou alterou e corte
  o que falha nas duas regras acima. Expressões como "não é mais", "antes", "agora é", "em vez
  de", "ao invés de", "diferente de" e "sem precisar" são os sintomas habituais — mantenha
  apenas as que sobrevivem à segunda regra.

Uma exceção: quando o assunto do texto **é** uma mudança — mensagem de commit, descrição de
pull request, spec de uma unidade de manutenção, changelog —, a transição é o conteúdo. A regra
proíbe narrar a *edição do texto*, nunca a mudança de que o texto trata.
