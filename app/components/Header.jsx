'use client';
import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';


export default function DashboardHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);


  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const isActive = (path) => pathname === path ? 'active-link' : '';

 return (
    <header className="dashboard-header">
      <h1 className="dashboard-logo">MedRecords</h1>

      <button
        className="hamburger"
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        ☰
      </button>

      <nav className={`dashboard-nav ${menuOpen ? 'open' : ''}`}>

        
        <Link href="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
        <Link href="/myrecords" className={isActive('/myrecords')}>My Records</Link>
        <Link href="/family" className={isActive('/family')}>Family</Link>
        <Link href="/settings" className={isActive('/settings')}>Settings</Link>
      </nav>

      <button className="logout-button" onClick={handleLogout}>Log Out</button>
    </header>
  );
}
