import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

export const R2_BUCKET = process.env.R2_BUCKET_NAME as string;

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
  },
});

export function r2PublicUrl(storagePath: string): string {
  const base = (process.env.R2_PUBLIC_URL as string).replace(/\/$/, '');
  return `${base}/${storagePath}`;
}

export async function deleteR2Object(storagePath: string): Promise<void> {
  await r2Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: storagePath }));
}
