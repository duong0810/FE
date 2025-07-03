import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ZaloSDKWrapper } from "@/utils/zalo-sdk";

export default function FollowOAWidget() {
  const navigate = useNavigate();
  const [isZaloApp, setIsZaloApp] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    // Kiểm tra xem có đang trong Zalo app không
    const checkZaloApp = () => {
      const userAgent = navigator.userAgent || '';
      const inZalo = userAgent.includes('ZaloApp') || 
                    userAgent.includes('Zalo') ||
                    !!(window as any).ZaloJavaScriptInterface;
      setIsZaloApp(inZalo);
    };

    checkZaloApp();

    // Chỉ thử show OA widget nếu đang trong Zalo app
    if (isZaloApp) {
      try {
        // Import dynamic để tránh lỗi khi không có zmp-sdk
        import('zmp-sdk').then(({ showOAWidget }) => {
          showOAWidget({
            id: "oaWidget",
            guidingText: "Quan tâm OA để nhận các đặc quyền ưu đãi",
            color: "#F7F7F8",
          }).catch((error) => {
            console.warn('⚠️ showOAWidget error:', error);
            setShowError(true);
          });
        }).catch(() => {
          console.log('🔧 zmp-sdk not available');
          setShowError(true);
        });
      } catch (error) {
        console.warn('⚠️ OA Widget error:', error);
        setShowError(true);
      }
    }
  }, [isZaloApp]);

  const handleNavigateToVoucher = () => {
    navigate("/voucher-warehouse"); // Điều hướng đến trang "Đổi voucher"
  };

  return (
    <div className="bg-white rounded-lg p-4 border-[0.5px] border-black/15">
      {isZaloApp && !showError ? (
        <div>
          <div id="oaWidget" />
          <button
            onClick={handleNavigateToVoucher}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 w-full"
          >
            🎁 Kho Voucher
          </button>
        </div>
      ) : (
        <div className="text-center py-4">
          <div className="text-4xl mb-2">📱</div>
          <h3 className="font-bold text-gray-800 mb-2">Follow OA để nhận ưu đãi</h3>
          <p className="text-sm text-gray-600 mb-4">
            {isZaloApp 
              ? "OA widget hiện không khả dụng" 
              : "Vui lòng mở trong ứng dụng Zalo để follow OA"
            }
          </p>
          <button
            onClick={handleNavigateToVoucher}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 w-full"
          >
            🎁 Xem Kho Voucher
          </button>
        </div>
      )}
    </div>
  );
}