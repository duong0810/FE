# 🔑 CÁCH LẤY SECRET KEY TỪ ZALO DEVELOPER CONSOLE

## Vấn đề hiện tại
API Zalo trả về **Error 117: "secret_key is invalid"** khi decode phone token. Cần lấy secret_key để giải quyết.

## Cách lấy Secret Key:

### 1. Vào Zalo Developer Console
- Truy cập: https://developers.zalo.me/
- Đăng nhập tài khoản developer

### 2. Chọn App
- Vào "Quản lý ứng dụng"
- Chọn Mini App của bạn (App ID: 3410279790403850508)

### 3. Lấy Secret Key
- Tìm phần **"Thông tin ứng dụng"** hoặc **"App Settings"**
- Tìm trường **"App Secret"** hoặc **"Secret Key"**
- Copy giá trị đó

### 4. Thêm vào Frontend Code
Sau khi có secret_key, thêm vào code:

```typescript
// Function decode phone token với secret_key
const decodePhoneToken = async (phoneToken: string, accessToken: string) => {
  const SECRET_KEY = 'YOUR_SECRET_KEY_HERE'; // ← Thay bằng secret key thật
  
  try {
    const url = `https://graph.zalo.me/v2.0/me/info?access_token=${accessToken}&code=${phoneToken}&secret_key=${SECRET_KEY}&fields=id,name,picture`;
    console.log('Calling Zalo API with secret_key:', url);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error === 0 && data.data && data.data.number) {
      console.log('✅ Successfully decoded phone:', data.data.number);
      return data.data.number;
    }
    
    console.log('❌ Phone decode failed:', data);
    return null;
  } catch (error) {
    console.error('Frontend phone decode error:', error);
    return null;
  }
};
```

## Lưu ý bảo mật:
- **Secret key rất quan trọng** - không share công khai
- **Không commit** secret key vào git
- **Sử dụng environment variable** nếu có thể:
  ```typescript
  const SECRET_KEY = process.env.ZALO_SECRET_KEY || 'fallback_key';
  ```

## Nếu không tìm thấy Secret Key:
1. Kiểm tra phần **"Cài đặt ứng dụng"**
2. Kiểm tra phần **"API Keys"**
3. Có thể cần **generate** key mới
4. Liên hệ support Zalo nếu cần

## Test sau khi thêm Secret Key:
1. Thêm secret_key vào code
2. Build lại: `npm run build`
3. Deploy và test
4. Kiểm tra log sẽ thấy: "✅ Successfully decoded phone: 849123456789"

---

**Hãy lấy secret_key và tôi sẽ giúp bạn thêm vào code!** 🚀
