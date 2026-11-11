import React from "react";
import { useTranslation } from "react-i18next";

import { QuadrantConfig } from "../../model";
import { slotOf } from "../Chart/geometry";
import Link from "../Link/Link";

const QuadrantLabel: React.FC<{
  quadrantConfig: QuadrantConfig;
  quadrantName: string;
  quadrantLabel: string;
}> = ({ quadrantConfig, quadrantName, quadrantLabel }) => {
  const { t } = useTranslation();

  return (
    <div
      className={`quadrant-label quadrant-label--slot-${slotOf(
        quadrantConfig
      )}`}
    >
      <div className="split">
        <div className="split__left">
          <small>
            {t("quadrant")} {quadrantConfig.position}
          </small>
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
      <div className="description">
        {t(`pageHelp.quadrants.${quadrantName}.description`)}
      </div>
    </div>
  );
};

export default QuadrantLabel;
