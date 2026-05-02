import type { Metadata } from 'next';
import { Open_Sans, Fira_Mono } from 'next/font/google';
import './globals.css';

const openSans = Open_Sans({
  variable: '--font-open-sans',
  subsets: ['latin'],
});

const firaMono = Fira_Mono({
  variable: '--font-fira-mono',
  subsets: ['latin'],
  weight: '400',
});

export const metadata: Metadata = {
  title: 'Home - RITNA',
  description: 'Rumbles In The New Academy.',
  icons: {
    apple: '/apple-touch-icon.png',
    icon: '/favicon-32x32.png',
    shortcut: '/favicon-16x16.png',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${openSans.variable} ${firaMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
