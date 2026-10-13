---
name: internacionalizacao-do-radar
description: >
  Internacionalização do radar em pt, en e es: sincronizar chaves nos três arquivos
  `src/i18n/translations/{pt,en,es}.json`, consumir tradução com `useTranslation`, sanitizar texto
  traduzido com HTML, obter o corpo da opinião com `getItemBody`, trocar o idioma pelo
  `ButtonFlag` com persistência em `localStorage` e formatar datas com `formatRelease` no locale
  ativo. Carregue ao mexer em rótulo de interface, página de ajuda, corpo de opinião em
  `public/db1-opinion.json`, nome de quadrante, anel ou flag, e formatação de data.
metadata:
  author: clovis-cli
  type: technical-skill
---

# Internacionalização do Radar

> **Manutenção desta skill**
>
> Mudança de comportamento ou de decisão — outro mecanismo de detecção de idioma, outro
> `fallbackLng`, outra forma de persistir a escolha, outra biblioteca de data, outro conjunto de
> idiomas — exige atualizar esta skill junto com o código. Refatoração técnica que preserva o
> padrão — renomear um componente, mover um arquivo, extrair uma função, atualizar a versão de
> `i18next` ou de `moment` — não exige tocar aqui. Divergência entre o que esta skill prescreve e
> o que o código faz, sem decisão registrada em `.agents/context/discovery-answers.md` ou em ADR,
> deve ser escalada para a pessoa responsável, não resolvida por inferência.

## Visão geral do padrão e do problema que resolve

O radar entrega todo o conteúdo em português, inglês e espanhol por três canais distintos, que
compartilham um único idioma ativo:

- **Texto de interface** — rótulos, navegação, legendas e a página de ajuda. Vive em
  `src/i18n/translations/{pt,en,es}.json` e é resolvido pelo `i18next`.
- **Corpo da opinião** — o HTML de cada item do acervo. Vive em `public/db1-opinion.json`, nos
  campos `bodyPt`, `bodyEn` e `bodyEs` do mesmo registro.
- **Datas de release** — formatadas pelo `moment` no locale correspondente ao idioma ativo.

O idioma ativo é único e global: o `i18next` o guarda, o `ButtonFlag` o altera, o detector o lê
do `localStorage` na carga da página e os três canais o consultam. `src/i18n/index.ts` concentra
essa configuração:

```ts
i18n.use(new LanguageDetector(null, { lookupLocalStorage: StorageKey.language }))
  .use(initReactI18next)
  .init({
    fallbackLng: Language.en,
    interpolation: { escapeValue: false },
    resources: { en: enTranslations, pt: ptTranslations, es: esTranslations },
  });
```

Os três JSON são importados em tempo de build e embutidos no pacote; não há carregamento sob
demanda nem backend de tradução.

## Como aplicar

### Adicionar ou renomear uma chave de interface

1. Edite os **três** arquivos `src/i18n/translations/pt.json`, `en.json` e `es.json`, inserindo a
   chave no mesmo caminho dentro do objeto raiz `translation`. Uma chave que existe em um arquivo
   e falta em outro é uma dessincronização, não um estado intermediário aceitável.
2. Siga a organização em vigor: chaves planas para rótulos globais (`radarName`, `versionLabel`,
   `footerFootnote`), objetos aninhados para escopos de página (`navbar`, `pageIndex`, `pageItem`,
   `pageOverview`, `pageHelp`) e dicionários indexados pelo slug do dado (`quadrants.<slug>`,
   `rings.<anel>`, `flags.<flag>`, `legend.<item>`).
3. Mantenha a forma idêntica nos três arquivos. Quando o valor é uma lista — como
   `pageHelp.paragraphs`, `pageHelp.quadrants` e `pageHelp.rings` —, o número de elementos e os
   campos de cada elemento devem coincidir nos três idiomas.
4. Renomear uma chave significa renomeá-la nos três arquivos e em todos os pontos de consumo no
   mesmo commit, inclusive nos usos com chave dinâmica.

Quando a chave falta no idioma ativo, o `i18next` resolve pelo `fallbackLng`, que é `en`. Quando
falta também em `en`, `t` devolve a própria string da chave e ela aparece na tela como texto
literal. O fallback atua no nível da chave resolvida: ao buscar uma estrutura inteira com
`returnObjects`, o conteúdo vem do idioma ativo e um elemento ausente dentro dela simplesmente não
renderiza.

### Consumir a tradução no componente

Use o hook `useTranslation` de `react-i18next`:

```tsx
const { t } = useTranslation();
// ...
<SetTitle title={t("pageOverview.title")} />
<Badge type={item.ring}>{t(`rings.${item.ring}`)}</Badge>
```

Convenções de consumo:

