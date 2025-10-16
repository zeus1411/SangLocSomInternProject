# 🧪 Test API - Logic ĐÚNG

## 📌 Làm rõ valueid

**valueid = id của bảng form_instance_value**

```sql
-- Bảng form_instance_value
id  | forminstanceid | datasetmemberid | dataelementid | value
----|----------------|-----------------|---------------|------
123 | 1              | 1               | 1             | Y
124 | 1              | 2               | 2             | N
```

Khi UPDATE:
```json
{
  "values": [
    {
      "valueid": 123,  // ← id từ bảng trên
      "value": "N"     // Update từ Y → N
    }
  ]
}
```

---

## 🎯 Test Form Instance (BẮT BUỘC Token)

### **Test 1: Create Form Instance - Có Token** ✅

```http
POST http://localhost:3000/api/forminstances
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Nguyễn Văn A",
  "birthday": "2023-01-15",
  "formid": 1,
  "values": [
    {
      "datasetmemberid": 1,
      "dataelementid": 1,
      "value": "Y"
    },
    {
      "datasetmemberid": 2,
      "dataelementid": 2,
      "value": "N"
    }
  ]
}
```

**Expected Response (201)**:
```json
{
  "success": true,
  "message": "Form instance created successfully",
  "data": {
    "id": 1,
    "name": "Nguyễn Văn A",
    "createdby": "testuser",  // ← Từ token
    "createddate": "2025-10-15T..."
  }
}
```

---

### **Test 2: Create Form Instance - KHÔNG có Token** ❌

```http
POST http://localhost:3000/api/forminstances
Content-Type: application/json
# NO Authorization header

{
  "name": "Should Fail",
  "formid": 1
}
```

**Expected Response (401)**:
```json
{
  "success": false,
  "message": "No token provided. Please login first."
}
```

---

### **Test 3: Get Form Instance để lấy valueid** 📋

```http
GET http://localhost:3000/api/forminstances/1
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Nguyễn Văn A",
    "formInstanceValues": [
      {
        "id": 1,  // ← valueid này
        "datasetmemberid": 1,
        "dataelementid": 1,
        "value": "Y"
      },
      {
        "id": 2,  // ← valueid này
        "datasetmemberid": 2,
        "dataelementid": 2,
        "value": "N"
      }
    ]
  }
}
```

**📝 Lưu lại các valueid: 1, 2**

---

### **Test 4: Update - UPDATE Existing Values** ⭐

```http
PUT http://localhost:3000/api/forminstances/1
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Nguyễn Văn A (Updated)",
  "values": [
    {
      "valueid": 1,  // ← UPDATE value id=1
      "datasetmemberid": 1,
      "dataelementid": 1,
      "value": "N"  // Changed Y → N
    },
    {
      "valueid": 2,  // ← UPDATE value id=2
      "datasetmemberid": 2,
      "dataelementid": 2,
      "value": "Y"  // Changed N → Y
    }
  ]
}
```

**Expected Response (200)**:
```json
{
  "success": true,
  "message": "Form instance updated successfully",
  "data": {
    "id": 1,
    "name": "Nguyễn Văn A (Updated)"
  }
}
```

**✅ Verify**:
```http
GET http://localhost:3000/api/forminstances/1

# Kiểm tra:
# - Value id=1 có value="N" (đã đổi)
# - Value id=2 có value="Y" (đã đổi)
# - ID vẫn là 1 và 2 (KHÔNG thay đổi)
```

---

### **Test 5: Update - INSERT New Values** ⭐

```http
PUT http://localhost:3000/api/forminstances/1
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "values": [
    {
      "valueid": 1,  // ← UPDATE existing
      "datasetmemberid": 1,
      "dataelementid": 1,
      "value": "Y"
    },
    {
      // ← Không có valueid → INSERT new
      "datasetmemberid": 3,
      "dataelementid": 3,
      "value": "Y"
    },
    {
      // ← INSERT another new
      "datasetmemberid": 4,
      "dataelementid": 4,
      "value": "N"
    }
  ]
}
```

**Expected Response (200)**:
```json
{
  "success": true,
  "message": "Form instance updated successfully"
}
```

**✅ Verify**:
```http
GET http://localhost:3000/api/forminstances/1

# Kiểm tra:
# - Value id=1 vẫn tồn tại (UPDATE)
# - Value id=2 vẫn tồn tại (không đổi)
# - 2 values mới với id=3, id=4 (INSERT)
# - Tổng cộng 4 values
```

---

### **Test 6: Update - Mix UPDATE & INSERT** ⭐

```http
PUT http://localhost:3000/api/forminstances/1
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Final Update",
  "values": [
    {
      "valueid": 1,  // UPDATE
      "datasetmemberid": 1,
      "dataelementid": 1,
      "value": "N"
    },
    {
      "valueid": 3,  // UPDATE
      "datasetmemberid": 3,
      "dataelementid": 3,
      "value": "N"
    },
    {
      // INSERT
      "datasetmemberid": 5,
      "dataelementid": 5,
      "value": "Y"
    }
  ]
}
```

**✅ Verify**:
- Value id=1 được UPDATE
- Value id=2 không đổi (không có trong request)
- Value id=3 được UPDATE
- Value id=4 không đổi
- Value mới id=5 được INSERT

---

### **Test 7: Update - Token Hết Hạn** ❌

```http
PUT http://localhost:3000/api/forminstances/1
Authorization: Bearer EXPIRED_TOKEN
Content-Type: application/json

{
  "name": "Should Fail"
}
```

**Expected Response (401)**:
```json
{
  "success": false,
  "message": "Token has expired. Please login again to continue editing."
}
```

---

### **Test 8: Delete - Cần Token** ✅

