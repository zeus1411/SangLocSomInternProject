# ✅ Checklist Setup Fullstack

## 📋 Trước khi bắt đầu

- [ ] Đã cài đặt **Node.js** (>= 14)
- [ ] Đã cài đặt **PostgreSQL** (>= 12)
- [ ] Đã cài đặt **pgAdmin** (hoặc biết dùng psql)
- [ ] Biết **password PostgreSQL** của mình

---

## 🗄️ Database Setup

- [ ] PostgreSQL đang chạy (check Services trên Windows)
- [ ] Đã tạo database `admin_ecdd`
- [ ] Đã import file `ecdd_be2\src\Database\20251002101334.sql`
- [ ] Verify: Mở pgAdmin → Database có ~15 tables

**Commands đã chạy**:
```bash
psql -U postgres -c "CREATE DATABASE admin_ecdd;"
psql -U postgres -d admin_ecdd -f ecdd_be2\src\Database\20251002101334.sql
```

---

## 🔧 Backend Setup (ecdd_be2)

- [ ] Đã tạo file `.env` trong thư mục `ecdd_be2`
- [ ] File `.env` có đầy đủ thông tin:
  - [ ] `DB_HOST=localhost`
  - [ ] `DB_PORT=5432`
  - [ ] `DB_NAME=admin_ecdd`
  - [ ] `DB_USER=postgres`
  - [ ] `DB_PASSWORD=<your_password>` ← **Đã thay đổi**
  - [ ] `JWT_SECRET=<random_string>`
  - [ ] `PORT=3000`
- [ ] Đã chạy `npm install` trong `ecdd_be2`
- [ ] Đã chạy `npm run dev`
- [ ] Backend chạy thành công (thấy message ✅)
- [ ] Test: `http://localhost:3000` → Thấy JSON response

**Terminal 1**:
```bash
cd ecdd_be2
npm install
npm run dev
```

**Expected output**:
```
✅ Kết nối database thành công
✅ Đồng bộ hóa database thành công
🚀 Server đang chạy tại http://localhost:3000
```

---

## 🎨 Frontend Setup (ecdd_fe2)

- [ ] File `environment.ts` đã sửa URL thành `http://localhost:3000`
- [ ] Đã chạy `npm install` trong `ecdd_fe2`
- [ ] Đã chạy `npm start`
- [ ] Frontend chạy thành công
- [ ] Test: `http://localhost:4200` → Thấy trang web

**Terminal 2**:
```bash
cd ecdd_fe2
npm install
npm start
```

**Expected output**:
```
** Angular Live Development Server is listening on localhost:4200 **
✔ Compiled successfully.
```

---

## 🔗 Integration Testing

- [ ] Mở browser: `http://localhost:4200`
- [ ] F12 → Tab Network
- [ ] Thử login hoặc xem data
- [ ] Network tab có requests đến `http://localhost:3000/api/...`
- [ ] Không có CORS error
- [ ] Data hiển thị đúng

---

## 🧪 API Testing

### **Test 1: Health Check**
- [ ] `GET http://localhost:3000` → 200 OK
- [ ] Response: `{"success": true, "message": "Sàng lọc sớm is running"}`

### **Test 2: Login (nếu có user)**
- [ ] `POST http://localhost:3000/api/auth/login`
- [ ] Body: `{"username": "...", "password": "..."}`
- [ ] Response: Token

### **Test 3: Get Form Instances**
- [ ] `GET http://localhost:3000/api/forminstances`
- [ ] Response: Array of form instances

---

## 🐛 Troubleshooting

### **Nếu Backend không chạy**:
- [ ] PostgreSQL đang chạy?
- [ ] File `.env` có đúng password?
- [ ] Port 3000 có bị chiếm?
- [ ] Database `admin_ecdd` đã tạo?
- [ ] File SQL đã import?

### **Nếu Frontend không chạy**:
- [ ] `npm install` đã chạy thành công?
- [ ] Port 4200 có bị chiếm?
- [ ] `environment.ts` có đúng URL?

### **Nếu Frontend không gọi được Backend**:
- [ ] Backend đang chạy?
- [ ] `environment.ts` URL = `http://localhost:3000`?
- [ ] Không có CORS error?
- [ ] Check Network tab trong DevTools

---

## 📊 Status Summary

| Component | Port | URL | Status |
|-----------|------|-----|--------|
| PostgreSQL | 5432 | localhost:5432 | [ ] Running |
| Backend | 3000 | http://localhost:3000 | [ ] Running |
| Frontend | 4200 | http://localhost:4200 | [ ] Running |
| Integration | - | - | [ ] Working |

---

## 🎯 Final Check

- [ ] Backend terminal không có error
- [ ] Frontend terminal không có error
- [ ] Browser console không có error
- [ ] Network tab có API calls thành công
- [ ] Data hiển thị đúng trên UI

---

## 📝 Notes

**Ghi chú vấn đề gặp phải**:
```
(Ghi ở đây nếu có lỗi để dễ debug)




```

**Thông tin quan trọng**:
- Database name: `admin_ecdd`
- Backend port: `3000`
- Frontend port: `4200`
- PostgreSQL port: `5432`

---

## ✅ Hoàn thành!

Khi tất cả checkbox đã tick ✅:
- Backend đang chạy
- Frontend đang chạy
- Database đã setup
- Integration hoạt động

**→ Bạn đã sẵn sàng để develop! 🎉**

---

**Tip**: Print file này ra và tick từng bước khi làm!
