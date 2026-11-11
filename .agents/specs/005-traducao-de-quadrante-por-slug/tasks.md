# Tarefas: tradução de quadrante por slug

Checklist da unidade descrita em [`spec.md`](./spec.md), com as decisões técnicas em
[`plan.md`](./plan.md), a evidência que as fecha em [`research.md`](./research.md) e a cobertura em
[`test-cases.md`](./test-cases.md).

A unidade atravessa três domínios, e os três têm comportamento documentado alterado, cada um com
tarefa de documentação própria: **Taxonomia de Quadrantes e Anéis** em T1, dona do endereçamento do
texto de cada eixo; **Visualização do Radar** em T2, dono do bloco de rótulo que exibe a descrição
na página inicial; e **Governança de Contribuição do Radar** em T3, dono do texto público da página
de ajuda. T4 acompanha a skill técnica de internacionalização, o mapa funcional e o gatilho de ADR,
que descrevem o mecanismo atravessado sem pertencer a um domínio.

Os outros quatro domínios não têm artefato tocado nem comportamento documentado alterado.
**Navegação e Descoberta de Tecnologias** já resolve o rótulo curto por slug e não exibe a descrição
longa em nenhuma de suas telas; **Catálogo de Opiniões Tecnológicas**, **Publicação e Distribuição
do Radar** e **Identidade Institucional DB1** ficam fora do alcance da alteração.

- [x] **T1. Documentação autoritativa da Taxonomia de Quadrantes e Anéis**
  - Depende de: nenhuma
  - Alvo: `.agents/skills/taxonomia-de-quadrantes-e-aneis/SKILL.md`.
  - Seções afetadas: *Entidades e dados*, na linha de `pageHelp.quadrants` e no parágrafo sobre as
    listas posicionais; regra 8; passo 4 e observação final do fluxo *Acrescentar um quadrante*;
    *Restrições e validações*, nas restrições do número de quadrantes e dos três idiomas
    obrigatórios.
  - Delta: `pageHelp.quadrants` é um mapa `slug → { name, description }` e a posicionalidade vale
    apenas para a lista de anéis, ordenada do centro para a borda; rótulo curto e descrição longa
    são ambos endereçados pelo slug, de modo que acrescentar um quadrante é declarar a entrada do
    slug nos três dicionários; o que prende o radar a quatro quadrantes é o bloco de rótulo nos
    cantos, e o slug sem entrada no idioma ativo some da página de ajuda e cai no inglês no bloco de
    rótulo.
  - Alvo: `AGENTS.md`, em *Restrições globais*, na restrição dos quatro quadrantes.
  - Delta: o limite passa a ser atribuído aos blocos de rótulo em `src/components/RadarGrid` e à
    ausência de validação da configuração; a exigência de manter o desenho idêntico ao publicado com
    quatro quadrantes e o ponteiro para a ADR 0001 permanecem.
  - Origem: história 1 da `spec.md` e os critérios de aceite de `pageHelp.quadrants` ser objeto com
    as quatro chaves de slug e de nenhum ponto do código indexar a descrição por posição.
  - Casos de teste: TC-28, TC-33.

- [x] **T2. Documentação autoritativa da Visualização do Radar**
  - Depende de: nenhuma
  - Alvo: `.agents/skills/visualizacao-do-radar/SKILL.md`.
  - Seções afetadas: regra 12, no item da descrição longa; regra 16; passos 2 e 3 do fluxo
    *Acrescentar um quadrante ao desenho*; *Restrições e validações*, na restrição sobre a descrição
    de quadrante.
  - Delta: o bloco de rótulo lê a descrição longa pelo slug do quadrante que apresenta, restando à
    posição exibida o número e o canto; o que segue preso a quatro posições é o canto do bloco de
    rótulo; acrescentar um quadrante pede a entrada do slug nos três dicionários, e a cobertura por
    slug substitui a exigência de cobrir todas as posições.
  - Origem: história 1 da `spec.md` e o critério de aceite de a descrição do bloco de rótulo ser
    resolvida pelo slug, sem índice por `position` e sem segunda passagem pelo `t`.
  - Casos de teste: TC-29.

- [x] **T3. Documentação autoritativa da Governança de Contribuição do Radar**
  - Depende de: nenhuma
  - Alvo: `.agents/skills/governanca-de-contribuicao-do-radar/SKILL.md`.
  - Seções afetadas: *Texto da página de ajuda — chaves deste domínio*, na frase que remete as duas
    listas de eixos à taxonomia; *Restrições e validações*, na restrição sobre o texto do processo em
    todos os idiomas.
  - Delta: a página de ajuda exibe o mapa de descrições de quadrante endereçado por slug e a lista
    de descrições de anel, e a distinção entre as duas formas acompanha a restrição sobre o idioma
    faltante.
  - Origem: histórias 2 e 3 da `spec.md` e os critérios de aceite da lista da página de ajuda e da
    frase do agrupamento sem numeral.
  - Casos de teste: TC-31.

