'use client';

import { useParams } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

type ExpiryValue = '1h' | '24h' | '7d' | '30d' | 'never';

interface FileSlot {
  id: string;
  name: string;
  ext: string;
  size: string;
  expiry: string;
  isWarn: boolean;
}

const INITIAL_FILES: FileSlot[] = [
  { id: '1', name: 'report_Q2.pdf', ext: 'PDF', size: '2.4 MB', expiry: '23h 41m', isWarn: true },
  { id: '2', name: 'data.xlsx',     ext: 'XLS', size: '1.1 MB', expiry: 'never',   isWarn: false },
];

function extFromName(name: string): string {
  const e = name.split('.').pop()?.toLowerCase() ?? '';
  const MAP: Record<string, string> = {
    pdf: 'PDF', xlsx: 'XLS', xls: 'XLS', csv: 'CSV',
    doc: 'DOC', docx: 'DOC', json: 'JSON', zip: 'ZIP',
    jpg: 'JPG', jpeg: 'JPG', png: 'PNG', gif: 'GIF', webp: 'IMG',
    txt: 'TXT', mp4: 'MP4', mp3: 'MP3',
  };
  return MAP[e] ?? (e.toUpperCase().slice(0, 4) || 'FILE');
}

export default function BoardPage() {
  const params = useParams();
  const boardName = (params?.name as string) || 'swift-tiger-42';

  const [text, setText] = useState('');
  const [files, setFiles] = useState<FileSlot[]>(INITIAL_FILES);
  const [expiry, setExpiry] = useState<ExpiryValue>('24h');
  const [copied, setCopied] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const [connectedCount, setConnectedCount] = useState(1);
  const MAX_CONNECTIONS = 5;

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:3001';
    const ws = new WebSocket(`${wsUrl}?board=${encodeURIComponent(boardName)}`);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data) as { type: string; text?: string; count?: number };
        if (msg.type === 'text' && msg.text !== undefined) setText(msg.text);
        if (msg.type === 'connected' && msg.count !== undefined) setConnectedCount(msg.count);
      } catch {}
    };

    ws.onerror = () => {};

    return () => { ws.close(); };
  }, [boardName]);

  const copyLink = () => {
    navigator.clipboard.writeText(`https://clipvault-tools.vercel.app/b/${boardName}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const newSlot: FileSlot = {
      id: Date.now().toString(),
      name: f.name,
      ext: extFromName(f.name),
      size: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
      expiry: expiry === 'never' ? 'never' : expiry,
      isWarn: expiry !== 'never' && expiry !== '30d',
    };
    setFiles((prev) => [...prev.slice(0, 2), newSlot]);
    e.target.value = '';
  };

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  // Always show 3 visual slots: filled slots + empty drop zone(s) up to 3
  const displaySlots = [
    ...files.slice(0, 3),
    ...Array(Math.max(0, 3 - files.length)).fill(null),
  ] as (FileSlot | null)[];

  return (
    <div className="min-h-screen flex flex-col bg-bg text-t1">
      <Nav />

      {/* Board header */}
      <header className="px-5 sm:px-7 py-5 border-b border-white/[0.06]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-mono text-[22px] font-semibold tracking-[-0.01em] mb-2">
              {boardName}
            </div>
            <div className="flex items-center gap-2 mb-[6px]">
              <div className="flex items-center gap-1 text-[10px] font-medium px-2 py-[3px] rounded-[5px] bg-ok/[0.06] text-ok border border-ok/[0.15]">
                <div className="w-[5px] h-[5px] rounded-full bg-ok animate-pulse" />
                {connectedCount}/{MAX_CONNECTIONS} connected
              </div>
              <div className="bg-s2 text-t3 border border-white/[0.06] text-[10px] px-2 py-[3px] rounded-[5px] font-medium">
                Free board
              </div>
            </div>
            <div className="text-[10px] text-t3 font-mono">
              clipvault-tools.vercel.app/b/<span className="text-t2">{boardName}</span>
            </div>
          </div>

          <div className="flex gap-[6px]">
            <button
              aria-label="Show QR code"
              className="px-[11px] py-[6px] bg-s2 border border-white/10 rounded-[7px] text-t2 text-[11px] font-medium hover:border-[var(--ac-glow)] transition-all"
            >
              QR
            </button>
            <button
              onClick={copyLink}
              className="px-[11px] py-[6px] bg-s2 border border-white/10 rounded-[7px] text-t2 text-[11px] font-medium hover:border-[var(--ac-glow)] transition-all"
            >
              {copied ? 'Copied' : 'Copy link'}
            </button>
            <button
              onClick={() => { setText(''); setFiles([]); }}
              className="px-[11px] py-[6px] bg-s2 border border-danger/20 rounded-[7px] text-danger text-[11px] font-medium hover:border-danger/40 transition-all"
            >
              Clear all
            </button>
          </div>
        </div>
      </header>

      {/* Board body */}
      <main className="flex-1 px-5 sm:px-7 py-[22px]">
        {/* Text slot */}
        <section aria-label="Shared text" className="mb-8">
          <div className="text-[10px] font-semibold text-t3 uppercase tracking-[0.08em] mb-[10px]">
            Text - live sync, never expires
          </div>
          <div className="bg-s1 border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="relative px-4 py-4 min-h-[88px]">
              <div className="flex items-center gap-1 text-[10px] text-ok absolute top-3 right-3">
                <div className="w-[4px] h-[4px] rounded-full bg-ok animate-pulse" />
                synced
              </div>
              <textarea
                value={text}
                onChange={(e) => {
                const val = e.target.value;
                setText(val);
                if (wsRef.current?.readyState === WebSocket.OPEN) {
                  wsRef.current.send(JSON.stringify({ type: 'text', text: val }));
                }
              }}
                placeholder="Start typing - changes sync to all connected devices instantly"
                aria-label="Shared board text"
                className="w-full bg-transparent outline-none resize-none text-t2 text-[13px] leading-relaxed pr-16 min-h-[80px]"
              />
            </div>
            <div className="flex items-center justify-between px-[14px] py-2 border-t border-white/[0.06]">
              <span className="text-[10px] text-t3">{text.length} characters</span>
              <button
                onClick={() => setText('')}
                className="text-[10px] text-t3 hover:text-t1 transition-colors bg-transparent border-none"
              >
                Clear
              </button>
            </div>
          </div>
        </section>

        {/* File slots */}
        <section aria-label="Shared files">
          <div className="text-[10px] font-semibold text-t3 uppercase tracking-[0.08em] mb-[10px]">
            Files - any type, 25 MB max, expiry per file
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-[10px]">
            {displaySlots.map((slot, i) =>
              slot ? (
                <div
                  key={slot.id}
                  className="bg-s1 border border-white/10 rounded-xl p-5 flex flex-col items-center gap-2 min-h-[148px] text-center relative"
                >
                  {/* Expiry badge */}
                  <div
                    className={`absolute top-2 right-2 text-[9px] px-[6px] py-[2px] rounded border font-semibold ${
                      slot.isWarn
                        ? 'bg-warn/[0.07] text-warn border-warn/[0.18]'
                        : 'bg-ok/[0.06] text-ok border-ok/[0.12]'
                    }`}
                  >
                    {slot.expiry}
                  </div>

                  {/* File type badge */}
                  <div className="font-mono text-[11px] font-semibold text-t3 bg-s3 px-2 py-[3px] rounded mt-2">
                    {slot.ext}
                  </div>

                  <div className="text-[11px] font-medium text-t1 break-all">{slot.name}</div>
                  <div className="text-[10px] text-t3">{slot.size}</div>

                  <div className="mt-auto flex gap-2">
                    <button className="px-[12px] py-[6px] bg-s3 border border-white/10 rounded-[6px] text-t1 text-[10px] font-semibold hover:border-[var(--ac-glow)] transition-all">
                      Download
                    </button>
                    <button
                      onClick={() => removeFile(slot.id)}
                      aria-label={`Remove ${slot.name}`}
                      className="px-[8px] py-[6px] bg-s3 border border-white/10 rounded-[6px] text-t3 text-[10px] hover:text-danger hover:border-danger/20 transition-all"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  key={`empty-${i}`}
                  className="bg-s1 border border-dashed border-white/10 rounded-xl p-5 flex flex-col items-center gap-2 min-h-[148px] text-center hover:border-[var(--ac-glow)] transition-all cursor-pointer"
                >
                  <input
                    type="file"
                    onChange={handleUpload}
                    className="sr-only"
                    aria-label="Upload file to board"
                  />
                  <div className="w-8 h-8 rounded-lg bg-s3 border border-white/10 flex items-center justify-center mt-2">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path d="M7 1v8M4 4l3-3 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M1 10v1.5A1.5 1.5 0 002.5 13h9a1.5 1.5 0 001.5-1.5V10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="text-[11px] text-t3">Drop any file</div>
                  <div className="text-[10px] text-t3 leading-[1.7]">PDF, Excel, Word, image, ZIP, any</div>
                  <select
                    value={expiry}
                    onClick={(e) => e.preventDefault()}
                    onChange={(e) => setExpiry(e.target.value as ExpiryValue)}
                    className="w-full mt-auto px-2 py-[6px] bg-s3 border border-white/10 rounded-[6px] text-t2 text-[10px] appearance-none cursor-pointer"
                  >
                    <option value="1h">Expires: 1 hour</option>
                    <option value="24h">Expires: 24 hours</option>
                    <option value="7d">Expires: 7 days</option>
                    <option value="30d">Expires: 30 days</option>
                    <option value="never">Never</option>
                  </select>
                </label>
              )
            )}
          </div>
        </section>
      </main>

      <div className="px-7 py-[9px] border-t border-white/[0.06] text-center text-[10px] text-t3 tracking-[0.04em]">
        Advertisement
      </div>

      <Footer />
    </div>
  );
}
