import { getUserInfo, authorize } from 'zmp-sdk/apis';
import { API_BASE } from '@/config/zalo';

// Flow đăng nhập chính
export const handleZaloLogin = async () => {
  try {
    console.log('Bắt đầu đăng nhập Zalo...');
    
    // 1. Xin quyền truy cập
    const authResult = await authorize({ scopes: ['scope.userInfo'] });
    console.log('Authorize result:', authResult);
    
    // 2. Lấy thông tin user từ Zalo
    const userInfo = await getUserInfo({
      autoRequestPermission: true
    });
    console.log('User info from Zalo:', userInfo);
    
    // 3. Validate userInfo
    if (!userInfo || !userInfo.userInfo) {
      throw new Error('Không thể lấy thông tin user từ Zalo');
    }
    
    const zaloUser = userInfo.userInfo;
    
    // 4. Gửi lên Backend
    const requestData = {
      userInfo: {
        id: zaloUser.id,
        name: zaloUser.name || 'Người dùng Zalo',
        avatar: zaloUser.avatar || ''
      }
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
      // Lưu token để dùng cho các API khác
      const token = result.token;
      const user = result.user;
      
      console.log('Đăng nhập thành công:', user);
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
    
    // Hiển thị lỗi chi tiết hơn
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