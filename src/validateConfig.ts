import { segmentCount, slotOf } from "./components/Chart/geometry";
import { ConfigData } from "./config";
import { Language, QuadrantConfig } from "./model";

export type HasTranslation = (key: string, lng: Language) => boolean;

const MAX_QUADRANTS = 6;

const invalidSlugCharacter = (slug: string): string | undefined =>
  Array.from(slug).find(
    (character) => /[/\s]/.test(character) || character.charCodeAt(0) > 127
  );

const quadrantCountProblems = (config: ConfigData): string[] => {
  const count = segmentCount(config);

  if (count >= 1 && count <= MAX_QUADRANTS) {
    return [];
  }

  return [
    `quadrantsMap declares ${count} quadrants; configure 1 to ${MAX_QUADRANTS} quadrants in config.json. The six-quadrant ceiling comes from the label-block places table in src/components/RadarGrid/radar-grid.scss.`,
  ];
};

const slugSetProblems = (config: ConfigData): string[] => {
  const problems: string[] = [];
  const nameSlugs = Object.keys(config.quadrants);
  const attributeSlugs = Object.keys(config.quadrantsMap);

  nameSlugs
    .filter((slug) => !attributeSlugs.includes(slug))
    .forEach((slug) =>
      problems.push(
        `Quadrant slug "${slug}" is declared in quadrants but missing from quadrantsMap.`
      )
    );

  attributeSlugs
    .filter((slug) => !nameSlugs.includes(slug))
    .forEach((slug) =>
      problems.push(
        `Quadrant slug "${slug}" is declared in quadrantsMap but missing from quadrants.`
      )
    );

  return problems;
};

const slotProblems = (config: ConfigData): string[] => {
  const problems: string[] = [];
  const entries = Object.entries(config.quadrantsMap);
  const total = entries.length;

  const slugsBySlot = new Map<number, string[]>();
  entries.forEach(([slug, quadrant]) => {
    const slot = slotOf(quadrant as QuadrantConfig);
    slugsBySlot.set(slot, [...(slugsBySlot.get(slot) ?? []), slug]);
  });

  slugsBySlot.forEach((slugs, slot) => {
    if (slugs.length > 1) {
      problems.push(
        `Quadrants ${slugs
          .map((slug) => `"${slug}"`)
          .join(" and ")} resolve to the same screen slot ${slot} (order).`
      );
    }
  });

  for (let slot = 1; slot <= total; slot++) {
    if (!slugsBySlot.has(slot)) {
      problems.push(
        `No quadrant fills screen slot ${slot} in the contiguous 1..${total} sequence of order values.`
      );
    }
  }

  return problems;
};

const positionProblems = (config: ConfigData): string[] => {
  const problems: string[] = [];
  const slugsByPosition = new Map<number, string[]>();

  Object.entries(config.quadrantsMap).forEach(([slug, quadrant]) => {
    const { position } = quadrant as QuadrantConfig;
    slugsByPosition.set(position, [
      ...(slugsByPosition.get(position) ?? []),
      slug,
    ]);
  });

  slugsByPosition.forEach((slugs, position) => {
    if (slugs.length > 1) {
      problems.push(
        `Quadrants ${slugs
          .map((slug) => `"${slug}"`)
          .join(" and ")} share the displayed position ${position}.`
      );
    }
  });

  return problems;
};

const slugCharacterProblems = (config: ConfigData): string[] => {
  const slugs = Array.from(
    new Set([
      ...Object.keys(config.quadrants),
      ...Object.keys(config.quadrantsMap),
    ])
  );

  return slugs
    .map((slug) => ({ slug, character: invalidSlugCharacter(slug) }))
    .filter(({ character }) => character !== undefined)
    .map(
      ({ slug, character }) =>
        `Quadrant slug "${slug}" has the invalid URL character "${character}"; a slug must have no slash, space, or accent.`
    );
};

const ringGeometryProblems = (config: ConfigData): string[] => {
  const problems: string[] = [];
  const { rings } = config;
  const { ringsAttributes } = config.chartConfig;

  if (ringsAttributes.length !== rings.length) {
    problems.push(
      `chartConfig.ringsAttributes has ${ringsAttributes.length} entries for ${rings.length} rings; there must be one entry per ring.`
    );
  }

  for (let index = 1; index < ringsAttributes.length; index++) {
    const previous = ringsAttributes[index - 1].radius;
    const current = ringsAttributes[index].radius;

    if (current <= previous) {
      problems.push(
        `chartConfig.ringsAttributes radius must strictly increase; entry ${index} radius ${current} is not greater than entry ${
          index - 1
        } radius ${previous}.`
      );
    }
  }

  return problems;
};

const translationProblems = (
  config: ConfigData,
  hasTranslation: HasTranslation
): string[] => {
  const problems: string[] = [];
  const languages = [Language.pt, Language.en, Language.es];

  Object.keys(config.quadrants).forEach((slug) => {
    const keys = [
      `quadrants.${slug}`,
      `pageHelp.quadrants.${slug}.name`,
      `pageHelp.quadrants.${slug}.description`,
    ];

    languages.forEach((language) => {
      keys
        .filter((key) => !hasTranslation(key, language))
        .forEach((key) =>
          problems.push(
            `Quadrant "${slug}" is missing the translation "${key}" in language "${language}".`
          )
        );
    });
  });

  return problems;
};

export const validateConfig = (
  config: ConfigData,
  hasTranslation: HasTranslation
): string[] => [
  ...quadrantCountProblems(config),
  ...slugSetProblems(config),
  ...slotProblems(config),
  ...positionProblems(config),
  ...slugCharacterProblems(config),
  ...ringGeometryProblems(config),
  ...translationProblems(config, hasTranslation),
];
