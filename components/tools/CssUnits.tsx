'use client';

import { useState } from 'react';

type Unit = 'px' | 'rem' | 'em' | 'vw' | 'vh' | 'pt' | 'pc';

const UNITS: Unit[] = ['px', 'rem', 'em', 'vw', 'vh', 'pt', 'pc'];

interface ConversionResult {
  unit: Unit;
  value: string;
}

function toPx(value: number, fromUnit: Unit, root: number, elem: number, vw: number, vh: number): number {
  switch (fromUnit) {
    case 'px': return value;
    case 'rem': return value * root;
    case 'em': return value * elem;
    case 'vw': return (value / 100) * vw;
    case 'vh': return (value / 100) * vh;
    case 'pt': return value / 0.75;
    case 'pc': return value * 16;
    default: return value;
  }
}

function fromPx(px: number, toUnit: Unit, root: number, elem: number, vw: number, vh: number): number {
  switch (toUnit) {
    case 'px': return px;
    case 'rem': return root === 0 ? 0 : px / root;
    case 'em': return elem === 0 ? 0 : px / elem;
    case 'vw': return vw === 0 ? 0 : (px / vw) * 100;
    case 'vh': return vh === 0 ? 0 : (px / vh) * 100;
    case 'pt': return px * 0.75;
    case 'pc': return px / 16;
    default: return px;
  }
}

function fmt(n: number): string {
  if (!isFinite(n)) return '0';
  // Up to 6 significant decimals, strip trailing zeros
  return parseFloat(n.toPrecision(6)).toString();
}

function parsePositive(raw: string, fallback: number): number {
  const n = parseFloat(raw);
  return isNaN(n) || n <= 0 ? fallback : n;
}

export default function CssUnits() {
  const [rootFontSize, setRootFontSize] = useState('16');
  const [elemFontSize, setElemFontSize] = useState('16');
  const [viewportW, setViewportW] = useState('1440');
  const [viewportH, setViewportH] = useState('900');
  const [fromUnit, setFromUnit] = useState<Unit>('px');
  const [inputValue, setInputValue] = useState('16');
  const [copied, setCopied] = useState<Unit | null>(null);

  const root = parsePositive(rootFontSize, 16);
  const elem = parsePositive(elemFontSize, 16);
  const vw = parsePositive(viewportW, 1440);
  const vh = parsePositive(viewportH, 900);
  const numVal = parseFloat(inputValue);
  const hasValue = !isNaN(numVal);

  const pxValue = hasValue ? toPx(numVal, fromUnit, root, elem, vw, vh) : 0;

  const results: ConversionResult[] = UNITS.map((unit) => ({
    unit,
    value: hasValue ? fmt(fromPx(pxValue, unit, root, elem, vw, vh)) : '',
  }));

  const handleCopy = (unit: Unit, value: string) => {
    navigator.clipboard.writeText(value + unit);
    setCopied(unit);
    setTimeout(() => setCopied(null), 1500);
  };

  const baseInputClass =
    'bg-[#111115] border border-white/[0.06] rounded-lg px-3 py-[8px] text-[12px] font-mono text-[#FAFAFA] outline-none w-full focus:border-[#F97316]/40 transition-colors';

  return (
    <div className="w-full space-y-4">
      {/* Config row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className="block text-[10px] font-semibold text-[#52525B] uppercase tracking-wider mb-1">
            Root font (px)
          </label>
          <input
            type="number"
            min="1"
            value={rootFontSize}
            onChange={(e) => setRootFontSize(e.target.value)}
            className={baseInputClass}
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-[#52525B] uppercase tracking-wider mb-1">
            Elem font (px)
          </label>
          <input
            type="number"
            min="1"
            value={elemFontSize}
            onChange={(e) => setElemFontSize(e.target.value)}
            className={baseInputClass}
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-[#52525B] uppercase tracking-wider mb-1">
            Viewport W (px)
          </label>
          <input
            type="number"
            min="1"
            value={viewportW}
            onChange={(e) => setViewportW(e.target.value)}
            className={baseInputClass}
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-[#52525B] uppercase tracking-wider mb-1">
            Viewport H (px)
          </label>
          <input
            type="number"
            min="1"
            value={viewportH}
            onChange={(e) => setViewportH(e.target.value)}
            className={baseInputClass}
          />
        </div>
      </div>

      {/* Value + unit selector */}
      <div className="bg-[#111115] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="px-[14px] py-[10px] border-b border-white/[0.06]">
          <span className="text-[10px] font-semibold text-[#52525B] uppercase tracking-wider">
            Convert From
          </span>
        </div>
        <div className="flex items-center gap-3 px-[14px] py-[12px]">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="0"
            className="flex-1 bg-transparent font-mono text-[20px] text-[#FAFAFA] outline-none"
          />
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value as Unit)}
            className="bg-[#222228] border border-white/[0.06] text-[#FAFAFA] text-[12px] font-mono rounded-lg px-3 py-[8px] outline-none cursor-pointer"
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-2">
        {results.map(({ unit, value }) => {
          const isSource = unit === fromUnit;
          const isCopied = copied === unit;
          return (
            <div
              key={unit}
              className={`flex items-center gap-3 px-[14px] py-[10px] rounded-xl border transition-all ${
                isSource
                  ? 'bg-[#F97316]/5 border-[#F97316]/20'
                  : 'bg-[#111115] border-white/[0.06]'
              }`}
            >
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider w-10 shrink-0 ${
                  isSource ? 'text-[#F97316]' : 'text-[#52525B]'
                }`}
              >
                {unit}
              </span>
              <span className="flex-1 font-mono text-[14px] text-[#FAFAFA]">
                {value ? `${value}${unit}` : <span className="text-[#52525B]">-</span>}
              </span>
              <button
                onClick={() => value && handleCopy(unit, value)}
                disabled={!value}
                className={`shrink-0 text-[10px] font-semibold px-3 py-[6px] rounded-[6px] transition-all ${
                  isCopied
                    ? 'bg-[#22C55E] text-white'
                    : 'bg-[#222228] text-[#A1A1AA] hover:text-[#FAFAFA] disabled:opacity-30'
                }`}
              >
                {isCopied ? 'Copied' : 'Copy'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
