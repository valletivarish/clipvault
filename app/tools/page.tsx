import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ToolsClient from '@/components/ToolsClient';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Free Browser Tools - 100+ Developer & Utility Tools | ClipVault',
  description:
    'QR generator, JSON formatter, password generator, image compressor, color picker, markdown editor and 90+ more free tools. All run in your browser - nothing uploaded.',
  path: '/tools',
});

export default function ToolsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-bg text-t1">
      <Nav />
      <ToolsClient />
      <Footer />
    </div>
  );
}
