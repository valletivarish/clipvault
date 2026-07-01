import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Terms of Service - ClipVault',
  description: 'The terms for using ClipVault\'s live boards and free browser tools.',
  path: '/terms',
});

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-bg text-t1">
      <Nav />
      <main className="flex-1 w-full max-w-2xl mx-auto px-5 sm:px-7 py-12">
        <h1 className="font-display text-[28px] font-bold mb-2">Terms of Service</h1>
        <p className="text-[12px] text-t3 mb-8">Last updated: July 2026</p>

        <div className="space-y-6 text-[14px] leading-relaxed text-t2">
          <p>
            By using ClipVault, you agree to these terms. If you don&apos;t agree, please don&apos;t use
            the site.
          </p>

          <div>
            <h2 className="font-display text-[18px] font-bold text-t1 mb-2">The service</h2>
            <p>
              ClipVault provides free, no-account live boards for sharing text and files, and a set of
              free browser-based utilities. The service is provided &quot;as is&quot;, without accounts,
              without guarantees of uptime, and without any warranty of any kind, express or implied.
            </p>
          </div>

          <div>
            <h2 className="font-display text-[18px] font-bold text-t1 mb-2">Acceptable use</h2>
            <p>You agree not to use ClipVault to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Upload or share illegal content, malware, or material that infringes someone else&apos;s rights</li>
              <li>Attempt to disrupt, overload, or gain unauthorized access to the service or its infrastructure</li>
              <li>Use the live boards to store or transmit content you do not have the right to share</li>
            </ul>
            <p className="mt-2">
              We reserve the right to remove content or restrict access without notice if it violates
              these terms.
            </p>
          </div>

          <div>
            <h2 className="font-display text-[18px] font-bold text-t1 mb-2">Board content is your responsibility</h2>
            <p>
              Because boards require no account and no login, we cannot verify who created or accessed
              any given board. You are solely responsible for what you upload, and for who you share a
              board id with. Board files expire automatically on the schedule you select; text persists
              until manually cleared. Don&apos;t use ClipVault as a permanent backup &mdash; content can
              be lost due to expiry, deletion by another person with access to the board, or service
              interruption.
            </p>
          </div>

          <div>
            <h2 className="font-display text-[18px] font-bold text-t1 mb-2">Browser tools</h2>
            <p>
              The utilities under /tools run client-side and are provided for convenience. We make no
              guarantee of correctness for any specific use case &mdash; verify results independently
              before relying on them for anything security- or compliance-critical.
            </p>
          </div>

          <div>
            <h2 className="font-display text-[18px] font-bold text-t1 mb-2">No warranty, limitation of liability</h2>
            <p>
              ClipVault is provided free of charge, without warranty of any kind. To the fullest extent
              permitted by law, we are not liable for any indirect, incidental, or consequential damages
              arising from your use of, or inability to use, the service &mdash; including loss of data
              stored in a board.
            </p>
          </div>

          <div>
            <h2 className="font-display text-[18px] font-bold text-t1 mb-2">Advertising</h2>
            <p>
              This site displays ads served by Google AdSense to fund hosting and development. See the{' '}
              <a href="/privacy" className="text-ac hover:underline">Privacy Policy</a> for details on
              how ad-related data is handled.
            </p>
          </div>

          <div>
            <h2 className="font-display text-[18px] font-bold text-t1 mb-2">Changes to these terms</h2>
            <p>
              We may update these terms from time to time. The &quot;Last updated&quot; date above
              reflects the most recent revision. Continued use of the site after a change constitutes
              acceptance of the updated terms.
            </p>
          </div>

          <p>
            Questions about these terms &mdash; see{' '}
            <a href="/contact" className="text-ac hover:underline">Contact</a>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
