'use client';

import { useState } from 'react';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import AesEncryptor from '@/components/tools/AesEncryptor';
import RsaCrypto from '@/components/tools/RsaCrypto';
import DesEncryptor from '@/components/tools/DesEncryptor';
import TripleDesEncryptor from '@/components/tools/TripleDesEncryptor';
import JasyptEncryptor from '@/components/tools/JasyptEncryptor';
import BcryptHash from '@/components/tools/BcryptHash';
import Md5Hash from '@/components/tools/Md5Hash';
import Sha256Hash from '@/components/tools/Sha256Hash';
import HmacHash from '@/components/tools/HmacHash';
import Base64Encoder from '@/components/tools/Base64Encoder';
import HexEncoder from '@/components/tools/HexEncoder';
import FileBase64 from '@/components/tools/FileBase64';

const SIDEBAR = [
  {
    category: 'Encryption',
    tools: [
      { key: 'aes', name: 'AES Encryption', Component: AesEncryptor },
      { key: 'rsa', name: 'RSA Encryption', Component: RsaCrypto },
      { key: 'des', name: 'DES Encryption', Component: DesEncryptor },
      { key: 'triple-des', name: 'Triple DES', Component: TripleDesEncryptor },
      { key: 'jasypt', name: 'Jasypt Encryption', Component: JasyptEncryptor },
    ],
  },
  {
    category: 'Hashing',
    tools: [
      { key: 'bcrypt', name: 'Bcrypt Hash', Component: BcryptHash },
      { key: 'md5', name: 'MD5 Hash', Component: Md5Hash },
      { key: 'sha256', name: 'SHA-256 / SHA-512', Component: Sha256Hash },
      { key: 'hmac', name: 'HMAC Generator', Component: HmacHash },
    ],
  },
  {
    category: 'Encoding',
    tools: [
      { key: 'base64', name: 'Base64 Encoder', Component: Base64Encoder },
      { key: 'hex', name: 'Hex Encoder', Component: HexEncoder },
      { key: 'file-base64', name: 'File to Base64', Component: FileBase64 },
    ],
  },
];

export default function CryptoToolsPage() {
  const [activeKey, setActiveKey] = useState('aes');

  const allTools = SIDEBAR.flatMap((s) => s.tools);
  const activeTool = allTools.find((t) => t.key === activeKey)!;
  const ActiveComponent = activeTool.Component;

  return (
    <div className="min-h-screen flex flex-col bg-[#09090B] text-[#FAFAFA]">
      <Nav />

      {/* Ad placeholder */}
      <div className="px-7 py-[9px] border-b border-white/[0.06] text-center text-[10px] text-[#52525B] tracking-[0.04em]">
        Advertisement
      </div>

      {/* Content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[220px] shrink-0 border-r border-white/[0.06] bg-[#111115] overflow-y-auto hidden sm:block">
          <div className="py-4 px-3">
            {SIDEBAR.map((section) => (
              <div key={section.category} className="mb-5">
                <div className="text-[9px] font-semibold tracking-[0.1em] text-[#52525B] px-2 mb-2">
                  {section.category}
                </div>
                {section.tools.map((tool) => (
                  <button
                    key={tool.key}
                    onClick={() => setActiveKey(tool.key)}
                    className={`w-full text-left px-3 py-[7px] rounded-[6px] text-[12px] transition-colors mb-[2px] ${
                      activeKey === tool.key
                        ? 'bg-[#F97316]/[0.1] text-[#F97316] font-medium'
                        : 'text-[#A1A1AA] hover:bg-white/[0.04] hover:text-[#FAFAFA]'
                    }`}
                  >
                    {tool.name}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </aside>

        {/* Main panel */}
        <main className="flex-1 overflow-y-auto">
          {/* Mobile tool selector */}
          <div className="sm:hidden px-5 pt-5 pb-3">
            <select
              value={activeKey}
              onChange={(e) => setActiveKey(e.target.value)}
              className="w-full bg-[#18181C] border border-white/10 rounded-[7px] px-3 py-2 text-[#FAFAFA] text-sm outline-none focus:border-[#F97316]/40"
            >
              {SIDEBAR.map((section) => (
                <optgroup key={section.category} label={section.category}>
                  {section.tools.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Tool header */}
          <div className="px-5 sm:px-8 pt-6 pb-5 border-b border-white/[0.06]">
            <div className="flex items-center gap-2 mb-2">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-1 text-[10px] text-[#52525B]">
                <a href="/" className="hover:text-[#A1A1AA] transition-colors">
                  Home
                </a>
                <span className="opacity-40">/</span>
                <a href="/tools/crypto" className="hover:text-[#A1A1AA] transition-colors">
                  Crypto
                </a>
                <span className="opacity-40">/</span>
                <span className="text-[#A1A1AA]">{activeTool.name}</span>
              </nav>
            </div>
            <h1 className="font-display font-bold text-[22px] sm:text-[26px] tracking-[-0.03em] mb-1">
              {activeTool.name}
            </h1>
            <div className="flex items-center gap-[6px] text-[10px] font-semibold px-[9px] py-[3px] bg-[#22C55E]/[0.06] text-[#22C55E] rounded-[5px] border border-[#22C55E]/10 w-fit">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <rect x="1.5" y="4" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none" />
                <path d="M3 4V3a2 2 0 014 0v1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              Runs in your browser - nothing uploaded
            </div>
          </div>

          {/* Tool component */}
          <div className="px-5 sm:px-8 py-6">
            <ActiveComponent />
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
