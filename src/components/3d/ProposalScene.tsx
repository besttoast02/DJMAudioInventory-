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

const SpeakerModel = ({ color }: { color: string }) => {
  return (
    <group>
      {/* Main Cabinet */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[1, 1.8, 1]} />
        <meshStandardMaterial color={color} roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Woofer (Bottom) */}
      <mesh position={[0, -0.4, 0.51]}>
        <cylinderGeometry args={[0.35, 0.35, 0.05, 32]} />
        <meshStandardMaterial color="#111" roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.4, 0.53]}>
        <cylinderGeometry args={[0.1, 0.1, 0.02, 32]} />
        <meshStandardMaterial color="#222" roughness={0.5} />
      </mesh>
      {/* Tweeter (Top) */}
      <mesh position={[0, 0.4, 0.51]}>
        <cylinderGeometry args={[0.15, 0.15, 0.05, 32]} />
        <meshStandardMaterial color="#111" roughness={0.7} />
      </mesh>
      {/* Grill texture placeholder or details */}
      <mesh position={[0, 0, 0.505]}>
        <boxGeometry args={[0.9, 1.7, 0.01]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} transparent opacity={0.6} />
      </mesh>
    </group>
  );
};

const LightModel = ({ color }: { color: string }) => {
  return (
    <group>
      {/* Base */}
      <mesh castShadow receiveShadow position={[0, -0.4, 0]}>
        <boxGeometry args={[0.6, 0.2, 0.6]} />
        <meshStandardMaterial color="#111" roughness={0.8} />
      </mesh>
      {/* Yoke (Arms) */}
      <mesh castShadow position={[-0.25, 0, 0]}>
        <boxGeometry args={[0.1, 0.8, 0.2]} />
        <meshStandardMaterial color="#222" roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0.25, 0, 0]}>
        <boxGeometry args={[0.1, 0.8, 0.2]} />
        <meshStandardMaterial color="#222" roughness={0.7} />
      </mesh>
      {/* Head */}
      <mesh castShadow position={[0, 0.2, 0]} rotation={[Math.PI / 4, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.4, 32]} />
        <meshStandardMaterial color="#111" roughness={0.6} />
      </mesh>
      {/* Lens */}
      <mesh castShadow position={[0, 0.2, 0.21]} rotation={[Math.PI / 4, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.42, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} roughness={0.2} metalness={0.8} />
      </mesh>
    </group>
  );
};

const ItemMesh = ({ item }: { item: SceneItem }) => {
  const groupRef = useRef<THREE.Group>(null);
  const isLighting = item.category.toLowerCase().includes('light');

  // Calculate scaling based on item size compared to our base model sizes (which are roughly 1x1.8x1 for speakers)
  const scaleX = item.size[0] / (isLighting ? 0.6 : 1);
  const scaleY = item.size[1] / (isLighting ? 1.0 : 1.8);
  const scaleZ = item.size[2] / (isLighting ? 0.6 : 1);

  return (
    <group 
      ref={groupRef} 
      position={item.position} 
      scale={[scaleX, scaleY, scaleZ]}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {isLighting ? <LightModel color={item.color} /> : <SpeakerModel color={item.color} />}
    </group>
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
