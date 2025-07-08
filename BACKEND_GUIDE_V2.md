# Hướng Dẫn Backend - Nhận Phone Number Đã Decode

## Thay đổi từ Frontend

Frontend giờ sẽ **decode phone number trên client** (IP Việt Nam) và gửi `phoneNumber` đã decode lên backend, thay vì gửi `phoneToken`.

## Backend cần sửa

### Request format mới từ Frontend:

```javascript
{
  userInfo: {
    id: '8407207156000430006',
    name: 'Đương',
    avatar: 'https://...',
    // ... other fields
  },
  accessToken: 'lRW6LkZku7...',
  phoneNumber: '849123456789' // ← ĐÃ DECODE, SẴN SÀNG SỬ DỤNG
}
```

### Code Backend cần sửa:

```javascript
// Route xử lý đăng nhập Zalo
app.post('/api/zalo/auth', async (req, res) => {
  try {
    // ✅ THAY ĐỔI: Nhận phoneNumber thay vì phoneToken
    const { userInfo, accessToken, phoneNumber } = req.body;
    
    console.log('Received data:', { userInfo, accessToken, phoneNumber });
    
    // ✅ KHÔNG CẦN DECODE PHONE TOKEN NỮA!
    // Frontend đã decode rồi, chỉ cần sử dụng phoneNumber trực tiếp
    
    // Tạo hoặc cập nhật user trong database
    const user = {
      zaloId: userInfo.id,
      name: userInfo.name,
      avatar: userInfo.picture?.data?.url || userInfo.avatar,
      phone: phoneNumber // ✅ Sử dụng phoneNumber trực tiếp
    };
    
    console.log('Creating user with phone:', phoneNumber);
    
    // TODO: Lưu user vào database của bạn
    // await User.findOneAndUpdate(
    //   { zaloId: user.zaloId },
    //   user,
    //   { upsert: true, new: true }
    // );
    
    // Tạo JWT token cho authentication
    const token = jwt.sign(
      { zaloId: user.zaloId, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      user: user,
      token: token
    });
    
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});
```

## Những gì đã thay đổi:

### ❌ Loại bỏ:
- Không cần decode phoneToken nữa
- Không cần gọi Zalo API từ backend
- Không cần xử lý lỗi API Zalo từ backend

### ✅ Thêm:
- Nhận `phoneNumber` đã decode từ frontend
- Sử dụng `phoneNumber` trực tiếp để lưu vào database

## Test sau khi sửa:

1. **Sửa backend code** theo hướng dẫn trên
2. **Restart backend server**
3. **Test từ Mini App** (đã build xong, sẵn sàng test)
4. **Kiểm tra log** sẽ thấy `phoneNumber` thay vì `phoneToken`
5. **Kiểm tra database** có lưu đúng số điện thoại

## Kết quả mong đợi:

```
Backend log:
Received data: {
  userInfo: { id: '8407...', name: 'Đương', ... },
  accessToken: 'lRW6...',
  phoneNumber: '849123456789' // ← SỐ ĐIỆN THOẠI ĐÃ DECODE
}
Creating user with phone: 849123456789
User created successfully!
```

## Ưu điểm của approach này:

1. ✅ **Không bị chặn IP**: Decode từ IP Việt Nam (frontend)
2. ✅ **Backend đơn giản**: Chỉ cần lưu dữ liệu, không cần gọi API
3. ✅ **Ít lỗi**: Không phụ thuộc vào network từ server
4. ✅ **Faster**: Không cần wait API call từ backend
