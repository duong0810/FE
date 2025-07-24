import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function AccountUpdate() {
  const navigate = useNavigate();
  const { user, token, loginWithZalo } = useAuth();

  // Đảm bảo birthday luôn là dd/mm/yyyy khi hiển thị
  function toDDMMYYYY(dateStr: string) {
    if (!dateStr) return "";
    const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
    const ymd = dateStr.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
    if (ymd) return `${ymd[3]}/${ymd[2]}/${ymd[1]}`;
    const ddmmyyyy = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (ddmmyyyy) return dateStr;
    return dateStr;
  }
  const [form, setForm] = useState({
    fullname: user?.fullname || user?.fullName || "",
    gender: user?.gender || user?.sex || "",
    birthday: toDDMMYYYY(user?.birthday || ""),
    phone: user?.phone || user?.phonenumber || "",
    address: user?.address || "",
  });

  // Xử lý nhập ngày sinh dạng dd/mm/yyyy, tự nhảy dấu /
  const handleBirthdayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length > 8) value = value.slice(0, 8);
    let formatted = value;
    if (value.length > 4) {
      formatted = value.slice(0, 2) + "/" + value.slice(2, 4) + "/" + value.slice(4);
    } else if (value.length > 2) {
      formatted = value.slice(0, 2) + "/" + value.slice(2);
    }
    setForm({ ...form, birthday: formatted });
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    let currentUser = user;
    let currentToken = token;

    // Nếu thiếu user hoặc token thì xin lại quyền
    if (!currentUser || !currentToken) {
      try {
        await loginWithZalo();
        // Sau khi loginWithZalo, context sẽ cập nhật lại user và token
        // Đợi context cập nhật (có thể cần delay ngắn)
        await new Promise((resolve) => setTimeout(resolve, 500));
        currentUser = user;
        currentToken = token;
      } catch {
        setError("Bạn cần cấp quyền truy cập để cập nhật tài khoản.");
        setLoading(false);
        return;
      }
    }

    if (!currentUser || !currentToken) {
      setError("Không thể lấy thông tin user hoặc token. Vui lòng thử lại.");
      setLoading(false);
      return;
    }

    // Chuyển birthday từ dd/mm/yyyy sang yyyy-mm-dd trước khi gửi lên BE
    let birthday = form.birthday;
    const ddmmyyyy = birthday.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (ddmmyyyy) {
      const [_, day, month, year] = ddmmyyyy;
      birthday = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    const body = { ...form, birthday };
    try {
      const res = await fetch("https://be-sgv1.onrender.com/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Cập nhật thất bại");
      setSuccess(true);
      setTimeout(() => navigate("/account", { replace: true }), 1000);
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow p-4 mt-4">
      <h2 className="text-lg font-bold mb-4">Cập nhật tài khoản</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-500 mb-1">Họ tên</label>
          <input name="fullname" value={form.fullname} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-gray-500 mb-1">Giới tính</label>
          <select name="gender" value={form.gender} onChange={handleChange} className="w-full border rounded px-3 py-2">
            <option value="">--</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Khác">Khác</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-500 mb-1">Ngày sinh</label>
          <input
            name="birthday"
            value={form.birthday}
            onChange={handleBirthdayChange}
            className="w-full border rounded px-3 py-2"
            placeholder="dd/mm/yyyy"
            maxLength={10}
            inputMode="numeric"
            pattern="\d{2}/\d{2}/\d{4}"
          />
        </div>
        <div>
          <label className="block text-gray-500 mb-1">Số điện thoại</label>
          <input name="phone" value={form.phone} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-gray-500 mb-1">Địa chỉ</label>
          <input name="address" value={form.address} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">Cập nhật thành công!</div>}
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-bold" disabled={loading}>
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
          <button type="button" className="bg-gray-200 px-4 py-2 rounded" onClick={() => navigate("/account")}>Huỷ</button>
        </div>
      </form>
    </div>
  );
}
