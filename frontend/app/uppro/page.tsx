"use client";

import { useState } from "react";
import { Crown, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";

export default function UpgradeProPage() {
  const [days, setDays] = useState<number>(30);
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const dayOptions = [30, 90, 180, 365];
  const router = useRouter()
  
  const handleUpgrade = async () => {
    setLoading(true);
    setStatus(null);
    try {

      const res = await api.post("/api/v1/auth/upgrade-pro", {"days": days})
      
      setStatus({
        type: "success",
        message: `Update Pro successfully ${days} days!`,
      });
      
      localStorage.setItem("is_pro", res.data.is_pro)
      
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#d97706'] // amber colors
      });

    } catch (error) {
      console.log(error)
      setStatus({
        type: "error",
        message: "Error, try again later",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-950 via-violet-900 to-fuchsia-900 px-4 relative selection:bg-amber-500 selection:text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400/10 via-transparent to-transparent opacity-60 pointer-events-none"></div>
      
      {/* Background Ambient Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob"></div>

      <div className="w-full max-w-md rounded-2xl border border-amber-400/30 bg-[#1e1b4b]/80 p-8 shadow-[0_0_30px_rgba(245,158,11,0.2)] backdrop-blur-xl relative z-10 animate-fade-in-up">
        
        <button
          onClick={() => router.push("/home")}
          className="absolute top-4 left-4 p-2 text-amber-300 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer"
          title="Back to home"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex flex-col items-center text-center mt-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-yellow-400 to-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.5)] border-2 border-white/20">
            <Crown className="h-8 w-8 text-yellow-950 fill-yellow-900" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 drop-shadow-md tracking-tight">Upgrade PRO</h2>
          <p className="mt-2 text-sm text-amber-100/80 font-medium">
            Unlock premium features and become a champion.
          </p>
        </div>

        <div className="mt-8 space-y-5">
          <label className="text-sm font-bold text-amber-300 uppercase tracking-wider drop-shadow-sm flex justify-between items-center">
            <span>Duration:</span> 
            <span className="text-white bg-amber-500/20 px-3 py-1 rounded border border-amber-500/50 shadow-sm">{days} Days</span>
          </label>
          
          <input
            type="range"
            min="1"
            max="365"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-black/40 accent-amber-500 outline-none focus:ring-1 focus:ring-amber-400 border border-white/10 shadow-inner"
          />

          <div className="grid grid-cols-4 gap-2 pt-2">
            {dayOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setDays(opt)}
                className={`rounded-xl py-2.5 text-xs font-bold transition-all border shadow-inner ${
                  days === opt
                    ? "border-amber-400 bg-amber-500/20 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.4)] scale-105"
                    : "border-white/10 bg-black/30 text-amber-100/60 hover:bg-black/50 hover:text-amber-100"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {status && (
          <div
            className={`mt-6 flex items-center gap-3 rounded-xl p-4 text-sm font-bold backdrop-blur-md border shadow-lg animate-fade-in-up ${
              status.type === "success"
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                : "bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
            }`}
          >
            {status.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0" />
            ) : (
              <div className="h-5 w-5 shrink-0 rounded-full bg-rose-500/50 flex items-center justify-center font-serif text-white">!</div>
            )}
            <span>{status.message}</span>
          </div>
        )}

        <button
          type="button"
          disabled={loading}
          onClick={handleUpgrade}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 py-3.5 font-extrabold text-yellow-950 transition-all hover:from-amber-300 hover:to-yellow-500 hover:scale-[1.02] shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:shadow-[0_0_25px_rgba(245,158,11,0.6)] disabled:opacity-50 disabled:hover:scale-100 uppercase tracking-wide cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            `Update Now (${days} days)`
          )}
        </button>

      </div>
    </div>
  );
}