import { getUserInfo, authorize, getPhoneNumber, getAccessToken } from 'zmp-sdk/apis';
import { API_BASE } from '@/config/zalo';

// Function decode phone token trên Frontend (IP Việt Nam)
const decodePhoneToken = async (phoneToken: string, accessToken: string) => {
  try {
    const response = await fetch(
      `https://graph.zalo.me/v2.0/me/info?access_token=${accessToken}&code=${phoneToken}&fields=name,picture`
    );
    
    const data = await response.json();
    console.log('Frontend phone decode response:', data);
    
    if (data.error === 0 && data.data && data.data.number) {
      return data.data.number;
    }
    
    return null;
  } catch (error) {
    console.error('Frontend phone decode error:', error);
    return null;
  }
};

// Flow đăng nhập chính
export const handleZaloLogin = async () => {
  try {
    console.log('Bắt đầu đăng nhập Zalo...');
    
    // 1. Xin quyền
    await authorize({ 
      scopes: ['scope.userInfo', 'scope.userPhonenumber'] 
    });
    
    // 2. Lấy thông tin user
    const userInfo = await getUserInfo({
      autoRequestPermission: true
    });
    console.log('User info from Zalo:', userInfo);
    
    // 3. Lấy access token
    let accessToken: string | null = null;
    try {
      const tokenResponse = await getAccessToken();
      accessToken = tokenResponse; // tokenResponse chính là accessToken string
      console.log('Access token:', accessToken);
    } catch (tokenError) {
      console.log('Cannot get access token:', tokenError);
    }
    
    // 4. Decode phone trên Frontend (IP Việt Nam)
    let phoneNumber: string | null = null;
    try {
      const phoneResult = await getPhoneNumber();
      const phoneToken = phoneResult?.token || null;
      console.log('Phone token:', phoneToken);
      
      if (phoneToken && accessToken) {
        phoneNumber = await decodePhoneToken(phoneToken, accessToken);
        console.log('Decoded phone number:', phoneNumber);
      }
    } catch (phoneError) {
      console.log('Phone decode failed:', phoneError);
    }
    
    // 5. Validate userInfo
    if (!userInfo || !userInfo.userInfo) {
      throw new Error('Không thể lấy thông tin user từ Zalo');
    }
    
    console.log('Full userInfo structure:', JSON.stringify(userInfo, null, 2));
    console.log('userInfo.userInfo:', JSON.stringify(userInfo.userInfo, null, 2));
    
    // 6. Gửi phoneNumber lên Backend (KHÔNG phải phoneToken)
    const requestData = {
      userInfo: userInfo.userInfo,  // ✅ Lấy nested userInfo ra
      accessToken,
      phoneNumber // ← GỬI PHONE NUMBER THAY VÌ phoneToken
    };
    
    console.log('Sending to backend:', requestData);
    
    const response = await fetch(`${API_BASE}/api/zalo/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });
    
    const result = await response.json();
    console.log('Backend response:', result);
    
    if (result.success) {
      console.log('Đăng nhập thành công:', result.user);
      // result.user.phone sẽ có số điện thoại thực nếu user cho phép
      const token = result.token;
      const user = result.user;
      
      return { token, user };
    } else {
      throw new Error(result.message || 'Đăng nhập thất bại');
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra';
    console.error('Đăng nhập thất bại:', error);
    console.error('Error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    alert('Đăng nhập thất bại: ' + errorMessage);
    return null;
  }
};

// Helper cho API calls với token
export const apiCall = async (endpoint: string, options: any = {}, token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });
  
  return response.json();
};