import React, { createContext, useContext, useEffect, useState } from 'react';
import zmp from 'zmp-sdk';

// Extend Window interface for Zalo app detection
declare global {
  interface Window {
    ZaloJavaScriptInterface?: any;
    webkit?: {
      messageHandlers?: {
        ZaloJavaScriptInterface?: any;
      };
    };
  }
}

interface User {
  zaloId: string;
  name?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithZalo: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Kiểm tra user đã đăng nhập từ localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser.zaloId) {
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const loginWithZalo = async () => {
    try {
      setIsLoading(true);
      
      // Kiểm tra xem có đang chạy trong Zalo app không
      const isInZaloApp = window.ZaloJavaScriptInterface || window.webkit?.messageHandlers?.ZaloJavaScriptInterface;
      
      if (!isInZaloApp) {
        console.log('🔧 Not in Zalo app, using test user');
        // Fallback: sử dụng user test cho development
        const testUser = {
          zaloId: 'dev_user_' + Date.now(),
          name: 'Development User',
          avatar: ''
        };
        setUser(testUser);
        localStorage.setItem('user', JSON.stringify(testUser));
        return;
      }

      // Thử lấy access token từ Zalo
      const accessToken = await zmp.getAccessToken();
      
      if (!accessToken) {
        throw new Error('Cannot get access token');
      }
      
      // Gọi API backend để đăng nhập
      const response = await fetch('https://zalo.kosmosdevelopment.com/api/auth/zalo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken })
      });

      if (!response.ok) {
        throw new Error('Login API failed');
      }

      const result = await response.json();
      
      if (result.user && result.user.zaloId) {
        const userData = {
          zaloId: result.user.zaloId,
          name: result.user.name,
          avatar: result.user.avatar
        };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        throw new Error('Invalid user data from server');
      }
    } catch (error) {
      console.warn('⚠️ Zalo login error:', error);
      
      // Fallback: sử dụng user test cho development
      const testUser = {
        zaloId: 'test_user_' + Date.now(),
        name: 'Test User (Fallback)',
        avatar: ''
      };
      setUser(testUser);
      localStorage.setItem('user', JSON.stringify(testUser));
      
      // Thông báo cho user biết đang dùng chế độ test
      if (typeof window !== 'undefined' && window.console) {
        console.info('🧪 Using test mode due to Zalo login error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      loginWithZalo,
      logout
    }}>
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