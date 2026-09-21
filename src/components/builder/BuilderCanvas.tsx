"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Sky } from "@react-three/drei";
import { Subwoofer, TopSpeaker, TrussTower, DJTable, StageModel, ScreenPanelModel, SparkMachineModel } from "./EquipmentModels";
import { Suspense } from "react";

interface BuilderCanvasProps {
  setup: {
    subs: number;
    tops: number;
    towers: number;
    dj: boolean;
    stagePieces: number;
    screenPanels: number;
    sparkMachines: number;
  };
}

export default function BuilderCanvas({ setup }: BuilderCanvasProps) {
  
  // Elevation based on stage presence. 0.45m is the stage height.
  const baseElevation = setup.stagePieces >= 4 ? 0.45 : 0;

  const renderStage = () => {
    if (setup.stagePieces < 4) return null; // Minimum 4 pieces
    const stagePieces = [];
    // We want a roughly 2:1 width:depth ratio
    const cols = Math.max(2, Math.ceil(Math.sqrt(setup.stagePieces * 2)));
    const rows = Math.ceil(setup.stagePieces / cols);
    
    const startX = -(cols * 1.22) / 2 + 0.61;
    // Center stage somewhat around DJ (Z = -0.5)
    const startZ = -(rows * 1.22) / 2 + 0.61 - 0.5;

    let count = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (count >= setup.stagePieces) break;
        stagePieces.push(
          <StageModel key={`stage-${count}`} position={[startX + c * 1.22, 0, startZ + r * 1.22]} />
        );
        count++;
      }
    }
    return stagePieces;
  };

  const renderScreens = () => {
    if (setup.screenPanels < 1) return null;
    const screens = [];
    const panelWidth = 0.5;
    const startX = -(setup.screenPanels * panelWidth) / 2 + (panelWidth / 2);
    // Screens go behind the DJ
    const zPos = -1.5; 
    for (let i = 0; i < setup.screenPanels; i++) {
      screens.push(
        <ScreenPanelModel key={`screen-${i}`} position={[startX + i * panelWidth, baseElevation, zPos]} />
      );
    }
    return screens;
  };

  const renderSparks = () => {
    if (setup.sparkMachines < 1) return null;
    const sparks = [];
    // Place them at the front edge of the stage or setup
    // Calculate stage front Z if there's a stage
    let frontZ = 1.0;
    if (setup.stagePieces >= 4) {
      const cols = Math.max(2, Math.ceil(Math.sqrt(setup.stagePieces * 2)));
      const rows = Math.ceil(setup.stagePieces / cols);
      const startZ = -(rows * 1.22) / 2 + 0.61 - 0.5;
      frontZ = startZ + (rows - 1) * 1.22 + 0.5; // Near the front edge
    }

    const startX = -(setup.sparkMachines * 1.0) / 2 + 0.5;
    for (let i = 0; i < setup.sparkMachines; i++) {
      sparks.push(
        <SparkMachineModel key={`spark-${i}`} position={[startX + i * 1.0, baseElevation, frontZ]} />
      );
    }
    return sparks;
  };

  const renderSubs = () => {
    const subs = [];
    if (setup.subs === 1) subs.push(<Subwoofer key="sub-1" position={[0, baseElevation, 0]} />);
    if (setup.subs === 2) {
      subs.push(<Subwoofer key="sub-1" position={[-1.5, baseElevation, 0]} />);
      subs.push(<Subwoofer key="sub-2" position={[1.5, baseElevation, 0]} />);
    }
    if (setup.subs === 3) {
      subs.push(<Subwoofer key="sub-1" position={[-2, baseElevation, 0]} />);
      subs.push(<Subwoofer key="sub-2" position={[0, baseElevation, 0]} />);
      subs.push(<Subwoofer key="sub-3" position={[2, baseElevation, 0]} />);
    }
    if (setup.subs >= 4) {
      subs.push(<Subwoofer key="sub-1" position={[-2.5, baseElevation, 0]} />);
      subs.push(<Subwoofer key="sub-2" position={[-0.8, baseElevation, 0]} />);
      subs.push(<Subwoofer key="sub-3" position={[0.8, baseElevation, 0]} />);
      subs.push(<Subwoofer key="sub-4" position={[2.5, baseElevation, 0]} />);
    }
    return subs;
  };

  const renderTops = () => {
    const tops = [];
    if (setup.tops === 1) tops.push(<TopSpeaker key="top-1" position={[0, baseElevation, 0]} />);
    if (setup.tops === 2) {
      const yOffset = setup.subs > 0 ? 0.3 : 0; 
      tops.push(<TopSpeaker key="top-1" position={[-1.5, baseElevation + yOffset, 0]} />);
      tops.push(<TopSpeaker key="top-2" position={[1.5, baseElevation + yOffset, 0]} />);
    }
    if (setup.tops === 3) {
      tops.push(<TopSpeaker key="top-1" position={[-2, baseElevation, 0]} />);
      tops.push(<TopSpeaker key="top-2" position={[0, baseElevation, 0]} />);
      tops.push(<TopSpeaker key="top-3" position={[2, baseElevation, 0]} />);
    }
    if (setup.tops >= 4) {
      tops.push(<TopSpeaker key="top-1" position={[-2.5, baseElevation, 0]} />);
      tops.push(<TopSpeaker key="top-2" position={[-1.5, baseElevation, 0]} />);
      tops.push(<TopSpeaker key="top-3" position={[1.5, baseElevation, 0]} />);
      tops.push(<TopSpeaker key="top-4" position={[2.5, baseElevation, 0]} />);
    }
    return tops;
  };

  const renderTowers = () => {
    // Constraint: Never place towers behind DJ (Z < -0.5) or behind speakers (Z < 0)
    // Constraint: Towers sit on the ground, potentially framing the stage (Y = 0)
    // We'll place them at Z = 1.0 (in front) and wide enough X to not clip stage/speakers
    const towers = [];
    const zPos = 1.0; 
    let xSpread = 3.5;
    
    // If stage is very wide, push towers wider
    if (setup.stagePieces >= 4) {
      const cols = Math.max(2, Math.ceil(Math.sqrt(setup.stagePieces * 2)));
      const stageWidth = cols * 1.22;
      xSpread = Math.max(3.5, (stageWidth / 2) + 0.5);
    }

    if (setup.towers === 1) towers.push(<TrussTower key="tower-1" position={[0, 0, zPos]} />);
    if (setup.towers === 2) {
      towers.push(<TrussTower key="tower-1" position={[-xSpread, 0, zPos]} />);
      towers.push(<TrussTower key="tower-2" position={[xSpread, 0, zPos]} />);
    }
    if (setup.towers === 3) {
      towers.push(<TrussTower key="tower-1" position={[-xSpread, 0, zPos]} />);
      towers.push(<TrussTower key="tower-2" position={[0, 0, zPos + 1]} />);
      towers.push(<TrussTower key="tower-3" position={[xSpread, 0, zPos]} />);
    }
    if (setup.towers >= 4) {
      towers.push(<TrussTower key="tower-1" position={[-xSpread - 1, 0, zPos]} />);
      towers.push(<TrussTower key="tower-2" position={[-xSpread + 1, 0, zPos]} />);
      towers.push(<TrussTower key="tower-3" position={[xSpread - 1, 0, zPos]} />);
      towers.push(<TrussTower key="tower-4" position={[xSpread + 1, 0, zPos]} />);
    }
    return towers;
  };

  return (
    <div className="w-full h-full bg-slate-900 rounded-2xl overflow-hidden relative shadow-2xl border border-slate-800">
      <Canvas shadows camera={{ position: [0, 3.5, 8], fov: 50 }}>
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
            {/* The Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[30, 30]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
            </mesh>

            {/* Grid helper for scale reference */}
            <gridHelper args={[30, 30, 0x444444, 0x222222]} />

            {/* Dynamic Equipment */}
            {renderStage()}
            {renderScreens()}
            {renderSparks()}
            {renderSubs()}
            {renderTops()}
            {renderTowers()}
            {setup.dj && <DJTable position={[0, baseElevation, -0.5]} />}
            
            <ContactShadows position={[0, 0.01, 0]} opacity={0.4} scale={15} blur={2} far={4} />
          </group>

          <OrbitControls 
            minPolarAngle={0} 
            maxPolarAngle={Math.PI / 2 - 0.05} // Prevent going under the floor
            minDistance={3}
            maxDistance={20}
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
