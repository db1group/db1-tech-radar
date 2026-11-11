# Casos de teste: validação de configuração com erro legível

Catálogo derivado de [`spec.md`](./spec.md) e [`plan.md`](./plan.md), agrupado pelas cinco histórias
de usuário da spec, seguido da conferência manual, da documentação autoritativa e do portão de
qualidade. A unidade é transversal: as regras validadas pertencem a **Taxonomia de Quadrantes e
Anéis** e a **Visualização do Radar**; a tela de erro e o tratamento de falha de carga vivem na casca
de **Navegação e Descoberta de Tecnologias**; a falha de carga de `db1-opinion.json` e de
`messages.json` toca **Catálogo de Opiniões Tecnológicas** e **Identidade Institucional DB1**; e a
trava no deploy toca **Publicação e Distribuição do Radar**.

## Pré-condições

- Repositório clonado na branch desta unidade, com as dependências instaladas (`yarn install`) e
  Node 16.
- Terminal aberto na raiz do repositório. Em ambiente sem o `yarn` instalado, cada comando tem o
  equivalente direto pelo Node: `node node_modules/typescript/bin/tsc --noEmit`,
  `node node_modules/eslint/bin/eslint.js "src/**/*.tsx"`,
  `CI=true node node_modules/react-scripts/bin/react-scripts.js test --watchAll=false`,
  `node node_modules/react-scripts/bin/react-scripts.js build` e
  `node node_modules/react-scripts/bin/react-scripts.js start`.
- Estado conhecido da base: `yarn ts:check` e `yarn lint` terminam limpos.
  `src/components/Item/Item.test.tsx` e `src/date.test.tsx` falham por transformação de ESM de
  `query-string` e de `moment` — condição pré-existente que esta unidade não altera; as demais suítes
  passam.
- Arquivos novos desta unidade: `src/validateConfig.ts`, `src/validateConfig.test.ts`,
  `src/components/ErrorScreen/ErrorScreen.tsx`, `src/components/ErrorScreen/ErrorScreen.scss` e
  `src/components/ErrorScreen/ErrorScreen.test.tsx`; mais a alteração de `src/components/App.tsx` e do
  passo de teste em `.github/workflows/prod-deploy-app-on-harbor.yml`.
- `public/config.json` versionado, com quatro quadrantes (`languages-and-frameworks`,
  `methods-and-patterns`, `platforms-and-operations`, `tools`), quatro anéis
  (`adopt`, `trial`, `assess`, `hold`) e quatro entradas de `chartConfig.ringsAttributes` com raios
  crescentes, e com `quadrants.<slug>` e `pageHelp.quadrants.<slug>` presentes em
  `src/i18n/translations/{pt,en,es}.json`.
- Aplicação servida por `yarn start` em `localhost:3000`, com inspetor de elementos e console do
  navegador abertos; o idioma é trocado pelas bandeiras do cabeçalho.
- Cópias de configuração com defeito ou com 1, 3, 5 e 6 quadrantes são usadas apenas em memória pela
  suíte `src/validateConfig.test.ts` (clonando o objeto importado) ou como edição local descartável
  de `public/config.json`, desfeita com `git restore public/config.json` ao fim. Nada disso entra no
  commit.

## História 1 — a lista legível de problemas

### TC-1 (obrigatório) — quantidade de quadrantes fora de 1 a 6

1. No terminal, na raiz do repositório, rode
   `CI=true npx react-scripts test --watchAll=false src/validateConfig.test.ts`.

**Esperado:** passam os casos que, partindo do config real com zero quadrantes e com sete quadrantes,
devolvem um problema cada, com mensagem no espírito "configure de 1 a 6 quadrantes no config.json"
que cita a origem do teto — a tabela de lugares dos blocos de rótulo em
`src/components/RadarGrid/radar-grid.scss`. A contagem vem de `segmentCount(config)`.

### TC-2 (obrigatório) — slug presente em só um dos mapas de quadrante

1. Rode `CI=true npx react-scripts test --watchAll=false src/validateConfig.test.ts`.

**Esperado:** passam os casos em que um slug existe só em `quadrants` e em que um slug existe só em
`quadrantsMap`: cada um devolve um problema que nomeia o slug e aponta em qual mapa ele sobra.

### TC-3 (obrigatório) — slot de tela repetido ou com buraco

1. Rode `CI=true npx react-scripts test --watchAll=false src/validateConfig.test.ts`.

