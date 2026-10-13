import { ConfigData } from "../../config";
import { Blip, Item, Point } from "../../model";
import { blipPosition, segmentCount, slotOf } from "./geometry";

export const buildBlips = (
  items: Item[],
  config: ConfigData,
  rand: () => number = Math.random
): Blip[] => {
  const numSegments = segmentCount(config);
  const placedBySlot: { [slot: number]: Point[] } = {};

  return items.reduce((blips: Blip[], item: Item) => {
    if (!item.ring || !item.quadrant) {
      return blips;
    }

    const quadrantConfig = config.quadrantsMap[item.quadrant];

    if (!quadrantConfig) {
      return blips;
    }

    const slot = slotOf(quadrantConfig),
      ringPosition = config.rings.findIndex((ring) => ring === item.ring),
      placed = placedBySlot[slot] || [];

    const coordinates = blipPosition(
      slot,
      numSegments,
      ringPosition,
      config,
      placed,
      rand
    );

    placedBySlot[slot] = placed.concat(coordinates);

    blips.push({
      ...item,
      ringPosition,
      colour: quadrantConfig.colour,
      txtColour: quadrantConfig.txtColour,
      coordinates,
    });

    return blips;
  }, []);
};