- **Chave dinâmica** vinda do dado: componha com template string, como em
  ``t(`quadrants.${item.quadrant}`)``, ``t(`rings.${item.ring}`)`` e ``t(`flags.${item.flag}`)``.
  Todo valor novo de quadrante, anel ou flag em `public/db1-opinion.json` ou em
  `public/config.json` exige a entrada correspondente nos três arquivos de tradução.
- **Valor tipado como string** em uma prop: anote a chamada, como em
  `t<string>("pageHelp.sourcecodeLink.href")`.
- **Estrutura aninhada**: `t("pageHelp.paragraphs", { returnObjects: true })` com um tipo local
  declarado no componente para a conversão.
- **Fora de componente React** — `src/date.ts` e `src/hooks/get-item-body.tsx` — importe a
  instância `i18next` diretamente e leia `i18n.language`.

### Renderizar texto de tradução com HTML

`escapeValue: false` deixa o `i18next` devolver o valor sem escapar. Texto de tradução que contém
marcação deve chegar à tela por `dangerouslySetInnerHTML` alimentado por `sanitize`
(`src/sanitize.ts`):

```tsx
<div className="footnote" dangerouslySetInnerHTML={sanitize(t("footerFootnote"))} />
```

Chame `sanitize(valor)` sem segundo argumento para aplicar a lista branca do projeto — `b`, `i`,
`em`, `strong`, `a`, `ul`, `ol`, `li`, com `href` e `target` permitidos em `a`. O segundo
argumento substitui essa lista inteira pelas opções informadas; `PageHelp` o usa nas descrições de
quadrante e de anel.

### Obter o corpo da opinião

O corpo do item deve ser lido por `getItemBody(item)`, de `src/hooks/get-item-body.tsx`:

```tsx
const itemBody = getItemBody(item);
```

Não leia `item.bodyPt`, `item.bodyEn` ou `item.bodyEs` diretamente. O detector de idioma devolve
códigos com região — `pt-BR`, `es-419` —, que não correspondem a nenhum dos três campos.
`getItemBody` normaliza o código cortando no hífen e só então escolhe o campo:

```ts
i18n.language.includes('-')
  ? language = i18n.language.split('-')[0]
  : language = i18n.language;
```

`PageItem`, `PageItemMobile` e a busca de `PageOverview` consomem o corpo por essa função. Um
ponto novo que precise do corpo da opinião deve usar a mesma função.

No dado, os três corpos vivem no mesmo registro de `public/db1-opinion.json` e o tipo `Item`
(`src/model.ts`) declara os três como obrigatórios:

```json
{
  "title": "Kotlin",
  "quadrant": "languages-and-frameworks",
  "ring": "adopt",
  "bodyPt": "<h2>Nossa opinião</h2> ...",
  "bodyEn": "<h2>Our opinion</h2> ...",
  "bodyEs": "<h2>Nuestra opinión</h2> ..."
}
```

Item novo ou alteração de texto de opinião deve atualizar os três campos no mesmo pull request.

### Trocar o idioma

A troca acontece em `ButtonFlag` (`src/components/ButtonFlag/ButtonFlag.tsx`), que renderiza uma
bandeira por entrada de `languageOptions` e, no clique, aplica o idioma e o persiste:

```tsx
i18n.changeLanguage(languageOption.value);
await localStorage.setItem(StorageKey.language, languageOption.value);
```

A chave de armazenamento é `StorageKey.language` (`src/model.ts`), a mesma que o detector recebe
em `lookupLocalStorage` — é esse par que faz a escolha sobreviver ao recarregamento. Um ponto novo
de troca de idioma deve importar a instância de `../../i18n`, chamar `i18n.changeLanguage` e
gravar essa mesma chave.

A importação de `src/i18n/index.ts` feita por `ButtonFlag` é o que inicializa o `i18next`;
`ButtonFlag` entra na árvore por `Header` e por `LogoLink`.

### Formatar datas

Toda data exibida passa por `formatRelease`, de `src/date.ts`:

```ts
export const formatRelease = (isoDate: moment.MomentInput, format: string = "MMMM YYYY") =>
  isoDateToMoment(isoDate).locale(i18n.language).format(format);
```

- O locale vem de `i18n.language`, lido na hora da chamada.
- O formato padrão é `MMMM YYYY`; `PageIndex` e `ItemRevisions` passam `config.dateFormat`, que
  vem de `public/config.json`.
- Os locales disponíveis são exatamente os importados no topo de `src/date.ts`:
  `moment/locale/pt` e `moment/locale/es`, além do inglês embutido no `moment`. Locale novo exige
  uma importação nova nesse arquivo.

Não chame `moment(...).format(...)` direto em um componente: isso formata no locale global do
`moment` e ignora o idioma ativo.

## Ferramentas e artefatos envolvidos

