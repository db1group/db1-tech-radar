# Tarefas: validação de configuração com erro legível

Checklist da unidade descrita em [`spec.md`](./spec.md), com as decisões técnicas em
[`plan.md`](./plan.md), a evidência que as fecha em [`research.md`](./research.md) e a cobertura em
[`test-cases.md`](./test-cases.md).

A unidade é transversal. Três domínios têm comportamento documentado alterado e ganham tarefa de
documentação própria, antes das tarefas de código: **Taxonomia de Quadrantes e Anéis** em T1, dona
das regras que a validação passa a verificar; **Visualização do Radar** em T2, cujo teto de seis
quadrantes passa a ser conferido no carregamento (documentação na skill técnica do gráfico); e
**Publicação e Distribuição do Radar** em T3, cujo caminho de publicação ganha a trava do teste. T4
cobre os artefatos transversais (`AGENTS.md` e o mapa funcional), que descrevem a restrição global
sem pertencer a um só domínio.

**Catálogo de Opiniões Tecnológicas** e **Identidade Institucional DB1** têm artefato de código
tocado — a falha de carga de `db1-opinion.json` e de `messages.json` passa a mostrar a tela de erro
—, mas sem alteração do comportamento documentado nas suas skills: esse comportamento de carga é
descrito na skill de publicação (T3), então os dois não têm tarefa de documentação própria.
**Navegação e Descoberta de Tecnologias** tem a casca de `App.tsx` tocada, mas o conjunto de telas, a
resolução de nome e o nome não resolvido ficam como estão — a tela de erro substitui o `Router` antes
de qualquer tela e não é um endereço do domínio —, então a sua skill não muda. **Governança de
Contribuição do Radar** fica fora do alcance da alteração.

O portão de qualidade — TC-27 a TC-30 — vale para a unidade inteira e é conferido ao fim de cada
tarefa que toca código (T5 a T8).

- [x] **T1. Documentação autoritativa da Taxonomia de Quadrantes e Anéis**
  - Depende de: nenhuma
  - Alvo: `.agents/skills/taxonomia-de-quadrantes-e-aneis/SKILL.md`.
  - Seções afetadas: *Restrições e validações*, no fechamento "Não há validação automática" e nas
    restrições dos dois mapas de slug, do slot contíguo, da posição, do slug como segmento de URL, da
    geometria dos anéis, dos três idiomas e do número de quadrantes.
  - Delta: "Não há validação automática" passa a valer só para o acervo (regra 11); a configuração é
    verificada no carregamento, e cada restrição da seção passa a ser apontada com mensagem legível em
    vez de só pelo sintoma.
  - Origem: histórias 1 e 2 da `spec.md` e os critérios de aceite de cada regra devolver um problema
    que nomeia campo, slug e valor.
  - Estrutura: edição no próprio `SKILL.md`; `description` mantida, porque o escopo do domínio não
    muda; sem reestruturação; critério de conclusão: a skill permanece dentro das regras de
    `skill-authoring`.
  - Casos de teste: TC-22.

- [x] **T2. Documentação autoritativa da Visualização do Radar (gráfico)**
  - Depende de: nenhuma
  - Alvo: `.agents/skills/componente-grafico-do-radar/SKILL.md`.
  - Seções afetadas: *Bloco de rótulo e teto de seis quadrantes*.
  - Delta: o teto de seis, vindo da tabela de lugares dos blocos de rótulo em
    `src/components/RadarGrid/radar-grid.scss`, passa a ser descrito como verificado no carregamento
    da configuração — um sétimo quadrante produz um problema legível em vez de só sobrepor o bloco do
    slot 6.
  - Origem: história 1 da `spec.md` e o critério de aceite da quantidade de quadrantes fora de 1 a 6,
    mais o risco R7 registrado na `spec.md`.
  - Estrutura: edição no próprio `SKILL.md`; `description` mantida; sem reestruturação; critério de
    conclusão: a skill permanece dentro das regras de `skill-authoring`.
  - Casos de teste: TC-23.

- [x] **T3. Documentação autoritativa da Publicação e Distribuição do Radar**
  - Depende de: nenhuma
  - Alvo: `.agents/skills/publicacao-e-distribuicao-do-radar/SKILL.md`.
  - Seções afetadas: regra 2 (etapas do caminho de publicação), regra 10 (barreira automática antes
    do ar) e *Restrições e validações* (verificação de regressão e falha de carga silenciosa).
  - Delta: entre instalar e compilar entra o passo que roda o teste do `config.json` real; a
    compilação deixa de ser a única barreira automática, porque esse teste também barra a publicação
    (o acervo segue sem verificação); a falha de carga de dados deixa de ser silenciosa e passa a
    mostrar a tela de erro, inclusive quando é o `messages.json` que falha.
  - Origem: história 3 e história 5 da `spec.md` e os critérios de aceite da trava de publicação e da
    tela de erro na falha de carga.
  - Estrutura: edição no próprio `SKILL.md`; `description` mantida; sem reestruturação; critério de
    conclusão: a skill permanece dentro das regras de `skill-authoring`.
  - Casos de teste: TC-24.

