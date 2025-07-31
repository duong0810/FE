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
  loginWithZalo: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);



export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Hàm kiểm tra token còn hạn không
  function isValidJWT(token: string | null): boolean {
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (!payload.exp) return false;
      return Date.now() < payload.exp * 1000;
    } catch {
      return false;
    }
  }

  // Hàm logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // Khi mở app, lấy user/token từ localStorage nếu còn hợp lệ
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    if (savedUser && savedToken && isValidJWT(savedToken)) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
      // Kiểm tra user còn tồn tại trên hệ thống không
      fetch("https://be-sgv1.onrender.com/api/users/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${savedToken}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          if (!data.success || !data.user) {
            logout();
          }
        })
        .catch(() => logout());
    } else {
      logout();
    }
  }, []);

  // Hàm cập nhật user từ bên ngoài (sau khi cập nhật profile)
  const updateUser = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  // Hàm này sẽ được gọi thủ công khi người dùng nhấn nút xin quyền
  const loginWithZalo = async () => {
    setIsLoading(true);
    try {
      const result = await handleZaloLogin();
      if (result) {
        setUser(result.user);
        setToken(result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
        localStorage.setItem("token", result.token);
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    } catch (error) {
      setUser(null);
      setToken(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, loginWithZalo, updateUser }}>
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