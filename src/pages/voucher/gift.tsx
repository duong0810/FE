import React, { useEffect, useState } from "react";

// Kiểu dữ liệu voucher
type Voucher = {
  Id: number;
  Name: string;
  Description: string;
  ExpiryDate?: string;
  Code: string;
  isNew?: boolean;
  collectedAt?: number;
  uniqueId?: string;
  Discount?: number;
  description?: string;
  discount?: number;
  expiryDate?: string;
  expirydate?: string;
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

export default function VoucherPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVouchers, setSelectedVouchers] = useState<Voucher[]>([]);
  const [debugInfo, setDebugInfo] = useState<string>("");

  // Lấy zaloId từ localStorage hoặc window
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const zaloId = user.zaloId || window.zaloId || "1234567890";

  useEffect(() => {
    // Lấy voucher đã claim từ backend
    const fetchVouchers = async () => {
      try {
        const res = await fetch(`https://zalo.kosmosdevelopment.com/api/vouchers/user?zaloId=${zaloId}`);
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
        const validVouchers = list.filter(
          (v: Voucher) =>
            !v.ExpiryDate || (parseVNDate(v.ExpiryDate)?.getTime() ?? 0) >= now
        );
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
  }, []);

  // Hàm format ngày ra dd/mm/yyyy
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Không có hạn";
    const date = parseVNDate(dateString);
    if (!date || isNaN(date.getTime())) return "Ngày không hợp lệ";
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  // Kiểm tra mã hợp lệ
  const isValidCode = selectedVouchers.some(
    v => v.Code === searchTerm && searchTerm.trim() !== ""
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
              : "bg-gray-300 text-gray-500"}
          `}
          disabled={!isValidCode}
        >
          Áp dụng
        </button>
      </div>

      {/* Nếu có voucher đã chọn */}
      {selectedVouchers.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-5">
          {selectedVouchers.map((voucher) => (
            <div
              key={voucher.uniqueId || `${voucher.Id}_${voucher.collectedAt || 0}`}
              className="relative bg-white border border-yellow-200 rounded-lg shadow p-2 flex flex-col gap-1 hover:shadow-lg transition-all duration-200 h-[200px]"
            >
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

              {/* Phần giảm giá */}
              {(voucher.Discount || (voucher as any).discount) > 0 && (
                <p className="text-base font-bold text-red-700 text-center mb-1">
                  {parseFloat(voucher.Discount || (voucher as any).discount)} %
                </p>
              )}

              {/* Mô tả */}
              <h3 className="text-xs font-bold text-blue-700 line-clamp-2 mb-1">
                {voucher.Description || voucher.description || ""}
              </h3>

              {/* Mã code */}
              <div className="flex flex-col gap-0.5 mb-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Mã:</span>
                  <span className="bg-blue-50 text-blue-700 font-mono px-1.5 py-0.5 rounded text-xs font-bold select-all">
                    {voucher.Code}
                  </span>
                </div>

                {/* Ngày hết hạn */}
                {(voucher.ExpiryDate || (voucher as any).expirydate) && (
                  <p className="text-xs text-gray-500 flex justify-between items-center">
                    <span>Hết hạn:</span>
                    <span className="font-medium">
                      {formatDate(voucher.ExpiryDate || (voucher as any).expirydate)}
                    </span>
                  </p>
                )}
              </div>

              {/* Nút áp dụng */}
              <button
                className="mt-auto bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-2 rounded-lg font-bold shadow hover:from-yellow-500 hover:to-orange-600 transition text-sm w-full"
                onClick={() => setSearchTerm(voucher.Code)}
              >
                Áp dụng
              </button>
            </div>
          ))}
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