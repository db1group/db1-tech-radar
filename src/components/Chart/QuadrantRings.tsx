import * as d3 from "d3";
import React from "react";

import { ConfigData } from "../../config";
import { QuadrantConfig } from "../../model";
import {
  GlowShape,
  glowShape,
  segmentCount,
  segmentRadians,
  slotOf,
} from "./geometry";

function glowElement(shape: GlowShape, colour: string) {
  switch (shape.kind) {
    case "circle":
      return (
        <circle
          cx={shape.cx}
          cy={shape.cy}
          r={shape.r}
          fill={colour}
          mask="url(#glow-mask)"
        />
      );
    case "rect":
      return (
        <rect
          x={shape.x}
          y={shape.y}
          width={shape.width}
          height={shape.height}
          fill={colour}
          mask="url(#glow-mask)"
        />
      );
    case "polygon":
      return (
        <polygon
          points={shape.points.map(({ x, y }) => `${x},${y}`).join(" ")}
          fill={colour}
          mask="url(#glow-mask)"
        />
      );
  }
}

function arcPath(
  slot: number,
  numSegments: number,
  ringPosition: number,
  xScale: d3.ScaleLinear<number, number>,
  config: ConfigData
) {
  const { startAngle, endAngle } = segmentRadians(slot, numSegments);
  const arcAttrs = config.chartConfig.ringsAttributes[ringPosition],
    ringRadiusPx = xScale(arcAttrs.radius) - xScale(0),
    arc = d3.arc();

  return (
    arc({
      innerRadius: ringRadiusPx - arcAttrs.arcWidth,
      outerRadius: ringRadiusPx,
      startAngle,
      endAngle,
    }) || undefined
  );
}

const QuadrantRings: React.FC<{
  quadrant: QuadrantConfig;
  xScale: d3.ScaleLinear<number, number>;
  config: ConfigData;
}> = ({ quadrant, xScale, config }) => {
  const quadrantSize = config.chartConfig.size / 2,
    slot = slotOf(quadrant),
    numSegments = segmentCount(config);

  return (
    <g className="quadrant-ring">
      {/* Background glow */}
      <g mask="url(#radar-mask)">
        {glowElement(
          glowShape(slot, numSegments, config.chartConfig.size),
          quadrant.colour
        )}
      </g>

      {/* Rings' arcs */}
      {Array.from(config.rings).map((ringPosition, index) => (
        <path
          key={index}
          fill={quadrant.colour}
          d={arcPath(slot, numSegments, index, xScale, config)}
          style={{
            transform: `translate(${quadrantSize}px, ${quadrantSize}px)`,
          }}
        />
      ))}
    </g>
  );
};

export default QuadrantRings;
