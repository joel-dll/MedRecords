'use client';

import { useState, useCallback } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function DashboardHeader() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (e) {
      console.error('Logout failed', e);
    }
  }, [router]);

  
  const isActive = useCallback(
    (path) => (pathname === path || pathname.startsWith(path + '/') ? 'active-link' : ''),
    [pathname]
  );

  
  const handleNavClick = () => setMenuOpen(false);

  return (
    <header className="dashboard-header">
      <h1 className="dashboard-logo">{t('brand')}</h1>

      <button
        className="hamburger"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label="Toggle navigation menu"
        aria-expanded={menuOpen}
        aria-controls="dashboard-nav"
      >
        ☰
      </button>

      <nav
        id="dashboard-nav"
        className={`dashboard-nav ${menuOpen ? 'open' : ''}`}
        onClick={handleNavClick}
      >
        <Link
          href="/dashboard"
          className={isActive('/dashboard')}
          aria-current={pathname.startsWith('/dashboard') ? 'page' : undefined}
        >
          {t('nav.dashboard')}
        </Link>

        <Link
          href="/myrecords"
          className={isActive('/myrecords')}
          aria-current={pathname.startsWith('/myrecords') ? 'page' : undefined}
        >
          {t('nav.records')}
        </Link>

        <Link
          href="/family"
          className={isActive('/family')}
          aria-current={pathname.startsWith('/family') ? 'page' : undefined}
        >
          {t('nav.family')}
        </Link>

        <Link
          href="/settings"
          className={isActive('/settings')}
          aria-current={pathname.startsWith('/settings') ? 'page' : undefined}
        >
          {t('nav.settings')}
        </Link>
      </nav>

      <button className="logout-button" onClick={handleLogout}>
        {t('nav.logout')}
      </button>
    </header>
  );
}
