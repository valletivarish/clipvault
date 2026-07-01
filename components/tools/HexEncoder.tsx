'use client';

import { useState } from 'react';

export default function HexEncoder() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [error, setError] = useState('');

  const handleEncode = (text: string) => {
    setError('');
    if (!text.trim()) {
      setOutput('');
      return;
    }

    try {
      const hex = text
        .split('')
        .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(' ');
      setOutput(hex);
    } catch (err) {
      setError('Encoding failed');
    }
  };

  const handleDecode = (hex: string) => {
    setError('');
    if (!hex.trim()) {
      setOutput('');
      return;
    }

    try {
      const hexValues = hex.split(/\s+/).filter((h) => h.length > 0);

      for (const h of hexValues) {
        if (!/^[0-9a-fA-F]{2}$/.test(h)) {
          setError(`Invalid hex value: ${h}`);
          return;
        }
      }

      const text = hexValues
        .map((h) => String.fromCharCode(parseInt(h, 16)))
        .join('');
      setOutput(text);
    } catch (err) {
      setError('Decoding failed - invalid hex format');
    }
  };

  const handleConvert = () => {
    if (mode === 'encode') {
      handleEncode(input);
    } else {
      handleDecode(input);
    }
  };

  const handleModeChange = (newMode: 'encode' | 'decode') => {
    setMode(newMode);
    setInput('');
    setOutput('');
    setError('');
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-s1 rounded-lg border border-white/10">
      <h2 className="text-lg font-semibold text-t1 mb-6">Hex Encode / Decode</h2>

      <div className="mb-6">
        <select
          value={mode}
          onChange={(e) => handleModeChange(e.target.value as 'encode' | 'decode')}
          className="w-full mb-6 bg-s2 border border-white/10 rounded-[7px] px-3 py-2 text-t1 text-sm font-semibold outline-none focus:border-ac/40 transition-colors"
        >
          <option value="encode">Encode</option>
          <option value="decode">Decode</option>
        </select>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-t2 mb-2">
              {mode === 'encode' ? 'Text' : 'Hex'}
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === 'encode'
                  ? 'Enter text to encode'
                  : 'Enter hex values (space-separated)'
              }
              rows={8}
              className="w-full bg-s2 border border-white/10 rounded-[7px] px-3 py-2 text-t1 text-sm font-mono outline-none focus:border-ac/40 transition-colors resize-none"
            />
            <button
              onClick={() => copyToClipboard(input)}
              disabled={!input}
              className="mt-2 border border-white/10 text-t2 px-3 py-1.5 rounded-[7px] text-xs hover:border-white/20 hover:text-t1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Copy
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-t2 mb-2">
              {mode === 'encode' ? 'Hex' : 'Text'}
            </label>
            <textarea
              value={output}
              readOnly
              placeholder="Output will appear here"
              rows={8}
              className="w-full bg-s2 border border-white/10 rounded-[7px] px-3 py-2 text-t1 text-sm font-mono outline-none resize-none"
            />
            <button
              onClick={() => copyToClipboard(output)}
              disabled={!output}
              className="mt-2 border border-white/10 text-t2 px-3 py-1.5 rounded-[7px] text-xs hover:border-white/20 hover:text-t1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Copy
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-s2 border border-danger/30 rounded-[7px]">
          <p className="text-danger text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleConvert}
          className="bg-ac text-white px-4 py-2 rounded-[7px] text-sm font-semibold hover:bg-[#EA6C0A] transition-colors"
        >
          {mode === 'encode' ? 'Encode' : 'Decode'}
        </button>
        <button
          onClick={handleClear}
          className="border border-white/10 text-t2 px-4 py-2 rounded-[7px] text-sm hover:border-white/20 hover:text-t1 transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
