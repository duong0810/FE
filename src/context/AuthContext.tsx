import React, { createContext, useContext, useEffect, useState } from 'react';
import { ZaloSDKWrapper } from '@/utils/zalo-sdk';

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
      
      // Thử lấy access token bằng wrapper an toàn
      const accessToken = await ZaloSDKWrapper.getAccessToken();
      
      if (!accessToken) {
        console.log('🔧 Cannot get Zalo access token, using test user');
        // Fallback: sử dụng user test
        const testUser = ZaloSDKWrapper.createTestUser();
        setUser(testUser);
        localStorage.setItem('user', JSON.stringify(testUser));
        return;
      }
      
      // Thử gọi API backend để đăng nhập
      try {
        const response = await fetch('https://zalo.kosmosdevelopment.com/api/auth/zalo-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken })
        });

        if (response.ok) {
          const result = await response.json();
          
          if (result.user && result.user.zaloId) {
            const userData = {
              zaloId: result.user.zaloId,
              name: result.user.name,
              avatar: result.user.avatar
            };
            
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return;
          }
        }
      } catch (apiError) {
        console.warn('⚠️ Backend API error:', apiError);
      }

      // Fallback: Dùng access token làm zaloId tạm thời
      const fallbackUser = {
        zaloId: `zalo_${accessToken.slice(-10)}`,
        name: 'Zalo User',
        avatar: ''
      };
      setUser(fallbackUser);
      localStorage.setItem('user', JSON.stringify(fallbackUser));
      
    } catch (error) {
      console.warn('⚠️ Zalo login error:', error);
      
      // Final fallback: sử dụng user test
      const testUser = ZaloSDKWrapper.createTestUser();
      setUser(testUser);
      localStorage.setItem('user', JSON.stringify(testUser));
      
      console.info('🧪 Using test mode due to Zalo login error');
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