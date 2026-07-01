'use client';

import { useState, useMemo } from 'react';

interface MatchResult {
  fullMatch: string;
  index: number;
  groups: string[];
}

interface HighlightSegment {
  text: string;
  isMatch: boolean;
}

function buildHighlightSegments(input: string, matches: MatchResult[]): HighlightSegment[] {
  if (matches.length === 0) return [{ text: input, isMatch: false }];

  const segments: HighlightSegment[] = [];
  let cursor = 0;

  for (const match of matches) {
    if (match.index > cursor) {
      segments.push({ text: input.slice(cursor, match.index), isMatch: false });
    }
    segments.push({ text: match.fullMatch, isMatch: true });
    cursor = match.index + match.fullMatch.length;
    // Guard against zero-length matches causing infinite loops
    if (match.fullMatch.length === 0) cursor++;
  }

  if (cursor < input.length) {
    segments.push({ text: input.slice(cursor), isMatch: false });
  }

  return segments;
}

export default function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState({ g: true, i: false, m: false });
  const [testString, setTestString] = useState('');
  const [replacement, setReplacement] = useState('');

  const flagString = [
    flags.g ? 'g' : '',
    flags.i ? 'i' : '',
    flags.m ? 'm' : '',
  ].join('');

  const { regex, regexError } = useMemo(() => {
    if (!pattern) return { regex: null, regexError: null };
    try {
      return { regex: new RegExp(pattern, flagString), regexError: null };
    } catch (e) {
      return { regex: null, regexError: (e as Error).message };
    }
  }, [pattern, flagString]);

  const matches = useMemo<MatchResult[]>(() => {
    if (!regex || !testString) return [];

    const results: MatchResult[] = [];

    if (flags.g) {
      let m: RegExpExecArray | null;
      const safeRegex = new RegExp(pattern, flagString);
      let lastIndex = -1;
      while ((m = safeRegex.exec(testString)) !== null) {
        results.push({
          fullMatch: m[0],
          index: m.index,
          groups: m.slice(1),
        });
        // Prevent infinite loop on zero-length matches
        if (m.index === safeRegex.lastIndex) {
          safeRegex.lastIndex++;
        }
        if (m.index === lastIndex) break;
        lastIndex = m.index;
      }
    } else {
      const m = regex.exec(testString);
      if (m) {
        results.push({
          fullMatch: m[0],
          index: m.index,
          groups: m.slice(1),
        });
      }
    }

    return results;
  }, [regex, testString, pattern, flagString, flags.g]);

  const segments = useMemo(
    () => buildHighlightSegments(testString, matches),
    [testString, matches]
  );

  const replaceResult = useMemo(() => {
    if (!regex || !testString) return '';
    try {
      const r = new RegExp(pattern, flagString);
      return testString.replace(r, replacement);
    } catch {
      return '';
    }
  }, [regex, testString, pattern, flagString, replacement]);

  const toggleFlag = (flag: 'g' | 'i' | 'm') => {
    setFlags((prev) => ({ ...prev, [flag]: !prev[flag] }));
  };

  const hasPattern = pattern.length > 0;
  const matchCount = matches.length;

  return (
    <div className="w-full max-w-[900px] mx-auto space-y-4">

      {/* Pattern Row */}
      <div>
        <label className="mb-2 block text-[10px] font-semibold tracking-[0.08em] text-[#52525B]">
          Pattern
        </label>
        <div className="rounded-xl border border-white/[0.06] bg-[#111115] overflow-hidden">
          <div className="flex items-center gap-2 px-[14px] py-[10px]">
            {/* Leading slash decoration */}
            <span className="font-mono text-[13px] text-[#52525B] select-none">/</span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="[a-z]+"
              spellCheck={false}
              className="flex-1 bg-transparent font-mono text-[13px] text-[#FAFAFA] outline-none placeholder:text-[#3f3f46]"
            />
            <span className="font-mono text-[13px] text-[#52525B] select-none">/{flagString}</span>
          </div>

          {/* Flags bar */}
          <div className="flex items-center gap-2 border-t border-white/[0.06] px-[14px] py-[9px]">
            <span className="text-[10px] text-[#52525B] mr-1 tracking-widest font-semibold">Flags</span>
            {(['g', 'i', 'm'] as const).map((flag) => (
              <button
                key={flag}
                onClick={() => toggleFlag(flag)}
                className={[
                  'rounded-[5px] border px-[10px] py-[3px] text-[10px] font-mono font-semibold transition-colors',
                  flags[flag]
                    ? 'border-[#F97316]/30 bg-[#F97316]/10 text-[#F97316]'
                    : 'border-white/10 bg-[#222228] text-[#52525B] hover:border-white/20 hover:text-[#A1A1AA]',
                ].join(' ')}
              >
                {flag}
              </button>
            ))}
            <span className="ml-auto text-[10px] text-[#52525B]">
              {flags.g && 'global'}{flags.g && flags.i && ', '}{flags.i && 'ignore case'}{(flags.g || flags.i) && flags.m && ', '}{flags.m && 'multiline'}
            </span>
          </div>
        </div>

        {/* Regex error */}
        {regexError && (
          <div className="mt-2 flex items-center gap-2 rounded-[7px] border border-[#F43F5E]/15 bg-[#F43F5E]/[0.06] px-3 py-2">
            {/* X icon */}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
              <circle cx="6" cy="6" r="5.5" stroke="#F43F5E" strokeOpacity="0.5"/>
              <path d="M4 4l4 4M8 4l-4 4" stroke="#F43F5E" strokeWidth="1.25" strokeLinecap="round"/>
            </svg>
            <span className="font-mono text-[11px] text-[#F43F5E]">{regexError}</span>
          </div>
        )}
      </div>

      {/* Test string */}
      <div>
        <label className="mb-2 block text-[10px] font-semibold tracking-[0.08em] text-[#52525B]">
          Test String
        </label>
        <div className="rounded-xl border border-white/[0.06] bg-[#111115] overflow-hidden">
          <textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Paste or type text to test against..."
            rows={6}
            spellCheck={false}
            className="w-full px-[14px] py-[14px] bg-transparent text-[#A1A1AA] text-[12px] resize-none outline-none leading-[1.75]"
          />
          <div className="border-t border-white/[0.06] px-[14px] py-[8px] flex items-center justify-between">
            <span className="text-[10px] text-[#52525B]">{testString.length} characters</span>
            <button
              onClick={() => setTestString('')}
              className="text-[10px] text-[#52525B] hover:text-[#A1A1AA] transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {hasPattern && testString && (
        <div>
          {/* Match count badge */}
          <div className="mb-3 flex items-center gap-2">
            <label className="text-[10px] font-semibold tracking-[0.08em] text-[#52525B]">
              Results
            </label>
            {!regexError && (
              <span
                className={[
                  'rounded-[4px] border px-[8px] py-[2px] text-[10px] font-semibold',
                  matchCount > 0
                    ? 'border-[#22C55E]/15 bg-[#22C55E]/[0.07] text-[#22C55E]'
                    : 'border-[#F43F5E]/15 bg-[#F43F5E]/[0.07] text-[#F43F5E]',
                ].join(' ')}
              >
                {matchCount} {matchCount === 1 ? 'match' : 'matches'}
              </span>
            )}
          </div>

          {!regexError && (
            <>
              {/* Highlighted test string */}
              <div className="rounded-xl border border-white/[0.06] bg-[#111115] overflow-hidden mb-3">
                <div className="px-[14px] pt-[10px] pb-[4px]">
                  <span className="text-[10px] font-semibold tracking-[0.08em] text-[#52525B]">
                    Highlighted
                  </span>
                </div>
                <pre className="px-[14px] py-[10px] font-mono text-[12px] text-[#A1A1AA] leading-[1.75] whitespace-pre-wrap break-all overflow-auto max-h-[200px]">
                  {segments.map((seg, i) =>
                    seg.isMatch ? (
                      <mark
                        key={i}
                        style={{
                          background: 'rgba(249,115,22,0.22)',
                          color: '#F97316',
                          borderRadius: '3px',
                          padding: '0 1px',
                        }}
                      >
                        {seg.text}
                      </mark>
                    ) : (
                      <span key={i}>{seg.text}</span>
                    )
                  )}
                </pre>
              </div>

              {/* Match list */}
              {matchCount > 0 && (
                <div className="rounded-xl border border-white/[0.06] bg-[#111115] overflow-hidden">
                  <div className="px-[14px] pt-[10px] pb-[4px]">
                    <span className="text-[10px] font-semibold tracking-[0.08em] text-[#52525B]">
                      Match Details
                    </span>
                  </div>
                  <div className="divide-y divide-white/[0.04] max-h-[240px] overflow-auto">
                    {matches.map((match, idx) => (
                      <div key={idx} className="flex items-start gap-3 px-[14px] py-[9px]">
                        {/* Index badge */}
                        <span className="mt-[1px] shrink-0 rounded-[4px] border border-white/10 bg-[#222228] px-[7px] py-[1px] font-mono text-[10px] text-[#52525B]">
                          #{idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[12px] text-[#F97316] break-all">
                              {match.fullMatch === '' ? (
                                <span className="text-[#52525B] italic">empty match</span>
                              ) : (
                                match.fullMatch
                              )}
                            </span>
                            <span className="text-[10px] text-[#52525B]">
                              at index {match.index}
                            </span>
                          </div>
                          {match.groups.length > 0 && (
                            <div className="mt-[4px] flex flex-wrap gap-[5px]">
                              {match.groups.map((g, gi) => (
                                <span
                                  key={gi}
                                  className="rounded-[4px] border border-[#F59E0B]/15 bg-[#F59E0B]/[0.06] px-[7px] py-[1px] font-mono text-[10px] text-[#F59E0B]"
                                >
                                  group {gi + 1}: {g === undefined ? 'undefined' : g}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Replace section */}
      <div>
        <label className="mb-2 block text-[10px] font-semibold tracking-[0.08em] text-[#52525B]">
          Replace
        </label>
        <div className="rounded-xl border border-white/[0.06] bg-[#111115] overflow-hidden mb-3">
          <div className="flex items-center gap-2 px-[14px] py-[10px]">
            <span className="text-[10px] text-[#52525B] font-semibold shrink-0">With</span>
            <input
              type="text"
              value={replacement}
              onChange={(e) => setReplacement(e.target.value)}
              placeholder="$1 or literal text"
              spellCheck={false}
              className="flex-1 bg-transparent font-mono text-[13px] text-[#A1A1AA] outline-none placeholder:text-[#3f3f46]"
            />
          </div>
        </div>

        {hasPattern && testString && !regexError && (
          <div className="rounded-xl border border-white/[0.06] bg-[#111115] overflow-hidden">
            <div className="px-[14px] pt-[10px] pb-[4px]">
              <span className="text-[10px] font-semibold tracking-[0.08em] text-[#52525B]">
                Result
              </span>
            </div>
            <pre className="px-[14px] py-[10px] font-mono text-[12px] text-[#22C55E] leading-[1.75] whitespace-pre-wrap break-all overflow-auto max-h-[160px]">
              {replaceResult}
            </pre>
          </div>
        )}
      </div>

    </div>
  );
}
