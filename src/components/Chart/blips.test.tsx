import realConfig from "../../../public/config.json";
import realRadar from "../../../public/db1-opinion.json";
import { ConfigData } from "../../config";
import { FlagType, Item, featuredOnly } from "../../model";
import { buildBlips } from "./blips";

const publishedConfig = realConfig as unknown as ConfigData;

const publishedItems = realRadar.items as unknown as Item[];

const itemWith = (attributes: Partial<Item>): Item => ({
  name: "a-technology",
  title: "A Technology",
  ring: "adopt",
  quadrant: "tools",
  featured: true,
  bodyPt: "",
  bodyEn: "",
  bodyEs: "",
  info: "",
  flag: FlagType.default,
  revisions: [],
  ...attributes,
});

describe("buildBlips", () => {
  it("should turn every featured item with a ring and a known quadrant into a blip", () => {
    const blips = buildBlips(featuredOnly(publishedItems), publishedConfig);

    expect(blips).toHaveLength(53);
  });

  it("should paint each blip with the colour declared for its quadrant", () => {
    buildBlips(featuredOnly(publishedItems), publishedConfig).forEach((blip) => {
      const quadrantConfig = publishedConfig.quadrantsMap[blip.quadrant];

      expect(blip.colour).toBe(quadrantConfig.colour);
      expect(blip.txtColour).toBe(quadrantConfig.txtColour);
    });
  });

  it("should resolve a finite coordinate for every blip", () => {
    buildBlips(featuredOnly(publishedItems), publishedConfig).forEach(
      ({ coordinates }) => {
        expect(Number.isFinite(coordinates.x)).toBe(true);
        expect(Number.isFinite(coordinates.y)).toBe(true);
      }
    );
  });

  it("should drop the item without a ring, without a quadrant or outside the taxonomy", () => {
    const items = [
      itemWith({ name: "no-ring", ring: "" }),
      itemWith({ name: "no-quadrant", quadrant: "" }),
      itemWith({ name: "unknown-quadrant", quadrant: "data-and-analytics" }),
    ];

    expect(buildBlips(items, publishedConfig)).toEqual([]);
  });

  describe("neighbour distance", () => {
    const alwaysHalf = () => 0.5;
    let warn: jest.SpyInstance;

    beforeEach(() => {
      warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    });

    afterEach(() => {
      warn.mockRestore();
    });

    it("should exhaust the attempts when two blips share the sector and the ring", () => {
      const items = [itemWith({ name: "first" }), itemWith({ name: "second" })];

      const blips = buildBlips(items, publishedConfig, alwaysHalf);

      expect(warn).toHaveBeenCalledTimes(1);
      expect(blips[1].coordinates).toEqual(blips[0].coordinates);
    });

    it("should accept both blips on the first attempt when the sectors differ", () => {
      const items = [
        itemWith({ name: "first", quadrant: "tools" }),
        itemWith({ name: "second", quadrant: "methods-and-patterns" }),
      ];

      buildBlips(items, publishedConfig, alwaysHalf);

      expect(warn).not.toHaveBeenCalled();
    });
  });
});
