"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";


import en from "./locales/en/en.json";
import pt from "./locales/pt/pt.json";

const resources = {
  en: { translation: en },
  pt: { translation: pt }
};

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: "en",
      supportedLngs: ["en", "pt"],

      
      defaultNS: "translation",

      
      partialBundledLanguages: true,

      detection: {
        order: ["localStorage", "cookie", "navigator", "htmlTag"],
        caches: ["localStorage", "cookie"]
      },

      interpolation: { escapeValue: false },

      
      returnNull: false,
      returnEmptyString: false,
      keySeparator: ".", 
      nsSeparator: ":"   
    });
}

export default i18n;
