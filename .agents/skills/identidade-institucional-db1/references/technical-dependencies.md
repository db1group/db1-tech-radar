# Dependências técnicas do domínio Identidade Institucional DB1

> **Manutenção deste arquivo**
>
> Atualize-o sempre que uma precondição técnica deste domínio mudar: entrou uma nova dependência,
> saiu uma existente, ou mudou o que acontece quando ela falta. Refatoração que preserva a
> precondição (renomear um componente, reorganizar os estilos, trocar a origem dos ícones) não pede
> alteração aqui. Divergência entre o que este arquivo diz e o que o repositório faz, sem decisão
> registrada que a resolva, é escalada para o humano.

Cada item diz o que é e o que deixa de funcionar no domínio se ele faltar.

- **`public/messages.json` servido como estático** — a ausência do arquivo não impede a aplicação
  de carregar, mas apaga rodapé institucional e canais sociais.

- **Fontes ClanOT em `public/fonts/` e `public/fonts.css`** — sustentam a identidade visual; sem
  elas o site cai em fonte alternativa.

- **Convenção de testes do projeto** — o rodapé leva teste de componente quando sua estrutura muda,
  porque ele aparece em todas as telas; sem esse teste, a quebra da assinatura institucional só
  aparece em produção, e em todas as telas de uma vez.

- **Distribuição dos links institucionais pela árvore de componentes** — o dado baixado é entregue
  às telas por um contexto compartilhado, e o consumo recai em um objeto vazio quando o contexto
  não envolve a árvore. Sem o provedor no topo, canais oficiais e link institucional somem sem
  erro, exatamente como se o arquivo não existisse.

- **Biblioteca de ícones de marcas (`react-icons`, conjunto Font Awesome)** — fornece o glifo de
  cada canal oficial a partir do nome declarado no dado. Sem ela não há ícone; com ela, um nome
  fora do vocabulário reconhecido cai no ícone genérico de link externo.

- **Sanitizador de HTML com lista branca restrita (`sanitize-html`)** — a nota institucional do
  rodapé é injetada como HTML e passa por ele antes de ir à tela. Sem a sanitização, a nota deixa
  de ter limite de marcação; com uma lista branca diferente, a formatação da nota muda sem aviso.

- **Internacionalização ativa** — a nota institucional, o rótulo do link institucional, o convite
  dos canais oficiais e o nome do radar vêm das traduções. Sem a inicialização da
  internacionalização, ou com a chave faltando em um idioma, a interface exibe o identificador cru
  da chave no lugar do texto.

- **`public/logo/db1-logo.png` presente no diretório de arquivos estáticos** — é a mesma imagem
  consumida pelo cabeçalho, pelo rodapé e pelos metadados do documento publicado. Ausente, as três
  telas ficam com espaço vazio no lugar da marca e o compartilhamento de link perde a imagem.

- **`public/favicon.ico` na raiz publicada** — é o ícone do site na aba do navegador; ausente, o
  navegador exibe seu ícone padrão e a aba perde a identificação do produto.

- **Raiz de publicação (`PUBLIC_URL`) alimentando o endereço dos ativos** — o endereço do logotipo,
  da folha de tipografia e do ícone do site é montado a partir dela. Divergência entre o valor de
  compilação e o caminho real de publicação deixa a marca e a tipografia sem carregar, com o resto
  do site funcionando.

- **`REACT_APP_RADAR_NAME` substituída no documento publicado em tempo de compilação** — alimenta o
  título da aba antes de a aplicação montar, a descrição e o título de compartilhamento. Ausente,
  o documento vai ao ar com o marcador cru da variável no lugar do nome do produto.

- **Camada de roteamento interna** — o logotipo do cabeçalho é um link para a página inicial do
  radar. Sem a camada de roteamento envolvendo o cabeçalho, a marca vira imagem sem navegação.

- **Medição da largura da janela na renderização** — decide se o rodapé sai da leitura de uma
  tecnologia (limite de 1200 pixels). A medição acontece na renderização e não é reavaliada ao
  redimensionar a janela: redimensionar sem trocar de tela mantém a decisão anterior.

- **Variáveis CSS globais da paleta** — cor de marca, fundo escuro, branco e os tons de cinza do
  rodapé são declaradas uma única vez e consumidas por todos os estilos do domínio. Sem a
  declaração, o rodapé e os ícones de canal perdem contraste contra o fundo escuro.
