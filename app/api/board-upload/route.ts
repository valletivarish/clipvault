import { NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client, R2_BUCKET, r2PublicUrl } from '@/lib/r2';
import { slugifyBoardName } from '@/lib/board';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const boardName = typeof body?.boardName === 'string' ? slugifyBoardName(body.boardName) : null;
  const fileName = typeof body?.fileName === 'string' ? body.fileName : null;
  const contentType = typeof body?.contentType === 'string' && body.contentType
    ? body.contentType
    : 'application/octet-stream';

  if (!boardName || !fileName) {
    return NextResponse.json({ error: 'Invalid board or file name' }, { status: 400 });
  }

  const safeName = fileName.replace(/[/\\]/g, '_').slice(0, 200);
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const storagePath = `boards/${boardName}/${id}-${safeName}`;

  const uploadUrl = await getSignedUrl(
    r2Client,
    new PutObjectCommand({ Bucket: R2_BUCKET, Key: storagePath, ContentType: contentType }),
    { expiresIn: 300 },
  );

  return NextResponse.json({ uploadUrl, storagePath, publicUrl: r2PublicUrl(storagePath) });
}
