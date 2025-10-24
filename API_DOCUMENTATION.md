# Tài liệu API ECDD

## Mục lục
1. [Tổng quan](#tổng-quan)
2. [Triển khai với Docker](#triển-khai-với-docker)
3. [Xác thực](#xác-thực)
4. [Danh sách API](#danh-sách-api)
   - [Xác thực](#xác-thực-1)
   - [Người dùng](#người-dùng)
   - [Biểu mẫu (Forms)](#biểu-mẫu-forms)
   - [Dữ liệu (Data)](#dữ-liệu-data)
   - [Tổ chức (Organization)](#tổ-chức-organization)
   - [Kiểm tra sức khỏe (Health Check)](#kiểm-tra-sức-khỏe-health-check)

## Tổng quan

Tài liệu này mô tả các API có sẵn trong hệ thống ECDD. Tất cả các API đều trả về dữ liệu dưới dạng JSON và yêu cầu xác thực (trừ một số endpoint công khai).

### Địa chỉ cơ sở (Base URL)

- **Development**: `http://localhost:3000/api`

### Định dạng phản hồi

Các lỗi sẽ có cấu trúc như sau:

```json
{
  "statusCode": 400,
  "message": "Thông báo lỗi",
  "error": "Mô tả lỗi chi tiết"
}
```

## Triển khai với Docker

### Các dịch vụ chính

1. **API Service**
   - Port: 3000
   - Health check: `GET /health`
   - Environment: `.env`

2. **Frontend**
   - Port: 80 (qua Nginx)
   - Served by: Nginx
   - Environment: `ecdd_fe2/src/environments/environment.*.ts`

3. **Database (PostgreSQL)**
   - Port: 5432
   - Volume: `postgres_data`
   - Adminer: http://localhost:8080 (nếu được bật)

4. **Redis** (Nếu sử dụng cho cache/queue)
   - Port: 6379
   - Volume: `redis_data`

### Biến môi trường

Tạo file `.env` từ `.env.example` và cập nhật các giá trị phù hợp:

```env
# Backend
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:123456@postgres:5432/admin_ecdd?schema=public
JWT_SECRET=zeus_super_key
JWT_EXPIRES_IN=1d

# Frontend (được sử dụng trong quá trình build)
API_URL=http://localhost:3000/api
```

### Lệnh Docker thông dụng

```bash
# Khởi động tất cả dịch vụ
docker-compose up -d

# Xem logs
docker-compose logs -f

# Khởi động lại một dịch vụ
docker-compose restart service_name

# Xóa tất cả container và volume
docker-compose down -v
```

## Xác thực

Hầu hết các API yêu cầu xác thực thông qua JWT token. Token cần được gửi trong header của request:

```http
Authorization: Bearer your.jwt.token.here
```

### Lấy JWT token

1. Gửi request đăng nhập đến `/api/auth/login`
2. Lưu token từ response
3. Thêm token vào header `Authorization` cho các request tiếp theo

## Danh sách API

### Xác thực

#### Đăng nhập

- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "username": "tendangnhap",
    "password": "matkhau"
  }
  ```
- **Response thành công**:
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "tendangnhap",
      "email": "email@example.com",
      "role": "admin"
    }
  }
  ```

### Người dùng

## Kiểm tra sức khỏe (Health Check)

### Kiểm tra trạng thái API

- **URL**: `/health`
- **Method**: `GET`
- **Yêu cầu xác thực**: Không
- **Response thành công**:
  ```json
  {
    "status": "ok",
    "timestamp": "2023-01-01T00:00:00.000Z",
    "version": "1.0.0",
    "services": {
      "database": true,
      "redis": true
    }
  }
  ```

### Kiểm tra cơ sở dữ liệu

- **URL**: `/health/db`
- **Method**: `GET`
- **Yêu cầu xác thực**: Có (Admin)
- **Response thành công**:
  ```json
  {
    "status": "ok",
    "database": {
      "connection": "connected",
      "tables": 15,
      "migrations": {
        "pending": 0,
        "executed": 10
      }
    }
  }
  ```

## Người dùng

### Lấy thông tin người dùng hiện tại

- **URL**: `/api/users/me`
- **Method**: `GET`
- **Yêu cầu xác thực**: Có
- **Response thành công**:
  ```json
  {
    "id": 1,
    "username": "tendangnhap",
    "email": "email@example.com",
    "role": "admin",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
  ```

### Biểu mẫu (Forms)

#### Lấy danh sách biểu mẫu

- **URL**: `/api/forms`
- **Method**: `GET`
- **Yêu cầu xác thực**: Có
- **Query parameters**:
  - `page` (tùy chọn): Số trang (mặc định: 1)
  - `limit` (tùy chọn): Số bản ghi mỗi trang (mặc định: 10)
- **Response thành công**:
  ```json
  {
    "data": [
      {
        "id": 1,
        "name": "Mẫu khám sức khỏe",
        "description": "Phiếu khám sức khỏe định kỳ",
        "createdAt": "2023-01-01T00:00:00.000Z"
      }
    ],
    "meta": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
  ```

#### Tạo biểu mẫu mới

- **URL**: `/api/forms`
- **Method**: `POST`
- **Yêu cầu xác thực**: Có (Admin)
- **Body**:
  ```json
  {
    "name": "Mẫu đăng ký mới",
    "description": "Mô tả biểu mẫu",
    "schema": {
      "fields": [
        {
          "name": "ho_ten",
          "type": "text",
          "label": "Họ và tên",
          "required": true
        }
      ]
    }
  }
  ```
- **Response thành công**:
  ```json
  {
    "id": 2,
    "name": "Mẫu đăng ký mới",
    "description": "Mô tả biểu mẫu",
    "createdAt": "2023-01-02T00:00:00.000Z",
    "updatedAt": "2023-01-02T00:00:00.000Z"
  }
  ```

### Dữ liệu (Data)

#### Tải lên file đính kèm

- **URL**: `/api/upload`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Yêu cầu xác thực**: Có
- **Body**:
  - `file`: File cần tải lên
  - `folder` (tùy chọn): Thư mục đích
- **Response thành công**:
  ```json
  {
    "url": "/uploads/filename.ext",
    "path": "/var/www/uploads/filename.ext",
    "size": 1024,
    "mimetype": "image/png"
  }
  ```

#### Gửi dữ liệu biểu mẫu

- **URL**: `/api/form-instances`
- **Method**: `POST`
- **Yêu cầu xác thực**: Có
- **Body**:
  ```json
  {
    "formId": 1,
    "orgUnitId": 1,
    "periodId": 1,
    "values": [
      {
        "dataElementId": 1,
        "value": "Giá trị nhập vào"
      }
    ]
  }
  ```
- **Response thành công**:
  ```json
  {
    "id": 1,
    "formId": 1,
    "orgUnitId": 1,
    "periodId": 1,
    "status": "pending",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
  ```

### Tổ chức (Organization)

#### Lấy danh sách đơn vị tổ chức

- **URL**: `/api/org-units`
- **Method**: `GET`
- **Yêu cầu xác thực**: Có
- **Response thành công**:
  ```json
  [
    {
      "id": 1,
      "code": "BV01",
      "name": "Bệnh viện A",
      "level": 1,
      "parentId": null,
      "createdAt": "2023-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "code": "PK01",
      "name": "Phòng khám B",
      "level": 2,
      "parentId": 1,
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  ]
  ```

## Mã lỗi thường gặp

| Mã lỗi | Mô tả |
|--------|-------|
| 400 | Yêu cầu không hợp lệ |
| 401 | Không được phép truy cập |
| 403 | Từ chối truy cập |
| 404 | Không tìm thấy tài nguyên |
| 500 | Lỗi máy chủ nội bộ |

## Phân quyền

- **Admin**: Có toàn quyền truy cập tất cả các API
- **User**: Chỉ được phép xem và gửi dữ liệu
- **Guest**: Chỉ được phép xem một số API công khai
