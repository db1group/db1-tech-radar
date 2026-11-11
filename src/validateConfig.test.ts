import realConfig from "../public/config.json";
import { ConfigData } from "./config";
import { Language, QuadrantConfig } from "./model";
import { HasTranslation, validateConfig } from "./validateConfig";
import enTranslations from "./i18n/translations/en.json";
import esTranslations from "./i18n/translations/es.json";
import ptTranslations from "./i18n/translations/pt.json";

const dictionaries: Record<Language, unknown> = {
  [Language.pt]: ptTranslations,
  [Language.en]: enTranslations,
  [Language.es]: esTranslations,
};

const isFilled = (value: unknown): boolean =>
  typeof value === "string" && value.trim().length > 0;

const resolve = (source: unknown, key: string): unknown =>
  key.split(".").reduce<unknown>((node, part) => {
    if (node && typeof node === "object" && part in (node as object)) {
      return (node as Record<string, unknown>)[part];
    }
    return undefined;
  }, source);

const hasTranslation: HasTranslation = (key, lng) =>
  isFilled(
    resolve((dictionaries[lng] as { translation: unknown }).translation, key)
  );

const alwaysTranslated: HasTranslation = () => true;

const published = realConfig as unknown as ConfigData;

const clone = (config: ConfigData): ConfigData =>
  JSON.parse(JSON.stringify(config));

const buildConfig = (count: number): ConfigData => {
  const quadrants: { [slug: string]: string } = {};
  const quadrantsMap: { [slug: string]: QuadrantConfig } = {};

  for (let index = 1; index <= count; index++) {
    const slug = `quadrant-${index}`;
    quadrants[slug] = `Quadrant ${index}`;
    quadrantsMap[slug] = {
      colour: "#000000",
      txtColour: "#ffffff",
      position: index,
      order: index,
      description: "",
    };
  }

  return { ...clone(published), quadrants, quadrantsMap };
};

const withSingleSlug = (slug: string): ConfigData => {
  const config = clone(published);
  config.quadrants = { [slug]: "Quadrant" };
  config.quadrantsMap = {
    [slug]: {
      colour: "#000000",
      txtColour: "#ffffff",
      position: 1,
      order: 1,
      description: "",
    },
  };
  return config;
};

describe("validateConfig", () => {
  it("should return no problem for the published config.json", () => {
    expect(validateConfig(published, hasTranslation)).toEqual([]);
  });

  it("should reject a quadrant count below one", () => {
    const config = clone(published);
    config.quadrants = {};
    config.quadrantsMap = {};

    expect(validateConfig(config, hasTranslation)).toEqual(
      expect.arrayContaining([expect.stringContaining("configure 1 to 6 quadrants")])
    );
  });

  it("should reject a quadrant count above six", () => {
    const problems = validateConfig(buildConfig(7), alwaysTranslated);

    expect(problems).toEqual(
      expect.arrayContaining([
        expect.stringContaining("configure 1 to 6 quadrants"),
      ])
    );
    expect(problems.some((problem) => problem.includes("radar-grid.scss"))).toBe(
      true
    );
  });

  it("should name a slug present only in quadrants", () => {
    const config = clone(published);
    delete config.quadrantsMap["tools"];

    expect(validateConfig(config, hasTranslation)).toEqual(
      expect.arrayContaining([
        'Quadrant slug "tools" is declared in quadrants but missing from quadrantsMap.',
      ])
    );
  });

  it("should name a slug present only in quadrantsMap", () => {
    const config = clone(published);
    delete config.quadrants["tools"];

    expect(validateConfig(config, hasTranslation)).toEqual(
      expect.arrayContaining([
        'Quadrant slug "tools" is declared in quadrantsMap but missing from quadrants.',
      ])
    );
  });

  it("should name the slugs that share a screen slot", () => {
    const config = clone(published);
    config.quadrantsMap["tools"].order =
      config.quadrantsMap["platforms-and-operations"].order;

    const problems = validateConfig(config, hasTranslation);

    expect(
      problems.some(
        (problem) =>
          problem.includes("same screen slot 3") &&
          problem.includes("tools") &&
          problem.includes("platforms-and-operations")
      )
    ).toBe(true);
  });

  it("should name a screen slot left empty by a hole in the order sequence", () => {
    const config = clone(published);
    config.quadrantsMap["languages-and-frameworks"].order = 5;

    expect(validateConfig(config, hasTranslation)).toEqual(
      expect.arrayContaining([expect.stringContaining("screen slot 4")])
    );
  });

  it("should name the slugs that share a displayed position", () => {
    const config = clone(published);
    config.quadrantsMap["tools"].position =
      config.quadrantsMap["languages-and-frameworks"].position;

    const problems = validateConfig(config, hasTranslation);

    expect(
      problems.some(
        (problem) =>
          problem.includes("displayed position 1") &&
          problem.includes("tools") &&
          problem.includes("languages-and-frameworks")
      )
    ).toBe(true);
  });

  it.each([
    ["slash", "tools/x", "/"],
    ["space", "tools x", " "],
    ["accent", "maçã", "ç"],
  ])("should reject a slug with a %s", (_label, slug, character) => {
    const problems = validateConfig(withSingleSlug(slug), alwaysTranslated);

    expect(
      problems.some(
        (problem) =>
          problem.includes(`"${slug}"`) &&
          problem.includes(`"${character}"`)
      )
    ).toBe(true);
  });

  it("should reject fewer ringsAttributes entries than rings", () => {
    const config = clone(published);
    config.chartConfig.ringsAttributes =
      config.chartConfig.ringsAttributes.slice(0, -1);

    expect(validateConfig(config, hasTranslation)).toEqual(
      expect.arrayContaining([
        expect.stringContaining("one entry per ring"),
      ])
    );
  });

  it("should reject ring radii that are not strictly increasing", () => {
    const config = clone(published);
    config.chartConfig.ringsAttributes[1].radius =
      config.chartConfig.ringsAttributes[0].radius;

    expect(validateConfig(config, hasTranslation)).toEqual(
      expect.arrayContaining([
        expect.stringContaining("must strictly increase"),
      ])
    );
  });

  it("should name the slug and language of a missing translation", () => {
    const missingEsDescription: HasTranslation = (key, lng) =>
      lng === Language.es && key === "pageHelp.quadrants.tools.description"
        ? false
        : hasTranslation(key, lng);

    expect(validateConfig(published, missingEsDescription)).toEqual(
      expect.arrayContaining([
        'Quadrant "tools" is missing the translation "pageHelp.quadrants.tools.description" in language "es".',
      ])
    );
  });

  it("should list one problem per defect when several are present", () => {
    const config = clone(published);
    config.quadrantsMap["tools"].order =
      config.quadrantsMap["platforms-and-operations"].order;
    config.quadrantsMap["tools"].position =
      config.quadrantsMap["languages-and-frameworks"].position;
    config.chartConfig.ringsAttributes[1].radius =
      config.chartConfig.ringsAttributes[0].radius;

    const problems = validateConfig(config, hasTranslation);

    expect(problems.some((problem) => problem.includes("same screen slot"))).toBe(
      true
    );
    expect(
      problems.some((problem) => problem.includes("displayed position"))
    ).toBe(true);
    expect(
      problems.some((problem) => problem.includes("must strictly increase"))
    ).toBe(true);
    expect(problems.length).toBeGreaterThanOrEqual(3);
  });

  it.each([1, 3, 5, 6])(
    "should return no problem for a well-formed config with %i quadrants",
    (count) => {
      expect(validateConfig(buildConfig(count), alwaysTranslated)).toEqual([]);
    }
  );
});