**Esperado:** passam os casos com dois quadrantes no mesmo `order` e com um `order` faltando na
sequência de 1 a N — considerando que `order` ausente cai para `position` via `slotOf`. Cada um
devolve um problema que nomeia os slugs em conflito e o valor de slot repetido ou ausente.

### TC-4 (obrigatório) — posição exibida repetida

1. Rode `CI=true npx react-scripts test --watchAll=false src/validateConfig.test.ts`.

**Esperado:** passa o caso com `position` repetida em dois quadrantes: devolve um problema que nomeia
os slugs em conflito e o valor repetido.

### TC-5 (obrigatório) — slug inválido como segmento de URL

1. Rode `CI=true npx react-scripts test --watchAll=false src/validateConfig.test.ts`.

**Esperado:** passam os casos com slug contendo barra, com espaço e com acento: cada um devolve um
problema que nomeia o slug e o caractere inválido. A validação reprova por `/[\/\s]/` ou por caractere
fora de ASCII.

### TC-6 (obrigatório) — geometria dos anéis inconsistente

1. Rode `CI=true npx react-scripts test --watchAll=false src/validateConfig.test.ts`.

**Esperado:** passam os casos com `chartConfig.ringsAttributes` com menos entradas do que `rings` e
com `radius` fora de ordem crescente: cada um devolve um problema que nomeia a divergência.

### TC-7 (obrigatório) — quadrante sem tradução em um idioma

1. Rode `CI=true npx react-scripts test --watchAll=false src/validateConfig.test.ts`.

**Esperado:** passa o caso em que um quadrante perde `quadrants.<slug>` ou
`pageHelp.quadrants.<slug>` com `name` e `description` em um dos idiomas `pt`, `en` ou `es`: devolve
um problema que nomeia o slug e o idioma faltante.

### TC-8 (obrigatório) — a tela de erro renderiza o título e cada problema

1. Rode
   `CI=true npx react-scripts test --watchAll=false src/components/ErrorScreen/ErrorScreen.test.tsx`.

**Esperado:** a suíte passa. Renderizando `ErrorScreen` com um título e uma lista de problemas, o
teste encontra o título e cada problema da lista na tela. A suíte roda até o fim, sem
`SyntaxError: Cannot use import statement outside a module`, porque `ErrorScreen` não importa `d3`
nem i18n.

### TC-9 (obrigatório) — configuração inválida mostra a tela de erro no lugar do Router

1. Em `public/config.json`, numa edição local, troque o `order` de dois quadrantes para o mesmo
   valor.
2. Suba a aplicação com `yarn start`, abra `localhost:3000` e observe a tela e o console do navegador.
3. Desfaça o estado local com `git restore public/config.json`.

**Esperado:** a aplicação renderiza a tela de erro — com título claro, a lista de problemas e a
indicação de que o arquivo a corrigir é `public/config.json` — no lugar do `Router`, sem `TypeError`
e sem tela branca. Os mesmos problemas aparecem no console por `console.error`.

## História 2 — todos os problemas de uma vez

### TC-10 (obrigatório) — vários defeitos listados juntos

1. Rode `CI=true npx react-scripts test --watchAll=false src/validateConfig.test.ts`.

**Esperado:** passa o caso em que uma cópia do config real carrega mais de um defeito ao mesmo tempo:
a lista devolvida contém um problema por defeito, e não apenas o primeiro encontrado.

## História 3 — falha de carregamento

### TC-11 (obrigatório) — JSON inválido em um arquivo de dados mostra a tela de erro

1. Em `public/config.json`, numa edição local, quebre o JSON (por exemplo, apague uma chave de
   fechamento).
2. Suba a aplicação com `yarn start`, abra `localhost:3000` e observe a tela e o console.
3. Desfaça o estado local com `git restore public/config.json`.

**Esperado:** a tela de erro é renderizada no lugar da tela branca, e a falha é registrada no console
por `console.error`. A exceção de `response.json()` é tratada pelo `useFetch`.

### TC-12 (obrigatório) — arquivo de dados ausente (404) mostra a tela de erro

1. Renomeie localmente `public/messages.json` para `public/messages.json.bak`.
2. Suba a aplicação com `yarn start`, abra `localhost:3000` e observe a tela.
3. Repita renomeando `public/db1-opinion.json` e, por fim, `public/config.json`, um de cada vez.
4. Restaure cada arquivo ao nome original ao fim de cada verificação.

**Esperado:** em cada um dos três casos a tela de erro é renderizada no lugar da tela branca. A falha
de `messages.json`, que antes não impedia a aplicação de abrir, agora também leva à tela de erro, por
`!response.ok` no `useFetch`.