| Artefato | Caminho | Papel |
| --- | --- | --- |
| Inicialização do `i18next` | `src/i18n/index.ts` | Detector, `fallbackLng`, `escapeValue` e registro dos três pacotes de tradução |
| Pacotes de tradução | `src/i18n/translations/pt.json`, `en.json`, `es.json` | Todo o texto de interface, sob a raiz `translation` |
| `getItemBody` | `src/hooks/get-item-body.tsx` | Escolhe `bodyPt`, `bodyEn` ou `bodyEs` a partir do idioma ativo |
| `formatRelease` | `src/date.ts` | Formata data no locale ativo; locales do `moment` importados aqui |
| `ButtonFlag` | `src/components/ButtonFlag/ButtonFlag.tsx` | Seletor de idioma; bandeiras em `src/assets/{pt,en,es}.png` |
| `Language`, `StorageKey`, `Item` | `src/model.ts` | Enum dos três idiomas, chave do `localStorage` e os três campos de corpo |
| `sanitize` | `src/sanitize.ts` | Lista branca aplicada ao HTML de tradução |
| Acervo | `public/db1-opinion.json` | Os três corpos de cada item |
| Taxonomia e formato de data | `public/config.json` | Mapa `quadrants` e `dateFormat` |
| `translate` | `src/config.ts` | Lê o rótulo de quadrante do `public/config.json` |
| Bibliotecas | `package.json` | `i18next`, `react-i18next`, `i18next-browser-languagedetector`, `moment`, `sanitize-html` |

## Restrições e armadilhas conhecidas

- **Três idiomas codificados em seis lugares.** O enum `Language` e os campos `bodyPt`/`bodyEn`/
  `bodyEs` de `Item` (`src/model.ts`), o mapa `resources` (`src/i18n/index.ts`), o mapa `body`
  (`src/hooks/get-item-body.tsx`), `languageOptions` (`ButtonFlag.tsx`) e as importações de locale
  (`src/date.ts`). Um quarto idioma exige mudar os seis pontos, acrescentar a bandeira em
  `src/assets/` e preencher o campo novo em todos os registros de `public/db1-opinion.json`.
- **Chave ausente vira texto na tela.** Sem a chave em nenhum dos três arquivos, `t` devolve a
  string da chave. É o caso de `flags.changed`: `FlagType.changed` existe em `src/model.ts`,
  `public/db1-opinion.json` tem itens com `"flag": "changed"` e `Flag` chama
  ``t(`flags.${item.flag}`)``, mas apenas `flags.new` está traduzida nos três arquivos.
- **Lista fora de sincronia some sem erro.** `pageHelp.paragraphs[2].values[2]` existe em `pt.json`
  e em `en.json` e falta em `es.json`; a página de ajuda em espanhol exibe um parágrafo a menos,
  porque `returnObjects` resolve a estrutura inteira no idioma ativo e não faz fallback por
  elemento.
- **Valor traduzido pode estar no idioma errado.** `pageHelp.quadrantsPreDescription` em `en.json`
  contém o texto português `"Os quadrantes são:"`. Estrutura sincronizada não garante tradução
  feita; a revisão do valor é humana.
- **Dois caminhos para o rótulo de quadrante.** ``t(`quadrants.${slug}`)`` resolve pelos arquivos
  de tradução em `PageQuadrant`, `PageItem`, `PageOverview`, `QuadrantSection` e `RadarGrid`,
  enquanto `translate(config, item.quadrant)` (`src/config.ts`) lê o mapa `quadrants` de
  `public/config.json`, que guarda um único conjunto de rótulos, e é o usado por `PageItemMobile`.
  Alterar o nome de um quadrante exige decidir sobre as duas fontes.
- **Interpolação sem escape.** `escapeValue: false` vale para todas as chaves: valor interpolado
  entra cru no texto traduzido.
- **Corpo da opinião entra sem sanitização.** `PageItem` e `PageItemMobile` injetam o retorno de
  `getItemBody` com `dangerouslySetInnerHTML={{ __html: itemBody }}`. O mesmo vale para
  `revision.body` em `ItemRevision`. A revisão do pull request é o único controle sobre esse HTML.
- **`Revision` não é trilíngue.** O tipo `Revision` (`src/model.ts`) tem um único campo `body`; o
  histórico de revisões aparece no idioma em que foi escrito, qualquer que seja o idioma ativo.
- **`getItemBody` normaliza o código de idioma, `formatRelease` não.** `formatRelease` repassa
  `i18n.language` inteiro para `moment.locale()`.
- **Em teste, o `i18next` pode estar sem inicialização.** `src/i18n/index.ts` só é carregado pela
  importação feita em `ButtonFlag`. Um teste que renderiza um componente isolado, ou que exercita
  `src/date.ts` diretamente como `src/date.test.tsx`, roda com `i18n.language` indefinido e produz
  saída em inglês. Teste que afirma conteúdo localizado deve importar `src/i18n` e chamar
  `i18n.changeLanguage` antes de renderizar.
