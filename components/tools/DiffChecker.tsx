'use client';

import { useState } from 'react';

type DiffEntry = {
  type: 'equal' | 'add' | 'remove';
  line: string;
  lineNumOrig: number | null;
  lineNumMod: number | null;
};

function computeDiff(a: string[], b: string[]): DiffEntry[] {
  const m = a.length;
  const n = b.length;

  // Build LCS table
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to build diff
  const result: DiffEntry[] = [];
  let i = m;
  let j = n;
  let origLine = m;
  let modLine = n;

  const stack: DiffEntry[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      stack.push({ type: 'equal', line: a[i - 1], lineNumOrig: i, lineNumMod: j });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      stack.push({ type: 'add', line: b[j - 1], lineNumOrig: null, lineNumMod: j });
      j--;
    } else {
      stack.push({ type: 'remove', line: a[i - 1], lineNumOrig: i, lineNumMod: null });
      i--;
    }
  }

  return stack.reverse();
}

type Stats = {
  added: number;
  removed: number;
  unchanged: number;
};

function computeStats(diff: DiffEntry[]): Stats {
  let added = 0;
  let removed = 0;
  let unchanged = 0;
  for (const entry of diff) {
    if (entry.type === 'add') added++;
    else if (entry.type === 'remove') removed++;
    else unchanged++;
  }
  return { added, removed, unchanged };
}

// SVG icons
function IconGitBranch() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  );
}

