# Plan: validação de configuração com erro legível

Visão técnica da unidade descrita em [`spec.md`](./spec.md).

## Stack e estrutura

A unidade trabalha dentro da SPA em React 18 com Create React App e TypeScript em modo `strict`, sem
acrescentar nem remover dependência. O carregamento dos três JSON e a casca da aplicação vivem em
`src/components/App.tsx`; o contrato da configuração está em `src/config.ts` (`ConfigData`) e
`src/model.ts` (`QuadrantConfig`, `Language`); a contagem de quadrantes e o slot de tela têm origem
única em `src/components/Chart/geometry.ts` (`segmentCount`, `slotOf`), importável sem arrastar `d3`.
O i18n é inicializado com os três dicionários em `src/i18n/index.ts`.

A função de validação é código novo de raiz da aplicação, ao lado de `config.ts` e `sanitize.ts`; a
tela de erro é um componente próprio em `src/components/ErrorScreen/`, com SCSS ao lado do `.tsx` e
nomes de classe em padrão BEM, conforme o `AGENTS.md`. A suíte roda na infraestrutura Jest embutida
no `react-scripts` 5, com `src/setupTests.ts` carregado automaticamente, sem arquivo de configuração
próprio. O portão de qualidade continua sendo `yarn ts:check`, `yarn lint` e `yarn build`; o workflow
de publicação `.github/workflows/prod-deploy-app-on-harbor.yml` ganha um passo de teste.

## Decisões técnicas

Uma linha por veredito; contexto, alternativas e evidência em [`research.md`](./research.md).

- **Função de validação**: `validateConfig(config: ConfigData, hasTranslation: (key: string, lng: Language) => boolean): string[]`,
  em `src/validateConfig.ts`, pura e sem `d3`, devolvendo a lista de todas as mensagens de problema.
- **Consulta de tradução**: predicado injetado; em `App.tsx`,
  `(key, lng) => i18n.exists(key, { lng })`; na suíte, um predicado sobre os dicionários importados.
- **Relação com `translations.test.tsx`**: superfícies separadas, sem função compartilhada — a
  completude da configuração vive só em `validateConfig`; a suíte dos dicionários segue com órfãos,
  ordem e texto da página de ajuda.
- **Regras validadas** (sobre `config.quadrants`, `config.quadrantsMap`, `config.rings`,
  `config.chartConfig.ringsAttributes`):
  - quantidade de quadrantes de 1 a 6, por `segmentCount(config)`; a mensagem cita a origem do teto
    (a tabela de lugares dos blocos de rótulo em `src/components/RadarGrid/radar-grid.scss`);
  - `quadrants` e `quadrantsMap` com o mesmo conjunto de slugs, nomeando o slug que sobra em cada mapa;
  - slot de tela resolvido por `slotOf` contíguo de 1 a N, sem repetição, nomeando os slugs em
    conflito e o valor repetido ou ausente;
  - `position` sem repetição, nomeando os slugs e o valor;
  - slug sem barra, sem espaço e sem acento (inválido por `/[\/\s]/` ou por caractere fora de ASCII),
    nomeando o slug;
  - uma entrada de `ringsAttributes` por anel de `rings`, com `radius` estritamente crescente;
  - `quadrants.<slug>` e `pageHelp.quadrants.<slug>` com `name` e `description` em `pt`, `en` e `es`,
    nomeando o slug e o idioma faltante.
- **Formato do problema**: `string[]`, cada mensagem já nomeando campo, slug e valor.
- **Reuso da geometria**: `validateConfig` importa `segmentCount` e `slotOf` de
  `src/components/Chart/geometry.ts`, que não importa `d3`.
- **Tela de erro**: componente `ErrorScreen` em `src/components/ErrorScreen/ErrorScreen.tsx`, props
  `{ title: string; description: string; problems?: string[] }`, sem `d3` nem i18n; renderiza o
  título, a descrição e, quando há, a lista de problemas.
- **Idioma da tela de erro**: inglês, fixo no componente e nas mensagens de `validateConfig`, fora
  dos dicionários de tradução.
- **Fluxo em `App.tsx`**: `useFetch` passa a devolver `{ data?: D; error?: boolean }`; qualquer um
  dos três carregamentos com `error` renderiza `ErrorScreen` no lugar do `Router`; com acervo e
  configuração presentes, `validateConfig` roda e, havendo problemas, cada um vai para `console.error`
  e a tela de erro é renderizada; configuração válida mantém o comportamento de hoje. O `messages`
  segue sem bloquear a renderização, mas a sua falha mostra a tela de erro.
- **`useFetch`**: detecta falha por `!response.ok` e pela exceção de `response.json()`; os dois
  `console.log` de depuração saem; a falha é registrada por `console.error`.
