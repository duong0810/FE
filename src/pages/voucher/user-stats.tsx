import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface UserStats {
  totalCollected: number;
  usedVouchers: number;
  activeVouchers: number;
  expiredVouchers: number;
  totalValue?: number;
}

interface UserStatsResponse {
  user: {
    zaloId: string;
    name?: string;
  };
  stats: UserStats;
  vouchers: any[];
}

export default function UserStatsPage() {
  const { user, isAuthenticated, loginWithZalo } = useAuth();
  const [stats, setStats] = useState<UserStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    const fetchUserStats = async () => {
      if (!user?.zaloId) return;
      
      try {
        setLoading(true);
        const response = await fetch(`https://zalo.kosmosdevelopment.com/api/vouchers/user-stats/${user.zaloId}`);
        
        if (!response.ok) {
          throw new Error(`Lỗi ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setStats(data);
        setError("");
      } catch (err: any) {
        setError(err.message || "Lỗi khi lấy thống kê");
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [user?.zaloId]);

  if (!user?.zaloId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang đăng nhập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <span className="text-3xl">📊</span>
            Thống kê voucher của bạn
          </h1>
          <p className="text-gray-600">Zalo ID: {user.zaloId}</p>
          {user.name && <p className="text-gray-600">Tên: {user.name}</p>}
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="font-semibold">Lỗi: {error}</p>
          </div>
        )}

        {stats && !loading && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-400 to-green-500 text-white rounded-xl p-4 shadow-lg">
                <div className="text-2xl font-bold">{stats.stats.totalCollected}</div>
                <div className="text-sm opacity-90">Tổng voucher</div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-400 to-blue-500 text-white rounded-xl p-4 shadow-lg">
                <div className="text-2xl font-bold">{stats.stats.activeVouchers}</div>
                <div className="text-sm opacity-90">Đang hoạt động</div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-400 to-orange-500 text-white rounded-xl p-4 shadow-lg">
                <div className="text-2xl font-bold">{stats.stats.usedVouchers}</div>
                <div className="text-sm opacity-90">Đã sử dụng</div>
              </div>
              
              <div className="bg-gradient-to-br from-red-400 to-red-500 text-white rounded-xl p-4 shadow-lg">
                <div className="text-2xl font-bold">{stats.stats.expiredVouchers}</div>
                <div className="text-sm opacity-90">Đã hết hạn</div>
              </div>
            </div>

            {/* Detailed Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">🎫</span>
                Chi tiết voucher
              </h2>
              
              {stats.vouchers && stats.vouchers.length > 0 ? (
                <div className="space-y-3">
                  {stats.vouchers.map((voucher, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">
                            {voucher.Description || voucher.description || "Voucher"}
                          </h3>
                          {voucher.Code && (
                            <p className="text-sm text-gray-600 font-mono bg-gray-100 inline-block px-2 py-1 rounded mt-1">
                              {voucher.Code}
                            </p>
                          )}
                          {voucher.ExpiryDate && (
                            <p className="text-sm text-gray-500 mt-1">
                              Hết hạn: {new Date(voucher.ExpiryDate).toLocaleDateString('vi-VN')}
                            </p>
                          )}
                        </div>
                        
                        <div className="text-right">
                          {voucher.Discount && (
                            <div className="text-lg font-bold text-red-600">
                              {voucher.Discount}%
                            </div>
                          )}
                          <div className={`text-xs px-2 py-1 rounded-full ${
                            voucher.status === 'active' ? 'bg-green-100 text-green-800' :
                            voucher.status === 'used' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {voucher.status === 'active' ? 'Có thể sử dụng' :
                             voucher.status === 'used' ? 'Đã sử dụng' :
                             'Đã hết hạn'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <span className="text-4xl mb-4 block">🎫</span>
                  <p>Bạn chưa có voucher nào</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
