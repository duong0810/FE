import React from "react";
import { useAuth } from "@/context/AuthContext";
import { authorize } from "zmp-sdk/apis";

function UserAuth() {
  const { user } = useAuth();
  // Hàm gọi lại popup xin quyền
  const handleRequestPermission = async () => {
    try {
      await authorize({ scopes: ["scope.userInfo", "scope.userPhonenumber"] });
      window.location.reload(); // reload lại để lấy quyền mới
    } catch (e) {
      // Có thể show toast hoặc log lỗi nếu cần
    }
  };
  
  if (!user) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm text-center">
        <p>Vui lòng truy cập qua Zalo Mini App để sử dụng chức năng này.</p>
      </div>
    );
  }

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
      </div>
    </div>
  );
}

export default UserAuth;
