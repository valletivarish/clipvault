'use client';

import { useState } from 'react';

type Tab = 'encode' | 'decode';

function encodeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function decodeHtml(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&copy;/g, '©')
    .replace(/&reg;/g, '®')
    .replace(/&trade;/g, '™')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '…')
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»');
}

export default function HtmlEntities() {
  const [tab, setTab] = useState<Tab>('encode');
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);

  const output = input ? (tab === 'encode' ? encodeHtml(input) : decodeHtml(input)) : '';

  const handleTabChange = (next: Tab) => {
    setTab(next);
    setInput('');
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="w-full">
      <div className="flex gap-2 mb-4">
        {(['encode', 'decode'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => handleTabChange(t)}
            className={`px-4 py-2 rounded-[7px] text-[11px] font-semibold transition-all capitalize ${
              tab === t
                ? 'bg-[#222228] text-[#FAFAFA]'
                : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#111115] border border-white/[0.06] rounded-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-[14px] py-[10px] border-b border-white/[0.06]">
            <span className="text-[10px] font-semibold text-[#52525B] tracking-wider">
              Input
            </span>
            <span className="text-[10px] text-[#52525B]">
              {input.length} chars
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              tab === 'encode'
                ? 'Paste HTML or plain text here...'
                : 'Paste HTML entities here...'
            }
            className="flex-1 bg-transparent text-[#A1A1AA] font-mono text-[11px] leading-[1.75] outline-none resize-none px-[14px] py-[14px] min-h-[220px]"
          />
        </div>

        <div className="bg-[#111115] border border-white/[0.06] rounded-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-[14px] py-[10px] border-b border-white/[0.06]">
            <span className="text-[10px] font-semibold text-[#52525B] tracking-wider">
              Output
            </span>
            <span className="text-[10px] text-[#52525B]">
              {output.length} chars
            </span>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Result will appear here..."
            className="flex-1 bg-transparent text-[#A1A1AA] font-mono text-[11px] leading-[1.75] outline-none resize-none px-[14px] py-[14px] min-h-[220px]"
          />
          {output && (
            <div className="px-[14px] py-3 bg-[#09090B] border-t border-white/[0.06]">
              <button
                onClick={handleCopy}
                className={`text-[10px] font-semibold px-3 py-[6px] rounded-[6px] transition-all ${
                  copied
                    ? 'bg-[#22C55E] text-white'
                    : 'bg-[#F97316] text-white hover:bg-[#EA8C0A]'
                }`}
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
