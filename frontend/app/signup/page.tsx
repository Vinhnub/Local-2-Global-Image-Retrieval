"use client";

import api from "@/lib/axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorPopup, setErrorPopup] = useState<string | null>(null);

  const handleSignup = async () => {
    try {
      if (!username || !password) {
        alert("Please enter username and password.");
        return;
      }

      setLoading(true);

      const res = await api.post( "/api/v1/auth/register", {username, password});
      
      console.log("res", res)

      router.push("/login");
      
      toast.success("Sign up successfully")


      } catch (err: any) {
        console.error(err);
        setErrorPopup(err.response?.data?.detail || "Error when call sign up");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-violet-900 to-fuchsia-900 relative text-white px-4 selection:bg-fuchsia-500 selection:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent opacity-60 pointer-events-none"></div>

      <div className="bg-[#1e1b4b]/80 p-8 rounded-2xl shadow-[0_0_30px_rgba(217,70,239,0.2)] border border-fuchsia-400/30 w-full max-w-[480px] h-auto text-white relative z-10 backdrop-blur-xl">
        <Link
            href="/home"
            className="absolute top-4 left-4 p-2 text-fuchsia-300 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer"
            title="Back to home"
          >
          <ArrowLeft size={20} />
        </Link>
        
        <div className="text-center mb-8 mt-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 mb-4 shadow-[0_0_15px_rgba(34,211,238,0.5)] border-2 border-white/20 text-3xl">
            🏆
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight drop-shadow-md">
            Join the Club
          </h1>
          <p className="text-fuchsia-200/80 text-sm mt-2">Create your WC26 account</p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-fuchsia-300 uppercase tracking-wider mb-1.5 drop-shadow-sm">Username</label>
            <input
              type="text"
              placeholder="Choose a username"
              className="w-full rounded-xl bg-black/40 border border-white/10 p-3 focus:outline-none focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-400 transition-all text-sm text-white placeholder-gray-400 shadow-inner"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-fuchsia-300 uppercase tracking-wider mb-1.5 drop-shadow-sm">Password</label>
            <input
              type="password"
              placeholder="Create a password"
              className="w-full rounded-xl bg-black/40 border border-white/10 p-3 focus:outline-none focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-400 transition-all text-sm text-white placeholder-gray-400 shadow-inner"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-3 rounded-xl font-bold hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(34,211,238,0.4)] hover:shadow-[0_0_25px_rgba(34,211,238,0.6)] cursor-pointer mt-4 uppercase tracking-wide"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </div>

        <p className="text-center text-sm text-fuchsia-100/80 mt-6 border-t border-fuchsia-400/20 pt-6">
          Already have an account?
          <Link href="/login" className="text-cyan-400 ml-1.5 font-bold hover:text-cyan-300 hover:underline drop-shadow-[0_0_5px_rgba(34,211,238,0.5)] transition-colors">
            Login
          </Link>
        </p>

      </div>

      {/* POPUP ERROR STATUS */}
      {errorPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center animate-fade-in" onClick={() => setErrorPopup(null)}>
          <div 
            className="rounded-3xl p-8 w-[380px] flex flex-col items-center shadow-2xl border backdrop-blur-xl relative gap-3 animate-fade-in-up bg-rose-950/80 border-rose-500/40 shadow-[0_0_40px_rgba(225,29,72,0.3)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-500/20 border-2 border-rose-400/50 drop-shadow-[0_0_15px_rgba(225,29,72,0.5)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-400">
                <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>
              </svg>
            </div>
            
            <h3 className="font-extrabold text-transparent bg-clip-text text-2xl mt-4 drop-shadow-md text-center"
                style={{ backgroundImage: 'linear-gradient(to right, #fb7185, #e11d48)' }}>
              Registration Failed
            </h3>
            
            <p className="text-sm text-center text-white/90 font-medium leading-relaxed px-4">
              {errorPopup}
            </p>

            <button 
              onClick={() => setErrorPopup(null)}
              className="mt-6 w-full bg-white/10 border border-white/20 text-white py-3 rounded-xl text-sm font-bold hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all backdrop-blur-md uppercase tracking-wider cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

    </div>
  );
};