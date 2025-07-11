import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate("/profile");
    }
  }, [user, navigate]);

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white rounded-xl p-6 shadow text-center flex flex-col items-center justify-center min-h-[320px]">
      <div className="mb-6 flex flex-col items-center">
        <div className="bg-blue-100 rounded-full p-4 mb-3 shadow-sm">
          <svg className="w-16 h-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-1">Bạn chưa có quyền truy cập</h3>
        <p className="text-gray-500 mb-2 text-base">Vui lòng truy cập Mini App từ ứng dụng Zalo để sử dụng đầy đủ các tính năng.</p>
      </div>
    </div>
  );
}

export default LoginPage;
