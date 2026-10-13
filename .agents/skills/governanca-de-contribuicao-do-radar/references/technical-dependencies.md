# Dependências técnicas do domínio Governança de Contribuição do Radar

> **Manutenção deste arquivo**
>
> Atualize-o sempre que uma precondição técnica deste domínio mudar: entrou uma nova dependência,
> saiu uma existente, ou mudou o que acontece quando ela falta. Refatoração que preserva a
> precondição (renomear arquivo, trocar a biblioteca que consome o dado) não pede alteração aqui.
> Divergência entre o que este arquivo diz e o que o repositório faz, sem decisão registrada que a
> resolva, é escalada para o humano.

Cada item diz o que é e o que deixa de funcionar no domínio se ele faltar.

- **`CONTRIBUTING.md` e a página de ajuda** — são a definição publicada do processo; divergência
  entre os dois deixa contribuinte e leitor com regras diferentes.

- **Chave `pageHelp` nos três arquivos de tradução** — a página de ajuda lê listas inteiras de
  objetos da tradução; faltando a chave em um idioma, a página quebra naquele idioma.

- **Convenção de testes do projeto** — a página de ajuda depende da forma dos objetos vindos da
  tradução e leva teste de componente quando essa estrutura muda; sem ele, a quebra de formato só
  aparece em produção.

- **GitHub como plataforma do processo** — o repositório público, o fork, o pull request, a revisão
  e o histórico são o maquinário inteiro da governança; sem a plataforma não há onde propor,
  revisar, recusar nem registrar a decisão editorial, e o único controle de qualidade do conteúdo
  deixa de existir.

- **Internacionalização ativa com leitura de listas de objetos** — a página de ajuda pede ao
  dicionário as seções narrativas e as listas de eixos como objetos, não como texto. Sem a
  inicialização da internacionalização, ou com a leitura configurada para devolver só texto, a
  página não consegue montar as seções. O idioma de recurso é o inglês: chave ausente cai no texto
  em inglês em vez de falhar visivelmente.

- **Sanitizador de HTML (`sanitize-html`)** — todo parágrafo do processo e toda descrição de eixo
  passa por ele antes de ser injetado na página. Sem o sanitizador nesse caminho, a marcação vinda
  do dicionário de tradução chega à tela sem filtro; com ele, o que está fora da lista branca
  desaparece do texto publicado.

- **Chave `editLink` no documento de configuração** — é ela que liga o atalho para a origem editável
  na página do item. Ausente, o atalho não é exibido; presente e apontando para uma origem que não
  existe, produz um link quebrado, sem validação nem aviso.

- **Publicação do site após a alteração do texto do processo** — o texto da página de ajuda é
  compilado junto com a aplicação, e não servido como arquivo de dados. Sem uma nova publicação, a
  regra revista continua invisível para o leitor, mesmo já incorporada ao repositório.
