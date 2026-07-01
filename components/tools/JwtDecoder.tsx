'use client';

import { useState, useCallback } from 'react';

// ---- helpers ----------------------------------------------------------------

function b64url(str: string): unknown {
  const pad = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4));
  return JSON.parse(atob(str.replace(/-/g, '+').replace(/_/g, '/') + pad));
}

function formatTimestamp(unix: number): string {
  try {
    const d = new Date(unix * 1000);
    return d.toUTCString();
  } catch {
    return String(unix);
  }
}

function looksLikeJwt(value: string): boolean {
  const trimmed = value.trim();
  const dots = trimmed.split('.').length - 1;
  return dots === 2 && trimmed.length > 10;
}

// ---- types ------------------------------------------------------------------

interface Decoded {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
}

interface DecodeResult {
  decoded: Decoded | null;
  error: string;
}

// ---- decode logic -----------------------------------------------------------

function decodeJwt(raw: string): DecodeResult {
  const trimmed = raw.trim();
  if (!trimmed) return { decoded: null, error: '' };

  const parts = trimmed.split('.');
  if (parts.length !== 3) {
    return { decoded: null, error: 'Invalid JWT: expected 3 dot-separated parts.' };
  }

  const [headerB64, payloadB64, signatureB64] = parts;

  let header: Record<string, unknown>;
  let payload: Record<string, unknown>;

  try {
    const h = b64url(headerB64);
    if (typeof h !== 'object' || h === null || Array.isArray(h)) throw new Error();
    header = h as Record<string, unknown>;
  } catch {
    return { decoded: null, error: 'Invalid JWT: header could not be decoded.' };
  }

  try {
    const p = b64url(payloadB64);
    if (typeof p !== 'object' || p === null || Array.isArray(p)) throw new Error();
    payload = p as Record<string, unknown>;
  } catch {
    return { decoded: null, error: 'Invalid JWT: payload could not be decoded.' };
  }

  return {
    decoded: { header, payload, signature: signatureB64 },
    error: '',
  };
}

// ---- color-coded JSON rendering ---------------------------------------------

const TIME_CLAIMS = new Set(['exp', 'iat', 'nbf']);

function renderValue(
  key: string,
  value: unknown,
  nowSec: number
): React.ReactNode {
  if (TIME_CLAIMS.has(key) && typeof value === 'number') {
    const dateStr = formatTimestamp(value);
    if (key === 'exp') {
      const expired = value < nowSec;
      const color = expired ? '#F43F5E' : '#22C55E';
      return (
        <span style={{ color }}>
          {value}
          <span style={{ color: '#52525B' }}> /* {dateStr} -- {expired ? 'EXPIRED' : 'valid'} */</span>
        </span>
      );
    }
    return (
      <span style={{ color: '#F97316' }}>
        {value}
        <span style={{ color: '#52525B' }}> /* {dateStr} */</span>
      </span>
    );
  }

  if (typeof value === 'string') return <span style={{ color: '#22C55E' }}>"{value}"</span>;
  if (typeof value === 'number') return <span style={{ color: '#F97316' }}>{value}</span>;
  if (typeof value === 'boolean') return <span style={{ color: '#F97316' }}>{String(value)}</span>;
  if (value === null) return <span style={{ color: '#52525B' }}>null</span>;
  if (Array.isArray(value)) {
    return (
      <span style={{ color: '#FAFAFA' }}>
        [{value.map((v, i) => (
          <span key={i}>
            {renderValue('', v, nowSec)}
            {i < value.length - 1 ? ', ' : ''}
          </span>
        ))}]
      </span>
    );
  }
  if (typeof value === 'object') {
    return <span style={{ color: '#A1A1AA' }}>{JSON.stringify(value)}</span>;
  }
  return <span style={{ color: '#A1A1AA' }}>{String(value)}</span>;
}

function ColoredJson({
  data,
  nowSec,
}: {
  data: Record<string, unknown>;
  nowSec: number;
}) {
  const entries = Object.entries(data);
  return (
    <pre
      className="font-mono text-[11px] leading-[1.85] whitespace-pre-wrap break-all"
      style={{ margin: 0 }}
    >
      {'{\n'}
      {entries.map(([k, v], i) => (
        <span key={k}>
          {'  '}
          <span style={{ color: '#A1A1AA' }}>"{k}"</span>
          <span style={{ color: '#52525B' }}>: </span>
          {renderValue(k, v, nowSec)}
          {i < entries.length - 1 ? ',' : ''}
          {'\n'}
        </span>
      ))}
      {'}'}
    </pre>
  );
}

