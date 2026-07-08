"use client";
import Image from "next/image";
import MainHeader from "@/src/components/mainHeader";
import Intro from "@/src/components/pageComponents/Intro";
import UploadFile from "@/src/components/pageComponents/UploadFile";
import { useState } from "react";
import RetrievalResult from "@/src/components/pageComponents/RetrievalResult";

export default function Home() {
    const [retrievalImage, setRetrievalImage] = useState<any[]>([]);
    return (
      <div className="flex flex-col w-full min-h-screen font-sans relative bg-gradient-to-br from-indigo-950 via-violet-900 to-fuchsia-900 text-white selection:bg-fuchsia-500 selection:text-white">        
        
        {/* Background Ambient Glowing Orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-fuchsia-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-cyan-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-yellow-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000"></div>
        
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/10 via-transparent to-transparent pointer-events-none"></div>
        
        <div className="w-full left-0 top-0 fixed z-50"><MainHeader/></div>
        
        <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col lg:flex-row gap-10 items-center justify-center pt-32 pb-10 z-10 px-6">
          
          {/* Hero Section (Hidden when there are results) */}
          {retrievalImage.length === 0 && (
            <div className="flex-1 text-center lg:text-left space-y-6 max-w-xl animate-fade-in-up">
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-yellow-400 to-cyan-400 drop-shadow-md pb-2">
                Discover the Magic of WC26
              </h2>
              <p className="text-lg md:text-xl text-fuchsia-100/90 leading-relaxed font-medium">
                Upload an image to find visually similar players, iconic matches, and unforgettable moments from the world's biggest football stage.
              </p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start pt-4">
                <span className="px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-sm font-bold text-fuchsia-200 shadow-md">⚽ Golden Boot</span>
                <span className="px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-sm font-bold text-yellow-300 shadow-md">🏆 World Cup Trophy</span>
                <span className="px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-sm font-bold text-cyan-300 shadow-md">🥅 Iconic Stadiums</span>
              </div>
            </div>
          )}

          {/* Upload Section */}
          <div className={`w-full ${retrievalImage.length === 0 ? "lg:w-1/2 flex justify-center lg:justify-end" : "flex flex-col items-center"}`}>
            <UploadFile setRetrievalImage={setRetrievalImage as any}/>
            {retrievalImage.length > 0 && (
              <div className="w-full mt-10">
                <RetrievalResult retrievalImage={retrievalImage as any}/>
              </div>
            )}
          </div>

        </div>

        {/* Continuous Image Marquee (visible when no results) */}
        {retrievalImage.length === 0 && (
          <div className="absolute bottom-0 w-full overflow-hidden whitespace-nowrap bg-black/20 backdrop-blur-md border-t border-white/10 py-4 flex items-center z-0">
            <div className="animate-marquee inline-block">
              {/* Duplicate images for infinite scroll effect */}
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                 <span key={i} className="inline-block mx-8 text-fuchsia-300/50 text-2xl font-black uppercase tracking-widest">⚽ FIFA WORLD CUP 2026 🏆</span>
              ))}
            </div>
            <div className="animate-marquee inline-block" aria-hidden="true">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                 <span key={`dup-${i}`} className="inline-block mx-8 text-cyan-300/50 text-2xl font-black uppercase tracking-widest">⚽ FIFA WORLD CUP 2026 🏆</span>
              ))}
            </div>
          </div>
        )}

    </div>
  );
}