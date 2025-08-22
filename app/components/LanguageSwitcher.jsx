"use client";

import { useEffect, useState } from "react";
import { FaGlobe } from "react-icons/fa";
import i18n from "../src/i18n"; 

const LANGS = ["en", "pt"];

export default function LanguageSwitcher() {
  const [lang, setLang] = useState(i18n.resolvedLanguage || "en");

  useEffect(() => {
    const onChanged = () => setLang(i18n.resolvedLanguage || "en");
    i18n.on("languageChanged", onChanged);
    return () => i18n.off("languageChanged", onChanged);
  }, []);

  const change = (lng) => i18n.changeLanguage(lng);

  return (
    <div className="lang-switcher">
      <FaGlobe className="lang-icon" aria-label="Change language" />
      {LANGS.map((lng, i) => (
        <span key={lng} className="lang-item-wrapper">
          <span
            role="button"
            tabIndex={0}
            onClick={() => change(lng)}
            onKeyDown={(e) =>
              (e.key === "Enter" || e.key === " ") && change(lng)
            }
            className={`lang-item ${
              String(lang).startsWith(lng) ? "active" : ""
            }`}
          >
            {lng.toUpperCase()}
          </span>
          {i < LANGS.length - 1 && <span className="lang-sep">|</span>}
        </span>
      ))}
    </div>
  );
}
