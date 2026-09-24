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
  // Global Truss F34 is 290mm (0.29m) square
  const offset = 0.13;
  const height = 2.0;

  return (
    <group position={position}>
      {/* Heavy Steel Base Plate */}
      <Box args={[0.8, 0.03, 0.8]} position={[0, 0.015, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.3} />
      </Box>

      {/* Hex Uplight placed inside the base of the truss */}
      <group position={[0, 0.08, 0]}>
        <Box args={[0.18, 0.1, 0.18]} castShadow>
          <meshStandardMaterial color="#000" roughness={0.9} />
        </Box>
        <Sphere args={[0.07, 16, 16]} position={[0, 0.06, 0]}>
          <meshStandardMaterial color="#222" emissive={LIGHT_COLOR} emissiveIntensity={2.5} />
        </Sphere>
        {/* Uplight glow internal to the truss */}
        <Cylinder args={[0.15, 0.05, height - 0.2]} position={[0, height / 2 - 0.1, 0]}>
          <meshBasicMaterial color={LIGHT_COLOR} transparent opacity={0.15} depthWrite={false} />
        </Cylinder>
      </group>

      {/* 4 Aluminum Chords for Truss */}
      <Cylinder args={[0.025, 0.025, height]} position={[-offset, height / 2 + 0.03, -offset]} castShadow receiveShadow>
        <meshStandardMaterial color={TRUSS_COLOR} metalness={0.9} roughness={0.2} />
      </Cylinder>
      <Cylinder args={[0.025, 0.025, height]} position={[offset, height / 2 + 0.03, -offset]} castShadow receiveShadow>
        <meshStandardMaterial color={TRUSS_COLOR} metalness={0.9} roughness={0.2} />
      </Cylinder>
      <Cylinder args={[0.025, 0.025, height]} position={[-offset, height / 2 + 0.03, offset]} castShadow receiveShadow>
        <meshStandardMaterial color={TRUSS_COLOR} metalness={0.9} roughness={0.2} />
      </Cylinder>
      <Cylinder args={[0.025, 0.025, height]} position={[offset, height / 2 + 0.03, offset]} castShadow receiveShadow>
        <meshStandardMaterial color={TRUSS_COLOR} metalness={0.9} roughness={0.2} />
      </Cylinder>

      {/* Simple horizontal brace representation to imply F34 structure */}
      {[0.5, 1.0, 1.5, 2.0].map((y, i) => (
        <group key={`brace-${i}`} position={[0, y, 0]}>
          <Box args={[0.26, 0.015, 0.26]} castShadow receiveShadow>
             <meshStandardMaterial color={TRUSS_COLOR} metalness={0.9} roughness={0.2} />
          </Box>
        </group>
      ))}

      {/* Wash Light at 3/4 height facing crowd (z is front) */}
      <group position={[0, height * 0.75, offset + 0.06]} rotation={[Math.PI / 6, 0, 0]}>
        <Box args={[0.2, 0.12, 0.1]} castShadow>
          <meshStandardMaterial color="#111" />
        </Box>
        {/* Wash LEDs */}
        <Box args={[0.18, 0.1, 0.02]} position={[0, 0, 0.05]}>
          <meshStandardMaterial color="#fff" emissive="#ff0088" emissiveIntensity={1.2} />
        </Box>
        {/* Wash beam */}
        <Cylinder args={[0.8, 0.1, 2.5]} position={[0, -1.2, 1.0]} rotation={[-Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color="#ff0088" transparent opacity={0.08} depthWrite={false} />
        </Cylinder>
      </group>

      {/* Lightjoy Mobile Head on top */}
      {hasLight && (
        <group position={[0, height + 0.05, 0]}>
          {/* Base */}
          <Box args={[0.22, 0.08, 0.22]} position={[0, 0.04, 0]} castShadow>
             <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
          </Box>
          {/* Yoke Arms */}
          <Box args={[0.04, 0.2, 0.15]} position={[-0.11, 0.15, 0]} castShadow>
             <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
          </Box>
          <Box args={[0.04, 0.2, 0.15]} position={[0.11, 0.15, 0]} castShadow>
             <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
          </Box>
          {/* Head Sphere */}
          <Sphere args={[0.12, 16, 16]} position={[0, 0.22, 0]} castShadow>
             <meshStandardMaterial color="#222" roughness={0.5} />
          </Sphere>
          {/* Lens */}
          <Cylinder args={[0.08, 0.08, 0.02]} position={[0, 0.22, 0.11]} rotation={[Math.PI / 2, 0, 0]}>
             <meshStandardMaterial color="#fff" emissive={LIGHT_COLOR} emissiveIntensity={1.5} />
          </Cylinder>
          {/* Moving Head Beam (angled out) */}
          <Cylinder args={[0.4, 0.05, 5]} position={[0, 2.5, 2.5]} rotation={[-Math.PI / 4, 0, 0]}>
             <meshBasicMaterial color={LIGHT_COLOR} transparent opacity={0.12} depthWrite={false} />
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

export function RentalMixerTable({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Folding Table top */}
      <Box args={[1.2, 0.05, 0.6]} position={[0, 0.8, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#444" />
      </Box>
      {/* X-Stand Legs */}
      <Box args={[0.04, 1.0, 0.04]} position={[-0.4, 0.4, 0]} rotation={[0, 0, Math.PI / 6]} castShadow>
        <meshStandardMaterial color="#222" metalness={0.5} />
      </Box>
      <Box args={[0.04, 1.0, 0.04]} position={[-0.4, 0.4, 0]} rotation={[0, 0, -Math.PI / 6]} castShadow>
        <meshStandardMaterial color="#222" metalness={0.5} />
      </Box>
      <Box args={[0.04, 1.0, 0.04]} position={[0.4, 0.4, 0]} rotation={[0, 0, Math.PI / 6]} castShadow>
        <meshStandardMaterial color="#222" metalness={0.5} />
      </Box>
      <Box args={[0.04, 1.0, 0.04]} position={[0.4, 0.4, 0]} rotation={[0, 0, -Math.PI / 6]} castShadow>
        <meshStandardMaterial color="#222" metalness={0.5} />
      </Box>
      
      {/* Pioneer XDJ-XZ Mixer representation */}
      <Box args={[0.9, 0.08, 0.45]} position={[0, 0.865, 0]} castShadow>
        <meshStandardMaterial color="#1a1a1a" />
      </Box>
      {/* Platters */}
      <Cylinder args={[0.15, 0.15, 0.02]} position={[-0.3, 0.91, 0]} castShadow>
        <meshStandardMaterial color="#333" metalness={0.8} />
      </Cylinder>
      <Cylinder args={[0.15, 0.15, 0.02]} position={[0.3, 0.91, 0]} castShadow>
        <meshStandardMaterial color="#333" metalness={0.8} />
      </Cylinder>
    </group>
  );
}

export function StageModel({ position }: { position: [number, number, number] }) {
  // 4x4 ft = 1.22m x 1.22m. Height 1.5ft = 0.45m.
  // Render deck surface + clean black skirting concealing silver legs
  return (
    <group position={position}>
      {/* Top Deck Surface */}
      <Box args={[1.22, 0.05, 1.22]} position={[0, 0.425, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#2a2a2a" roughness={0.7} />
      </Box>
      {/* Black Stage Skirt around legs */}
      <Box args={[1.20, 0.40, 1.20]} position={[0, 0.20, 0]} receiveShadow>
        <meshStandardMaterial color="#0d0d0d" roughness={0.9} />
      </Box>
    </group>
  );
}

export function StageStepsModel({ position }: { position: [number, number, number] }) {
  // 2-tier modular stage access stairs
  return (
    <group position={position}>
      {/* Step 1 (Lower) */}
      <Box args={[0.9, 0.225, 0.45]} position={[0, 0.1125, 0.225]} castShadow receiveShadow>
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </Box>
      {/* Step 2 (Upper) */}
      <Box args={[0.9, 0.45, 0.45]} position={[0, 0.225, -0.225]} castShadow receiveShadow>
        <meshStandardMaterial color="#1f1f1f" roughness={0.8} />
      </Box>
    </group>
  );
}

export function OverheadStageTrussArch({ width, position }: { width: number, position: [number, number, number] }) {
  // Maximum width closed at 32 ft (9.75m)
  const clampedWidth = Math.min(width, 9.75);
  const archHeight = 3.6; // ~12 ft clearance

  return (
    <group position={position}>
      {/* Left Heavy Baseplate */}
      <Box args={[0.8, 0.04, 0.8]} position={[-clampedWidth / 2 - 0.2, 0.02, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={TRUSS_COLOR} metalness={0.7} roughness={0.4} />
      </Box>
      {/* Left Upright Truss Column */}
      <Box args={[0.3, archHeight, 0.3]} position={[-clampedWidth / 2 - 0.2, archHeight / 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={TRUSS_COLOR} metalness={0.8} roughness={0.3} wireframe={true} />
      </Box>

      {/* Right Heavy Baseplate */}
      <Box args={[0.8, 0.04, 0.8]} position={[clampedWidth / 2 + 0.2, 0.02, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={TRUSS_COLOR} metalness={0.7} roughness={0.4} />
      </Box>
      {/* Right Upright Truss Column */}
      <Box args={[0.3, archHeight, 0.3]} position={[clampedWidth / 2 + 0.2, archHeight / 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={TRUSS_COLOR} metalness={0.8} roughness={0.3} wireframe={true} />
      </Box>

      {/* Top Continuous Horizontal Truss Crossbeam (Spans Length of Stage, Max 32') */}
      <Box args={[clampedWidth + 0.7, 0.3, 0.3]} position={[0, archHeight + 0.15, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={TRUSS_COLOR} metalness={0.8} roughness={0.3} wireframe={true} />
      </Box>

      {/* Rigged Stage Lights along the Arch */}
      {[-0.35, -0.15, 0.15, 0.35].map((fraction, idx) => (
        <group key={`arch-light-${idx}`} position={[clampedWidth * fraction, archHeight, 0]}>
          <Box args={[0.18, 0.15, 0.18]} position={[0, -0.1, 0]} castShadow>
            <meshStandardMaterial color="#111" />
          </Box>
          <Sphere args={[0.08, 12, 12]} position={[0, -0.18, 0]}>
            <meshStandardMaterial color="#222" emissive={LIGHT_COLOR} emissiveIntensity={0.6} />
          </Sphere>
        </group>
      ))}
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

export function ScreenTrussArch({ width, position }: { width: number, position: [number, number, number] }) {
  // A goal-post truss that frames the screen panels perfectly
  return (
    <group position={position}>
      {/* Left Vertical Truss */}
      <Box args={[0.3, 3, 0.3]} position={[-width / 2 - 0.2, 1.5, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={TRUSS_COLOR} metalness={0.8} roughness={0.3} wireframe={true} />
      </Box>
      {/* Right Vertical Truss */}
      <Box args={[0.3, 3, 0.3]} position={[width / 2 + 0.2, 1.5, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={TRUSS_COLOR} metalness={0.8} roughness={0.3} wireframe={true} />
      </Box>
      {/* Top Horizontal Truss */}
      <Box args={[width + 0.7, 0.3, 0.3]} position={[0, 3.15, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={TRUSS_COLOR} metalness={0.8} roughness={0.3} wireframe={true} />
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
