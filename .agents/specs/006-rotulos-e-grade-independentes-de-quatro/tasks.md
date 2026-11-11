# Tarefas: rótulos de quadrante e grade responsiva independentes de quatro

Checklist da unidade descrita em [`spec.md`](./spec.md), com as decisões técnicas em
[`plan.md`](./plan.md), a evidência que as fecha em [`research.md`](./research.md) e a cobertura em
[`test-cases.md`](./test-cases.md).

A unidade atravessa três domínios. Dois têm comportamento documentado alterado e ganham tarefa de
documentação própria: **Visualização do Radar** em T1, dono do bloco de rótulo e da legenda ao
redor do diagrama, e **Taxonomia de Quadrantes e Anéis** em T2, dona dos dois números de cada
quadrante. **Navegação e Descoberta de Tecnologias** tem artefato tocado — a folha de estilo da
grade de listagens da página inicial — sem alteração do comportamento documentado: a regra que
descreve a grade em duas colunas em janela larga e em uma coluna abaixo de aproximadamente 990 px
continua valendo para qualquer quantidade de quadrantes, e por isso o domínio não tem tarefa de
documentação. T3 cobre o registro da decisão e os artefatos transversais, que descrevem o limite
atravessado sem pertencer a um domínio.

Os outros quatro domínios não têm artefato tocado nem comportamento documentado alterado:
**Catálogo de Opiniões Tecnológicas**, **Governança de Contribuição do Radar**, **Publicação e
Distribuição do Radar** e **Identidade Institucional DB1** ficam fora do alcance da alteração.

O portão de qualidade — TC-36 a TC-40 — vale para a unidade inteira e é conferido ao fim de cada
tarefa que toca código.

- [x] **T1. Documentação autoritativa da Visualização do Radar**
  - Depende de: nenhuma
  - Alvo: `.agents/skills/visualizacao-do-radar/SKILL.md`.
  - Seções afetadas: *Visão geral do domínio*, na descrição dos blocos; regra 12; regra 13; regra
    16; passo 6 do fluxo *Desenhar o radar*; passos 1 e 3 do fluxo *Acrescentar um quadrante ao
    desenho*; *Restrições e validações*, na restrição das posições de 1 a 4.
  - Delta: o bloco de rótulo fica do lado do setor do seu quadrante, apontado pelo slot de tela,
    com a tabela de lugares por quantidade de quadrantes de um a seis, restando à posição exibida o
    número que o leitor lê; a legenda das formas fica ao lado do diagrama e no centro inferior
    quando há seis quadrantes; o teto de seis quadrantes vem dessa tabela de lugares, e a posição
    repetida passa a significar número exibido repetido.
  - Origem: histórias 1 e 3 da `spec.md` e os critérios de aceite da classe de slot por quadrante e
    de cada bloco aparecer do lado do seu setor com três, cinco e seis quadrantes.
  - Casos de teste: TC-31.

- [x] **T2. Documentação autoritativa da Taxonomia de Quadrantes e Anéis**
  - Depende de: nenhuma
  - Alvo: `.agents/skills/taxonomia-de-quadrantes-e-aneis/SKILL.md`.
  - Seções afetadas: regra 4, na tabela de posição para canto; passo 3 e observação final do fluxo
    *Acrescentar um quadrante*; *Restrições e validações*, nas restrições das posições de 1 a 4 e do
    número de quadrantes.
  - Delta: a posição é o número exibido e o slot de tela decide o setor do diagrama e o lugar do
    bloco de rótulo, de modo que declarar um quadrante deixa de exigir uma posição entre 1 e 4; o
    número de quadrantes tem teto de seis, vindo da tabela de lugares dos blocos.
  - Origem: história 1 da `spec.md` e o critério de aceite de a classe do bloco acompanhar `order`
    enquanto o número exibido continua vindo de `position`.
  - Casos de teste: TC-32.

- [x] **T3. Registro da decisão e artefatos transversais**
  - Depende de: nenhuma
  - Alvo: `docs/adr/` — ADR novo, com o próximo número livre conferido contra a `main` atualizada,
    status `Aceita`, data do dia e domínio afetado "Visualização do Radar, Taxonomia de Quadrantes e
    Anéis".
  - Delta: registra que o lugar do bloco de rótulo vem do slot de tela e que a tabela de lugares por
    quantidade fixa o teto de seis quadrantes, com as alternativas descartadas — calcular o lugar de
    cada bloco em tempo de renderização, sem teto, e manter a escolha pela posição exibida. A
    ADR 0001 permanece `Aceita`, sem substituição.
  - Alvo: `AGENTS.md`, em *Restrições globais*, na restrição da quantidade de quadrantes.
  - Delta: a restrição declara o teto de seis quadrantes, atribuído à tabela de lugares dos blocos
    em `src/components/RadarGrid/radar-grid.scss`, e mantém a ausência de validação da configuração,
    a exigência do desenho idêntico ao publicado com quatro quadrantes e os ponteiros para a
    ADR 0001 e para o ADR novo.
  - Alvo: `.agents/skills/estrategia-de-testes/SKILL.md`, em *O que conta como tela alterada* e em
    *Restrições e armadilhas conhecidas*.
  - Delta: um componente cujo único import ESM é `Link` é alcançável substituindo esse módulo no
    arquivo de teste, enquanto o que importa `d3` segue fora de alcance; `QuadrantLabel` e
    `QuadrantGrid` entram entre os componentes alcançados.
  - Alvo: `.agents/maps/functional-map.md`, nas regras inferidas dos domínios Taxonomia de
    Quadrantes e Anéis e Visualização do Radar e na dependência de registro em ADR.
  - Delta: o slot de tela decide o setor e o lugar do bloco, a posição decide o número exibido, e a
    lista de branches da reescrita nomeia também `feat/us6-labels-grid`.
  - Alvo: `.agents/skills/registros-de-decisao-arquitetural/SKILL.md`, no gatilho *Geometria do
    gráfico*.
  - Delta: a lista de branches da reescrita em andamento acompanha esta unidade.
  - Origem: histórias 1 e 3 da `spec.md`, o critério de aceite da regra por slot de 1 a 6 em
    `radar-grid.scss` e o risco R7 registrado na `spec.md`.
  - Casos de teste: TC-29, TC-30, TC-33, TC-34, TC-35.

