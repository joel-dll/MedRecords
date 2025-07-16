'use client';
import React, { useState } from 'react';
import PopUpFooter from './Pop-UpFooter';

export default function Footer({ show }) {
  const [popUpType, setPopUpType] = useState(null);

  const footerItems = [
    { label: 'About Us', type: 'about' },
    { label: 'Newsletter', type: 'newsletter' },
    { label: 'Contact Us', type: 'contact' },
    { label: 'Our Services', type: 'services' },
  ];

  const openPopUp = (type) => setPopUpType(type);
  const closePopUp = () => setPopUpType(null);

  const renderPopUpContent = () => {
    switch (popUpType) {
      case 'about':
        return (
          <>
            <h2>About Us</h2>
            <p><br />MedRecords is your secure platform for managing and accessing personal and family medical records anytime, anywhere.</p>
          </>
        );
      case 'newsletter':
        return (
          <>
            <h2>Subscribe to our Newsletter</h2>
            <form className="newsletter-form">
              <input type="email" placeholder="Enter your email" className="newsletter-input" />
              <button type="submit" className="newsletter-button">Subscribe</button>
            </form>
          </>
        );
      case 'contact':
        return (
          <>
            <h2>Contact Us</h2>
            <form className="contact-form">
              <input type="text" placeholder="Your Name" required />
              <input type="email" placeholder="Your Email" required />
              <textarea placeholder="Your Message" required></textarea>
              <button type="submit">Send</button>
            </form>
          </>
        );
      case 'services':
        return (
          <>
            <h2>Our Services</h2>
            <ul className="footer-services">
              <li>Secure Record Storage</li>
              <li>Appointment History</li>
              <li>Family Health Access</li>
              <li>Medical File Sharing</li>
            </ul>
          </>
        );
      default:
        return null;
    }
  };

  if (!show) return null;

  return (
    <>
      <footer className="dashboard-footer">
        {footerItems.map(({ label, type }) => (
          <div key={type} className="footer-column">
            <h4 onClick={() => openPopUp(type)}>{label}</h4>
          </div>
        ))}
      </footer>

      {popUpType && (
        <PopUpFooter onClose={closePopUp}>
          {renderPopUpContent()}
        </PopUpFooter>
      )}
    </>
  );
}
