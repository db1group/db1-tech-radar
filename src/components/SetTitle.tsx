import { useEffect } from "react";

import { useTranslation } from "react-i18next";

type SetTitleProps = {
  title: string;
};

export default function SetTitle({ title }: SetTitleProps) {
  const { t } = useTranslation();
  useEffect(() => {
    document.title = `${title} | ${t("radarName")}`;
  }, [title, t]);

  return null;
}
