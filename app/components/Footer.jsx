'use client';

import React, { useState } from 'react';
import PopUpFooter from './Pop-UpFooter';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

export default function Footer() {
  const [popUpType, setPopUpType] = useState(null);
  const { t } = useTranslation();

  const footerItems = [
    { label: t('marketing.about'), type: 'about' },
    { label: t('marketing.newsletter'), type: 'newsletter' },
    { label: t('marketing.contact'), type: 'contact' },
    { label: t('marketing.services'), type: 'services' }
  ];

  const openPopUp = (type) => setPopUpType(type);
  const closePopUp = () => setPopUpType(null);

  const renderPopUpContent = () => {
    switch (popUpType) {
      case 'about':
        return (
          <>
            <h2>{t('marketing.about_title')}</h2>
            <p><br />{t('marketing.about_text')}</p>
          </>
        );

      case 'newsletter':
        return (
          <>
            <h2>{t('marketing.newsletter_title')}</h2>
            <form
              className="newsletter-form"
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;                    
                const email = form.email.value.trim();
                if (!email) return;
                try {
                  await addDoc(collection(db, 'newsletterEmails'), {
                    email,
                    subscribedAt: serverTimestamp(),
                  });
                  form.reset();                                   
                  setPopUpType('successMessageNewsletter');
                } catch (error) {
                  console.error('Error subscribing:', error);
                  setPopUpType('errorMessageNewsletter');
                }
              }}
            >
              <input
                type="email"
                name="email"
                placeholder={t('marketing.newsletter_placeholder')}
                required
              />
              <button type="submit">{t('marketing.newsletter_cta')}</button>
            </form>
          </>
        );

      case 'contact':
        return (
          <>
            <h2>{t('marketing.contact_title')}</h2>
            <form
              className="contact-form"
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;                    
                const name = form.name.value.trim();
                const email = form.email.value.trim();
                const message = form.message.value.trim();
                if (!name || !email || !message) return;

                try {
                  await addDoc(collection(db, 'contactMessages'), {
                    name,
                    email,
                    message,
                    sentAt: serverTimestamp(),
                  });
                  form.reset();                                   
                  setPopUpType('successMessage');
                } catch (error) {
                  console.error('Error sending message:', error);
                  setPopUpType('errorMessage');
                }
              }}
            >
              <input
                type="text"
                name="name"
                placeholder={t('marketing.contact_name')}
                required
              />
              <input
                type="email"
                name="email"
                placeholder={t('marketing.contact_email')}
                required
              />
              <textarea
                name="message"
                placeholder={t('marketing.contact_message')}
                required
              />
              <button type="submit">{t('marketing.contact_send')}</button>
            </form>
          </>
        );

      case 'services':
        return (
          <>
            <h2>{t('marketing.services_title')}</h2>
            <ul className="footer-services">
              <li>{t('marketing.services_list.storage')}</li>
              <li>{t('marketing.services_list.history')}</li>
              <li>{t('marketing.services_list.family')}</li>
              <li>{t('marketing.services_list.sharing')}</li>
            </ul>
          </>
        );

      case 'successMessageNewsletter':
        return (
          <div className="popup-message">
            <h2>{t('marketing.newsletter_success_title')}</h2>
            <p>{t('marketing.newsletter_success_text')}</p>
          </div>
        );

      case 'errorMessageNewsletter':
        return (
          <div className="popup-message">
            <h2>{t('marketing.newsletter_error_title')}</h2>
            <p>{t('marketing.newsletter_error_text')}</p>
          </div>
        );

      case 'successMessage':
        return (
          <div className="popup-message">
            <h2>{t('marketing.contact_success_title')}</h2>
            <p>{t('marketing.contact_success_text')}</p>
          </div>
        );

      case 'errorMessage':
        return (
          <div className="popup-message">
            <h2>{t('marketing.contact_error_title')}</h2>
            <p>{t('marketing.contact_error_text')}</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <footer className="dashboard-footer">
        <ul className="footer-nav">
          {footerItems.map(({ label, type }) => (
            <li key={type}>
              <button
                type="button"
                className="footer-link"
                onClick={() => openPopUp(type)}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>

        <div className="footer-right">
          <LanguageSwitcher />
        </div>
      </footer>

      {popUpType && (
        <PopUpFooter onClose={closePopUp}>
          {renderPopUpContent()}
        </PopUpFooter>
      )}
    </>
  );
}
