"use client";

import api from "@/lib/axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorPopup, setErrorPopup] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      alert("Please enter both username and password.");
      return;
    }

    try {
      setLoading(true);
      
      localStorage.clear();

      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);
      
      const res = await api.post(
        "/api/v1/auth/login",
        formData
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
      setErrorPopup(error.response?.data?.detail || "Invalid credentials. Please try again.");
      
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
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#F5F5F7] text-[#111111] px-4 selection:bg-black/10 selection:text-black relative overflow-hidden">
      
      {/* Soft Ambient Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full mix-blend-multiply filter blur-[100px] opacity-50 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-100 rounded-full mix-blend-multiply filter blur-[100px] opacity-50 pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white p-8 sm:p-12 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.04)] border border-black/5 w-full max-w-[480px] relative z-10"
      >
        <button
          onClick={handleBack}
          className="absolute top-6 left-6 p-2 text-black/40 hover:text-black hover:bg-black/5 rounded-full transition-all cursor-pointer"
          title="Back to home"
        >
          <ArrowLeft size={20} />
        </button>
        
        <div className="text-center mb-10 mt-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[1.25rem] bg-black text-white mb-6 shadow-md border border-black/10">
            <span className="text-xl font-extrabold tracking-tighter">WC</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-black">
            Welcome Back
          </h1>
          <p className="text-black/50 text-sm mt-2 font-medium">Sign in to your Index 26 account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-black/70 uppercase tracking-wider mb-2">Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              className="w-full rounded-xl bg-[#F5F5F7] border border-transparent p-3.5 focus:outline-none focus:bg-white focus:border-black/20 focus:ring-4 focus:ring-black/5 transition-all text-sm text-black placeholder-black/30 shadow-inner"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-black/70 uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full rounded-xl bg-[#F5F5F7] border border-transparent p-3.5 focus:outline-none focus:bg-white focus:border-black/20 focus:ring-4 focus:ring-black/5 transition-all text-sm text-black placeholder-black/30 shadow-inner"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white p-4 rounded-xl font-semibold hover:bg-black/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_4px_14px_rgba(0,0,0,0.1)] cursor-pointer mt-2"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-black/50 mt-8">
          Don't have an account?
          <Link
            href="/signup"
            className="text-black ml-1.5 font-bold hover:underline transition-colors"
          >
            Create one
          </Link>
        </p>
      </motion.div>

      {/* POPUP ERROR STATUS */}
      <AnimatePresence>
        {errorPopup && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/80 backdrop-blur-xl z-[100] flex items-center justify-center" 
            onClick={() => setErrorPopup(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="rounded-[2rem] p-8 w-[380px] flex flex-col items-center bg-white border border-black/5 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <XCircle className="h-12 w-12 text-rose-500 mb-4" strokeWidth={1.5} />
              
              <h3 className="font-bold text-black text-xl mb-2">
                Login Failed
              </h3>
              
              <p className="text-sm text-center text-black/60 font-medium leading-relaxed px-4">
                {errorPopup}
              </p>

              <button 
                onClick={() => setErrorPopup(null)}
                className="mt-8 w-full bg-[#F5F5F7] border border-black/5 text-black py-3 rounded-xl text-sm font-semibold hover:bg-black/5 transition-all cursor-pointer"
              >
                Try Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}