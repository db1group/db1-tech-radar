import { ConfigData, translate } from "../../config";
import { Item, featuredOnly, groupByQuadrants } from "../../model";
import Fadeable from "../Fadeable/Fadeable";
import HeadlineGroup from "../HeadlineGroup/HeadlineGroup";
import HeroHeadline from "../HeroHeadline/HeroHeadline";
import QuadrantSection from "../QuadrantSection/QuadrantSection";
import SetTitle from "../SetTitle";
import { useTranslation } from "react-i18next";

type PageQuadrantProps = {
  leaving: boolean;
  onLeave: () => void;
  pageName: string;
  items: Item[];
  config: ConfigData;
};

export default function PageQuadrant({
  leaving,
  onLeave,
  pageName,
  items,
  config,
}: PageQuadrantProps) {
  const groups = groupByQuadrants(featuredOnly(items));
  const { t } = useTranslation();
  return (
    <Fadeable leaving={leaving} onLeave={onLeave}>
      <SetTitle title={t(`quadrants.${pageName}`)} />
      <HeadlineGroup>
        <HeroHeadline>{t(`quadrants.${pageName}`)}</HeroHeadline>
      </HeadlineGroup>
      <QuadrantSection
        groups={groups}
        quadrantName={pageName}
        config={config}
        big
      />
    </Fadeable>
  );
}
