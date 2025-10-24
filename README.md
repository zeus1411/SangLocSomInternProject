# Hệ Thống Quản Lý Dữ Liệu ECDD

## Mô tả dự án
Hệ thống Quản lý Dữ liệu ECDD là một nền tảng quản lý dữ liệu y tế toàn diện, cho phép người dùng tạo, quản lý và phân tích các biểu mẫu và dữ liệu liên quan đến chăm sóc sức khỏe. Hệ thống được phát triển với kiến trúc microservices hiện đại, sử dụng Angular cho frontend, Node.js với Express cho backend, và PostgreSQL cho cơ sở dữ liệu, tất cả được đóng gói trong các Docker container để dễ dàng triển khai và mở rộng.

## Công nghệ sử dụng

### Backend
- **Node.js** với **Express.js**
- **TypeScript**
- **PostgreSQL** làm cơ sở dữ liệu
- **Sequelize ORM**
- **JWT** cho xác thực

### Frontend
- **Angular**
- **TypeScript**
- **Bootstrap** cho giao diện người dùng
- **RxJS** cho xử lý bất đồng bộ

### Công Nghệ Container
- **Docker** cho container hóa ứng dụng
- **Docker Compose** để quản lý đa container
- **Nginx** làm reverse proxy
- **Docker Volume** cho việc lưu trữ dữ liệu

## Cấu trúc thư mục

```
SangLocSomDemoInternProject/
├── ecdd_be2/               # Backend source code
│   ├── src/
│   │   ├── config/        # Cấu hình database
│   │   ├── controllers/    # Các controller xử lý request
│   │   ├── dtos/          # Data Transfer Objects
│   │   ├── middlewares/   # Các middleware
│   │   ├── models/        # Các model dữ liệu
│   │   ├── routes/        # Định tuyến API
│   │   ├── utils/         # Các tiện ích
│   │   └── app.ts         # File chính của ứng dụng
│   └── package.json
│
└── ecdd_fe2/              # Frontend source code
    ├── src/
    │   ├── app/
    │   │   ├── common/    # Các component dùng chung
    │   │   ├── core/      # Core module
    │   │   ├── pages/     # Các trang của ứng dụng
    │   │   ├── pipe/      # Custom pipes
    │   │   └── services/  # Các service
    │   └── environments/  # Cấu hình môi trường
    └── package.json
```

## Hướng dẫn cài đặt

### Yêu cầu hệ thống (Phát triển)
- Node.js (v14.x trở lên)
- PostgreSQL (v12 trở lên)
- npm hoặc yarn
- Docker (v20.10.0 trở lên)
- Docker Compose (v2.0.0 trở lên)

### Yêu cầu hệ thống (Triển khai Production)
- Docker (v20.10.0 trở lên)
- Docker Compose (v2.0.0 trở lên)
- Tối thiểu 2GB RAM

### Cài đặt với Docker (Khuyến nghị)

1. Tạo file `.env` từ file `.env.example` trong thư mục gốc và cập nhật các biến môi trường cần thiết.

2. Chạy ứng dụng với Docker Compose:
   ```bash
   docker-compose up -d --build
   ```

3. Các dịch vụ sẽ được khởi động:
   - Frontend: `http://localhost:80`
   - Backend API: `http://localhost:3000`
   - PostgreSQL: `localhost:5432`
   - PgAdmin: `http://localhost:5050` (nếu được bật trong docker-compose.yml)

### Cài đặt thủ công (Development)

#### Cài đặt Backend

1. Di chuyển vào thư mục backend:
   ```bash
   cd ecdd_be2
   ```

2. Cài đặt các dependencies:
   ```bash
   npm install
   ```

3. Tạo file `.env` từ file `.env.example` và cập nhật các biến môi trường cần thiết.

4. Khởi động server phát triển:
   ```bash
   npm run dev
   ```

#### Cài đặt Frontend

1. Di chuyển vào thư mục frontend:
   ```bash
   cd ecdd_fe2
   ```

2. Cài đặt các dependencies:
   ```bash
   npm install
   ```

3. Khởi động ứng dụng Angular:
   ```bash
   ng serve
   ```

4. Truy cập ứng dụng tại: `http://localhost:4200`

## Kiến trúc hệ thống

### Kiến trúc Container

```
+------------------+     +------------------+     +------------------+
|   Nginx Proxy   |<--->|   Frontend       |<--->|   Backend API    |
|   (Port 80)     |     |   (Angular)      |     |   (Node.js)      |
+------------------+     +------------------+     +------------------+
                                                         ^
                                                         |
                                                         v
                                                 +------------------+
                                                 |   PostgreSQL     |
                                                 |   (Database)     |
                                                 +------------------+
```

### Luồng hoạt động của Backend

1. **Nhận request từ client** thông qua các endpoint API
2. **Xác thực và phân quyền** thông qua JWT middleware
3. **Xử lý request** tại các controller tương ứng
4. **Tương tác với database** thông qua các model
5. **Trả về response** cho client

### Luồng hoạt động của Frontend

1. **Khởi tạo ứng dụng** và cấu hình các service cần thiết
2. **Xử lý đăng nhập** và lưu token JWT
3. **Tương tác với API** thông qua các service
4. **Hiển thị dữ liệu** lên giao diện người dùng
5. **Xử lý tương tác** từ người dùng và gửi request tới server

### Các lệnh Docker thông dụng

- Khởi động tất cả các dịch vụ:
  ```bash
  docker-compose up -d
  ```

- Dừng tất cả các dịch vụ:
  ```bash
  docker-compose down
  ```

- Xem logs của các container:
  ```bash
  docker-compose logs -f
  ```

- Khởi động lại một dịch vụ cụ thể (ví dụ: backend):
  ```bash
  docker-compose restart backend
  ```

- Xem danh sách các container đang chạy:
  ```bash
  docker ps
  ```

- Xem thông tin chi tiết về một container:
  ```bash
  docker inspect <container_id>
  ```

## API Documentation

Chi tiết các API có thể xem tại file [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

## Các tính năng chính

- Quản lý người dùng và phân quyền
- Tạo và quản lý biểu mẫu (forms)
- Nhập và xem kết quả
- Quản lý đơn vị tổ chức
- Quản lý chương trình và dữ liệu

## Bảo mật

- Xác thực người dùng bằng JWT
- Bảo vệ các route API
- Xử lý lỗi tập trung
- Giới hạn tỷ lệ yêu cầu (rate limiting)
- Cô lập mạng giữa các container
- Sử dụng Docker secrets cho thông tin nhạy cảm
- Cập nhật thường xuyên các image base để đảm bảo an ninh

## Đóng góp

Mọi đóng góp cho dự án đều được chào đón. Vui lòng tạo pull request hoặc issue để đóng góp ý kiến.

## Giấy phép

Dự án được phát triển bởi đội ngũ phát triển ECDD. Mọi quyền được bảo lưu.
