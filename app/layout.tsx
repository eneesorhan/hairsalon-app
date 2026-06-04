import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hair Salon Pro - Modern Saç Tasarımı',
  description: 'Modern ve şık kuaför salonu. Online randevu sistemi ile saç kesimi, boyama ve tasarım hizmetleri.',
  keywords: 'kuaför, saç kesimi, boyama, tasarım, randevu, salon',
  authors: [{ name: 'Hair Salon Pro' }],
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://hairsalonpro.com',
    title: 'Hair Salon Pro',
    description: 'Modern ve şık kuaför salonu',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
