import { NextResponse } from 'next/server';
import { deleteR2Object } from '@/lib/r2';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const paths: unknown = body?.storagePaths;

  if (!Array.isArray(paths) || paths.some((p) => typeof p !== 'string')) {
    return NextResponse.json({ error: 'Invalid storagePaths' }, { status: 400 });
  }

  const safePaths = (paths as string[]).filter((p) => p.startsWith('boards/') && !p.includes('..'));

  await Promise.all(safePaths.map((p) => deleteR2Object(p).catch(() => {})));

  return NextResponse.json({ ok: true });
}
