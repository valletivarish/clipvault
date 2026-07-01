'use client';
import { useState } from 'react';

type Lang = 'HTML' | 'CSS' | 'JS';

function minifyHtml(code: string): string {
  return code
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .replace(/\s*(=)\s*/g, '$1')
    .trim();
}

function minifyCss(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,>~+])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}

function minifyJs(code: string): string {
  return code
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([=+\-*/<>!&|?:;,{}()[\]])\s*/g, '$1')
    .trim();
}

export default function CodeMinifier() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [lang, setLang] = useState<Lang>('HTML');
  const [copied, setCopied] = useState(false);

  const minify = () => {
    const fn = lang === 'HTML' ? minifyHtml : lang === 'CSS' ? minifyCss : minifyJs;
    setOutput(fn(input));
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const savings = output && input ? Math.round((1 - output.length / input.length) * 100) : 0;

  return (
    <div className="w-full max-w-[900px] mx-auto">
      <div className="flex gap-2 mb-4">
        {(['HTML', 'CSS', 'JS'] as Lang[]).map(l => (
          <button
            key={l}
            onClick={() => { setLang(l); setOutput(''); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              lang === l ? 'bg-ac border-ac text-white' : 'border-white/10 text-t2 hover:border-white/20 hover:text-t1'
            }`}
          >
            {l}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="mb-2 block text-[10px] font-semibold tracking-[0.08em] text-t3">Input</label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={16}
            placeholder={`Paste your ${lang} here...`}
            className="w-full rounded-lg border border-white/[0.06] bg-s1 p-3 text-sm text-t1 font-mono resize-none focus:border-white/20 outline-none"
          />
          <div className="mt-1 text-[10px] text-t3">{input.length.toLocaleString()} chars</div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-semibold tracking-[0.08em] text-t3">
              Minified{' '}
              {savings > 0 && <span className="text-ok normal-case tracking-normal font-medium ml-1">{savings}% smaller</span>}
            </label>
            {output && <button onClick={copy} className="text-[11px] text-t2 hover:text-t1 transition-colors">{copied ? 'Copied' : 'Copy'}</button>}
          </div>
          <textarea
            value={output}
            readOnly
            rows={16}
            placeholder="Minified output will appear here..."
            className="w-full rounded-lg border border-white/[0.06] bg-s1 p-3 text-sm text-t1 font-mono resize-none outline-none"
          />
          {output && <div className="mt-1 text-[10px] text-t3">{output.length.toLocaleString()} chars</div>}
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button onClick={minify} className="px-4 py-2 rounded-lg bg-ac text-white text-sm font-semibold hover:bg-ac-hover transition-colors">Minify</button>
        <button onClick={() => { setInput(''); setOutput(''); }} className="px-4 py-2 rounded-lg border border-white/10 text-t2 text-sm hover:border-white/20 hover:text-t1 transition-colors">Clear</button>
      </div>
    </div>
  );
}
