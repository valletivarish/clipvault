'use client';

import { useState } from 'react';

type CaseKey =
  | 'camel'
  | 'pascal'
  | 'snake'
  | 'kebab'
  | 'screaming'
  | 'title'
  | 'upper'
  | 'lower';

interface CaseConfig {
  label: string;
  convert: (words: string[]) => string;
}

function splitWords(input: string): string[] {
  // Insert space before uppercase letter preceded by lowercase (camelCase boundary)
  const spaced = input.replace(/([a-z])([A-Z])/g, '$1 $2');
  // Split on spaces, underscores, hyphens
  return spaced
    .split(/[\s_\-]+/)
    .map((w) => w.trim())
    .filter(Boolean);
}

const CASES: Record<CaseKey, CaseConfig> = {
  camel: {
    label: 'camelCase',
    convert: (words) =>
      words
        .map((w, i) =>
          i === 0
            ? w.toLowerCase()
            : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
        )
        .join(''),
  },
  pascal: {
    label: 'PascalCase',
    convert: (words) =>
      words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(''),
  },
  snake: {
    label: 'snake_case',
    convert: (words) => words.map((w) => w.toLowerCase()).join('_'),
  },
  kebab: {
    label: 'kebab-case',
    convert: (words) => words.map((w) => w.toLowerCase()).join('-'),
  },
  screaming: {
    label: 'SCREAMING_SNAKE_CASE',
    convert: (words) => words.map((w) => w.toUpperCase()).join('_'),
  },
  title: {
    label: 'Title Case',
    convert: (words) =>
      words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '),
  },
  upper: {
    label: 'UPPERCASE',
    convert: (words) => words.join(' ').toUpperCase(),
  },
  lower: {
    label: 'lowercase',
    convert: (words) => words.join(' ').toLowerCase(),
  },
};

const CASE_ORDER: CaseKey[] = [
  'camel',
  'pascal',
  'snake',
  'kebab',
  'screaming',
  'title',
  'upper',
  'lower',
];

export default function StringCase() {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState<CaseKey | null>(null);

  const words = splitWords(input);
  const hasInput = words.length > 0;

  const handleCopy = (key: CaseKey, value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="w-full space-y-4">
      <div className="bg-[#111115] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-[14px] py-[10px] border-b border-white/[0.06]">
          <span className="text-[10px] font-semibold text-[#52525B] tracking-wider">
            Input
          </span>
          <span className="text-[10px] text-[#52525B]">
            {words.length} word{words.length !== 1 ? 's' : ''}
          </span>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or paste text here..."
          className="w-full bg-transparent text-[#A1A1AA] font-mono text-[12px] leading-[1.75] outline-none resize-none px-[14px] py-[14px] min-h-[80px]"
        />
      </div>

      <div className="space-y-2">
        {CASE_ORDER.map((key) => {
          const cfg = CASES[key];
          const result = hasInput ? cfg.convert(words) : '';
          const isCopied = copied === key;
          return (
            <div
              key={key}
              className="bg-[#111115] border border-white/[0.06] rounded-xl flex items-center px-[14px] py-[10px] gap-3"
            >
              <span className="text-[10px] font-semibold text-[#52525B] w-44 shrink-0">
                {cfg.label}
              </span>
              <span className="flex-1 font-mono text-[12px] text-[#FAFAFA] truncate">
                {result || <span className="text-[#52525B]">-</span>}
              </span>
              <button
                onClick={() => result && handleCopy(key, result)}
                disabled={!result}
                className={`shrink-0 text-[10px] font-semibold px-3 py-[6px] rounded-[6px] transition-all ${
                  isCopied
                    ? 'bg-[#22C55E] text-white'
                    : 'bg-[#222228] text-[#A1A1AA] hover:text-[#FAFAFA] disabled:opacity-30'
                }`}
              >
                {isCopied ? 'Copied' : 'Copy'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
