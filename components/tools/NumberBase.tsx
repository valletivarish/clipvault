'use client';

import { useState } from 'react';

type BaseKey = 'bin' | 'oct' | 'dec' | 'hex';

interface BaseConfig {
  label: string;
  base: number;
  prefix: string;
  chars: RegExp;
}

const BASES: Record<BaseKey, BaseConfig> = {
  bin: { label: 'Binary', base: 2, prefix: '0b', chars: /^[01]*$/ },
  oct: { label: 'Octal', base: 8, prefix: '0o', chars: /^[0-7]*$/ },
  dec: { label: 'Decimal', base: 10, prefix: '', chars: /^[0-9]*$/ },
  hex: { label: 'Hex', base: 16, prefix: '0x', chars: /^[0-9a-fA-F]*$/ },
};

const BASE_ORDER: BaseKey[] = ['bin', 'oct', 'dec', 'hex'];

function convertFromBase(value: string, fromBase: number): bigint | null {
  if (value.trim() === '' || value === '-') return null;
  const neg = value.startsWith('-');
  const raw = neg ? value.slice(1) : value;
  if (raw === '') return null;
  try {
    // Parse digit-by-digit for any base (safe for large numbers)
    let acc = BigInt(0);
    const b = BigInt(fromBase);
    for (const ch of raw.toLowerCase()) {
      const digit = '0123456789abcdef'.indexOf(ch);
      if (digit === -1 || digit >= fromBase) return null;
      acc = acc * b + BigInt(digit);
    }
    return neg ? -acc : acc;
  } catch {
    return null;
  }
}

function convertToBase(value: bigint, toBase: number): string {
  if (value === BigInt(0)) return '0';
  const neg = value < BigInt(0);
  let n = neg ? -value : value;
  const b = BigInt(toBase);
  const digits = '0123456789abcdef';
  let result = '';
  while (n > BigInt(0)) {
    result = digits[Number(n % b)] + result;
    n = n / b;
  }
  return neg ? '-' + result : result;
}

export default function NumberBase() {
  const [values, setValues] = useState<Record<BaseKey, string>>({
    bin: '',
    oct: '',
    dec: '',
    hex: '',
  });
  const [invalid, setInvalid] = useState<Record<BaseKey, boolean>>({
    bin: false,
    oct: false,
    dec: false,
    hex: false,
  });
  const [copied, setCopied] = useState<BaseKey | null>(null);

  const handleChange = (key: BaseKey, raw: string) => {
    const cfg = BASES[key];
    const neg = raw.startsWith('-');
    const unsigned = neg ? raw.slice(1) : raw;

    if (raw !== '' && !cfg.chars.test(unsigned)) {
      setValues((prev) => ({ ...prev, [key]: raw }));
      setInvalid((prev) => ({ ...prev, [key]: true }));
      return;
    }

    const bigVal = raw === '' ? null : convertFromBase(raw === '-' ? '0' : unsigned, cfg.base);
    const isInvalid = raw !== '' && raw !== '-' && bigVal === null;

    const newValues: Record<BaseKey, string> = { bin: '', oct: '', dec: '', hex: '' };
    const newInvalid: Record<BaseKey, boolean> = { bin: false, oct: false, dec: false, hex: false };

    newValues[key] = raw;
    newInvalid[key] = isInvalid;

    if (!isInvalid && bigVal !== null) {
      for (const k of BASE_ORDER) {
        if (k !== key) {
          newValues[k] = convertToBase(bigVal, BASES[k].base);
        }
      }
    }

    setValues(newValues);
    setInvalid(newInvalid);
  };

  const handleCopy = (key: BaseKey) => {
    if (values[key]) {
      navigator.clipboard.writeText(values[key]);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    }
  };

  return (
    <div className="w-full space-y-3">
      {BASE_ORDER.map((key) => {
        const cfg = BASES[key];
        const isErr = invalid[key];
        const val = values[key];
        return (
          <div
            key={key}
            className="bg-[#111115] border border-white/[0.06] rounded-xl overflow-hidden"
          >
            <div className="flex items-center px-[14px] py-[10px] border-b border-white/[0.06]">
              <span className="text-[10px] font-semibold text-[#52525B] tracking-wider w-28 shrink-0">
                {cfg.label}
              </span>
              {cfg.prefix && (
                <span className="text-[10px] font-mono text-[#52525B] mr-2">{cfg.prefix}</span>
              )}
              <input
                type="text"
                value={val}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder="0"
                className={`flex-1 bg-transparent font-mono text-[12px] outline-none ${
                  isErr ? 'text-[#F43F5E]' : 'text-[#FAFAFA]'
                }`}
              />
              {isErr && (
                <span className="text-[10px] text-[#F43F5E] mr-3 shrink-0">Invalid</span>
              )}
              <button
                onClick={() => handleCopy(key)}
                disabled={!val || isErr}
                className={`ml-2 shrink-0 text-[10px] font-semibold px-3 py-[6px] rounded-[6px] transition-all ${
                  copied === key
                    ? 'bg-[#22C55E] text-white'
                    : 'bg-[#222228] text-[#A1A1AA] hover:text-[#FAFAFA] disabled:opacity-30'
                }`}
              >
                {copied === key ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        );
      })}
      <p className="text-[10px] text-[#52525B] px-1">
        Type in any row to convert from that base. Supports large integers via BigInt.
      </p>
    </div>
  );
}
