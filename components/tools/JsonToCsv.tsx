'use client';
import { useState } from 'react';

type Row = Record<string, string>;

function flatten(obj: unknown, prefix = ''): Row {
  if (typeof obj !== 'object' || obj === null) return { [prefix || 'value']: String(obj ?? '') };
  return Object.entries(obj as Record<string, unknown>).reduce<Row>((acc, [k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(acc, flatten(v, key));
    } else {
      acc[key] = v === null || v === undefined ? '' : String(v);
    }
    return acc;
  }, {});
}

function escape(v: string) {
  return `"${v.replace(/"/g, '""')}"`;
}

export default function JsonToCsv() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const convert = () => {
    setError('');
    try {
      const parsed = JSON.parse(input.trim());
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      if (!arr.length) { setOutput(''); return; }
      const rows = arr.map(r => flatten(r));
      const headers = Array.from(new Set(rows.flatMap(r => Object.keys(r))));
      const csv = [
        headers.map(escape).join(','),
        ...rows.map(r => headers.map(h => escape(r[h] ?? '')).join(',')),
      ].join('\n');
      setOutput(csv);
    } catch {
      setError('Invalid JSON. Make sure input is a valid JSON array or object.');
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    const blob = new Blob([output], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'data.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-[900px] mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.08em] text-t3">JSON Input</label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={'[\n  {"name": "Alice", "age": 30},\n  {"name": "Bob", "age": 25}\n]'}
            rows={16}
            className="w-full rounded-lg border border-white/[0.06] bg-s1 p-3 text-sm text-t1 font-mono resize-none focus:border-white/20 outline-none"
          />
          {error && <p className="mt-1 text-[11px] text-danger">{error}</p>}
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-semibold uppercase tracking-[0.08em] text-t3">CSV Output</label>
            <div className="flex gap-3">
              {output && <>
                <button onClick={copy} className="text-[11px] text-t2 hover:text-t1 transition-colors">{copied ? 'Copied' : 'Copy'}</button>
                <button onClick={download} className="text-[11px] text-t2 hover:text-t1 transition-colors">Download .csv</button>
              </>}
            </div>
          </div>
          <textarea
            value={output}
            readOnly
            rows={16}
            placeholder="CSV will appear here..."
            className="w-full rounded-lg border border-white/[0.06] bg-s1 p-3 text-sm text-t1 font-mono resize-none outline-none"
          />
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button onClick={convert} className="px-4 py-2 rounded-lg bg-ac text-white text-sm font-semibold hover:bg-ac-hover transition-colors">
          Convert to CSV
        </button>
        <button onClick={() => { setInput(''); setOutput(''); setError(''); }} className="px-4 py-2 rounded-lg border border-white/10 text-t2 text-sm hover:border-white/20 hover:text-t1 transition-colors">
          Clear
        </button>
      </div>
    </div>
  );
}
