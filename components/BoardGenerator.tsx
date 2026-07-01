'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateBoardCode, slugifyBoardName, BOARD_MIN, BOARD_MAX } from '@/lib/board';

export default function BoardGenerator() {
  const router = useRouter();
  const [value, setValue] = useState('');

  const slug = slugifyBoardName(value);
  const touched = value.trim().length > 0;

  const open = () => {
    if (slug) {
      router.push(`/b/${slug}`);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[360px]">
      {/* Your own board name */}
      <div className="mb-2 px-1">
        <label htmlFor="board-name" className="text-[10px] font-semibold tracking-[0.08em] text-t3">
          Board ID
        </label>
      </div>
      <input
        id="board-name"
        value={value}
        onChange={(e) => setValue(e.target.value.slice(0, BOARD_MAX))}
        onKeyDown={(e) => e.key === 'Enter' && open()}
        spellCheck={false}
        autoComplete="off"
        placeholder="enter the board id"
        aria-label="Board name"
        className="mb-2 w-full rounded-xl border border-white/10 bg-s1 px-5 py-4 font-mono text-[20px] font-bold tracking-[0.02em] text-t1 placeholder:font-normal placeholder:tracking-normal placeholder:text-t3/40 outline-none transition-colors focus:border-[var(--ac-glow)]"
      />

      <p className="mb-4 min-h-[16px] px-1 text-[11px]">
        {slug ? (
          <span className="text-t3">
            Opens at <span className="font-mono text-t2">/b/{slug}</span> - same id joins the same board
          </span>
        ) : touched ? (
          <span className="text-warn">Use {BOARD_MIN}-{BOARD_MAX} letters, numbers or hyphens</span>
        ) : (
          <span className="text-t3">Enter any id, or generate one with the button</span>
        )}
      </p>

      <div className="flex gap-2">
        <button
          onClick={open}
          disabled={!slug}
          className="flex-1 rounded-[8px] bg-ac py-[11px] text-[13px] font-semibold text-white transition-all hover:bg-[#EA8C15] active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100"
        >
          Create board
        </button>
        <button
          onClick={() => setValue(generateBoardCode())}
          className="flex items-center justify-center gap-[6px] rounded-[8px] border border-white/10 px-4 py-[11px] text-[13px] text-t2 transition-all hover:border-white/20 hover:text-t1 active:scale-[0.97]"
          title="Let ClipVault pick a random code"
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M12 2.5A5.5 5.5 0 1 0 13 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M10.5 1v3h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Generate code
        </button>
      </div>
    </div>
  );
}
