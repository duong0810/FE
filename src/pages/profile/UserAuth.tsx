import React from "react";
import { useAuth } from "@/context/AuthContext";

function UserAuth() {
  const { user, login, logout, isLoading } = useAuth();

  // Nếu đã đăng nhập, hiển thị thông tin user
  if (user) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center space-x-4">
          <img 
            src={user.avatar} 
            alt="Avatar" 
            className="w-16 h-16 rounded-full"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{user.fullname}</h3>
            <p className="text-gray-600">
              {user.phone
                ? (() => {
                    // Xử lý: nếu đã có +84 hoặc 84 ở đầu thì chỉ thêm dấu + nếu thiếu, không lặp +84
                    let p = user.phone.trim().replace(/^\+/, "");
                    if (p.startsWith("84")) p = "+" + p;
                    else if (p.startsWith("0")) p = "+84" + p.slice(1);
                    else if (!p.startsWith("+84")) p = "+84" + p;
                    // Thêm dấu cách sau +84 cho đẹp
                    return p.replace(/^\+84/, "+84 ");
                  })()
                : 'Chưa có số điện thoại'}
            </p>
            {/* Ẩn vai trò user */}
            {/* <p className="text-sm text-gray-500">Vai trò: {user.role}</p> */}
          </div>
          <button 
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    );
  }

  // Nếu chưa đăng nhập, hiển thị giao diện đẹp hơn
  return (
    <div className="bg-gradient-to-b from-blue-50 to-white rounded-xl p-6 shadow text-center flex flex-col items-center justify-center min-h-[420px]">
      <div className="mb-6 flex flex-col items-center">
        <div className="bg-blue-100 rounded-full p-4 mb-3 shadow-sm">
          <svg className="w-16 h-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-1">Bạn chưa đăng nhập</h3>
        <p className="text-gray-500 mb-2 text-base">Hãy đăng nhập bằng Zalo để trải nghiệm đầy đủ các tính năng ưu đãi, tích điểm, nhận quà và quản lý tài khoản cá nhân.</p>
      </div>
      <button
        onClick={login}
        disabled={isLoading}
        className="w-full max-w-xs px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold text-lg shadow-lg hover:from-blue-600 hover:to-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Đang đăng nhập...</span>
          </span>
        ) : (
          <>
            <svg className="w-6 h-6 mr-2" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="24" fill="#0068FF"/>
              <path d="M24 12C17.3726 12 12 16.4772 12 22C12 25.3137 14.6863 28 18 28H19V32.382C19 32.8477 19.5386 33.1206 19.9142 32.8284L25.4142 28.4142C25.7898 28.1219 26.2102 28.1219 26.5858 28.4142L32.0858 32.8284C32.4614 33.1206 33 32.8477 33 32.382V28H34C37.3137 28 40 25.3137 40 22C40 16.4772 32.6274 12 24 12Z" fill="white"/>
            </svg>
            <span>Đăng nhập với Zalo</span>
          </>
        )}
      </button>
    </div>
  );
}

export default UserAuth;
