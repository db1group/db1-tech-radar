import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Language, StorageKey } from "../model";
import LanguageDetector from "i18next-browser-languagedetector";

import enTranslations from './translations/en.json';
import ptTranslations from './translations/pt.json';
import esTranslations from './translations/es.json';

i18n.use(new LanguageDetector(null, { lookupLocalStorage: StorageKey.language })).use(initReactI18next).init({
  fallbackLng: Language.en,
  interpolation: {
    escapeValue: false,
  },
  resources: {
    en: enTranslations,
    pt: ptTranslations,
    es: esTranslations,
  },  
});

export default i18n;