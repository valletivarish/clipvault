import type { Metadata } from 'next';
import { Space_Grotesk, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import FirebaseAnalytics from '@/components/FirebaseAnalytics';
import CleanupWorker from '@/components/CleanupWorker';

const spaceGrotesk = Space_Grotesk({
  weight: ['500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-syne',
});

const dmSans = DM_Sans({
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
      className={`${spaceGrotesk.variable} ${dmSans.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1337359381374895"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-bg text-t1" suppressHydrationWarning>
        <FirebaseAnalytics />
        <CleanupWorker />
        {children}
      </body>
    </html>
  );
}
