import { Inter } from 'next/font/google';
import './globals.css';
import FloatingChat from '@/agent/floatingchat';
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="font-sans">
        {children}
        <FloatingChat />
      </body>
    </html>
  );
}