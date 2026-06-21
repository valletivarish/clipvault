'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateBoardCode, slugifyBoardName, BOARD_MIN, BOARD_MAX } from '@/lib/board';

export default function BoardGenerator() {
  const router = useRouter();
  const [value, setValue] = useState(generateBoardCode);
  const [joinValue, setJoinValue] = useState('');
  const [joining, setJoining] = useState(false);

  const slug = slugifyBoardName(value);
  const joinSlug = slugifyBoardName(joinValue);
  const touched = value.trim().length > 0;

  const open = (s: string | null) => { if (s) router.push(`/b/${s}`); };

  return (
    <div className="mx-auto w-full max-w-[360px]">
      {/* Board name: use the generated code or type your own */}
      <div className="mb-3 flex items-center gap-3 rounded-xl border border-white/10 bg-s1 px-5 py-4">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, BOARD_MAX))}
          onKeyDown={(e) => e.key === 'Enter' && open(slug)}
          spellCheck={false}
          autoComplete="off"
          aria-label="Board name"
          className="min-w-0 flex-1 bg-transparent font-mono font-bold text-[26px] uppercase tracking-[0.1em] text-t1 placeholder-t3 outline-none"
        />
        <button
          onClick={() => setValue(generateBoardCode())}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[8px] border border-white/10 bg-s3 text-t3 transition-colors hover:border-white/20 hover:text-t2"
          aria-label="Generate a new random code"
          title="New code"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M12 2.5A5.5 5.5 0 1 0 13 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M10.5 1v3h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Live status: what the URL will be, or why the name is not usable yet */}
      <p className="mb-4 min-h-[16px] text-center text-[11px]">
        {slug ? (
          <span className="text-t3">
            Opens at <span className="font-mono text-t2">/b/{slug}</span> - anyone with the name can join
          </span>
        ) : touched ? (
          <span className="text-warn">Use {BOARD_MIN}-{BOARD_MAX} letters, numbers or hyphens</span>
        ) : (
          <span className="text-t3">Pick a name or use the code above</span>
        )}
      </p>

      {/* Join input */}
      {joining && (
        <div className="mb-3 flex gap-2">
          <input
            autoFocus
            value={joinValue}
            onChange={(e) => setJoinValue(e.target.value.slice(0, BOARD_MAX))}
            onKeyDown={(e) => e.key === 'Enter' && open(joinSlug)}
            placeholder="Enter board name"
            aria-label="Existing board name to join"
            className="min-w-0 flex-1 rounded-[8px] border border-white/10 bg-s1 px-3 py-[10px] text-center font-mono text-[15px] font-bold uppercase tracking-[0.08em] text-t1 placeholder-t3 outline-none focus:border-white/25"
          />
          <button
            onClick={() => open(joinSlug)}
            disabled={!joinSlug}
            className="rounded-[8px] border border-white/10 px-4 py-[10px] text-[13px] text-t2 transition-colors hover:border-white/20 hover:text-t1 disabled:opacity-40"
          >
            Go
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => open(slug)}
          disabled={!slug}
          className="flex-1 rounded-[8px] bg-ac py-[11px] text-[13px] font-semibold text-white transition-all hover:bg-[#EA8C15] active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100"
        >
          Create board
        </button>
        <button
          onClick={() => { setJoining(!joining); setJoinValue(''); }}
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
