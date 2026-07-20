"use client";

import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";

interface ImageCardProps {
  img: any;
  position: [number, number, number];
  index: number;
  onClick: (img: any, position: THREE.Vector3) => void;
}

export default function ImageCard3D({ img, position, index, onClick }: ImageCardProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  
  const base64Str = img.image_base64.startsWith("data:")
    ? img.image_base64
    : `data:image/jpeg;base64,${img.image_base64}`;

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(base64Str, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      setTexture(tex);
    });
  }, [base64Str]);

  const aspect = texture?.image ? (texture.image as HTMLImageElement).width / (texture.image as HTMLImageElement).height : 1.5;
  const height = 4.5;
  const width = height * aspect;

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Gentle floating animation
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.2;
    
    // Subtle rotation towards the center (0,0,0) initially
    meshRef.current.lookAt(0, 0, 0);
    
    // Smooth hover scale and brightness
    const targetScale = hovered ? 1.05 : 1;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        setHover(false);
        document.body.style.cursor = "auto";
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (meshRef.current) {
           onClick(img, meshRef.current.position);
        }
      }}
    >
      <planeGeometry args={[width, height]} />
      {texture ? (
        <meshBasicMaterial 
          map={texture} 
          color={hovered ? "#ffffff" : "#aaaaaa"} 
          side={THREE.DoubleSide}
          transparent={true}
        />
      ) : (
        <meshBasicMaterial color="#222222" wireframe />
      )}
    </mesh>
  );
}
