import classNames from "classnames";
import React from "react";

import { assetUrl, getItemPageNames, isMobileViewport } from "../../config";
import { Item } from "../../model";
import { sanitize } from "../../sanitize";
import Branding from "../Branding/Branding";
import FooterEnd from "../FooterEnd/FooterEnd";
import "./footer.scss";
import { useTranslation } from "react-i18next";

// Anos de empresa contados a partir de 2000 (2026 = 26 anos)
const companyYears = () => new Date().getFullYear() - 2000;

interface Props {
  items: Item[];
  pageName: string;
}

const Footer: React.FC<Props> = ({ items, pageName }) => {
  const { t } = useTranslation();

  return (
    <div
      className={classNames("footer", {
        "is-hidden":
          !isMobileViewport() && getItemPageNames(items).includes(pageName),
      })}
    >
      {t('footerFootnote') && (
        <Branding
          modifier="footer"
          logoContent={
            <img
              src={assetUrl("logo/db1-itenex-negativo.svg")}
              width="170px"
              height="23px"
              alt=""
            />
          }
        >
          <div
            className="footnote"
            dangerouslySetInnerHTML={sanitize(
              t("footerFootnote", { years: companyYears() })
            )}
          ></div>
        </Branding>
      )}

      <FooterEnd  />
    </div>
  );
};

export default Footer;
