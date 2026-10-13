# Dependências técnicas do domínio Taxonomia de Quadrantes e Anéis

> **Manutenção deste arquivo**
>
> Atualize-o sempre que uma precondição técnica deste domínio mudar: entrou uma nova dependência,
> saiu uma existente, ou mudou o que acontece quando ela falta. Refatoração que preserva a
> precondição (renomear arquivo, trocar a biblioteca que consome o dado) não pede alteração aqui.
> Divergência entre o que este arquivo diz e o que o repositório faz, sem decisão registrada que
> a resolva, é escalada para o humano.

Cada item diz o que é e o que deixa de funcionar no domínio se ele faltar.

- **`public/config.json` servido como estático** — a aplicação só renderiza qualquer página
  depois de carregar esse arquivo; sem ele a aplicação não monta tela nenhuma e o site fica em
  branco. É de lá que vêm o conjunto de quadrantes, o conjunto ordenado de anéis, o interruptor
  de anéis vazios e os atributos de cada quadrante.

- **Arquivos de tradução `src/i18n/translations/*.json`** — guardam o rótulo e a descrição de
  cada quadrante e anel; sem a chave correspondente o rótulo aparece como a própria chave crua
  na interface.

- **Convenção de testes do projeto** — mudar a taxonomia exige teste unitário sobre quem a lê
  (resolução de rótulo, agrupamentos por quadrante e anel); sem ele a quebra só aparece em
  produção, porque nada valida a configuração em tempo de build.

- **Camada de internacionalização inicializada com os três idiomas** — é ela que resolve
  `quadrants.<slug>` e `rings.<slug>` para o idioma ativo e que decide o idioma inicial. Sem a
  inicialização, nenhum rótulo de eixo é traduzido e a interface exibe as chaves cruas, mesmo
  com os dicionários presentes.

- **Listas posicionais de descrição nos dicionários (`pageHelp.quadrants` e `pageHelp.rings`)** —
  o rótulo de quadrante no gráfico e a página de ajuda leem a descrição pela posição do eixo na
  lista, não pelo slug. Lista ausente em um idioma quebra a página de ajuda naquele idioma;
  lista fora de ordem atribui a descrição de um eixo a outro, sem erro visível.

- **Geometria por anel em `chartConfig.ringsAttributes`** — uma entrada de raio e espessura por
  anel, na mesma ordem da lista de anéis. Com menos entradas do que anéis, o desenho procura uma
  faixa inexistente e o gráfico deixa de renderizar; com raios fora de ordem crescente, os anéis
  se sobrepõem.

- **Folha de estilo com uma classe de cor por slug de anel** — é ela que dá cor ao selo do anel
  nas listagens e no filtro. Anel novo sem a classe correspondente aparece com selo sem cor de
  fundo, perdendo a distinção visual entre níveis de maturidade.

- **Invalidação de cache do navegador e do CDN na publicação** — a configuração é buscada com o
  identificador de build na querystring e o deploy invalida o cache da distribuição. Sem trocar
  esse identificador e sem a invalidação, a taxonomia alterada continua invisível para quem já
  visitou o site, mesmo com o arquivo novo publicado.
