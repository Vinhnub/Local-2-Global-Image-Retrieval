"use client";
import Image from "next/image";
import MainHeader from "@/src/components/mainHeader";
import Intro from "@/src/components/pageComponents/Intro";
import UploadFile from "@/src/components/pageComponents/UploadFile";
import { useState } from "react";
import RetrievalResult from "@/src/components/pageComponents/RetrievalResult";

export interface RetrievalResult {
    image_id: string;
    image_path: string;
    image_base64: string;
    score: number;
}

export default function Home() {
    const [retrievalImage, setRetrievalImage] = useState<string[]>([]);
    return (
      <div className="flex flex-col w-full min-h-screen items-center justify-center font-sans relative bg-[url('/bg_home.png')] bg-cover bg-center bg-no-repeat bg-fixed">        
        <div className="w-full left-0 top-0 sticky z-50"><MainHeader/></div>
        
        <div className="w-full flex-1 flex flex-col gap-5 items-center pt-35 pb-10 z-10"> 
          <UploadFile setRetrievalImage={setRetrievalImage}/>
          <RetrievalResult retrievalImage={retrievalImage}/>
        </div>
    </div>
  );
}