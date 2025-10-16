# Sửa lỗi 404 và 429

## Lỗi 1: 429 Too Many Requests

**Nguyên nhân:** Thử login quá nhiều lần (>5 lần trong 15 phút)

**Giải pháp:**

### Cách 1: Chờ 30 phút
Rate limit sẽ tự động reset sau 30 phút.

### Cách 2: Restart backend (Nhanh nhất)
```powershell
# Trong terminal backend, nhấn Ctrl+C để stop
# Sau đó chạy lại:
npm run dev
```

Rate limiter lưu trong memory, restart sẽ xóa hết.

---

## Lỗi 2: 404 Program not found

**Nguyên nhân:** Database không có program với code 'ecdd'

**Giải pháp:** Import data từ file SQL

### Bước 1: Kiểm tra database có data không

```sql
-- Kết nối database
psql -U postgres -d admin_ecdd

-- Hoặc trong pgAdmin, chạy query:
SELECT * FROM program WHERE code = 'ecdd';
```

### Bước 2: Nếu không có data, import file SQL

```powershell
# Chạy trong PowerShell
psql -U admin-ecdd -d admin_ecdd -f "e:\SangLocSomDemoInternProject\ecdd_be2\src\Database\20251002101334.sql"
```

**Lưu ý:** File SQL này rất lớn (38MB), có thể mất vài phút để import.

### Bước 3: Hoặc tạo program test thủ công

```sql
-- Tạo program 'ecdd' nếu chưa có
INSERT INTO program (code, name, note, trial651)
VALUES ('ecdd', 'Early Childhood Development', 'Program for child development screening', NULL)
ON CONFLICT (code) DO NOTHING;

-- Kiểm tra lại
SELECT * FROM program WHERE code = 'ecdd';
```

---

## Sau khi fix

1. **Restart backend** để reset rate limit
2. **Kiểm tra program** đã có trong database
3. **Login lại** tại `http://localhost:4202/login`
   - Username: `testuser`
   - Password: `123456`

---

## Tạm thời disable rate limiting (Chỉ dùng khi dev)

Nếu muốn tắt rate limiting tạm thời để test:

### Sửa file: `ecdd_be2/src/routes/auth.routes.ts`

```typescript
// Tạm thời comment rate limiter
router.post('/register', /* loginRateLimiter, */ (req, res) => authController.register(req, res));
router.post('/login', /* loginRateLimiter, */ (req, res) => authController.login(req, res));
```

**Nhớ bật lại khi deploy production!**
