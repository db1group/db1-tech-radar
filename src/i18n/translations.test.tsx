import realConfig from "../../public/config.json";
import { ConfigData } from "../config";
import { Language } from "../model";
import i18n from "./index";
import enTranslations from "./translations/en.json";
import esTranslations from "./translations/es.json";
import ptTranslations from "./translations/pt.json";

interface QuadrantHelpMap {
  [slug: string]: { name: string; description: string };
}

interface Dictionary {
  translation: {
    quadrants: { [slug: string]: string };
    pageHelp: {
      quadrants: QuadrantHelpMap;
      [key: string]: unknown;
    };
  };
}

const publishedConfig = realConfig as unknown as ConfigData;

const taxonomySlugs = Object.keys(publishedConfig.quadrants);

const dictionaries = [
  { language: Language.pt, dictionary: ptTranslations as unknown as Dictionary },
  { language: Language.en, dictionary: enTranslations as unknown as Dictionary },
  { language: Language.es, dictionary: esTranslations as unknown as Dictionary },
];

const isFilled = (value: unknown) =>
  typeof value === "string" && value.trim().length > 0;

const quantityOfQuadrants = /\d+\s+(quadrantes|quadrants|cuadrantes)/i;

describe("translation dictionaries", () => {
  const initialLanguage = i18n.language;

  afterAll(async () => {
    await i18n.changeLanguage(initialLanguage);
  });

  it("should declare the same quadrant slugs in both taxonomy maps", () => {
    expect(Object.keys(publishedConfig.quadrantsMap).sort()).toEqual(
      taxonomySlugs.slice().sort()
    );
  });

  it("should declare the quadrant help entries as a map in every language", () => {
    const declaredAsList = dictionaries
      .filter(({ dictionary }) =>
        Array.isArray(dictionary.translation.pageHelp.quadrants)
      )
      .map(({ language }) => language);

    expect(declaredAsList).toEqual([]);
  });

  it("should translate every quadrant declared in the taxonomy", () => {
    const missing: string[] = [];

    dictionaries.forEach(({ language, dictionary }) => {
      taxonomySlugs.forEach((slug) => {
        const help = dictionary.translation.pageHelp.quadrants[slug];

        if (!isFilled(dictionary.translation.quadrants[slug])) {
          missing.push(`${language}: quadrants.${slug}`);
        }
        if (!isFilled(help && help.name)) {
          missing.push(`${language}: pageHelp.quadrants.${slug}.name`);
        }
        if (!isFilled(help && help.description)) {
          missing.push(`${language}: pageHelp.quadrants.${slug}.description`);
        }
      });
    });

    expect(missing).toEqual([]);
  });

  it("should not describe a quadrant the taxonomy does not declare", () => {
    const orphans: string[] = [];

    dictionaries.forEach(({ language, dictionary }) => {
      Object.keys(dictionary.translation.quadrants)
        .filter((slug) => !taxonomySlugs.includes(slug))
        .forEach((slug) => orphans.push(`${language}: quadrants.${slug}`));

      Object.keys(dictionary.translation.pageHelp.quadrants)
        .filter((slug) => !taxonomySlugs.includes(slug))
        .forEach((slug) =>
          orphans.push(`${language}: pageHelp.quadrants.${slug}`)
        );
    });

    expect(orphans).toEqual([]);
  });

  it("should declare the quadrant help entries in the taxonomy order", () => {
    dictionaries.forEach(({ language, dictionary }) => {
      expect([
        language,
        Object.keys(dictionary.translation.pageHelp.quadrants),
      ]).toEqual([language, taxonomySlugs]);
    });
  });

  it("should resolve the quadrant description by slug in every language", async () => {
    for (const { language, dictionary } of dictionaries) {
      await i18n.changeLanguage(language);

      taxonomySlugs.forEach((slug) => {
        const key = `pageHelp.quadrants.${slug}.description`;

        expect([language, i18n.t(key)]).toEqual([
          language,
          dictionary.translation.pageHelp.quadrants[slug].description,
        ]);
        expect(i18n.t(key)).not.toBe(key);
      });
    }
  });

  it("should explain the grouping without stating a number of quadrants", () => {
    const withQuantity = dictionaries
      .filter(({ dictionary }) =>
        quantityOfQuadrants.test(JSON.stringify(dictionary.translation.pageHelp))
      )
      .map(({ language }) => language);

    expect(withQuantity).toEqual([]);
  });
});