- **Trava de publicação**: passo
  `CI=true yarn test src/validateConfig.test.ts` em
  `.github/workflows/prod-deploy-app-on-harbor.yml`, entre a instalação das dependências e a
  compilação; a falha do teste falha o deploy.
- **Sem troca de `REACT_APP_BUILDHASH`**: a unidade altera `.tsx`, `.ts` e um `.scss` compilados
  dentro do pacote, e o workflow; nenhum arquivo servido de `public/` muda.
- **`research.md`**: gerado, em [`research.md`](./research.md) — as decisões carregam alternativas e a
  evidência lida em `node_modules`, no `package.json` e nos módulos do projeto.

## Modelo de dados

Nenhuma alteração de contrato de dados: `public/config.json`, `ConfigData` e `QuadrantConfig` ficam
como estão, e `validateConfig` devolve `string[]`, sem novo tipo exportado. `data-model.md` fica
dispensado.

## Contratos externos

Nenhum. A aplicação não expõe nem consome API; os três JSON de `public/` são lidos pelo próprio
navegador a partir do mesmo domínio. `contracts/` fica dispensado.

## Interface

Uma superfície nova, a tela de erro, e uma tela existente preservada, o site com configuração válida.
Como é um único componente simples, `ui/` fica dispensado e a descrição está aqui.

`ErrorScreen` ocupa a área da aplicação no lugar do `Router`, em dois usos:

| Uso | `title` | `description` | `problems` |
| --- | --- | --- | --- |
| Configuração inválida | título que identifica o erro de configuração | aponta que o arquivo a corrigir é `public/config.json` | a lista devolvida por `validateConfig` |
| Falha de carregamento | título que identifica a falha de carga | aponta qual dos três JSON não pôde ser baixado ou interpretado | vazio |

O componente renderiza o título como cabeçalho, a descrição e, quando `problems` tem itens, uma lista
com um `<li>` por problema. Não lê i18n nem importa `d3`, o que o mantém renderizável pela Testing
Library. Com configuração válida e os três JSON carregados, a casca monta o `Router` exatamente como
hoje.

## Estratégia de testes

A infraestrutura já existe e nada novo é introduzido: Jest e Testing Library vêm do `react-scripts`
5, `src/setupTests.ts` é carregado automaticamente e a descoberta cobre qualquer `*.test.ts(x)` sob
`src/`. Os arquivos ficam ao lado do código, com nomes de caso em inglês, conforme a skill
[`estrategia-de-testes`](../../skills/estrategia-de-testes/SKILL.md). Nenhum deles importa `d3` nem
renderiza `App`, `Router`, `RadarGrid` ou `RadarChart`.

- **Unitário, `src/validateConfig.test.ts`** — importa `public/config.json` e os três dicionários
  como `translations.test.tsx` já faz, e exercita `validateConfig` com um predicado de tradução sobre
  os dicionários importados:
  - **Configuração publicada** — o `public/config.json` real, com as traduções reais, devolve lista
    vazia. É o caso que roda no deploy e trava a publicação de configuração inválida.
  - **Um caso por regra** — partindo de uma cópia do config real com um único defeito: 0 e 7
    quadrantes; slug só em `quadrants` e slug só em `quadrantsMap`; `order` repetido e `order` com
    buraco; `position` repetida; slug com barra, com espaço e com acento; `ringsAttributes` com menos
    entradas que `rings` e com raios fora de ordem; slug sem tradução em um idioma, com a mensagem
    nomeando o slug e o idioma.
  - **Vários defeitos de uma vez** — uma cópia com mais de um defeito devolve um problema por defeito.
  - **Quantidades válidas** — cópias bem configuradas com 1, 3, 5 e 6 quadrantes, com o predicado de
    tradução devolvendo verdadeiro para os slugs de teste, devolvem lista vazia.
- **Componente, `src/components/ErrorScreen/ErrorScreen.test.tsx`** — com a Testing Library, renderiza
  `ErrorScreen` e confere que o título e cada problema recebido aparecem na tela.
- **Trava de publicação** — o passo `CI=true yarn test src/validateConfig.test.ts` no workflow de
  deploy roda a suíte de validação antes da compilação; o teste da configuração publicada falha o
  deploy quando o `public/config.json` versionado é inválido.
- **Conferência manual (nada commitado)** — com `yarn start`: um sétimo quadrante de teste, dois
  quadrantes no mesmo `order` e um slug sem tradução em `es` fazem aparecer a tela de erro com a
  mensagem de cada defeito; depois, `git restore` em `public/config.json` e `public/db1-opinion.json`.
  Com a configuração publicada, o site abre idêntico ao de hoje nos três idiomas, sem aviso no
  console.
