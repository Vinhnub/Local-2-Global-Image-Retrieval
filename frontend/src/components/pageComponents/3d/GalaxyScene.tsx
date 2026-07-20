"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import ImageCard3D from "./ImageCard3D";

interface RetrievalResult {
  image_id: string | number;
  image_base64: string;
  score: number;
}

export default function GalaxyScene({
  images,
  onImageClick,
}: {
  images: RetrievalResult[];
  onImageClick: (img: any, position: THREE.Vector3) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Phân bổ thẻ ảnh lộn xộn nhưng ĐẢM BẢO không bị che khuất (Safe Staggered Jitter)
  const cardPositions = useMemo(() => {
    return images.map((img, i) => {
      // Phân bổ thành 3 tầng để đủ không gian dọc
      const rows = 3;
      const columns = Math.ceil(images.length / rows);
      
      const col = i % columns;
      const row = Math.floor(i / columns);
      
      // Góc cơ bản: tầng chẵn/lẻ được đặt so le (staggered) với nhau
      const staggerOffset = (row % 2) * (Math.PI / columns); 
      const baseAngle = (col / columns) * Math.PI * 2 + staggerOffset;
      
      // Thêm "nhiễu" (jitter) vào góc độ một chút xíu để trông tự nhiên, lộn xộn
      const jitterAngle = (Math.random() - 0.5) * 0.3; 
      const angle = baseAngle + jitterAngle;
      
      // Bán kính thay đổi nhẹ tạo chiều sâu (gần xa khác nhau)
      const radius = 25 + (Math.random() - 0.5) * 6; 

      const x = radius * Math.sin(angle);
      
      // Chiều cao các tầng cách nhau 6 đơn vị (chiều cao ảnh là 4.5) => Không đụng nhau
      const baseY = (row - 1) * -6; 
      // Thêm nhiễu nhẹ cho chiều cao
      const y = baseY + (Math.random() - 0.5) * 2; 
      
      const z = radius * Math.cos(angle);

      return [x, y, z] as [number, number, number];
    });
  }, [images]);

  // Làm cho toàn bộ chòm ảnh xoay quanh góc nhìn
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
      // Hiệu ứng bồng bềnh nhẹ thêm
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.5;
    }
  });

  return (
    <>
      <color attach="background" args={["#020205"]} />
      
      {/* Các vì sao trong không gian sâu */}
      <Stars radius={50} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} />

      <group ref={groupRef}>
        {images.map((img, i) => (
          <ImageCard3D
            key={img.image_id}
            img={img}
            index={i}
            position={cardPositions[i]}
            onClick={onImageClick}
          />
        ))}
      </group>
    </>
  );
}
