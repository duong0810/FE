import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

// Kiểu dữ liệu voucher
type Voucher = {
  Id: string; // BE dùng VARCHAR, luôn string
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
  isused?: boolean; // 13/8
  quantity?: number;
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVouchers, setSelectedVouchers] = useState<Voucher[]>([]);
  const { token } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Lấy voucher đã claim từ backend, chỉ gửi Authorization header
    const fetchVouchers = async () => {
      try {
        if (!token) {
          setSelectedVouchers([]);
          return;
        }
        const res = await fetch(
          `https://be-sgv1.onrender.com/api/vouchers/my-vouchers`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
          }
        );
        if (!res.ok) throw new Error("Không lấy được danh sách voucher");
        const data = await res.json();
        let list: Voucher[] = [];
        if (Array.isArray(data)) {
          list = data;
        } else if (data && typeof data === "object") {
          list = data.data || data.vouchers || data.items || data.result || [];
          list = Array.isArray(list) ? list : [];
        }
        const now = new Date().getTime();
        const validVouchers = (list as any[])
          .map((v: any) => {
            // Convert collectedAt về số mili giây nếu là chuỗi
            let collectedAt: number | undefined = undefined;
            if (v.collectedAt) {
              collectedAt =
                typeof v.collectedAt === "number"
                  ? v.collectedAt
                  : new Date(v.collectedAt).getTime();
            }
            return {
              ...v,
              Id: v.voucherid || v.Id || v.code || v.Code || v.VoucherCode || "",
              Code: v.code || v.Code || v.VoucherCode || "",
              Discount: v.discount ? parseFloat(v.discount) : v.Discount,
              ExpiryDate: v.expirydate || v.ExpiryDate,
              Description: v.description || v.Description || "Không có mô tả",
              Name: v.name || v.Name || v.code || "Voucher",
              image: v.image || v.imageurl,
              collectedAt,
              isNew: !!(collectedAt && now - collectedAt < 2 * 60 * 1000),
              isused: v.isused ?? v.IsUsed ?? false, // 13/8
            };
          })
          .filter((v: Voucher) => {
            const dateStr = v.ExpiryDate || v.expirydate || v.expiryDate;
            return !dateStr || (parseVNDate(dateStr)?.getTime() ?? 0) >= now;
          });
        setSelectedVouchers(validVouchers);
      } catch (err) {
        setSelectedVouchers([]);
      }
    };

    fetchVouchers();
    // Reload khi quay lại tab hoặc sau khi claim voucher thành công
    const handleFocus = () => fetchVouchers();
    window.addEventListener("focus", handleFocus);

    // Listen custom event khi claim voucher thành công ở nơi khác
    const handleVoucherClaimed = () => fetchVouchers();
    window.addEventListener("voucher-claimed", handleVoucherClaimed);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("voucher-claimed", handleVoucherClaimed);
    };
  }, [token]);

  // Kiểm tra mã hợp lệ
  const isValidCode = selectedVouchers.some(
    v => getVoucherCode(v) === searchTerm && searchTerm.trim() !== ""
  );

  return (
    <div className="p-4">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-lg font-bold">Ưu đãi từ cửa hàng</h1>
        <div className="flex justify-center mt-2">
          <button className="px-4 py-2 text-blue-500 border-b-2 border-blue-500">
            Đang diễn ra
          </button>
          {/* <button className="px-4 py-2 text-gray-500">Sắp diễn ra</button> */}
        </div>
      </div>

      {/* Thanh tìm kiếm */}
      {showSuccess && (
        <div className="mb-2 text-green-600 font-bold text-center">
          Đã áp dụng thành công!
        </div>
      )}
      {/* <div className="flex items-center gap-2 mb-4">
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
          onClick={() => {
            if (isValidCode) {
              setShowSuccess(true);
              setTimeout(() => setShowSuccess(false), 2000);
              // Ẩn voucher vừa áp dụng khỏi danh sách
              setSelectedVouchers(prev =>
                prev.filter(v => getVoucherCode(v) !== searchTerm)
              );
              setSearchTerm(""); // Xoá ô nhập sau khi áp dụng
            }
          }}
        >
          Áp dụng
        </button>
      </div> */}
      {selectedVouchers.length > 0 ? (
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-5">
        {
          // 13/08
          selectedVouchers.map((voucher) => {
            const code = getVoucherCode(voucher);
            return (
              <div
                key={voucher.uniqueId || `${voucher.Id}_${voucher.collectedAt || 0}`}
                className={`relative bg-white border border-yellow-200 rounded-lg shadow p-2 flex flex-col gap-1 hover:shadow-lg transition-all duration-200 h-[200px] ${
                  voucher.isused ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                {/* Badge x2, x3,... */}
                {(voucher.quantity ?? 1) > 1 && (
                  <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow z-10">
                    x{voucher.quantity ?? 1}
                  </div>
                )}

                {/* Badge "MỚI" */}
                {voucher.isNew === true && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs py-0.5 px-2 rounded-full font-bold shadow-md z-10 border border-white">
                    MỚI
                  </div>
                )}

                {/* Nếu đã sử dụng, hiện chữ "Đã sử dụng" đè lên */}
                {voucher.isused && (
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <span className="bg-gray-700 bg-opacity-70 text-white font-bold px-4 py-2 rounded-lg text-lg">
                      Đã sử dụng
                    </span>
                  </div>
                )}

                <div className="flex justify-center mb-1">
                  <img
                    src="/images/home/voucher.png" 
                    alt="Voucher"
                    className="w-8 h-8" // Tuỳ chỉnh kích thước theo ý muốn
                  />
                </div>

                {/* Dòng 1: Discount (nếu có) hoặc Tên voucher, KHÔNG hiển thị mã voucher ở đây */}
                <div className="h-6 flex items-center justify-center mb-1">
                  {((voucher.Discount ?? (voucher as any).discount) > 0) ? (
                    <span className="text-base font-bold text-red-700 text-center">
                      {parseFloat(
                        (voucher.Discount ?? (voucher as any).discount).toString()
                      )} %
                    </span>
                  ) : (
                    // Nếu là voucher wheel (không có discount), để trống dòng này
                    <span className="text-base font-bold text-blue-700 text-center">
                      {voucher.Name && voucher.Name !== getVoucherCode(voucher) ? voucher.Name : ""}
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
                  {/* <button
                    className="mt-auto bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-2 rounded-lg font-bold shadow hover:from-yellow-500 hover:to-orange-600 transition text-sm w-full"
                    onClick={() => setSearchTerm(code)}
                    disabled={!code || voucher.isused}
                  >
                    Áp dụng
                  </button> */}
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

      {/* Debug info (đã xoá theo yêu cầu) */}
    </div>
  );
}