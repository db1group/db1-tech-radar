import { ConfigData } from "../../config";
import { FlagType, HomepageOption, Item } from "../../model";

const chartConfig = {
  size: 800,
  scale: [-16, 16],
  blipSize: 12,
  ringsAttributes: [
    { radius: 8, arcWidth: 6 },
    { radius: 11, arcWidth: 4 },
    { radius: 14, arcWidth: 2 },
    { radius: 16, arcWidth: 2 },
  ],
};

const quadrantAttributes = (position: number, colour: string) => ({
  colour,
  txtColour: "white",
  position,
  order: position,
  description: "",
});

export const configWithFourQuadrants: ConfigData = {
  quadrants: {
    "languages-and-frameworks": "Languages & Frameworks",
    "methods-and-patterns": "Methods & Patterns",
    "platforms-and-operations": "Platforms & Operations",
    tools: "Tools",
  },
  rings: ["adopt", "trial", "assess", "hold"],
  showEmptyRings: false,
  quadrantsMap: {
    "languages-and-frameworks": quadrantAttributes(1, "#cdcaeb"),
    "methods-and-patterns": quadrantAttributes(2, "#4867ff"),
    "platforms-and-operations": quadrantAttributes(3, "#ff2d5e"),
    tools: quadrantAttributes(4, "#ffc000"),
  },
  chartConfig,
  homepageContent: HomepageOption.both,
};

export const configWithFiveQuadrants: ConfigData = {
  ...configWithFourQuadrants,
  quadrants: {
    ...configWithFourQuadrants.quadrants,
    "data-and-intelligence": "Data & Intelligence",
  },
  quadrantsMap: {
    ...configWithFourQuadrants.quadrantsMap,
    "data-and-intelligence": quadrantAttributes(5, "#5cb449"),
  },
};

const featuredItem = (name: string, title: string, quadrant: string): Item => ({
  name,
  title,
  ring: "adopt",
  quadrant,
  featured: true,
  flag: FlagType.default,
  bodyPt: "",
  bodyEn: "",
  bodyEs: "",
  info: "",
  revisions: [],
});

export const items: Item[] = [
  featuredItem("typescript", "TypeScript", "languages-and-frameworks"),
  featuredItem("trunk-based-development", "Trunk Based Development", "methods-and-patterns"),
  featuredItem("aws", "AWS", "platforms-and-operations"),
  featuredItem("yarn", "Yarn", "tools"),
  featuredItem("metabase", "Metabase", "data-and-intelligence"),
];
