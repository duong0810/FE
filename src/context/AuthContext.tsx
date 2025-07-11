import React, { createContext, useContext, useState, useEffect } from 'react';
import * as zaloService from '@/services/zaloService';

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
  refreshUser?: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Luôn tự động lấy access token từ Zalo SDK khi app khởi động
  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        // Lấy access token từ Zalo SDK
        const accessToken = await zaloService.getAccessToken();
        setToken(accessToken);
        if (accessToken) {
          const res = await fetch('https://zalo.kosmosdevelopment.com/api/users/me', {
            headers: { 'access-token': accessToken },
          });
          const data = await res.json();
          if (data && data.user) {
            setUser(data.user);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (e) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Hàm cập nhật lại user context (nếu cần)
  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await fetch('https://zalo.kosmosdevelopment.com/api/users/me', {
        headers: { 'access-token': token },
      });
      const data = await res.json();
      if (data && data.user) {
        setUser(data.user);
      }
    } catch (e) {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, refreshUser }}>
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