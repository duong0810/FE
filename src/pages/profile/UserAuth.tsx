import React from "react";
import { useAuth } from "@/context/AuthContext";

function UserAuth() {
  const { login, isLoading } = useAuth();
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] bg-white rounded-2xl shadow-lg p-0">
      <div className="w-full flex flex-col items-center px-6 py-4">
        <button
          onClick={login}
          disabled={isLoading}
          className="w-full max-w-xs px-6 py-3 bg-[#1563d7] text-white rounded-lg font-semibold text-lg shadow-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
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
