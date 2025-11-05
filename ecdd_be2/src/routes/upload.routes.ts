import { Router, type Request, type Response, type NextFunction } from 'express';
import multer from 'multer';
import { minio, PUBLIC_BUCKET, PRIVATE_BUCKET, ensureBucket } from '../utils/minio';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { extension as mimeExtension } from 'mime-types';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  '/uploading',
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const file = req.file as Express.Multer.File | undefined;
      if (!file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      // 1) Đọc query isPublic & ttl
      const isPublic = String(req.query.isPublic ?? 'false') === 'true';

      const ttlRaw = req.query.ttl;
      let ttlSeconds = 60 * 60; // default 1h cho private
      if (typeof ttlRaw === 'string') {
        const n = Number(ttlRaw);
        if (Number.isFinite(n) && n > 0 && n <= 7 * 24 * 60 * 60) {
          ttlSeconds = n;
        }
      }

      // 2) Chọn bucket theo isPublic
      const bucket = isPublic ? PUBLIC_BUCKET : PRIVATE_BUCKET;

      // Cho local/dev: đảm bảo bucket tồn tại (nếu không dùng minio-init)
      await ensureBucket(bucket);

      // 3) Tạo tên file
      const originalExt =
        extname(file.originalname) ||
        `.${mimeExtension(file.mimetype) || 'bin'}`;

      const objectName = `${new Date().toISOString().slice(0, 10)}/${randomUUID()}${originalExt}`;

      // 4) Upload lên MinIO
      await minio.putObject(bucket, objectName, file.buffer, file.size, {
        'Content-Type': file.mimetype,
      });

      // 5) Tạo URL trả về
      const publicBase =
        process.env.MINIO_PUBLIC_BASE_URL ||
        `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || '9000'}`;

      let url: string;
      let expiresIn: number | null = null;

      if (isPublic) {
        // Bucket images-public đã được set anonymous download
        url = `${publicBase}/${bucket}/${encodeURIComponent(objectName)}`;
      } else {
        // Private -> tạo presigned URL với TTL (ttlSeconds)
        url = await minio.presignedGetObject(bucket, objectName, ttlSeconds);
        expiresIn = ttlSeconds;
      }

      return res.json({
        success: true,
        data: {
          url,
          path: `s3://${bucket}/${objectName}`,
          size: file.size,
          mimetype: file.mimetype,
          isPublic,
          expiresIn, // giây, chỉ có ý nghĩa với private (presigned URL)
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
