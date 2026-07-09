"use client";
import MainHeader from "@/src/components/mainHeader";
import UploadFile from "@/src/components/pageComponents/UploadFile";
import { useState } from "react";
import RetrievalResult from "@/src/components/pageComponents/RetrievalResult";
import { motion } from "motion/react";

export default function Home() {
    const [retrievalImage, setRetrievalImage] = useState<any[]>([]);
    return (
      <div className="flex flex-col w-full min-h-[100dvh] font-sans relative bg-[#F5F5F7] text-[#111111] selection:bg-black/10 selection:text-black">        
        
        <div className="w-full left-0 top-0 fixed z-50"><MainHeader/></div>
        
        <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col gap-16 items-center justify-center pt-40 pb-24 z-10 px-6">
          
          {/* Hero Section */}
          {retrievalImage.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="w-full text-center space-y-6 max-w-2xl mx-auto"
            >
              <h2 className="text-4xl md:text-6xl font-medium tracking-tighter text-[#111111] pb-2">
                Index the Archive.
              </h2>
              <p className="text-lg md:text-xl text-black/50 leading-relaxed max-w-[50ch] mx-auto">
                Submit a frame to retrieve visually similar instances across the entire 2026 World Cup repository.
              </p>
            </motion.div>
          )}

          {/* Upload Section */}
          <div className={`w-full transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${retrievalImage.length === 0 ? "max-w-2xl mx-auto" : "max-w-full"}`}>
            <UploadFile setRetrievalImage={setRetrievalImage as any}/>
            
            {retrievalImage.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="w-full mt-16"
              >
                <RetrievalResult retrievalImage={retrievalImage as any}/>
              </motion.div>
            )}
          </div>

        </div>
    </div>
  );
}