- [x] **T4. Artefatos transversais de restrição global**
  - Depende de: nenhuma
  - Alvo: `AGENTS.md`, em *Restrições globais*, na restrição "De um a seis quadrantes".
  - Delta: a restrição descreve a configuração como verificada no carregamento, com tela de erro
    legível, e um sétimo quadrante apontado por ela; deixa de dizer que "nada valida a configuração".
    A restrição "Revisão humana como único controle" permanece, por tratar do acervo.
  - Alvo: `.agents/maps/functional-map.md`, nas regras inferidas do domínio Taxonomia de Quadrantes e
    Anéis e na evidência do domínio Publicação e Distribuição do Radar.
  - Delta: a regra inferida de que "nada valida a configuração em tempo de build" passa a registrar a
    verificação no carregamento e a trava no deploy; a evidência do workflow inclui o passo de teste
    do `config.json` real, e a tela branca por falha de carga dá lugar à tela de erro.
  - Origem: histórias 1, 3 e 5 da `spec.md` e os critérios de aceite da validação no carregamento e da
    trava de publicação.
  - Casos de teste: TC-25, TC-26.

- [x] **T5. Função de validação da configuração e sua suíte**
  - Depende de: T1, T2
  - `src/validateConfig.ts` com uma função pura, sem React e sem `d3`, que recebe a configuração e um
    predicado de consulta de tradução e devolve a lista de todos os problemas, cada um com mensagem
    legível que nomeia campo, slug e valor, cobrindo as regras: quantidade de quadrantes de 1 a 6 (por
    `segmentCount`), mesmo conjunto de slugs nos dois mapas, slot de tela contíguo sem repetição (por
    `slotOf`), posição sem repetição, slug sem barra, espaço ou acento, uma entrada de
    `ringsAttributes` por anel com raios crescentes, e tradução de cada quadrante nos três idiomas.
  - `src/validateConfig.test.ts` cobrindo, com um predicado de tradução sobre os dicionários
    importados: o `public/config.json` real devolvendo lista vazia; um caso por regra a partir de uma
    cópia com um único defeito (0 e 7 quadrantes; slug só em `quadrants` e só em `quadrantsMap`;
    `order` repetido e com buraco; `position` repetida; slug com barra, com espaço e com acento;
    `ringsAttributes` com menos entradas que `rings` e com raios fora de ordem; slug sem tradução em
    um idioma, com a mensagem nomeando o slug e o idioma); vários defeitos de uma vez todos listados;
    e cópias bem configuradas de 1, 3, 5 e 6 quadrantes devolvendo lista vazia. Nenhum módulo que
    importe `d3` entra no grafo de importação, e nem `App`, `Router`, `RadarGrid` ou `RadarChart` é
    renderizado.
  - Casos de teste: TC-1 a TC-7, TC-10, TC-14, TC-15, TC-19.

- [x] **T6. Tela de erro**
  - Depende de: nenhuma
  - `src/components/ErrorScreen/ErrorScreen.tsx`, sem `d3` e sem i18n, recebendo título, descrição e,
    quando houver, a lista de problemas, e renderizando o título, a descrição e um item por problema;
    com `src/components/ErrorScreen/ErrorScreen.scss` ao lado.
  - `src/components/ErrorScreen/ErrorScreen.test.tsx`, com Testing Library, conferindo que o título e
    cada problema recebido aparecem na tela.
  - Casos de teste: TC-8.

- [x] **T7. Validação e tratamento de falha na casca de App**
  - Depende de: T5, T6
  - `src/components/App.tsx` com o `useFetch` devolvendo estado de dado e de erro, detectando falha de
    rede, 404 e JSON inválido, sem os dois `console.log` de depuração; a casca executa `validateConfig`
    quando acervo e configuração chegam, renderiza a tela de erro no lugar do `Router` quando há
    problema de configuração ou falha de carga de qualquer um dos três JSON, e registra os problemas
    com `console.error`. Com configuração válida e os três JSON carregados, o comportamento fica
    idêntico ao de hoje.
  - Conferência manual, sobre edições locais descartáveis desfeitas com `git restore`: configuração
    inválida e falha de carga (JSON quebrado e arquivo ausente) mostrando a tela de erro com
    `console.error`; o site publicado idêntico nos três idiomas sem aviso no console; o sétimo
    quadrante, os slots repetidos e o slug sem tradução em `es` produzindo a mensagem de cada defeito;
    e nada disso entrando no commit.
  - Casos de teste: TC-9, TC-11, TC-12, TC-13, TC-16, TC-20, TC-21.

- [x] **T8. Trava de publicação no workflow de deploy**
  - Depende de: T3, T5
  - `.github/workflows/prod-deploy-app-on-harbor.yml` com um passo, entre a instalação das
    dependências e a compilação, que roda `CI=true yarn test src/validateConfig.test.ts`; a falha do
    teste falha o deploy antes da publicação, e o passo roda apenas essa suíte, para que as suítes já
    vermelhas na base por transformação de ESM não entrem na trava.
  - Conferência de que, sobre uma cópia local defeituosa de `public/config.json`, o mesmo comando do
    passo termina com código diferente de 0, desfeita com `git restore`.
  - Casos de teste: TC-17, TC-18.
</content>
