import './styles/globals.css';
import { Poppins } from 'next/font/google';
import LayoutWrapper from './components/LayoutWrapper';
import I18nProvider from './I18nProvider';

const poppins = Poppins({
  weight: ['100', '300', '400', '600'],
  subsets: ['latin'],
});

export const metadata = {
  title: 'MedRecords',
  description: 'Secure Medical Records Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={poppins.className}>
        
        <a className="skip-link" href="#main">Skip to content</a>

        
        <header role="banner">
          
        </header>

        <nav aria-label="Primary">
          
        </nav>

        <I18nProvider>
          
          <main id="main" role="main">
            <LayoutWrapper>{children}</LayoutWrapper>
          </main>
        </I18nProvider>

        <footer role="contentinfo">
          
        </footer>

        
        <div id="sr-status" className="sr-only" aria-live="polite" />
      </body>
    </html>
  );
}
