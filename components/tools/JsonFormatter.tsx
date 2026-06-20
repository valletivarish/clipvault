'use client';

import { useState, useRef } from 'react';

export default function JsonFormatter() {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setIsValid(true);
    } catch {
      setIsValid(false);
      setOutput('');
    }
  };

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(output || input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setIsValid(true);
    } catch {
      setIsValid(false);
      setOutput('');
    }
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
    } catch {
      console.error('Failed to read clipboard');
    }
  };

  const inputCharCount = input.length;

  return (
    <div className="w-full max-w-[900px] mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* LEFT COLUMN - INPUT */}
        <div>
          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#52525B]">
            Input
          </label>

          <div className="rounded-xl border border-white/[0.06] bg-[#111115] overflow-hidden">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='{"key": "value"}'
              className="w-full px-[14px] py-[14px] bg-transparent text-[#A1A1AA] font-mono text-[11px] min-h-[130px] resize-none outline-none leading-[1.75]"
            />

            <div className="flex items-center justify-between border-t border-white/[0.06] px-3 py-[9px]">
              <span className="text-[10px] text-[#52525B]">{inputCharCount} characters</span>

              <div className="flex gap-[5px]">
                <button
                  onClick={handlePaste}
                  className="rounded-[5px] border border-white/10 bg-[#222228] px-[11px] py-[5px] text-[10px] text-[#A1A1AA] transition-colors hover:border-white/20 hover:text-[#FAFAFA]"
                >
                  Paste
                </button>
                <button
                  onClick={handleFormat}
                  className="rounded-[5px] bg-[#F97316] px-3 py-[5px] text-[10px] font-semibold text-white transition-colors hover:bg-[#EA8C15]"
                >
                  Format →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - OUTPUT */}
        <div>
          <div className="mb-2 flex items-center gap-[7px]">
            <label className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#52525B]">
              Output
            </label>
            {isValid === true && (
              <span className="rounded-[4px] border border-[#22C55E]/10 bg-[#22C55E]/[0.06] px-[7px] py-[2px] text-[10px] font-semibold text-[#22C55E]">
                Valid JSON
              </span>
            )}
            {isValid === false && (
              <span className="rounded-[4px] border border-[#F43F5E]/10 bg-[#F43F5E]/[0.06] px-[7px] py-[2px] text-[10px] font-semibold text-[#F43F5E]">
                Invalid JSON
              </span>
            )}
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-[#111115] overflow-hidden">
            <div className="min-h-[130px] overflow-auto whitespace-pre px-[14px] py-[14px] font-mono text-[11px] text-[#F97316] leading-[1.85]">
              {output}
            </div>
          </div>

          <div className="mt-[10px] flex gap-[6px]">
            <button
              onClick={handleCopy}
              className="flex-1 rounded-[5px] border border-white/10 bg-[#222228] py-[5px] text-center text-[10px] text-[#A1A1AA] transition-colors hover:border-white/20 hover:text-[#FAFAFA]"
            >
              Copy
            </button>
            <button
              onClick={handleMinify}
              className="flex-1 rounded-[5px] border border-white/10 bg-[#222228] py-[5px] text-center text-[10px] text-[#A1A1AA] transition-colors hover:border-white/20 hover:text-[#FAFAFA]"
            >
              Minify
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
