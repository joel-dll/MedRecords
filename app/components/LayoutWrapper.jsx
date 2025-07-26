
'use client';

import { usePathname } from 'next/navigation';
import DashboardHeader from '../components/Header';
import GreetingCard from '../components/GreetingCard';
import Footer from '../components/Footer';

export default function LayoutShell({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <div className={`layout-wrapper ${!isLoginPage ? 'with-background' : ''}`}>
      {!isLoginPage && <div className="background-image" />}
      <div className="layout-container">
        {!isLoginPage && <DashboardHeader />}
        {!isLoginPage && <GreetingCard />}
        <main>{children}</main>
        {!isLoginPage && <Footer />}
      </div>
    </div>
  );
}
