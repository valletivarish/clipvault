'use client';

import { useState } from 'react';

interface CronFields {
  seconds: string | null;
  minutes: string;
  hours: string;
  days: string;
  months: string;
  weekdays: string;
}

interface ParseResult {
  valid: boolean;
  fields: CronFields | null;
  error: string;
  description: string[];
}

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const PRESETS = [
  { label: '@every minute', value: '* * * * *' },
  { label: '@hourly', value: '0 * * * *' },
  { label: '@daily', value: '0 0 * * *' },
  { label: '@midnight', value: '0 0 * * *' },
  { label: '@weekly', value: '0 0 * * 0' },
  { label: '@monthly', value: '0 0 1 * *' },
  { label: '@yearly', value: '0 0 1 1 *' },
  { label: 'Every 5 min', value: '*/5 * * * *' },
  { label: 'Weekdays 9am', value: '0 9 * * 1-5' },
  { label: 'Every 15 min', value: '*/15 * * * *' },
];

function parseRange(field: string, min: number, max: number): number[] | null {
  const values = new Set<number>();
  const parts = field.split(',');
  for (const part of parts) {
    if (part === '*') {
      for (let i = min; i <= max; i++) values.add(i);
      continue;
    }
    const stepMatch = part.match(/^(\*|(\d+)-(\d+))\/(\d+)$/);
    if (stepMatch) {
      const step = parseInt(stepMatch[4]);
      const rangeMin = stepMatch[2] === undefined ? min : parseInt(stepMatch[2]);
      const rangeMax = stepMatch[3] === undefined ? max : parseInt(stepMatch[3]);
      if (step < 1 || rangeMin < min || rangeMax > max) return null;
      for (let i = rangeMin; i <= rangeMax; i += step) values.add(i);
      continue;
    }
    const rangeMatch = part.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) {
      const lo = parseInt(rangeMatch[1]);
      const hi = parseInt(rangeMatch[2]);
      if (lo < min || hi > max || lo > hi) return null;
      for (let i = lo; i <= hi; i++) values.add(i);
      continue;
    }
    const numMatch = part.match(/^(\d+)$/);
    if (numMatch) {
      const n = parseInt(numMatch[1]);
      if (n < min || n > max) return null;
      values.add(n);
      continue;
    }
    return null;
  }
  return Array.from(values).sort((a, b) => a - b);
}

function describeField(field: string, label: string, min: number, max: number, names?: string[]): string {
  if (field === '*') return `every ${label}`;
  if (field.startsWith('*/')) {
    const step = parseInt(field.slice(2));
    return `every ${step} ${label}${step !== 1 ? 's' : ''}`;
  }
  const values = parseRange(field, min, max);
  if (!values) return `(invalid ${label})`;
  if (names) {
    return values.map((v) => names[v] ?? v).join(', ');
  }
  return values.join(', ');
}

