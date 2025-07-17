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
  login: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  refreshUser?: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Khôi phục thông tin từ localStorage khi app khởi động
  useEffect(() => {
    const savedToken = localStorage.getItem('zalo_token');
    const savedUser = localStorage.getItem('zalo_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Hàm cập nhật user context sau khi cập nhật thông tin tài khoản
  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('zalo_token');
      if (!token) return;
      const res = await fetch('https://be-sgv1.onrender.com/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data && data.user) {
        setUser(data.user);
      }
    } catch (e) {
      // ignore
    }
  };

  const login = async () => {
    setIsLoading(true);
    try {
      const result = await handleZaloLogin();
      
      if (result) {
        setUser(result.user);
        setToken(result.token);
        
        // Lưu vào localStorage
        localStorage.setItem('zalo_token', result.token);
        localStorage.setItem('zalo_user', JSON.stringify(result.user));
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('zalo_token');
    localStorage.removeItem('zalo_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, refreshUser }}>
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