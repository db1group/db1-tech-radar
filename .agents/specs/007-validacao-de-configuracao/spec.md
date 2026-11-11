# Spec: validação de configuração com erro legível

## Visão geral

O `public/config.json` passa a ser verificado assim que é carregado: uma configuração inválida
produz uma tela de erro com a lista legível de todos os problemas — cada um nomeando campo, slug e
valor — no lugar da tela branca ou do `TypeError` de hoje, e o `public/config.json` real é conferido
por um teste que roda no deploy e trava a publicação de uma configuração inválida.

## Domínios envolvidos

Mudança transversal: não é filha de nenhum domínio. Os domínios afetados, com o impacto em cada um:

| Domínio | Impacto desta unidade | Documentação autoritativa |
| --- | --- | --- |
| Taxonomia de Quadrantes e Anéis | As regras da seção "Restrições e validações" — mesmo conjunto de slugs nos dois mapas, `order` contíguo de 1 a N sem repetição, `position` sem repetição, slug válido como segmento de URL, rótulo e descrição nos três idiomas — ganham uma verificação automática no carregamento. A configuração deixa de depender só do sintoma; o acervo continua sem validação automática (regra 11). | [`taxonomia-de-quadrantes-e-aneis/SKILL.md`](../../skills/taxonomia-de-quadrantes-e-aneis/SKILL.md) |
| Visualização do Radar | O teto de seis quadrantes — que vem da tabela de lugares dos blocos de rótulo — e a regra de uma entrada de `chartConfig.ringsAttributes` por anel, com raios crescentes, passam a ser conferidos no carregamento. `segmentCount` de `src/components/Chart/geometry.ts` é a origem da quantidade de quadrantes verificada. | [`componente-grafico-do-radar/SKILL.md`](../../skills/componente-grafico-do-radar/SKILL.md) |
| Navegação e Descoberta de Tecnologias | A casca de navegação em `src/components/App.tsx` passa a renderizar uma tela de erro própria no lugar do `Router` quando a configuração é inválida ou quando o carregamento de um dos JSON falha. O `useFetch` ganha tratamento de falha de rede, 404 e JSON inválido e perde os dois `console.log` de depuração. | [`navegacao-e-descoberta-de-tecnologias/SKILL.md`](../../skills/navegacao-e-descoberta-de-tecnologias/SKILL.md) |
| Catálogo de Opiniões Tecnológicas | A falha ao baixar ou interpretar `public/db1-opinion.json` passa a mostrar a tela de erro no lugar da tela branca. O conteúdo do acervo não é validado: item com quadrante ou anel desconhecido continua omitido do gráfico, como hoje. | [`catalogo-de-opinioes-tecnologicas/SKILL.md`](../../skills/catalogo-de-opinioes-tecnologicas/SKILL.md) |
| Identidade Institucional DB1 | A falha ao baixar ou interpretar `public/messages.json` passa a mostrar a tela de erro no lugar de carregar a aplicação sem rodapé institucional. | [`identidade-institucional-db1/SKILL.md`](../../skills/identidade-institucional-db1/SKILL.md) |
| Publicação e Distribuição do Radar | O workflow de deploy ganha um passo que roda o teste do `public/config.json` real antes de compilar e publicar, tornando a validação uma trava de publicação: uma configuração inválida faz o deploy falhar antes de o site ir ao ar. | [`publicacao-e-distribuicao-do-radar/SKILL.md`](../../skills/publicacao-e-distribuicao-do-radar/SKILL.md) |

A convenção de testes com Jest e Testing Library e o que conta como lógica testável neste projeto
vêm da skill técnica [`estrategia-de-testes`](../../skills/estrategia-de-testes/SKILL.md); a
mecânica de i18next usada para consultar os três idiomas vem da skill técnica
[`internacionalizacao-do-radar`](../../skills/internacionalizacao-do-radar/SKILL.md).

Ficou fora da análise, por não ter artefato tocado nem comportamento alterado, o domínio
**Governança de Contribuição do Radar**: a página de ajuda, o `CONTRIBUTING.md` e o processo
editorial não participam da validação; a completude das traduções de quadrante é regra da taxonomia,
apenas lida pela validação, e a página de ajuda não muda.

