import { db, storage } from './firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';

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

      for (const f of expired) {
        try { await deleteObject(ref(storage, f.storagePath)); } catch {}
      }

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
