'use client';
import { useState } from 'react';

type Level = 'Weak' | 'Fair' | 'Good' | 'Strong';

interface Analysis {
  score: number;
  level: Level;
  color: string;
  checks: { label: string; pass: boolean }[];
  suggestions: string[];
}

function analyse(pwd: string): Analysis {
  const checks = [
    { label: 'At least 8 characters', pass: pwd.length >= 8 },
    { label: 'At least 12 characters', pass: pwd.length >= 12 },
    { label: 'Uppercase letters (A-Z)', pass: /[A-Z]/.test(pwd) },
    { label: 'Lowercase letters (a-z)', pass: /[a-z]/.test(pwd) },
    { label: 'Numbers (0-9)', pass: /[0-9]/.test(pwd) },
    { label: 'Special characters (!@#...)', pass: /[^A-Za-z0-9]/.test(pwd) },
    { label: 'No repeated characters (aaa)', pass: !/(.)\\1{2,}/.test(pwd) },
  ];

  const score = checks.filter(c => c.pass).length;
  const level: Level = score <= 2 ? 'Weak' : score <= 4 ? 'Fair' : score <= 5 ? 'Good' : 'Strong';
  const color = level === 'Weak' ? 'text-danger' : level === 'Fair' ? 'text-warn' : level === 'Good' ? 'text-ok' : 'text-ok';

  const suggestions: string[] = [];
  if (pwd.length < 8) suggestions.push('Use at least 8 characters');
  if (!/[A-Z]/.test(pwd)) suggestions.push('Add uppercase letters');
  if (!/[a-z]/.test(pwd)) suggestions.push('Add lowercase letters');
  if (!/[0-9]/.test(pwd)) suggestions.push('Add numbers');
  if (!/[^A-Za-z0-9]/.test(pwd)) suggestions.push('Add special characters like !@#$%');
  if (pwd.length < 12) suggestions.push('Aim for 12+ characters for better security');

  return { score, level, color, checks, suggestions };
}

export default function PasswordStrength() {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);

  const result = password ? analyse(password) : null;
  const barWidth = result ? Math.round((result.score / 7) * 100) : 0;
  const barColor = !result ? '' : result.level === 'Weak' ? 'bg-danger' : result.level === 'Fair' ? 'bg-warn' : 'bg-ok';

  return (
    <div className="w-full max-w-[560px] mx-auto space-y-5">
      <div className="relative">
        <label className="mb-1.5 block text-[10px] font-semibold tracking-[0.08em] text-t3">Password</label>
        <input
          type={show ? 'text' : 'password'}
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Enter a password to analyse..."
          className="w-full rounded-lg border border-white/[0.06] bg-s1 px-4 py-3 pr-20 text-sm text-t1 font-mono outline-none focus:border-white/20"
          autoComplete="new-password"
        />
        <button
          onClick={() => setShow(s => !s)}
          className="absolute right-3 top-8 text-[11px] text-t3 hover:text-t2 transition-colors"
        >
          {show ? 'Hide' : 'Show'}
        </button>
      </div>

      {result && (
        <>
          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-[10px] font-semibold tracking-[0.08em] text-t3">Strength</span>
              <span className={`text-xs font-semibold ${result.color}`}>{result.level}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-s3 overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-300 ${barColor}`} style={{ width: `${barWidth}%` }} />
            </div>
          </div>

          <div className="bg-s2 border border-white/10 rounded-xl p-4 space-y-2">
            <div className="text-[10px] font-semibold tracking-[0.08em] text-t3 mb-3">Checklist</div>
            {result.checks.map(c => (
              <div key={c.label} className="flex items-center gap-2.5 text-xs">
                <span className={c.pass ? 'text-ok' : 'text-t3'}>
                  {c.pass ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  )}
                </span>
                <span className={c.pass ? 'text-t2' : 'text-t3'}>{c.label}</span>
              </div>
            ))}
          </div>

          {result.suggestions.length > 0 && (
            <div className="bg-warn/[0.06] border border-warn/20 rounded-xl p-4">
              <div className="text-[10px] font-semibold tracking-[0.08em] text-warn mb-2">Suggestions</div>
              <ul className="space-y-1">
                {result.suggestions.map(s => (
                  <li key={s} className="text-xs text-t2">{s}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-s2 border border-white/10 rounded-xl p-3">
              <div className="text-lg font-semibold font-mono text-t1">{password.length}</div>
              <div className="text-[10px] text-t3 mt-0.5">Length</div>
            </div>
            <div className="bg-s2 border border-white/10 rounded-xl p-3">
              <div className="text-lg font-semibold font-mono text-t1">{result.score}/7</div>
              <div className="text-[10px] text-t3 mt-0.5">Score</div>
            </div>
            <div className="bg-s2 border border-white/10 rounded-xl p-3">
              <div className={`text-lg font-semibold font-mono ${result.color}`}>{result.level}</div>
              <div className="text-[10px] text-t3 mt-0.5">Rating</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
