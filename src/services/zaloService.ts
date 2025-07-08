import { getUserInfo, authorize, getPhoneNumber } from 'zmp-sdk/apis';
import { API_BASE } from '@/config/zalo';

// Flow đăng nhập chính
export const handleZaloLogin = async () => {
  try {
    console.log('Bắt đầu đăng nhập Zalo...');
    
    // 1. Xin quyền thông tin cơ bản
    await authorize({ scopes: ['scope.userInfo'] });
    const userInfo = await getUserInfo({
      autoRequestPermission: true
    });
    console.log('User info from Zalo:', userInfo);
    
    // 2. Xin quyền số điện thoại
    let phoneToken: string | null = null;
    try {
      await authorize({ scopes: ['scope.userPhonenumber'] });
      const phoneResult = await getPhoneNumber();
      phoneToken = phoneResult?.token || null;
      console.log('Phone token:', phoneToken);
    } catch (phoneError) {
      console.log('User từ chối chia sẻ phone hoặc chưa có quyền:', phoneError);
    }
    
    // 3. Validate userInfo
    if (!userInfo || !userInfo.userInfo) {
      throw new Error('Không thể lấy thông tin user từ Zalo');
    }
    
    // 4. Gửi cả userInfo và phoneToken lên Backend
    const requestData = {
      userInfo,
      phoneToken // Backend sẽ decode thành số điện thoại thực
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