
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
        <I18nProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </I18nProvider>
      </body>
    </html>
  );
}
