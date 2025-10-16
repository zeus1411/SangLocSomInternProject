# 🏥 Hệ Thống Sàng Lọc Sớm (Denver II)

Dự án quản lý hệ thống sàng lọc phát triển trẻ em theo thang đo Denver II.

---

## 📋 Tổng quan

**Tech Stack**:
- **Backend**: Node.js + Express + TypeScript + Sequelize
- **Frontend**: Angular 14 + Bootstrap 5
- **Database**: PostgreSQL
- **Authentication**: JWT

**Tính năng chính**:
- ✅ Quản lý Form Instance (Phiếu sàng lọc)
- ✅ Quản lý User Profile
- ✅ Authentication & Authorization (JWT)
- ✅ Rate Limiting (Chống brute force)
- ✅ CRUD với UPDATE/INSERT logic thông minh

---

## 🚀 Quick Start

### **Cách 1: Đọc hướng dẫn nhanh (5 phút)**
```bash
# Xem file này để chạy nhanh nhất
QUICK_START.md
```

### **Cách 2: Đọc hướng dẫn chi tiết**
```bash
# Xem file này để hiểu rõ từng bước
SETUP_FULLSTACK.md
```

---

## 📁 Cấu trúc dự án

```
SangLocSomDemoInternProject/
│
├── ecdd_be2/                    # Backend
│   ├── src/
│   │   ├── Database/
│   │   │   └── 20251002101334.sql    # Database SQL file
│   │   ├── controllers/              # Business logic
│   │   ├── models/                   # Sequelize models
│   │   ├── routes/                   # API routes
│   │   ├── middlewares/              # Auth, Rate limiting
│   │   ├── dtos/                     # Data validation
│   │   └── app.ts                    # Entry point
│   ├── package.json
│   └── .env                          # Config (tạo mới)
│
├── ecdd_fe2/                    # Frontend
│   ├── src/
│   │   ├── app/                      # Angular components
│   │   ├── environments/
│   │   │   └── environment.ts        # API URL config
│   │   └── index.html
│   └── package.json
│
├── QUICK_START.md               # Hướng dẫn nhanh
├── SETUP_FULLSTACK.md           # Hướng dẫn chi tiết
├── FIX_CLARIFICATION.md         # Giải thích logic mới
├── TEST_CORRECT_LOGIC.md        # Test cases
└── README.md                    # File này
```

---

## 🔧 Cài đặt

### **Yêu cầu**:
- Node.js >= 14
- PostgreSQL >= 12
- npm hoặc yarn

### **Bước 1: Clone/Download dự án**
```bash
# Bạn đã có dự án rồi, bỏ qua bước này
```

### **Bước 2: Setup Database**
```bash
# Tạo database
psql -U postgres -c "CREATE DATABASE admin_ecdd;"

# Import SQL file
cd e:\SangLocSomDemoInternProject
psql -U postgres -d admin_ecdd -f ecdd_be2\src\Database\20251002101334.sql
```

### **Bước 3: Setup Backend**
```bash
cd ecdd_be2

# Tạo file .env (xem mẫu trong QUICK_START.md)
# Sửa DB_PASSWORD thành password PostgreSQL của bạn

# Install dependencies
npm install

# Chạy development server
npm run dev
```

### **Bước 4: Setup Frontend**
```bash
cd ecdd_fe2

# Install dependencies
npm install

# Chạy development server
npm start
```

### **Bước 5: Mở browser**
```
http://localhost:4200
```

---

## 📚 API Documentation

### **Authentication**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Đăng ký user mới |
| POST | `/api/auth/login` | ❌ | Đăng nhập (Rate limited) |
| GET | `/api/auth/profile` | ✅ | Lấy thông tin user |
| PUT | `/api/auth/profile/:id` | 🔶 | Update profile (3 JWT cases) |

### **Form Instance**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/forminstances` | ❌ | Lấy danh sách |
| GET | `/api/forminstances/:id` | ❌ | Lấy chi tiết |
| POST | `/api/forminstances` | ✅ | Tạo mới |
| PUT | `/api/forminstances/:id` | ✅ | Cập nhật (UPDATE/INSERT) |
| DELETE | `/api/forminstances/:id` | ✅ | Xóa |

**Legend**:
- ✅ Required: Bắt buộc token
- 🔶 Optional: Token optional (3 cases)
- ❌ Public: Không cần token

