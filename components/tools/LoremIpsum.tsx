'use client';

import { useState } from 'react';

const LOREM_SENTENCES = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse.',
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa.',
  'Qui officia deserunt mollit anim id est laborum consectetur.',
  'In esse cillum dolore eu fugiat nulla pariatur.',
  'Sunt in culpa qui officia deserunt mollit anim id est.',
  'Exercitation ullamco laboris nisi ut aliquip ex ea commodo.',
  'Consequat duis aute irure dolor in reprehenderit.',
];

function generateLoremText(paragraphs: number, wordsPerParagraph: number, startsWithLorem: boolean): string {
  let text = '';

  for (let p = 0; p < paragraphs; p++) {
    let paragraph = '';
    let wordCount = 0;

    while (wordCount < wordsPerParagraph) {
      const sentence = LOREM_SENTENCES[Math.floor(Math.random() * LOREM_SENTENCES.length)];
      const words = sentence.split(' ').length;

      if (wordCount + words <= wordsPerParagraph) {
        if (paragraph) paragraph += ' ';
        paragraph += sentence;
        wordCount += words;
      } else {
        break;
      }
    }

    if (p > 0 || !startsWithLorem) {
      paragraph = paragraph.charAt(0).toUpperCase() + paragraph.slice(1);
    }

    text += paragraph + '\n\n';
  }

  return text.trim();
}

export default function LoremIpsum() {
  const [paragraphs, setParagraphs] = useState(3);
  const [wordsPerParagraph, setWordsPerParagraph] = useState(80);
  const [startsWithLorem, setStartsWithLorem] = useState(true);
  const [output, setOutput] = useState(() =>
    generateLoremText(3, 80, true)
  );

  const handleGenerate = () => {
    const text = generateLoremText(paragraphs, wordsPerParagraph, startsWithLorem);
    setOutput(text);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="w-full space-y-4">
      {/* Controls */}
      <div className="bg-[#111115] border border-white/[0.06] rounded-xl p-4 space-y-4">
        {/* Paragraphs Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-[11px] text-[#A1A1AA] font-semibold uppercase tracking-wide">
              Paragraphs
            </label>
            <span className="text-[12px] text-[#F97316] font-semibold">{paragraphs}</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={paragraphs}
            onChange={(e) => setParagraphs(parseInt(e.target.value))}
            className="w-full h-1 bg-[#222228] rounded-lg appearance-none cursor-pointer accent-[#F97316]"
          />
        </div>

        {/* Words Per Paragraph Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-[11px] text-[#A1A1AA] font-semibold uppercase tracking-wide">
              Words per paragraph
            </label>
            <span className="text-[12px] text-[#F97316] font-semibold">{wordsPerParagraph}</span>
          </div>
          <input
            type="range"
            min="20"
            max="200"
            value={wordsPerParagraph}
            onChange={(e) => setWordsPerParagraph(parseInt(e.target.value))}
            className="w-full h-1 bg-[#222228] rounded-lg appearance-none cursor-pointer accent-[#F97316]"
          />
        </div>

        {/* Checkbox */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="startsWithLorem"
            checked={startsWithLorem}
            onChange={(e) => setStartsWithLorem(e.target.checked)}
            className="w-4 h-4 rounded cursor-pointer accent-[#F97316]"
          />
          <label
            htmlFor="startsWithLorem"
            className="text-[11px] text-[#A1A1AA] font-medium cursor-pointer"
          >
            Start with "Lorem ipsum..."
          </label>
        </div>
      </div>

      {/* Output Card */}
      <div className="bg-[#111115] border border-white/[0.06] rounded-xl overflow-hidden flex flex-col">
        <textarea
          value={output}
          readOnly
          className="flex-1 bg-transparent text-[#A1A1AA] font-mono text-[11px] leading-[1.75] outline-none resize-none px-[14px] py-[14px] min-h-[200px]"
        />
        <div className="px-[14px] py-3 bg-[#09090B] border-t border-white/[0.06] flex gap-2">
          <button
            onClick={handleGenerate}
            className="bg-[#F97316] text-white rounded-[7px] px-3 py-[9px] text-[10px] font-semibold hover:bg-[#EA8C0A] transition-all"
          >
            Regenerate
          </button>
          <button
            onClick={copyToClipboard}
            className="bg-[#F97316] text-white rounded-[7px] px-3 py-[9px] text-[10px] font-semibold hover:bg-[#EA8C0A] transition-all"
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}
