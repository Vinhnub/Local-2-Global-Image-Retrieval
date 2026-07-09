"use client";

import { LogIn, LogOut, Crown, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface UserInfo {
  username: string;
  isPro: boolean;
}

const MainHeader = () => {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadUser = () => {
      const token = localStorage.getItem("access_token");
      const username = localStorage.getItem("username");
      const isPro = localStorage.getItem("is_pro");

      if (token && username) {
        setUser({
          username,
          isPro: isPro === "true",
        });
      } else {
        setUser(null);
      }
      setIsLoaded(true);
    };

    loadUser();
    window.addEventListener("storage", loadUser);
    return () => window.removeEventListener("storage", loadUser);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/home";
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4 pointer-events-none">
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-auto flex items-center justify-between gap-6 sm:gap-12 px-6 py-3 rounded-full bg-white/80 backdrop-blur-2xl border border-black/5 shadow-[0_8px_32px_rgba(0,0,0,0.08)] w-full max-w-5xl"
      >
        {/* Logo */}
        <div
          onClick={() => router.push("/")}
          className="flex items-center gap-3 cursor-pointer group px-2"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-md border border-black/5">
            <span className="text-[10px] font-bold text-white drop-shadow-sm">WC26</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-black group-hover:text-black/70 transition-colors">
              FIFA World Cup
            </span>
            <span className="text-[10px] font-semibold text-black/40 uppercase tracking-widest">
              Image Retrieval
            </span>
          </div>
        </div>

        <div className="flex flex-row items-center gap-3">
          {isLoaded && (
            <AnimatePresence mode="popLayout">
              {/* Upgrade Pro Button - Made much more prominent and always visible for non-pro logged in users */}
              {user && !user.isPro && (
                <motion.button
                  key="pro"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => router.push("/uppro")}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 to-yellow-500 text-yellow-950 border border-yellow-400/50 hover:shadow-[0_4px_15px_rgba(251,191,36,0.4)] active:scale-[0.98] transition-all duration-300"
                >
                  <Crown size={14} className="text-yellow-900 fill-yellow-900" />
                  Upgrade PRO
                </motion.button>
              )}

              {user ? (
                <motion.div key="user" className="flex items-center gap-2 ml-2"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                >
                  <button
                    onClick={() => router.push("/user")}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-black/5 hover:bg-black/10 transition-colors border border-black/5"
                    title="Profile"
                  >
                    <UserRound size={14} className="text-black" />
                    <span className="text-xs font-semibold text-black max-w-[100px] truncate">{user.username}</span>
                    {user.isPro && (
                      <span className="ml-1 flex items-center gap-1 text-[9px] font-bold text-yellow-900 bg-yellow-400 px-1.5 py-0.5 rounded-full">
                        <Crown size={10} className="fill-yellow-900" /> PRO
                      </span>
                    )}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-red-50 hover:text-red-600 text-black/60 font-medium text-xs transition-colors border border-black/10 shadow-sm"
                    title="Log Out"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </motion.div>
              ) : (
                <motion.div key="auth" className="flex items-center gap-2 ml-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <button
                    onClick={() => router.push("/signup")}
                    className="hidden sm:flex items-center gap-2 px-5 py-2 rounded-full text-xs font-medium text-black hover:bg-black/5 transition-all duration-300"
                  >
                    Sign Up
                  </button>
                  <button
                    onClick={() => router.push("/login")}
                    className="flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold bg-black text-white shadow-md hover:bg-black/80 hover:shadow-lg active:scale-[0.98] transition-all duration-300"
                  >
                    <LogIn size={14} />
                    Log In
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </motion.header>
    </div>
  );
};

export default MainHeader;