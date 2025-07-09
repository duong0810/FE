import React from "react";
import { useAuth } from "@/context/AuthContext";

import { useNavigate } from "react-router-dom";
function UserAuth() {
  const { user, login, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex items-center space-x-4">
        <img 
          src={user.avatar} 
          alt="Avatar" 
          className="w-16 h-16 rounded-full"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{user.fullname}</h3>
          <p className="text-gray-600">
            {user.phone
              ? (() => {
                  let p = user.phone.trim().replace(/^\+/, "");
                  if (p.startsWith("84")) p = "+" + p;
                  else if (p.startsWith("0")) p = "+84" + p.slice(1);
                  else if (!p.startsWith("+84")) p = "+84" + p;
                  return p.replace(/^\+84/, "+84 ");
                })()
              : 'Chưa có số điện thoại'}
          </p>
        </div>
        <button 
          onClick={logout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Đăng xuất
        </button>
      </div>
    </div>

  );
}

export default UserAuth;