function IconX() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function DiffChecker() {
  const [original, setOriginal] = useState('');
  const [modified, setModified] = useState('');
  const [diff, setDiff] = useState<DiffEntry[] | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);

  const handleCompare = () => {
    const aLines = original.split('\n');
    const bLines = modified.split('\n');
    const result = computeDiff(aLines, bLines);
    setDiff(result);
    setStats(computeStats(result));
  };

  const handleClear = () => {
    setOriginal('');
    setModified('');
    setDiff(null);
    setStats(null);
  };

  const hasInput = original.trim().length > 0 || modified.trim().length > 0;

  // Derive display line numbers
  let origCounter = 0;
  let modCounter = 0;

  return (
    <div className="w-full max-w-[900px] mx-auto">

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Original */}
        <div>
          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#52525B]">
            Original
          </label>
          <div className="rounded-xl border border-white/[0.06] bg-[#111115] overflow-hidden">
            <textarea
              value={original}
              onChange={(e) => setOriginal(e.target.value)}
              placeholder="Paste original text here..."
              className="w-full px-[14px] py-[14px] bg-transparent text-[#A1A1AA] font-mono text-[11px] min-h-[160px] resize-none outline-none leading-[1.75]"
            />
          </div>
        </div>

        {/* Modified */}
        <div>
          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#52525B]">
            Modified
          </label>
          <div className="rounded-xl border border-white/[0.06] bg-[#111115] overflow-hidden">
            <textarea
              value={modified}
              onChange={(e) => setModified(e.target.value)}
              placeholder="Paste modified text here..."
              className="w-full px-[14px] py-[14px] bg-transparent text-[#A1A1AA] font-mono text-[11px] min-h-[160px] resize-none outline-none leading-[1.75]"
            />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={handleCompare}
          disabled={!hasInput}
          className="flex items-center gap-[6px] rounded-[5px] bg-[#F97316] px-4 py-[7px] text-[11px] font-semibold text-white transition-colors hover:bg-[#EA8C15] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <IconGitBranch />
          Compare
        </button>
        {hasInput && (
          <button
            onClick={handleClear}
            className="flex items-center gap-[6px] rounded-[5px] border border-white/10 bg-[#222228] px-4 py-[7px] text-[11px] text-[#A1A1AA] transition-colors hover:border-white/20 hover:text-[#FAFAFA]"
          >
            <IconX />
            Clear
          </button>
        )}
      </div>

      {/* Stats bar */}
      {stats !== null && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-[6px] rounded-[5px] border border-[#22C55E]/10 bg-[#22C55E]/[0.06] px-[10px] py-[5px]">
            <span className="text-[11px] font-semibold text-[#22C55E]">+{stats.added}</span>
            <span className="text-[10px] text-[#A1A1AA]">added</span>
          </div>
          <div className="flex items-center gap-[6px] rounded-[5px] border border-[#F43F5E]/10 bg-[#F43F5E]/[0.06] px-[10px] py-[5px]">
            <span className="text-[11px] font-semibold text-[#F43F5E]">-{stats.removed}</span>
            <span className="text-[10px] text-[#A1A1AA]">removed</span>
          </div>
          <div className="flex items-center gap-[6px] rounded-[5px] border border-white/[0.06] bg-[#222228] px-[10px] py-[5px]">
            <span className="text-[11px] font-semibold text-[#FAFAFA]">{stats.unchanged}</span>
            <span className="text-[10px] text-[#A1A1AA]">unchanged</span>
          </div>
        </div>
      )}

      {/* Diff output */}
      {diff !== null && (
        <div className="mt-3 rounded-xl border border-white/[0.06] bg-[#111115] overflow-hidden">
          <div className="border-b border-white/[0.06] px-[14px] py-[9px] flex items-center gap-[6px]">
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#52525B]">
              Unified Diff
            </span>
          </div>

          <div className="overflow-auto max-h-[480px]">
            {diff.length === 0 ? (
              <div className="px-[14px] py-[14px] font-mono text-[11px] text-[#52525B]">
                No differences found.
              </div>
            ) : (
              <table className="w-full border-collapse font-mono text-[11px] leading-[1.75]">
                <tbody>
                  {diff.map((entry, idx) => {
                    let origNum: number | null = null;
                    let modNum: number | null = null;

                    if (entry.type === 'equal') {
                      origNum = entry.lineNumOrig;
                      modNum = entry.lineNumMod;
                    } else if (entry.type === 'remove') {
                      origNum = entry.lineNumOrig;
                      modNum = null;
                    } else {
                      origNum = null;
                      modNum = entry.lineNumMod;
                    }

                    const isAdd = entry.type === 'add';
                    const isRemove = entry.type === 'remove';

                    const rowBg = isAdd
                      ? 'bg-[#22C55E]/[0.07]'
                      : isRemove
                      ? 'bg-[#F43F5E]/[0.07]'
                      : '';

                    const prefixColor = isAdd
                      ? 'text-[#22C55E]'
                      : isRemove
                      ? 'text-[#F43F5E]'
                      : 'text-[#3F3F47]';

                    const textColor = isAdd
                      ? 'text-[#22C55E]'
                      : isRemove
                      ? 'text-[#F43F5E]'
                      : 'text-[#A1A1AA]';

                    const prefix = isAdd ? '+' : isRemove ? '-' : ' ';

                    return (
                      <tr key={idx} className={`${rowBg} group`}>
                        {/* Original line number */}
                        <td className="select-none w-[42px] min-w-[42px] text-right pr-[10px] pl-[14px] py-0 text-[#3F3F47] border-r border-white/[0.04] align-top">
                          {origNum !== null ? origNum : ''}
                        </td>
                        {/* Modified line number */}
                        <td className="select-none w-[42px] min-w-[42px] text-right pr-[10px] pl-[8px] py-0 text-[#3F3F47] border-r border-white/[0.04] align-top">
                          {modNum !== null ? modNum : ''}
                        </td>
                        {/* Prefix (+/-/space) */}
                        <td className={`select-none w-[22px] min-w-[22px] text-center py-0 ${prefixColor} align-top`}>
                          {prefix}
                        </td>
                        {/* Line content */}
                        <td className={`pl-[6px] pr-[14px] py-0 whitespace-pre ${textColor} align-top`}>
                          {entry.line}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
