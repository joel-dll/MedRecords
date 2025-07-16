'use client';
import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useRouter } from 'next/navigation';
import Footer from '../components/Footer';

export default function Dashboard() {
  const router = useRouter();
  const [showFooter, setShowFooter] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowFooter(currentScrollY <= lastScrollY);
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
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

      
      <Footer show={showFooter} />
    </div>
  );
}
