'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { app } from '@/lib/firebase';

export default function FirebaseAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    let analytics: import('firebase/analytics').Analytics | null = null;

    async function init() {
      const { getAnalytics, logEvent, isSupported } = await import('firebase/analytics');
      if (!(await isSupported())) return;
      analytics = getAnalytics(app);
      logEvent(analytics, 'page_view', { page_path: pathname });

      const slug = pathname.startsWith('/tools/') ? pathname.split('/tools/')[1] : null;
      if (slug) logEvent(analytics, 'tool_view', { tool: slug });
    }

    init();
  }, [pathname]);

  return null;
}
