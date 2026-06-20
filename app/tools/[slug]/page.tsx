import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';
import { TOOLS, SITE_URL, buildMetadata, toolJsonLd, breadcrumbJsonLd } from '@/lib/seo';

import QrGenerator from '@/components/tools/QrGenerator';
import JsonFormatter from '@/components/tools/JsonFormatter';
import PasswordGenerator from '@/components/tools/PasswordGenerator';
import ImageCompressor from '@/components/tools/ImageCompressor';
import ColorPicker from '@/components/tools/ColorPicker';
import MarkdownEditor from '@/components/tools/MarkdownEditor';
import WordCounter from '@/components/tools/WordCounter';
import Base64Encoder from '@/components/tools/Base64Encoder';
import UrlEncoder from '@/components/tools/UrlEncoder';
import LoremIpsum from '@/components/tools/LoremIpsum';
import UuidGenerator from '@/components/tools/UuidGenerator';
import TimestampConverter from '@/components/tools/TimestampConverter';
import AesEncryptor from '@/components/tools/AesEncryptor';
import RsaCrypto from '@/components/tools/RsaCrypto';
import DesEncryptor from '@/components/tools/DesEncryptor';
import TripleDesEncryptor from '@/components/tools/TripleDesEncryptor';
import BcryptHash from '@/components/tools/BcryptHash';
import Md5Hash from '@/components/tools/Md5Hash';
import Sha256Hash from '@/components/tools/Sha256Hash';
import HmacHash from '@/components/tools/HmacHash';
import HexEncoder from '@/components/tools/HexEncoder';
import JasyptEncryptor from '@/components/tools/JasyptEncryptor';
import FileBase64 from '@/components/tools/FileBase64';
import DateDifference from '@/components/tools/DateDifference';
import AgeCalculator from '@/components/tools/AgeCalculator';
import SipCalculator from '@/components/tools/SipCalculator';
import TipCalculator from '@/components/tools/TipCalculator';
import JwtDecoder from '@/components/tools/JwtDecoder';
import NumberBase from '@/components/tools/NumberBase';
import HtmlEntities from '@/components/tools/HtmlEntities';
import StringCase from '@/components/tools/StringCase';
import CronParser from '@/components/tools/CronParser';
import CssUnits from '@/components/tools/CssUnits';
import RegexTester from '@/components/tools/RegexTester';
import DiffChecker from '@/components/tools/DiffChecker';

const COMPONENTS: Record<string, React.ComponentType> = {
  'qr': QrGenerator,
  'json': JsonFormatter,
  'password': PasswordGenerator,
  'image-compressor': ImageCompressor,
  'color-picker': ColorPicker,
  'markdown': MarkdownEditor,
  'word-counter': WordCounter,
  'base64': Base64Encoder,
  'url-encoder': UrlEncoder,
  'lorem-ipsum': LoremIpsum,
  'uuid': UuidGenerator,
  'timestamp': TimestampConverter,
  'aes': AesEncryptor,
  'rsa': RsaCrypto,
  'des': DesEncryptor,
  'triple-des': TripleDesEncryptor,
  'bcrypt': BcryptHash,
  'md5': Md5Hash,
  'sha256': Sha256Hash,
  'hmac': HmacHash,
  'hex': HexEncoder,
  'jasypt': JasyptEncryptor,
  'file-base64': FileBase64,
  'date-diff': DateDifference,
  'age-calc': AgeCalculator,
  'sip-calc': SipCalculator,
  'tip-calc': TipCalculator,
  'jwt-decoder': JwtDecoder,
  'number-base': NumberBase,
  'html-entities': HtmlEntities,
  'string-case': StringCase,
  'cron-parser': CronParser,
  'css-units': CssUnits,
  'regex-tester': RegexTester,
  'text-diff': DiffChecker,
};

export async function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = TOOLS.find((t) => t.slug === slug);
  if (!tool) return {};
  return buildMetadata({
    title: `${tool.name} - Free Online Tool | ClipVault`,
    description: tool.description,
    path: `/tools/${slug}`,
  });
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = TOOLS.find((t) => t.slug === slug);
  const Component = COMPONENTS[slug];

  if (!tool || !Component) notFound();

  return (
    <div className="min-h-screen flex flex-col bg-bg text-t1">
      <JsonLd data={toolJsonLd(tool)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: SITE_URL },
          { name: 'Tools', url: `${SITE_URL}/tools` },
          { name: tool.category, url: `${SITE_URL}/tools` },
          { name: tool.name, url: `${SITE_URL}/tools/${slug}` },
        ])}
      />

      <Nav />

      <header className="px-5 sm:px-7 pt-6 sm:pt-7 pb-[22px] border-b border-white/[0.06]">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[10px] text-t3 mb-3">
          <a href="/" className="hover:text-t2 transition-colors">Home</a>
          <span className="opacity-40">/</span>
          <a href="/tools" className="hover:text-t2 transition-colors">Tools</a>
          <span className="opacity-40">/</span>
          <span>{tool.category}</span>
          <span className="opacity-40">/</span>
          <span className="text-t2">{tool.name}</span>
        </nav>

        <h1 className="font-display text-[22px] sm:text-[28px] tracking-[-0.035em] mb-2">{tool.name}</h1>

        <div className="flex items-center gap-[10px] flex-wrap">
          <p className="text-xs text-t2">{tool.description}</p>
          <div className="flex items-center gap-[6px] text-[10px] font-semibold px-[9px] py-[3px] bg-ok/[0.06] text-ok rounded-[5px] border border-ok/10 whitespace-nowrap">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <rect x="1.5" y="4" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
              <path d="M3 4V3a2 2 0 014 0v1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            Runs in your browser - nothing uploaded
          </div>
        </div>
      </header>

      <div className="px-7 py-[9px] border-b border-white/[0.06] text-center text-[10px] text-t3 tracking-[0.04em]">
        Advertisement
      </div>

      <main className="flex-1 px-5 sm:px-7 py-[22px]">
        <Component />
      </main>

      <div className="px-7 py-[9px] border-t border-white/[0.06] text-center text-[10px] text-t3 tracking-[0.04em]">
        Advertisement
      </div>

      <Footer />
    </div>
  );
}