- **Portão de qualidade** — `yarn ts:check`, `yarn lint` e `yarn build` terminam limpos, com `CI=true`
  tratando aviso do ESLint como erro no build do GitHub Actions. `src/validateConfig.test.ts` e
  `src/components/ErrorScreen/ErrorScreen.test.tsx` passam inteiros; `Item.test.tsx` e `date.test.tsx`
  seguem vermelhos na base por transformação de ESM de `query-string` e de `moment`, condição que
  esta unidade não altera.

## Impacto na documentação autoritativa

Esta unidade acrescenta, deliberadamente, a verificação automática da configuração no carregamento e
torna o teste do `config.json` real uma trava de publicação. A decisão está na descrição da unidade e
na resposta do gap que decidiu acrescentar o passo de teste ao workflow de deploy. Cada item abaixo
vira tarefa de documentação na fase `tasks`, executada junto com o código. As edições são reescritas
no estado final das seções existentes; a medida contra a skill
[`skill-authoring`](../../skills/skill-authoring/SKILL.md) indica que as três skills afetadas estão
dentro das regras — `description` de cada uma permanece, porque o escopo não muda, e o bloco de
manutenção já existe —, então nenhuma reestruturação acompanha a mudança, só a reescrita das seções
abaixo.

- **`.agents/skills/taxonomia-de-quadrantes-e-aneis/SKILL.md`** — em *Restrições e validações*, o
  fechamento "Não há validação automática" passa a valer só para o acervo (regra 11): a configuração
  é verificada no carregamento, e cada restrição listada na seção — mesmo conjunto de slugs nos dois
  mapas, `order` contíguo sem repetição, `position` sem repetição, slug como segmento de URL, uma
  entrada de geometria por anel com raios crescentes, os três idiomas obrigatórios, o número de
  quadrantes de 1 a 6 — passa a ser apontada com mensagem legível em vez de só pelo sintoma.
- **`.agents/skills/componente-grafico-do-radar/SKILL.md`** — em *Bloco de rótulo e teto de seis
  quadrantes*, o teto de seis, vindo da tabela de lugares de `radar-grid.scss`, passa a registrar que
  é verificado no carregamento da configuração: um sétimo quadrante produz um problema legível em vez
  de só sobrepor o bloco do slot 6.
- **`.agents/skills/publicacao-e-distribuicao-do-radar/SKILL.md`** — a regra 2 ganha, entre instalar
  e compilar, o passo que roda o teste do `config.json` real; a regra 10 deixa de dizer que a
  compilação é a única barreira automática, porque o teste da configuração também barra a publicação
  (o acervo continua sem verificação); em *Restrições e validações*, "Nenhuma verificação de
  regressão automática" passa a ressalvar esse teste, e "Falha de carga de dados é silenciosa para o
  leitor" passa a descrever a tela de erro no lugar da tela branca, inclusive quando é o
  `messages.json` que falha.
- **`AGENTS.md`** — em *Restrições globais*, a restrição "De um a seis quadrantes" deixa de dizer que
  "nada valida a configuração": a configuração é verificada no carregamento, com tela de erro
  legível, e um sétimo quadrante é apontado por ela. A restrição "Revisão humana como único controle"
  continua, porque trata da conformidade do acervo com a taxonomia, fora do escopo desta unidade.
- **`.agents/maps/functional-map.md`** — no domínio Taxonomia de Quadrantes e Anéis, a regra inferida
  de que "nada valida a configuração em tempo de build" passa a registrar a verificação no
  carregamento e a trava no deploy; no domínio Publicação e Distribuição do Radar, a evidência do
  workflow passa a incluir o passo de teste do `config.json` real, e a tela branca por falha de carga
  dá lugar à tela de erro.

Sem impacto em `.agents/skills/navegacao-e-descoberta-de-tecnologias/SKILL.md`: a tela de erro
substitui o `Router` na casca antes de qualquer tela ser montada e não é um endereço do domínio, de
modo que o conjunto de telas, a resolução de nome e o comportamento de nome não resolvido ficam como
estão. Sem impacto em `.agents/skills/catalogo-de-opinioes-tecnologicas/SKILL.md` e
`.agents/skills/identidade-institucional-db1/SKILL.md`: o acervo e o conteúdo institucional não são
validados, e a falha de carga dos seus arquivos apenas passa a mostrar a tela de erro, comportamento
de carregamento já descrito no domínio de publicação. Sem impacto em
`.agents/skills/estrategia-de-testes/SKILL.md` e `.agents/skills/internacionalizacao-do-radar/SKILL.md`:
a unidade segue as convenções que elas já descrevem, sem alterá-las.
</content>
