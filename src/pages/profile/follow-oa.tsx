// Khai báo type cho window.zmp để tránh lỗi TypeScript
declare global {
  interface Window {
    zmp?: {
      openChatWithOA?: (args: { oaId: string }) => void;
    };
  }
}

import { useEffect } from "react";
import { showOAWidget } from "zmp-sdk";

export default function FollowOAWidget() {
  useEffect(() => {
    showOAWidget({
      id: "oaWidget",
      guidingText: "Quan tâm OA để nhận các đặc quyền ưu đãi",
      color: "#F7F7F8",
    });
  }, []);

  const handleOpenChat = () => {
    // Nếu zmp-sdk không export openChatWithOA, gọi qua window.zmp
    if (window.zmp && typeof window.zmp.openChatWithOA === "function") {
      window.zmp.openChatWithOA({ oaId: "1830381847645653805" });
    } else {
      alert("Tính năng này chỉ hoạt động trong Zalo Mini App trên Zalo.");
    }
  };

  return (
    <div>
      <div id="oaWidget" />
      <button
        onClick={handleOpenChat}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
      >
        Quan tâm
      </button>
    </div>
  );
}