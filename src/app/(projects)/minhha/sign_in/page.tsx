"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.username === "admin" && formData.password === "123456") {
      router.push("/minhha/dashboard"); // Điều hướng sau khi đăng nhập thành công
    } else {
      setError("Sai tên đăng nhập hoặc mật khẩu!");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl text-white text-center mb-4">Đăng nhập</h2>
        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Ô nhập Tên đăng nhập */}
          <input
            type="text"
            name="username"
            placeholder="Tên đăng nhập"
            className="p-3 mb-3 rounded bg-gray-700 text-white"
            value={formData.username}
            onChange={handleChange}
            required
          />
  
          {/* Ô nhập Mật khẩu */}
          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            className="p-3 mb-3 rounded bg-gray-700 text-white"
            value={formData.password}
            onChange={handleChange}
            required
          />
  
          {/* Thông báo lỗi (Hiển thị dưới ô mật khẩu) */}
          {error && <p className="text-red-500 text-sm text-left">{error}</p>}
  
          {/* Nút Đăng nhập */}
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded mt-3">
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
  
}
