import { ConfigData } from "../../config";
import { Group } from "../../model";
import Badge from "../Badge/Badge";
import Flag from "../Flag/Flag";
import ItemList from "../ItemList/ItemList";
import Link from "../Link/Link";
import "./quadrant-section.scss";
import { useTranslation } from "react-i18next";

const renderList = (
  t: Function,
  ringName: string,
  quadrantName: string,
  groups: Group,
  big: boolean
) => {
  const itemsInRing = groups[quadrantName][ringName] || [];

  if (big) {
    return (
      <ItemList items={itemsInRing} noLeadingBorder>
        <Badge type={ringName} big={big}>
          {t(`rings.${ringName}`)}
        </Badge>
      </ItemList>
    );
  }

  return (
    <div className="ring-list">
      <div className="ring-list__header">
        <Badge type={ringName}>{t(`rings.${ringName}`)}</Badge>
      </div>
      {itemsInRing.map((item) => (
        <span key={item.name} className="ring-list__item">
          <Link className="link" pageName={`${item.quadrant}/${item.name}`}>
            {item.title}
            <Flag item={item} short />
          </Link>
        </span>
      ))}
    </div>
  );
};

const renderRing = (
  t: Function,
  ringName: string,
  quadrantName: string,
  groups: Group,
  renderIfEmpty: boolean,
  big: boolean
) => {
  if (
    !renderIfEmpty &&
    (!groups[quadrantName] ||
      !groups[quadrantName][ringName] ||
      groups[quadrantName][ringName].length === 0)
  ) {
    return null;
  }
  return (
    <div key={ringName} className="quadrant-section__ring">
      {renderList(t, ringName, quadrantName, groups, big)}
    </div>
  );
};

export default function QuadrantSection({
  quadrantName,
  groups,
  config,
  big = false,
}: {
  quadrantName: string;
  groups: Group;
  config: ConfigData;
  big?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="quadrant-section">
      <div className="quadrant-section__header">
        <div className="split">
          <div className="split__left">
            <h4 className="headline">{t(`quadrants.${quadrantName}`)}</h4>
          </div>
          {!big && (
            <div className="split__right">
              <Link className="icon-link" pageName={`${quadrantName}`}>
                <span className="icon icon--pie icon-link__icon" />
                {t("zoom-in")}
              </Link>
            </div>
          )}
        </div>
      </div>
      <div className="quadrant-section__rings">
        {config.rings.map((ringName: string) =>
          renderRing(t, ringName, quadrantName, groups, config.showEmptyRings, big)
        )}
      </div>
    </div>
  );
}
