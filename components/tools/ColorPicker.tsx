'use client';

import { useState, useCallback } from 'react';

export default function ColorPicker() {
  const [hex, setHex] = useState<string>('#F97316');
  const [rgb, setRgb] = useState<[number, number, number]>([249, 115, 22]);
  const [hsl, setHsl] = useState<[number, number, number]>([25, 97, 53]);

  const hexToRgb = useCallback((hexColor: string): [number, number, number] | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColor);
    return result
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : null;
  }, []);

  const rgbToHex = useCallback((r: number, g: number, b: number): string => {
    return (
      '#' +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        })
        .join('')
        .toUpperCase()
    );
  }, []);

  const rgbToHsl = useCallback((r: number, g: number, b: number): [number, number, number] => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  }, []);

  const hslToRgb = useCallback((h: number, s: number, l: number): [number, number, number] => {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }, []);

  const handleHexChange = (value: string) => {
    setHex(value);
    if (value.length === 7 && value.startsWith('#')) {
      const newRgb = hexToRgb(value);
      if (newRgb) {
        setRgb(newRgb);
        setHsl(rgbToHsl(newRgb[0], newRgb[1], newRgb[2]));
      }
    }
  };

  const handleRgbChange = (index: number, value: number) => {
    const newRgb: [number, number, number] = [...rgb];
    newRgb[index] = Math.min(255, Math.max(0, value));
    setRgb(newRgb);
    setHex(rgbToHex(newRgb[0], newRgb[1], newRgb[2]));
    setHsl(rgbToHsl(newRgb[0], newRgb[1], newRgb[2]));
  };

  const handleHslChange = (index: number, value: number) => {
    const newHsl: [number, number, number] = [...hsl];
    newHsl[index] = Math.min(index === 0 ? 360 : 100, Math.max(0, value));
    setHsl(newHsl);
    const newRgb = hslToRgb(newHsl[0], newHsl[1], newHsl[2]);
    setRgb(newRgb);
    setHex(rgbToHex(newRgb[0], newRgb[1], newRgb[2]));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
      {/* Color Preview */}
      <div
        className="w-full h-20 rounded-xl border border-white/10 transition-colors"
        style={{ backgroundColor: hex }}
      />

      {/* HEX Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-[#FAFAFA]">HEX</label>
          <button
            onClick={() => copyToClipboard(hex)}
            className="text-xs px-2 py-1 bg-[#18181C] border border-white/10 rounded hover:border-white/20 text-[#A1A1AA] transition-colors"
          >
            Copy
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="w-5 h-5 rounded-full border border-white/10 flex-shrink-0"
            style={{ backgroundColor: hex }}
          />
          <input
            type="text"
            value={hex}
            onChange={(e) => handleHexChange(e.target.value)}
            className="flex-1 text-sm font-mono bg-[#18181C] border border-white/10 rounded-lg px-3 py-2 text-[#FAFAFA] placeholder-[#52525B] focus:outline-none focus:border-[#F97316]"
            placeholder="#F97316"
          />
        </div>
      </div>

      {/* RGB Inputs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-[#FAFAFA]">RGB</label>
          <button
            onClick={() => copyToClipboard(`rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`)}
            className="text-xs px-2 py-1 bg-[#18181C] border border-white/10 rounded hover:border-white/20 text-[#A1A1AA] transition-colors"
          >
            Copy
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {['R', 'G', 'B'].map((label, idx) => (
            <div key={idx}>
              <label className="text-xs text-[#A1A1AA] block mb-1">{label}</label>
              <input
                type="number"
                min="0"
                max="255"
                value={rgb[idx]}
                onChange={(e) => handleRgbChange(idx, parseInt(e.target.value) || 0)}
                className="w-full text-sm font-mono bg-[#18181C] border border-white/10 rounded-lg px-3 py-2 text-[#FAFAFA] focus:outline-none focus:border-[#F97316]"
              />
            </div>
          ))}
        </div>
      </div>

      {/* HSL Inputs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-[#FAFAFA]">HSL</label>
          <button
            onClick={() => copyToClipboard(`hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`)}
            className="text-xs px-2 py-1 bg-[#18181C] border border-white/10 rounded hover:border-white/20 text-[#A1A1AA] transition-colors"
          >
            Copy
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {['H', 'S', 'L'].map((label, idx) => (
            <div key={idx}>
              <label className="text-xs text-[#A1A1AA] block mb-1">
                {label} {idx === 0 ? '(0-360)' : '(0-100)'}
              </label>
              <input
                type="number"
                min="0"
                max={idx === 0 ? 360 : 100}
                value={hsl[idx]}
                onChange={(e) => handleHslChange(idx, parseInt(e.target.value) || 0)}
                className="w-full text-sm font-mono bg-[#18181C] border border-white/10 rounded-lg px-3 py-2 text-[#FAFAFA] focus:outline-none focus:border-[#F97316]"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
