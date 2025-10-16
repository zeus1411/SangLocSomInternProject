# 🚀 Hướng Dẫn Setup Fullstack - Backend + Frontend

## 📋 Tổng quan

**Dự án**: Hệ thống Sàng Lọc Sớm (Denver II)  
**Backend**: Node.js + Express + TypeScript + PostgreSQL (Port 3000)  
**Frontend**: Angular 14 (Port 4200)  
**Database**: PostgreSQL

---

## 🏗️ Cấu trúc thư mục

```
SangLocSomDemoInternProject/
├── ecdd_be2/          # Backend (Node.js + Express)
│   ├── src/
│   │   ├── Database/
│   │   │   └── 20251002101334.sql  # ← File SQL database
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── app.ts
│   ├── package.json
│   └── .env
│
├── ecdd_fe2/          # Frontend (Angular 14)
│   ├── src/
│   │   ├── app/
│   │   ├── environments/
│   │   │   └── environment.ts  # ← Config API URL
│   │   └── index.html
│   ├── package.json
│   └── angular.json
│
└── SETUP_FULLSTACK.md  # ← File này
```

---

## 📝 Bước 1: Setup Database PostgreSQL

### **1.1. Cài đặt PostgreSQL**

Nếu chưa có PostgreSQL, download và cài đặt:
- **Windows**: https://www.postgresql.org/download/windows/
- **Mac**: `brew install postgresql`
- **Linux**: `sudo apt-get install postgresql`

### **1.2. Tạo Database**

Mở **pgAdmin** hoặc **psql** và chạy:

```sql
-- Tạo database mới
CREATE DATABASE admin_ecdd;

-- Kết nối vào database
\c admin_ecdd
```

### **1.3. Import File SQL**

**Option 1: Dùng pgAdmin**
1. Mở pgAdmin
2. Right-click vào database `admin_ecdd`
3. Chọn **Restore** hoặc **Query Tool**
4. Paste nội dung file `ecdd_be2/src/Database/20251002101334.sql`
5. Execute

**Option 2: Dùng psql command line**
```bash
# Di chuyển vào thư mục chứa file SQL
cd e:\SangLocSomDemoInternProject\ecdd_be2\src\Database

# Import file SQL
psql -U postgres -d admin_ecdd -f 20251002101334.sql
```

**Option 3: Dùng PowerShell**
```powershell
# Chạy từ thư mục gốc
Get-Content "ecdd_be2\src\Database\20251002101334.sql" | psql -U postgres -d admin_ecdd
```

### **1.4. Verify Database**

```sql
-- Kiểm tra các tables đã được tạo
\dt

-- Kết quả mong đợi:
-- users, form, form_instance, form_instance_value, 
-- dataelement, dataset, datasetmember, period, orgunit, etc.
```

---

## 📝 Bước 2: Setup Backend (ecdd_be2)

### **2.1. Di chuyển vào thư mục backend**

```bash
cd e:\SangLocSomDemoInternProject\ecdd_be2
```

### **2.2. Cấu hình .env**

Tạo file `.env` trong thư mục `ecdd_be2`:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=admin_ecdd
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# JWT Configuration
JWT_SECRET=your_super_secret_key_here_change_in_production
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development
```

**⚠️ Quan trọng**: Thay `your_postgres_password` bằng password PostgreSQL của bạn!

### **2.3. Install Dependencies**

```bash
npm install
```

### **2.4. Chạy Backend**

```bash
# Development mode (auto-reload)
npm run dev

# Hoặc build và chạy production
npm run build
npm start
```

### **2.5. Verify Backend**

Mở browser hoặc Postman:
```
GET http://localhost:3000
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Sàng lọc sớm is running",
  "version": "1.0.0",
  "timestamp": "2025-10-15T..."
}
```

**✅ Backend đang chạy thành công!**

---

## 📝 Bước 3: Setup Frontend (ecdd_fe2)

### **3.1. Di chuyển vào thư mục frontend**

```bash
cd e:\SangLocSomDemoInternProject\ecdd_fe2
```

### **3.2. Install Dependencies**

```bash
npm install
```

### **3.3. Cấu hình API URL**

File `ecdd_fe2/src/environments/environment.ts` đã được cấu hình:

```typescript
export const environment = {
  production: false,
  url : 'http://localhost:8108'  // ← Cần sửa lại!
};
```

**⚠️ Vấn đề**: Frontend đang trỏ vào port **8108**, nhưng Backend chạy ở port **3000**!

**Sửa lại**:

```typescript
export const environment = {
  production: false,
  url : 'http://localhost:3000'  // ← Đổi thành port 3000
};
```

### **3.4. Chạy Frontend**

```bash
npm start

# Hoặc
ng serve
```

### **3.5. Verify Frontend**

Mở browser:
```
http://localhost:4200
```

**✅ Frontend đang chạy thành công!**

---

## 📝 Bước 4: Test Integration (Backend + Frontend)

### **4.1. Test Login từ Frontend**

1. Mở browser: `http://localhost:4200`
2. Vào trang Login
3. Nhập username/password (nếu đã có trong database)
4. Click Login

**Backend sẽ nhận request**:
```
POST http://localhost:3000/api/auth/login
```

### **4.2. Kiểm tra Network Tab**

1. Mở **DevTools** (F12)
2. Tab **Network**
3. Xem các API calls:
   - `POST /api/auth/login`
   - `GET /api/forminstances`
   - etc.

### **4.3. Kiểm tra CORS**

Nếu gặp lỗi CORS, backend đã có `cors()` middleware:

