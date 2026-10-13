---
name: discovery-answers
description: Contexto e decisões da descoberta funcional do db1-tech-radar — objetivo, escopo, restrições, decisões transversais com destino (i18n, testes, ADRs, observabilidade, publicação em S3 com CloudFront, estado, estilos, tooling), ausência de framework spec-driven concorrente e o registro das sete decisões humanas resolvidas.
metadata:
  author: clovis-cli
  responsibility: "Durable memory of the functional-discovery context and decisions: objective, scope, declared restrictions, validated cross-cutting decisions (with destination), documentation forms to maintain and the log of human decisions resolved in the gap loop. Source re-read by the following stages; its restrictions take precedence over later inferences."
---

# Contexto e decisões da descoberta funcional

## Objetivo e escopo

O `db1-tech-radar` é o Tech Radar público do DB1 Global Software, publicado em
`techradar.db1.com.br`. Ele expõe a opinião oficial da engenharia do DB1 sobre tecnologias
— linguagens, frameworks, métodos, plataformas e ferramentas — classificadas em quadrantes
e anéis de maturidade, com texto de opinião em três idiomas.

- **Tipo de sistema:** frontend.
- **Tipo de projeto:** manutenção.
- **Escopo desta descoberta:** projeto inteiro.
- **Projeto legado:** não se aplica.

O objetivo da descoberta é mapear os contextos delimitados de negócio do produto e
consolidar as decisões transversais que as etapas seguintes devem respeitar ao gerar
skills, specs e planos.

## Restrições declaradas pelo usuário

Nenhuma restrição adicional foi declarada no questionário desta sessão.

## Restrições observadas no repositório

Estas não foram declaradas pelo usuário; são limites reais do código que as etapas
seguintes precisam respeitar.

- **Sem backend.** A aplicação é uma SPA estática (Create React App) que lê três arquivos
  JSON servidos como estáticos: `public/db1-opinion.json` (o acervo), `public/config.json`
  (taxonomia e geometria do gráfico) e `public/messages.json` (links institucionais).
  Não existe API, banco ou autenticação.
- **Node 16.** Fixado em `package.json` (`engines`) e no workflow de deploy
  (`actions/setup-node` com `16.14`).
- **Versões exatas de dependências.** `.npmrc` usa `save-exact=true`; o `renovate.json`
  cuida das atualizações.
- **Idiomas fixos em três.** `pt`, `en` e `es` estão codificados no enum `Language`
  (`src/model.ts`) e no tipo `Item`, que carrega `bodyPt`, `bodyEn` e `bodyEs` como campos
  distintos. Um quarto idioma exige mudança de modelo, de dado e de componentes.
- **Quadrantes fixos em quatro.** A geometria do gráfico (`src/components/Chart`) assume
  quatro quadrantes em posições 1 a 4. Existe trabalho em andamento para tornar esse número
  configurável, nas branches `feat/us1-geometry-foundation` e
  `feat/us2-rings-arcs-geometry`, com a exigência de manter o desenho idêntico ao publicado
  hoje quando houver quatro quadrantes.
- **Conteúdo editado à mão.** O acervo é alterado diretamente no
  `public/db1-opinion.json` por pull request, conforme o `CONTRIBUTING.md`. Os campos
  `flag` e `revisions` são preenchidos pela pessoa que edita o arquivo.

## Formas de documentação mantidas

- `README.md` — visão geral, stack e setup de desenvolvimento.
- `CONTRIBUTING.md` — fluxo de contribuição, template de pull request e a regra de entrada
  no anel `assess`.
- Página de ajuda embutida no produto (`help-and-about-tech-radar`), cujo conteúdo vive nos
  arquivos de tradução (`src/i18n/translations/*.json`, chave `pageHelp`) e explica ao
  leitor o que é o radar, como ele é criado e o significado de cada quadrante e anel.
- **ADRs** para decisões de arquitetura. Toda escolha estrutural — geometria configurável do
  gráfico, origem do acervo, forma de publicação — passa a ter um registro próprio. O formato
  e o local dos arquivos são definidos pela skill técnica `registros-de-decisao-arquitetural`.

Swagger/OpenAPI e coleções Postman não se aplicam: o projeto não expõe nem consome API.
Storybook não é mantido.

## Decisões transversais validadas

