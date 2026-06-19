'use client';

import { useState, useEffect } from 'react';

export default function WordCounter() {
  const [text, setText] = useState('');
  const [stats, setStats] = useState({ words: 0, characters: 0, sentences: 0, readingTime: 0 });

  useEffect(() => {
    const trimmed = text.trim();
    const words = trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
    const characters = text.length;
    const sentences = trimmed.length === 0 ? 0 : (trimmed.match(/[.!?]+/g) || []).length;
    const readingTime = Math.ceil(words / 200) || 0;

    setStats({ words, characters, sentences, readingTime });
  }, [text]);

  return (
    <div className="w-full">
      <div className="bg-[#111115] border border-white/[0.06] rounded-xl overflow-hidden">
        {/* Textarea */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing or paste your text here..."
          className="w-full bg-transparent text-[#A1A1AA] font-mono text-[11px] leading-[1.75] outline-none resize-none px-[14px] py-[14px] min-h-[160px]"
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 p-4 bg-[#09090B] border-t border-white/[0.06]">
          <div className="bg-[#111115] border border-white/[0.06] rounded-lg p-3 text-center">
            <div className="text-[22px] font-bold text-[#FAFAFA]" style={{ fontFamily: 'Syne' }}>
              {stats.words}
            </div>
            <div className="text-[10px] text-[#52525B] uppercase tracking-wide">Words</div>
          </div>

          <div className="bg-[#111115] border border-white/[0.06] rounded-lg p-3 text-center">
            <div className="text-[22px] font-bold text-[#FAFAFA]" style={{ fontFamily: 'Syne' }}>
              {stats.characters}
            </div>
            <div className="text-[10px] text-[#52525B] uppercase tracking-wide">Characters</div>
          </div>

          <div className="bg-[#111115] border border-white/[0.06] rounded-lg p-3 text-center">
            <div className="text-[22px] font-bold text-[#FAFAFA]" style={{ fontFamily: 'Syne' }}>
              {stats.sentences}
            </div>
            <div className="text-[10px] text-[#52525B] uppercase tracking-wide">Sentences</div>
          </div>

          <div className="bg-[#111115] border border-white/[0.06] rounded-lg p-3 text-center">
            <div className="text-[22px] font-bold text-[#FAFAFA]" style={{ fontFamily: 'Syne' }}>
              {stats.readingTime}
            </div>
            <div className="text-[10px] text-[#52525B] uppercase tracking-wide">Min Read</div>
          </div>
        </div>
      </div>
    </div>
  );
}
