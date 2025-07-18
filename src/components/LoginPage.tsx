// import React from 'react';
// import { useAuth } from '@/context/AuthContext';

// const LoginPage: React.FC = () => {
//   const { user, isLoading } = useAuth();

//   if (isLoading) {
//     return (
//       <div style={{ padding: '20px', textAlign: 'center' }}>
//         <p>Đang đăng nhập...</p>
//       </div>
//     );
//   }

//   if (user) {
//     return (
//       <div style={{ padding: '20px' }}>
//         <h2>Chào mừng!</h2>
//         <div style={{ marginBottom: '15px' }}>
//           <img 
//             src={user.avatar} 
//             alt="Avatar" 
//             style={{ width: '80px', height: '80px', borderRadius: '50%' }}
//           />
//         </div>
//         <p><strong>Tên:</strong> {user.fullname}</p>
//         <p><strong>Số điện thoại:</strong> {user.phone}</p>
//         <p><strong>Vai trò:</strong> {user.role}</p>
//         {/* Đăng xuất đã bị loại bỏ theo chuẩn Zalo Mini App */}
//       </div>
//     );
//   }

//   return (
//     <div style={{ padding: '20px', textAlign: 'center' }}>
//       <h2>Bạn chưa có quyền truy cập</h2>
//       <p>Vui lòng truy cập Mini App từ ứng dụng Zalo để sử dụng đầy đủ các tính năng.</p>
//     </div>
//   );
// };

// export default LoginPage;

import React from 'react';
import { useAuth } from '@/context/AuthContext';

const LoginPage: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Đang đăng nhập...</p>
      </div>
    );
  }

  // ====== DEV MODE: LUÔN HIỂN THỊ GIAO DIỆN TEST ======
  return (
    <div style={{ padding: '20px' }}>
      <h2>Chào mừng (DEV MODE)!</h2>
      <div style={{ marginBottom: '15px' }}>
        <img
          src={user?.avatar || 'https://via.placeholder.com/80'}
          alt="Avatar"
          style={{ width: '80px', height: '80px', borderRadius: '50%' }}
        />
      </div>
      <p><strong>Tên:</strong> {user?.fullname || 'Dev User'}</p>
      <p><strong>Số điện thoại:</strong> {user?.phone || '0123456789'}</p>
      <p><strong>Vai trò:</strong> {user?.role || 'developer'}</p>
      <div style={{ marginTop: 20, color: 'red', fontWeight: 600 }}>
        <span>⚠️ Đang ở chế độ DEV, bỏ qua xác thực Zalo!</span>
      </div>
    </div>
  );
};

export default LoginPage;