| Decisão | Origem | Destino |
| --- | --- | --- |
| Internacionalização com `i18next` + `react-i18next`, detector de idioma e persistência em `localStorage`; chaves em `src/i18n/translations/{pt,en,es}.json` | Evidência: `src/i18n/index.ts`, `src/components/ButtonFlag/ButtonFlag.tsx`, `src/hooks/get-item-body.tsx`, `src/date.ts` | `technical-skill` `internacionalizacao-do-radar` |
| Teste unitário para lógica nova e teste de componente para as telas alteradas, com Jest e Testing Library | Decisão humana (`g2`) | `technical-skill` `estrategia-de-testes` |
| ADRs como registro das decisões de arquitetura | Decisão humana (`g1`) | `technical-skill` `registros-de-decisao-arquitetural` |
| Sem instrumentação: o site público não recebe analytics nem monitoramento de erro | Decisão humana (`g3`) | Convenção em `AGENTS.md` |
| Publicação única: GitHub Actions compila e sincroniza com o bucket S3, seguido de invalidação do CloudFront | Decisões humanas (`g4`, `g5`) + `.github/workflows/prod-deploy-app-on-harbor.yml` | Convenção em `AGENTS.md` e domínio **Publicação e Distribuição do Radar** |
| Gerenciamento de estado sem biblioteca externa: estado local do React, Context apenas para os links institucionais e a URL como fonte de verdade de busca e filtros | Evidência: `src/hooks/use-search-param-state.tsx`, `src/context/MessagesContext/index.tsx`, `src/components/Header/Header.tsx` | Convenção em `AGENTS.md` |
| Persistência limitada a arquivos estáticos em `public/` e a `localStorage` para o idioma escolhido | Evidência: `src/components/App.tsx`, `src/model.ts` (`StorageKey`) | Convenção em `AGENTS.md` |
| Estilos em SCSS, um arquivo por componente ao lado do `.tsx`, variáveis CSS globais e nomes de classe em padrão BEM | Evidência: `src/styles/`, `src/components/**/**.scss` | Convenção em `AGENTS.md` |
| Sanitização com `sanitize-html` para todo HTML vindo de tradução ou de dado institucional, com lista branca restrita de tags | Evidência: `src/sanitize.ts`, `src/components/PageHelp/PageHelp.tsx`, `src/components/Footer/Footer.tsx` | Convenção em `AGENTS.md` |
| Roteamento com `react-router-dom` v6 em rota coringa, `basename` vindo de `PUBLIC_URL` e nomes de página terminados em `.html` | Evidência: `src/components/App.tsx`, `src/components/Router.tsx` | Convenção em `AGENTS.md` |
| Invalidação de cache do navegador por querystring `REACT_APP_BUILDHASH` nos três `fetch` de dados | Evidência: `src/components/App.tsx`, `.env` | Convenção em `AGENTS.md` |
| Yarn como gerenciador de pacotes, com versões exatas e lockfile congelado no CI | Evidência: `.npmrc`, `yarn.lock`, `.github/workflows/prod-deploy-app-on-harbor.yml` | Convenção em `AGENTS.md` |
| ESLint (`react-app` + `prettier`), Prettier com ordenação de imports e Husky instalado no `prepare` | Evidência: `.eslintrc`, `prettier.config.js`, `package.json` | Convenção em `AGENTS.md` |

Três decisões viram `technical-skill` porque exigem um passo a passo reutilizável:

- **`internacionalizacao-do-radar`** — adicionar chave nos três arquivos de tradução, manter
  os três corpos do item sincronizados, usar `getItemBody` em vez de ler `bodyEn` direto e
  registrar o locale do `moment` ao formatar datas.
- **`estrategia-de-testes`** — onde colocar o teste, como montar um teste de componente com
  Testing Library neste projeto e o que conta como tela alterada.
- **`registros-de-decisao-arquitetural`** — formato do ADR, local dos arquivos, numeração e
  quando uma mudança merece registro.

As demais são regras curtas e estáveis, que cabem como convenção.

O conteúdo trilíngue do item em si pertence ao domínio **Catálogo de Opiniões Tecnológicas**,
não à skill técnica: a skill cobre o mecanismo, o domínio cobre a regra de negócio de que
toda opinião existe nos três idiomas.

## Framework spec-driven concorrente

Nenhum detectado. A varredura do repositório não encontrou `.specify/`, `openspec/`,
`specs/`, `.kiro/` nem templates ou comandos de spec concorrentes. Os únicos diretórios de
ferramenta presentes são `.claude/` (apenas `settings.local.json`) e `.clovis/` (estado do
próprio CLI). Nenhuma decisão humana foi necessária neste ponto.

## Registro de decisões humanas do laço de gaps

| Gap | O que estava em aberto | Decisão tomada | Destino |
| --- | --- | --- | --- |
| `g1` | Qual forma de documentação manter além do `README.md`, do `CONTRIBUTING.md` e da página de ajuda do site. | Manter **ADRs** para decisões de arquitetura. | `technical-skill` `registros-de-decisao-arquitetural` |
| `g2` | Que nível de teste automatizado exigir nas alterações de manutenção. | **Teste unitário mais teste de componente nas telas alteradas.** | `technical-skill` `estrategia-de-testes` |
| `g3` | Se o site público passa a ter analytics ou monitoramento de erro. | **Seguir sem instrumentação.** | Convenção em `AGENTS.md` |
| `g4` | O que fazer com o pipeline Markdown em `scripts/` e `dist_scripts/`, o `Dockerfile` e a configuração do Firebase Hosting. | **Remover os artefatos não usados do repositório**, junto com `tsconfig.scripts.json`, o script `build:scripts`, o `.dockerignore` e as dependências exclusivas deles: `marked`, `highlight.js`, `front-matter`, `walk`, `fs-extra`, `xml-sitemap` e os `@types` correspondentes. | Domínios **Publicação e Distribuição do Radar**, **Catálogo de Opiniões Tecnológicas** e **Taxonomia de Quadrantes e Anéis** |
| `g5` | Se existe CDN à frente do bucket `techradar.db1.com.br`. | **Há CloudFront**: o passo de invalidação passa a fazer parte do deploy. | Domínio **Publicação e Distribuição do Radar** |
| `g6` | Se quadrantes e anéis são domínio próprio ou parte do catálogo. | **Taxonomia permanece como domínio próprio.** | Domínios **Taxonomia de Quadrantes e Anéis** e **Catálogo de Opiniões Tecnológicas** |
| `g7` | Se marca, canais oficiais e nota legal formam domínio próprio ou integram um guarda-chuva. | **Domínio próprio de identidade institucional.** | Domínio **Identidade Institucional DB1** |

A remoção decidida em `g4` cobre os artefatos nomeados na pergunta e o que depende
exclusivamente deles. O `src/styles/components/hljs.scss` permanece: é uma cópia local de
tema que estiliza os blocos de código já presentes nos corpos das opiniões.
`public/exemple.json` é material de exemplo do radar de origem e não é consumido pela
aplicação.

Nenhuma lacuna segue em aberto.
