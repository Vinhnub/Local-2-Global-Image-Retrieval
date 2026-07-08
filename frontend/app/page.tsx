"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const BACKGROUND_IMAGES = [
  "/bg_wc_2026.jpg",
  "/bg_wc_2026_2.jpg",
  "/bg_wc_2026_3.jpg" 
];

const WelcomePage = () => {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % BACKGROUND_IMAGES.length);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    setIsNavigating(true);
    router.push("/home");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center text-slate-900 p-6 relative overflow-hidden">
      
      {/* Khu vực ảnh nền chạy lần lượt */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        {BACKGROUND_IMAGES.map((src, index) => {
          const isActive = index === currentImageIndex;
          return (
            <img
              key={src}
              src={src}
              alt={`World Cup 2026 Background ${index + 1}`}
              className="absolute inset-0 w-full h-full object-cover object-center mix-blend-multiply transition-all duration-1000 ease-in-out"
              style={{
                opacity: isActive ? 0.6 : 0,
                zIndex: isActive ? 10 : 0,
              }}
            />
          );
        })}
        {/* Gradient overlay phù hợp với theme sáng */}
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-50 via-slate-50/70 to-transparent z-20"></div>
      </div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none z-0"></div>

      {/* Main content */}
      <div className="max-w-2xl text-center z-10 flex flex-col items-center gap-6 animate-fade-in">

        {/* World Cup 2026 badge */}
        <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold tracking-wide border border-blue-200/60 shadow-sm backdrop-blur-sm">
          ⚽ FIFA World Cup 2026 Image Retrieval
        </span>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 mt-2 leading-tight">
          Image Search <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Content-Based Image Retrieval
          </span>
        </h1>

        {/* Description */}
        <p className="text-slate-600 text-lg md:text-xl max-w-xl font-normal leading-relaxed">
          A smart search system that helps you find moments, matches, and standout images from the{" "}
          <span className="font-semibold text-slate-900">2026 World Cup</span> using advanced image
          processing technology.
        </p>

        {/* Get Started button */}
        <div className="mt-4 animate-pulse">
          <button
            onClick={handleGetStarted}
            disabled={isNavigating}
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 flex items-center gap-2 text-lg"
          >
            {isNavigating ? (
              <>
                <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                Connecting...
              </>
            ) : (
              <>
                Get Started
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-slate-400 text-xs tracking-wider z-10">
        © 2026 WC Image Search Engine. Next.js &amp; Tailwind.
      </div>
    </div>
  );
};

export default WelcomePage;