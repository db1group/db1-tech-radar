import classNames from "classnames";
import React from "react";

import { useMessages } from "../../context/MessagesContext";
import "./footerend.scss";
import { useTranslation } from "react-i18next";
import ItemLink from "../SocialLink/SocialLink";

interface Props {
  modifier?: "in-sidebar";
}

const FooterEnd: React.FC<Props> = ({ modifier}) => {
  const {
    socialLinks,
    legalInformationLink,
  } = useMessages();
  const { t } = useTranslation();

  return (
    <div
      className={classNames("footer-end", {
        [`footer-end__${modifier}`]: modifier,
      })}
    >
      <div className="footer-social">
        {socialLinks && (
          <>
            <div className="footer-social__label">
              <p>{t('socialLinksLabel')}</p>
            </div>
            <div className="footer-social__links">
              {socialLinks.map(({ href, iconName }) => (
                <ItemLink href={href} iconName={iconName} key={iconName} />
              ))}
            </div>
          </>
        )}
      </div>

      {legalInformationLink && (
        <div className="footer-copyright">
          <p>
            <a
              href={legalInformationLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('legalInformationLabel')}
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default FooterEnd;
