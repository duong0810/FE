import { useEffect } from "react";
import { showOAWidget } from "zmp-sdk";
import { useNavigate } from "react-router-dom";

export default function FollowOAWidget() {
  const navigate = useNavigate();

  useEffect(() => {
    showOAWidget({
      id: "oaWidget",
      guidingText: "Quan tâm OA để nhận các đặc quyền ưu đãi",
      color: "#F7F7F8",
    });
  }, []);

  const handleNavigateToVoucher = () => {
    navigate(""); // Điều hướng đến trang "Đổi voucher"
  };

  return (
    <div>
      <div id="oaWidget" />
      <button
        onClick={handleNavigateToVoucher}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"      >
        Quan tâm
      </button>
    </div>
  );
}