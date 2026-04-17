import { ThemeProvider } from 'next-themes';
import './globals.css';

export const metadata = {
  title: 'Next.js Admin',
  description: 'A Next.js admin dashboard template.',
};

export default function RootLayout({ children }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
