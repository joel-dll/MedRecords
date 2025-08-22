"use client";

import "./src/i18n"; 
import { useEffect, useCallback } from "react";
import i18n from "./src/i18n";

function HtmlLangUpdater() {
  const applyHtmlAttrs = useCallback((lng) => {
    if (typeof document === "undefined") return; 
    const code = (lng || i18n.resolvedLanguage || "en").split("-")[0].toLowerCase();

    const html = document.documentElement;
    html.lang = code;

    
    html.dir = ["ar", "he", "fa", "ur"].includes(code) ? "rtl" : "ltr";

    
    html.setAttribute("data-lang", code);
  }, []);

  useEffect(() => {
    
    applyHtmlAttrs(i18n.language || i18n.resolvedLanguage);

    
    const onChange = (lng) => applyHtmlAttrs(lng);
    i18n.on("languageChanged", onChange);

    return () => {
      i18n.off("languageChanged", onChange);
    };
  }, [applyHtmlAttrs]);

  return null;
}

export default function I18nProvider({ children }) {
  return (
    <>
      <HtmlLangUpdater />
      {children}
    </>
  );
}
