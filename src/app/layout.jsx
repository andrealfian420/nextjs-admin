import { ThemeProvider } from 'next-themes';
import './globals.css';
import AuthProvider from '@/components/providers/AuthProvider';
import PendingToastHandler from '@/components/providers/PendingToastHandler';
import { Toaster } from '@/components/ui/Sonner';

export const metadata = {
  title: 'Next.js Admin',
  description: 'A Next.js admin dashboard template.',
};

export default function RootLayout({ children }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body>
        <AuthProvider>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
            <PendingToastHandler />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
