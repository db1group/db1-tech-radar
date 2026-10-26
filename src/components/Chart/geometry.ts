import { ConfigData } from "../../config";
import { QuadrantConfig } from "../../model";

export const DEG_TO_RAD = Math.PI / 180;

export type SegmentAngles = {
  startAngle: number;
  endAngle: number;
  angleIncrement: number;
};

export type SegmentRadians = {
  startAngle: number;
  endAngle: number;
};

export const segmentCount = (config: ConfigData): number =>
  Object.keys(config.quadrantsMap).length;

const legacySlotByPosition = [4, 1, 3, 2];

export const slotOf = (quadrant: QuadrantConfig): number =>
  quadrant.order ??
  legacySlotByPosition[quadrant.position - 1] ??
  quadrant.position;

export const segmentAngles = (
  slot: number,
  numSegments: number
): SegmentAngles => {
  const angleIncrement = 360 / numSegments;
  const startAngle = (slot - 1) * angleIncrement;

  return {
    startAngle,
    endAngle: startAngle + angleIncrement,
    angleIncrement,
  };
};

export const segmentRadians = (
  slot: number,
  numSegments: number
): SegmentRadians => {
  const { startAngle, endAngle } = segmentAngles(slot, numSegments);

  return {
    startAngle: startAngle * DEG_TO_RAD,
    endAngle: endAngle * DEG_TO_RAD,
  };
};
