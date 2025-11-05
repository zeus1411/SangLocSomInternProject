import { Client } from 'minio';

const {
  MINIO_ENDPOINT = 'minio',        // khi chạy trong docker: 'minio'; local có thể override thành 'localhost'
  MINIO_PORT = '9000',
  MINIO_USE_SSL = 'false',
  MINIO_ACCESS_KEY = 'admin',
  MINIO_SECRET_KEY = '12345678',
  MINIO_REGION = 'ap-southeast-1',
  MINIO_PUBLIC_BUCKET = 'images-public',
  MINIO_PRIVATE_BUCKET = 'private',
} = process.env;

export const minio = new Client({
  endPoint: MINIO_ENDPOINT,
  port: Number(MINIO_PORT),
  useSSL: MINIO_USE_SSL === 'true',
  accessKey: MINIO_ACCESS_KEY,
  secretKey: MINIO_SECRET_KEY,
  region: MINIO_REGION,
});

export const PUBLIC_BUCKET = MINIO_PUBLIC_BUCKET;
export const PRIVATE_BUCKET = MINIO_PRIVATE_BUCKET;

// optional: dùng cho local/dev nếu không dùng minio-init
export async function ensureBucket(bucketName: string) {
  const exists = await minio.bucketExists(bucketName).catch(() => false);
  if (!exists) {
    await minio.makeBucket(bucketName, MINIO_REGION);
  }
}
