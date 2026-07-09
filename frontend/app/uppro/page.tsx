"use client";

import { useState } from "react";
import { Crown, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "motion/react";

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
        message: `Upgraded to Pro successfully for ${days} days!`,
      });
      
      localStorage.setItem("is_pro", res.data.is_pro)
      
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#d97706', '#111111']
      });

    } catch (error) {
      console.log(error)
      setStatus({
        type: "error",
        message: "Error updating status. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#F5F5F7] px-4 relative selection:bg-amber-100 selection:text-black overflow-hidden text-[#111111]">
      
      {/* Soft Light Mode Ambient Orbs */}
      <div className="absolute top-[10%] right-[20%] w-[40%] h-[40%] bg-amber-100 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[480px] rounded-[2rem] border border-black/5 bg-white p-8 sm:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.04)] relative z-10"
      >
        <button
          onClick={() => router.push("/home")}
          className="absolute top-6 left-6 p-2 text-black/40 hover:text-black hover:bg-black/5 rounded-full transition-all cursor-pointer"
          title="Back to home"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex flex-col items-center text-center mt-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-gradient-to-tr from-amber-100 to-yellow-200 shadow-sm border border-amber-200">
            <Crown className="h-8 w-8 text-yellow-700 fill-yellow-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-black tracking-tight">Upgrade PRO</h2>
          <p className="mt-2 text-sm text-black/50 font-medium">
            Unlock premium features and become a champion.
          </p>
        </div>

        <div className="mt-10 space-y-6">
          <label className="text-xs font-bold text-black/70 uppercase tracking-wider flex justify-between items-center">
            <span>Duration</span> 
            <span className="text-black bg-[#F5F5F7] px-3 py-1 rounded-full border border-black/5 font-mono">{days} Days</span>
          </label>
          
          <input
            type="range"
            min="1"
            max="365"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#F5F5F7] accent-black outline-none focus:ring-4 focus:ring-black/5 border border-black/5 shadow-inner"
          />

          <div className="grid grid-cols-4 gap-2 pt-2">
            {dayOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setDays(opt)}
                className={`rounded-xl py-3 text-xs font-bold transition-all border ${
                  days === opt
                    ? "border-black bg-black text-white shadow-md scale-105"
                    : "border-black/5 bg-[#F5F5F7] text-black/60 hover:bg-black/5 hover:text-black"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {status && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`mt-8 flex items-center gap-3 rounded-xl p-4 text-sm font-semibold border ${
                status.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm"
                  : "bg-rose-50 text-rose-700 border-rose-200 shadow-sm"
              }`}
            >
              {status.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 shrink-0" />
              ) : (
                <div className="h-5 w-5 shrink-0 rounded-full bg-rose-200 flex items-center justify-center font-serif text-rose-700">!</div>
              )}
              <span>{status.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          disabled={loading}
          onClick={handleUpgrade}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 py-4 font-bold text-yellow-950 transition-all hover:shadow-[0_8px_20px_rgba(251,191,36,0.3)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 uppercase tracking-wide cursor-pointer"
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

      </motion.div>
    </div>
  );
}