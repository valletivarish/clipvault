'use client';

import { useState } from 'react';

export default function FileBase64() {
  const [activeTab, setActiveTab] = useState<'encode' | 'decode'>('encode');
  const [file, setFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState('');
  const [rawBase64, setRawBase64] = useState('');
  const [base64Input, setBase64Input] = useState('');
  const [filename, setFilename] = useState('output.bin');
  const [mimeType, setMimeType] = useState('application/octet-stream');
  const [decodedSize, setDecodedSize] = useState(0);
  const [error, setError] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleFileEncode = () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        setFileBase64(result);

        const base64Part = result.includes(',') ? result.split(',')[1] : result;
        setRawBase64(base64Part);
        setError('');
      } catch (err) {
        setError('Failed to encode file');
        setFileBase64('');
        setRawBase64('');
      }
    };

    reader.onerror = () => {
      setError('Failed to read file');
      setFileBase64('');
      setRawBase64('');
    };
  };

  const handleBase64Decode = () => {
    if (!base64Input.trim()) {
      setError('Please enter Base64 string');
      return;
    }

    try {
      setError('');

      let base64String = base64Input.trim();
      let extractedMime = mimeType;

      if (base64String.includes(',')) {
        const parts = base64String.split(',');
        const header = parts[0];
        base64String = parts[1];

        const mimeMatch = header.match(/data:([^;]+)/);
        if (mimeMatch) {
          extractedMime = mimeMatch[1];
          setMimeType(extractedMime);
        }
      }

      const bytes = Uint8Array.from(atob(base64String), (c) => c.charCodeAt(0));
      setDecodedSize(bytes.length);
    } catch (err) {
      setError('Invalid Base64 string');
      setDecodedSize(0);
    }
  };

  const handleBase64Download = () => {
    if (!base64Input.trim()) {
      setError('Please enter Base64 string');
      return;
    }

    try {
      setError('');

      let base64String = base64Input.trim();
      let downloadMime = mimeType;

      if (base64String.includes(',')) {
        const parts = base64String.split(',');
        const header = parts[0];
        base64String = parts[1];

        const mimeMatch = header.match(/data:([^;]+)/);
        if (mimeMatch) {
          downloadMime = mimeMatch[1];
        }
      }

      const bytes = Uint8Array.from(atob(base64String), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: downloadMime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to decode Base64 or download file');
    }
  };

  const copyToClipboard = (text: string) => {
    if (text) {
      navigator.clipboard.writeText(text);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      setError('');
    }
  };

  return (
    <div className="w-full">
      {/* Mode Selector */}
      <select
        value={activeTab}
        onChange={(e) => {
          const next = e.target.value as 'encode' | 'decode';
          setActiveTab(next);
          if (next === 'encode') {
            setFile(null);
            setFileBase64('');
            setRawBase64('');
          } else {
            setBase64Input('');
            setFilename('output.bin');
            setMimeType('application/octet-stream');
            setDecodedSize(0);
          }
          setError('');
        }}
        className="mb-4 bg-[#18181C] border border-white/10 rounded-[7px] px-4 py-2 text-[#FAFAFA] text-[11px] font-semibold outline-none focus:border-[#F97316]/40 transition-colors"
      >
        <option value="encode">Encode: File to Base64</option>
        <option value="decode">Decode: Base64 to File</option>
      </select>

      {/* Tab 1: File to Base64 */}
      {activeTab === 'encode' && (
        <div className="space-y-4">
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed border-white/[0.15] rounded-xl p-8 bg-[#111115] text-center hover:border-white/[0.25] transition-colors cursor-pointer"
          >
            <label className="cursor-pointer flex flex-col items-center gap-3">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[#A1A1AA]"
              >
                <path d="M12 3v12M8 7l4-4 4 4" />
                <path d="M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2" />
              </svg>
              <div>
                <p className="text-[#FAFAFA] text-sm font-semibold">
                  Drop file or click to select
                </p>
                <p className="text-[#52525B] text-xs mt-1">Any file type supported</p>
              </div>
              <input
                type="file"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>

          {/* File Info */}
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

          {/* Encode Button */}
          {file && (
            <button
              onClick={handleFileEncode}
              className="w-full px-4 py-[9px] bg-[#F97316] text-white rounded-[7px] text-sm font-semibold hover:bg-[#EA6C0A] transition-colors"
            >
              Convert to Base64
            </button>
          )}

          {/* Full Data URI Output */}
          {fileBase64 && (
            <div className="space-y-2">
              <label className="block text-[10px] font-semibold tracking-[0.08em] text-[#52525B]">
                Full Data URI (with prefix)
              </label>
              <div className="bg-[#111115] border border-white/[0.06] rounded-[7px] p-3 max-h-[150px] overflow-y-auto">
                <p className="text-[#F97316] text-xs font-mono break-all select-all">
                  {fileBase64}
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(fileBase64)}
                className="px-4 py-[9px] bg-[#F97316] text-white rounded-[7px] text-sm font-semibold hover:bg-[#EA6C0A] transition-colors"
              >
                Copy Full URI
              </button>
            </div>
          )}

          {/* Raw Base64 Output */}
          {rawBase64 && (
            <div className="space-y-2">
              <label className="block text-[10px] font-semibold tracking-[0.08em] text-[#52525B]">
                Raw Base64 (no prefix)
              </label>
              <div className="bg-[#111115] border border-white/[0.06] rounded-[7px] p-3 max-h-[150px] overflow-y-auto">
                <p className="text-[#F97316] text-xs font-mono break-all select-all">
                  {rawBase64}
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(rawBase64)}
                className="px-4 py-[9px] bg-[#F97316] text-white rounded-[7px] text-sm font-semibold hover:bg-[#EA6C0A] transition-colors"
              >
                Copy Raw Base64
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Base64 to File */}
      {activeTab === 'decode' && (
        <div className="space-y-4">
          {/* Base64 Input */}
          <div>
            <label className="block text-[10px] font-semibold tracking-[0.08em] text-[#52525B] mb-[6px]">
              Base64 String
            </label>
            <textarea
              value={base64Input}
              onChange={(e) => setBase64Input(e.target.value)}
              onBlur={handleBase64Decode}
              placeholder="Paste Base64 string (with or without data URI prefix)..."
              className="w-full bg-[#18181C] border border-white/10 rounded-[7px] px-3 py-2 text-[#FAFAFA] text-sm font-mono outline-none focus:border-[#F97316]/40 transition-colors resize-none min-h-[120px]"
            />
          </div>

          {/* Filename Input */}
          <div>
            <label className="block text-[10px] font-semibold tracking-[0.08em] text-[#52525B] mb-[6px]">
              Filename
            </label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="e.g., output.png"
              className="w-full bg-[#18181C] border border-white/10 rounded-[7px] px-3 py-2 text-[#FAFAFA] text-sm font-mono outline-none focus:border-[#F97316]/40 transition-colors"
            />
          </div>

          {/* MIME Type Input */}
          <div>
            <label className="block text-[10px] font-semibold tracking-[0.08em] text-[#52525B] mb-[6px]">
              MIME Type
            </label>
            <input
              type="text"
              value={mimeType}
              onChange={(e) => setMimeType(e.target.value)}
              placeholder="e.g., image/png"
              className="w-full bg-[#18181C] border border-white/10 rounded-[7px] px-3 py-2 text-[#FAFAFA] text-sm font-mono outline-none focus:border-[#F97316]/40 transition-colors"
            />
          </div>

          {/* Decoded Size Info */}
          {decodedSize > 0 && (
            <div className="bg-[#111115] border border-white/[0.06] rounded-xl p-4">
              <p className="text-[#A1A1AA] text-sm font-mono">
                Decoded Size: <span className="text-[#FAFAFA]">{decodedSize} bytes</span>
              </p>
              <p className="text-[#A1A1AA] text-sm font-mono mt-1">
                File: <span className="text-[#FAFAFA]">{filename}</span>
              </p>
            </div>
          )}

          {/* Download Button */}
          {base64Input && (
            <button
              onClick={handleBase64Download}
              className="w-full px-4 py-[9px] bg-[#F97316] text-white rounded-[7px] text-sm font-semibold hover:bg-[#EA6C0A] transition-colors"
            >
              Download File
            </button>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-[#18181C] border border-[#F43F5E]/30 rounded-[7px]">
          <p className="text-[#F43F5E] text-sm font-mono">{error}</p>
        </div>
      )}
    </div>
  );
}
