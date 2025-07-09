import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Kiểu dữ liệu user, có thể mở rộng thêm các trường khác nếu cần
export type UserInfo = {
  fullName?: string;
  gender?: string;
  birthday?: string;
  phone?: string;
  address?: string;
  [key: string]: any;
};

export default function AccountInfo() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy user từ localStorage hoặc gọi API lấy thông tin user
    // (Có thể thay bằng API thực tế nếu cần)
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    // TODO: Nếu cần lấy từ API thì thay đoạn này
  }, []);

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow p-4 mt-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Tài Khoản</h2>
        <button
          className="text-blue-600 font-semibold flex items-center gap-1"
          onClick={() => navigate("/account/update")}
        >
          <span>Cập nhật</span>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
      <div className="divide-y divide-gray-100">
        <div className="flex justify-between py-2">
          <span className="text-gray-500">Họ tên</span>
          <span className="font-medium">{user?.fullName || "--"}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-gray-500">Giới tính</span>
          <span className="font-medium">{user?.gender || "--"}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-gray-500">Ngày sinh</span>
          <span className="font-medium">{user?.birthday || "--"}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-gray-500">Số điện thoại</span>
          <span className="font-medium">{user?.phone || "--"}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-gray-500">Địa chỉ</span>
          <span className="font-medium">{user?.address || "--"}</span>
        </div>
      </div>
    </div>
  );
}
