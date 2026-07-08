"use client";

import { useState } from "react";
import { Info, X, Mail, Globe, Code2 } from "lucide-react";

export default function AboutUs() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-[#1e1b4b]/80 backdrop-blur-md border border-fuchsia-500/50 text-white shadow-[0_0_15px_rgba(217,70,239,0.3)] hover:shadow-[0_0_25px_rgba(34,211,238,0.5)] hover:scale-110 hover:border-cyan-400/80 transition-all duration-300 group cursor-pointer"
        aria-label="About Us"
      >
        <Info size={24} className="group-hover:text-cyan-300 transition-colors" />
      </button>

      {/* About Us Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-[#1e1b4b]/95 border border-fuchsia-500/40 rounded-3xl p-8 max-w-md w-full shadow-[0_0_40px_rgba(217,70,239,0.2)] backdrop-blur-xl relative flex flex-col items-center text-center animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-fuchsia-300 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Avatar / Icon */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-fuchsia-600 to-cyan-500 p-1 shadow-[0_0_20px_rgba(34,211,238,0.4)] mb-6">
              <div className="w-full h-full bg-[#1e1b4b] rounded-full flex items-center justify-center">
                <Code2 size={40} className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 via-cyan-300 to-yellow-300 drop-shadow-md mb-2">
              About The Author
            </h2>
            <p className="text-fuchsia-100 font-medium mb-6">
              Vinh - Full Stack Developer
            </p>

            {/* Description */}
            <p className="text-sm text-fuchsia-200/80 leading-relaxed mb-8 px-4">
              Welcome to the FIFA World Cup 2026 Image Retrieval Engine! This project was built to showcase the power of deep learning in visual search and responsive modern web design.
            </p>

            {/* Social Links */}
            <div className="flex gap-4 mb-2">
              <a href="#" className="p-3 bg-white/5 border border-white/10 rounded-xl text-fuchsia-300 hover:text-white hover:bg-fuchsia-600/50 hover:border-fuchsia-400 transition-all shadow-md group flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
              </a>
              <a href="#" className="p-3 bg-white/5 border border-white/10 rounded-xl text-cyan-300 hover:text-white hover:bg-cyan-600/50 hover:border-cyan-400 transition-all shadow-md group flex items-center justify-center">
                <Globe size={20} className="group-hover:scale-110 transition-transform" />
              </a>
              <a href="#" className="p-3 bg-white/5 border border-white/10 rounded-xl text-yellow-300 hover:text-white hover:bg-yellow-600/50 hover:border-yellow-400 transition-all shadow-md group flex items-center justify-center">
                <Mail size={20} className="group-hover:scale-110 transition-transform" />
              </a>
            </div>
            
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mt-6 mb-4"></div>
            <p className="text-[10px] text-white/40 uppercase tracking-widest">© 2026 WC26 Image Retrieval</p>
          </div>
        </div>
      )}
    </>
  );
}
