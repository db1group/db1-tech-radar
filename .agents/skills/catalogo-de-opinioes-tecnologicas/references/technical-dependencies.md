# Dependências técnicas do domínio Catálogo de Opiniões Tecnológicas

> **Manutenção deste arquivo**
>
> Atualize-o sempre que uma precondição técnica deste domínio mudar: entrou uma nova dependência,
> saiu uma existente, ou mudou o que acontece quando ela falta. Refatoração que preserva a
> precondição (renomear arquivo, trocar a biblioteca que consome o dado) não pede alteração aqui.
> Divergência entre o que este arquivo diz e o que o repositório faz, sem decisão registrada que a
> resolva, é escalada para o humano.

Cada item diz o que é e o que deixa de funcionar no domínio se ele faltar.

- **`public/db1-opinion.json` servido como estático** — é a única origem do acervo; sem ele a
  aplicação não renderiza nenhuma página.

- **Internacionalização ativa (`i18next`)** — `getItemBody` lê `i18n.language` para escolher o
  corpo; sem a inicialização do i18n o texto da opinião não é selecionado.

- **`sanitize-html`** — disponível no projeto, mas o corpo da opinião é injetado com
  `dangerouslySetInnerHTML` sem passar por ele, o que torna o acervo conteúdo confiável por
  definição e faz da revisão do pull request a única barreira.

- **`src/styles/components/hljs.scss`** — tema local que estiliza os blocos de código embutidos nos
  corpos das opiniões; sem ele o código no texto perde o realce.

- **Convenção de testes do projeto** — as funções que agrupam, filtram e selecionam o item
  concentram a regra do domínio e são cobertas por teste unitário; sem ele a quebra só aparece em
  produção, porque nada valida o acervo em tempo de build.

- **`public/config.json` servido como estático** — a aplicação só monta tela depois de carregar o
  documento de configuração junto com o acervo. Sem ele, o acervo sozinho não renderiza nada, e é
  de lá que vêm o vocabulário de quadrantes e anéis que cada item referencia e o formato de
  exibição das datas de edição.

- **Dicionário de rótulos de marca (`flags.<marca>`) nos três arquivos de tradução** — é ele que dá
  texto ao selo de item novo ou alterado. Marca sem a chave correspondente faz o selo exibir a
  própria chave crua na interface, em todos os idiomas.

- **Locales de data registrados para os três idiomas** — a data de publicação e as datas do
  histórico de revisões são formatadas no locale do idioma ativo. Idioma sem o locale registrado
  cai no inglês, exibindo o mês por extenso no idioma errado.

- **Invalidação de cache do navegador e do CDN na publicação** — o acervo é buscado com o
  identificador de build na querystring e o deploy invalida o cache da distribuição. Sem trocar
  esse identificador e sem a invalidação, a opinião alterada continua invisível para quem já
  visitou o site, mesmo com o arquivo novo publicado.
