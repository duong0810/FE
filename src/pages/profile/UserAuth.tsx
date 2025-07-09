import React from "react";
import { useAuth } from "@/context/AuthContext";

function UserAuth() {
  const { user, login, logout, isLoading } = useAuth();
  // Nếu đã đăng nhập, chỉ render children (các mục tài khoản, quà của tôi...) do component cha quản lý
  if (user) {
    return null;
  }

  // Nếu chưa đăng nhập, hiển thị giao diện đẹp hơn
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] bg-white rounded-2xl shadow-lg p-0">
      <div className="w-full flex flex-col items-center justify-center bg-[#1563d7] rounded-t-2xl p-6 pb-2">
        <div className="w-full flex flex-col items-center">
          <img src="/images/zalopay-login-hero.png" alt="ZaloPay login" className="w-32 h-32 object-contain mb-2" />
        </div>
        <h2 className="text-white text-2xl font-bold mb-1">Zalopay</h2>
      </div>
      <div className="w-full flex flex-col items-center px-6 py-4">
        <h3 className="text-xl font-bold text-gray-800 mb-2 mt-2">Chưa đăng nhập</h3>
        <p className="text-gray-600 text-base mb-4 text-center">Đăng nhập bằng Zalo để sử dụng đầy đủ tính năng</p>
        <ul className="text-gray-700 text-left mb-4 w-full max-w-xs mx-auto">
          <li className="flex items-center gap-2 mb-1">
            <span className="inline-block w-5 h-5 text-green-500">✔️</span>
            Ứng dụng Zalopay thanh toán miễn phí ngay trong Zalo
          </li>
          <li className="flex items-center gap-2">
            <span className="inline-block w-5 h-5 text-green-500">✔️</span>
            Zalopay đảm bảo an toàn bảo mật
          </li>
        </ul>
        <p className="text-gray-500 text-sm mb-4 text-center">Chọn "Cho Phép" ở màn hình tiếp theo bạn nhé</p>
        <button
          onClick={login}
          disabled={isLoading}
          className="w-full max-w-xs px-6 py-3 bg-[#1563d7] text-white rounded-lg font-semibold text-lg shadow-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
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
            <span className="font-bold text-lg">Tiếp tục</span>
          )}
        </button>
      </div>
    </div>
  );
}

export default UserAuth;
