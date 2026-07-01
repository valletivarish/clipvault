import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'About ClipVault',
  description: 'What ClipVault is, why it exists, and how the live boards and browser tools work.',
  path: '/about',
});

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-bg text-t1">
      <Nav />
      <main className="flex-1 w-full max-w-2xl mx-auto px-5 sm:px-7 py-12">
        <h1 className="font-display text-[28px] font-bold mb-6">About ClipVault</h1>

        <div className="space-y-6 text-[14px] leading-relaxed text-t2">
          <p>
            ClipVault started as a simple problem: getting a piece of text or a file from one device
            to another shouldn&apos;t require an account, an app install, or a chat app you weren&apos;t
            already using. Type into a board on your laptop, and it shows up instantly on your phone.
            Drop a file in, and anyone with the board&apos;s id can grab it. No sign-up, no app, nothing
            to remember except a short id.
          </p>

          <div>
            <h2 className="font-display text-[18px] font-bold text-t1 mb-2">Live boards</h2>
            <p>
              Each board is a small shared space identified by a short id you choose or generate. Text
              syncs across every open tab in real time. Files upload directly to storage, expire
              automatically on a schedule you pick (1 hour or 24 hours), and get deleted from storage
              even if nobody ever revisits the board &mdash; there&apos;s no way to accumulate files
              indefinitely. Boards can optionally be PIN-protected so only people who know the PIN can
              edit them, while anyone with the link can still view and download.
            </p>
          </div>

          <div>
            <h2 className="font-display text-[18px] font-bold text-t1 mb-2">100+ browser tools</h2>
            <p>
              Alongside the boards, ClipVault hosts a growing set of small utilities &mdash; JSON
              formatting, password generation, encryption and hashing tools, unit converters, date
              calculators, and more. Every one of these tools runs entirely in your browser using
              standard web APIs (the Web Crypto API for encryption and hashing, the Canvas API for
              images, and so on). Nothing you type into a browser tool is uploaded anywhere; the
              computation happens on your device and stays there.
            </p>
          </div>

          <div>
            <h2 className="font-display text-[18px] font-bold text-t1 mb-2">How it&apos;s built</h2>
            <p>
              ClipVault is a Next.js application. Board text and metadata sync through Firestore in
              real time; uploaded files are stored on Cloudflare R2 with automatic expiry enforced both
              by the app and at the storage layer itself. The site is free to use and ad-supported.
            </p>
          </div>

          <p>
            Questions, bug reports, or feature ideas are always welcome &mdash; see the{' '}
            <a href="/contact" className="text-ac hover:underline">Contact</a> page.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
