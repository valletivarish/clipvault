'use client';

import { useState, useEffect } from 'react';

export default function UuidGenerator() {
  const [currentUuid, setCurrentUuid] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    generateUuid();
  }, []);

  const generateUuid = () => {
    const newUuid = crypto.randomUUID();
    setCurrentUuid(newUuid);
    setHistory((prev) => [newUuid, ...prev.slice(0, 4)]);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentUuid);
  };

  return (
    <div className="w-full space-y-4">
      {/* Main Display */}
      <div className="bg-[#111115] border border-white/[0.06] rounded-xl px-6 py-5 text-center">
        <div
          className="text-xl font-mono text-[#FAFAFA] tracking-wide break-all font-semibold"
          style={{ fontFamily: 'JetBrains Mono' }}
        >
          {currentUuid}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={generateUuid}
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

      {/* History */}
      {history.length > 0 && (
        <div className="bg-[#111115] border border-white/[0.06] rounded-xl p-4">
          <div className="text-[10px] text-[#52525B] tracking-wide font-semibold mb-3">
            History (last 5)
          </div>
          <div className="space-y-2">
            {history.map((uuid, idx) => (
              <div
                key={idx}
                className="text-xs font-mono text-[#A1A1AA] bg-[#09090B] rounded-lg px-3 py-2 break-all hover:bg-[#18181C] cursor-pointer transition-all"
                onClick={() => navigator.clipboard.writeText(uuid)}
              >
                {uuid}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
