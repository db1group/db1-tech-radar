import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import i18n from "../i18n";
import { Item, Language } from "../model";
import { configWithFiveQuadrants, items } from "./QuadrantGrid/testData";
import Router from "./Router";

const newQuadrant = "data-and-intelligence";
const newItem = items.find((item) => item.quadrant === newQuadrant) as Item;

const quadrantLabel: Record<Language, string> = {
  [Language.pt]: "Dados & Inteligência",
  [Language.en]: "Data & Intelligence",
  [Language.es]: "Datos e Inteligencia",
};

const registerNewQuadrant = () => {
  (Object.keys(quadrantLabel) as Language[]).forEach((lng) => {
    i18n.addResourceBundle(
      lng,
      "translation",
      {
        quadrants: { [newQuadrant]: quadrantLabel[lng] },
        pageHelp: {
          quadrants: {
            [newQuadrant]: {
              name: quadrantLabel[lng],
              description: quadrantLabel[lng],
            },
          },
        },
      },
      true,
      true
    );
  });
};

const renderRouter = (pageName: string, search = "") =>
  render(
    <Router
      pageName={pageName}
      items={items}
      releases={[]}
      search={search}
      config={configWithFiveQuadrants}
    />,
    { wrapper: MemoryRouter }
  );

const itemRoute = `${newQuadrant}/${newItem.name}`;

describe("Router navigation to a new quadrant", () => {
  beforeAll(() => {
    registerNewQuadrant();
  });

  beforeEach(async () => {
    await i18n.changeLanguage(Language.pt);
  });

  it("should open the quadrant page of the new quadrant with its item listed", () => {
    renderRouter(newQuadrant);

    expect(screen.getByText(newItem.title)).toBeInTheDocument();
    expect(
      screen.getAllByText(quadrantLabel[Language.pt]).length
    ).toBeGreaterThan(0);
  });

  it("should open the item page of the new quadrant", () => {
    renderRouter(itemRoute);

    expect(
      screen.getByRole("heading", { name: newItem.title })
    ).toBeInTheDocument();
  });

  it("should open the wide item page of the new quadrant", () => {
    const originalWidth = window.innerWidth;
    window.innerWidth = 1280;

    renderRouter(itemRoute);

    expect(
      screen.getByRole("heading", { name: newItem.title })
    ).toBeInTheDocument();

    window.innerWidth = originalWidth;
  });

  it("should find the new quadrant item through search", () => {
    renderRouter("overview", newItem.title);

    expect(screen.getByText(newItem.title)).toBeInTheDocument();
  });

  it("should list the new quadrant item on the overview", () => {
    renderRouter("overview");

    expect(screen.getByText(newItem.title)).toBeInTheDocument();
  });

  [Language.pt, Language.en, Language.es].forEach((lng) => {
    it(`should show no raw translation key across the screens in ${lng}`, async () => {
      await i18n.changeLanguage(lng);

      [newQuadrant, itemRoute, "overview"].forEach((pageName) => {
        const { unmount } = renderRouter(pageName);

        expect(screen.queryAllByText(/quadrants\.[a-z]/)).toHaveLength(0);
        expect(screen.queryAllByText(/pageHelp[.a-z]/)).toHaveLength(0);

        unmount();
      });
    });
  });
});