### TC-13 (obrigatório) — o useFetch não registra depuração

1. Abra `src/components/App.tsx` e leia o `useFetch`.
2. No terminal, rode `grep -n "console.log\|console.error" src/components/App.tsx`.

**Esperado:** não há `console.log` da URL nem da resposta no `useFetch`; a falha de carga é registrada
apenas por `console.error`. Com a configuração válida, nenhum desses registros roda.

## História 4 — a configuração válida permanece

### TC-14 (obrigatório) — o config.json publicado passa sem problema

1. Rode `CI=true npx react-scripts test --watchAll=false src/validateConfig.test.ts`.

**Esperado:** passa o caso que carrega o `public/config.json` real, com as traduções reais, e obtém
lista de problemas vazia. É o caso que roda no deploy.

### TC-15 (obrigatório) — 1, 3, 5 e 6 quadrantes bem configurados não acusam problema

1. Rode `CI=true npx react-scripts test --watchAll=false src/validateConfig.test.ts`.

**Esperado:** passam os casos com cópias bem configuradas de 1, 3, 5 e 6 quadrantes — cada uma com
`order` contíguo, `position` sem repetição e o predicado de tradução devolvendo verdadeiro para os
slugs — devolvendo lista vazia.

### TC-16 (obrigatório) — o site publicado fica idêntico nos três idiomas, sem aviso no console

1. Suba a aplicação com `yarn start` e abra `localhost:3000` com o `public/config.json` versionado.
2. Percorra a página inicial em português, inglês e espanhol, trocando pelo cabeçalho, com o console
   aberto.

**Esperado:** o site abre como hoje nos três idiomas, com o radar desenhado e as telas de navegação
íntegras, e nenhum aviso aparece no console. A tela de erro não é renderizada.

## História 5 — a trava de publicação

### TC-17 (obrigatório) — o passo de teste existe antes da compilação no workflow

1. Abra `.github/workflows/prod-deploy-app-on-harbor.yml` e leia a sequência de passos.

**Esperado:** entre a instalação das dependências e a compilação existe um passo que roda
`CI=true yarn test src/validateConfig.test.ts`. Ele vem antes do passo de `yarn build` e do
sincronismo com o bucket.

### TC-18 (obrigatório) — configuração inválida falha o passo de teste do deploy

1. Em `public/config.json`, numa edição local, introduza um defeito (por exemplo, remova um quadrante
   de `quadrantsMap` deixando-o só em `quadrants`).
2. Rode `CI=true yarn test src/validateConfig.test.ts`.
3. Leia o código de saída do comando e desfaça o estado local com `git restore public/config.json`.

**Esperado:** o caso da configuração publicada falha e o comando termina com código diferente de 0 —
o mesmo comando do passo do workflow —, de modo que o deploy falharia antes de publicar. Com o
`git restore`, o comando volta a passar.

### TC-19 (obrigatório) — a suíte de validação não alcança o d3 nem a casca

1. Abra `src/validateConfig.test.ts` e `src/validateConfig.ts` e leia os blocos de imports.
2. Rode `CI=true npx react-scripts test --watchAll=false src/validateConfig.test.ts`.

**Esperado:** nenhum dos dois importa `d3`, `App`, `Router`, `RadarGrid` ou `RadarChart`; a única
importação de `src/components/Chart/` é `geometry.ts`, que não importa `d3`. A suíte roda até o fim,
sem `SyntaxError: Cannot use import statement outside a module`.

## Conferência manual

### TC-20 (obrigatório) — sétimo quadrante, slots repetidos e tradução faltando

1. Em `public/config.json`, numa edição local, acrescente um sétimo quadrante de teste nos dois
   mapas, deixe dois quadrantes com o mesmo `order` e remova a tradução em espanhol de um slug em
   `src/i18n/translations/es.json`.
2. Suba a aplicação com `yarn start`, abra `localhost:3000` e leia a tela de erro.
3. Desfaça o estado local com `git restore public/config.json src/i18n/translations/es.json`.

**Esperado:** a tela de erro aparece com uma mensagem correspondente a cada defeito: o teto de seis
quadrantes ultrapassado, o slot de tela repetido com os slugs em conflito e o slug sem tradução em
`es` nomeando o idioma.

### TC-21 (obrigatório) — a conferência não entra no commit

1. Depois de TC-9, TC-11, TC-12, TC-18 e TC-20, rode `git status --porcelain`.

