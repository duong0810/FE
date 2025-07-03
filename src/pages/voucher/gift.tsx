import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

// Kiểu dữ liệu voucher
type Voucher = {
  Id: number;
  Name: string;
  Description: string;
  ExpiryDate?: string;
  Code?: string;
  isNew?: boolean;
  collectedAt?: number;
  uniqueId?: string;
  Discount?: number;
  description?: string;
  discount?: number;
  expiryDate?: string;
  expirydate?: string;
  code?: string;
  VoucherCode?: string;
};

// Hàm parse ngày hỗ trợ cả ISO và dd/mm/yyyy
const parseVNDate = (str?: string) => {
  if (!str) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return new Date(str);
  }
  const [day, month, year] = str.split("/").map(Number);
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day);
};

// Hàm lấy mã code từ voucher (ưu tiên các trường có thể có)
const getVoucherCode = (voucher: Voucher) =>
  voucher.Code ||
  voucher.code ||
  voucher.VoucherCode ||
  "";

// Hàm format ngày ra dd/mm/yyyy hoặc còn lại bao nhiêu giờ/phút nếu < 1 ngày
const formatDate = (dateString?: string) => {
  if (!dateString) return "";
  const date = parseVNDate(dateString);
  if (!date || isNaN(date.getTime())) return "";
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  if (diff > 0 && diff < 24 * 60 * 60 * 1000) {
    // Còn dưới 1 ngày
    const hours = Math.floor(diff / (60 * 60 * 1000));
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
    return `Hết hạn: ${hours} giờ ${minutes} phút`;
  }
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const y = date.getFullYear();
  return `Hết hạn: ${d}/${m}/${y}`;
};