- [x] **T4. Bloco de rótulo posicionado pelo slot de tela**
  - Depende de: T1, T2
  - `src/components/RadarGrid/QuadrantLabel.tsx` como componente próprio, com as mesmas props e o
    mesmo conteúdo de hoje — número, atalho de aproximação, linha colorida, rótulo e descrição — e
    com a classe de posicionamento derivada do slot de tela do quadrante. A escolha do canto por
    tabela indexada pela posição exibida e o `style` inline de canto saem; o `borderColor` do `<hr>`
    fica.
  - `src/components/RadarGrid/RadarGrid.tsx` consumindo o componente extraído e publicando a
    quantidade de quadrantes declarada na taxonomia como atributo de dado na `div.radar-grid`. A
    legenda e a composição com o gráfico ficam como estão.
  - `src/components/RadarGrid/radar-grid.scss` com as regras de base de posicionamento por slot, que
    reproduzem exatamente os quatro cantos publicados hoje, nas três larguras de janela em que o
    conjunto aparece. A largura do bloco, a posição da legenda e o ponto de quebra de 800 px ficam
    como estão.
  - `src/components/RadarGrid/QuadrantLabel.test.tsx` cobrindo, sobre o `public/config.json` do
    repositório — o arquivo real, nunca uma cópia de fixture —, a classe de slot de cada slug, o
    número exibido de cada bloco, a cor da linha divisória, a classe acompanhando `order` quando ele
    diverge da `position` e a recaída na `position` quando `order` está ausente. O arquivo substitui
    o módulo `Link` para manter `query-string` fora do grafo de importação, e nenhum módulo que
    importe `d3` entra nesse grafo.
  - A mensagem de commit cita a procedência da técnica dos rótulos: branch `v5` de
    `AOEpeople/aoe_technology_radar`, PR #502, sob Apache-2.0.
  - Casos de teste: TC-1 a TC-11, TC-14, TC-25, TC-26, TC-27.

- [x] **T5. Lugares e espaço para as contagens de um a seis**
  - Depende de: T4
  - `src/components/RadarGrid/radar-grid.scss` com os casos por quantidade de quadrantes declarada
    no DOM, de uma a seis, portados da mesma origem citada em T4: o lugar de cada bloco que o caso
    de base não resolve, o espaço interno que reserva faixa para o bloco do centro inferior e para
    os blocos das laterais, e o lugar da legenda com seis quadrantes. Nenhum caso incide sobre a
    taxonomia de quatro quadrantes.
  - `src/components/RadarGrid/radar-grid.scss.test.tsx` lendo a folha de estilo como texto e
    afirmando que existe regra de lugar para cada slot de 1 a 6, que existem casos para as contagens
    que precisam deles e que nenhuma regra por contagem incide sobre quatro quadrantes. A suíte
    falha nomeando o slot sem regra.
  - Conferência com três, cinco e seis quadrantes sobre configuração local montada conforme o
    procedimento do `plan.md`, desfeita com `git restore` antes do commit: cada bloco do lado do seu
    setor, sem sobreposição com o círculo, com a legenda ou com outro bloco.
  - Casos de teste: TC-15 a TC-20, TC-28.

- [x] **T6. Grade de listagens por quadrante sem quantidade pressuposta**
  - Depende de: nenhuma
  - `src/components/QuadrantGrid/quadrant-grid.scss` com a grade apresentando qualquer quantidade de
    blocos, preservando as duas colunas em janela larga, a mesma largura e a mesma separação de
    hoje, e a coluna única abaixo de `$until-lg`. Nenhuma largura entre 800 px e 1200 px abre uma
    terceira coluna.
  - `src/components/QuadrantGrid/QuadrantGrid.test.tsx` cobrindo um bloco por quadrante declarado,
    com quatro e com cinco quadrantes, e a ordem de declaração da taxonomia, com o módulo `Link`
    substituído no próprio arquivo.
  - `src/components/QuadrantGrid/testData.tsx` com os dois `ConfigData` e os itens em destaque que a
    suíte consome.
  - Casos de teste: TC-12, TC-13, TC-21 a TC-24, TC-36 a TC-40.
