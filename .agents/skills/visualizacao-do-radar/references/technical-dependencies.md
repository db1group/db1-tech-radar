# Dependências técnicas do domínio Visualização do Radar

> **Manutenção deste arquivo**
>
> Atualize-o sempre que uma precondição técnica deste domínio mudar: entrou uma nova dependência,
> saiu uma existente, ou mudou o que acontece quando ela falta. Refatoração que preserva a
> precondição (renomear arquivo, trocar a biblioteca que desenha o gráfico) não pede alteração
> aqui. Divergência entre o que este arquivo diz e o que o repositório faz, sem decisão registrada
> que a resolva, é escalada para o humano.

Cada item diz o que é e o que deixa de funcionar no domínio se ele faltar.

- **`chartConfig` em `public/config.json`** — raio e espessura por anel; a quantidade de entradas
  em `ringsAttributes` precisa acompanhar a de anéis, senão o cálculo do raio do ponto lê posição
  inexistente.

- **Camada de roteamento interna (`Link` + `react-router-dom`)** — cada ponto é um link para a
  página do item; sem ela o gráfico vira ilustração sem navegação.

- **Convenção de testes do projeto** — a geometria é a lógica mais densa do projeto e pede teste
  unitário que verifique se o ponto cai no setor correto; sem ele a quebra só aparece em produção,
  porque nada valida a geometria em tempo de build.

- **Registro em ADR das decisões de arquitetura do desenho** — a reescrita da geometria para
  suportar de um a seis quadrantes é decisão de arquitetura, registrada em
  [`docs/adr/0001-geometria-configuravel-do-grafico.md`](../../../../docs/adr/0001-geometria-configuravel-do-grafico.md),
  que guarda a exigência de o desenho permanecer idêntico ao publicado quando houver quatro
  quadrantes. Sem o registro, a restrição de equivalência visual se perde e a próxima alteração
  da geometria não tem contra o que ser conferida.

- **`d3`** — fornece as escalas lineares que posicionam os rótulos de anel e o gerador de arcos que
  desenha a faixa de cada anel dentro do setor de cada quadrante. Sem ela, a construção do caminho
  dos arcos e o posicionamento dos rótulos precisam ser reimplementados. O sorteio da posição dos
  pontos não passa por ela: ângulo, raio e coordenada saem de funções puras sobre números.

- **`react-tooltip`** — monta a dica que identifica o ponto ao passar o mouse, com a cor de fundo
  e a cor de texto do quadrante. Sem ela o diagrama fica mudo: nenhum ponto traz texto fixo ao
  lado, e a única forma de descobrir qual tecnologia ele representa passa a ser clicar.

- **Internacionalização ativa (`i18next`)** — o rótulo de cada anel escrito dentro do diagrama, a
  palavra "quadrante" do bloco de rótulo, o atalho "Ampliar", o nome do quadrante e os três textos
  da legenda são resolvidos pelo idioma ativo. Sem a inicialização, o gráfico exibe as chaves
  cruas sobre o desenho.

- **Lista posicional `pageHelp.quadrants` nos três arquivos de tradução** — o bloco de rótulo de
  cada canto lê a descrição do quadrante pela posição dele nessa lista, não pelo slug. Lista mais
  curta que o número de quadrantes derruba a página inicial; lista fora de ordem atribui a
  descrição de um quadrante a outro, sem erro visível.

- **`public/db1-opinion.json` servido como estático** — é de lá que vêm os itens desenhados, a
  classificação de cada um e a marca que escolhe a forma do ponto. Sem o acervo a aplicação não
  monta tela nenhuma, e o gráfico não tem o que posicionar.

- **Ícones de forma de ponto (`src/icons/blip_new.svg`, `blip_changed.svg`, `blip_default.svg`)** —
  a legenda das três formas é montada com esses arquivos como imagem de fundo, separados das
  formas desenhadas dentro do SVG do diagrama. Faltando um deles, a legenda exibe o texto sem a
  forma correspondente e a correlação entre marca e desenho se perde.

- **Folhas de estilo do gráfico e da grade (`src/components/Chart/chart.scss` e
  `src/components/RadarGrid/radar-grid.scss`)** — definem o corte de 800 px de largura que exibe
  ou oculta o conjunto da visualização, o posicionamento absoluto dos quatro blocos de rótulo nos
  cantos e da legenda, e o cursor de clique sobre o ponto. Sem elas o conjunto aparece em qualquer
  largura, com os blocos empilhados fora dos cantos.

- **Invalidação de cache do navegador e do CDN na publicação** — a configuração de geometria e o
  acervo são buscados com o identificador de build na querystring e o deploy invalida o cache da
  distribuição. Sem trocar esse identificador e sem a invalidação, a geometria alterada continua
  invisível para quem já visitou o site, mesmo com o arquivo novo publicado.
