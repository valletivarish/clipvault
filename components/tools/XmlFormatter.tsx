'use client';
import { useState } from 'react';

function formatXml(xml: string): string {
  let indent = 0;
  const lines: string[] = [];
  const tokens = xml
    .replace(/>\s*</g, '>\n<')
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);

  for (const token of tokens) {
    if (token.startsWith('</')) indent = Math.max(0, indent - 1);
    lines.push('  '.repeat(indent) + token);
    if (
      token.startsWith('<') &&
      !token.startsWith('</') &&
      !token.endsWith('/>') &&
      !token.startsWith('<?') &&
      !token.startsWith('<!') &&
      !token.includes('</')
    ) {
      indent++;
    }
  }
  return lines.join('\n');
}

export default function XmlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const validate = (xml: string): string | null => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml.trim(), 'application/xml');
    const err = doc.querySelector('parsererror');
    return err ? (err.textContent?.split('\n').slice(0, 2).join(' ') ?? 'Parse error') : null;
  };

  const format = () => {
    setError('');
    const err = validate(input.trim());
    if (err) { setError(err); setOutput(''); return; }
    setOutput(formatXml(input.trim()));
  };

  const minify = () => {
    setError('');
    const err = validate(input.trim());
    if (err) { setError(err); setOutput(''); return; }
    setOutput(input.replace(/>\s+</g, '><').replace(/\s{2,}/g, ' ').trim());
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="w-full max-w-[900px] mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.08em] text-t3">XML Input</label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={'<root>\n  <item id="1">Hello</item>\n  <item id="2">World</item>\n</root>'}
            rows={16}
            className="w-full rounded-lg border border-white/[0.06] bg-s1 p-3 text-sm text-t1 font-mono resize-none focus:border-white/20 outline-none"
          />
          {error && <p className="mt-1 text-[11px] text-danger">{error}</p>}
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-semibold uppercase tracking-[0.08em] text-t3">Output</label>
            {output && <button onClick={copy} className="text-[11px] text-t2 hover:text-t1 transition-colors">{copied ? 'Copied' : 'Copy'}</button>}
          </div>
          <textarea
            value={output}
            readOnly
            rows={16}
            placeholder="Formatted XML will appear here..."
            className="w-full rounded-lg border border-white/[0.06] bg-s1 p-3 text-sm text-t1 font-mono resize-none outline-none"
          />
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button onClick={format} className="px-4 py-2 rounded-lg bg-ac text-white text-sm font-semibold hover:bg-ac-hover transition-colors">Format</button>
        <button onClick={minify} className="px-4 py-2 rounded-lg border border-white/10 text-t2 text-sm hover:border-white/20 hover:text-t1 transition-colors">Minify</button>
        <button onClick={() => { setInput(''); setOutput(''); setError(''); }} className="px-4 py-2 rounded-lg border border-white/10 text-t2 text-sm hover:border-white/20 hover:text-t1 transition-colors">Clear</button>
      </div>
    </div>
  );
}
