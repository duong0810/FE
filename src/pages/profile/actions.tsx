import {
  OrderHistoryIcon,
  PackageIcon,
  ProfileIcon,
  VoucherIcon,
} from "@/components/vectors";
import { useToBeImplemented } from "@/hooks";
import { useNavigate } from "react-router-dom";

export default function ProfileActions() {
  const toBeImplemented = useToBeImplemented();
  const navigate = useNavigate();

  return (

    <div className="bg-white rounded-lg p-4 grid grid-cols-4 gap-4 border-[0.5px] border-black/15">
      {[
        {
          label: "Thông tin tài khoản",
          icon: ProfileIcon,
          disabled: !localStorage.getItem("zalo_token"),
          onClick: () => {
            if (localStorage.getItem("zalo_token")) navigate("/account");
          },
        },
        {
          label: "Quà của tôi",
          icon: VoucherIcon,
          onClick: () => navigate("/gift"), // Điều hướng đến trang gift
        },
      ].map((action) => (
        <div
          key={action.label}
          className={`flex flex-col items-center cursor-pointer ${action.disabled ? 'opacity-50 pointer-events-none' : ''}`}
          onClick={action.disabled ? undefined : action.onClick}
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
