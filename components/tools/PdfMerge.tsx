'use client';
import { useState, useCallback } from 'react';

interface PdfFile {
  name: string;
  bytes: ArrayBuffer;
}

export default function PdfMerge() {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [merging, setMerging] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  const addFiles = useCallback((incoming: FileList | File[]) => {
    setError('');
    const pdfs = Array.from(incoming).filter(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
    if (!pdfs.length) { setError('Please select PDF files only.'); return; }
    Promise.all(pdfs.map(f => f.arrayBuffer())).then(buffers => {
      setFiles(prev => [...prev, ...buffers.map((b, i) => ({ name: pdfs[i].name, bytes: b }))]);
    });
  }, []);

  const remove = (i: number) => setFiles(prev => prev.filter((_, idx) => idx !== i));
  const moveUp = (i: number) => { if (i === 0) return; setFiles(prev => { const a = [...prev]; [a[i-1], a[i]] = [a[i], a[i-1]]; return a; }); };
  const moveDown = (i: number) => { if (i === files.length - 1) return; setFiles(prev => { const a = [...prev]; [a[i], a[i+1]] = [a[i+1], a[i]]; return a; }); };

  const merge = async () => {
    if (files.length < 2) { setError('Add at least 2 PDF files to merge.'); return; }
    setMerging(true);
    setError('');
    try {
      const { PDFDocument } = await import('pdf-lib');
      const merged = await PDFDocument.create();
      for (const file of files) {
        const doc = await PDFDocument.load(file.bytes);
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach(p => merged.addPage(p));
      }
      const bytes = await merged.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'merged.pdf'; a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Failed to merge PDFs. Make sure the files are valid and not password-protected.');
    } finally {
      setMerging(false);
    }
  };

  return (
    <div className="w-full max-w-[600px] mx-auto">
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors mb-4 ${
          dragging ? 'border-ac bg-ac/[0.04]' : 'border-white/10 hover:border-white/20'
        }`}
        onClick={() => document.getElementById('pdf-input')?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
      >
        <input
          id="pdf-input"
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={e => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }}
        />
        <div className="text-t3 text-sm mb-1">Drop PDF files here or click to upload</div>
        <div className="text-t3 text-[11px]">You can add multiple files at once</div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2 mb-4">
          <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-t3 mb-2">
            Files to merge ({files.length}) - drag to reorder
          </div>
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-2 bg-s2 border border-white/10 rounded-xl px-4 py-3">
              <span className="text-[10px] font-bold text-t3 font-mono w-4 shrink-0">{i + 1}</span>
              <span className="flex-1 text-sm text-t1 truncate">{f.name}</span>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => moveUp(i)} disabled={i === 0} className="px-2 py-1 text-[11px] text-t3 hover:text-t1 disabled:opacity-30 transition-colors">Up</button>
                <button onClick={() => moveDown(i)} disabled={i === files.length - 1} className="px-2 py-1 text-[11px] text-t3 hover:text-t1 disabled:opacity-30 transition-colors">Down</button>
                <button onClick={() => remove(i)} className="px-2 py-1 text-[11px] text-danger hover:text-red-400 transition-colors">Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="mb-3 text-[11px] text-danger">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={merge}
          disabled={merging || files.length < 2}
          className="flex-1 py-2.5 rounded-lg bg-ac text-white text-sm font-semibold hover:bg-ac-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {merging ? 'Merging...' : `Merge ${files.length} PDFs`}
        </button>
        {files.length > 0 && (
          <button onClick={() => setFiles([])} className="px-4 py-2.5 rounded-lg border border-white/10 text-t2 text-sm hover:border-white/20 hover:text-t1 transition-colors">
            Clear
          </button>
        )}
      </div>

      <p className="mt-3 text-[11px] text-t3">All processing happens in your browser. PDFs are never uploaded.</p>
    </div>
  );
}
