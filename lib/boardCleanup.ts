import { db } from './firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

interface FileSlot {
  id: string;
  storagePath: string;
  expiresAt: number | null;
}

export async function runGlobalCleanup(): Promise<void> {
  try {
    const now = Date.now();
    const q = query(
      collection(db, 'boards'),
      where('nextCleanupAt', '<=', now),
    );
    const snap = await getDocs(q);
    const batch = snap.docs.slice(0, 5); // max 5 boards per run to limit reads

    for (const boardDoc of batch) {
      const data = boardDoc.data();
      const files: FileSlot[] = data.files ?? [];
      const expired = files.filter((f) => f.expiresAt && f.expiresAt <= now);
      const live = files.filter((f) => !f.expiresAt || f.expiresAt > now);

      if (expired.length === 0) continue;

      try {
        await fetch('/api/board-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ storagePaths: expired.map((f) => f.storagePath) }),
        });
      } catch {}

      const nextCleanupAt = live.length > 0
        ? Math.min(...live.filter((f) => f.expiresAt).map((f) => f.expiresAt as number))
        : null;

      await updateDoc(doc(db, 'boards', boardDoc.id), {
        files: live,
        nextCleanupAt: nextCleanupAt ?? null,
      });
    }
  } catch {}
}
