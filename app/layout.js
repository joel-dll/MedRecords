
import './styles/globals.css';
import { Poppins } from 'next/font/google';
import LayoutWrapper from '../app/components/LayoutWrapper'; 

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
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
