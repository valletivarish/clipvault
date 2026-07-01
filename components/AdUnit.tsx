'use client';

import { useEffect, useRef } from 'react';

interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
}

const PUB_ID = 'ca-pub-XXXXXXXXXXXXXXXX'; // replace with your AdSense publisher ID

export default function AdUnit({ slot, format = 'auto', className = '' }: AdUnitProps) {
  const ref = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      pushed.current = true;
      ((window as unknown as Record<string, unknown>).adsbygoogle as unknown[] ?? []).push({});
    } catch {}
  }, []);

  if (PUB_ID === 'ca-pub-XXXXXXXXXXXXXXXX') {
    return (
      <div className={`flex items-center justify-center bg-s2 border border-white/[0.04] text-t3 text-[10px] tracking-[0.06em] ${className}`}>
        Advertisement
      </div>
    );
  }

  return (
    <div className={className}>
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={PUB_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
