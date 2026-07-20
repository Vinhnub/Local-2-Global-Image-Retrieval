"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, Hash, Activity } from "lucide-react";

interface RetrievalResult {
  image_id: string | number;
  image_base64: string;
  score: number;
}

interface Props {
  activeImage: RetrievalResult | null;
  onClose: () => void;
}

export default function OverlayPanel({ activeImage, onClose }: Props) {
  return (
    <AnimatePresence>
      {activeImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center select-none bg-black/60 backdrop-blur-md"
          onClick={onClose}
        >
          {/* Top Bar */}
          <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-center z-10">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-white flex items-center gap-2">
                <Hash className="w-4 h-4 text-white/60" />
                {activeImage.image_id}
              </p>
              <div className="flex items-center gap-3 text-xs font-mono text-white/60 uppercase tracking-widest">
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  {(activeImage.score * 100).toFixed(1)}% Match
                </span>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
            >
              <X size={18} />
            </button>
          </div>

          {/* Main Image View */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-5xl h-[80vh] flex items-center justify-center p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full p-2 rounded-[2rem] bg-white/5 ring-1 ring-white/10 shadow-2xl">
              <div className="w-full h-full rounded-[1.5rem] bg-black/50 overflow-hidden flex items-center justify-center">
                <img
                  src={
                    activeImage.image_base64.startsWith("data:")
                      ? activeImage.image_base64
                      : `data:image/jpeg;base64,${activeImage.image_base64}`
                  }
                  alt={`Expanded View ${activeImage.image_id}`}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
