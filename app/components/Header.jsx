
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
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
  const menuBtnRef = useRef(null);
  const firstLinkRef = useRef(null);

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

  
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        menuBtnRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      
      const id = setTimeout(() => firstLinkRef.current?.focus(), 0);
      return () => clearTimeout(id);
    }
  }, [menuOpen]);

  const handleNavClick = () => setMenuOpen(false);

  return (
    <header className="dashboard-header" role="banner">
      <h1 className="dashboard-logo">{t('brand')}</h1>

      <button
        type="button"
        className="hamburger"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label={menuOpen ? t('nav.closeMenu') ?? 'Close navigation menu' : t('nav.openMenu') ?? 'Open navigation menu'}
        aria-expanded={menuOpen}
        aria-controls="dashboard-nav"
        ref={menuBtnRef}
      >
        ☰
      </button>

      
      <nav
        id="dashboard-nav"
        aria-label="Primary"
        className={`dashboard-nav ${menuOpen ? 'open' : ''}`}
        onClick={handleNavClick}
      >
        
        <ul role="list" className="dashboard-nav-list">
          <li>
            <Link
              href="/dashboard"
              className={isActive('/dashboard')}
              aria-current={pathname.startsWith('/dashboard') ? 'page' : undefined}
              ref={firstLinkRef}
            >
              {t('nav.dashboard')}
            </Link>
          </li>
          <li>
            <Link
              href="/myrecords"
              className={isActive('/myrecords')}
              aria-current={pathname.startsWith('/myrecords') ? 'page' : undefined}
            >
              {t('nav.records')}
            </Link>
          </li>
          <li>
            <Link
              href="/family"
              className={isActive('/family')}
              aria-current={pathname.startsWith('/family') ? 'page' : undefined}
            >
              {t('nav.family')}
            </Link>
          </li>
          <li>
            <Link
              href="/settings"
              className={isActive('/settings')}
              aria-current={pathname.startsWith('/settings') ? 'page' : undefined}
            >
              {t('nav.settings')}
            </Link>
          </li>
        </ul>
      </nav>

      <button type="button" className="logout-button" onClick={handleLogout} aria-label={t('nav.logout')}>
        {t('nav.logout')}
      </button>
    </header>
  );
}
