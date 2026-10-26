import { render, screen } from "@testing-library/react";

import i18n from "../../i18n";
import { Language } from "../../model";
import QuadrantGrid from "./QuadrantGrid";
import {
  configWithFiveQuadrants,
  configWithFourQuadrants,
  items,
} from "./testData";

jest.mock("../Link/Link", () => {
  const { createElement } = require("react");

  return {
    __esModule: true,
    default: ({
      children,
      className,
    }: {
      children?: unknown;
      className?: string;
    }) => createElement("a", { className }, children),
  };
});

const quadrantHeadlines = () =>
  screen
    .getAllByRole("heading", { level: 4 })
    .map((headline) => headline.textContent);

describe("QuadrantGrid", () => {
  beforeEach(async () => {
    await i18n.changeLanguage(Language.pt);
  });

  it("should render one block per declared quadrant", () => {
    render(<QuadrantGrid items={items} config={configWithFourQuadrants} />);

    expect(quadrantHeadlines()).toHaveLength(4);
  });

  it("should render one block per declared quadrant with five of them", () => {
    render(<QuadrantGrid items={items} config={configWithFiveQuadrants} />);

    expect(quadrantHeadlines()).toHaveLength(5);
  });

  it("should render the blocks in the declaration order of the taxonomy", () => {
    render(<QuadrantGrid items={items} config={configWithFiveQuadrants} />);

    expect(quadrantHeadlines()).toEqual([
      "Linguagens & Frameworks",
      "Métodos & Padrões",
      "Plataformas & Operações",
      "Ferramentas",
      "quadrants.data-and-intelligence",
    ]);
  });
});
