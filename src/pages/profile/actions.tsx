import {
  OrderHistoryIcon,
  PackageIcon,
  ProfileIcon,
  VoucherIcon,
} from "@/components/vectors";
import { useToBeImplemented } from "@/hooks";
import { useNavigate } from "react-router-dom";

import React from "react";
export default function ProfileActions() {
  // Chỉ ẩn khi chưa đăng nhập, nếu đã đăng nhập thì hiển thị các mục
  if (!localStorage.getItem("zalo_token") && !(window as any).zalo_token) {
    return null;
  }
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-lg p-4 grid grid-cols-4 gap-4 border-[0.5px] border-black/15">
      {[
        {
          label: "Thông tin tài khoản",
          icon: ProfileIcon,
          onClick: () => navigate("/account"),
        },
        {
          label: "Quà của tôi",
          icon: VoucherIcon,
          onClick: () => navigate("/gift"),
        },
      ].map((action) => (
        <div
          key={action.label}
          className="flex flex-col items-center cursor-pointer"
          onClick={action.onClick}
        >
          <div className="w-8 h-8 mb-2">
            <action.icon active />
          </div>
          <span className="text-sm text-center">{action.label}</span>
        </div>
      ))}
    </div>
  );
}