## Escopo

**Dentro:**

- Verificação da configuração carregada que devolve, de uma vez, todos os problemas encontrados,
  cada um com mensagem legível que nomeia o campo, o slug e o valor.
- Tela de erro própria, no lugar da aplicação, com título claro, a lista de problemas e a indicação
  de que o arquivo a corrigir é `public/config.json`.
- Tratamento de falha de carregamento de qualquer um dos três JSON estáticos (rede, 404, JSON
  inválido), mostrando a mesma tela de erro no lugar da tela branca.
- Registro dos mesmos problemas no console com `console.error`.
- Trava de publicação: o teste do `public/config.json` real roda no deploy e impede publicar uma
  configuração inválida.
- Comportamento idêntico ao de hoje, nos três idiomas e sem aviso no console, quando a configuração
  publicada é válida.

**Fora:**

- Validar o acervo (`public/db1-opinion.json`): item com quadrante ou anel desconhecido continua
  ignorado no gráfico, como hoje.
- Validação em tempo de build ou no CI além do teste do `public/config.json` real.
- Suportar mais de seis quadrantes.
- Conferência final com três, cinco e seis quadrantes de verdade, aceite ponta a ponta e o guia de
  contribuição.
- Renomear `quadrant` para `segment`.
- Tornar o posicionamento dos pontos determinístico.

## Fronteira de domínio

**Esta spec implementa:**

- Função pura de validação (ex.: `validateConfig`), sem React e sem `d3`, que recebe a configuração
  e a forma de consultar as traduções e devolve a lista de todos os problemas. Arquivo, assinatura e
  reaproveitamento (ou não) da regra da suíte `src/i18n/translations.test.tsx` definidos no
  [`plan.md`](./plan.md).
- Componente de tela de erro, sem `d3`, que recebe o título, a instrução e a lista de problemas e os
  renderiza. Arquivo e idioma dos textos fixos definidos no [`plan.md`](./plan.md).
- Alterações em `src/components/App.tsx`: executar a validação quando o `config` chega; renderizar a
  tela de erro no lugar do `Router` quando houver problema ou quando o carregamento falhar; registrar
  os problemas com `console.error`.
- Alterações no `useFetch` de `src/components/App.tsx`: tratar falha de rede, 404 e JSON inválido e
  sinalizar o erro; remover os dois `console.log` de depuração.
- Passo de teste no workflow `.github/workflows/prod-deploy-app-on-harbor.yml`, antes da compilação,
  que roda o teste do `public/config.json` real. O passo roda apenas a suíte de validação, para que
  as suítes já vermelhas na base por transformação de ESM não entrem na trava; a invocação exata fica
  no [`plan.md`](./plan.md).
- Suíte de teste da validação (Jest), sem importar `d3` nem renderizar `App`, `Router`, `RadarGrid`
  ou `RadarChart`, cobrindo o `public/config.json` real, um caso por regra, vários defeitos de uma
  vez e as quantidades válidas de 1, 3, 5 e 6 quadrantes.
- Suíte de componente da tela de erro com Testing Library, se ela não puxar `d3`.
- Atualizações de documentação listadas na seção de impacto do [`plan.md`](./plan.md) desta unidade.

**Pertence a outras unidades (não vira tarefa aqui):**

- `segmentCount` e `slotOf` em `src/components/Chart/geometry.ts` — origem da quantidade de
  quadrantes e da resolução do slot de tela, consumidas sem alteração.
- Suíte `src/i18n/translations.test.tsx` — a consistência dos dicionários no teste já existe; se a
  validação de runtime reaproveita a mesma função é decisão do [`plan.md`](./plan.md), sem alterar a
  suíte aqui.
- `src/i18n/index.ts` e `src/i18n/translations/{pt,en,es}.json` — mecanismo e dado de tradução,
  consumidos para conferir a presença das chaves.
- `ConfigData` e `QuadrantConfig` em `src/config.ts` e `src/model.ts` — contrato da configuração,
  consumido sem alteração de forma.
