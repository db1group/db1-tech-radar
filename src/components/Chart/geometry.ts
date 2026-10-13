import { ConfigData } from "../../config";
import { Point, QuadrantConfig } from "../../model";

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

export type GlowShape =
  | { kind: "circle"; cx: number; cy: number; r: number }
  | { kind: "rect"; x: number; y: number; width: number; height: number }
  | { kind: "polygon"; points: Point[] };

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

export const polarToCartesian = (
  centre: number,
  radius: number,
  angleInDegrees: number
): Point => {
  const angleInRadians = (angleInDegrees - 90) * DEG_TO_RAD;

  return {
    x: centre + radius * Math.cos(angleInRadians),
    y: centre + radius * Math.sin(angleInRadians),
  };
};

export const glowShape = (
  slot: number,
  numSegments: number,
  size: number
): GlowShape => {
  const centre = size / 2;

  if (numSegments === 1) {
    return { kind: "circle", cx: centre, cy: centre, r: centre };
  }

  if (numSegments === 2) {
    return {
      kind: "rect",
      x: slot === 1 ? centre : 0,
      y: 0,
      width: centre,
      height: size,
    };
  }

  const { startAngle, endAngle } = segmentAngles(slot, numSegments);

  return {
    kind: "polygon",
    points: [
      { x: centre, y: centre },
      polarToCartesian(centre, size, startAngle),
      polarToCartesian(centre, size, endAngle),
    ],
  };
};
