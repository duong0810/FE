import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type Voucher = {
  Id: number;
  Name: string;
  Description: string;
  ExpiryDate?: string;
  Code: string;
  Quantity?: number;
  Type?: string;
  RemainingTime?: string;
  RemainingHours?: number;
  IsExpired?: boolean;
  isNew?: boolean;
  collectedAt?: number;
  uniqueId?: string;
  Discount?: number;
  VoucherID?: string;
  
};

export default function VoucherWarehouse() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const now = new Date();

  // Hàm parse ngày, hỗ trợ cả ISO (yyyy-mm-dd) và dd/mm/yyyy
  const parseVNDate = (str?: string) => {
    if (!str) return null;
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
      return new Date(str);
    }
    const [day, month, year] = str.split("/").map(Number);
    if (!day || !month || !year) return null;
    return new Date(year, month - 1, day);
  };

  // Tính thời gian còn lại của voucher (trả về số mili giây)
  const getTimeRemaining = (dateString?: string): number | null => {
    if (!dateString) return null;
    
    const expiryDate = parseVNDate(dateString);
    if (!expiryDate) return null;
    
    return expiryDate.getTime() - now.getTime();
  };

  // Kiểm tra voucher đã hết hạn chưa
  const isExpired = (dateString?: string): boolean => {
    if (!dateString) return false;
    
    const remaining = getTimeRemaining(dateString);
    return remaining !== null && remaining <= 0;
  };

  // Format thời gian còn lại - Sửa lại để hiển thị đúng
  const formatTimeRemaining = (dateString?: string): string => {
    if (!dateString) return "Không có hạn";
    
    const remaining = getTimeRemaining(dateString);
    if (remaining === null) return "Ngày không hợp lệ";
    
    if (remaining <= 0) return "Đã hết hạn";
    
    // Nếu còn dưới 24 giờ, hiển thị theo giờ
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    if (hours < 24) {
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours} giờ ${minutes} phút`;
    }
    
    // Nếu còn nhiều hơn 1 ngày, hiển thị ngày hết hạn theo định dạng DD/MM/YYYY
    return formatDate(dateString);
  };

  // Format ngày hết hạn nếu có
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Không có hạn";
    try {
      const date = parseVNDate(dateString);
      if (!date || isNaN(date.getTime())) return "Ngày không hợp lệ";
      return date.toLocaleDateString("vi-VN"); // Trả về định dạng DD/MM/YYYY
    } catch {
      return dateString;
    }
  };

  // Fetch vouchers từ server
  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://be-sgv1.onrender.com/api/vouchers?category=ticket");
      if (!response.ok) {
        throw new Error(
          `Lỗi khi lấy dữ liệu từ server: ${response.status} ${response.statusText}`
        );
      }
      const data = await response.json();
      let voucherArray: Voucher[] = [];
      if (Array.isArray(data)) {
        voucherArray = data;
      } else if (data && typeof data === "object") {
        voucherArray =
          data.data || data.vouchers || data.items || data.result || [];
        voucherArray = Array.isArray(voucherArray) ? voucherArray : [];
      }
      
      // Đồng bộ trường Id và VoucherID và lọc voucher hết hạn
      voucherArray = voucherArray
        .map((v: any) => ({
          ...v,
          Id: v.Id ?? v.VoucherID ?? v.voucherid,
          VoucherID: v.VoucherID ?? v.voucherid ?? v.Id,
          Code: v.Code ?? v.code,
          Discount: v.Discount ?? v.discount,
          Description: v.Description ?? v.description,
          Quantity: v.Quantity ?? v.quantity,
          ExpiryDate: v.ExpiryDate ?? v.expirydate,
          ImageUrl: v.ImageUrl ?? v.imageUrl ?? v.Image ?? v.image,
          IsExpired: isExpired(v.ExpiryDate ?? v.expirydate),
        }))
        // Lọc bỏ các voucher đã hết hạn
        .filter(v => !v.IsExpired);

        // Thêm dòng này để lọc voucher hết lượt hoặc số lượng bằng 0
        voucherArray = voucherArray.filter(v => v.Quantity === undefined || v.Quantity > 0);
      
      // Kiểm tra vouchers đã thu thập từ localStorage để đánh dấu isNew
      const stored = localStorage.getItem("selectedVoucher");
      if (stored) {
        try {
          const selectedList: Voucher[] = JSON.parse(stored);
          // Lấy danh sách voucher được đánh dấu là mới
          const recentVouchers = selectedList.filter(v => v.isNew === true);
          
          console.log("Recent vouchers from localStorage:", recentVouchers);
          
          if (recentVouchers.length > 0) {
            // Đánh dấu vouchers mới thu thập trong danh sách từ API
            voucherArray = voucherArray.map(v => {
              const foundNew = recentVouchers.find(
                nv => (nv.Id === v.Id || nv.VoucherID === v.VoucherID)
              );
              return foundNew ? { ...v, isNew: true } : v;
            });
          }
        } catch (err) {
          console.error("Error parsing localStorage vouchers", err);
        }
      }
      
      // Áp dụng số đã thu thập từ localStorage nếu API chưa cập nhật
      const storedCollected = localStorage.getItem("collected_vouchers");
      if (storedCollected) {
        try {
          const collectedCounts = JSON.parse(storedCollected);
          voucherArray = voucherArray.map(v => {
            const voucherId = String(v.Id);
            const collectedCount = collectedCounts[voucherId] || 0;
            if (collectedCount > 0) {
              return {
                ...v,
                // Giảm số lượng dựa trên số đã thu thập trong localStorage
                Quantity: Math.max(0, (v.Quantity ?? 0) - collectedCount)
              };
            }
            return v;
          });
        } catch (err) {
          console.error("Error applying collected counts", err);
        }
      }
      // Lọc lại voucher hết lượt hoặc số lượng bằng 0 SAU khi đã đồng bộ localStorage
      voucherArray = voucherArray.filter(v => v.Quantity === undefined || v.Quantity > 0);

      // Debug: In ra vouchers có isNew = true
      const newVouchers = voucherArray.filter(v => v.isNew === true);
      console.log("Vouchers with isNew flag:", newVouchers);
      
      setVouchers(voucherArray);
      setError("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
    
    // Set up interval để refresh voucher mỗi 30 giây
    const intervalId = setInterval(() => {
      fetchVouchers();
    }, 30000);
    
    // Clear interval khi component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Test API để kiểm tra các endpoint
  const testCollectAPI = async () => {
    try {
      const testId = vouchers[0]?.Id;
      if (!testId) {
        toast.error("Không có voucher để test");
        return;
      }
      
      toast.info("Đang test API...");
      
      // Test endpoint 1 - vouchers/collect
      const res1 = await fetch(`https://be-sgv1.onrender.com/api/vouchers/collect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voucherId: testId,
          code: vouchers[0].Code,
          userId: 1,
          collectedAt: new Date().toISOString(),
          quantity: 1
        }),
      });
      
      const text1 = await res1.text();
      console.log(`API 1 response (${res1.status}):`, text1);
      
      // Test endpoint 2 - vouchers với action collect
      const res2 = await fetch(`https://be-sgv1.onrender.com/api/vouchers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "collect",
          voucherId: testId,
          code: vouchers[0].Code,
          userId: 1,
          collectedAt: new Date().toISOString(),
          quantity: 1
        }),
      });
      
      const text2 = await res2.text();
      console.log(`API 2 response (${res2.status}):`, text2);
      
      // Test endpoint 3 - user-vouchers
      const res3 = await fetch(`https://be-sgv1.onrender.com/api/user-vouchers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voucherId: testId,
          code: vouchers[0].Code,
          userId: 1,
          collectedAt: new Date().toISOString()
        }),
      });
      
      const text3 = await res3.text();
      console.log(`API 3 response (${res3.status}):`, text3);
      
      toast.success("Test API hoàn tất, kiểm tra console");
      
      // Refresh vouchers
      setTimeout(fetchVouchers, 1000);
    } catch (err) {
      console.error("Test API error:", err);
      toast.error("Test API thất bại");
    }
  };

  // Xử lý thu thập voucher: gọi BE để giảm số lượng, lưu vào localStorage và chuyển trang
  const handleSelectVoucher = async (voucherId: number) => {
    const selected = vouchers.find((v) => v.Id === voucherId);
    if (!selected) return;

    // Kiểm tra số lượng voucher
    if (selected.Quantity !== undefined && selected.Quantity <= 0) {
      toast.error("Voucher đã hết lượt thu thập!");
      return;
    }

    // Kiểm tra trùng trong localStorage
    const stored = localStorage.getItem("selectedVoucher");
    let selectedList: Voucher[] = [];
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        selectedList = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        selectedList = [];
      }
    }
    const exists = selectedList.some((v) => v.Id === selected.Id);
    if (exists) {
      toast.info("Voucher này đã được chọn, vui lòng chọn voucher khác!");
      return;
    }
    
    try {
      // QUAN TRỌNG: Giảm số lượng voucher ngay từ đầu trên FE để UX mượt mà
      setVouchers((prev) =>
        prev.map((v) =>
          v.Id === selected.Id
            ? { ...v, Quantity: Math.max(0, (v.Quantity ?? 1) - 1) }
            : v
        )
      );
      
      // Lưu voucher vào localStorage trước để đảm bảo UX
      // Đặt tất cả vouchers hiện có thành không mới
      selectedList = selectedList.map(v => ({
        ...v,
        isNew: false
      }));
      
      // Thêm voucher mới với flag isNew = true rõ ràng
      const newVoucher = {
        ...selected,
        isNew: true,
        collectedAt: Date.now(),
        uniqueId: `${selected.VoucherID ?? selected.Id}_${Date.now()}`,
        Quantity: Math.max(0, (selected.Quantity ?? 1) - 1) // Cập nhật số lượng mới
      };
      
      console.log("Adding new voucher with isNew flag:", newVoucher);
      
      // Thêm vào danh sách đã chọn với cờ isNew
      selectedList.push(newVoucher);
      
      // Lưu vào localStorage
      localStorage.setItem("selectedVoucher", JSON.stringify(selectedList));

      // Thông báo thành công
      toast.success("Bạn đã thu thập voucher thành công!");
      
      // Tạo biến để theo dõi API thành công hay không
      let apiSuccess = false;
      
      // Gọi API để cập nhật số lượng trên server
      try {
        // Tạo FormData để gửi multipart/form-data
        const formData = new FormData();
        formData.append("voucherId", String(selected.VoucherID ?? selected.Id));
        formData.append("code", selected.Code);
        formData.append("userId", "1");
        formData.append("collectedAt", new Date().toISOString());
        formData.append("quantity", "1");
        
        // Thử với FormData trước (một số API yêu cầu FormData)
        const formDataRes = await fetch(`https://be-sgv1.onrender.com/api/vouchers/collect`, {
          method: "POST",
          body: formData,
        }).catch(() => null);
        
        if (formDataRes && formDataRes.ok) {
          console.log("FormData API successful");
          apiSuccess = true;
        } else {
          // Thử với JSON nếu FormData không hoạt động
          const res = await fetch(`https://be-sgv1.onrender.com/api/vouchers/collect`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              voucherId: selected.VoucherID ?? selected.Id,
              code: selected.Code,
              userId: 1,
              collectedAt: new Date().toISOString(),
              quantity: 1 // Giảm 1 đơn vị
            }),
          });
          
          if (res.ok) {
            const resultData = await res.json().catch(() => ({}));
            console.log("Collect voucher success:", resultData);
            apiSuccess = true;
          } else {
            const errorData = await res.json().catch(() => ({}));
            console.error("API error:", errorData);
            
            // Thử endpoint khác nếu endpoint đầu tiên không thành công
            const res2 = await fetch(`https://be-sgv1.onrender.com/api/vouchers`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "collect",
                voucherId: selected.VoucherID ?? selected.Id,
                code: selected.Code,
                userId: 1,
                collectedAt: new Date().toISOString(),
                quantity: 1
              }),
            });
            
            if (res2.ok) {
              console.log("Second endpoint successful");
              apiSuccess = true;
            } else {
              console.error("Both API endpoints failed");
              
              // Thử endpoint 3 - user-vouchers
              const res3 = await fetch(`https://be-sgv1.onrender.com/api/user-vouchers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  voucherId: selected.VoucherID ?? selected.Id,
                  code: selected.Code,
                  userId: 1,
                  collectedAt: new Date().toISOString()
                }),
              });
              
              if (res3.ok) {
                console.log("User-vouchers endpoint successful");
                apiSuccess = true;
              } else {
                console.error("All API endpoints failed");
              }
            }
          }
        }
      } catch (apiError) {
        console.error("API call failed:", apiError);
      }

      // Nếu API không thành công, lưu thông tin vào localStorage để duy trì trạng thái
      if (!apiSuccess) {
        // Lưu thêm thông tin số lượng đã giảm vào localStorage
        const storedCollected = localStorage.getItem("collected_vouchers") || "{}";
        let collectedCounts = {};
        try {
          collectedCounts = JSON.parse(storedCollected);
        } catch {
          collectedCounts = {};
        }
        
        const voucherId = String(selected.Id);
        collectedCounts = {
          ...collectedCounts,
          [voucherId]: ((collectedCounts as any)[voucherId] || 0) + 1
        };
        
        localStorage.setItem("collected_vouchers", JSON.stringify(collectedCounts));
        
        // Lưu thời điểm thu thập để có thể đồng bộ lại sau
        localStorage.setItem(`collect_timestamp_${selected.Id}`, Date.now().toString());
        
        // Gọi lại API fetch vouchers để đồng bộ lại số lượng 
        setTimeout(() => {
          fetchVouchers();
        }, 300);
      }

      // QUAN TRỌNG: Chuyển trang đến /gift thay vì /voucher
      // Thêm delay nhỏ để đảm bảo localStorage đã lưu xong
      setTimeout(() => {
        navigate("/gift");
      }, 500);
    } catch (err) {
      console.error("Error in handleSelectVoucher:", err);
      toast.error("Có lỗi khi thu thập voucher, vui lòng thử lại!");
      
      // Khôi phục số lượng voucher nếu có lỗi
      setVouchers((prev) =>
        prev.map((v) =>
          v.Id === selected.Id
            ? { ...v, Quantity: (v.Quantity ?? 0) + 1 }
            : v
        )
      );
    }
  };

  return (
    <div className="p-4 bg-gradient-to-br from-blue-50 via-yellow-50 to-pink-50 min-h-screen">
      <h1 className="text-2xl font-extrabold mb-4 text-blue-700 flex items-center gap-2">
        <span className="text-3xl">🎁</span> Kho Voucher
      </h1>
      

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-yellow-400"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {!loading && vouchers.length === 0 && !error && (
        <div className="text-center py-8">
          <p className="text-gray-500">Hiện tại bạn không có voucher nào</p>
        </div>
      )}

      {!loading && vouchers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {vouchers.map((voucher) => (
            <div
              key={voucher.VoucherID || voucher.Id || voucher.Code || Math.random()}
              className="relative bg-white border border-yellow-200 rounded-xl shadow p-4 flex flex-col h-[180px] justify-between hover:scale-105 hover:shadow-xl transition-all duration-200 group"
            >
              {/* Badge số lượng */}
              {"Quantity" in voucher && (
                <span className="absolute top-2 right-2 bg-gradient-to-r from-blue-500 to-blue-400 text-white text-[10px] font-bold rounded-full px-2 py-0.5 shadow-lg border-2 border-white z-10">
                  SL: {voucher.Quantity}
                </span>
              )}
              
              {/* Badge NEW cho voucher mới - cải tiến để hiển thị rõ hơn */}
              {voucher.isNew && (
                <div className="absolute top-0 left-0 w-16 h-16 overflow-hidden">
                  <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold py-1 text-xs text-center transform -rotate-45 absolute top-5 -left-7 w-24 shadow-lg border border-white">
                    MỚI
                  </div>
                </div>
              )}

              {/* Phần nội dung voucher */}
              <div className="flex-grow flex flex-col">
                {/* Icon voucher */}
                <div className="flex justify-center mb-1">
                  <span className="text-2xl group-hover:scale-110 transition-transform">🎫</span>
                </div>

                {/* Tên voucher */}
                <h3 className="text-sm font-bold text-blue-700 mb-0.5 truncate line-clamp-1">
                  {voucher.Description || "Không có mô tả"}
                </h3>
                
                {/* Giảm giá nếu có */}
                {voucher.Discount !== undefined && voucher.Discount > 0 && (
                  <span className="text-red-600 font-bold">
                    Giảm giá: {parseInt(voucher.Discount.toString(), 10)}%
                  </span>
                )}

                {/* Mã code */}
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-xs text-gray-500">Mã code:</span>
                  <span className="bg-blue-50 text-blue-700 font-mono px-2 py-0.5 rounded text-xs tracking-widest shadow-inner select-all">
                    {voucher.Code || "—"}
                  </span>
                </div>

                {/* Ngày hết hạn */}
                {voucher.ExpiryDate && (
                  <p className={`text-xs flex items-center gap-1 ${
                    getTimeRemaining(voucher.ExpiryDate) !== null && 
                    getTimeRemaining(voucher.ExpiryDate)! < 24 * 60 * 60 * 1000 
                      ? 'text-orange-500 font-semibold' 
                      : 'text-gray-500'
                  }`}>
                    <span className="inline-block">⏰</span>
                    Hết hạn: {formatTimeRemaining(voucher.ExpiryDate)}
                  </p>
                )}
              </div>

              {/* Button thu thập */}
              <button
                onClick={() => handleSelectVoucher(voucher.Id)}
                className="mt-auto bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-lg font-bold shadow hover:from-yellow-500 hover:to-orange-600 transition text-xs disabled:opacity-60 w-full"
                disabled={voucher.Quantity !== undefined && voucher.Quantity <= 0}
              >
                {voucher.Quantity !== undefined && voucher.Quantity <= 0 ? "Hết lượt" : "Thu thập"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}