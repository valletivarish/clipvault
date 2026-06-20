'use client';
import { useState } from 'react';

type Tab = 'Temperature' | 'Length' | 'Weight' | 'Speed';

const UNITS: Record<Tab, string[]> = {
  Temperature: ['Celsius', 'Fahrenheit', 'Kelvin'],
  Length: ['Meter', 'Kilometer', 'Mile', 'Foot', 'Inch', 'Centimeter', 'Millimeter'],
  Weight: ['Kilogram', 'Gram', 'Pound', 'Ounce', 'Ton'],
  Speed: ['m/s', 'km/h', 'mph', 'knot'],
};

function toBase(val: number, unit: string, tab: Tab): number {
  if (tab === 'Temperature') {
    if (unit === 'Celsius') return val;
    if (unit === 'Fahrenheit') return (val - 32) * 5 / 9;
    if (unit === 'Kelvin') return val - 273.15;
  }
  if (tab === 'Length') {
    const m: Record<string, number> = { Meter: 1, Kilometer: 1000, Mile: 1609.344, Foot: 0.3048, Inch: 0.0254, Centimeter: 0.01, Millimeter: 0.001 };
    return val * m[unit];
  }
  if (tab === 'Weight') {
    const m: Record<string, number> = { Kilogram: 1, Gram: 0.001, Pound: 0.453592, Ounce: 0.0283495, Ton: 1000 };
    return val * m[unit];
  }
  if (tab === 'Speed') {
    const m: Record<string, number> = { 'm/s': 1, 'km/h': 1 / 3.6, 'mph': 0.44704, 'knot': 0.514444 };
    return val * m[unit];
  }
  return val;
}

function fromBase(base: number, unit: string, tab: Tab): number {
  if (tab === 'Temperature') {
    if (unit === 'Celsius') return base;
    if (unit === 'Fahrenheit') return base * 9 / 5 + 32;
    if (unit === 'Kelvin') return base + 273.15;
  }
  if (tab === 'Length') {
    const m: Record<string, number> = { Meter: 1, Kilometer: 1000, Mile: 1609.344, Foot: 0.3048, Inch: 0.0254, Centimeter: 0.01, Millimeter: 0.001 };
    return base / m[unit];
  }
  if (tab === 'Weight') {
    const m: Record<string, number> = { Kilogram: 1, Gram: 0.001, Pound: 0.453592, Ounce: 0.0283495, Ton: 1000 };
    return base / m[unit];
  }
  if (tab === 'Speed') {
    const m: Record<string, number> = { 'm/s': 1, 'km/h': 1 / 3.6, 'mph': 0.44704, 'knot': 0.514444 };
    return base / m[unit];
  }
  return base;
}

function fmt(n: number): string {
  if (!isFinite(n)) return '';
  if (Math.abs(n) < 0.001 && n !== 0) return n.toExponential(4);
  return parseFloat(n.toPrecision(8)).toString();
}

export default function UnitConverter() {
  const [tab, setTab] = useState<Tab>('Temperature');
  const [values, setValues] = useState<Record<string, string>>({});

  const handleChange = (unit: string, raw: string) => {
    const num = parseFloat(raw);
    if (raw === '' || raw === '-') {
      setValues({ [unit]: raw });
      return;
    }
    if (isNaN(num)) return;
    const base = toBase(num, unit, tab);
    const next: Record<string, string> = { [unit]: raw };
    for (const u of UNITS[tab]) {
      if (u !== unit) next[u] = fmt(fromBase(base, u, tab));
    }
    setValues(next);
  };

  const switchTab = (t: Tab) => { setTab(t); setValues({}); };

  return (
    <div className="w-full max-w-[600px] mx-auto">
      <div className="flex gap-2 flex-wrap mb-6">
        {(Object.keys(UNITS) as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => switchTab(t)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              tab === t ? 'bg-ac border-ac text-white' : 'border-white/10 text-t2 hover:border-white/20 hover:text-t1'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {UNITS[tab].map(unit => (
          <div key={unit} className="flex items-center gap-3 bg-s2 border border-white/10 rounded-xl px-4 py-3">
            <label className="w-28 shrink-0 text-xs text-t2 font-medium">{unit}</label>
            <input
              type="number"
              value={values[unit] ?? ''}
              onChange={e => handleChange(unit, e.target.value)}
              placeholder="0"
              className="flex-1 bg-transparent text-sm text-t1 font-mono outline-none placeholder-t3 min-w-0"
            />
          </div>
        ))}
      </div>

      <button
        onClick={() => setValues({})}
        className="mt-4 text-xs text-t3 hover:text-t2 transition-colors"
      >
        Clear all
      </button>
    </div>
  );
}
