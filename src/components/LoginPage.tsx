import React from 'react';
import { useAuth } from '@/context/AuthContext';

const LoginPage: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Đang xác thực với Zalo Mini App...</p>
      </div>
    );
  }

  if (user) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Chào mừng!</h2>
        <div style={{ marginBottom: '15px' }}>
          <img 
            src={user.avatar} 
            alt="Avatar" 
            style={{ width: '80px', height: '80px', borderRadius: '50%' }}
          />
        </div>
        <p><strong>Tên:</strong> {user.fullname}</p>
        <p><strong>Số điện thoại:</strong> {user.phone}</p>
        <p><strong>Vai trò:</strong> {user.role}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Vui lòng truy cập qua Zalo Mini App để sử dụng ứng dụng.</h2>
      <p>Ứng dụng này chỉ hỗ trợ xác thực qua Zalo, không có nút đăng nhập hoặc đăng xuất.</p>
    </div>
  );
};

export default LoginPage;