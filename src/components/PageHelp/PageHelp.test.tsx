import { render, screen, within } from "@testing-library/react";

import i18n from "../../i18n";
import { Language } from "../../model";
import PageHelp from "./PageHelp";

const publishedQuadrants = [
  {
    slug: "languages-and-frameworks",
    name: "Linguagens e frameworks",
    description:
      "Aqui colocamos linguagens e frameworks de desenvolvimento que são úteis para a implementação de software personalizado de todos os tipos.",
  },
  {
    slug: "methods-and-patterns",
    name: "Métodos e padrões",
    description:
      "Padrões são muito importantes. Muitos deles duram muito mais que ferramentas ou frameworks. Portanto, esta categoria determina o como desenvolvemos software.",
  },
  {
    slug: "platforms-and-operations",
    name: "Plataformas e operações",
    description:
      "Aqui incluímos plataformas e serviços de infraestrutura. Também usamos essa categoria para comunicar notícias sobre os serviços da DB1 que queremos que todas as equipes da DB1 conheçam.",
  },
  {
    slug: "tools",
    name: "Ferramentas",
    description:
      "Aqui colocamos diferentes ferramentas de software, desde pequenas ferramentas auxiliares até projetos de software maiores.",
  },
];

const renderPageHelp = () =>
  render(<PageHelp leaving={false} onLeave={() => undefined} />);

const quadrantItems = () =>
  within(screen.getAllByRole("list")[0]).getAllByRole("listitem");

describe("PageHelp", () => {
  beforeEach(async () => {
    await i18n.changeLanguage(Language.pt);
  });

  it("should render the published quadrant names and descriptions", () => {
    renderPageHelp();

    publishedQuadrants.forEach(({ name, description }) => {
      expect(screen.getByText(`${name}:`)).toBeInTheDocument();
      expect(screen.getByText(description)).toBeInTheDocument();
    });
  });

  it("should render the quadrant list in the published order", () => {
    renderPageHelp();

    expect(quadrantItems().map((item) => item.textContent)).toEqual(
      publishedQuadrants.map(({ name, description }) => `${name}: ${description}`)
    );
  });

  it("should render one item per quadrant declared in the dictionary", async () => {
    const dictionaryLanguage = "maptest";
    const quadrants: {
      [slug: string]: { name: string; description: string };
    } = {};
    publishedQuadrants.forEach(({ slug, name, description }) => {
      quadrants[slug] = { name, description };
    });
    quadrants["data-and-intelligence"] = {
      name: "Dados e inteligência",
      description: "Quinto quadrante declarado apenas para este caso.",
    };

    i18n.addResourceBundle(dictionaryLanguage, "translation", {
      pageHelp: { quadrants },
    });
    await i18n.changeLanguage(dictionaryLanguage);

    const view = renderPageHelp();

    expect(quadrantItems()).toHaveLength(5);
    expect(quadrantItems()[4]).toHaveTextContent(
      "Dados e inteligência: Quinto quadrante declarado apenas para este caso."
    );

    view.unmount();
    await i18n.changeLanguage(Language.pt);
    i18n.removeResourceBundle(dictionaryLanguage, "translation");
  });
});
