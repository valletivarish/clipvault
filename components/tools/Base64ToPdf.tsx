'use client';

import { useState } from 'react';

export default function Base64ToPdf() {
  const [input, setInput] = useState('');
  const [filename, setFilename] = useState('document.pdf');
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const decode = (): Blob | null => {
    const s = input.trim();
    if (!s) { setError('Paste a Base64 string first'); return null; }
    try {
      let b64 = s;
      if (b64.includes(',')) b64 = b64.split(',')[1];
      b64 = b64.replace(/\s/g, '');
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      // A real PDF starts with the bytes for "%PDF"
      const looksPdf = bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
      if (!looksPdf) { setError('That Base64 does not decode to a PDF (missing %PDF header)'); return null; }
      setError('');
      return new Blob([bytes], { type: 'application/pdf' });
    } catch {
      setError('Invalid Base64 string');
      return null;
    }
  };

  const download = () => {
    const blob = decode();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const preview = () => {
    const blob = decode();
    if (!blob) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(blob));
  };

  return (
    <div className="w-full space-y-4">
      <div>
        <label className="block text-[10px] font-semibold tracking-[0.08em] text-[#52525B] mb-[6px]">
          Base64 string
        </label>
        <textarea
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(''); }}
          placeholder="Paste Base64 of a PDF (with or without the data:application/pdf prefix)..."
          className="w-full bg-[#18181C] border border-white/10 rounded-[7px] px-3 py-2 text-[#FAFAFA] text-sm font-mono outline-none focus:border-[#F97316]/40 transition-colors resize-none min-h-[140px]"
        />
      </div>

      <div>
        <label className="block text-[10px] font-semibold tracking-[0.08em] text-[#52525B] mb-[6px]">
          Filename
        </label>
        <input
          type="text"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          placeholder="document.pdf"
          className="w-full bg-[#18181C] border border-white/10 rounded-[7px] px-3 py-2 text-[#FAFAFA] text-sm font-mono outline-none focus:border-[#F97316]/40 transition-colors"
        />
      </div>

      <div className="flex gap-2">
        <button onClick={download} className="flex-1 px-4 py-[9px] bg-[#F97316] text-white rounded-[7px] text-sm font-semibold hover:bg-[#EA6C0A] transition-colors">
          Download PDF
        </button>
        <button onClick={preview} className="px-4 py-[9px] bg-[#18181C] border border-white/10 text-[#FAFAFA] rounded-[7px] text-sm font-semibold hover:border-white/20 transition-colors">
          Preview
        </button>
      </div>

      {previewUrl && (
        <object data={previewUrl} type="application/pdf" className="w-full h-[420px] rounded-[7px] border border-white/[0.06] bg-[#111115]">
          <p className="p-3 text-[#A1A1AA] text-sm">
            Preview unavailable in this browser. <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-[#F97316] underline">Open the PDF</a> instead.
          </p>
        </object>
      )}

      {error && (
        <div className="p-3 bg-[#18181C] border border-[#F43F5E]/30 rounded-[7px]">
          <p className="text-[#F43F5E] text-sm font-mono">{error}</p>
        </div>
      )}
    </div>
  );
}