---

## 🎯 Tính năng đặc biệt

### **1. UPDATE/INSERT Logic thông minh** ⭐

**Vấn đề cũ**: Khi update form instance, tất cả values bị xóa và tạo lại → Mất ID

**Giải pháp mới**:
- Có `valueid` → **UPDATE** value đó
- Không có `valueid` → **INSERT** value mới
- Giữ nguyên ID, có thể track history

**Ví dụ**:
```json
PUT /api/forminstances/1
{
  "values": [
    {
      "valueid": 123,  // ← UPDATE value này
      "value": "Y"
    },
    {
      // ← INSERT value mới
      "datasetmemberid": 2,
      "value": "N"
    }
  ]
}
```

### **2. JWT với 3 trường hợp**

**Chỉ áp dụng cho Update User Profile**:

1. **Token hết hạn** → 401, bắt login lại
2. **Token hợp lệ** → `updatedby = username`
3. **Không có token** → `updatedby = guest_{IP}`

### **3. Rate Limiting**

**Chống brute force attacks**:
- Max 5 requests/15 phút cho login/register
- Block IP 30 phút nếu vượt quá
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

---

## 🧪 Testing

### **Test Backend**
```bash
# Xem file này
TEST_CORRECT_LOGIC.md
```

### **Test với Postman**
```bash
# Import collection (nếu có)
# Hoặc test thủ công theo TEST_CORRECT_LOGIC.md
```

### **Test Integration**
1. Chạy Backend (port 3000)
2. Chạy Frontend (port 4200)
3. Mở browser → `http://localhost:4200`
4. F12 → Network tab
5. Thử login/CRUD → Xem API calls

---

## 📖 Documentation Files

| File | Mục đích |
|------|----------|
| `QUICK_START.md` | Hướng dẫn chạy nhanh (5 phút) |
| `SETUP_FULLSTACK.md` | Hướng dẫn chi tiết từng bước |
| `FIX_CLARIFICATION.md` | Giải thích logic ĐÚNG vs SAI |
| `TEST_CORRECT_LOGIC.md` | Test cases và verification |
| `README.md` | File này - Tổng quan dự án |

---

## 🐛 Troubleshooting

### **Database connection failed**
```bash
# Kiểm tra PostgreSQL đang chạy
# Kiểm tra .env có đúng password không
```

### **Port already in use**
```bash
# Backend (port 3000)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Frontend (port 4200)
netstat -ano | findstr :4200
taskkill /PID <PID> /F
```

### **CORS Error**
```typescript
// Backend đã có CORS middleware
// Nếu vẫn lỗi, check environment.ts có đúng URL không
```

### **Frontend không gọi được API**
```typescript
// ecdd_fe2/src/environments/environment.ts
url : 'http://localhost:3000'  // ← Phải đúng port backend
```

---

## 🔐 Security

- ✅ JWT Authentication
- ✅ Password hashing (bcrypt)
- ✅ Rate Limiting
- ✅ Input validation (class-validator)
- ✅ CORS protection
- ✅ SQL Injection protection (Sequelize ORM)

---

## 🚀 Deployment

### **Backend**
```bash
cd ecdd_be2
npm run build
npm start
```

### **Frontend**
```bash
cd ecdd_fe2
ng build --configuration production
# Deploy dist/ folder to web server
```

---

## 📞 Support

**Nếu gặp vấn đề**:
1. Đọc `QUICK_START.md` hoặc `SETUP_FULLSTACK.md`
2. Kiểm tra console log (Backend và Frontend)
3. Kiểm tra Network tab trong DevTools
4. Verify database connection

---

## 📝 Changelog

### **Version 2.0.0** (Current)
- ✅ Sửa logic UPDATE/INSERT Form Instance Values
- ✅ Thêm 3 JWT cases cho User Profile
- ✅ Thêm Rate Limiting
- ✅ Bỏ logic IP tracking cho Form Instance
- ✅ Tạo API Update User Profile

### **Version 1.0.0**
- Initial release

---

## 👥 Team

**Intern**: SangLoc  
**Project**: Hệ thống Sàng lọc sớm Denver II  
**Year**: 2025

---

## 📄 License

Internal Project - Not for public distribution

---

**Last Updated**: October 15, 2025  
**Status**: ✅ Production Ready
