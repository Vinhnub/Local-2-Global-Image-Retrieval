"use client";

import { useState } from "react";
import { CreditCard, CheckCircle2, Loader2, Router } from "lucide-react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";

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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl ">
        
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <CreditCard className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-slate-900">Update PRO</h2>
          <p className="mt-1 text-sm text-slate-500">
            choose how many days you want to upgrade to pro.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <label className="text-sm font-medium text-slate-700">
            Pro for: <span className="font-bold text-amber-600">{days} days</span>
          </label>
          
          <input
            type="range"
            min="1"
            max="365"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-amber-500"
          />

          <div className="grid grid-cols-4 gap-2">
            {dayOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setDays(opt)}
                className={`rounded-lg py-2 text-xs font-semibold border transition-all ${
                  days === opt
                    ? "border-amber-500 bg-amber-50 text-amber-600"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {opt} ngày
              </button>
            ))}
          </div>
        </div>

        {status && (
          <div
            className={`mt-4 flex items-center gap-2 rounded-lg p-3 text-sm font-medium ${
              status.type === "success"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700 "
            }`}
          >
            {status.type === "success" && <CheckCircle2 className="h-4 w-4 shrink-0" />}
            <span>{status.message}</span>
          </div>
        )}

        <button
          type="button"
          disabled={loading}
          onClick={handleUpgrade}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 font-semibold text-white transition-all hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            `Update now (${days} days)`
          )}
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => router.push("/home")}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-black py-3 font-semibold text-white transition-all hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            `Back`
          )}
        </button>

      </div>
    </div>
  );
}