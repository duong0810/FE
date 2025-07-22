import React, { createContext, useContext, useState, useEffect } from 'react';
import { handleZaloLogin } from '@/services/zaloService';

interface User {
  id: number;
  zaloid: string;
  fullname?: string;
  fullName?: string;
  gender?: string;
  sex?: string;
  birthday?: string;
  phone?: string;
  phonenumber?: string;
  address?: string;
  avatar?: string;
  role?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Chuyển đổi dữ liệu từ Zalo SDK sang User chuẩn
  const mapZaloUserInfo = (info: any): User => ({
    id: info.id || info.zaloId || '',
    zaloid: info.zaloId || info.id || '',
    fullname: info.fullName || info.name || '',
    gender: info.gender || info.sex || '',
    birthday: info.birthday || '',
    phone: info.phoneNumber || info.phone || '',
    avatar: info.avatar || '',
    ...info
  });
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Khi app load, chỉ kiểm tra xem đã có quyền chưa (không tự động xin quyền)
  useEffect(() => {
    const checkZaloAuth = async () => {
      setIsLoading(true);
      try {
        // Chỉ lấy thông tin user nếu đã có quyền
        const { getSetting, getUserInfo, getAccessToken } = await import('zmp-sdk');
        const setting = await getSetting();
        const hasUserInfo = setting.authSetting?.["scope.userInfo"];
        const hasPhone = setting.authSetting?.["scope.userPhonenumber"];
        if (hasUserInfo && hasPhone) {
          // Đã có quyền, lấy thông tin user như cũ
          const userInfoRaw = await getUserInfo();
          const token = await getAccessToken();
          const userInfo = mapZaloUserInfo(userInfoRaw);
          setUser(userInfo);
          setToken(token);
        } else {
          // Chưa có quyền, không gọi authorize, user = null
          setUser(null);
          setToken(null);
        }
      } catch (error) {
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkZaloAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};