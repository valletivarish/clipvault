'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateBoardName(): string {
  return Array.from({ length: 6 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
}

export default function BoardGenerator() {
  const [boardName, setBoardName] = useState<string>(() => generateBoardName());
  const [passwordEnabled, setPasswordEnabled] = useState<boolean>(false);

  return (
    <div className="mx-auto w-full max-w-[400px]">
      {/* Board Name Box */}
      <div className="mb-[10px] flex items-center gap-[10px] rounded-xl border border-white/10 bg-[#111115] p-[14px_16px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={boardName}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className="flex-1 font-mono font-semibold text-[17px] text-[#FAFAFA]"
          >
            {boardName}
          </motion.div>
        </AnimatePresence>
        <button
          onClick={() => setBoardName(generateBoardName())}
          className="flex h-[30px] w-[30px] items-center justify-center rounded-[7px] border border-white/10 bg-[#222228] text-[#52525B] text-sm transition-colors hover:border-white/20 hover:text-t2"
          aria-label="Refresh board name"
        >
          &#8635;
        </button>
      </div>

      {/* Password Toggle Row */}
      <div className="mb-4 flex items-center justify-center gap-[6px] text-[11px] text-[#52525B]">
        <button
          onClick={() => setPasswordEnabled(!passwordEnabled)}
          className="relative h-[14px] w-[26px] cursor-pointer rounded-full border border-white/[0.06] bg-[#222228] transition-colors"
          aria-label="Toggle password protection"
          aria-pressed={passwordEnabled}
        >
          <div
            className={`absolute top-[2px] h-[9px] w-[9px] rounded-full transition-all ${
              passwordEnabled ? 'right-[2px] bg-ac' : 'left-[2px] bg-[#52525B]'
            }`}
          />
        </button>
        {passwordEnabled ? (
          <>
            <span>Password protected</span>
            <span className="text-white/10">·</span>
            <span>Enhanced security</span>
          </>
        ) : (
          <>
            <span>Add password protection</span>
            <span className="text-white/10">·</span>
            <span>Free &amp; open by default</span>
          </>
        )}
      </div>

      {/* Buttons Row */}
      <div className="flex gap-2">
        <button className="flex-1 rounded-[7px] bg-[#F97316] py-[10px] text-[13px] font-semibold text-white transition-colors hover:bg-[#EA8C15] active:scale-[0.97]">
          Create this board
        </button>
        <button className="flex-1 rounded-[7px] border border-white/10 py-[10px] text-[13px] text-[#A1A1AA] transition-colors hover:border-white/20 hover:text-[#FAFAFA] active:scale-[0.97]">
          Join existing
        </button>
      </div>
    </div>
  );
}