- Campos de `public/config.json` — o dado publicado não muda nesta unidade.
- `src/components/RadarGrid/radar-grid.scss` — a tabela de lugares dos blocos, origem do teto de
  seis, consumida como fonte da regra, não alterada.
- `REACT_APP_BUILDHASH` em `.env` — esta unidade não altera arquivo servido de `public/`.

## Histórias de usuário

1. Como pessoa que edita o `public/config.json`, quero que um erro de configuração apareça numa tela
   com a lista de todos os problemas, cada um nomeando campo, slug e valor, para corrigir o arquivo
   sem precisar descobrir o motivo pelo sintoma.
2. Como pessoa que edita o `public/config.json`, quero ver todos os problemas de uma vez, e não só o
   primeiro, para não corrigir um erro por rodada.
3. Como pessoa que abre o site, quero uma tela de erro clara quando o `config.json`, o
   `db1-opinion.json` ou o `messages.json` não puder ser baixado ou interpretado, para não ficar
   diante de uma tela branca sem pista.
4. Como pessoa que lê o radar publicado, quero o site idêntico ao de hoje nos três idiomas quando a
   configuração é válida, sem nenhum aviso no console, para não perceber diferença alguma.
5. Como pessoa que publica o radar, quero que uma configuração inválida faça o deploy falhar antes de
   ir ao ar, para que uma regra quebrada não derrube o site publicado.

## Critérios de aceite

**História 1 — a lista legível de problemas:**

- Dada uma configuração com o número de quadrantes fora de 1 a 6 (zero ou sete), quando a validação
  roda, então há um problema que diz, no espírito da v5, para configurar de 1 a 6 quadrantes no
  `config.json`.
- Dada uma configuração em que um slug aparece só em `quadrants` ou só em `quadrantsMap`, quando a
  validação roda, então há um problema que nomeia o slug e aponta em qual mapa ele sobra.
- Dada uma configuração com dois quadrantes no mesmo `order`, ou com um `order` faltando na sequência
  de 1 a N — considerando que `order` ausente cai para `position` via `slotOf` —, quando a validação
  roda, então há um problema que nomeia os slugs em conflito e o valor de slot repetido ou ausente.
- Dada uma configuração com `position` repetida, quando a validação roda, então há um problema que
  nomeia os slugs em conflito e o valor repetido.
- Dado um slug de quadrante com barra, com espaço ou com acento, quando a validação roda, então há um
  problema que nomeia o slug e o caractere inválido.
- Dada uma configuração com menos entradas de `chartConfig.ringsAttributes` do que anéis em `rings`,
  ou com raios fora de ordem crescente, quando a validação roda, então há um problema que nomeia a
  divergência.
- Dado um quadrante sem `quadrants.<slug>` ou sem `pageHelp.quadrants.<slug>` com `name` e
  `description` em um dos idiomas `pt`, `en` ou `es`, quando a validação roda, então há um problema
  que nomeia o slug e o idioma faltante.
- Dada uma configuração inválida, quando `App` a recebe, então a tela de erro é renderizada no lugar
  do `Router`, com título claro, a lista de problemas e a indicação de que o arquivo a corrigir é
  `public/config.json`, sem `TypeError` nem tela branca, e os mesmos problemas são registrados com
  `console.error`.

**História 2 — todos os problemas de uma vez:**

- Dada uma configuração com mais de um defeito ao mesmo tempo, quando a validação roda, então a lista
  devolvida contém um problema por defeito, e não apenas o primeiro encontrado.

**História 3 — falha de carregamento:**

- Dada uma falha de rede, um 404 ou um JSON inválido ao buscar `config.json`, `db1-opinion.json` ou
  `messages.json`, quando `App` carrega, então a tela de erro é renderizada no lugar da tela branca.
- Dado o `useFetch` de `src/components/App.tsx`, quando o arquivo é lido, então não há `console.log`
  de depuração da URL nem da resposta.

**História 4 — a configuração válida permanece:**

- Dado o `public/config.json` publicado com as traduções reais, quando a validação roda, então a
  lista de problemas é vazia.
- Dada a configuração publicada, quando o site é aberto em `pt`, `en` e `es`, então ele é idêntico ao
  de hoje e nenhum aviso aparece no console.
