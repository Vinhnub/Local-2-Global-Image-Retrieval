"use client";

import api from "@/lib/axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      alert("Please enter both username and password.");
      return;
    }

    try {
      setLoading(true);
      
      localStorage.clear();

      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);
      formData.append("grant_type", "password");
      formData.append("scope", "");
      formData.append("client_id", "");
      formData.append("client_secret", "");
      
      const res = await api.post(
        "/api/v1/auth/login",
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      
      const { access_token } = res.data;

      if (!access_token) {
        throw new Error("Access token not found.");
      }

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("id", res.data.user.id);
      localStorage.setItem("username", res.data.user.username);
      localStorage.setItem("is_pro", res.data.user.is_pro);
      localStorage.setItem("pro_expire_date", res.data.user.pro_expire_date);
      localStorage.setItem("created_at", res.data.user.created_at);

      router.push("/home");
    } catch (error: any) {
      console.error("Login Error:", error.response?.data || error);
      alert(error.response?.data?.detail || "Invalid credentials. Please try again.");
      
      // --- CLEAR EVERYTHING ON FAILURE ---
      setUsername("");
      setPassword("");
    } finally {
      setLoading(false);
    }
  };
   
  const handleBack = () => {
    router.push("/home")
  }
  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">

      {/* Changed fixed height to h-auto to dynamically scale with errors or text adjustments safely */}
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-[480px] h-auto text-black relative z-10">
        <Link
            href="/home"
            className="ml-1.5 font-medium opacity-35 hover:opacity-80 hover:underline absolute top-2 right-2 text-black"
          >
          Back to home
        </Link>
        <h1 className="text-3xl font-bold text-center mb-8">
          Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors cursor-pointer mt-2"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?
          <Link
            href="/signup"
            className="text-blue-600 ml-1.5 font-medium hover:underline"
          >
            Sign Up
          </Link>
        </p>

      </div>
    </div>
  );
}