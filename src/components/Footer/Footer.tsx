import classNames from "classnames";
import React from "react";

import { assetUrl, getItemPageNames, isMobileViewport } from "../../config";
import { Item } from "../../model";
import { sanitize } from "../../sanitize";
import Branding from "../Branding/Branding";
import FooterEnd from "../FooterEnd/FooterEnd";
import "./footer.scss";
import { useTranslation } from "react-i18next";

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
              src={assetUrl("logo/db1-logo.png")}
              width="180px"
              height="60px"
              alt=""
            />
          }
        >
          <div
            className="footnote"
            dangerouslySetInnerHTML={sanitize(t('footerFootnote'))}
          ></div>
        </Branding>
      )}

      <FooterEnd  />
    </div>
  );
};

export default Footer;
