import { ConfigData } from "../../config";
import { QuadrantConfig } from "../../model";

export const DEG_TO_RAD = Math.PI / 180;

export type SegmentAngles = {
  startAngle: number;
  endAngle: number;
  angleIncrement: number;
};

export const segmentCount = (config: ConfigData): number =>
  Object.keys(config.quadrantsMap).length;

export const slotOf = (quadrant: QuadrantConfig): number =>
  quadrant.order ?? quadrant.position;

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
