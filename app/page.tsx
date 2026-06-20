import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '@/components/Nav';
import HeroSection from '@/components/HeroSection';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';
import { buildMetadata, webAppJsonLd } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'ClipVault - Free Real-Time Clipboard Sharing & Browser Tools',
  description:
    'Share text and files instantly across devices with free real-time clipboard boards. Plus 100+ browser tools - QR generator, JSON formatter, password generator and more.',
  path: '/',
});

const tools = [
  { abbr: 'QR',  name: 'QR Generator',      desc: 'URL or text',       href: '/tools/qr' },
  { abbr: '{ }', name: 'JSON Formatter',     desc: 'Validate & format', href: '/tools/json' },
  { abbr: '***', name: 'Password Gen',       desc: 'Secure & custom',   href: '/tools/password' },
  { abbr: 'IMG', name: 'Image Compressor',   desc: 'Client-side',       href: '/tools/image-compressor' },
  { abbr: 'RGB', name: 'Color Picker',       desc: 'HEX / RGB / HSL',   href: '/tools/color-picker' },
  { abbr: 'MD',  name: 'Markdown Editor',    desc: 'Live preview',      href: '/tools/markdown' },
  { abbr: 'UTC', name: 'Timestamp',          desc: 'Epoch convert',     href: '/tools/timestamp' },
  { abbr: 'ID',  name: 'UUID Generator',     desc: 'v4 UUID',           href: '/tools/uuid' },
];

const categories = [
  'All', 'Text', 'Developer', 'Security', 'Images', 'Colors', 'Math', 'Time & Date', 'Generators',
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-bg text-t1">
      <JsonLd data={webAppJsonLd()} />
      <Nav />

      <HeroSection />

      {/* Ad strip */}
      <div className="border-y border-white/[0.06] py-[9px] text-center text-[10px] text-t3 tracking-[0.04em]">
        Advertisement
      </div>

      {/* Tools */}
      <section className="py-7 pb-6">
        <div className="mx-auto w-full max-w-5xl px-5 sm:px-7">
          <div className="text-[10px] font-semibold text-t3 uppercase tracking-[0.1em] mb-[6px]">
            Free tools
          </div>
          <h2 className="font-display text-[22px] sm:text-[24px] tracking-[-0.03em] mb-1">
            100+ browser tools
          </h2>
          <p className="text-xs text-t3 mb-5">
            Everything runs in your browser. Nothing is sent to any server.
          </p>

          <div className="flex gap-[5px] flex-wrap mb-[18px]">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`px-[11px] py-1 rounded-full text-[11px] font-medium border transition-colors ${
                  cat === 'All'
                    ? 'bg-ac border-ac text-white'
                    : 'border-white/10 text-t2 hover:border-white/20 hover:text-t1'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(142px,1fr))] gap-2 mb-4">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="p-[14px] bg-s1 border border-white/[0.06] rounded-[10px] hover:border-[var(--ac-glow)] hover:bg-[var(--ac-bg)] transition-all group"
              >
                <div className="font-mono text-[13px] font-semibold text-t3 mb-2 group-hover:text-ac transition-colors">
                  {tool.abbr}
                </div>
                <div className="text-xs font-medium text-t1 mb-[2px]">{tool.name}</div>
                <div className="text-[10px] text-t3">{tool.desc}</div>
              </Link>
            ))}
          </div>

          <div className="flex justify-center">
            <Link
              href="/tools"
              className="border border-white/10 text-t2 text-xs px-4 py-[7px] rounded-[7px] hover:text-t1 hover:border-white/20 transition-colors"
            >
              View all tools
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
