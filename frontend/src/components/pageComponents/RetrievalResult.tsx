"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

// Assuming this is your RetrievalResult interface based on your render attributes
interface RetrievalResult {
  image_id: string | number;
  image_base64: string;
  score: number;
}

interface Props {
  retrievalImage: RetrievalResult[];
}

export default function RetrievalResult({ retrievalImage }: Props) {
  // Track the index of the currently active/maximized image (null means closed)
  const [currentIdx, setCurrentIdx] = useState<number | null>(null);

  // Navigate to the previous image sequentially
  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop from closing the modal backdrop
    if (currentIdx !== null) {
      setCurrentIdx((prev) => (prev !== null && prev > 0 ? prev - 1 : retrievalImage.length - 1));
    }
  };

  // Navigate to the next image sequentially
  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop from closing the modal backdrop
    if (currentIdx !== null) {
      setCurrentIdx((prev) => (prev !== null && prev < retrievalImage.length - 1 ? prev + 1 : 0));
    }
  };

  return (
    <>
      {/* --- Main Image Grid Gallery --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-0 p-8 text-white">
        {retrievalImage.map((img, index) => (
          <div
            key={img.image_id}
            onClick={() => setCurrentIdx(index)} 
            className="relative rounded-xl cursor-pointer group transition-transform duration-500 hover:-translate-y-2 h-[220px]"
          >
            {/* Animated Gradient Border (Chuyển màu) */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-fuchsia-600 via-cyan-400 to-yellow-500 animate-text-gradient opacity-80 group-hover:opacity-100 transition-opacity duration-300 group-hover:shadow-[0_0_25px_rgba(217,70,239,0.6)]"></div>
            
            {/* Inner Image Box */}
            <div className="absolute inset-[3px] bg-black rounded-[9px] overflow-hidden z-10">
              <img
                src={img.image_base64.startsWith('data:') ? img.image_base64 : `data:image/jpeg;base64,${img.image_base64}`}
                alt={`ID ${img.image_id}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
              />
            </div>
          </div>
        ))}
      </div>

      {/* --- Lightbox Light-slider Modal View --- */}
      {currentIdx !== null && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4 backdrop-blur-sm select-none"
          onClick={() => setCurrentIdx(null)} // Click background overlay to close
        >
          {/* Top Info Bar & Close Button */}
          <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-center bg-gradient-to-b from-fuchsia-900/80 via-black/40 to-transparent text-white">
            <div className="text-sm">
              <p className="font-semibold">Image ID: {retrievalImage[currentIdx].image_id}</p>
              <p className="text-xs opacity-80 mt-0.5">
                Score: {retrievalImage[currentIdx].score.toFixed(2)} | Image {currentIdx + 1} of {retrievalImage.length}
              </p>
            </div>
            <button
              onClick={() => setCurrentIdx(null)}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors cursor-pointer"
            >
              <X size={24} />
            </button>
          </div>

          {/* Left Arrow Controller */}
          <button
            onClick={handlePrev}
            className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all hover:scale-105 cursor-pointer z-10"
          >
            <ChevronLeft size={28} />
          </button>

          {/* Center Frame View */}
          <div 
            className="max-w-4xl max-h-[75vh] flex items-center justify-center p-2"
            onClick={(e) => e.stopPropagation()} // Stop wrapper clicks from shutting the slider modal
          >
            <img
              src={
                retrievalImage[currentIdx].image_base64.startsWith('data:') 
                  ? retrievalImage[currentIdx].image_base64 
                  : `data:image/jpeg;base64,${retrievalImage[currentIdx].image_base64}`
              }
              alt={`Expanded View ${retrievalImage[currentIdx].image_id}`}
              className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl animate-scale-up"
            />
          </div>

          <button
            onClick={handleNext}
            className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all hover:scale-105 cursor-pointer z-10"
          >
            <ChevronRight size={28} />
          </button>
        </div>
      )}
    </>
  );
}

            // <div className="p-3">
            //   <p className="text-xs font-semibold text-gray-500 truncate">ID: {img.image_id}</p>
            //   <p className="text-sm font-bold text-gray-800 mt-0.5">
            //     Score: {img.score.toFixed(2)}
            //   </p>
            // </div>