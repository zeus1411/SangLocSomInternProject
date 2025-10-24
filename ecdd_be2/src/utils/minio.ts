import { Client } from 'minio';

const {
  MINIO_ENDPOINT = 'minio',
  MINIO_PORT = '9000',
  MINIO_USE_SSL = 'false',
  MINIO_ACCESS_KEY = 'admin',
  MINIO_SECRET_KEY = '12345678',
  MINIO_BUCKET = 'ecdd-uploads',
  MINIO_REGION = 'ap-southeast-1'
} = process.env;

export const minio = new Client({
  endPoint: MINIO_ENDPOINT,
  port: Number(MINIO_PORT),
  useSSL: MINIO_USE_SSL === 'true',
  accessKey: MINIO_ACCESS_KEY,
  secretKey: MINIO_SECRET_KEY,
  region: MINIO_REGION
});

export async function ensureBucket() {
  const exists = await minio.bucketExists(MINIO_BUCKET).catch(() => false);
  if (!exists) {
    await minio.makeBucket(MINIO_BUCKET, MINIO_REGION);
  }
  return MINIO_BUCKET;
}
