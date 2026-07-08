"use client";

import { LogIn, LogOut, Crown, NotebookPen, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface UserInfo {
  username: string;
  isPro: boolean;
}

const MainHeader = () => {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Read auth state from localStorage on mount, and keep it in sync
  // if it changes in another tab (login/logout elsewhere).
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
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-black/30 shadow-[0_4px_30px_rgba(0,0,0,0.1)] border-b border-white/10 backdrop-blur-lg">
      <div className="w-full px-6 py-3 flex items-center justify-between">

        {/* Logo */}
        <div
          onClick={() => router.push("/")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
              <span className="text-2xl group-hover:scale-110 transition-transform duration-300">⚽</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-yellow-400 to-cyan-400 animate-text-gradient drop-shadow-sm">
                FIFA World Cup 2026
              </span>
            </h1>
            <p className="text-[11px] font-semibold text-fuchsia-200/80 uppercase tracking-widest mt-0.5 group-hover:text-fuchsia-100 transition-colors ml-9">
              Image Retrieval
            </p>
          </div>
        </div>

        <div className="flex flex-row items-center gap-3">

          {/* Only render auth-dependent UI after we've checked localStorage,
              to avoid a flash of the wrong state on load */}
          {isLoaded && (
            <>
              <button
                onClick={() => router.push("/uppro")}
                className={`flex items-center gap-1.5 bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-950 border border-yellow-300 px-4 py-2 rounded-lg text-sm font-bold hover:scale-105 transition-all duration-300 shadow-[0_0_15px_rgba(250,204,21,0.4)] hover:shadow-[0_0_25px_rgba(250,204,21,0.6)] ${
                  !user || user.isPro ? "hidden" : ""
                }`}
              >
                <Crown
                  size={16}
                  className={user?.isPro ?"hidden":"text-yellow-800 fill-yellow-800"}
                />
                Update Pro !
              </button>

              {user ? (
                <div className="flex flex-row gap-3">
                  {/* Username / profile link */}
                  <button
                    onClick={() => router.push("/user")}
                    className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm border border-white/20 hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-300 cursor-pointer backdrop-blur-md"
                    title="Profile"
                  >
                    <UserRound size={16} className="text-fuchsia-300" />
                    <span className="max-w-[140px] truncate drop-shadow-sm">{user.username}</span>
                    {user.isPro && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-950 bg-yellow-400 px-1.5 py-0.5 rounded-full border border-yellow-200 shadow-[0_0_10px_rgba(250,204,21,0.5)]">
                        <Crown size={10} className="fill-yellow-900" />
                        PRO
                      </span>
                    )}
                  </button>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-white/10 text-fuchsia-200 border border-white/10 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-500/80 hover:text-white hover:border-red-400 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all duration-300 backdrop-blur-md"
                  >
                    <LogOut size={16} />
                    Log Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => router.push("/login")}
                  className="flex items-center gap-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white border border-fuchsia-400/50 px-5 py-2 rounded-lg text-sm font-semibold shadow-[0_0_15px_rgba(217,70,239,0.4)] hover:scale-105 hover:shadow-[0_0_25px_rgba(217,70,239,0.6)] transition-all duration-300"
                >
                  <LogIn size={16} />
                  Log In
                </button>
              )}
            </>
          )}
        </div>

      </div>
    </header>
  );
};

export default MainHeader;