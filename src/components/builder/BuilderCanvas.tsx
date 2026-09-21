"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Sky } from "@react-three/drei";
import { Subwoofer, TopSpeaker, TrussTower, DJTable } from "./EquipmentModels";
import { Suspense } from "react";

interface BuilderCanvasProps {
  setup: {
    subs: number;
    tops: number;
    towers: number;
    dj: boolean;
  };
}

export default function BuilderCanvas({ setup }: BuilderCanvasProps) {
  // Logic to arrange equipment based on quantity
  // E.g. if 2 subs, put one on left (-2), one on right (+2)
  const renderSubs = () => {
    const subs = [];
    if (setup.subs === 1) subs.push(<Subwoofer key="sub-1" position={[0, 0, 0]} />);
    if (setup.subs === 2) {
      subs.push(<Subwoofer key="sub-1" position={[-1.5, 0, 0]} />);
      subs.push(<Subwoofer key="sub-2" position={[1.5, 0, 0]} />);
    }
    if (setup.subs === 3) {
      subs.push(<Subwoofer key="sub-1" position={[-2, 0, 0]} />);
      subs.push(<Subwoofer key="sub-2" position={[0, 0, 0]} />);
      subs.push(<Subwoofer key="sub-3" position={[2, 0, 0]} />);
    }
    if (setup.subs >= 4) {
      subs.push(<Subwoofer key="sub-1" position={[-2.5, 0, 0]} />);
      subs.push(<Subwoofer key="sub-2" position={[-0.8, 0, 0]} />);
      subs.push(<Subwoofer key="sub-3" position={[0.8, 0, 0]} />);
      subs.push(<Subwoofer key="sub-4" position={[2.5, 0, 0]} />);
    }
    return subs;
  };

  const renderTops = () => {
    const tops = [];
    if (setup.tops === 1) tops.push(<TopSpeaker key="top-1" position={[0, 0, 0]} />);
    if (setup.tops === 2) {
      // If there are subs, place them on/near the subs, else just on stands
      const yOffset = setup.subs > 0 ? 0.3 : 0; // Simplification
      tops.push(<TopSpeaker key="top-1" position={[-1.5, yOffset, 0]} />);
      tops.push(<TopSpeaker key="top-2" position={[1.5, yOffset, 0]} />);
    }
    if (setup.tops === 3) {
      tops.push(<TopSpeaker key="top-1" position={[-2, 0, 0]} />);
      tops.push(<TopSpeaker key="top-2" position={[0, 0, 0]} />);
      tops.push(<TopSpeaker key="top-3" position={[2, 0, 0]} />);
    }
    if (setup.tops >= 4) {
      tops.push(<TopSpeaker key="top-1" position={[-2.5, 0, 0]} />);
      tops.push(<TopSpeaker key="top-2" position={[-1.5, 0, 0]} />);
      tops.push(<TopSpeaker key="top-3" position={[1.5, 0, 0]} />);
      tops.push(<TopSpeaker key="top-4" position={[2.5, 0, 0]} />);
    }
    return tops;
  };

  const renderTowers = () => {
    const towers = [];
    if (setup.towers === 1) towers.push(<TrussTower key="tower-1" position={[0, 0, -1.5]} />);
    if (setup.towers === 2) {
      towers.push(<TrussTower key="tower-1" position={[-3, 0, -1]} />);
      towers.push(<TrussTower key="tower-2" position={[3, 0, -1]} />);
    }
    if (setup.towers === 3) {
      towers.push(<TrussTower key="tower-1" position={[-3, 0, -1]} />);
      towers.push(<TrussTower key="tower-2" position={[0, 0, -2]} />);
      towers.push(<TrussTower key="tower-3" position={[3, 0, -1]} />);
    }
    if (setup.towers >= 4) {
      towers.push(<TrussTower key="tower-1" position={[-3.5, 0, -1]} />);
      towers.push(<TrussTower key="tower-2" position={[-1.5, 0, -2]} />);
      towers.push(<TrussTower key="tower-3" position={[1.5, 0, -2]} />);
      towers.push(<TrussTower key="tower-4" position={[3.5, 0, -1]} />);
    }
    return towers;
  };

  return (
    <div className="w-full h-full bg-slate-900 rounded-2xl overflow-hidden relative shadow-2xl border border-slate-800">
      <Canvas shadows camera={{ position: [0, 2.5, 6], fov: 50 }}>
        <Suspense fallback={null}>
          <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0} azimuth={0.25} />
          <ambientLight intensity={0.4} />
          <directionalLight 
            castShadow 
            position={[5, 10, 5]} 
            intensity={1.5} 
            shadow-mapSize={[1024, 1024]}
          />
          <Environment preset="city" />
          
          <group position={[0, -0.5, 0]}>
            {/* The Stage Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[20, 20]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
            </mesh>

            {/* Grid helper for scale reference */}
            <gridHelper args={[20, 20, 0x444444, 0x222222]} />

            {/* Dynamic Equipment */}
            {renderSubs()}
            {renderTops()}
            {renderTowers()}
            {setup.dj && <DJTable position={[0, 0, -0.5]} />}
            
            <ContactShadows position={[0, 0.01, 0]} opacity={0.4} scale={10} blur={2} far={4} />
          </group>

          <OrbitControls 
            minPolarAngle={0} 
            maxPolarAngle={Math.PI / 2 - 0.05} // Prevent going under the floor
            minDistance={3}
            maxDistance={12}
            target={[0, 1, 0]}
          />
        </Suspense>
      </Canvas>
      <div className="absolute top-4 left-4 bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm pointer-events-none">
        Interactive 3D Stage Preview
      </div>
    </div>
  );
}
