import realConfig from "../../../public/config.json";
import { ConfigData } from "../../config";
import { HomepageOption, QuadrantConfig } from "../../model";
import {
  DEG_TO_RAD,
  segmentAngles,
  segmentCount,
  segmentRadians,
  slotOf,
} from "./geometry";

const publishedConfig = realConfig as unknown as ConfigData;

const segmentCounts = [3, 4, 5, 6];

const publishedSectors = [
  { slug: "methods-and-patterns", startAngle: 0, endAngle: 90 },
  { slug: "tools", startAngle: 90, endAngle: 180 },
  { slug: "platforms-and-operations", startAngle: 180, endAngle: 270 },
  { slug: "languages-and-frameworks", startAngle: 270, endAngle: 360 },
];

const publishedArcs = [
  { slug: "methods-and-patterns", startAngle: 0, endAngle: Math.PI / 2 },
  { slug: "tools", startAngle: Math.PI / 2, endAngle: Math.PI },
  {
    slug: "platforms-and-operations",
    startAngle: Math.PI,
    endAngle: (3 * Math.PI) / 2,
  },
  {
    slug: "languages-and-frameworks",
    startAngle: (3 * Math.PI) / 2,
    endAngle: 2 * Math.PI,
  },
];

const configWithQuadrants = (quadrantCount: number): ConfigData => {
  const quadrantsMap: { [quadrant: string]: QuadrantConfig } = {};

  for (let slot = 1; slot <= quadrantCount; slot++) {
    quadrantsMap[`quadrant-${slot}`] = {
      colour: "#000000",
      txtColour: "white",
      position: slot,
      order: slot,
      description: "",
    };
  }

  return {
    quadrants: {},
    rings: [],
    showEmptyRings: false,
    quadrantsMap,
    chartConfig: {
      size: 800,
      scale: [-16, 16],
      blipSize: 12,
      ringsAttributes: [],
    },
    homepageContent: HomepageOption.both,
  };
};

const sectorsOf = (numSegments: number) =>
  Array.from({ length: numSegments }, (_, index) =>
    segmentAngles(index + 1, numSegments)
  );

describe("segmentAngles", () => {
  segmentCounts.forEach((numSegments) => {
    it(`should split the circle into ${numSegments} contiguous sectors`, () => {
      const sectors = sectorsOf(numSegments);

      expect(sectors[0].startAngle).toBe(0);
      expect(sectors[numSegments - 1].endAngle).toBe(360);
      sectors.slice(1).forEach((sector, index) => {
        expect(sector.startAngle).toBe(sectors[index].endAngle);
      });
    });

    it(`should not overlap any pair of the ${numSegments} sectors`, () => {
      const sectors = sectorsOf(numSegments);

      sectors.forEach((sector, index) => {
        expect(sector.endAngle).toBeGreaterThan(sector.startAngle);
        sectors.slice(index + 1).forEach((following) => {
          expect(following.startAngle).toBeGreaterThanOrEqual(sector.endAngle);
        });
      });
    });

    it(`should add the ${numSegments} increments up to exactly 360 degrees`, () => {
      const total = sectorsOf(numSegments).reduce(
        (sum, sector) => sum + sector.angleIncrement,
        0
      );

      expect(total).toBe(360);
    });

    it(`should open the first sector at 0 degrees for ${numSegments} segments`, () => {
      expect(segmentAngles(1, numSegments)).toEqual({
        startAngle: 0,
        endAngle: 360 / numSegments,
        angleIncrement: 360 / numSegments,
      });
    });
  });
});

describe("segmentRadians", () => {
  [3, 5, 6].forEach((numSegments) => {
    it(`should produce a finite ascending pair for each of the ${numSegments} slots`, () => {
      for (let slot = 1; slot <= numSegments; slot++) {
        const { startAngle, endAngle } = segmentRadians(slot, numSegments);

        expect(Number.isFinite(startAngle)).toBe(true);
        expect(Number.isFinite(endAngle)).toBe(true);
        expect(endAngle).toBeGreaterThan(startAngle);
      }
    });

    it(`should add the ${numSegments} sectors up to a full turn`, () => {
      let total = 0;

      for (let slot = 1; slot <= numSegments; slot++) {
        const { startAngle, endAngle } = segmentRadians(slot, numSegments);
        total += endAngle - startAngle;
      }

      expect(total).toBeCloseTo(2 * Math.PI, 10);
    });
  });
});

describe("slotOf", () => {
  it("should return the declared order", () => {
    const quadrant: QuadrantConfig = {
      colour: "#ffc000",
      txtColour: "white",
      position: 4,
      order: 2,
      description: "",
    };

    expect(slotOf(quadrant)).toBe(2);
  });

  it("should fall back to the position when no order is declared", () => {
    const quadrant: QuadrantConfig = {
      colour: "#ffc000",
      txtColour: "white",
      position: 4,
      description: "",
    };

    expect(slotOf(quadrant)).toBe(4);
  });
});

describe("segmentCount", () => {
  [1, 3, 6].forEach((quadrantCount) => {
    it(`should count the ${quadrantCount} entries of quadrantsMap`, () => {
      expect(segmentCount(configWithQuadrants(quadrantCount))).toBe(
        quadrantCount
      );
    });
  });
});

describe("DEG_TO_RAD", () => {
  it("should convert degrees into the radians consumed by the arc generator", () => {
    expect(0 * DEG_TO_RAD).toBe(0);
    expect(90 * DEG_TO_RAD).toBe(Math.PI / 2);
    expect(180 * DEG_TO_RAD).toBe(Math.PI);
    expect(270 * DEG_TO_RAD).toBe((3 * Math.PI) / 2);
    expect(360 * DEG_TO_RAD).toBe(2 * Math.PI);
  });
});

describe("public/config.json", () => {
  it("should declare contiguous orders from 1 to the number of quadrants", () => {
    const orders = Object.keys(publishedConfig.quadrantsMap)
      .map((slug) => slotOf(publishedConfig.quadrantsMap[slug]))
      .sort((a, b) => a - b);

    expect(orders).toEqual(
      Array.from(
        { length: segmentCount(publishedConfig) },
        (_, index) => index + 1
      )
    );
  });

  publishedSectors.forEach(({ slug, startAngle, endAngle }) => {
    it(`should keep ${slug} between ${startAngle} and ${endAngle} degrees`, () => {
      const sector = segmentAngles(
        slotOf(publishedConfig.quadrantsMap[slug]),
        segmentCount(publishedConfig)
      );

      expect(sector.startAngle).toBe(startAngle);
      expect(sector.endAngle).toBe(endAngle);
    });
  });

  publishedArcs.forEach(({ slug, startAngle, endAngle }) => {
    it(`should feed the arc generator with the published radians of ${slug}`, () => {
      const arc = segmentRadians(
        slotOf(publishedConfig.quadrantsMap[slug]),
        segmentCount(publishedConfig)
      );

      expect(arc.startAngle).toBeCloseTo(startAngle, 10);
      expect(arc.endAngle).toBeCloseTo(endAngle, 10);
    });
  });
});
