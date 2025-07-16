'use client';
import React, { useState } from 'react';
import PopUpFooter from './Pop-UpFooter';
import { db } from '../lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

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
      <form
        className="newsletter-form"
        onSubmit={async (e) => {
          e.preventDefault();
          const email = e.target.email.value;

          if (!email) return;

          try {
            await addDoc(collection(db, 'newsletterEmails'), {
              email,
              subscribedAt: Timestamp.now(),
            });
            e.target.reset();
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
          placeholder="Enter your email"
          className="newsletter-input"
          required
        />
        <button type="submit" className="newsletter-button">Subscribe</button>
      </form>
    </>
  );

      case 'contact':
  return (
    <>
      <h2>Contact Us</h2>
      <form
        className="contact-form"
        onSubmit={async (e) => {
            e.preventDefault();

            const name = e.target.name.value;
            const email = e.target.email.value;
            const message = e.target.message.value;

            try {
            await addDoc(collection(db, 'contactMessages'), {
                name,
                email,
                message,
                sentAt: Timestamp.now(),
            });
            e.target.reset();
            setPopUpType('successMessage'); 
            } catch (error) {
            console.error('Error sending message:', error);
            setPopUpType('errorMessage'); 
            }
        }}
    >
        <input type="text" name="name" placeholder="Your Name" required />
        <input type="email" name="email" placeholder="Your Email" required />
        <textarea name="message" placeholder="Your Message" required></textarea>
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
      case 'successMessageNewsletter':
        return (
            <div className="popup-message">
                <h2>Success! </h2>
                <p>Your email has been subscribed successfully!</p>
            </div>
        );
        case 'errorMessageNewsletter':
        return (
            <div className="popup-message">
                <h2>Error! </h2>
                <p>There was an error subscribing your email. Please try again later.</p>
            </div>
        );

      case 'successMessage':
        return (
            <div className="popup-message">
            <h2>Success! </h2>
            <p>Your message has been sent successfully.</p>
            
            </div>
        );

      case 'errorMessage':
        return (
            <div className="popup-message">
            <h2>Error</h2>
            <p>There was an error sending your message. Please try again later.</p>
            
            </div>
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
