'use client';

import { useEffect } from 'react';
import { runGlobalCleanup } from '@/lib/boardCleanup';

export default function CleanupWorker() {
  useEffect(() => {
    // Run once per page load, no polling — stays cheap
    runGlobalCleanup();
  }, []);

  return null;
}
