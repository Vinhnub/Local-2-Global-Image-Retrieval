"use client";

import { useState, Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import GalaxyScene from "./3d/GalaxyScene";
import OverlayPanel from "./3d/OverlayPanel";
import * as THREE from "three";

interface RetrievalResult {
  image_id: string | number;
  image_base64: string;
  score: number;
}

interface Props {
  retrievalImage: RetrievalResult[];
}

export default function RetrievalResult3D({ retrievalImage }: Props) {
  const [activeImage, setActiveImage] = useState<RetrievalResult | null>(null);
  const controlsRef = useRef<any>(null);

  const handleImageClick = (img: RetrievalResult, position: THREE.Vector3) => {
    setActiveImage(img);
  };

  const handleClose = () => {
    setActiveImage(null);
  };

  return (
    <div className="w-full h-[80vh] md:h-[85vh] rounded-[2rem] overflow-hidden relative shadow-2xl bg-[#020205] ring-1 ring-white/10">
      {/* 2D Overlay */}
      <OverlayPanel activeImage={activeImage} onClose={handleClose} />

      {/* HUD Info */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h3 className="text-white/90 font-medium text-2xl tracking-tighter flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-pulse"></span>
          Galaxy of Moments
        </h3>
        <p className="text-white/50 text-sm mt-1.5 font-mono tracking-widest uppercase">
          {retrievalImage.length} Results
        </p>
      </div>
      
      <div className="absolute bottom-6 left-6 z-10 pointer-events-none text-white/40 text-xs tracking-wider uppercase font-mono">
        Drag to rotate • Scroll to zoom • Click to focus
      </div>

      {/* 3D Canvas */}
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 0.1]} fov={60} />
        <OrbitControls 
          ref={controlsRef}
          target={[0, 0, 0]}
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          maxDistance={15}
          minDistance={0.1}
          dampingFactor={0.05}
        />
        <Suspense fallback={null}>
          <GalaxyScene images={retrievalImage} onImageClick={handleImageClick} />
        </Suspense>
      </Canvas>
    </div>
  );
}
