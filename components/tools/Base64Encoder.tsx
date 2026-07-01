'use client';

import { useState } from 'react';

export default function Base64Encoder() {
  const [activeTab, setActiveTab] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const handleEncode = (text: string) => {
    setInput(text);
    try {
      setError('');
      if (!text) {
        setOutput('');
        return;
      }
      const bytes = new TextEncoder().encode(text);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      setOutput(btoa(binary));
    } catch (err) {
      setError('Encoding failed');
      setOutput('');
    }
  };

  const handleDecode = (text: string) => {
    setInput(text);
    try {
      setError('');
      if (!text) {
        setOutput('');
        return;
      }
      const binary = atob(text);
      const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
      setOutput(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    } catch (err) {
      setError('Invalid Base64');
      setOutput('');
    }
  };

  const copyToClipboard = () => {
    if (output) {
      navigator.clipboard.writeText(output);
    }
  };

  return (
    <div className="w-full">
      {/* Mode Selector */}
      <select
        value={activeTab}
        onChange={(e) => {
          setActiveTab(e.target.value as 'encode' | 'decode');
          setInput('');
          setOutput('');
          setError('');
        }}
        className="mb-4 bg-[#18181C] border border-white/10 rounded-[7px] px-4 py-2 text-[#FAFAFA] text-[11px] font-semibold outline-none focus:border-[#F97316]/40 transition-colors"
      >
        <option value="encode">Encode</option>
        <option value="decode">Decode</option>
      </select>

      {/* Content */}
      <div className="grid grid-cols-2 gap-4">
        {/* Input */}
        <div className="bg-[#111115] border border-white/[0.06] rounded-xl overflow-hidden">
          <textarea
            value={input}
            onChange={(e) =>
              activeTab === 'encode'
                ? handleEncode(e.target.value)
                : handleDecode(e.target.value)
            }
            placeholder={activeTab === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
            className="w-full bg-transparent text-[#A1A1AA] font-mono text-[11px] leading-[1.75] outline-none resize-none px-[14px] py-[14px] min-h-[160px]"
          />
        </div>

        {/* Output */}
        <div className="bg-[#111115] border border-white/[0.06] rounded-xl overflow-hidden flex flex-col">
          <textarea
            value={output}
            readOnly
            placeholder="Output will appear here..."
            className="flex-1 bg-transparent text-[#A1A1AA] font-mono text-[11px] leading-[1.75] outline-none resize-none px-[14px] py-[14px] min-h-[160px]"
          />
          {error && (
            <div className="px-[14px] py-2 text-[10px] text-[#F43F5E] bg-[#09090B] border-t border-white/[0.06]">
              {error}
            </div>
          )}
          {!error && output && (
            <div className="px-[14px] py-3 bg-[#09090B] border-t border-white/[0.06] flex gap-2">
              <button
                onClick={copyToClipboard}
                className="bg-[#F97316] text-white rounded-[7px] px-3 py-[9px] text-[10px] font-semibold hover:bg-[#EA8C0A] transition-all"
              >
                Copy
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
