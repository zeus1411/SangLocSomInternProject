// src/utils/cache.util.ts
import redis from '../config/redis';

const DEFAULT_TTL_SECONDS = Number(process.env.REDIS_TTL) || 300;

// Tạo key dạng "program:5", "program:list:{...}", "period:current", ...
export function buildKey(parts: (string | number | undefined | null)[]) {
  return parts
    .filter((p) => p !== undefined && p !== null)
    .map(String)
    .join(':');
}

// Hàm helper: gọi Redis nhưng nuốt lỗi nếu Redis chưa sẵn sàng
async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (err) {
    // Redis không reachable -> coi như cache miss
    return null;
  }
}

// Đọc JSON từ Redis
export async function cacheGet<T>(key: string): Promise<T | null> {
  const raw = await safe(() => redis.get(key));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

// Ghi JSON vào Redis với TTL
export async function cacheSet(
  key: string,
  data: any,
  ttlSeconds: number = DEFAULT_TTL_SECONDS
): Promise<void> {
  await safe(() =>
    redis.set(key, JSON.stringify(data), 'EX', ttlSeconds)
  );
}

// Xoá 1 key cụ thể
export async function cacheDel(key: string): Promise<void> {
  await safe(() => redis.del(key));
}

// Xoá tất cả key bắt đầu với prefix (vd: "program:list", "period:active")
export async function cacheDelPrefix(prefix: string): Promise<void> {
  await safe(async () => {
    const stream = redis.scanStream({
      match: `${prefix}*`,
      count: 100,
    });

    const pipeline = redis.pipeline();
    stream.on('data', (keys: string[]) => {
      if (keys.length) {
        keys.forEach((k) => pipeline.del(k));
      }
    });

    await new Promise<void>((resolve, reject) => {
      stream.on('end', () => resolve());
      stream.on('error', (err) => reject(err));
    });

    await pipeline.exec();
  });
}
