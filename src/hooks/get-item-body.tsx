import i18n from "i18next";
import { Item } from "../model";

export function getItemBody(item: Item) {
  let language;
  const body: any = {
    pt: item.bodyPt,
    en: item.bodyEn,
    es: item.bodyEs,
  };

  
  i18n.language.includes('-')
    ? language = i18n.language.split('-')[0]
    : language = i18n.language;

  return body[language];
}
