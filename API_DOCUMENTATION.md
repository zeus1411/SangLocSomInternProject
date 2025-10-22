# Tài liệu API ECDD

## Mục lục
1. [Tổng quan](#tổng-quan)
2. [Xác thực](#xác-thực)
3. [Danh sách API](#danh-sách-api)
   - [Xác thực](#xác-thực-1)
   - [Người dùng](#người-dùng)
   - [Biểu mẫu (Forms)](#biểu-mẫu-forms)
   - [Dữ liệu (Data)](#dữ-liệu-data)
   - [Tổ chức (Organization)](#tổ-chức-organization)

## Tổng quan

Tất cả các API đều trả về dữ liệu dưới dạng JSON. Các lỗi sẽ có cấu trúc như sau:

```json
{
  "statusCode": 400,
  "message": "Thông báo lỗi",
  "error": "Mô tả lỗi chi tiết"
}
```

## Xác thực

Hầu hết các API yêu cầu xác thực thông qua JWT token. Token cần được gửi trong header của request:

```
Authorization: Bearer <token>
```

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

#### Lấy thông tin người dùng hiện tại

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
