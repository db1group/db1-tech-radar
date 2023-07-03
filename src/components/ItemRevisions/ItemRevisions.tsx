import { Revision } from "../../model";
import HeadlineGroup from "../HeadlineGroup/HeadlineGroup";
import ItemRevision from "../ItemRevision/ItemRevision";
import "./item-revisions.scss";
import { useTranslation } from "react-i18next";

export default function ItemRevisions({
  revisions,
  dateFormat,
}: {
  revisions: Revision[];
  dateFormat?: string;
}) {
  const { t } = useTranslation();
  return (
    <div className="item-revisions">
      <HeadlineGroup secondary>
        <h4 className="headline headline--dark">
          {t('revisionsText')}
        </h4>
      </HeadlineGroup>

      {revisions.map((revision) => (
        <ItemRevision
          key={revision.release}
          revision={revision}
          dateFormat={dateFormat}
        />
      ))}
    </div>
  );
}
