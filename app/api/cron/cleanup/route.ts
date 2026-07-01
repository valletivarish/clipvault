import { NextResponse } from 'next/server';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { deleteR2Object } from '@/lib/r2';

interface FileSlot {
  id: string;
  storagePath: string;
  expiresAt: number | null;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = Date.now();
  const q = query(collection(db, 'boards'), where('nextCleanupAt', '<=', now));
  const snap = await getDocs(q);
  const batch = snap.docs.slice(0, 100);

  let boardsCleaned = 0;
  let filesDeleted = 0;

  for (const boardDoc of batch) {
    const data = boardDoc.data();
    const files: FileSlot[] = data.files ?? [];
    const expired = files.filter((f) => f.expiresAt && f.expiresAt <= now);
    const live = files.filter((f) => !f.expiresAt || f.expiresAt > now);

    if (expired.length === 0) continue;

    await Promise.all(expired.map((f) => deleteR2Object(f.storagePath).catch(() => {})));

    const nextCleanupAt = live.length > 0
      ? Math.min(...live.filter((f) => f.expiresAt).map((f) => f.expiresAt as number))
      : null;

    await updateDoc(doc(db, 'boards', boardDoc.id), {
      files: live,
      nextCleanupAt: nextCleanupAt ?? null,
    });

    boardsCleaned++;
    filesDeleted += expired.length;
  }

  return NextResponse.json({ boardsChecked: batch.length, boardsCleaned, filesDeleted });
}