- [x] **T4. Mecanismo de internacionalização, mapa funcional e gatilho de ADR**
  - Depende de: nenhuma
  - Alvo: `.agents/skills/internacionalizacao-do-radar/SKILL.md`.
  - Seções afetadas: *Adicionar ou renomear uma chave de interface*, na regra sobre valores em lista
    e na enumeração dos dicionários indexados pelo slug do dado; *Restrições e armadilhas
    conhecidas*, no item sobre estrutura fora de sincronia.
  - Delta: `pageHelp.quadrants` sai do grupo dos valores em lista e entra entre os dicionários
    indexados pelo slug, ao lado de `quadrants.<slug>`, `rings.<anel>` e `flags.<flag>`; a ausência
    de um slug no idioma ativo o faz sumir da página de ajuda, enquanto a leitura por chave composta
    de folha cai no inglês.
  - Alvo: `.agents/maps/functional-map.md`, na dependência técnica da chave `pageHelp` do domínio
    Governança de Contribuição do Radar e na dependência de registro em ADR do domínio Visualização
    do Radar.
  - Delta: a dependência da chave `pageHelp` distingue o mapa de quadrantes endereçado por slug das
    listas narrativas, e a lista de branches da reescrita em andamento nomeia também
    `feat/us5-i18n-by-slug`.
  - Alvo: `.agents/skills/registros-de-decisao-arquitetural/SKILL.md`, no gatilho *Geometria do
    gráfico*.
  - Delta: a lista de branches da reescrita em andamento acompanha esta unidade. A decisão continua
    coberta pela ADR 0001, sem ADR nova.
  - Origem: história 5 da `spec.md` e os critérios de aceite da cobertura de tradução por slug nos
    três idiomas e da falha da suíte nomeando o slug e o idioma em falta.
  - Casos de teste: TC-30, TC-32, TC-34.

- [x] **T5. Descrição de quadrante endereçada pelo slug**
  - Depende de: nenhuma
  - `pageHelp.quadrants` em `src/i18n/translations/pt.json`, `en.json` e `es.json` como objeto
    endereçado pelo slug do quadrante, com `name` e `description` em cada entrada, as quatro
    entradas declaradas na ordem de `quadrants` em `public/config.json` e os textos preservados
    caractere por caractere nos três idiomas.
  - `src/components/RadarGrid/RadarGrid.tsx` com a descrição do bloco de rótulo resolvida pelo slug
    que o componente já recebe, em uma única passagem pela tradução, sem a leitura da estrutura
    inteira, sem a tipagem como `QuadrantConfig[]` e sem o índice por posição exibida. O número do
    quadrante, o canto do bloco, o atalho de aproximação e a legenda ficam como estão.
  - `src/components/PageHelp/PageHelp.tsx` percorrendo o mapa com um tipo que o descreve como
    dicionário de slug para nome e descrição, preservando a ordem de declaração, a sanitização de
    cada descrição e as duas props atuais do componente.
  - `src/i18n/translations.test.tsx` como suíte de consistência, lendo o `public/config.json` e os
    três dicionários reais do repositório: a forma de objeto em cada idioma, a igualdade entre os
    dois mapas de quadrante da taxonomia, rótulo curto e descrição longa preenchidos para cada slug
    declarado nos três idiomas, a ausência de slug que a taxonomia não declare, a ordem de
    declaração igual à da taxonomia e a resolução da chave composta de descrição pela instância real
    do `i18next` em cada idioma.
  - `src/components/PageHelp/PageHelp.test.tsx` cobrindo os quatro nomes e descrições publicados, a
    ordem exibida da lista e a lista acompanhando um dicionário com cinco quadrantes, acrescentado
    sob um código de idioma próprio e desfeito ao fim do caso.
  - Nenhum dos dois arquivos de teste traz `d3` ao grafo de importação.
  - Casos de teste: TC-1 a TC-12, TC-16 a TC-27.

- [x] **T6. Explicação do agrupamento sem quantidade de quadrantes**
  - Depende de: T5
  - Quarto parágrafo da seção "Como deve ser usado", em `pageHelp.paragraphs`, reescrito sem o
    numeral em `src/i18n/translations/pt.json`, `en.json` e `es.json`, preservando o restante de
    cada frase, inclusive o parêntese sobre o melhor encaixe.
  - Caso novo em `src/i18n/translations.test.tsx`, entregue em T5, afirmando que o texto de
    `pageHelp` nos três dicionários não traz nenhuma quantidade de quadrantes escrita.
  - Casos de teste: TC-13, TC-14, TC-15, TC-35 a TC-39.
</content>
