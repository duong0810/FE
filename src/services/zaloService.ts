import { getUserInfo, authorize, getPhoneNumber, getAccessToken } from 'zmp-sdk/apis';
import { API_BASE } from '@/config/zalo';

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
    
    // 3. Lấy access token (THÊM DÒNG NÀY)
    let accessToken: string | null = null;
    try {
      const tokenResponse = await getAccessToken();
      accessToken = tokenResponse; // tokenResponse chính là accessToken string
      console.log('Access token:', accessToken);
    } catch (tokenError) {
      console.log('Cannot get access token:', tokenError);
    }
    
    // 4. Lấy phone token
    let phoneToken: string | null = null;
    try {
      const phoneResult = await getPhoneNumber();
      phoneToken = phoneResult?.token || null;
      console.log('Phone token:', phoneToken);
    } catch (phoneError) {
      console.log('Cannot get phone token:', phoneError);
    }
    
    // 3. Validate userInfo
    if (!userInfo || !userInfo.userInfo) {
      throw new Error('Không thể lấy thông tin user từ Zalo');
    }
    
    console.log('Full userInfo structure:', JSON.stringify(userInfo, null, 2));
    console.log('userInfo.userInfo:', JSON.stringify(userInfo.userInfo, null, 2));
    
    // 6. Gửi TẤT CẢ 3 FIELDS lên Backend
    const requestData = {
      userInfo,
      accessToken,  // ← THÊM FIELD NÀY
      phoneToken 
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