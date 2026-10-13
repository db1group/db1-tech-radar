import { ConfigData } from "../../config";
import { Point, QuadrantConfig } from "../../model";

export const DEG_TO_RAD = Math.PI / 180;

export const RING_PADDING = 15;

export const SECTOR_PADDING_ANGLE = 10;

export const POSITION_ATTEMPTS = 150;

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

export const radiusToPixels = (radius: number, config: ConfigData): number => {
  const { size, scale } = config.chartConfig;

  return (radius * size) / (scale[1] - scale[0]);
};

const distanceBetween = (from: Point, to: Point): number => {
  const dx = to.x - from.x,
    dy = to.y - from.y;

  return Math.sqrt(dx * dx + dy * dy);
};

export const blipPosition = (
  slot: number,
  numSegments: number,
  ringIndex: number,
  config: ConfigData,
  placed: Point[],
  rand: () => number = Math.random
): Point => {
  const { size, blipSize, ringsAttributes } = config.chartConfig;
  const centre = size / 2,
    minDistance = 1.5 * blipSize;

  const outerRadius =
    radiusToPixels(ringsAttributes[ringIndex].radius, config) - RING_PADDING;
  const innerRadius =
    (ringIndex === 0
      ? 0
      : radiusToPixels(ringsAttributes[ringIndex - 1].radius, config)) +
    RING_PADDING;

  const { startAngle, endAngle } = segmentAngles(slot, numSegments);
  const firstAngle = startAngle + SECTOR_PADDING_ANGLE,
    angleWidth = endAngle - SECTOR_PADDING_ANGLE - firstAngle;

  let candidate: Point = { x: centre, y: centre };

  for (let attempt = 0; attempt < POSITION_ATTEMPTS; attempt++) {
    const radius = innerRadius + Math.sqrt(rand()) * (outerRadius - innerRadius);
    const angle = firstAngle + rand() * angleWidth;

    const attemptPoint = polarToCartesian(centre, radius, angle);

    candidate = attemptPoint;

    const clearOfNeighbours = placed.every(
      (point) => distanceBetween(attemptPoint, point) >= minDistance
    );

    if (clearOfNeighbours) {
      return attemptPoint;
    }
  }

  console.warn(
    `Radar chart: no free spot found for a blip on slot ${slot}, ring ${ringIndex} after ${POSITION_ATTEMPTS} attempts; placing it overlapped.`
  );

  return candidate;
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
