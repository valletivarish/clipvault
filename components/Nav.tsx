'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 flex items-center justify-between px-5 sm:px-7 py-4 border-b border-white/[0.06] transition-all duration-200 ${
        scrolled ? 'bg-s1/90 backdrop-blur-md' : 'bg-s1'
      }`}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <div className="w-6 h-6 bg-ac rounded-[4px] flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="3" width="10" height="8" rx="1" stroke="white" strokeWidth="1.2" fill="none"/>
            <path d="M4 3V2.5a2 2 0 014 0V3" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
            <path d="M3.5 6.5h5M3.5 8.5h3" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </div>
        <span className="font-display text-[15px] font-black tracking-tight text-t1" style={{ letterSpacing: '-0.04em' }}>
          ClipVault
        </span>
      </Link>

      {/* Center Links - hidden on mobile */}
      <div className="hidden sm:flex items-center gap-8">
        <Link href="/boards" className="text-t3 text-xs hover:text-t1 transition-colors">
          Boards
        </Link>
        <Link href="/tools" className="text-t3 text-xs hover:text-t1 transition-colors">
          Tools
        </Link>
        <Link href="/about" className="text-t3 text-xs hover:text-t1 transition-colors">
          About
        </Link>
      </div>

      {/* Create Board Button */}
      <Link
        href="/"
        className="bg-ac text-white text-xs font-semibold px-4 py-[7px] rounded-[7px] hover:bg-orange-600 transition-colors shrink-0"
      >
        Create board
      </Link>
    </nav>
  );
}
