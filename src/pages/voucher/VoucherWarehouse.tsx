import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "@/context/AuthContext";
declare global {
  interface Window {
    zaloId?: string;
  }
}
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
  Discount?: number;
  VoucherID?: string;
  discount?: number;
  expirydate?: string;
  user_collected_count?: number; // ✅ Số lượng user đã thu thập
};

export default function VoucherWarehouse() {
  const { user, isAuthenticated, loginWithZalo } = useAuth();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const now = new Date();

  // Auto login nếu chưa đăng nhập
  useEffect(() => {
    if (!isAuthenticated && !user) {
      loginWithZalo();
    }
  }, [isAuthenticated, user, loginWithZalo]);

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

  // Format thời gian còn lại
  const formatTimeRemaining = (dateString?: string): string => {
    if (!dateString) return "Không có hạn";
    const remaining = getTimeRemaining(dateString);
    if (remaining === null) return "Ngày không hợp lệ";
    if (remaining <= 0) return "Đã hết hạn";
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    if (hours < 24) {
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours} giờ ${minutes} phút`;
    }
    return formatDate(dateString);
  };

  // Format ngày hết hạn nếu có
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Không có hạn";
    try {
      const date = parseVNDate(dateString);
      if (!date || isNaN(date.getTime())) return "Ngày không hợp lệ";
      return date.toLocaleDateString("vi-VN");
    } catch {
      return dateString;
    }
  };

  // Fetch vouchers từ server
  const fetchVouchers = async () => {
    if (!user?.zaloId) return;
    
    try {
      setLoading(true);
      // Sử dụng API mới với zaloId
      const response = await fetch(`https://zalo.kosmosdevelopment.com/api/vouchers/category/ticket/user/${user.zaloId}`);
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
          user_collected_count: v.user_collected_count || 0, // Số lượng user đã thu thập
        }))
        .filter(v => !v.IsExpired)
        .filter(v => v.Quantity === undefined || v.Quantity > 0);
      setVouchers(voucherArray);
      setError("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.zaloId) {
      fetchVouchers();
      const intervalId = setInterval(() => {
        fetchVouchers();
      }, 30000);
      return () => clearInterval(intervalId);
    }
    return () => {}; // Return cleanup function for all paths
  }, [user?.zaloId]);

  // Xử lý thu thập voucher: gọi BE để lưu voucher cho user
  const handleSelectVoucher = async (voucherId: number) => {
    if (!user?.zaloId) return;
    
    const selected = vouchers.find((v) => v.Id === voucherId);
    if (!selected) return;

    if (selected.Quantity !== undefined && selected.Quantity <= 0) {
      toast.error("Voucher đã hết lượt thu thập!");
      return;
    }

    try {
      const res = await fetch("https://zalo.kosmosdevelopment.com/api/vouchers/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voucherId: selected.VoucherID ?? selected.Id,
          zaloId: user.zaloId // <-- sử dụng user.zaloId
        }),
      });

      if (res.ok) {
        toast.success("Bạn đã thu thập voucher thành công!");
        await new Promise(r => setTimeout(r, 500));
        fetchVouchers();
        setTimeout(() => {
          navigate("/gift");
        }, 1000);
      } else if (res.status === 409) {
        const data = await res.json();
        toast.error(data.error || "Bạn đã thu thập voucher này hoặc voucher đã hết lượt!");
        console.log('409 conflict:', data);
      } else {
        const data = await res.json();
        toast.error(data.error || "Thu thập voucher thất bại!");
      }
    } catch (err) {
      toast.error("Có lỗi khi thu thập voucher, vui lòng thử lại!");
    }
  };

  return (
    <div className="p-4 bg-gradient-to-br from-blue-50 via-yellow-50 to-pink-50 min-h-screen">
      <div className="flex justify-end mb-2">
        <button
          onClick={() => navigate("/point")}
          className="bg-blue-400 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded shadow transition"
        >
          🎡 Vòng quay may mắn
        </button>
      </div>
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

              {/* Phần nội dung voucher */}
              <div className="flex-grow flex flex-col">
                <div className="flex justify-center mb-1">
                  <span className="text-2xl group-hover:scale-110 transition-transform">🎫</span>
                </div>
                <h3 className="text-sm font-bold text-blue-700 mb-0.5 truncate line-clamp-1">
                  {voucher.Description || "Không có mô tả"}
                </h3>
                {voucher.Discount !== undefined && voucher.Discount > 0 && (
                  <span className="text-red-600 font-bold">
                    Giảm giá: {parseInt(voucher.Discount.toString(), 10)}%
                  </span>
                )}
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-xs text-gray-500">Mã code:</span>
                  <span className="bg-blue-50 text-blue-700 font-mono px-2 py-0.5 rounded text-xs tracking-widest shadow-inner select-all">
                    {voucher.Code || "—"}
                  </span>
                </div>
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