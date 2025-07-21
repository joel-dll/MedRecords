'use client';
import { usePathname } from 'next/navigation';
import DashboardHeader from './Header';
import GreetingCard from './GreetingCard';
import Footer from './Footer';
import '../styles/globals.css';

export default function LayoutWrapper({ children }) {
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
