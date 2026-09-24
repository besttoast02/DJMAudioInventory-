"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Sky } from "@react-three/drei";
import { 
  Subwoofer, 
  TopSpeaker, 
  TrussTower, 
  DJTable, 
  StageModel, 
  StageStepsModel,
  OverheadStageTrussArch,
  ScreenPanelModel, 
  SparkMachineModel, 
  RentalMixerTable, 
  ScreenTrussArch 
} from "./EquipmentModels";
import { STAGE_CONFIGS, SetupState } from "./BuilderControls";
import { Suspense, useRef } from "react";

interface BuilderCanvasProps {
  setup: SetupState;
}

export default function BuilderCanvas({ setup }: BuilderCanvasProps) {
  const controlsRef = useRef<any>(null);

  const handleZoomIn = () => {
    if (controlsRef.current) {
      const camera = controlsRef.current.object;
      const target = controlsRef.current.target;
      camera.position.lerp(target, 0.2); // move 20% closer
      controlsRef.current.update();
    }
  };

  const handleZoomOut = () => {
    if (controlsRef.current) {
      const camera = controlsRef.current.object;
      const target = controlsRef.current.target;
      camera.position.sub(target).multiplyScalar(1.25).add(target); // move 25% further
      controlsRef.current.update();
    }
  };
  
  // Elevation based on stage presence. 0.45m is standard stage height.
  const baseElevation = setup.stagePieces >= 4 ? 0.45 : 0;

  // Retrieve rectangular/square stage dimensions strictly
  const stageConfig = STAGE_CONFIGS[setup.stagePieces] || { cols: 2, rows: 2, label: "None" };
  const cols = stageConfig.cols;
  const rows = stageConfig.rows;
  
  // 1 platform deck = 4 ft = 1.22m
  const stageWidth = cols > 0 ? cols * 1.22 : 3.0;
  const stageDepth = rows > 0 ? rows * 1.22 : 2.44;

  const startX = -(cols * 1.22) / 2 + 0.61;
  // Center stage around DJ (Z = -0.5)
  const startZ = -(rows * 1.22) / 2 + 0.61 - 0.5;

  // Front edge Z of the stage platform
  const stageFrontZ = setup.stagePieces >= 4
    ? startZ + (rows - 1) * 1.22 + 0.61 + 0.2
    : 0.5;

  const renderStage = () => {
    if (setup.stagePieces < 4 || cols <= 0 || rows <= 0) return null;
    const stagePieces = [];
    
    // Strict grid generation: every row has exactly 'cols' pieces.
    // Guaranteed perfect squares or rectangles, never L-shapes!
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        stagePieces.push(
          <StageModel 
            key={`stage-${r}-${c}`} 
            position={[startX + c * 1.22, 0, startZ + r * 1.22]} 
          />
        );
      }
    }
    return stagePieces;
  };

  const renderStageSteps = () => {
    if (setup.stagePieces < 4 || !setup.stageSteps || setup.stageSteps <= 0) return null;
    const steps = [];

    // Right-side stage steps leading up to front-right of the deck
    if (setup.stageSteps >= 1) {
      steps.push(
        <StageStepsModel 
          key="step-right" 
          position={[Math.min((stageWidth / 2) - 0.55, 4.4), 0, stageFrontZ + 0.2]} 
        />
      );
    }

    // Left-side stage steps leading up to front-left of the deck
    if (setup.stageSteps >= 2) {
      steps.push(
        <StageStepsModel 
          key="step-left" 
          position={[Math.max(-(stageWidth / 2) + 0.55, -4.4), 0, stageFrontZ + 0.2]} 
        />
      );
    }

    return steps;
  };

  const renderScreens = () => {
    if (setup.screenPanels < 1) return null;
    const screens = [];
    const panelWidth = 0.5;
    const totalWidth = setup.screenPanels * panelWidth;
    const startScreenX = -totalWidth / 2 + (panelWidth / 2);
    // Screens go behind the DJ
    const zPos = -1.5; 
    for (let i = 0; i < setup.screenPanels; i++) {
      screens.push(
        <ScreenPanelModel key={`screen-${i}`} position={[startScreenX + i * panelWidth, baseElevation, zPos]} />
      );
    }
    
    // Wrap them in a truss arch
    return (
      <group key="screens-group">
        {screens}
        <ScreenTrussArch width={totalWidth} position={[0, baseElevation, zPos]} />
      </group>
    );
  };

  const renderSparks = () => {
    if (setup.sparkMachines < 1) return null;
    const sparks = [];
    const startSparkX = -(setup.sparkMachines * 1.0) / 2 + 0.5;
    for (let i = 0; i < setup.sparkMachines; i++) {
      sparks.push(
        <SparkMachineModel 
          key={`spark-${i}`} 
          position={[startSparkX + i * 1.0, baseElevation, stageFrontZ - 0.4]} 
        />
      );
    }
    return sparks;
  };

  const renderSubs = () => {
    const subs = [];
    // All subs sit on the ground (Y=0) in front of the stage
    const subZ = stageFrontZ + 0.3; 
    
    if (setup.subs === 1) subs.push(<Subwoofer key="sub-1" position={[0, 0, subZ]} />);
    if (setup.subs === 2) {
      subs.push(<Subwoofer key="sub-1" position={[-0.8, 0, subZ]} />);
      subs.push(<Subwoofer key="sub-2" position={[0.8, 0, subZ]} />);
    }
    if (setup.subs === 3) {
      subs.push(<Subwoofer key="sub-1" position={[-1.6, 0, subZ]} />);
      subs.push(<Subwoofer key="sub-2" position={[0, 0, subZ]} />);
      subs.push(<Subwoofer key="sub-3" position={[1.6, 0, subZ]} />);
    }
    if (setup.subs >= 4) {
      subs.push(<Subwoofer key="sub-1" position={[-2.4, 0, subZ]} />);
      subs.push(<Subwoofer key="sub-2" position={[-0.8, 0, subZ]} />);
      subs.push(<Subwoofer key="sub-3" position={[0.8, 0, subZ]} />);
      subs.push(<Subwoofer key="sub-4" position={[2.4, 0, subZ]} />);
    }
    return subs;
  };

  const renderTops = () => {
    const tops = [];
    // Tops sit on the ground on stands (Y=0) flanking the sides of the stage
    const sideX = Math.max(1.8, (stageWidth / 2) + 0.4);
    const topZ = stageFrontZ - 0.4;
    
    if (setup.tops === 1) {
      tops.push(<TopSpeaker key="top-1" position={[-sideX, 0, topZ]} />);
    }
    if (setup.tops === 2) {
      tops.push(<TopSpeaker key="top-1" position={[-sideX, 0, topZ]} />);
      tops.push(<TopSpeaker key="top-2" position={[sideX, 0, topZ]} />);
    }
    if (setup.tops === 3) {
      tops.push(<TopSpeaker key="top-1" position={[-sideX - 0.8, 0, topZ]} />);
      tops.push(<TopSpeaker key="top-2" position={[-sideX, 0, topZ]} />);
      tops.push(<TopSpeaker key="top-3" position={[sideX, 0, topZ]} />);
    }
    if (setup.tops >= 4) {
      const stackOffset = 0.8;
      tops.push(<TopSpeaker key="top-1" position={[-sideX, 0, topZ]} />);
      tops.push(<TopSpeaker key="top-2" position={[-sideX, stackOffset, topZ]} />);
      tops.push(<TopSpeaker key="top-3" position={[sideX, 0, topZ]} />);
      tops.push(<TopSpeaker key="top-4" position={[sideX, stackOffset, topZ]} />);
    }
    return tops;
  };

  const renderTowers = () => {
    const towers = [];
    const zPos = 1.0; 
    let xSpread = 3.5;
    
    if (setup.stagePieces >= 4) {
      xSpread = Math.max(3.5, (stageWidth / 2) + 0.6);
    }

    if (setup.towers === 1) towers.push(<TrussTower key="tower-1" position={[0, 0, zPos]} />);
    if (setup.towers === 2) {
      towers.push(<TrussTower key="tower-1" position={[-xSpread, 0, zPos]} />);
      towers.push(<TrussTower key="tower-2" position={[xSpread, 0, zPos]} />);
    }
    if (setup.towers === 3) {
      towers.push(<TrussTower key="tower-1" position={[-xSpread, 0, zPos]} />);
      towers.push(<TrussTower key="tower-2" position={[0, 0, -2.5]} />);
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

  // Arch truss width capped strictly at 32' = 9.75m (DJM Audio total truss = 36')
  const archTrussSpan = Math.min(9.75, Math.max(3.2, stageWidth));

  return (
    <div className="w-full h-full bg-slate-900 rounded-2xl overflow-hidden relative shadow-2xl border border-slate-800 touch-none">
      <Canvas shadows camera={{ position: [0, 4.0, 9], fov: 48 }}>
        <Suspense fallback={null}>
          <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0} azimuth={0.25} />
          <ambientLight intensity={0.45} />
          <directionalLight 
            castShadow 
            position={[5, 12, 5]} 
            intensity={1.6} 
            shadow-mapSize={[1024, 1024]}
          />
          <Environment preset="city" />
          
          <group position={[0, -0.5, 0]}>
            {/* The Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[36, 36]} />
              <meshStandardMaterial color="#141414" roughness={0.85} />
            </mesh>

            {/* Grid helper for scale reference */}
            <gridHelper args={[36, 36, 0x444444, 0x222222]} />

            {/* Stage Platforms (Strict Squares/Rectangles with Black Skirt) */}
            {renderStage()}

            {/* Stage Access Steps ($50 ea) */}
            {renderStageSteps()}

            {/* Overhead Stage Arch Truss (Spans along length of stage, max 32') */}
            {setup.archTruss && (
              <OverheadStageTrussArch 
                width={archTrussSpan} 
                position={[0, 0, stageFrontZ - 0.4]} 
              />
            )}

            {/* Screens, Pyrotechnics, and Speakers */}
            {renderScreens()}
            {renderSparks()}
            {renderSubs()}
            {renderTops()}
            {renderTowers()}

            {/* DJ Booth or Rental Mixer Table */}
            {setup.serviceType === "dj" && <DJTable position={[0, baseElevation, -0.5]} />}
            {setup.serviceType === "rental" && setup.mixer > 0 && <RentalMixerTable position={[0, baseElevation, -0.5]} />}
            
            <ContactShadows position={[0, 0.01, 0]} opacity={0.45} scale={18} blur={2.5} far={5} />
          </group>

          <OrbitControls 
            ref={controlsRef}
            enableZoom={false}
            minPolarAngle={0.05} 
            maxPolarAngle={Math.PI / 2 - 0.05} // Prevent camera going under the floor
            minDistance={2.5}
            maxDistance={22}
            target={[0, 1.2, 0]}
            enableDamping={true}
            dampingFactor={0.05}
          />
        </Suspense>
      </Canvas>

      {/* Top Overlay Badge */}
      <div className="absolute top-3 left-3 bg-black/65 text-white text-[11px] sm:text-xs px-3 py-1.5 rounded-full backdrop-blur-md pointer-events-none flex items-center gap-1.5 shadow-lg border border-white/10">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        <span>Interactive 3D Stage (Touch/Drag to Rotate)</span>
      </div>

      {/* Bottom Stage Info Badge */}
      {setup.stagePieces >= 4 && (
        <div className="absolute bottom-3 left-3 bg-black/65 text-white/90 text-[11px] sm:text-xs px-3 py-1.5 rounded-full backdrop-blur-md pointer-events-none shadow-md border border-white/10">
          Stage: <span className="font-semibold text-amber-400">{stageConfig.label}</span>
          {setup.stageSteps > 0 && ` + ${setup.stageSteps} Steps`}
          {setup.archTruss && ` + 32' Arch Truss`}
        </div>
      )}

      {/* Bottom Right Zoom Controls */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-2 pointer-events-auto z-10">
        <button 
          onClick={handleZoomIn}
          className="w-10 h-10 bg-black/65 text-white rounded-full flex items-center justify-center backdrop-blur-md shadow-lg border border-white/10 hover:bg-black/80 transition-colors"
          title="Zoom In"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
        </button>
        <button 
          onClick={handleZoomOut}
          className="w-10 h-10 bg-black/65 text-white rounded-full flex items-center justify-center backdrop-blur-md shadow-lg border border-white/10 hover:bg-black/80 transition-colors"
          title="Zoom Out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
        </button>
      </div>
    </div>
  );
}
