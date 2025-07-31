import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function AccountInfo() {
  const { user } = useAuth();
  const navigate = useNavigate();

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
          <span className="font-medium">{user?.fullname || user?.fullName || "--"}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-gray-500">Giới tính</span>
          <span className="font-medium">{user?.gender || user?.sex || "--"}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-gray-500">Ngày sinh</span>
          <span className="font-medium">
            {user?.birthday
              ? (() => {
                  const val = user.birthday;
                  // yyyy-mm-dd
                  const isoMatch = typeof val === "string" && val.match(/^(\d{4})-(\d{2})-(\d{2})/);
                  if (isoMatch) return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
                  // yyyy/mm/dd
                  const ymd = typeof val === "string" && val.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
                  if (ymd) return `${ymd[3]}/${ymd[2]}/${ymd[1]}`;
                  // dd/mm/yyyy
                  const ddmmyyyy = typeof val === "string" && val.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
                  if (ddmmyyyy) return val;
                  return val;
                })()
              : "--"}
          </span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-gray-500">Số điện thoại</span>
          <span className="font-medium">{user?.phone || user?.phonenumber || "--"}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-gray-500">Địa chỉ</span>
          <span className="font-medium">{user?.address || "--"}</span>
        </div>
      </div>
    </div>
  );
}