// ---- copy button ------------------------------------------------------------

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-[5px] rounded-[5px] border border-white/10 bg-[#222228] px-[10px] py-[5px] text-[10px] text-[#A1A1AA] transition-colors hover:border-white/20 hover:text-[#FAFAFA]"
    >
      {copied ? (
        <>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="#22C55E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ color: '#22C55E' }}>Copied</span>
        </>
      ) : (
        <>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <rect x="4" y="4" width="7" height="7" rx="1.2" stroke="#A1A1AA" strokeWidth="1.2" />
            <path d="M8 4V2.8A.8.8 0 007.2 2H2.8A.8.8 0 002 2.8v4.4a.8.8 0 00.8.8H4" stroke="#A1A1AA" strokeWidth="1.2" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

// ---- section card -----------------------------------------------------------

function SectionCard({
  label,
  badge,
  copyText,
  children,
}: {
  label: string;
  badge?: React.ReactNode;
  copyText: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#111115] overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-[14px] py-[9px]">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold tracking-[0.08em] text-[#52525B]">
            {label}
          </span>
          {badge}
        </div>
        <CopyButton text={copyText} />
      </div>
      <div className="px-[14px] py-[14px] overflow-auto">{children}</div>
    </div>
  );
}

// ---- main component ---------------------------------------------------------

export default function JwtDecoder() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<DecodeResult>({ decoded: null, error: '' });

  const nowSec = Math.floor(Date.now() / 1000);

  const decode = useCallback((value: string) => {
    setResult(decodeJwt(value));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    if (!value.trim()) {
      setResult({ decoded: null, error: '' });
      return;
    }
    if (looksLikeJwt(value)) {
      decode(value);
    } else {
      setResult({ decoded: null, error: '' });
    }
  };

  const handleDecode = () => {
    decode(input);
  };

  const handleClear = () => {
    setInput('');
    setResult({ decoded: null, error: '' });
  };

  const { decoded, error } = result;

  const expClaim =
    decoded && typeof decoded.payload['exp'] === 'number'
      ? decoded.payload['exp']
      : null;
  const isExpired = expClaim !== null && expClaim < nowSec;

  return (
    <div className="w-full space-y-4">
      {/* Input area */}
      <div className="rounded-xl border border-white/[0.06] bg-[#111115] overflow-hidden">
        <div className="border-b border-white/[0.06] px-[14px] py-[9px]">
          <span className="text-[10px] font-semibold tracking-[0.08em] text-[#52525B]">
            JWT Token
          </span>
        </div>
        <textarea
          value={input}
          onChange={handleChange}
          placeholder="Paste a JWT token here..."
          spellCheck={false}
          className="w-full bg-transparent px-[14px] py-[14px] font-mono text-[11px] leading-[1.75] text-[#A1A1AA] outline-none resize-none min-h-[100px] placeholder-[#3F3F46]"
        />
        <div className="flex items-center justify-between border-t border-white/[0.06] px-[14px] py-[9px]">
          {expClaim !== null ? (
            <span
              className="rounded-[4px] border px-[7px] py-[2px] text-[10px] font-semibold"
              style={
                isExpired
                  ? {
                      color: '#F43F5E',
                      borderColor: 'rgba(244,63,94,0.15)',
                      background: 'rgba(244,63,94,0.06)',
                    }
                  : {
                      color: '#22C55E',
                      borderColor: 'rgba(34,197,94,0.15)',
                      background: 'rgba(34,197,94,0.06)',
                    }
              }
            >
              {isExpired ? 'Token expired' : 'Token valid'}
            </span>
          ) : (
            <span />
          )}
          <div className="flex gap-[6px]">
            {input && (
              <button
                onClick={handleClear}
                className="rounded-[5px] border border-white/10 bg-[#222228] px-[11px] py-[5px] text-[10px] text-[#A1A1AA] transition-colors hover:border-white/20 hover:text-[#FAFAFA]"
              >
                Clear
              </button>
            )}
            <button
              onClick={handleDecode}
              className="rounded-[5px] bg-[#F97316] px-[11px] py-[5px] text-[10px] font-semibold text-white transition-colors hover:bg-[#EA8C15]"
            >
              Decode
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-[#F43F5E]/20 bg-[#F43F5E]/[0.06] px-[14px] py-[10px] text-[11px] text-[#F43F5E]">
          {error}
        </div>
      )}

      {/* Decoded sections */}
      {decoded && (
        <div className="space-y-3">
          {/* HEADER */}
          <SectionCard
            label="Header"
            copyText={JSON.stringify(decoded.header, null, 2)}
          >
            <ColoredJson data={decoded.header} nowSec={nowSec} />
          </SectionCard>

          {/* PAYLOAD */}
          <SectionCard
            label="Payload"
            badge={
              expClaim !== null ? (
                <span
                  className="rounded-[4px] border px-[6px] py-[2px] text-[9px] font-semibold"
                  style={
                    isExpired
                      ? {
                          color: '#F43F5E',
                          borderColor: 'rgba(244,63,94,0.15)',
                          background: 'rgba(244,63,94,0.06)',
                        }
                      : {
                          color: '#22C55E',
                          borderColor: 'rgba(34,197,94,0.15)',
                          background: 'rgba(34,197,94,0.06)',
                        }
                  }
                >
                  {isExpired ? 'expired' : 'valid'}
                </span>
              ) : undefined
            }
            copyText={JSON.stringify(decoded.payload, null, 2)}
          >
            <ColoredJson data={decoded.payload} nowSec={nowSec} />
          </SectionCard>

          {/* SIGNATURE */}
          <SectionCard
            label="Signature"
            copyText={decoded.signature}
          >
            <div className="space-y-2">
              <pre className="font-mono text-[11px] leading-[1.75] text-[#F97316] break-all whitespace-pre-wrap">
                {decoded.signature}
              </pre>
              <p className="text-[10px] text-[#52525B]">
                Signature shown as raw base64url string -- cannot be verified client-side.
              </p>
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
}
