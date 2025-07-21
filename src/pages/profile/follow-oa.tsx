import { useEffect } from "react";
import { showOAWidget, openChat } from "zmp-sdk";

const OA_ID = "1830381847645653805";

export default function FollowOAWidget() {
  useEffect(() => {
    showOAWidget({
      id: "oaWidget",
      guidingText: "Quan tâm OA để nhận các đặc quyền ưu đãi",
      color: "#F7F7F8",
    });
  }, []);

  const handleOpenChat = () => {
    openChat({
      type: "oa",
      id: OA_ID,
    });
  };

  return (
    <div>
      <div id="oaWidget" />
      <button
        onClick={handleOpenChat}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
      >
        Chat với OA
      </button>
    </div>
  );
}