export default function VoucherPage() {
  const { user, isAuthenticated, loginWithZalo } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVouchers, setSelectedVouchers] = useState<Voucher[]>([]);
  const [debugInfo, setDebugInfo] = useState<string>("");

  // Auto login nếu chưa đăng nhập - nhưng không force
  useEffect(() => {
    if (!isAuthenticated && !user) {
      // Chỉ auto-login nếu không có user và chưa từng thử login
      const hasAttemptedLogin = localStorage.getItem('attempted_login');
      if (!hasAttemptedLogin) {
        localStorage.setItem('attempted_login', 'true');
        loginWithZalo();
      }
    }
  }, [isAuthenticated, user, loginWithZalo]);

  useEffect(() => {
    // Lấy voucher đã claim từ backend
    const fetchVouchers = async () => {
      if (!user?.zaloId) return;
      
      try {
        const res = await fetch(
          `https://zalo.kosmosdevelopment.com/api/vouchers/user?zaloId=${user.zaloId}`
        );
        if (!res.ok) throw new Error("Không lấy được danh sách voucher");
        const data = await res.json();
        // data có thể là mảng hoặc object, tùy backend trả về
        let list: Voucher[] = [];
        if (Array.isArray(data)) {
          list = data;
        } else if (data && typeof data === "object") {
          list = data.data || data.vouchers || data.items || data.result || [];
          list = Array.isArray(list) ? list : [];
        }
        const now = new Date().getTime();
        const validVouchers = list
          .filter(
            (v: Voucher) =>
              !v.ExpiryDate  ||
              (parseVNDate(v.ExpiryDate)?.getTime() ?? 0) >= now
          )
          .map((v: Voucher) => ({
            ...v,
            // Luôn trả về boolean true/false cho isNew
            isNew: !!(v.collectedAt && now - v.collectedAt < 2 * 60 * 1000),
          }));
        setSelectedVouchers(validVouchers);
        setDebugInfo(`Có ${validVouchers.length} voucher từ backend`);
      } catch (err) {
        setSelectedVouchers([]);
        setDebugInfo("Không lấy được voucher từ backend");
      }
    };

    fetchVouchers();
    // Nếu muốn tự động reload khi quay lại tab:
    const handleFocus = () => fetchVouchers();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [user?.zaloId]);

  // Kiểm tra mã hợp lệ
  const isValidCode = selectedVouchers.some(
    v => getVoucherCode(v) === searchTerm && searchTerm.trim() !== ""
  );

  return (
    <div className="p-4">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-lg font-bold">Chọn ưu đãi từ cửa hàng</h1>
        <div className="flex justify-center mt-2">
          <button className="px-4 py-2 text-blue-500 border-b-2 border-blue-500">
            Đang diễn ra
          </button>
          <button className="px-4 py-2 text-gray-500">Sắp diễn ra</button>
        </div>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Nhập mã ưu đãi tại đây"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
        />
        <button
          className={`px-4 py-2 rounded-lg font-bold transition
            ${isValidCode
              ? "bg-green-500 text-white hover:bg-green-600"
              : "bg-gray-300 text-gray-500"}`}
          disabled={!isValidCode}
        >
          Áp dụng
        </button>
      </div>
      {selectedVouchers.length > 0 ? (
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-5">
        {
          // Group voucher theo Code (ưu tiên) hoặc Id
          Object.values(
            selectedVouchers.reduce((acc, voucher) => {
              const code = getVoucherCode(voucher);
              const key = code || voucher.Id;
              if (!acc[key]) {
                acc[key] = { ...voucher, count: 1 };
              } else {
                acc[key].count += 1;
                // Nếu có voucher mới, giữ trạng thái isNew = true
                if (voucher.isNew) acc[key].isNew = true;
              }
              return acc;
            }, {} as Record<string, any>)
          ).map((voucher: any) => {
            const code = getVoucherCode(voucher);
            return (
              <div
                key={voucher.uniqueId || `${voucher.Id}_${voucher.collectedAt || 0}`}
                className="relative bg-white border border-yellow-200 rounded-lg shadow p-2 flex flex-col gap-1 hover:shadow-lg transition-all duration-200 h-[200px]"
              >
                {/* Badge x2, x3,... */}
                {voucher.count > 1 && (
                  <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow z-10">
                    x{voucher.count}
                  </div>
                )}

                {/* Badge "MỚI" */}
                {voucher.isNew === true && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs py-0.5 px-2 rounded-full font-bold shadow-md z-10 border border-white">
                    MỚI
                  </div>
                )}
                
                {/* Icon voucher */}
                <div className="flex justify-center mb-1">
                  <span className="text-lg">🎫</span>
                </div>

                {/* Dòng 1: Discount hoặc Tên voucher */}
                <div className="h-6 flex items-center justify-center mb-1">
                  {(voucher.Discount || (voucher as any).discount) > 0 ? (
                    <span className="text-base font-bold text-red-700 text-center">
                      {parseFloat(
                        (voucher.Discount ?? (voucher as any).discount).toString()
                      )} %
                    </span>
                  ) : (
                    <span className="text-base font-bold text-blue-700 text-center">
                      {voucher.Name || ""}
                    </span>
                  )}
                </div>

                {/* Dòng 2: Mô tả (luôn giữ chỗ, luôn hiện) */}
                <div className="min-h-[20px] flex items-center justify-center mb-1">
                  <span className="text-xs font-bold text-blue-700 text-center w-full truncate">
                    {voucher.Description || voucher.description || ""}
                  </span>
                </div>

                {/* Dòng 3: Mã code */}
                <div className="flex items-center justify-between mb-1 min-h-[24px]">
                  {code && code.trim() !== "" ? (
                    <>
                      <span className="text-xs text-gray-500">Mã:</span>
                      <span className="bg-blue-50 text-blue-700 font-mono px-1.5 py-0.5 rounded text-xs font-bold select-all">
                        {code}
                      </span>
                    </>
                  ) : null}
                </div>

                {/* Dòng 4: Ngày hết hạn */}
                <div className="min-h-[18px] flex items-center mb-1">
                  {(voucher.ExpiryDate ||
                    (voucher as any).expirydate ||
                    (voucher as any).expiryDate) ? (
                    <p
                      className="text-[10px] flex items-center gap-1 font-bold"
                      style={{ color: "#f59e42" }}
                    >
                      <span className="inline-block" style={{ fontSize: 18 }}>
                        ⏰
                      </span>
                      <span>
                        {formatDate(
                          voucher.ExpiryDate ||
                            (voucher as any).expirydate ||
                            (voucher as any).expiryDate
                        )}
                      </span>
                    </p>
                  ) : null}
                </div>

                {/* Nút áp dụng */}
                <button
                  className="mt-auto bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-2 rounded-lg font-bold shadow hover:from-yellow-500 hover:to-orange-600 transition text-sm w-full"
                  onClick={() => setSearchTerm(code)}
                  disabled={!code}
                >
                  Áp dụng
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center">
          <img
            src="/images/home/no-voucher.png"
            alt="No voucher"
            className="mx-auto mb-4"
            style={{ width: "250px", height: "150px" }}
          />
          <p className="text-gray-500 font-medium">
            Bạn đang không có khuyến mãi nào
          </p>
          <p className="text-gray-400 text-sm">
            Hiện tại bạn không có ưu đãi nào
          </p>
        </div>
      )}

      {/* Debug info */}
      <div className="mt-4 text-xs text-gray-400">
        {debugInfo && <p>{debugInfo}</p>}
      </div>
    </div>
  );
}