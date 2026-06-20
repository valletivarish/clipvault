'use client';
import { useState, useCallback, useRef } from 'react';

interface SheetData {
  name: string;
  rows: string[][];
}

export default function ExcelViewer() {
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [activeSheet, setActiveSheet] = useState(0);
  const [filename, setFilename] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback(async (file: File) => {
    const ok = file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv');
    if (!ok) { setError('Supported formats: .xlsx, .xls, .csv'); return; }
    setLoading(true);
    setError('');
    setSheets([]);
    try {
      const XLSX = await import('xlsx');
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const parsed: SheetData[] = workbook.SheetNames.map(name => {
        const ws = workbook.Sheets[name];
        const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: '' });
        return { name, rows: rows as string[][] };
      });
      setSheets(parsed);
      setActiveSheet(0);
      setFilename(file.name);
    } catch {
      setError('Failed to read file. Make sure it is a valid Excel or CSV file.');
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

  const downloadCsv = () => {
    const sheet = sheets[activeSheet];
    if (!sheet) return;
    const csv = sheet.rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${sheet.name}.csv`;
    a.click();
  };

  const downloadXlsx = async () => {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    sheets.forEach(s => {
      const ws = XLSX.utils.aoa_to_sheet(s.rows);
      XLSX.utils.book_append_sheet(wb, ws, s.name);
    });
    XLSX.writeFile(wb, filename || 'export.xlsx');
  };

  const reset = () => { setSheets([]); setFilename(''); setError(''); };

  const current = sheets[activeSheet];
  const headers = current?.rows[0] ?? [];
  const body = current?.rows.slice(1) ?? [];

  return (
    <div className="w-full max-w-[1000px] mx-auto">
      {!sheets.length && !loading && (
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
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) loadFile(f); e.target.value = ''; }}
          />
          <div className="text-t3 text-sm mb-1">Drop a spreadsheet here or click to upload</div>
          <div className="text-t3 text-[11px]">.xlsx, .xls, .csv supported</div>
        </div>
      )}

      {loading && <div className="text-center py-16 text-t3 text-sm">Reading file...</div>}
      {error && <div className="mt-3 text-[11px] text-danger">{error}</div>}

      {sheets.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-t2 truncate max-w-[160px]">{filename}</span>
              {sheets.length > 1 && sheets.map((s, i) => (
                <button
                  key={s.name}
                  onClick={() => setActiveSheet(i)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                    i === activeSheet ? 'bg-ac border-ac text-white' : 'border-white/10 text-t2 hover:border-white/20 hover:text-t1'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
            <div className="flex gap-3 shrink-0">
              <button onClick={downloadCsv} className="text-[11px] text-t2 hover:text-t1 transition-colors">Download CSV</button>
              <button onClick={downloadXlsx} className="text-[11px] text-t2 hover:text-t1 transition-colors">Download XLSX</button>
              <button onClick={reset} className="text-[11px] text-danger hover:text-red-400 transition-colors">Close</button>
            </div>
          </div>

          <div className="text-[10px] text-t3 mb-2">
            {current?.rows.length ?? 0} rows x {headers.length} columns
          </div>

          <div className="overflow-auto rounded-xl border border-white/10" style={{ maxHeight: '520px' }}>
            <table className="w-full text-xs border-collapse">
              <thead className="sticky top-0 bg-s3 z-10">
                <tr>
                  <th className="px-3 py-2 text-left text-t3 font-semibold border-b border-white/10 w-10 shrink-0">#</th>
                  {headers.map((h, i) => (
                    <th key={i} className="px-3 py-2 text-left text-t2 font-semibold border-b border-white/10 whitespace-nowrap">
                      {String(h) || <span className="text-t3">{String.fromCharCode(65 + i)}</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((row, ri) => (
                  <tr key={ri} className="hover:bg-s2 transition-colors">
                    <td className="px-3 py-1.5 text-t3 border-b border-white/[0.04] font-mono">{ri + 1}</td>
                    {headers.map((_, ci) => (
                      <td key={ci} className="px-3 py-1.5 text-t1 border-b border-white/[0.04] whitespace-nowrap">
                        {String(row[ci] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!sheets.length && !loading && (
        <p className="mt-4 text-[11px] text-t3 text-center">Files are never uploaded. Everything runs in your browser.</p>
      )}
    </div>
  );
}
