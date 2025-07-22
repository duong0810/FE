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
        <h2 className="font-bold text-lg mb-2">Đăng nhập để sử dụng đầy đủ tính năng</h2>
        <p className="mb-4 text-gray-700">
          Để bảo vệ quyền riêng tư, Mini App chỉ xin quyền khi bạn thực hiện các chức năng cá nhân hóa như nhận ưu đãi, quản lý tài khoản, v.v.<br/>
          Vui lòng đăng nhập để trải nghiệm tốt nhất và nhận các quyền lợi dành riêng cho bạn.
        </p>
        <button
          onClick={handleRequestPermission}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Đăng nhập với Zalo
        </button>
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
