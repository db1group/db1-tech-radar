import { MomentInput } from "moment";

import { ConfigData, radarName, radarNameShort } from "../../config";
import { formatRelease } from "../../date";
import { HomepageOption, Item, featuredOnly } from "../../model";
import Fadeable from "../Fadeable/Fadeable";
import HeroHeadline from "../HeroHeadline/HeroHeadline";
import QuadrantGrid from "../QuadrantGrid/QuadrantGrid";
import RadarGrid from "../RadarGrid/RadarGrid";
import SetTitle from "../SetTitle";
import { useTranslation } from "react-i18next";

type PageIndexProps = {
  leaving: boolean;
  onLeave: () => void;
  items: Item[];
  config: ConfigData;
  releases: MomentInput[];
};

export default function PageIndex({
  leaving,
  onLeave,
  items,
  config,
  releases,
}: PageIndexProps) {
  const { t } = useTranslation();
  const publishedLabel = t('pageIndex.publishedLabel');

  const newestRelease = releases.slice(-1)[0];
  const numberOfReleases = releases.length;
  const showChart =
    config.homepageContent === HomepageOption.chart ||
    config.homepageContent === HomepageOption.both;
  const showColumns =
    config.homepageContent === HomepageOption.columns ||
    config.homepageContent === HomepageOption.both;
  return (
    <Fadeable leaving={leaving} onLeave={onLeave}>
      <SetTitle title={radarNameShort} />
      <div className="headline-group">
        <HeroHeadline alt={`${t('versionLabel')} #${numberOfReleases}`}>
          {t('radarName')}
        </HeroHeadline>
      </div>
      {showChart && <RadarGrid items={featuredOnly(items)} config={config} />}
      {showColumns && (
        <QuadrantGrid items={featuredOnly(items)} config={config} />
      )}
      <div className="publish-date">
        {publishedLabel} {formatRelease(newestRelease, config.dateFormat)}
      </div>
    </Fadeable>
  );
}
