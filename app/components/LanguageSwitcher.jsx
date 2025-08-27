'use client';

import { FaGlobe } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const LANGS = ['en', 'pt']; // adjust if you support more

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const lang = i18n.language || 'en';

  const change = (lng) => {
    // normalize like 'pt-PT' -> 'pt'
    const base = String(lng).split('-')[0];
    i18n.changeLanguage(base);
    // keep <html lang="…"> in sync (good a11y)
    if (typeof document !== 'undefined') {
      document.documentElement.lang = base;
    }
  };

  return (
    <div className="lang-switcher" role="group" aria-label="Language switcher">
      <FaGlobe className="lang-icon" aria-hidden="true" />
      {LANGS.map((lng, i) => {
        const isActive = String(lang).startsWith(lng);
        return (
          <span key={lng} className="lang-item-wrapper">
            <button
              type="button"
              className={`lang-item ${isActive ? 'active' : ''}`}
              aria-pressed={isActive}
              onClick={() => change(lng)}
            >
              {lng.toUpperCase()}
            </button>
            {i < LANGS.length - 1 && (
              <span className="lang-sep" aria-hidden="true">|</span>
            )}
          </span>
        );
      })}
    </div>
  );
}
