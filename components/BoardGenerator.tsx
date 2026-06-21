'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generate(): string {
  return Array.from({ length: 6 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
}

export default function BoardGenerator() {
  const router = useRouter();
  const [code, setCode] = useState(generate);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);

  return (
    <div className="mx-auto w-full max-w-[360px]">
      {/* Generated code display */}
      <div className="mb-4 flex items-center gap-3 rounded-xl border border-white/10 bg-s1 px-5 py-4">
        <span className="flex-1 font-mono font-bold text-[28px] tracking-[0.12em] text-t1 select-all">
          {code}
        </span>
        <button
          onClick={() => setCode(generate())}
          className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-white/10 bg-s3 text-t3 hover:border-white/20 hover:text-t2 transition-colors flex-shrink-0"
          aria-label="Generate new code"
          title="New code"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M12 2.5A5.5 5.5 0 1 0 13 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M10.5 1v3h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <p className="text-center text-[11px] text-t3 mb-4">
        Share this 6-digit code with anyone to join the board
      </p>

      {/* Join input */}
      {joining && (
        <div className="mb-3 flex gap-2">
          <input
            autoFocus
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6))}
            onKeyDown={(e) => e.key === 'Enter' && joinCode.length === 6 && router.push(`/b/${joinCode}`)}
            placeholder="Enter 6-digit code"
            className="flex-1 rounded-[8px] border border-white/10 bg-s1 px-3 py-[10px] font-mono text-[16px] font-bold tracking-[0.1em] text-t1 placeholder-t3 outline-none focus:border-white/25 text-center"
            maxLength={6}
          />
          <button
            onClick={() => joinCode.length === 6 && router.push(`/b/${joinCode}`)}
            disabled={joinCode.length !== 6}
            className="rounded-[8px] border border-white/10 px-4 py-[10px] text-[13px] text-t2 transition-colors hover:border-white/20 hover:text-t1 disabled:opacity-40"
          >
            Go
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => router.push(`/b/${code}`)}
          className="flex-1 rounded-[8px] bg-ac py-[11px] text-[13px] font-semibold text-white hover:bg-[#EA8C15] active:scale-[0.97] transition-all"
        >
          Create board
        </button>
        <button
          onClick={() => { setJoining(!joining); setJoinCode(''); }}
          className={`flex-1 rounded-[8px] border py-[11px] text-[13px] transition-all active:scale-[0.97] ${
            joining ? 'border-white/20 text-t1' : 'border-white/10 text-t2 hover:border-white/20 hover:text-t1'
          }`}
        >
          {joining ? 'Cancel' : 'Join existing'}
        </button>
      </div>
    </div>
  );
}
