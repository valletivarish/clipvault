'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { generateBoardCode, slugifyBoardName, BOARD_MIN, BOARD_MAX } from '@/lib/board';

export default function BoardGenerator() {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [flash, setFlash] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const slug = slugifyBoardName(value);
  const touched = value.trim().length > 0;

  const open = () => {
    if (slug && !navigating) {
      setNavigating(true);
      router.push(`/b/${slug}`);
    }
  };

  const generate = () => {
    setValue(generateBoardCode());
    setFlash(true);
    setTimeout(() => setFlash(false), 600);
    inputRef.current?.focus();
  };

  return (
    <div className="mx-auto w-full max-w-[480px]">
      {/* One composed board-address bar: prefix + id + generate + open */}
      <div
        className={`flex items-center gap-1.5 h-[62px] rounded-[16px] border bg-s1 pl-5 pr-2 shadow-card transition-[border-color,box-shadow] duration-200 focus-within:border-[color:var(--ac-ring)] focus-within:shadow-[0_0_0_4px_var(--ac-glow),var(--shadow-card)] ${
          touched && !slug ? 'border-danger/40' : 'border-[var(--border)]'
        } ${flash ? 'animate-border-flash' : ''}`}
      >
        <span className="select-none font-mono text-[21px] font-medium text-t3">/b/</span>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, BOARD_MAX))}
          onKeyDown={(e) => e.key === 'Enter' && open()}
          autoFocus
          spellCheck={false}
          autoComplete="off"
          placeholder="your-id"
          aria-label="Board id"
          className="tnum min-w-0 flex-1 bg-transparent font-mono text-[21px] font-medium tracking-[0.01em] text-t1 placeholder:text-t3/55 outline-none"
        />
        <button
          onClick={generate}
          aria-label="Generate a random id"
          title="Random id"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-t3 transition-all duration-150 hover:bg-s2 hover:text-t1 active:scale-90"
        >
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M12 2.5A5.5 5.5 0 1 0 13 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M10.5 1v3h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          onClick={open}
          disabled={!slug || navigating}
          className="flex h-[46px] w-[92px] shrink-0 items-center justify-center gap-1.5 rounded-[11px] bg-ac px-[18px] text-[14px] font-semibold text-white transition-[background-color,transform] duration-150 hover:bg-ac-hover active:scale-[0.96] disabled:bg-s2 disabled:text-t3 disabled:active:scale-100"
        >
          {navigating ? (
            <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" aria-label="Opening" />
          ) : (
            <>
              Open
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3 7h8M7.5 3.5 11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </>
          )}
        </button>
      </div>

      <p className="mt-3.5 text-center text-[13px] min-h-[20px]">
        {touched && !slug && (
          <span className="text-warn">Use {BOARD_MIN}&ndash;{BOARD_MAX} letters or numbers</span>
        )}
      </p>
    </div>
  );
}
