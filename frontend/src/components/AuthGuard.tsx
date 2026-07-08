"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    const publicRoutes = ["/home", "/", "/login", "/signup"];

    const isPublicRoute = publicRoutes.includes(pathname);

    if (!token && !isPublicRoute) {
      setIsLoading(true);
      router.replace("/home"); 
    } else if (token && (pathname === "/login" || pathname === "/signup")) {
      router.replace("/home");
    } else {
      setIsLoading(false);
    }
  }, [pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600 font-medium">
        <div className="h-5 w-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mr-2"></div>
        Loading...
      </div>
    ); 
  }

  return <>{children}</>;
}