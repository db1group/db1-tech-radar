import i18n from "i18next";
import { Item } from "../model";

export function getItemBody(item: Item) {
  const body: any = {
    pt: item.bodyPt,
    en: item.bodyEn,
    es: item.bodyEs,
  };

  return body[i18n.language];
}
