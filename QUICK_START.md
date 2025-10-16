# ⚡ Quick Start - Chạy Fullstack trong 5 phút

## 🎯 Mục tiêu
Chạy Backend + Frontend + Database trong thời gian ngắn nhất.

---

## 📋 Bước 1: Import Database (2 phút)

### **Option 1: Dùng pgAdmin (Dễ nhất)**
1. Mở **pgAdmin**
2. Tạo database mới tên `admin_ecdd`
3. Right-click database → **Query Tool**
4. Mở file: `ecdd_be2\src\Database\20251002101334.sql`
5. Copy toàn bộ nội dung → Paste vào Query Tool
6. Click **Execute** (F5)
7. ✅ Done!

### **Option 2: Dùng Command Line**
```powershell
# Mở PowerShell tại thư mục gốc dự án
cd e:\SangLocSomDemoInternProject

# Tạo database
psql -U postgres -c "CREATE DATABASE admin_ecdd;"

# Import SQL file
psql -U postgres -d admin_ecdd -f ecdd_be2\src\Database\20251002101334.sql
```

**✅ Verify**: Mở pgAdmin → Database `admin_ecdd` → Tables (phải có ~15 tables)

---

## 📋 Bước 2: Setup Backend (1 phút)

### **2.1. Tạo file .env**

Tạo file `ecdd_be2\.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=admin_ecdd
DB_USER=postgres
DB_PASSWORD=postgres

JWT_SECRET=my_super_secret_key_2025
JWT_EXPIRES_IN=7d

PORT=3000
NODE_ENV=development
```

**⚠️ Thay `DB_PASSWORD` bằng password PostgreSQL của bạn!**

### **2.2. Install & Run**

```powershell
# Terminal 1 - Backend
cd ecdd_be2
npm install
npm run dev
```

**✅ Thấy message**: 
```
✅ Kết nối database thành công
✅ Đồng bộ hóa database thành công
🚀 Server đang chạy tại http://localhost:3000
```

**✅ Test**: Mở browser → `http://localhost:3000` → Thấy JSON response

---

## 📋 Bước 3: Setup Frontend (1 phút)

```powershell
# Terminal 2 - Frontend
cd ecdd_fe2
npm install
npm start
```

**✅ Thấy message**:
```
** Angular Live Development Server is listening on localhost:4200 **
✔ Compiled successfully.
```

**✅ Test**: Mở browser → `http://localhost:4200` → Thấy trang web

---

## 🎉 Done! Kiểm tra Integration

### **Test 1: Backend Health Check**
```
Browser: http://localhost:3000
→ Thấy: {"success": true, "message": "Sàng lọc sớm is running"}
```

### **Test 2: Frontend**
```
Browser: http://localhost:4200
→ Thấy: Trang web Angular
```

### **Test 3: Frontend gọi Backend**
1. Mở `http://localhost:4200`
2. F12 → Tab **Network**
3. Thử login hoặc xem data
4. Xem Network tab → Phải có requests đến `http://localhost:3000/api/...`

---

## 🐛 Troubleshooting Nhanh

### **Lỗi: Cannot connect to database**
```powershell
# Kiểm tra PostgreSQL đang chạy
# Windows: Win + R → services.msc → Tìm PostgreSQL

# Kiểm tra password trong .env
DB_PASSWORD=<your_password>
```

### **Lỗi: Port 3000 already in use**
```powershell
# Kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Hoặc đổi port trong .env
PORT=8108
```

### **Lỗi: Frontend không gọi được API**
```typescript
// Kiểm tra file: ecdd_fe2\src\environments\environment.ts
url : 'http://localhost:3000'  // ← Phải đúng port backend
```

### **Lỗi: CORS**
Backend đã có CORS middleware, nếu vẫn lỗi:
```typescript
// ecdd_be2\src\app.ts
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
```

---

## 📊 Tóm tắt

| Component | Port | URL | Status |
|-----------|------|-----|--------|
| PostgreSQL | 5432 | localhost:5432 | ✅ Running |
| Backend | 3000 | http://localhost:3000 | ✅ Running |
| Frontend | 4200 | http://localhost:4200 | ✅ Running |

---

## 🚀 Commands Tóm tắt

```powershell
# Terminal 1 - Backend
cd ecdd_be2
npm install
npm run dev

# Terminal 2 - Frontend  
cd ecdd_fe2
npm install
npm start

# Browser
http://localhost:4200
```

---

**Thời gian**: ~5 phút  
**Kết quả**: Fullstack app đang chạy! 🎉
