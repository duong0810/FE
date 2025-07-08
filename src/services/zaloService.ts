import { getUserInfo, authorize } from 'zmp-sdk/apis';
import { API_BASE } from '@/config/zalo';

// Flow đăng nhập chính
export const handleZaloLogin = async () => {
  try {
    // 1. Xin quyền truy cập
    await authorize({ scopes: ['scope.userInfo'] });
    
    // 2. Lấy thông tin user từ Zalo
    const userInfo = await getUserInfo({
      autoRequestPermission: true
    });
    
    // 3. Gửi lên Backend
    const response = await fetch(`${API_BASE}/api/zalo/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userInfo })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Lưu token để dùng cho các API khác
      const token = result.token;
      const user = result.user;
      
      console.log('Đăng nhập thành công:', user);
      return { token, user };
    } else {
      throw new Error(result.message);
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra';
    console.error('Đăng nhập thất bại:', error);
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