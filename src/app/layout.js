import './globals.css';

export const metadata = {
  title: 'Next.js Admin',
  description: 'A Next.js admin dashboard template.',
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body>
        {children}
      </body>
    </html>
  );
}
