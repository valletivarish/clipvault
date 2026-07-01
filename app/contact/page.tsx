import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Contact - ClipVault',
  description: 'Get in touch about bugs, feature requests, or privacy/data questions.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-bg text-t1">
      <Nav />
      <main className="flex-1 w-full max-w-2xl mx-auto px-5 sm:px-7 py-12">
        <h1 className="font-display text-[28px] font-bold mb-6">Contact</h1>

        <div className="space-y-6 text-[14px] leading-relaxed text-t2">
          <p>
            ClipVault doesn&apos;t have accounts or a support inbox to check, so the fastest way to
            reach us is through GitHub:
          </p>

          <a
            href="https://github.com/valletivarish/clipvault/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-[8px] bg-ac px-5 py-[10px] text-[13px] font-semibold text-white hover:bg-[#EA8C15] transition-colors"
          >
            Open an issue on GitHub &rarr;
          </a>

          <div>
            <h2 className="font-display text-[18px] font-bold text-t1 mb-2">What to include</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Bug reports &mdash; which tool or page, what you expected, what happened instead</li>
              <li>Feature requests &mdash; what you&apos;re trying to do that isn&apos;t possible today</li>
              <li>Privacy or data questions &mdash; reference the <a href="/privacy" className="text-ac hover:underline">Privacy Policy</a> section you&apos;re asking about</li>
            </ul>
          </div>

          <p>
            Since board content requires no account, we generally can&apos;t look up or delete a
            specific board on request unless you provide its exact board id.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