function parseCron(expr: string): ParseResult {
  const trimmed = expr.trim();
  if (!trimmed) return { valid: false, fields: null, error: 'No expression provided', description: [] };

  const parts = trimmed.split(/\s+/);
  let fields: CronFields;

  if (parts.length === 5) {
    fields = { seconds: null, minutes: parts[0], hours: parts[1], days: parts[2], months: parts[3], weekdays: parts[4] };
  } else if (parts.length === 6) {
    fields = { seconds: parts[0], minutes: parts[1], hours: parts[2], days: parts[3], months: parts[4], weekdays: parts[5] };
  } else {
    return { valid: false, fields: null, error: `Expected 5 or 6 fields, got ${parts.length}`, description: [] };
  }

  // Validate each field
  if (fields.seconds !== null && !parseRange(fields.seconds, 0, 59)) {
    return { valid: false, fields, error: 'Invalid seconds field (range 0-59)', description: [] };
  }
  if (!parseRange(fields.minutes, 0, 59)) {
    return { valid: false, fields, error: 'Invalid minutes field (range 0-59)', description: [] };
  }
  if (!parseRange(fields.hours, 0, 23)) {
    return { valid: false, fields, error: 'Invalid hours field (range 0-23)', description: [] };
  }
  if (!parseRange(fields.days, 1, 31)) {
    return { valid: false, fields, error: 'Invalid day field (range 1-31)', description: [] };
  }
  if (!parseRange(fields.months, 1, 12)) {
    return { valid: false, fields, error: 'Invalid month field (range 1-12)', description: [] };
  }
  // weekday 0-7 (0 and 7 = Sunday)
  const wdRaw = parseRange(fields.weekdays, 0, 7);
  if (!wdRaw) {
    return { valid: false, fields, error: 'Invalid weekday field (range 0-7)', description: [] };
  }

  const description: string[] = [];
  if (fields.seconds !== null) {
    description.push(`Seconds: ${describeField(fields.seconds, 'second', 0, 59)}`);
  }
  description.push(`Minutes: ${describeField(fields.minutes, 'minute', 0, 59)}`);
  description.push(`Hours: ${describeField(fields.hours, 'hour', 0, 23)}`);
  description.push(`Day of month: ${describeField(fields.days, 'day', 1, 31)}`);
  description.push(`Month: ${describeField(fields.months, 'month', 1, 12, MONTH_NAMES)}`);
  description.push(`Weekday: ${describeField(fields.weekdays, 'weekday', 0, 7, WEEKDAY_NAMES)}`);

  return { valid: true, fields, error: '', description };
}

function getNextRuns(fields: CronFields, count: number): Date[] {
  const mins = parseRange(fields.minutes, 0, 59) ?? [];
  const hrs = parseRange(fields.hours, 0, 23) ?? [];
  const days = parseRange(fields.days, 1, 31) ?? [];
  const months = parseRange(fields.months, 1, 12) ?? [];
  const wdRaw = parseRange(fields.weekdays, 0, 7) ?? [];
  // Normalize weekday: 7 -> 0 (both mean Sunday)
  const wds = Array.from(new Set(wdRaw.map((d) => (d === 7 ? 0 : d)))).sort((a, b) => a - b);
  const matchAllDays = fields.days === '*' && fields.weekdays === '*';
  const matchAllWeekdays = fields.weekdays === '*';
  const matchAllDayOfMonth = fields.days === '*';

  const results: Date[] = [];
  const now = new Date();
  // Start from next minute
  const cursor = new Date(now);
  cursor.setSeconds(0, 0);
  cursor.setMinutes(cursor.getMinutes() + 1);

  const MAX_ITER = 100000;
  for (let i = 0; i < MAX_ITER && results.length < count; i++) {
    const month = cursor.getMonth() + 1; // 1-12
    const day = cursor.getDate();
    const hour = cursor.getHours();
    const min = cursor.getMinutes();
    const wd = cursor.getDay(); // 0=Sunday

    if (!months.includes(month)) {
      // Jump to 1st of next valid month
      const nextMonth = months.find((m) => m > month);
      if (nextMonth !== undefined) {
        cursor.setMonth(nextMonth - 1, 1);
      } else {
        cursor.setFullYear(cursor.getFullYear() + 1, months[0] - 1, 1);
      }
      cursor.setHours(0, 0, 0, 0);
      continue;
    }

    const dayMatch = matchAllDayOfMonth || days.includes(day);
    const wdMatch = matchAllWeekdays || wds.includes(wd);
    const domWdMatch = matchAllDays ? true : (!matchAllDayOfMonth && !matchAllWeekdays) ? (dayMatch || wdMatch) : (dayMatch && wdMatch);

    if (!domWdMatch) {
      cursor.setMinutes(cursor.getMinutes() + 1);
      continue;
    }

    if (!hrs.includes(hour)) {
      const nextHour = hrs.find((h) => h > hour);
      if (nextHour !== undefined) {
        cursor.setHours(nextHour, mins[0], 0, 0);
      } else {
        cursor.setDate(cursor.getDate() + 1);
        cursor.setHours(hrs[0], mins[0], 0, 0);
      }
      continue;
    }

    if (!mins.includes(min)) {
      const nextMin = mins.find((m) => m > min);
      if (nextMin !== undefined) {
        cursor.setMinutes(nextMin);
      } else {
        const nextHour = hrs.find((h) => h > hour);
        if (nextHour !== undefined) {
          cursor.setHours(nextHour, mins[0], 0, 0);
        } else {
          cursor.setDate(cursor.getDate() + 1);
          cursor.setHours(hrs[0], mins[0], 0, 0);
        }
      }
      continue;
    }

    results.push(new Date(cursor));
    cursor.setMinutes(cursor.getMinutes() + 1);
  }

  return results;
}

