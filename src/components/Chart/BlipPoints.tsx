import React from "react";

import { ConfigData } from "../../config";
import { Blip, FlagType, Item } from "../../model";
import Link from "../Link/Link";
import { ChangedBlip, DefaultBlip, NewBlip } from "./BlipShapes";
import { buildBlips } from "./blips";

function renderBlip(
  blip: Blip,
  index: number,
  config: ConfigData
): JSX.Element {
  const props = {
    blip,
    className: "blip",
    fill: blip.colour,
    "data-background-color": blip.colour,
    "data-text-color": blip.txtColour,
    "data-tip": blip.title,
    key: index,
  };
  switch (blip.flag) {
    case FlagType.new:
      return <NewBlip {...props} config={config} />;
    case FlagType.changed:
      return <ChangedBlip {...props} config={config} />;
    default:
      return <DefaultBlip {...props} config={config} />;
  }
}

const BlipPoints: React.FC<{
  items: Item[];
  config: ConfigData;
}> = ({ items, config }) => {
  const blips = buildBlips(items, config);

  return (
    <g className="blips">
      {blips.map((blip, index) => (
        <Link pageName={`${blip.quadrant}/${blip.name}`} key={index}>
          {renderBlip(blip, index, config)}
        </Link>
      ))}
    </g>
  );
};

export default BlipPoints;