```http
DELETE http://localhost:3000/api/forminstances/1
Authorization: Bearer YOUR_TOKEN
```

**Expected Response (200)**:
```json
{
  "success": true,
  "message": "Deleted successfully"
}
```

---

### **Test 9: Delete - Không có Token** ❌

```http
DELETE http://localhost:3000/api/forminstances/1
# NO Authorization header
```

**Expected Response (401)**:
```json
{
  "success": false,
  "message": "No token provided. Please login first."
}
```

---

## 🎯 Test User Profile (3 JWT Cases)

### **Test 10: Update Profile - Có Token** ✅

```http
PUT http://localhost:3000/api/auth/profile/1
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "fullname": "Updated Name",
  "email": "updated@email.com"
}
```

**Expected Response (200)**:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "username": "testuser",
    "fullname": "Updated Name",
    "email": "updated@email.com"
  }
}
```

**Note**: `updatedby = "testuser"` (từ token)

---

### **Test 11: Update Profile - KHÔNG có Token** ✅

```http
PUT http://localhost:3000/api/auth/profile/1
Content-Type: application/json
# NO Authorization header

{
  "fullname": "Guest Update"
}
```

**Expected Response (200)**:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "fullname": "Guest Update"
  }
}
```

**Note**: `updatedby = "guest_::1"` (IP address)

---

### **Test 12: Update Profile - Token Hết Hạn** ❌

```http
PUT http://localhost:3000/api/auth/profile/1
Authorization: Bearer EXPIRED_TOKEN
Content-Type: application/json

{
  "fullname": "Should Fail"
}
```

**Expected Response (401)**:
```json
{
  "success": false,
  "message": "Token has expired. Please login again to continue editing."
}
```

---

## 🛡️ Test Rate Limiting

### **Test 13: Login 6 lần liên tục**

```http
# Request 1
POST http://localhost:3000/api/auth/login
Content-Type: application/json
{"username": "testuser", "password": "Test123456"}
→ 200 OK

# Request 2
POST http://localhost:3000/api/auth/login
{"username": "testuser", "password": "Test123456"}
→ 200 OK

# Request 3
POST http://localhost:3000/api/auth/login
{"username": "testuser", "password": "Test123456"}
→ 200 OK

# Request 4
POST http://localhost:3000/api/auth/login
{"username": "testuser", "password": "Test123456"}
→ 200 OK

# Request 5
POST http://localhost:3000/api/auth/login
{"username": "testuser", "password": "Test123456"}
→ 200 OK

# Request 6
POST http://localhost:3000/api/auth/login
{"username": "testuser", "password": "Test123456"}
→ 429 Too Many Requests
```

**Expected Response (429)**:
```json
{
  "success": false,
  "message": "Too many login attempts. Your IP has been temporarily blocked for 30 minutes."
}
```

---

## 📊 Bảng tổng hợp Test Cases

| Test | Endpoint | Token | Expected | Pass |
|------|----------|-------|----------|------|
| 1 | POST /forminstances | ✅ Yes | 201 Created | [ ] |
| 2 | POST /forminstances | ❌ No | 401 Unauthorized | [ ] |
| 3 | GET /forminstances/:id | ❌ No | 200 OK | [ ] |
| 4 | PUT /forminstances/:id (UPDATE) | ✅ Yes | 200 OK | [ ] |
| 5 | PUT /forminstances/:id (INSERT) | ✅ Yes | 200 OK | [ ] |
| 6 | PUT /forminstances/:id (MIX) | ✅ Yes | 200 OK | [ ] |
| 7 | PUT /forminstances/:id | ⏰ Expired | 401 Unauthorized | [ ] |
| 8 | DELETE /forminstances/:id | ✅ Yes | 200 OK | [ ] |
| 9 | DELETE /forminstances/:id | ❌ No | 401 Unauthorized | [ ] |
| 10 | PUT /auth/profile/:id | ✅ Yes | 200 OK | [ ] |
| 11 | PUT /auth/profile/:id | ❌ No | 200 OK | [ ] |
| 12 | PUT /auth/profile/:id | ⏰ Expired | 401 Unauthorized | [ ] |
| 13 | POST /auth/login (x6) | - | 429 on 6th | [ ] |

---

## 🔍 Verification Steps

### **Verify UPDATE vs INSERT:**

1. **Tạo Form Instance mới**
   ```
   POST /forminstances → id=1
   ```

2. **Get để xem values**
   ```
   GET /forminstances/1
   → values: [{id: 1, value: "Y"}, {id: 2, value: "N"}]
   ```

3. **UPDATE values**
   ```
   PUT /forminstances/1
   Body: {values: [{valueid: 1, value: "N"}]}
   ```

4. **Verify UPDATE**
   ```
   GET /forminstances/1
   → values: [{id: 1, value: "N"}]  // ✅ ID giữ nguyên, value đổi
   ```

5. **INSERT new value**
   ```
   PUT /forminstances/1
   Body: {values: [{datasetmemberid: 3, value: "Y"}]}
   ```

6. **Verify INSERT**
   ```
   GET /forminstances/1
   → values: [
       {id: 1, value: "N"},  // Cũ
       {id: 2, value: "N"},  // Cũ
       {id: 3, value: "Y"}   // ✅ Mới
     ]
   ```

---

## 💡 Tips

1. **Lấy token**: Login trước, copy token từ response
2. **Lấy valueid**: GET form instance, copy id từ formInstanceValues
3. **Test UPDATE**: Dùng valueid từ bước 2
4. **Test INSERT**: Không truyền valueid
5. **Test rate limit**: Gửi 6 requests nhanh liên tục

---

**Happy Testing! 🚀**
