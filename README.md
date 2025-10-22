# Hệ Thống Quản Lý Dữ Liệu ECDD

## Mô tả dự án
Hệ thống Quản lý Dữ liệu ECDD là một nền tảng quản lý dữ liệu y tế toàn diện, cho phép người dùng tạo, quản lý và phân tích các biểu mẫu và dữ liệu liên quan đến chăm sóc sức khỏe. Hệ thống được phát triển với kiến trúc client-server hiện đại, sử dụng Angular cho frontend và Node.js với Express cho backend.

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

### Yêu cầu hệ thống
- Node.js (v14.x trở lên)
- PostgreSQL (v12 trở lên)
- npm hoặc yarn

### Cài đặt Backend

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

### Cài đặt Frontend

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

## Đóng góp

Mọi đóng góp cho dự án đều được chào đón. Vui lòng tạo pull request hoặc issue để đóng góp ý kiến.

## Giấy phép

Dự án được phát triển bởi đội ngũ phát triển ECDD. Mọi quyền được bảo lưu.