- Dado o `public/config.json` publicado, com 1, 3, 5 e com 6 quadrantes bem configurados em cópias de
  teste, quando a validação roda sobre cada uma, então nenhuma delas aponta problema.

**História 5 — a trava de publicação:**

- Dado o `public/config.json` real, lido pela suíte a partir do arquivo versionado e não de uma
  cópia, quando o teste roda, então ele passa sem nenhum problema.
- Dado o workflow de deploy, quando ele roda num push em `main`, então o passo que executa o teste do
  `config.json` real roda antes da compilação e, se o teste falhar, o deploy falha e nada é publicado.
- Dada a suíte de validação, quando ela roda, então nenhum módulo que importe `d3` entra no grafo de
  importação e nenhum de `App`, `Router`, `RadarGrid` ou `RadarChart` é renderizado.

**Conferência manual (nada disso é commitado):**

- Dado um sétimo quadrante de teste, dois quadrantes no mesmo `order` e um slug sem tradução em `es`,
  quando o site é aberto, então aparece a tela de erro com a mensagem correspondente a cada defeito.
- Dado o commit desta unidade, quando o diff é lido, então `public/config.json` e
  `public/db1-opinion.json` ficam como estão versionados.

**Portão de qualidade:**

- Dado o repositório alterado, quando `yarn ts:check` roda, então termina com código 0.
- Dado o repositório alterado, quando `yarn lint` roda, então termina com código 0 e sem nenhum aviso
  do ESLint, porque o build do GitHub Actions roda com `CI=true` e trata aviso como erro.
- Dado o repositório alterado, quando `yarn build` roda, então o pacote de produção é gerado sem erro.
- Dado o repositório alterado, quando a suíte de validação e a da tela de erro rodam, então os testes
  novos passam. `Item.test.tsx` e `date.test.tsx` seguem falhando por transformação de ESM de
  `query-string` e de `moment`, condição que já existe na base e que esta unidade não altera.

## Comportamento atual → novo

| Aspecto | Hoje | Depois desta unidade |
| --- | --- | --- |
| Configuração inválida | Tela branca, `TypeError` (ex.: `ringsAttributes` com menos entradas que anéis) ou radar desenhado errado sem erro algum. | Tela de erro com a lista de todos os problemas, cada um nomeando campo, slug e valor, e os mesmos problemas em `console.error`. |
| Falha ao carregar um JSON | `useFetch` apenas registra o erro; o app fica em branco para sempre. | A mesma tela de erro é renderizada no lugar da tela branca para falha de `config.json`, `db1-opinion.json` ou `messages.json`. |
| Depuração no `useFetch` | `console.log(url)` e `console.log(response)` rodam a cada carregamento. | Os dois `console.log` de depuração saem; a falha é tratada. |
| Teto de seis quadrantes | Vem da tabela de lugares dos blocos de rótulo e não é conferido; um sétimo quadrante sobrepõe o bloco do slot 6 sem erro. | Conferido no carregamento; um sétimo quadrante produz um problema legível. |
| Trava de publicação | O deploy só instala, compila e publica; nenhum teste roda, e uma configuração inválida vai ao ar. | Um passo do deploy roda o teste do `config.json` real antes de compilar; configuração inválida faz o deploy falhar. |

O que permanece intocado com uma configuração válida: o desenho do radar, as telas de navegação, os
três idiomas, o acervo, a taxonomia publicada, o identificador de build e o fluxo de publicação. O
acervo continua sem validação automática: item com quadrante ou anel inexistente segue omitido do
gráfico, sem erro.

## Dependências entre domínios

- **Visualização do Radar** — `segmentCount` e `slotOf` em `src/components/Chart/geometry.ts` são a
  origem da quantidade de quadrantes e da resolução do slot de tela que a validação consome; a tabela
  de lugares em `src/components/RadarGrid/radar-grid.scss` é a origem do teto de seis.
- **Taxonomia de Quadrantes e Anéis** — as regras validadas são as da seção "Restrições e validações"
  da skill; `public/config.json` traz os dois mapas de quadrante, `order`, `position` e
  `ringsAttributes`, e os dicionários trazem `quadrants.<slug>` e `pageHelp.quadrants.<slug>`.
