'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateBoardName(): string {
  return Array.from({ length: 6 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
}

function sanitize(val: string): string {
  return val.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 32);
}

export default function BoardGenerator() {
  const router = useRouter();
  const [boardName, setBoardName] = useState(generateBoardName);
  const [joinInput, setJoinInput] = useState('');
  const [joining, setJoining] = useState(false);
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCreate = () => {
    const name = boardName.trim();
    if (!name) { setError('Enter a board name'); return; }
    router.push(`/b/${name}`);
  };

  const handleJoin = () => {
    const code = sanitize(joinInput.trim());
    if (code) router.push(`/b/${code}`);
  };

  return (
    <div className="mx-auto w-full max-w-[400px]">
      <div className="mb-2">
        <label className="text-[10px] font-semibold text-t3 uppercase tracking-[0.08em] mb-[6px] block">
          Board name / key
        </label>

        {/* Clicking anywhere in the box focuses the input */}
        <div
          onClick={() => inputRef.current?.focus()}
          className={`flex items-center gap-[8px] rounded-xl border bg-s1 p-[12px_14px] cursor-text transition-colors ${
            focused ? 'border-white/25' : 'border-white/10 hover:border-white/18'
          }`}
        >
          <input
            ref={inputRef}
            value={boardName}
            onChange={(e) => { setBoardName(sanitize(e.target.value)); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="flex-1 font-mono font-semibold text-[17px] text-t1 bg-transparent outline-none min-w-0"
            aria-label="Board name"
          />

          {/* Pencil icon — visible when not focused, signals the field is editable */}
          {!focused && (
            <svg
              width="13" height="13" viewBox="0 0 13 13" fill="none"
              className="text-t3 flex-shrink-0 pointer-events-none"
              aria-hidden="true"
            >
              <path d="M9 1.5l2.5 2.5-7 7H2V8.5l7-7z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
              <path d="M7.5 3l2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          )}

          <button
            onClick={(e) => { e.stopPropagation(); setBoardName(generateBoardName()); setError(''); }}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-[7px] border border-white/10 bg-s3 text-t3 transition-colors hover:border-white/20 hover:text-t2 flex-shrink-0"
            aria-label="Generate random name"
            tabIndex={-1}
          >
            &#8635;
          </button>
        </div>

        {error && <p className="mt-1 text-[11px] text-danger">{error}</p>}
        <p className="mt-[5px] text-[10px] text-t3">
          {focused ? 'Letters, numbers, - and _ only' : 'Click to edit or refresh for a new code'}
        </p>
      </div>

      {joining && (
        <div className="mb-[10px] flex gap-2">
          <input
            autoFocus
            value={joinInput}
            onChange={(e) => setJoinInput(sanitize(e.target.value))}
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            placeholder="Enter board name or key..."
            className="flex-1 rounded-[7px] border border-white/10 bg-s1 px-3 py-[10px] font-mono text-[14px] text-t1 placeholder-t3 outline-none focus:border-white/20"
          />
          <button
            onClick={handleJoin}
            disabled={!joinInput.trim()}
            className="rounded-[7px] border border-white/10 px-4 py-[10px] text-[13px] text-t2 transition-colors hover:border-white/20 hover:text-t1 disabled:opacity-40"
          >
            Go
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleCreate}
          className="flex-1 rounded-[7px] bg-ac py-[10px] text-[13px] font-semibold text-white transition-colors hover:bg-[#EA8C15] active:scale-[0.97]"
        >
          Create board
        </button>
        <button
          onClick={() => { setJoining(!joining); setJoinInput(''); }}
          className={`flex-1 rounded-[7px] border py-[10px] text-[13px] transition-colors active:scale-[0.97] ${
            joining ? 'border-white/20 text-t1' : 'border-white/10 text-t2 hover:border-white/20 hover:text-t1'
          }`}
        >
          {joining ? 'Cancel' : 'Join existing'}
        </button>
      </div>
    </div>
  );
}
