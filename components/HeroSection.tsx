'use client';

import { motion } from 'framer-motion';
import BoardGenerator from '@/components/BoardGenerator';

const ease: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

export default function HeroSection() {
  return (
    <section className="py-14 sm:py-[60px] pb-12 text-center">
      <div className="mx-auto w-full max-w-5xl px-5 sm:px-7">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease }}
          className="font-display text-[38px] sm:text-[46px] leading-[1.08] tracking-[-0.045em] mb-4"
        >
          Share anything.
          <br />
          <span className="text-ac">Instantly.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease, delay: 0.1 }}
          className="text-sm text-t2 max-w-[340px] mx-auto mb-9 leading-relaxed"
        >
          Create a board and share the 6-digit code. Text syncs live across
          every device. Drop any file and it appears everywhere instantly.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease, delay: 0.2 }}
        >
          <BoardGenerator />
        </motion.div>
      </div>
    </section>
  );
}
