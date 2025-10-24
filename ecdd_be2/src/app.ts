import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import 'reflect-metadata';
import routes from './routes/index';
import { errorMiddleware } from './middlewares/error.middleware';
import sequelize from './config/database';

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Sàng lọc sớm is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api', routes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error Handler
app.use(errorMiddleware);

// ✅ Khởi động server với kiểm tra kết nối database
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công');

    // Đồng bộ hóa các model với database
    await sequelize.sync({
      alter: {
        drop: false  // Không drop tables hiện có
      },
      force: false  // Không force recreate tất cả tables
    });
    console.log('✅ Đồng bộ hóa database thành công');

    app.listen(port, () => {
      console.log(`🚀 Server đang chạy tại http://localhost:${port}`);
    });
  } catch (error) {
    console.error('❌ Lỗi kết nối database:', error);
    process.exit(1);
  }
};

// Chỉ khởi động server nếu file được chạy trực tiếp
if (require.main === module) {
  startServer();
}

export default app;
