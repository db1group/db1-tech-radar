import realConfig from "../../../public/config.json";
import { ConfigData } from "../../config";
import { HomepageOption, Point, QuadrantConfig } from "../../model";
import {
  DEG_TO_RAD,
  GlowShape,
  glowShape,
  polarToCartesian,
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

const publishedGlowTips = [
  { slug: "methods-and-patterns", startTip: "top", endTip: "right" },
  { slug: "tools", startTip: "right", endTip: "bottom" },
  { slug: "platforms-and-operations", startTip: "bottom", endTip: "left" },
  { slug: "languages-and-frameworks", startTip: "left", endTip: "top" },
] as const;

type Side = "top" | "right" | "bottom" | "left";

const sectorsOf = (numSegments: number) =>
  Array.from({ length: numSegments }, (_, index) =>
    segmentAngles(index + 1, numSegments)
  );

const polygonPoints = (shape: GlowShape): Point[] => {
  if (shape.kind !== "polygon") {
    throw new Error(`expected a polygon, got a ${shape.kind}`);
  }

  return shape.points;
};

const chordDistanceToCentre = (points: Point[]): number => {
  const [centre, start, end] = points;
  const dx = end.x - start.x,
    dy = end.y - start.y;

  return (
    Math.abs(dx * (start.y - centre.y) - dy * (start.x - centre.x)) /
    Math.sqrt(dx * dx + dy * dy)
  );
};

const expectTipOn = (tip: Point, side: Side, centre: number) => {
  switch (side) {
    case "top":
      expect(tip.x).toBeCloseTo(centre, 10);
      expect(tip.y).toBeLessThan(centre);
      break;
    case "right":
      expect(tip.x).toBeGreaterThan(centre);
      expect(tip.y).toBeCloseTo(centre, 10);
      break;
    case "bottom":
      expect(tip.x).toBeCloseTo(centre, 10);
      expect(tip.y).toBeGreaterThan(centre);
      break;
    case "left":
      expect(tip.x).toBeLessThan(centre);
      expect(tip.y).toBeCloseTo(centre, 10);
      break;
  }
};

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

describe("polarToCartesian", () => {
  const centre = 400,
    radius = 800;

  it("should place 0 degrees straight above the centre", () => {
    const { x, y } = polarToCartesian(centre, radius, 0);

    expect(x).toBeCloseTo(centre, 10);
    expect(y).toBeCloseTo(centre - radius, 10);
  });

  it("should place 90 degrees to the right of the centre", () => {
    const { x, y } = polarToCartesian(centre, radius, 90);

    expect(x).toBeCloseTo(centre + radius, 10);
    expect(y).toBeCloseTo(centre, 10);
  });

  it("should place 180 degrees straight below the centre", () => {
    const { x, y } = polarToCartesian(centre, radius, 180);

    expect(x).toBeCloseTo(centre, 10);
    expect(y).toBeCloseTo(centre + radius, 10);
  });

  it("should place 270 degrees to the left of the centre", () => {
    const { x, y } = polarToCartesian(centre, radius, 270);

    expect(x).toBeCloseTo(centre - radius, 10);
    expect(y).toBeCloseTo(centre, 10);
  });
});

describe("glowShape", () => {
  const size = 800,
    centre = size / 2;

  it("should cover the whole radar circle with a single segment", () => {
    expect(glowShape(1, 1, size)).toEqual({
      kind: "circle",
      cx: centre,
      cy: centre,
      r: centre,
    });
  });

  it("should give the right half to the first of two segments", () => {
    expect(glowShape(1, 2, size)).toEqual({
      kind: "rect",
      x: centre,
      y: 0,
      width: centre,
      height: size,
    });
  });

  it("should give the left half to the second of two segments", () => {
    expect(glowShape(2, 2, size)).toEqual({
      kind: "rect",
      x: 0,
      y: 0,
      width: centre,
      height: size,
    });
  });

  [3, 5, 6].forEach((numSegments) => {
    it(`should open each of the ${numSegments} sectors at the centre with finite tips`, () => {
      for (let slot = 1; slot <= numSegments; slot++) {
        const points = polygonPoints(glowShape(slot, numSegments, size));

        expect(points).toHaveLength(3);
        expect(points[0]).toEqual({ x: centre, y: centre });
        points.forEach(({ x, y }) => {
          expect(Number.isFinite(x)).toBe(true);
          expect(Number.isFinite(y)).toBe(true);
        });
      }
    });

    it(`should keep the chord of each of the ${numSegments} sectors off the radar circle`, () => {
      for (let slot = 1; slot <= numSegments; slot++) {
        const distance = chordDistanceToCentre(
          polygonPoints(glowShape(slot, numSegments, size))
        );

        expect(distance).toBeGreaterThanOrEqual(centre);
      }
    });
  });

  it("should make the chord tangent to the radar circle with three segments", () => {
    for (let slot = 1; slot <= 3; slot++) {
      const distance = chordDistanceToCentre(
        polygonPoints(glowShape(slot, 3, size))
      );

      expect(distance).toBeCloseTo(centre, 10);
    }
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

  publishedGlowTips.forEach(({ slug, startTip, endTip }) => {
    it(`should keep the glow of ${slug} on the ${startTip}-to-${endTip} sector of the screen`, () => {
      const size = publishedConfig.chartConfig.size,
        centre = size / 2;
      const [, start, end] = polygonPoints(
        glowShape(
          slotOf(publishedConfig.quadrantsMap[slug]),
          segmentCount(publishedConfig),
          size
        )
      );

      expectTipOn(start, startTip, centre);
      expectTipOn(end, endTip, centre);
    });
  });
});
