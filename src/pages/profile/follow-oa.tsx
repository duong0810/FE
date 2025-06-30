import { useEffect } from "react";
import { showOAWidget, openChat } from "zmp-sdk";
import { useNavigate } from "react-router-dom";

export default function FollowOAWidget() {
  // const navigate = useNavigate(); // Không cần nếu không dùng nữa

  const handleChatOA = () => {
    openChat({
      type: "oa",
      id: "4128046421606951990", // Thay bằng OA ID thật của bạn
    });
  };

  useEffect(() => {
    showOAWidget({
      id: "oaWidget",
      guidingText: "Quan tâm OA để nhận các đặc quyền ưu đãi",
      color: "#F7F7F8",
    });
  }, []);

  return (
    <div>
      <div id="oaWidget" />
      <button
        onClick={handleChatOA}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
      >
        Quan tâm
      </button>
    </div>
  );
}

  