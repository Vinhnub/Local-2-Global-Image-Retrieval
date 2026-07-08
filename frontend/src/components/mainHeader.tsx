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
    <header className="sticky top-0 z-50 w-full bg-white/90 border-b border-gray-100 backdrop-blur-sm">
      <div className="w-full p-8 flex items-center justify-between">

        {/* Logo */}
        <div
          onClick={() => router.push("/")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Search
              <span className="text-blue-600"> Engine</span>
            </h1>
            <p className="text-sm text-gray-500">Image Retrieval</p>
          </div>
        </div>

        <div className="flex flex-row items-center gap-2">

          {/* Only render auth-dependent UI after we've checked localStorage,
              to avoid a flash of the wrong state on load */}
          {isLoaded && (
            <>
              <button
                onClick={() => router.push("/uppro")}
                className={`flex items-center gap-2 bg-transparent text-black px-3 py-3 rounded-xl hover:scale-105 transition-all duration-300 ${
                  !user || user.isPro ? "hidden" : ""
                }`}
              >
                <Crown
                  size={18}
                  className={user?.isPro ?"hidden":"text-yellow-500 fill-yellow-500"}
                />
                Update Pro !
              </button>

              {user ? (
                <div className="flex flex-row gap-3">
                  {/* Username / profile link */}
                  <button
                    onClick={() => router.push("/user")}
                    className="flex items-center gap-2 bg-transparent text-black px-3 py-3 rounded-xl font-semibold shadow-lg hover:bg-gray-100 hover:shadow-2xl transition-all duration-300 cursor-pointer"
                    title="Profile"
                  >
                    <UserRound  size={18} />
                    <span className="max-w-[140px] truncate">{user.username}</span>
                    {user.isPro && (
                      <span className="flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">
                        <Crown size={12} className="fill-yellow-600" />
                        PRO
                      </span>
                    )}
                  </button>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300"
                  >
                    <LogOut size={18} />
                    Log Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => router.push("/login")}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300"
                >
                  <LogIn size={18} />
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