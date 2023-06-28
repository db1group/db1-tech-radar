import classNames from "classnames";
import { assetUrl, radarNameShort } from "../../config";
import Link from "../Link/Link";
import "./logo-link.scss";
import { useTranslation } from "react-i18next";

export default function LogoLink({ small = false }: { small?: boolean }) {
  const { t } = useTranslation();
  return (
    <Link
      pageName="index"
      className={classNames("logo-link", { "logo-link--small": small })}
    >
      <span className="logo-link__icon icon icon--back" />
      <span className="logo-link__slide">
        <img
          className="logo-link__img"
          src={assetUrl("logo/db1-logo.png")}
          height="60px"
          
          alt={`${t('radarName')}`}
        />
        <span className="logo-link__text">{t('radarName')}</span>
      </span>
    </Link>
  );
}
