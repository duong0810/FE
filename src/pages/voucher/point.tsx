import React, { useState, useEffect, useRef } from "react";


// Định nghĩa kiểu dữ liệu cho voucher - sửa để cho phép undefined
type Voucher = {
  Id: number;
  VoucherID?: string;
  Code?: string;
  description?: string; // ✅ Cho phép undefined
  Description?: string;
  probability?: number; // ✅ Cho phép undefined
  Probability?: number;
  image?: string;
  Image?: string;
  emoji?: string;
  color?: string;
  [key: string]: any;
  expirydate?: string; // ✅ Cho phép undefined
  ExpiryDate?: string; // ✅ Cho phép undefined
};

export default function Point() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wheelVouchers, setWheelVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [wonWheel, setWonWheel] = useState<string>("");
  const wheelRef = useRef<HTMLDivElement>(null);
  const [WheelNumber, setWheelNumber] = useState<number>(0);
  const [banner, setBanner] = useState({
    header1: "",
    header2: "",
    header3: ""
  });

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await fetch("https://zalo.kosmosdevelopment.com/api/vouchers/banner-headers");
        if (!res.ok) throw new Error("Lỗi khi lấy banner");
        const response = await res.json();
        console.log("Banner response:", response);
        
        const bannerData = response.data || response;
        setBanner({
          header1: bannerData.header1 || "CHÚC MỪNG NĂM MỚI",
          header2: bannerData.header2 || "VÒNG QUAY MAY MẮN",
          header3: bannerData.header3 || "2025 - NĂM RỒNG VÀNG"
        });
      } catch (error) {
        console.error("Lỗi fetch banner:", error);
        setBanner({
          header1: "CHÚC MỪNG NĂM MỚI",
          header2: "VÒNG QUAY MAY MẮN",
          header3: "2025 - NĂM RỒNG VÀNG"
        });
      }
    };
    
    fetchBanner();
  }, []);
  
  useEffect(() => {
    const fetchVouchers = async () => {
      setLoading(true);
      try {
        const res = await fetch("https://zalo.kosmosdevelopment.com/api/vouchers?category=wheel");
        if (!res.ok) throw new Error("Lỗi khi lấy dữ liệu voucher");
        const data = await res.json();

        let vouchers: Voucher[] = [];
        if (Array.isArray(data)) {
          vouchers = data;
        } else if (data && typeof data === "object") {
          vouchers = data.data || data.vouchers || [];
        }

        // ✅ Sửa mapping với fallback values
        vouchers = vouchers.map(v => ({
          ...v,
          VoucherID: v.VoucherID || v.voucherid,
          Code: v.Code || v.code,
          description: v.Description || v.description || "Voucher không tên",
          probability: v.Probability || v.probability || 0,
          image: v.Image || v.image,
        }));

        
        console.log("wheelVouchers:", vouchers);
        setWheelVouchers(vouchers);
        setError("");
      } catch (err: any) {
        setError(err.message || "Lỗi không xác định");
        setWheelVouchers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVouchers();
  }, []);
  // 👇 THÊM ĐOẠN NÀY - useEffect cho phím Enter
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && showModal) {
        setShowModal(false);
      }
    };

    // Thêm event listener khi modal mở
    if (showModal) {
      document.addEventListener('keydown', handleKeyPress);
    }

    // Cleanup event listener khi component unmount hoặc modal đóng
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [showModal]);
  
  const user = JSON.parse(localStorage.getItem("user") || "{}");