- **Navegação e Descoberta de Tecnologias** — a tela de erro vive dentro da casca de `App.tsx` e a
  substitui o `Router`; a validação não altera as telas de navegação quando a configuração é válida.
- **Catálogo de Opiniões Tecnológicas** e **Identidade Institucional DB1** — a falha de carregamento
  de `db1-opinion.json` e de `messages.json` passa pela mesma tela de erro; o conteúdo desses
  arquivos não é validado.
- **Publicação e Distribuição do Radar** — o workflow `.github/workflows/prod-deploy-app-on-harbor.yml`
  passa a rodar o teste do `config.json` real antes de compilar e publicar.

## Riscos e observações

- **Sem esta unidade, quem edita o `config.json` errado vê tela branca sem pista (R8).** A falta de
  verificação em `src/components/App.tsx` e o `useFetch` que não trata falha deixam o editor sem
  diagnóstico; a tela de erro com a lista de problemas é a resposta direta a esse risco.
- **O teto de seis não é arbitrário (R7).** Ele vem da tabela de lugares dos blocos de rótulo em
  `src/components/RadarGrid/radar-grid.scss`, que declara um lugar por slot até seis. A origem fica
  registrada na skill `componente-grafico-do-radar`, para que a mensagem de "configure de 1 a 6
  quadrantes" não pareça um limite sem motivo.
- **A validação roda a cada carregamento, então uma regra errada derruba o site publicado.** O teste
  do `public/config.json` real, agora rodado no deploy antes de publicar, é a trava contra essa
  regressão: ele falha o deploy se a validação acusar a configuração publicada.
- **O passo de teste no deploy roda só a suíte de validação.** `Item.test.tsx` e `date.test.tsx`
  falham na base por transformação de ESM de `query-string` e de `moment`; rodar `yarn test` inteiro
  no deploy faria a trava quebrar por uma condição pré-existente e sem relação com a configuração. O
  passo mira a suíte de validação; a invocação exata fica no [`plan.md`](./plan.md).
- **A validação das traduções não duplica a suíte dos dicionários.** A regra de que cada slug de
  quadrante tem `quadrants.<slug>` e `pageHelp.quadrants.<slug>` nos três idiomas já é conferida por
  `src/i18n/translations.test.tsx`; se a validação de runtime reaproveita a mesma função ou consulta
  o i18next por idioma (`i18n.exists` com `lng`) fica no [`plan.md`](./plan.md).
- **O idioma da tela de erro é decisão do plano.** Os textos fixos (título e instrução) podem ir para
  os três dicionários ou ficar num idioma só, já que o público é quem edita a configuração; as
  mensagens de cada problema podem ficar em um idioma só, desde que nomeiem campo, slug e valor. A
  escolha fica no [`plan.md`](./plan.md).
- **A conferência da tela de erro depende de ela não puxar `d3`.** `d3` v7 é ESM e quebra o transform
  do Jest deste projeto — a mesma falha de `Item.test.tsx` —, então a tela de erro, a função de
  validação e as suas suítes vivem fora do grafo de importação de `App`, `Router`, `RadarGrid` e
  `RadarChart`.
- **As configurações de teste são locais e descartáveis.** As quantidades de 1, 3, 5 e 6 quadrantes,
  o sétimo quadrante e os defeitos usados na conferência manual não entram no commit.
- **Impacto na documentação autoritativa.** A skill `taxonomia-de-quadrantes-e-aneis` encerra a seção
  "Restrições e validações" com "Não há validação automática", que deixa de valer para a configuração
  e continua valendo para o acervo (regra 11); a skill `componente-grafico-do-radar` passa a registrar
  que o teto de seis é verificado no carregamento; o `AGENTS.md` afirma, na restrição de um a seis
  quadrantes, que "nada valida a configuração", afirmação que deixa de valer. A mudança é deliberada,
  apoiada na descrição desta unidade e na decisão de tornar o teste do `config.json` real uma trava de
  publicação. O impacto e as tarefas de atualização da documentação são registrados no
  [`plan.md`](./plan.md) desta unidade e executados na etapa de implementação.
</content>
</invoke>
