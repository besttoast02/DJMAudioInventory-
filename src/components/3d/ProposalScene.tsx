"use client";

import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment } from '@react-three/drei';
import * as THREE from 'three';

export interface SceneItem {
  id: string;
  name: string;
  category: string;
  position: [number, number, number];
  size: [number, number, number];
  color: string;
}

interface ProposalSceneProps {
  items: SceneItem[];
}

const ItemMesh = ({ item }: { item: SceneItem }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Use a cylinder for lighting fixtures to make them distinct from speakers (boxes)
  const isLighting = item.category.toLowerCase().includes('light');

  return (
    <mesh 
      ref={meshRef} 
      position={item.position} 
      castShadow
      receiveShadow
      onClick={(e) => {
        e.stopPropagation();
        // Future: Highlight item or show tooltip
      }}
    >
      {isLighting ? (
        <cylinderGeometry args={[item.size[0]/2, item.size[0]/2, item.size[1], 16]} />
      ) : (
        <boxGeometry args={item.size} />
      )}
      <meshStandardMaterial 
        color={item.color} 
        roughness={0.6}
        metalness={0.2}
      />
    </mesh>
  );
};

export function ProposalScene({ items }: ProposalSceneProps) {
  return (
    <div className="w-full h-full min-h-[400px] md:min-h-[500px] bg-gray-950 rounded-xl overflow-hidden shadow-2xl border border-white/10">
      <Canvas 
        shadows 
        camera={{ position: [0, 4, 8], fov: 50 }}
        style={{ background: '#0a0a0a' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[10, 10, 5]} 
          castShadow 
          intensity={1.5} 
          shadow-mapSize={[2048, 2048]} 
        />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#4488ff" />
        
        <Environment preset="city" />

        {/* Ground plane */}
        <mesh 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, -0.01, 0]} 
          receiveShadow
        >
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#111" />
        </mesh>

        {/* Stage / Riser Outline */}
        <mesh position={[0, 0.25, 0]} receiveShadow castShadow>
          <boxGeometry args={[6, 0.5, 4]} />
          <meshStandardMaterial color="#222" />
        </mesh>

        {/* Grid */}
        <Grid 
          infiniteGrid 
          fadeDistance={20} 
          sectionColor="#333" 
          cellColor="#222" 
          position={[0, 0, 0]} 
        />

        {/* Render all active items */}
        {items.map((item) => (
          <ItemMesh key={item.id} item={item} />
        ))}

        <OrbitControls makeDefault maxPolarAngle={Math.PI / 2 - 0.05} />
      </Canvas>
    </div>
  );
}