function formatDate(d: Date): string {
  return d.toLocaleString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function CronParser() {
  const [expr, setExpr] = useState('0 9 * * 1-5');

  const result = parseCron(expr);
  const nextRuns = result.valid && result.fields ? getNextRuns(result.fields, 5) : [];

  return (
    <div className="w-full space-y-4">
      {/* Input */}
      <div className="bg-[#111115] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="px-[14px] py-[10px] border-b border-white/[0.06]">
          <span className="text-[10px] font-semibold text-[#52525B] tracking-wider">
            Cron Expression
          </span>
        </div>
        <div className="px-[14px] py-[12px]">
          <input
            type="text"
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            placeholder="* * * * *"
            className={`w-full bg-transparent font-mono text-[14px] outline-none ${
              expr && !result.valid ? 'text-[#F43F5E]' : 'text-[#FAFAFA]'
            }`}
            spellCheck={false}
          />
        </div>
      </div>

      {/* Error */}
      {expr && !result.valid && (
        <div className="bg-[#F43F5E]/10 border border-[#F43F5E]/20 rounded-xl px-[14px] py-[10px]">
          <span className="text-[11px] text-[#F43F5E]">{result.error}</span>
        </div>
      )}

      {/* Presets */}
      <div>
        <p className="text-[10px] font-semibold text-[#52525B] tracking-wider mb-2 px-1">
          Presets
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.value + p.label}
              onClick={() => setExpr(p.value)}
              className={`text-[10px] font-mono px-3 py-[6px] rounded-full border transition-all ${
                expr === p.value
                  ? 'border-[#F97316] text-[#F97316] bg-[#F97316]/10'
                  : 'border-white/[0.08] text-[#A1A1AA] hover:border-white/20 hover:text-[#FAFAFA]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {result.valid && result.fields && (
        <div className="grid grid-cols-2 gap-4">
          {/* Field descriptions */}
          <div className="bg-[#111115] border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="px-[14px] py-[10px] border-b border-white/[0.06]">
              <span className="text-[10px] font-semibold text-[#52525B] tracking-wider">
                Field Breakdown
              </span>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {result.description.map((line, i) => {
                const [fieldLabel, ...rest] = line.split(': ');
                return (
                  <div key={i} className="flex gap-3 px-[14px] py-[10px]">
                    <span className="text-[10px] font-semibold text-[#52525B] w-28 shrink-0">
                      {fieldLabel}
                    </span>
                    <span className="text-[11px] text-[#A1A1AA]">{rest.join(': ')}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Next runs */}
          <div className="bg-[#111115] border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="px-[14px] py-[10px] border-b border-white/[0.06]">
              <span className="text-[10px] font-semibold text-[#52525B] tracking-wider">
                Next 5 Run Times
              </span>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {nextRuns.length === 0 ? (
                <div className="px-[14px] py-[10px]">
                  <span className="text-[11px] text-[#F43F5E]">Could not calculate next runs</span>
                </div>
              ) : (
                nextRuns.map((d, i) => (
                  <div key={i} className="flex items-center gap-3 px-[14px] py-[10px]">
                    <span className="text-[10px] font-semibold text-[#F97316] w-4 shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-[11px] font-mono text-[#FAFAFA]">{formatDate(d)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