**Esperado:** nem `public/config.json`, nem `public/db1-opinion.json`, nem os dicionários de
`src/i18n/translations/` aparecem como alterados; nenhum quadrante de teste entra no commit da
unidade.

## Documentação autoritativa

### TC-22 (obrigatório) — a skill da taxonomia registra a validação da configuração

1. Abra `.agents/skills/taxonomia-de-quadrantes-e-aneis/SKILL.md` e leia *Restrições e validações*.

**Esperado:** o fechamento "Não há validação automática" passa a valer só para o acervo (regra 11); a
configuração é descrita como verificada no carregamento, e cada restrição da seção — mesmo conjunto
de slugs nos dois mapas, `order` contíguo sem repetição, `position` sem repetição, slug como segmento
de URL, uma entrada de geometria por anel com raios crescentes, os três idiomas obrigatórios e o
número de quadrantes de 1 a 6 — é apontada com mensagem legível.

### TC-23 (obrigatório) — a skill do gráfico registra o teto de seis verificado no carregamento

1. Abra `.agents/skills/componente-grafico-do-radar/SKILL.md` e leia *Bloco de rótulo e teto de seis
   quadrantes*.

**Esperado:** o teto de seis, vindo da tabela de lugares de `radar-grid.scss`, é descrito como
verificado no carregamento da configuração: um sétimo quadrante produz um problema legível em vez de
só sobrepor o bloco do slot 6.

### TC-24 (obrigatório) — a skill de publicação registra a trava e a tela de erro

1. Abra `.agents/skills/publicacao-e-distribuicao-do-radar/SKILL.md` e leia as regras 2 e 10 e
   *Restrições e validações*.

**Esperado:** a regra 2 inclui, entre instalar e compilar, o passo que roda o teste do `config.json`
real; a regra 10 deixa de dizer que a compilação é a única barreira automática, porque o teste da
configuração também barra a publicação, mantendo o acervo sem verificação; em *Restrições e
validações*, "Nenhuma verificação de regressão automática" ressalva esse teste e "Falha de carga de
dados é silenciosa para o leitor" passa a descrever a tela de erro no lugar da tela branca, inclusive
quando é o `messages.json` que falha.

### TC-25 (obrigatório) — o AGENTS.md deixa de dizer que nada valida a configuração

1. Abra `AGENTS.md` e leia a restrição global "De um a seis quadrantes" e a restrição "Revisão
   humana como único controle".

**Esperado:** a restrição "De um a seis quadrantes" descreve a configuração como verificada no
carregamento, com tela de erro legível, e um sétimo quadrante apontado por ela; não diz mais que
"nada valida a configuração". A restrição "Revisão humana como único controle" permanece, por tratar
da conformidade do acervo com a taxonomia, fora do escopo desta unidade.

### TC-26 (recomendado) — o mapa funcional acompanha a validação e a trava

1. Abra `.agents/maps/functional-map.md` e leia as regras inferidas do domínio Taxonomia de
   Quadrantes e Anéis e a evidência do domínio Publicação e Distribuição do Radar.

**Esperado:** no domínio Taxonomia, a regra inferida de que "nada valida a configuração em tempo de
build" passa a registrar a verificação no carregamento e a trava no deploy; no domínio Publicação, a
evidência do workflow inclui o passo de teste do `config.json` real, e a tela branca por falha de
carga dá lugar à tela de erro.

## Portão de qualidade

### TC-27 (obrigatório) — checagem de tipos

1. No terminal, na raiz do repositório, rode `yarn ts:check`.

**Esperado:** o comando termina com código 0, sem nenhum erro reportado.

### TC-28 (obrigatório) — lint sem avisos

1. No terminal, na raiz do repositório, rode `CI=true yarn lint`.

**Esperado:** o comando termina com código 0, sem erro e sem nenhum aviso do ESLint — a condição em
que o build do GitHub Actions roda, onde aviso é tratado como erro.

### TC-29 (obrigatório) — suítes novas passam e a base não regride

1. No terminal, na raiz do repositório, rode `yarn test`.

**Esperado:** `src/validateConfig.test.ts` e `src/components/ErrorScreen/ErrorScreen.test.tsx` passam
inteiras, e nenhuma suíte que já passava entra em falha. `src/components/Item/Item.test.tsx` e
`src/date.test.tsx` continuam falhando pela transformação de ESM já existente na base.

### TC-30 (obrigatório) — build de produção

1. No terminal, na raiz do repositório, rode `yarn build`.

**Esperado:** o comando termina com código 0 e gera o pacote em `build/`, sem erro de compilação.
</content>
