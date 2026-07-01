'use client';

import { useState } from 'react';

export default function PdfToBase64() {
  const [file, setFile] = useState<File | null>(null);
  const [dataUri, setDataUri] = useState('');
  const [raw, setRaw] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  const handleFile = (f: File | null | undefined) => {
    if (!f) return;
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
      setError('Please choose a PDF file');
      return;
    }
    setError('');
    setFile(f);
    setDataUri('');
    setRaw('');
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = (e.target?.result as string) || '';
      setDataUri(result);
      setRaw(result.includes(',') ? result.split(',')[1] : result);
    };
    reader.onerror = () => setError('Failed to read the PDF');
    reader.readAsDataURL(f);
  };

  const copy = (text: string, which: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(''), 1500);
  };

  return (
    <div className="w-full space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleFile(e.dataTransfer.files?.[0]); }}
        className="border-2 border-dashed border-white/[0.15] rounded-xl p-8 bg-[#111115] text-center hover:border-white/[0.25] transition-colors"
      >
        <label className="cursor-pointer flex flex-col items-center gap-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#A1A1AA]">
            <path d="M12 3v12M8 7l4-4 4 4" />
            <path d="M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2" />
          </svg>
          <div>
            <p className="text-[#FAFAFA] text-sm font-semibold">Drop a PDF or click to select</p>
            <p className="text-[#52525B] text-xs mt-1">Converted in your browser - nothing uploaded</p>
          </div>
          <input type="file" accept="application/pdf,.pdf" onChange={(e) => handleFile(e.target.files?.[0])} className="hidden" />
        </label>
      </div>

      {file && (
        <div className="bg-[#111115] border border-white/[0.06] rounded-xl p-4">
          <p className="text-[#A1A1AA] text-sm font-mono">
            File: <span className="text-[#FAFAFA]">{file.name}</span>
          </p>
          <p className="text-[#A1A1AA] text-sm font-mono mt-1">
            Size: <span className="text-[#FAFAFA]">{(file.size / 1024).toFixed(2)} KB</span>
          </p>
        </div>
      )}

      {dataUri && (
        <div className="space-y-2">
          <label className="block text-[10px] font-semibold tracking-[0.08em] text-[#52525B]">
            Data URI (with prefix)
          </label>
          <div className="bg-[#111115] border border-white/[0.06] rounded-[7px] p-3 max-h-[150px] overflow-y-auto">
            <p className="text-[#F97316] text-xs font-mono break-all select-all">{dataUri}</p>
          </div>
          <button onClick={() => copy(dataUri, 'uri')} className="px-4 py-[9px] bg-[#F97316] text-white rounded-[7px] text-sm font-semibold hover:bg-[#EA6C0A] transition-colors">
            {copied === 'uri' ? 'Copied' : 'Copy data URI'}
          </button>
        </div>
      )}

      {raw && (
        <div className="space-y-2">
          <label className="block text-[10px] font-semibold tracking-[0.08em] text-[#52525B]">
            Raw Base64 (no prefix)
          </label>
          <div className="bg-[#111115] border border-white/[0.06] rounded-[7px] p-3 max-h-[150px] overflow-y-auto">
            <p className="text-[#F97316] text-xs font-mono break-all select-all">{raw}</p>
          </div>
          <button onClick={() => copy(raw, 'raw')} className="px-4 py-[9px] bg-[#F97316] text-white rounded-[7px] text-sm font-semibold hover:bg-[#EA6C0A] transition-colors">
            {copied === 'raw' ? 'Copied' : 'Copy raw Base64'}
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 bg-[#18181C] border border-[#F43F5E]/30 rounded-[7px]">
          <p className="text-[#F43F5E] text-sm font-mono">{error}</p>
        </div>
      )}
    </div>
  );
}
