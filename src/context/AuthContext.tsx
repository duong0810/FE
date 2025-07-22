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
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Tự động xác thực qua Zalo SDK khi app khởi động
  useEffect(() => {
    const fetchZaloAuth = async () => {
      setIsLoading(true);
      try {
        const result = await handleZaloLogin();
        if (result) {
          setUser(result.user);
          setToken(result.token);
        } else {
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
    fetchZaloAuth();
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