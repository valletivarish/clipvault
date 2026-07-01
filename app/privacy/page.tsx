import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Privacy Policy - ClipVault',
  description: 'What data ClipVault collects, how it is used, and the third-party services involved.',
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-bg text-t1">
      <Nav />
      <main className="flex-1 w-full max-w-2xl mx-auto px-5 sm:px-7 py-12">
        <h1 className="font-display text-[28px] font-bold mb-2">Privacy Policy</h1>
        <p className="text-[12px] text-t3 mb-8">Last updated: July 2026</p>

        <div className="space-y-6 text-[14px] leading-relaxed text-t2">
          <p>
            ClipVault (&quot;we&quot;, &quot;us&quot;) does not require an account, a name, or an email
            address to use any feature of this site. This page explains what data is collected anyway,
            through the mechanics of running the service, and through the third parties that host and
            monetize it.
          </p>

          <div>
            <h2 className="font-display text-[18px] font-bold text-t1 mb-2">Content you put in a board</h2>
            <p>
              Text and files you add to a live board are stored so they can sync to other devices and
              be shared with anyone who has the board&apos;s id. Text persists until you clear it. Files
              are deleted automatically at the expiry you choose (1 hour or 24 hours) &mdash; this
              deletion happens both in the app and independently at the storage layer, so files do not
              linger indefinitely even if the board is never revisited. Anyone who knows or guesses a
              board id can view its contents unless you set a PIN; treat board ids like you would a
              shared link.
            </p>
          </div>

          <div>
            <h2 className="font-display text-[18px] font-bold text-t1 mb-2">Browser tools</h2>
            <p>
              The 100+ utilities under <span className="text-t1">/tools</span> (JSON formatting,
              encryption, hashing, converters, and so on) run entirely in your browser. Nothing you type
              into them is sent to our servers or stored anywhere.
            </p>
          </div>

          <div>
            <h2 className="font-display text-[18px] font-bold text-t1 mb-2">Analytics</h2>
            <p>
              We use Firebase Analytics (a Google product) to see aggregate page views and which tools
              get used, so we know what&apos;s worth maintaining. This is standard, anonymized usage
              analytics &mdash; it is not tied to any account, since none exists.
            </p>
          </div>

          <div>
            <h2 className="font-display text-[18px] font-bold text-t1 mb-2">Advertising</h2>
            <p>
              This site is supported by Google AdSense. Google and its partners may use cookies and
              similar technologies to serve ads based on your prior visits to this or other websites.
              You can opt out of personalized advertising by visiting{' '}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ac hover:underline"
              >
                Google Ads Settings
              </a>
              , or generally at{' '}
              <a
                href="https://www.aboutads.info/choices"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ac hover:underline"
              >
                aboutads.info/choices
              </a>
              . Visitors in the EEA, UK, and Switzerland are shown a consent prompt before any
              personalized ad cookie is set.
            </p>
          </div>

          <div>
            <h2 className="font-display text-[18px] font-bold text-t1 mb-2">Third parties we use</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><span className="text-t1">Google Firebase</span> &mdash; real-time sync (Firestore) and analytics</li>
              <li><span className="text-t1">Cloudflare R2</span> &mdash; file storage for board uploads</li>
              <li><span className="text-t1">Google AdSense</span> &mdash; advertising</li>
              <li><span className="text-t1">Vercel</span> &mdash; hosting</li>
            </ul>
            <p className="mt-2">
              Each of these providers has its own privacy policy governing how it handles data on our
              behalf.
            </p>
          </div>

          <div>
            <h2 className="font-display text-[18px] font-bold text-t1 mb-2">Children&apos;s privacy</h2>
            <p>
              ClipVault is not directed at children under 13, and we do not knowingly collect
              information from them.
            </p>
          </div>

          <div>
            <h2 className="font-display text-[18px] font-bold text-t1 mb-2">Changes to this policy</h2>
            <p>
              If this policy changes, the &quot;Last updated&quot; date above will change with it.
              Continued use of the site after an update means you accept the revised policy.
            </p>
          </div>

          <p>
            Questions about this policy or a data request &mdash; see{' '}
            <a href="/contact" className="text-ac hover:underline">Contact</a>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
