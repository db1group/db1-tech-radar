/* eslint-disable testing-library/no-container, testing-library/no-node-access, testing-library/render-result-naming-convention */
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import realConfig from "../../../public/config.json";
import { ConfigData } from "../../config";
import i18n from "../../i18n";
import { Item, Language } from "../../model";
import {
  DEG_TO_RAD,
  SECTOR_PADDING_ANGLE,
  segmentAngles,
  segmentCount,
  slotOf,
} from "../Chart/geometry";
import {
  configWithFiveQuadrants,
  configWithFourQuadrants,
  configWithSixQuadrants,
  configWithThreeQuadrants,
  items,
} from "../QuadrantGrid/testData";
import RadarGrid from "./RadarGrid";

const publishedConfig = realConfig as unknown as ConfigData;

const CENTRE = publishedConfig.chartConfig.size / 2;
const TOLERANCE = 1e-9;

const renderGrid = (config: ConfigData, gridItems: Item[] = items): Element =>
  render(<RadarGrid items={gridItems} config={config} />, {
    wrapper: MemoryRouter,
  }).container;

const angleOf = (x: number, y: number): number =>
  (Math.atan2(x - CENTRE, CENTRE - y) / DEG_TO_RAD + 360) % 360;

const circularDistance = (a: number, b: number): number =>
  Math.abs((((a - b + 180) % 360) + 360) % 360 - 180);

const validItems = (config: ConfigData): Item[] =>
  items.filter(
    (item) => item.ring && item.quadrant && config.quadrantsMap[item.quadrant]
  );

const multiN = [
  { n: 3, config: configWithThreeQuadrants },
  { n: 4, config: configWithFourQuadrants },
  { n: 5, config: configWithFiveQuadrants },
  { n: 6, config: configWithSixQuadrants },
];

describe("RadarGrid", () => {
  beforeAll(async () => {
    await i18n.changeLanguage(Language.pt);
  });

  multiN.forEach(({ n, config }) => {
    it(`should draw a ring arc per quadrant and ring plus one glow per quadrant with ${n} quadrants`, () => {
      const container = renderGrid(config);

      expect(container.querySelectorAll(".quadrant-ring path")).toHaveLength(
        n * config.rings.length
      );
      expect(container.querySelectorAll(".quadrant-ring polygon")).toHaveLength(
        n
      );
    });

    it(`should keep every SVG coordinate finite with ${n} quadrants`, () => {
      const container = renderGrid(config);

      const coordinates: string[] = [];
      container.querySelectorAll("svg *").forEach((node) => {
        ["d", "points", "cx", "cy", "x", "y"].forEach((attribute) => {
          const value = node.getAttribute(attribute);
          if (value !== null) {
            coordinates.push(value);
          }
        });
      });

      expect(coordinates.join(" ")).not.toMatch(/NaN|undefined/);
    });

    it(`should render one blip per valid item with ${n} quadrants`, () => {
      const container = renderGrid(config);

      expect(container.querySelectorAll(".blips circle")).toHaveLength(
        validItems(config).length
      );
    });

    it(`should keep every blip inside the sector of its quadrant with ${n} quadrants`, () => {
      const container = renderGrid(config);

      container.querySelectorAll(".blips circle").forEach((circle) => {
        const item = items.find(
          (candidate) => candidate.title === circle.getAttribute("data-tip")
        ) as Item;
        const { startAngle, endAngle } = segmentAngles(
          slotOf(config.quadrantsMap[item.quadrant]),
          n
        );
        const angle = angleOf(
          Number(circle.getAttribute("cx")),
          Number(circle.getAttribute("cy"))
        );

        expect(angle).toBeGreaterThanOrEqual(
          startAngle + SECTOR_PADDING_ANGLE - TOLERANCE
        );
        expect(angle).toBeLessThanOrEqual(
          endAngle - SECTOR_PADDING_ANGLE + TOLERANCE
        );
      });
    });

    it(`should place one label block per quadrant on its slot with ${n} quadrants`, () => {
      const container = renderGrid(config);

      expect(container.querySelectorAll(".quadrant-label")).toHaveLength(n);
      expect(
        container.querySelector(".radar-grid")?.getAttribute("data-quadrants")
      ).toBe(String(n));
      Object.values(config.quadrantsMap).forEach((quadrant) => {
        expect(
          container.querySelector(`.quadrant-label--slot-${slotOf(quadrant)}`)
        ).not.toBeNull();
      });
    });

    it(`should render two ring labels per ring with ${n} quadrants`, () => {
      const container = renderGrid(config);

      const ringLabels = container.querySelectorAll(".ring-label");

      expect(ringLabels).toHaveLength(config.rings.length);
      ringLabels.forEach((label) => {
        expect(label.querySelectorAll("text")).toHaveLength(2);
      });
    });
  });

  it("should paint each quadrant colour on its screen sector with the published config", () => {
    const container = renderGrid(
      publishedConfig,
      validItems(publishedConfig)
    );
    const n = segmentCount(publishedConfig);
    const polygons = Array.from(
      container.querySelectorAll(".quadrant-ring polygon")
    );

    Object.values(publishedConfig.quadrantsMap).forEach((quadrant) => {
      const polygon = polygons.find(
        (candidate) => candidate.getAttribute("fill") === quadrant.colour
      ) as Element;
      const { startAngle, endAngle } = segmentAngles(slotOf(quadrant), n);
      const [, start, end] = (polygon.getAttribute("points") as string)
        .split(" ")
        .map((pair) => pair.split(",").map(Number));

      expect(circularDistance(angleOf(start[0], start[1]), startAngle)).toBeLessThan(
        1e-6
      );
      expect(circularDistance(angleOf(end[0], end[1]), endAngle)).toBeLessThan(
        1e-6
      );
    });
  });
});
