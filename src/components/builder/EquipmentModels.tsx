"use client";

import { Box, Cylinder, Sphere } from "@react-three/drei";

// Colors for our placeholders to look somewhat professional
const SPEAKER_COLOR = "#111111";
const GRILL_COLOR = "#222222";
const TRUSS_COLOR = "#889299";
const LIGHT_COLOR = "#00ffcc";

export function Subwoofer({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Main Box */}
      <Box args={[0.8, 0.6, 0.8]} position={[0, 0.3, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={SPEAKER_COLOR} roughness={0.9} />
      </Box>
      {/* Front Grill */}
      <Box args={[0.7, 0.5, 0.05]} position={[0, 0.3, 0.401]} receiveShadow>
        <meshStandardMaterial color={GRILL_COLOR} roughness={0.7} />
      </Box>
    </group>
  );
}

export function TopSpeaker({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Speaker Stand pole (optional, if flying or on stick) */}
      <Cylinder args={[0.03, 0.03, 1.2]} position={[0, 0.6, 0]} castShadow>
        <meshStandardMaterial color="#050505" metalness={0.8} />
      </Cylinder>
      {/* Main Speaker Box (tall and thin like IG3T) */}
      <Box args={[0.3, 0.8, 0.35]} position={[0, 1.6, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={SPEAKER_COLOR} roughness={0.8} />
      </Box>
      {/* Grill */}
      <Box args={[0.26, 0.76, 0.02]} position={[0, 1.6, 0.176]} receiveShadow>
        <meshStandardMaterial color={GRILL_COLOR} roughness={0.7} />
      </Box>
    </group>
  );
}

export function TrussTower({ position, hasLight = true }: { position: [number, number, number], hasLight?: boolean }) {
  return (
    <group position={position}>
      {/* Base Plate */}
      <Box args={[0.8, 0.05, 0.8]} position={[0, 0.025, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={TRUSS_COLOR} metalness={0.6} roughness={0.4} />
      </Box>
      {/* Truss Structure (simplified as a textured or metallic cylinder/box) */}
      <Box args={[0.3, 2, 0.3]} position={[0, 1.025, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={TRUSS_COLOR} metalness={0.8} roughness={0.3} wireframe={true} />
      </Box>
      
      {/* Moving Head Light on top */}
      {hasLight && (
        <group position={[0, 2.15, 0]}>
          <Box args={[0.2, 0.1, 0.2]} castShadow>
             <meshStandardMaterial color="#1a1a1a" />
          </Box>
          <Sphere args={[0.15, 16, 16]} position={[0, 0.15, 0]} castShadow>
            <meshStandardMaterial color="#222" emissive={LIGHT_COLOR} emissiveIntensity={0.5} />
          </Sphere>
          {/* Light Beam visualization */}
          <Cylinder args={[0.01, 1.5, 4]} position={[0, 2, 0]} rotation={[Math.PI/6, 0, 0]}>
            <meshBasicMaterial color={LIGHT_COLOR} transparent opacity={0.1} depthWrite={false} />
          </Cylinder>
        </group>
      )}
    </group>
  );
}

export function DJTable({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Table top */}
      <Box args={[1.8, 0.05, 0.8]} position={[0, 0.9, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#111" />
      </Box>
      {/* Legs */}
      <Cylinder args={[0.03, 0.03, 0.9]} position={[-0.8, 0.45, -0.3]} castShadow>
        <meshStandardMaterial color="#333" metalness={0.5} />
      </Cylinder>
      <Cylinder args={[0.03, 0.03, 0.9]} position={[0.8, 0.45, -0.3]} castShadow>
        <meshStandardMaterial color="#333" metalness={0.5} />
      </Cylinder>
      <Cylinder args={[0.03, 0.03, 0.9]} position={[-0.8, 0.45, 0.3]} castShadow>
        <meshStandardMaterial color="#333" metalness={0.5} />
      </Cylinder>
      <Cylinder args={[0.03, 0.03, 0.9]} position={[0.8, 0.45, 0.3]} castShadow>
        <meshStandardMaterial color="#333" metalness={0.5} />
      </Cylinder>
      
      {/* Mixer/Decks */}
      <Box args={[1.2, 0.1, 0.5]} position={[0, 0.975, 0]} castShadow>
        <meshStandardMaterial color="#222" />
      </Box>
    </group>
  );
}

export function StageModel({ position }: { position: [number, number, number] }) {
  // 4x4 ft = 1.22m x 1.22m. Height 1.5ft = 0.45m.
  return (
    <group position={position}>
      <Box args={[1.22, 0.45, 1.22]} position={[0, 0.225, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#1a1a1a" roughness={1.0} />
      </Box>
    </group>
  );
}

export function ScreenPanelModel({ position }: { position: [number, number, number] }) {
  // 20" x 40" = ~0.5m x 1m. Depth 0.1m
  return (
    <group position={position}>
      <Box args={[0.5, 1.0, 0.1]} position={[0, 0.5, 0]} castShadow receiveShadow>
        {/* Glowy screen front */}
        <meshStandardMaterial color="#0a0a0a" emissive="#002244" emissiveIntensity={0.8} />
      </Box>
    </group>
  );
}

export function SparkMachineModel({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Base */}
      <Box args={[0.2, 0.25, 0.2]} position={[0, 0.125, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#222" />
      </Box>
      {/* Spark effect (yellow glowing cone) */}
      <Cylinder args={[0.01, 0.1, 1.5]} position={[0, 1.0, 0]} castShadow={false}>
        <meshBasicMaterial color="#ffaa00" transparent opacity={0.6} />
      </Cylinder>
    </group>
  );
}
