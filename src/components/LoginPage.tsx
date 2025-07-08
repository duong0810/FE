import React from 'react';
import { useAuth } from '@/context/AuthContext';

const LoginPage: React.FC = () => {
  const { user, login, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Đang đăng nhập...</p>
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
        <button 
          onClick={logout}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ff4444',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Đăng xuất
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Đăng nhập bằng Zalo</h2>
      <button 
        onClick={login}
        style={{
          padding: '15px 30px',
          backgroundColor: '#0084ff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Đăng nhập với Zalo
      </button>
    </div>
  );
};

export default LoginPage;