const handleSpinClick = async () => {
  if (isSpinning || wheelVouchers.length === 0) return;

  setIsSpinning(true);

  try {
    // Quay từ API
    const response = await fetch("https://zalo.kosmosdevelopment.com//api/vouchers/spin");
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    if (!data.voucher) throw new Error('No voucher returned from API');

    let winnerIndex = wheelVouchers.findIndex((v: Voucher) =>
      v.VoucherID === data.voucher.VoucherID ||
      v.VoucherID === data.voucher.voucherid ||
      v.Code === data.voucher.Code ||
      v.Code === data.voucher.code
    );
    if (winnerIndex === -1) {
      winnerIndex = wheelVouchers.findIndex((v: Voucher) =>
        v.description === data.voucher.Description ||
        v.description === data.voucher.description
      );
      if (winnerIndex === -1) winnerIndex = 0;
    }

    setWheelNumber(winnerIndex);

    const segmentAngle = 360 / wheelVouchers.length;
    const targetAngle = 360 - (winnerIndex * segmentAngle + segmentAngle / 2);
    const spins = 8;
    const finalRotation = spins * 360 + targetAngle;

    setRotation(finalRotation);

    setTimeout(() => {
      setIsSpinning(false);

      // Gọi API lưu voucher cho user
      if (user && user.zaloId && (data.voucher.VoucherID || data.voucher.voucherid)) {
        fetch("https://zalo.kosmosdevelopment.com/api/vouchers/assign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            zaloId: user.zaloId,
            voucherId: data.voucher.VoucherID || data.voucher.voucherid
          })
        })
          .then(res => res.json())
          .then(result => {
            if (!result.success) {
              alert(result.error || "Có lỗi khi lưu voucher cho user!");
            }
          })
          .catch(() => {
            alert("Lỗi kết nối server khi lưu voucher!");
          });
      }

      const wonDescription = data.voucher.Description ||
        data.voucher.description ||
        wheelVouchers[winnerIndex]?.description ||
        "Voucher";

      setWonWheel(wonDescription);
      setShowConfetti(true);
      setShowModal(true);

      const stored = localStorage.getItem("selectedVoucher");
      let selectedList: any[] = [];
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          selectedList = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          selectedList = [];
        }
      }
      selectedList = selectedList.map(v => ({ ...v, isNew: false }));

      const wonVoucher = {
        Id: data.voucher.VoucherID || data.voucher.Id || wheelVouchers[winnerIndex]?.Id,
        Name: data.voucher.Name || wheelVouchers[winnerIndex]?.Name || "",
        Description: data.voucher.Description || data.voucher.description || wheelVouchers[winnerIndex]?.Description || wheelVouchers[winnerIndex]?.description || "",
        Code: data.voucher.Code || data.voucher.code || wheelVouchers[winnerIndex]?.Code || "",
        Discount: data.voucher.Discount || wheelVouchers[winnerIndex]?.Discount || 0,
        ExpiryDate:
          data.voucher.ExpiryDate ||
          data.voucher.expirydate ||
          data.voucher.expiredAt ||
          data.voucher.endDate ||
          wheelVouchers[winnerIndex]?.ExpiryDate ||
          wheelVouchers[winnerIndex]?.expirydate ||
          wheelVouchers[winnerIndex]?.expiredAt ||
          wheelVouchers[winnerIndex]?.endDate ||
          "",
        isNew: true,
        collectedAt: Date.now(),
        uniqueId: `${data.voucher.VoucherID || data.voucher.Id || wheelVouchers[winnerIndex]?.Id}_${Date.now()}`,
      };

      selectedList.push(wonVoucher);
      localStorage.setItem("selectedVoucher", JSON.stringify(selectedList));

      setRotation(0);
      setTimeout(() => setShowConfetti(false), 8000);
    }, 4000);

  } catch (error) {
    // Fallback random local
    setIsSpinning(false);
    const probabilities = wheelVouchers.map(v => v.probability || 0);
    let rand = Math.random();
    let acc = 0;
    let winnerIndex = 0;
    for (let i = 0; i < probabilities.length; i++) {
      acc += probabilities[i];
      if (rand < acc) {
        winnerIndex = i;
        break;
      }
    }
    setWheelNumber(winnerIndex);

    const segmentAngle = 360 / wheelVouchers.length;
    const targetAngle = 360 - (winnerIndex * segmentAngle + segmentAngle / 2);
    const spins = 8;
    const finalRotation = spins * 360 + targetAngle;

    setRotation(finalRotation);

    setTimeout(() => {
      setIsSpinning(false);

      // Gọi API lưu voucher cho user (fallback)
      if (user && user.zaloId && wheelVouchers[winnerIndex]?.VoucherID) {
        fetch("https://zalo.kosmosdevelopment.com/api/vouchers/assign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            zaloId: user.zaloId,
            voucherId: wheelVouchers[winnerIndex].VoucherID
          })
        })
          .then(res => res.json())
          .then(result => {
            if (!result.success) {
              alert(result.error || "Có lỗi khi lưu voucher cho user!");
            }
          })
          .catch(() => {
            alert("Lỗi kết nối server khi lưu voucher!");
          });
      }

      setWonWheel(wheelVouchers[winnerIndex]?.description || "Voucher");
      setShowConfetti(true);
      setShowModal(true);

      const stored = localStorage.getItem("selectedVoucher");
      let selectedList: any[] = [];
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          selectedList = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          selectedList = [];
        }
      }
      selectedList = selectedList.map(v => ({ ...v, isNew: false }));

      const wonVoucher = {
        ...wheelVouchers[winnerIndex],
        isNew: true,
        collectedAt: Date.now(),
        uniqueId: `${wheelVouchers[winnerIndex]?.Id}_${Date.now()}`
      };
      selectedList.push(wonVoucher);
      localStorage.setItem("selectedVoucher", JSON.stringify(selectedList));

      setRotation(0);
      setTimeout(() => setShowConfetti(false), 8000);
    }, 4000);
  }
};

  const renderWheelSegments = () => {
  if (!Array.isArray(wheelVouchers) || wheelVouchers.length === 0) return null;
  const segmentColors = [
    "#FFFBEA", "#FFFFFF", "#FFE4B2", "#FFF8DC",
    "#FFFACD", "#FFF0F5", "#FFFAF0", "#FFF5E1"
  ];
  const segmentAngle = 360 / wheelVouchers.length;

  return wheelVouchers.map((voucher: Voucher, index: number) => {
    const startAngle = -90 + index * segmentAngle;
    const endAngle = -90 + (index + 1) * segmentAngle;

    const centerX = 200;
    const centerY = 200;
    const radius = 190;

    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);

    const largeArcFlag = segmentAngle > 180 ? 1 : 0;

    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    const textAngle = startAngle + segmentAngle / 2;
    const textRadius = radius * 0.70;
    const imageRadius = radius * 0.82;
    const textAngleRad = (textAngle * Math.PI) / 180;
    const textX = centerX + textRadius * Math.cos(textAngleRad);
    const textY = centerY + textRadius * Math.sin(textAngleRad);
    const imageX = centerX + imageRadius * Math.cos(textAngleRad);
    const imageY = centerY + imageRadius * Math.sin(textAngleRad);

    return (
      <g key={`${voucher.Id}-${index}`}>
        <path
          d={pathData}
          fill={segmentColors[index % segmentColors.length]}
          stroke="#DC143C"
          strokeWidth="3"
          className="transition-all duration-300"
        />
        <g transform={`translate(${imageX}, ${imageY}) rotate(${textAngle + 90})`}>
          {voucher.image ? (
            <image
              href={voucher.image}
              x="-25"
              y="-15"
              width="50"
              height="50" /* 🎯 Giảm kích thước image cho mobile */
              style={{ borderRadius: "12px" }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : null}
          <text
            x="0"
            y="45" /* 🎯 Điều chỉnh vị trí text */
            textAnchor="middle"
            dominantBaseline="hanging"
            fill="#8B0000"
            fontSize="10" /* 🎯 Giảm font size cho mobile */
            fontWeight="bold"
            fontFamily="serif"
          >
            {voucher.description && voucher.description.length > 15 
              ? voucher.description.substring(0, 12) + "..." 
              : voucher.description || "Voucher"} {/* 🎯 Cắt text dài */}
          </text>
        </g>
      </g>
    );
  });
};

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-500 to-red-700">
        <div className="absolute inset-0 bg-gradient-to-tl from-yellow-400 via-orange-400 to-red-500 opacity-60"></div>
      </div>
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* 🎯 Giảm số lượng animation cho mobile */}
      {[...Array(8)].map((_, i) => ( // Giảm từ 15 xuống 8
        <div
          key={i}
          className="absolute text-yellow-400 text-xl md:text-2xl opacity-70"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${4 + Math.random() * 2}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`
          }}
        >
          🪙
        </div>
      ))}
      
      {[...Array(10)].map((_, i) => ( // Giảm từ 20 xuống 10
        <div
          key={`flower-${i}`}
          className="absolute text-pink-300 text-base md:text-lg opacity-80"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 4}s`
          }}
        >
          🌸
        </div>
      ))}

      {[...Array(10)].map((_, i) => ( // Giảm từ 20 xuống 10
        <div
          key={`gift-${i}`}
          className="absolute text-pink-300 text-base md:text-lg opacity-80"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 4}s`
          }}
        >
          🎁  🎉
        </div>
      ))}
    </div>

      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {/* 🎆 Pháo hoa tỏa từ nhiều điểm khác nhau trên màn hình */}
          {[...Array(80)].map((_, i) => (
            <div
              key={`center-${i}`}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `fireworkCenter ${1 + Math.random() * 1.5}s ease-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            >
             
            </div>
          ))}
          
          {/* 🎊 Confetti rơi từ trên xuống toàn màn hình */}
          {[...Array(100)].map((_, i) => (
            <div
              key={`falling-${i}`}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-50px',
                animation: `fallDown ${4 + Math.random() * 3}s linear infinite`,
                animationDelay: `${Math.random() * 4}s`
              }}
            >
              <div className="text-2xl">
                {['🎊', '🎉'][Math.floor(Math.random() * 8)]}
              </div>
            </div>
          ))}

          {/* 🌟 Pháo hoa từ cạnh trái và phải bay vào giữa */}
          {[...Array(40)].map((_, i) => (
            <div
              key={`side-${i}`}
              className="absolute"
              style={{
                left: i % 2 === 0 ? '-50px' : 'calc(100% + 50px)',
                top: `${Math.random() * 100}%`,
                animation: `flyToCenter ${3 + Math.random() * 2}s ease-out infinite`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            >
              <div className="text-3xl">
                {['💥'][Math.floor(Math.random() * 5)]}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-5xl font-black text-yellow-300 mb-2 drop-shadow-2xl"
              style={{ fontFamily: 'serif', textShadow: '4px 4px 0px #8B0000' }}>
            {banner.header1}
          </h1>
          <h2 className="text-2xl md:text-4xl font-bold text-yellow-200 mb-4 drop-shadow-xl"
              style={{ fontFamily: 'serif', textShadow: '2px 2px 0px #8B0000' }}>
            {banner.header2}
          </h2>
          <div className="inline-block bg-gradient-to-r from-yellow-400 to-yellow-300 text-red-800 px-6 py-2 rounded-full font-bold text-lg border-4 border-red-600 shadow-xl">
            🎀 {banner.header3} 🎀
          </div>
        </div>

        <div className="relative mb-8">
          <div className="absolute -inset-2 rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, #FFD700, #FF6B6B, #FFD700, #FF6B6B)',
                animation: 'spin 30s linear infinite'
              }}>
          </div>
          <div className="absolute -inset-1 rounded-full bg-red-700 border-2 border-yellow-400"></div>
          <div className="relative bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-full p-2 shadow-2xl border-4 border-red-600">

            {loading ? (
              <div className="flex justify-center items-center w-72 h-72 md:w-96 md:h-96"> {/* 🎯 Sửa kích thước responsive */}
                <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-red-600"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 p-8 text-center font-semibold w-72 h-72 md:w-96 md:h-96 flex items-center justify-center"> {/* 🎯 Sửa kích thước responsive */}
                {error}
              </div>
            ) : (
              <div className="relative">
                <div
                  ref={wheelRef}
                  className="transition-all ease-out"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transformOrigin: 'center',
                    transitionDuration: isSpinning ? '4000ms' : '0ms'
                  }}
                >
                  {/* 🎯 Sửa SVG responsive */}
                  <svg 
                    width="100%" 
                    height="100%" 
                    viewBox="0 0 400 400" 
                    className="w-72 h-72 md:w-96 md:h-96"
                  >
                    <circle
                      cx="200"
                      cy="200"
                      r="185"
                      fill="none"
                      stroke="#DC143C"
                      strokeWidth="8"
                    />
                    {renderWheelSegments()}
                  </svg>
                </div>
                
                {/* 🎯 Sửa nút QUAY responsive */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col items-center">
                  <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[18px] md:border-l-[16px] md:border-r-[16px] md:border-b-[24px] border-l-transparent border-r-transparent border-b-yellow-500 mb-0 drop-shadow-lg"></div>
                  <div
                    className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center text-yellow-300 font-black text-sm md:text-lg shadow-2xl border-4 md:border-6 border-yellow-400 cursor-pointer select-none transition active:scale-95"
                    style={{ fontFamily: 'serif' }}
                    onClick={handleSpinClick}
                    tabIndex={0}
                    role="button"
                    aria-label="Quay"
                  >
                    QUAY
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={handleSpinClick}
          className="group relative mb-8"
          disabled={isSpinning || loading || wheelVouchers.length === 0}
        >
          <div className="absolute -inset-3 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full blur-sm opacity-75 group-hover:opacity-100 transition duration-300"></div>
          <div className="relative px-8 md:px-16 py-4 md:py-5 bg-gradient-to-br from-yellow-400 via-yellow-300 to-yellow-500 text-red-800 font-black text-xl md:text-2xl rounded-full shadow-2xl border-6 border-red-600 transform transition duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
               style={{ fontFamily: 'serif' }}>
            {isSpinning ? (
              <span className="flex items-center">
                <div className="flex justify-center items-center text-center font-bold text-xl md:text-2xl mt-6"></div>
                ĐANG QUAY
              </span>
            ) : loading ? (
              "ĐANG TẢI..."
            ) : (
                <span className="flex items-center whitespace-nowrap">
                🧧 QUAY LIỀN TAY NHẬN LÌ XÌ 🧧
              </span>
            )}
          </div>
        </button>

        {wheelVouchers.length > 0 && (
          <div className="text-center max-w-6xl">
            <p className="text-yellow-200 text-lg mb-6 font-bold" style={{ fontFamily: 'serif' }}>
              🎊 CÁC PHẦN THƯỞNG HẤP DẪN 🎊
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {wheelVouchers.map((voucher: Voucher, index: number) => (
                <div key={`${voucher.Id}-${index}`} className="bg-gradient-to-br from-yellow-100 to-yellow-200 backdrop-blur-sm rounded-xl px-4 py-3 text-red-800 border-3 border-red-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="text-2xl mb-2">
                    {voucher.image && (
                      <img src={voucher.image} alt={voucher.description || "Voucher"} className="w-8 h-8 mx-auto rounded-full object-cover" />
                    )}
                  </div>
                  <div className="font-bold text-sm" style={{ fontFamily: 'serif' }}>
                    {voucher.description || "Voucher"}
                  </div>
                  {/* Thêm các trường thông tin khác nếu có */}
                  {/* {voucher.Code && (
                    <div className="text-xs mt-1">Mã: <span className="font-semibold">{voucher.Code}</span></div>
                  )} */}
                  {voucher.Discount && (
                    <div className="text-xs mt-1">Giảm giá: <span className="font-semibold">{voucher.Discount}</span></div>
                  )}
                  {(voucher.ExpiryDate || voucher.expiredAt) && (
                    <div className="text-xs mt-1">
                      HSD: <span className="font-semibold">{voucher.ExpiryDate || voucher.expiredAt}</span>
                    </div>
                  )}
                  {voucher.condition && (
                    <div className="text-xs mt-1">Điều kiện: <span className="font-semibold">{voucher.condition}</span></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-yellow-100 to-red-100 rounded-3xl p-8 md:p-12 max-w-lg w-full text-center transform animate-bounce border-8 border-red-600 shadow-2xl">
            <div className="text-6xl md:text-8xl mb-6">🎊</div>
            <h2 className="text-2xl md:text-4xl font-black text-red-800 mb-4" style={{ fontFamily: 'serif' }}>
              🎉 CHÚC MỪNG BẠN! 🎉
            </h2>
            <p className="text-lg md:text-xl text-red-700 mb-8 font-bold" style={{ fontFamily: 'serif' }}>
              Bạn đã nhận được lì xì:
            </p>
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 text-red-800 px-6 py-4 rounded-2xl font-black text-xl border-4 border-red-600 mb-8">
              {wonWheel}
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="bg-gradient-to-r from-red-600 to-red-700 text-yellow-300 font-black py-4 px-8 md:px-12 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition duration-200 text-lg border-4 border-yellow-400"
              style={{ fontFamily: 'serif' }}
              autoFocus            
            >
              🧧 NHẬN LÌ XÌ 🧧
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg) scale(1); 
            opacity: 0.7; 
          }
          50% { 
            transform: translateY(-30px) rotate(180deg) scale(1.1); 
            opacity: 1; 
          }
        }

        /* 🎆 Pháo hoa tỏa ra từ nhiều vị trí */
        @keyframes fireworkCenter {
          0% { 
            transform: scale(0) rotate(0deg); 
            opacity: 1; 
          }
          30% { 
            transform: scale(1.5) rotate(120deg); 
            opacity: 1; 
          }
          70% { 
            transform: scale(3) rotate(240deg); 
            opacity: 0.7; 
          }
          100% { 
            transform: scale(5) rotate(360deg); 
            opacity: 0; 
          }
        }

        /* 🎇 Pháo hoa tỏa tròn với phạm vi lớn hơn */
        @keyframes fireworkRadial {
          0% { 
            transform: translate(-50%, -50%) rotate(var(--rotation, 0deg)) translateY(0px) scale(0); 
            opacity: 1; 
          }
          40% { 
            transform: translate(-50%, -50%) rotate(var(--rotation, 0deg)) translateY(-300px) scale(2); 
            opacity: 1; 
          }
          100% { 
            transform: translate(-50%, -50%) rotate(var(--rotation, 0deg)) translateY(-600px) scale(0); 
            opacity: 0; 
          }
        }

        /* 🎊 Confetti rơi xuống chậm hơn */
        @keyframes fallDown {
          0% { 
            transform: translateY(-50px) rotate(0deg) scale(1); 
            opacity: 1; 
          }
          50% { 
            transform: translateY(50vh) rotate(180deg) scale(1.2); 
            opacity: 0.8; 
          }
          100% { 
            transform: translateY(100vh) rotate(360deg) scale(0.8); 
            opacity: 0; 
          }
        }

        /* 🌟 Pháo hoa bay từ 2 bên vào giữa */
        @keyframes flyToCenter {
          0% { 
            transform: translateX(0) scale(0) rotate(0deg); 
            opacity: 1; 
          }
          50% { 
            transform: translateX(50vw) scale(2) rotate(180deg); 
            opacity: 1; 
          }
          100% { 
            transform: translateX(50vw) scale(0) rotate(360deg); 
            opacity: 0; 
          }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}