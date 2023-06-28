import React from "react";

import { radarName } from "../../config";
import { sanitize } from "../../sanitize";
import Fadeable from "../Fadeable/Fadeable";
import HeroHeadline from "../HeroHeadline/HeroHeadline";
import SetTitle from "../SetTitle";
import { useTranslation } from "react-i18next";

interface Props {
  leaving: boolean;
  onLeave: () => void;
}

interface Quadrant {
  name: string;
  description: string;
}

interface Paragraph {
  headline: string;
  values: string[];
}

interface Ring {
  name: string;
  description: string;
}

const PageHelp: React.FC<Props> = ({ leaving, onLeave }) => {
  const { t } = useTranslation();

  const quadrants = t("pageHelp.quadrants", { returnObjects: true }) as Quadrant[];
  const paragraphs = t("pageHelp.paragraphs", { returnObjects: true }) as Paragraph[];
  const rings = t("pageHelp.rings", { returnObjects: true }) as Ring[];

  const title = `${t("pageHelp.headlinePrefix")} ${t('radarName')}`;
  return (
    <Fadeable leaving={leaving} onLeave={onLeave}>
      <SetTitle title={title} />
      <HeroHeadline>{title}</HeroHeadline>
      <div className="fullpage-content">
        {paragraphs.map(({ headline, values }) => (
          <React.Fragment key={headline}>
            <h3>{headline}</h3>
            {values.map((element, index) => {
              return (
                <p
                  key={index}
                  dangerouslySetInnerHTML={sanitize(element)}
                ></p>
              );
            })}
          </React.Fragment>
        ))}

        <p>{t("pageHelp.quadrantsPreDescription")}</p>
        <ul>
          {quadrants.map(({ name, description }) => (
            <li key={name}>
              <strong>{name}:</strong>{" "}
              <span
                dangerouslySetInnerHTML={sanitize(description, {})}
              ></span>
            </li>
          ))}
        </ul>

        <p>{t("pageHelp.ringsPreDescription")}</p>
        <ul>
          {rings.map(({name, description}) => (
            <li key={name}>
              <strong>{name}:</strong>{" "}
              <span
                dangerouslySetInnerHTML={sanitize(description, {})}
              ></span>
            </li>
          ))}
        </ul>

        {t("pageHelp.sourcecodeLink") && (
          <p>
            {`${t("pageHelp.sourcecodeLink.description")} `}
            <a
              href={t<string>("pageHelp.sourcecodeLink.href")}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("pageHelp.sourcecodeLink.name")}
            </a>
          </p>
        )}
      </div>
    </Fadeable>
  );
};

export default PageHelp;
