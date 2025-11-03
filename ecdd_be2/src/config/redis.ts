// src/config/redis.ts
import dotenv from 'dotenv';
import Redis from 'ioredis';

dotenv.config(); // đảm bảo .env đã load trước khi tạo client

// Chọn host Redis
// - Khi chạy trong docker-compose: REDIS_HOST=redis
// - Khi chạy local dev: REDIS_HOST=127.0.0.1 (hoặc localhost)
//
// Nếu không set REDIS_HOST, ta fallback:
//   - production  -> 'redis'
//   - development -> '127.0.0.1'
const redisHost =
  process.env.REDIS_HOST ||
  (process.env.NODE_ENV === 'production' ? 'redis' : '127.0.0.1');

const redisPort = Number(process.env.REDIS_PORT) || 6379;
const redisPassword = process.env.REDIS_PASSWORD || undefined;
const redisDb = process.env.REDIS_DB ? Number(process.env.REDIS_DB) : 0;

// Tạo client Redis
const redis = new Redis({
  host: redisHost,
  port: redisPort,
  password: redisPassword,
  db: redisDb,
  enableReadyCheck: false,
  lazyConnect: true,
});

// Kết nối nhưng KHÔNG làm app chết nếu fail
async function initRedis() {
  try {
    await redis.connect();
    console.log(`[Redis] connected to ${redisHost}:${redisPort}`);
  } catch (err) {
    console.error('[Redis] initial connect failed:', err);
    // Không throw -> app vẫn chạy, chỉ là cache sẽ miss
  }
}
initRedis();

// Log lỗi Redis (chỉ log thôi, không crash server)
redis.on('error', (err) => {
  console.error('[Redis] error:', err);
});

export default redis;
