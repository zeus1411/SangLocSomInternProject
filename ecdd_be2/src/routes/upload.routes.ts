import { Router, type Request, type Response, type NextFunction } from 'express';
import multer from 'multer';
import { minio, ensureBucket } from '../utils/minio';
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
      if (!file) return res.status(400).json({ message: 'No file' });

      const bucket = await ensureBucket();

      const originalExt =
        extname(file.originalname) ||
        `.${mimeExtension(file.mimetype) || 'bin'}`;

      const objectName = `${new Date().toISOString().slice(0, 10)}/${randomUUID()}${originalExt}`;

      // putObject(bucket, objectName, data, size, metaData?)
      await minio.putObject(bucket, objectName, file.buffer, file.size, {
        'Content-Type': file.mimetype,
        // 'x-amz-acl': 'public-read', // chỉ dùng nếu bạn thật sự muốn ACL public
      });

      const publicBase =
        process.env.MINIO_PUBLIC_BASE_URL ||
        `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`;

      // Nếu bucket private => dùng presigned URL:
      const url = await minio.presignedGetObject(bucket, objectName, 60 * 60); // 1h

      // Nếu bucket public (anonymous download) thì có thể dùng:
      // const url = `${publicBase}/${bucket}/${encodeURIComponent(objectName)}`;

      return res.json({
        url,
        path: `s3://${bucket}/${objectName}`,
        size: file.size,
        mimetype: file.mimetype,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
