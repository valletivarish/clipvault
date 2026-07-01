'use client';

import { useEffect, useState } from 'react';

export default function BoardPreview() {
  const messages = [
    "Pasting from my laptop - grab it on your phone!",
    "No account needed. Just share the board name.",
    "Any file type works - PDF, Excel, ZIP, anything.",
    "Syncs instantly across every device."
  ];

  const [displayedText, setDisplayedText] = useState('');
  const [messageIndex, setMessageIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentMessage = messages[messageIndex];
    const typingSpeed = isDeleting ? 30 : 50;
    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < currentMessage.length) {
          setDisplayedText(currentMessage.slice(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          setTimeout(() => setIsDeleting(true), 1500);
        }
      } else {
        if (charIndex > 0) {
          setDisplayedText(currentMessage.slice(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
          setIsDeleting(false);
          setMessageIndex((messageIndex + 1) % messages.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, messageIndex, messages]);

  return (
    <div className="mx-7 mb-8 border border-white/10 rounded-xl overflow-hidden">
      <style>{`
        @keyframes blink {
          0%, 49% {
            opacity: 1;
          }
          50%, 100% {
            opacity: 0;
          }
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center gap-2 px-[14px] py-[10px] bg-[#111115] border-b border-white/[0.06]">
        <span className="text-xs text-[#A1A1AA] font-medium mr-auto font-mono">
          swift-tiger-42
        </span>

        {/* Live Badge */}
        <div className="flex items-center gap-1 text-[10px] font-medium text-[#22C55E] px-2 py-[2px] rounded bg-[#22C55E]/5 border border-[#22C55E]/10">
          <span className="w-[5px] h-[5px] rounded-full bg-[#22C55E] animate-pulse"></span>
          <span>2 connected</span>
        </div>

        {/* Free Board Badge */}
        <div className="bg-[#222228] text-[#52525B] border border-white/[0.06] text-[10px] px-2 py-[2px] rounded">
          Free board
        </div>
      </div>

      {/* Text Area */}
      <div className="px-[14px] py-3 text-xs text-[#A1A1AA] border-b border-white/[0.06] min-h-[44px] leading-relaxed font-[400]">
        {displayedText}
        <span
          className="inline-block w-[2px] h-[13px] bg-[#F97316] align-middle ml-[1px]"
          style={{ animation: 'blink 1s infinite' }}
        ></span>
      </div>

      {/* Files Row */}
      <div className="grid grid-cols-3">
        {/* Slot 1: PDF */}
        <div className="px-3 py-[10px] border-r border-white/[0.06]">
          <div className="text-[9px] text-[#52525B] tracking-[0.07em] mb-[6px] font-medium">
            File
          </div>
          <div className="flex items-center gap-1">
            <span className="font-mono text-[10px] font-semibold text-t3 bg-s3 px-[5px] py-[1px] rounded mr-1">PDF</span>
            <span className="text-[11px] text-[#A1A1AA]">report.pdf</span>
            <span className="text-[9px] bg-[#F59E0B]/[0.07] text-[#F59E0B] border border-[#F59E0B]/[0.15] rounded-[3px] px-1 whitespace-nowrap">
              24h
            </span>
          </div>
        </div>

        {/* Slot 2: Excel */}
        <div className="px-3 py-[10px] border-r border-white/[0.06]">
          <div className="text-[9px] text-[#52525B] tracking-[0.07em] mb-[6px] font-medium">
            File
          </div>
          <div className="flex items-center gap-1">
            <span className="font-mono text-[10px] font-semibold text-t3 bg-s3 px-[5px] py-[1px] rounded mr-1">XLS</span>
            <span className="text-[11px] text-[#A1A1AA]">data.xlsx</span>
            <span className="text-[9px] bg-[#22C55E]/[0.06] text-[#22C55E] border border-[#22C55E]/10 rounded-[3px] px-1 whitespace-nowrap">
              never
            </span>
          </div>
        </div>

        {/* Slot 3: Empty */}
        <div className="px-3 py-[10px]">
          <div className="text-[9px] text-[#52525B] tracking-[0.07em] mb-[6px] font-medium">
            File
          </div>
          <div className="text-[11px] text-[#52525B] border border-dashed border-white/[0.06] rounded-[5px] px-[7px] py-1 text-center">
            drop any file
          </div>
        </div>
      </div>
    </div>
  );
}
