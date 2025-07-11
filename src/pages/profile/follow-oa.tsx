import { useEffect, useState } from "react";
import { showOAWidget } from "zmp-sdk";
import { useNavigate } from "react-router-dom";
import { getUserInfo } from "@/services/zaloService";

export default function FollowOAWidget() {
  const navigate = useNavigate();
  const [isFollowOA, setIsFollowOA] = useState(false);

  useEffect(() => {
    // Gọi API lấy trạng thái follow OA
    getUserInfo().then(user => {
      if (user && user.isFollowOA) {
        setIsFollowOA(true);
      } else {
        setIsFollowOA(false);
      }
    });
    showOAWidget({
      id: "oaWidget",
      guidingText: "Quan tâm OA để nhận các đặc quyền ưu đãi",
      color: "#F7F7F8",
    });
  }, []);

  const handleNavigateToVoucher = () => {
    navigate(""); // hoặc đường dẫn bạn muốn
  };


  if (isFollowOA) {
    return <div>Bạn đã quan tâm OA! Cảm ơn bạn.</div>;
  }

  return (
    <div>
      <div id="oaWidget" />
      <button
        onClick={handleNavigateToVoucher}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
      >
        Quan tâm
      </button>
    </div>
  );
}