import type { Metadata } from 'next';
import { Syne, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const syne = Syne({
  weight: '800',
  subsets: ['latin'],
  variable: '--font-syne',
});

const inter = Inter({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  weight: ['500', '600'],
  subsets: ['latin'],
  variable: '--font-jbmono',
});

export const metadata: Metadata = {
  title: 'ClipVault: Free real-time clipboard & file sharing',
  description:
    'Share text and files instantly across devices. No account required. Free forever.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-bg text-t1">
        {children}
      </body>
    </html>
  );
}
