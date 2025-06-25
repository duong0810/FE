import React, { useState } from "react";

export default function Register() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  function handleRegister() {
    setLoading(true);
    if (!window.ZaloMiniApp) {
      window.ZaloMiniApp = {
        getUserInfo: ({ success }: any) =>
          success({
            id: "testid",
            name: "Test User",
            avatar: "https://i.pravatar.cc/150?img=3",
          }),
        getPhoneNumber: ({ success }: any) =>
          success({ phoneNumber: "0123456789" }),
      };
    }
    window.ZaloMiniApp.getUserInfo({
      success: function (userData: any) {
        window.ZaloMiniApp.getPhoneNumber({
          success: function (phoneData: any) {
            const userInfo = {
              zaloId: userData.id,
              username: userData.name,
              avatar: userData.avatar,
              phone: phoneData.phoneNumber,
            };
            fetch("https://zalo.kosmosdevelopment.com/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    zaloId: userData.id, // phải là id từ Zalo SDK
                    username: userData.name,
                    phone: phoneData.phoneNumber,
                    fullName: userData.name,
                    avatar: userData.avatar
                }),
                })
              .then((res) => res.json())
              .then((data) => {
                setLoading(false);
                if (data.success) {
                  // Lưu cả userid (số nguyên) vào localStorage
                  const userInfo = {
                    userid: data.userid, // <-- lấy từ response backend
                    zaloId: userData.id,
                    username: userData.name,
                    avatar: userData.avatar,
                    phone: phoneData.phoneNumber,
                  };
                  setUser(userInfo);
                  localStorage.setItem("user", JSON.stringify(userInfo));
                } else {
                  alert(data.error || "Đăng ký thất bại!");
                }
              })
              .catch(() => {
                setLoading(false);
                alert("Lỗi kết nối server!");
              });
          },
          fail: function () {
            setLoading(false);
            alert("Không lấy được số điện thoại từ Zalo!");
          },
        });
      },
      fail: function () {
        setLoading(false);
        alert("Không lấy được thông tin Zalo!");
      },
    });
  }

  if (user) {
    return <ProfileInfo user={user} setUser={setUser} />;
  }

  return (
    <div className="min-h-full bg-gray-50 pb-20">
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4 text-center">Tài khoản</h1>
        <div className="bg-white rounded-xl shadow p-4 mb-4 text-center">
          <p className="text-red-600 font-bold text-lg mb-2">Bạn chưa là thành viên</p>
          <p className="text-gray-700 mb-4">
            Đăng ký thành viên để tận hưởng ngàn ưu đãi đặc quyền chỉ dành riêng cho bạn &lt;3
          </p>
          <button
            className="mt-auto bg-gradient-to-r from-blue-300 to-blue-500 text-white px-3 py-1.5 rounded-lg font-bold shadow hover:from-yellow-500 hover:to-orange-600 transition text-xs disabled:opacity-60 w-full"
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfileInfo({ user, setUser }: { user: any; setUser: any }) {
  const [showEdit, setShowEdit] = useState(false);

  return (
    <div className="min-h-full bg-gray-50 pb-20">
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4 text-center">Tài khoản</h1>
        <div className="bg-blue-400 rounded-xl shadow p-4 mb-4 text-white flex items-center">
          <img
            src={user.avatar}
            alt="avatar"
            className="w-16 h-16 rounded-full mr-4 border-4 border-white"
          />
          <div>
            <div className="font-bold text-lg">{user.username}</div>
            <div>Thành viên</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold">Tài Khoản</span>
            <button
              className="flex items-center text-gray-700 hover:text-blue-700 text-sm font-medium"
              onClick={() => setShowEdit(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6h12"
                />
              </svg>
              Cập nhật
            </button>
          </div>
          <div className="divide-y">
            <ProfileField label="Họ tên" value={user.username} />
            <ProfileField label="Giới tính" value={user.gender || "--"} />
            <ProfileField label="Ngày sinh" value={user.birthday || "--"} />
            <ProfileField label="Số điện thoại" value={user.phone} />
          </div>
        </div>
      </div>
      {showEdit && (
        <EditProfileModal user={user} setUser={setUser} onClose={() => setShowEdit(false)} />
      )}
    </div>
  );
}

function EditProfileModal({
  user,
  setUser,
  onClose,
}: {
  user: any;
  setUser: any;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    username: user.username || "",
    gender: user.gender || "Khác",
    birthday: user.birthday || "",
    phone: user.phone || "",
    city: user.city || "",
    district: user.district || "",
    ward: user.ward || "",
    address: user.address || "",
    // Thêm các trường khác nếu muốn
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleGenderChange(gender: string) {
    setForm({ ...form, gender });
  }

  function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  fetch("https://zalo.kosmosdevelopment.com/api/auth/update", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      zaloId: user.zaloId,
      username: form.username,
      gender: form.gender,
      birthday: form.birthday,
      city: form.city,
      district: form.district,
      ward: form.ward,
      address: form.address,
    }),
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("Cập nhật thành công!");
        setUser({ ...user, ...form });
        onClose();
      } else {
        alert(data.error || "Cập nhật thất bại!");
      }
    })
    .catch(() => {
      alert("Lỗi kết nối server!");
    });
}

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form
        className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg relative"
        onSubmit={handleSubmit}
      >
        <h2 className="text-lg font-bold mb-4 text-center">Cập nhật tài khoản</h2>
        <label className="block mb-2 font-medium">
          Họ tên
          <input
            className="w-full border rounded px-3 py-2 mt-1"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />
        </label>
        <div className="mb-2">
          <span className="font-medium">Giới tính</span>
          <div className="flex gap-4 mt-1">
            {["Nam", "Nữ", "Khác"].map((g) => (
              <label key={g} className="flex items-center gap-1">
                <input
                  type="radio"
                  name="gender"
                  checked={form.gender === g}
                  onChange={() => handleGenderChange(g)}
                />
                {g}
              </label>
            ))}
          </div>
        </div>
        <label className="block mb-2 font-medium">
          Ngày sinh
          <input
            className="w-full border rounded px-3 py-2 mt-1"
            name="birthday"
            type="date"
            value={form.birthday}
            onChange={handleChange}
          />
        </label>
        <label className="block mb-2 font-medium">
          Số điện thoại
          <input
            className="w-full border rounded px-3 py-2 mt-1 bg-gray-100"
            name="phone"
            value={form.phone}
            disabled
          />
        </label>
        {/* Thêm các trường địa chỉ */}
        <label className="block mb-2 font-medium">
          <span className="text-red-500">*</span> Thành phố / Tỉnh
          <input
            className="w-full border rounded px-3 py-2 mt-1"
            name="city"
            value={form.city}
            onChange={handleChange}
            required
          />
        </label>
        <div className="flex gap-2 mb-2">
          <label className="flex-1 font-medium">
            <span className="text-red-500">*</span> Quận / Huyện
            <input
              className="w-full border rounded px-3 py-2 mt-1"
              name="district"
              value={form.district}
              onChange={handleChange}
              required
            />
          </label>
          <label className="flex-1 font-medium">
            <span className="text-red-500">*</span> Phường / Xã
            <input
              className="w-full border rounded px-3 py-2 mt-1"
              name="ward"
              value={form.ward}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <label className="block mb-2 font-medium">
          <span className="text-red-500">*</span> Địa chỉ
          <input
            className="w-full border rounded px-3 py-2 mt-1"
            name="address"
            value={form.address}
            onChange={handleChange}
            required
          />
        </label>
        {/* ...các trường khác nếu muốn... */}
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            className="flex-1 py-2 rounded bg-gray-200 text-gray-700 font-semibold"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="flex-1 py-2 rounded bg-blue-500 text-white font-semibold"
          >
            Cập nhật
          </button>
        </div>
      </form>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2">
      <span>{label}</span>
      <span className="text-gray-400">{value}</span>
    </div>
  );
}