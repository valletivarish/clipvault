import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import HeroSection from '@/components/HeroSection';
import HomeToolsSection from '@/components/HomeToolsSection';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';
import { buildMetadata, webAppJsonLd } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'ClipVault - Free Real-Time Clipboard Sharing & Browser Tools',
  description:
    'Share text and files instantly across devices with free real-time clipboard boards. Plus 100+ browser tools - QR generator, JSON formatter, password generator and more.',
  path: '/',
});

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-bg text-t1">
      <JsonLd data={webAppJsonLd()} />
      <Nav />
      <HeroSection />

      <HomeToolsSection />
      <Footer />
    </div>
  );
}
