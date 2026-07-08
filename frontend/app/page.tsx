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
    <div className="min-h-screen bg-indigo-950 flex flex-col justify-center items-center text-white p-6 relative overflow-hidden selection:bg-fuchsia-500 selection:text-white">
      
      {/* Khu vực ảnh nền chạy lần lượt */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        {BACKGROUND_IMAGES.map((src, index) => {
          const isActive = index === currentImageIndex;
          return (
            <img
              key={src}
              src={src}
              alt={`World Cup 2026 Background ${index + 1}`}
              className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ease-in-out"
              style={{
                opacity: isActive ? 0.4 : 0,
                zIndex: isActive ? 10 : 0,
              }}
            />
          );
        })}
        {/* Gradient overlay phù hợp với theme WC26 Dark */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/90 via-violet-900/80 to-fuchsia-900/60 z-20"></div>
      </div>
      
      {/* Ambient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-[100px] pointer-events-none z-10 animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none z-10 animate-blob animation-delay-2000"></div>

      {/* Main content */}
      <div className="max-w-3xl text-center z-30 flex flex-col items-center gap-6 animate-fade-in-up bg-white/5 p-12 rounded-3xl backdrop-blur-md border border-white/10 shadow-[0_0_30px_rgba(217,70,239,0.15)] mt-10">

        {/* World Cup 2026 badge */}
        <span className="px-5 py-2 rounded-full bg-white/10 text-fuchsia-200 text-sm font-bold tracking-widest uppercase border border-fuchsia-400/30 shadow-[0_0_10px_rgba(217,70,239,0.3)] backdrop-blur-sm">
          ⚽ FIFA World Cup 2026
        </span>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mt-2 leading-tight drop-shadow-lg">
          Image Search <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-yellow-400 to-cyan-400 animate-text-gradient drop-shadow-md">
            Content-Based Retrieval
          </span>
        </h1>

        {/* Description */}
        <p className="text-fuchsia-100/80 text-lg md:text-xl max-w-xl font-medium leading-relaxed">
          A smart search system that helps you find moments, matches, and standout images from the{" "}
          <strong className="text-white">2026 World Cup</strong> using advanced image
          processing technology.
        </p>

        {/* Get Started button */}
        <div className="mt-8">
          <button
            onClick={handleGetStarted}
            disabled={isNavigating}
            className="group relative px-10 py-4 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(217,70,239,0.5)] hover:shadow-[0_0_30px_rgba(217,70,239,0.7)] transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 flex items-center gap-3 text-xl uppercase tracking-wide cursor-pointer"
          >
            {isNavigating ? (
              <>
                <div className="h-6 w-6 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                Connecting...
              </>
            ) : (
              <>
                Get Started
                <svg
                  className="w-6 h-6 group-hover:translate-x-1.5 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
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
      <div className="absolute bottom-6 text-fuchsia-200/40 text-sm tracking-widest uppercase font-semibold z-30">
        © 2026 WC Image Search Engine
      </div>
    </div>
  );
};

export default WelcomePage;