import React from "react";

import { ConfigData } from "../../config";
import { Item, QuadrantConfig } from "../../model";
import RadarChart from "../Chart/RadarChart";
import Link from "../Link/Link";
import "./radar-grid.scss";
import { useTranslation } from "react-i18next";

const QuadrantLabel: React.FC<{
  quadrantConfig: QuadrantConfig;
  quadrantName: string;
  quadrantLabel: string;
}> = ({ quadrantConfig, quadrantName, quadrantLabel }) => {
  const stylesMap = [
    { top: 0, left: 0 },
    { top: 0, right: 0 },
    { bottom: 0, left: 0 },
    { bottom: 0, right: 0 },
  ];
  const { t } = useTranslation();
  const quadrants = t("pageHelp.quadrants", { returnObjects: true }) as QuadrantConfig[];
  return (
    <div
      className="quadrant-label"
      style={stylesMap[quadrantConfig.position - 1]}
    >
      <div className="split">
        <div className="split__left">
          <small>{t('quadrant')} {quadrantConfig.position}</small>
        </div>
        <div className="split__right">
          <Link className="icon-link" pageName={`${quadrantName}`}>
            <span className="icon icon--pie icon-link__icon" />
            {t("zoom-in")}
          </Link>
        </div>
      </div>
      <hr style={{ borderColor: quadrantConfig.colour }} />
      <h4 className="headline">{quadrantLabel}</h4>
      <div className="description">{t(`${quadrants[quadrantConfig.position - 1].description}`)}</div>
    </div>
  );
};

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
    <div className="radar-grid">
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
