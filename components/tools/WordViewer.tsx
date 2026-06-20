'use client';
import { useState, useCallback, useRef } from 'react';

export default function WordViewer() {
  const [html, setHtml] = useState('');
  const [filename, setFilename] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.docx')) {
      setError('Only .docx files are supported.');
      return;
    }
    setLoading(true);
    setError('');
    setHtml('');
    try {
      const mammoth = await import('mammoth');
      const buffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
      setHtml(result.value);
      setFilename(file.name);
    } catch {
      setError('Failed to read file. Make sure it is a valid .docx document.');
    } finally {
      setLoading(false);
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  }, [loadFile]);

  const copyHtml = () => {
    navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const downloadHtml = () => {
    const full = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:system-ui,sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;line-height:1.6}h1,h2,h3{margin-top:1.5em}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:6px 10px}</style></head><body>${html}</body></html>`;
    const blob = new Blob([full], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename.replace('.docx', '.html');
    a.click();
  };

  const reset = () => { setHtml(''); setFilename(''); setError(''); };

  return (
    <div className="w-full max-w-[860px] mx-auto">
      {!html && !loading && (
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
            dragging ? 'border-ac bg-ac/[0.04]' : 'border-white/10 hover:border-white/20'
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".docx"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) loadFile(f); e.target.value = ''; }}
          />
          <div className="text-t3 text-sm mb-1">Drop a .docx file here or click to upload</div>
          <div className="text-t3 text-[11px]">Microsoft Word documents (.docx) only</div>
        </div>
      )}

      {loading && (
        <div className="text-center py-16 text-t3 text-sm">Reading document...</div>
      )}

      {error && (
        <div className="mt-3 text-[11px] text-danger">{error}</div>
      )}

      {html && (
        <>
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-t2 truncate max-w-xs">{filename}</div>
            <div className="flex gap-3 shrink-0">
              <button onClick={copyHtml} className="text-[11px] text-t2 hover:text-t1 transition-colors">{copied ? 'Copied HTML' : 'Copy HTML'}</button>
              <button onClick={downloadHtml} className="text-[11px] text-t2 hover:text-t1 transition-colors">Download HTML</button>
              <button onClick={reset} className="text-[11px] text-danger hover:text-red-400 transition-colors">Close</button>
            </div>
          </div>

          <div
            className="bg-white text-gray-900 rounded-xl p-8 overflow-auto prose max-w-none"
            style={{ minHeight: '400px' }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </>
      )}

      {!html && !loading && (
        <p className="mt-4 text-[11px] text-t3 text-center">Files are never uploaded. Everything runs in your browser.</p>
      )}
    </div>
  );
}