```typescript
// ecdd_be2/src/app.ts
app.use(cors());  // ✅ Đã có
```

---

## 🔧 Troubleshooting

### **Lỗi 1: Cannot connect to database**

**Nguyên nhân**: Sai thông tin database trong `.env`

**Giải pháp**:
```bash
# Kiểm tra PostgreSQL đang chạy
# Windows: Services → PostgreSQL
# Mac/Linux: sudo service postgresql status

# Kiểm tra .env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=admin_ecdd
DB_USER=postgres
DB_PASSWORD=<your_password>
```

---

### **Lỗi 2: Frontend không gọi được API**

**Nguyên nhân**: Sai URL trong `environment.ts`

**Giải pháp**:
```typescript
// ecdd_fe2/src/environments/environment.ts
export const environment = {
  production: false,
  url : 'http://localhost:3000'  // ← Phải đúng port backend
};
```

---

### **Lỗi 3: CORS Error**

**Nguyên nhân**: Backend chưa enable CORS

**Giải pháp**: Backend đã có `cors()`, nhưng nếu vẫn lỗi:

```typescript
// ecdd_be2/src/app.ts
app.use(cors({
  origin: 'http://localhost:4200',  // Frontend URL
  credentials: true
}));
```

---

### **Lỗi 4: Port 3000 already in use**

**Giải pháp**:

**Option 1**: Đổi port backend
```bash
# .env
PORT=8108  # Đổi thành 8108 như frontend đang config
```

**Option 2**: Kill process đang dùng port 3000
```powershell
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

---

### **Lỗi 5: Database tables không tồn tại**

**Nguyên nhân**: Chưa import file SQL

**Giải pháp**:
```bash
# Import lại file SQL
psql -U postgres -d admin_ecdd -f ecdd_be2/src/Database/20251002101334.sql
```

---

## 📊 Kiến trúc Fullstack

```
┌─────────────────────────────────────────────────────────┐
│                     Browser                             │
│              http://localhost:4200                      │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ HTTP Requests
                        │ (API Calls)
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Angular Frontend (Port 4200)               │
│  ┌─────────────────────────────────────────────────┐   │
│  │  environment.ts                                  │   │
│  │  url: 'http://localhost:3000'                   │   │
│  └─────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ API Calls
                        │ (GET, POST, PUT, DELETE)
                        ▼
┌─────────────────────────────────────────────────────────┐
│         Node.js Backend (Port 3000)                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Express + TypeScript                            │   │
│  │  - /api/auth/login                              │   │
│  │  - /api/forminstances                           │   │
│  │  - /api/auth/profile                            │   │
│  └─────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ SQL Queries
                        │ (Sequelize ORM)
                        ▼
┌─────────────────────────────────────────────────────────┐
│         PostgreSQL Database (Port 5432)                 │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Database: admin_ecdd                            │   │
│  │  - users                                         │   │
│  │  - form, form_instance, form_instance_value     │   │
│  │  - dataelement, dataset, datasetmember          │   │
│  │  - period, orgunit, program                     │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Checklist Hoàn thành

### **Database**:
- [ ] PostgreSQL đã cài đặt
- [ ] Database `admin_ecdd` đã tạo
- [ ] File SQL đã import thành công
- [ ] Verify tables tồn tại (`\dt`)

### **Backend**:
- [ ] Dependencies đã install (`npm install`)
- [ ] File `.env` đã cấu hình đúng
- [ ] Backend chạy thành công (`npm run dev`)
- [ ] Test endpoint `GET http://localhost:3000` → 200 OK

### **Frontend**:
- [ ] Dependencies đã install (`npm install`)
- [ ] `environment.ts` đã sửa URL thành `http://localhost:3000`
- [ ] Frontend chạy thành công (`npm start`)
- [ ] Mở browser `http://localhost:4200` thành công

### **Integration**:
- [ ] Frontend gọi được API backend
- [ ] Login thành công
- [ ] Không có CORS error
- [ ] Data hiển thị đúng

---

## 🚀 Quick Start Commands

### **Terminal 1 - Backend**:
```bash
cd e:\SangLocSomDemoInternProject\ecdd_be2
npm install
npm run dev
```

### **Terminal 2 - Frontend**:
```bash
cd e:\SangLocSomDemoInternProject\ecdd_fe2
npm install
npm start
```

### **Browser**:
```
http://localhost:4200
```

---

## 📚 API Endpoints (Backend)

### **Authentication**:
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Lấy thông tin user (cần token)
- `PUT /api/auth/profile/:id` - Update profile (optional token)

### **Form Instance**:
- `GET /api/forminstances` - Lấy danh sách
- `GET /api/forminstances/:id` - Lấy chi tiết
- `POST /api/forminstances` - Tạo mới (cần token)
- `PUT /api/forminstances/:id` - Cập nhật (cần token)
- `DELETE /api/forminstances/:id` - Xóa (cần token)

### **Program**:
- `GET /api/programs` - Lấy danh sách programs

---

## 💡 Tips

1. **Luôn chạy Backend trước, Frontend sau**
2. **Kiểm tra port không bị conflict**
3. **Xem console log để debug**
4. **Dùng Postman để test API trước khi test từ Frontend**
5. **Kiểm tra Network tab trong DevTools**

---

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra console log (Backend và Frontend)
2. Kiểm tra Network tab trong DevTools
3. Verify database connection
4. Restart cả Backend và Frontend

---

**Version**: 1.0.0  
**Last Updated**: October 2025  
**Status**: ✅ Ready for Development
