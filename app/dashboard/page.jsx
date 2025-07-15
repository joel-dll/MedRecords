'use client';
import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useRouter } from 'next/navigation';
import PopUpFooter from '../components/Pop-UpFooter';

export default function Dashboard() {
  const router = useRouter();

  const [showFooter, setShowFooter] = useState(true);
  const [popUpFooterType, setPopUpFooterType] = useState(null);

 
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY) {
        setShowFooter(false); 
      } else {
        setShowFooter(true); 
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };


  const openPopUpFooter = (type) => {
    setPopUpFooterType(type);
  };

  const closePopUpFooter = () => {
    setPopUpFooterType(null);
  };


  const renderPopUpFooterContent = () => {
    switch (popUpFooterType) {
      case 'about':
        return (
          <>
            <h2>About Us</h2>
            <p><br></br>MedRecords is your secure platform for managing and accessing personal and family medical records anytime, anywhere.</p>
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

  return (
    <div className="dashboard-container">
     
      <header className="dashboard-header">
        <h1 className="dashboard-logo">MedRecords</h1>
        <nav className="dashboard-nav">
          <a href="#">Dashboard</a>
          <a href="#">My Records</a>
          <a href="#">Family</a>
        </nav>
        <button className="logout-button" onClick={handleLogout}>Log Out</button>
      </header>

      <main className="dashboard-main">
        <h2>Welcome to your Dashboard</h2>
        <p>Select a section to view or manage your health records.</p>
      </main>

      
      {showFooter && (
        <footer className="dashboard-footer">
          <div className="footer-column">
            <h4 onClick={() => openPopUpFooter('about')}>About Us</h4>
          </div>
          <div className="footer-column">
            <h4 onClick={() => openPopUpFooter('newsletter')}>Newsletter</h4>
          </div>
          <div className="footer-column">
            <h4 onClick={() => openPopUpFooter('contact')}>Contact Us</h4>
          </div>
          <div className="footer-column">
            <h4 onClick={() => openPopUpFooter('services')}>Our Services</h4>
          </div>
        </footer>
      )}

      
      {popUpFooterType && (
        <PopUpFooter onClose={closePopUpFooter}>
          {renderPopUpFooterContent()}
        </PopUpFooter>
      )}
    </div>
  );
}
