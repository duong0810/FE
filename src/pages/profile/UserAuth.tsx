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

  // Nếu chưa đăng nhập, hiển thị button đăng nhập
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm text-center">
      <div className="mb-4">
        <svg 
          className="w-16 h-16 text-gray-400 mx-auto mb-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
          />
        </svg>
        <h3 className="text-xl font-semibold mb-2">Chưa đăng nhập</h3>
        <p className="text-gray-600 mb-6">
          Đăng nhập bằng Zalo để sử dụng đầy đủ tính năng
        </p>
      </div>
      
      <button 
        onClick={login}
        disabled={isLoading}
        className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Đang đăng nhập...
          </span>
        ) : "Đăng nhập với Zalo"}
      </button>
    </div>
  );
}

export default UserAuth;
