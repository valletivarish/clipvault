'use client';
import { useState, useRef, useCallback } from 'react';

export default function ImageResize() {
  const [src, setSrc] = useState<string | null>(null);
  const [origW, setOrigW] = useState(0);
  const [origH, setOrigH] = useState(0);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [quality, setQuality] = useState(90);
  const [lock, setLock] = useState(true);
  const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setOrigW(img.width);
      setOrigH(img.height);
      setWidth(String(img.width));
      setHeight(String(img.height));
      setSrc(url);
    };
    img.src = url;
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  }, []);

  const onWidthChange = (v: string) => {
    setWidth(v);
    if (lock && origW && origH) {
      const w = parseInt(v);
      if (!isNaN(w)) setHeight(String(Math.round(w * origH / origW)));
    }
  };

  const onHeightChange = (v: string) => {
    setHeight(v);
    if (lock && origW && origH) {
      const h = parseInt(v);
      if (!isNaN(h)) setWidth(String(Math.round(h * origW / origH)));
    }
  };

  const download = () => {
    if (!src) return;
    const w = parseInt(width) || origW;
    const h = parseInt(height) || origH;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, w, h);
      const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/webp' ? 'webp' : 'png';
      const q = format === 'image/png' ? 1 : quality / 100;
      canvas.toBlob(blob => {
        if (!blob) return;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `resized.${ext}`;
        a.click();
      }, format, q);
    };
    img.src = src;
  };

  return (
    <div className="w-full max-w-[700px] mx-auto">
      {!src ? (
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
            dragging ? 'border-ac bg-ac/[0.04]' : 'border-white/10 hover:border-white/20'
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) loadFile(f); }} />
          <div className="text-t3 text-sm mb-1">Drop an image here or click to upload</div>
          <div className="text-t3 text-[11px]">JPG, PNG, WEBP, GIF supported</div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-start gap-4">
            <img src={src} alt="Preview" className="w-32 h-32 object-contain rounded-lg border border-white/10 bg-s2" />
            <div className="text-xs text-t3 mt-1 space-y-1">
              <div>Original: {origW} x {origH}px</div>
              <button onClick={() => { setSrc(null); setWidth(''); setHeight(''); }} className="text-danger hover:text-red-400 transition-colors mt-2">Remove</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-t3">Width (px)</label>
              <input type="number" value={width} onChange={e => onWidthChange(e.target.value)} className="w-full rounded-lg border border-white/[0.06] bg-s1 px-3 py-2 text-sm text-t1 font-mono outline-none focus:border-white/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-t3">Height (px)</label>
              <input type="number" value={height} onChange={e => onHeightChange(e.target.value)} className="w-full rounded-lg border border-white/[0.06] bg-s1 px-3 py-2 text-sm text-t1 font-mono outline-none focus:border-white/20" />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-t2">
            <input type="checkbox" checked={lock} onChange={e => setLock(e.target.checked)} className="accent-ac" />
            Lock aspect ratio
          </label>

          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-t3">Output Format</label>
            <div className="flex gap-2">
              {(['image/jpeg', 'image/png', 'image/webp'] as const).map(f => (
                <button key={f} onClick={() => setFormat(f)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${format === f ? 'bg-ac border-ac text-white' : 'border-white/10 text-t2 hover:border-white/20 hover:text-t1'}`}>
                  {f.split('/')[1].toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {format !== 'image/png' && (
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-t3">Quality: {quality}%</label>
              <input type="range" min={10} max={100} value={quality} onChange={e => setQuality(Number(e.target.value))} className="w-full accent-ac" />
            </div>
          )}

          <button onClick={download} className="w-full py-2.5 rounded-lg bg-ac text-white text-sm font-semibold hover:bg-ac-hover transition-colors">
            Download Resized Image
          </button>
        </div>
      )}
    </div>
  );
}
