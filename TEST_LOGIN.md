# Hướng dẫn tạo user và test login

## Cách 1: Tạo user qua Browser Console

1. Mở browser tại `http://localhost:4202`
2. Mở Developer Tools (F12)
3. Vào tab Console
4. Paste và chạy code sau:

```javascript
fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'testuser',
    password: '123456',
    fullname: 'Test User',
    email: 'test@example.com'
  })
})
.then(r => r.json())
.then(data => {
  console.log('Response:', data);
  if (data.success) {
    console.log('✅ User created!');
    console.log('Username: testuser');
    console.log('Password: 123456');
  } else {
    console.log('❌ Error:', data.message);
  }
})
.catch(err => console.error('Error:', err));
```

## Cách 2: Tạo user qua PowerShell

```powershell
$body = @{
    username = "testuser"
    password = "123456"
    fullname = "Test User"
    email = "test@example.com"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

## Cách 3: Kiểm tra user đã tồn tại

Nếu user `testuser` đã tồn tại trong database, bạn có thể login trực tiếp với:
- **Username:** testuser
- **Password:** (password trong database)

## Lỗi 404 Not Found

Lỗi 404 thường do:

1. **Favicon missing** - Angular tự động tìm `/favicon.ico`
   - Không ảnh hưởng đến chức năng
   - Có thể bỏ qua

2. **Static assets missing** - CSS, JS, images
   - Kiểm tra Network tab trong DevTools
   - Xem file nào bị 404

3. **API route không tồn tại**
   - Đã fix tất cả routes với prefix `/api`

## Form Field Warnings

Warnings về `id` và `name` attributes:
- Chỉ là accessibility warnings
- Không ảnh hưởng chức năng
- Có thể fix sau

## Test Login

Sau khi tạo user, test login:

1. Vào `http://localhost:4202/login`
2. Nhập:
   - Username: `testuser`
   - Password: `123456`
3. Click "Đăng nhập"

Nếu thành công, sẽ redirect đến `/member/results`
