"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Hash, Activity } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface RetrievalResult {
  image_id: string | number;
  image_base64: string;
  score: number;
}

interface Props {
  retrievalImage: RetrievalResult[];
}

export default function RetrievalResult({ retrievalImage }: Props) {
  const [currentIdx, setCurrentIdx] = useState<number | null>(null);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIdx !== null) {
      setCurrentIdx((prev) => (prev !== null && prev > 0 ? prev - 1 : retrievalImage.length - 1));
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIdx !== null) {
      setCurrentIdx((prev) => (prev !== null && prev < retrievalImage.length - 1 ? prev + 1 : 0));
    }
  };

  return (
    <>
      <div className="w-full">
        <div className="mb-8 px-4 flex items-center justify-between border-b border-black/5 pb-4">
          <h3 className="text-xl font-medium tracking-tight text-black flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-black"></span>
            Retrieval Matches
          </h3>
          <span className="text-xs font-mono text-black/40 uppercase tracking-widest bg-black/5 px-3 py-1 rounded-full">
            {retrievalImage.length} Results
          </span>
        </div>

        {/* Asymmetrical Masonry Grid / Staggered Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
          <AnimatePresence mode="popLayout">
            {retrievalImage.map((img, index) => {
              const isLarge = index === 0 || index === 7;
              
              return (
                <motion.div
                  key={img.image_id}
                  layoutId={`card-${img.image_id}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ 
                    duration: 0.8, 
                    delay: index * 0.05, 
                    ease: [0.16, 1, 0.3, 1] 
                  }}
                  onClick={() => setCurrentIdx(index)} 
                  className={`group relative cursor-pointer p-1.5 rounded-[1.5rem] bg-black/5 ring-1 ring-black/5 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-black/10 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] active:scale-[0.98] ${isLarge ? "md:col-span-2 md:row-span-2 aspect-square md:aspect-auto" : "aspect-square"}`}
                >
                  <div className="w-full h-full rounded-[1.25rem] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden relative">
                    <img
                      src={img.image_base64.startsWith('data:') ? img.image_base64 : `data:image/jpeg;base64,${img.image_base64}`}
                      alt={`ID ${img.image_id}`}
                      className="w-full h-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 opacity-90 group-hover:opacity-100"
                    />
                    
                    {/* Hover Overlay Information */}
                    <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-4 backdrop-blur-[2px]">
                      <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                        <div className="flex items-center gap-1.5 text-xs font-mono text-black/80 mb-1">
                          <Hash className="w-3 h-3" />
                          {img.image_id}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-black/60">
                          <Activity className="w-3 h-3" />
                          Sim: {(img.score * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Lightbox / Immersive View (Light Mode) */}
      <AnimatePresence>
        {currentIdx !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 bg-white/90 backdrop-blur-2xl z-[100] flex flex-col items-center justify-center select-none"
            onClick={() => setCurrentIdx(null)}
          >
            {/* Top Bar */}
            <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-center z-10 border-b border-black/5">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-black flex items-center gap-2">
                  <Hash className="w-4 h-4 text-black/40" />
                  {retrievalImage[currentIdx].image_id}
                </p>
                <div className="flex items-center gap-3 text-xs font-mono text-black/40 uppercase tracking-widest">
                  <span className="flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    {(retrievalImage[currentIdx].score * 100).toFixed(1)}% Match
                  </span>
                  <span>•</span>
                  <span>{currentIdx + 1} / {retrievalImage.length}</span>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setCurrentIdx(null); }}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-black/5 hover:bg-black/10 text-black transition-colors border border-black/5"
              >
                <X size={18} />
              </button>
            </div>

            {/* Left Nav */}
            <button
              onClick={handlePrev}
              className="absolute left-6 w-12 h-12 rounded-full flex items-center justify-center bg-black/5 hover:bg-black/10 text-black transition-all active:scale-95 border border-black/5 z-10"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Main Image View */}
            <motion.div 
              key={currentIdx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-5xl h-[80vh] flex items-center justify-center p-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-full p-2 rounded-[2rem] bg-black/5 ring-1 ring-black/5 shadow-2xl">
                <div className="w-full h-full rounded-[1.5rem] bg-white overflow-hidden">
                  <img
                    src={
                      retrievalImage[currentIdx].image_base64.startsWith('data:') 
                        ? retrievalImage[currentIdx].image_base64 
                        : `data:image/jpeg;base64,${retrievalImage[currentIdx].image_base64}`
                    }
                    alt={`Expanded View ${retrievalImage[currentIdx].image_id}`}
                    className="w-full h-full object-contain bg-white"
                  />
                </div>
              </div>
            </motion.div>

            {/* Right Nav */}
            <button
              onClick={handleNext}
              className="absolute right-6 w-12 h-12 rounded-full flex items-center justify-center bg-black/5 hover:bg-black/10 text-black transition-all active:scale-95 border border-black/5 z-10"
            >
              <ChevronRight size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}