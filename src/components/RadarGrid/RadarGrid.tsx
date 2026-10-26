import React from "react";
import { useTranslation } from "react-i18next";

import { ConfigData } from "../../config";
import { Item } from "../../model";
import RadarChart from "../Chart/RadarChart";
import { segmentCount } from "../Chart/geometry";
import QuadrantLabel from "./QuadrantLabel";
import "./radar-grid.scss";

const Legend: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="radar-legend">
      <div className="wrapper">
        <span className="icon icon--blip_new"></span>
        {t('legend.new')}
      </div>
      <div className="wrapper">
        <span className="icon icon--blip_changed"></span>
        {t('legend.recently')}
      </div>
      <div className="wrapper">
        <span className="icon icon--blip_default"></span>
        {t('legend.unchanged')}
      </div>
    </div>
  );
};

const RadarGrid: React.FC<{ items: Item[]; config: ConfigData }> = ({
  items,
  config,
}) => {
  const { t } = useTranslation();
  return (
    <div className="radar-grid" data-quadrants={segmentCount(config)}>
      <RadarChart items={items} config={config} />
      {Object.entries(config.quadrantsMap).map(([name, quadrant], index) => (
        <QuadrantLabel
          key={index}
          quadrantConfig={quadrant}
          quadrantName={name}
          quadrantLabel={t(`quadrants.${name}`)}
        />
      ))}
      <Legend />
    </div>
  );
};

export default RadarGrid;
