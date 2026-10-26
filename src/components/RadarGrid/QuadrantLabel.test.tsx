import { render, screen } from "@testing-library/react";

import realConfig from "../../../public/config.json";
import { ConfigData } from "../../config";
import i18n from "../../i18n";
import { Language, QuadrantConfig } from "../../model";
import QuadrantLabel from "./QuadrantLabel";

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

const publishedConfig = realConfig as unknown as ConfigData;

const publishedBlocks = [
  { slug: "methods-and-patterns", slot: 1, position: 2, colour: "#4867ff" },
  { slug: "tools", slot: 2, position: 4, colour: "#ffc000" },
  {
    slug: "platforms-and-operations",
    slot: 3,
    position: 3,
    colour: "#ff2d5e",
  },
  {
    slug: "languages-and-frameworks",
    slot: 4,
    position: 1,
    colour: "#cdcaeb",
  },
];

const unpublishedQuadrant = {
  slug: "data-and-intelligence",
  label: "Data & Intelligence",
};

const mountLabel = (
  quadrantName: string,
  quadrantLabel: string,
  quadrantConfig: QuadrantConfig
) => {
  render(
    <QuadrantLabel
      quadrantConfig={quadrantConfig}
      quadrantName={quadrantName}
      quadrantLabel={quadrantLabel}
    />
  );
};

const mountPublishedLabel = (quadrantName: string) => {
  mountLabel(
    quadrantName,
    publishedConfig.quadrants[quadrantName],
    publishedConfig.quadrantsMap[quadrantName]
  );
};

const headlineOnSlot = (quadrantLabel: string, slot: number) =>
  screen.queryByText(quadrantLabel, {
    selector: `.quadrant-label--slot-${slot} .headline`,
  });

describe("QuadrantLabel", () => {
  beforeEach(async () => {
    await i18n.changeLanguage(Language.pt);
  });

  it.each(publishedBlocks)(
    "should place the block of $slug on the screen slot $slot",
    ({ slug, slot }) => {
      mountPublishedLabel(slug);

      expect(
        headlineOnSlot(publishedConfig.quadrants[slug], slot)
      ).toBeInTheDocument();
    }
  );

  it.each(publishedBlocks)(
    "should keep the block of $slug on the screen slot $slot when no order is declared",
    ({ slug, slot }) => {
      const { order, ...quadrantConfig } = publishedConfig.quadrantsMap[slug];

      mountLabel(slug, publishedConfig.quadrants[slug], quadrantConfig);

      expect(
        headlineOnSlot(publishedConfig.quadrants[slug], slot)
      ).toBeInTheDocument();
    }
  );

  it.each(publishedBlocks)(
    "should display the declared position of $slug",
    ({ slug, position }) => {
      mountPublishedLabel(slug);

      expect(screen.getByText(`quadrante ${position}`)).toBeInTheDocument();
    }
  );

  it.each(publishedBlocks)(
    "should paint the divider of $slug with the declared colour",
    ({ slug, colour }) => {
      mountPublishedLabel(slug);

      expect(screen.getByRole("separator")).toHaveStyle(
        `border-color: ${colour}`
      );
    }
  );

  it("should follow the screen slot when it diverges from the displayed position", () => {
    mountLabel(unpublishedQuadrant.slug, unpublishedQuadrant.label, {
      colour: "#000000",
      txtColour: "white",
      position: 5,
      order: 2,
      description: "",
    });

    expect(headlineOnSlot(unpublishedQuadrant.label, 2)).toBeInTheDocument();
    expect(headlineOnSlot(unpublishedQuadrant.label, 5)).not.toBeInTheDocument();
  });

  it("should fall back to the displayed position when no screen slot is declared", () => {
    mountLabel(unpublishedQuadrant.slug, unpublishedQuadrant.label, {
      colour: "#000000",
      txtColour: "white",
      position: 5,
      description: "",
    });

    expect(headlineOnSlot(unpublishedQuadrant.label, 5)).toBeInTheDocument();
  });
});
