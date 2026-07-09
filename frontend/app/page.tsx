"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

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
    }, 4000); 

    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    setIsNavigating(true);
    router.push("/home");
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col md:flex-row bg-[#F5F5F7] text-black overflow-hidden">
      
      {/* Left side: Editorial Typography */}
      <div className="w-full md:w-1/2 min-h-[50dvh] md:min-h-screen flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 z-20">
        <motion.div 
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-xl"
        >
          {/* Eyebrow badge */}
          <div className="mb-8 inline-flex items-center rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-bold border border-black/10 text-black/60 bg-white shadow-sm">
            FIFA World Cup 2026
          </div>

          <h1 className="text-5xl lg:text-7xl font-sans tracking-tighter leading-[1.1] mb-6 font-medium text-black">
            Visual Search <br />
            <span className="text-black/30">Architecture.</span>
          </h1>

          <p className="text-lg text-black/60 max-w-[45ch] leading-relaxed mb-12">
            A specialized retrieval engine. Upload any match frame to index, identify, and recall iconic moments from the global stage instantly.
          </p>

          <button
            onClick={handleGetStarted}
            disabled={isNavigating}
            className="group relative flex items-center gap-4 bg-black text-white px-8 py-4 rounded-full font-medium text-sm tracking-wide transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)] active:scale-[0.98] disabled:opacity-50"
          >
            {isNavigating ? "Connecting..." : "Initialize Engine"}
            
            {!isNavigating && (
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105 group-hover:bg-white/20">
                <ArrowUpRight className="w-4 h-4 text-white" />
              </div>
            )}
          </button>
        </motion.div>
      </div>

      {/* Right side: Cinematic Image Viewer */}
      <div className="w-full md:w-1/2 min-h-[50dvh] md:min-h-screen relative overflow-hidden bg-white">
        {/* Images */}
        <div className="absolute inset-0 z-0 bg-white">
          {BACKGROUND_IMAGES.map((src, index) => {
            const isActive = index === currentImageIndex;
            return (
              <img
                key={src}
                src={src}
                alt={`Archive ${index + 1}`}
                className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-[3000ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  opacity: isActive ? 0.8 : 0,
                  transform: isActive ? "scale(1.02)" : "scale(1.1)",
                  filter: isActive ? "blur(0px) grayscale(20%)" : "blur(10px) grayscale(100%)",
                  zIndex: isActive ? 5 : 0,
                }}
              />
            );
          })}
        </div>

        {/* Gradient fade to blend with left side on mobile */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#F5F5F7] to-transparent z-10 hidden md:block"></div>
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#F5F5F7] to-transparent z-10 block md:hidden"></div>
      </div>
    </div>
  );
};

export default WelcomePage;