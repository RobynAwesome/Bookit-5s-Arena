"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line } from "@react-three/drei";
import * as THREE from "three";

const CAMERA_SHOTS = [
  { position: [0, 4.8, 12.5], target: [0, 0.4, 0] },
  { position: [0, 9.2, 5.2], target: [0, 0, 0] },
  { position: [-7.5, 3.2, 5.8], target: [-0.5, 0.2, 0] },
  { position: [0, 2.4, -10.5], target: [0, 0.7, 0] },
  { position: [9.2, 6.4, 10.5], target: [0, 0.5, 0] },
];

function PitchLines() {
  const boundary = useMemo(
    () => [
      [-7.4, 0.03, -4.4],
      [7.4, 0.03, -4.4],
      [7.4, 0.03, 4.4],
      [-7.4, 0.03, 4.4],
      [-7.4, 0.03, -4.4],
    ],
    [],
  );

  return (
    <group>
      <Line points={boundary} color="#f4f1df" lineWidth={1.4} />
      <Line points={[[0, 0.03, -4.4], [0, 0.03, 4.4]]} color="#f4f1df" lineWidth={1.1} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, 0]}>
        <ringGeometry args={[1.2, 1.23, 64]} />
        <meshBasicMaterial color="#f4f1df" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <circleGeometry args={[0.055, 24]} />
        <meshBasicMaterial color="#f4f1df" />
      </mesh>
    </group>
  );
}

function Goal({ z, facing = 1 }) {
  const depth = 1.05;
  return (
    <group position={[0, 0, z]} rotation={[0, facing < 0 ? Math.PI : 0, 0]}>
      <mesh position={[-1.55, 0.72, 0]}>
        <boxGeometry args={[0.08, 1.45, 0.08]} />
        <meshStandardMaterial color="#f4f1df" roughness={0.7} />
      </mesh>
      <mesh position={[1.55, 0.72, 0]}>
        <boxGeometry args={[0.08, 1.45, 0.08]} />
        <meshStandardMaterial color="#f4f1df" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.42, 0]}>
        <boxGeometry args={[3.18, 0.08, 0.08]} />
        <meshStandardMaterial color="#f4f1df" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.73, -depth / 2]}>
        <boxGeometry args={[3.12, 1.38, 0.02]} />
        <meshBasicMaterial color="#d8decf" wireframe transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

function Floodlight({ x, z }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.045, 0.065, 5, 8]} />
        <meshStandardMaterial color="#2f3237" metalness={0.7} roughness={0.45} />
      </mesh>
      <mesh position={[0, 5.05, 0]} rotation={[0, 0, x > 0 ? -0.08 : 0.08]}>
        <boxGeometry args={[0.8, 0.22, 0.18]} />
        <meshStandardMaterial color="#f6d47a" emissive="#f6d47a" emissiveIntensity={2.3} />
      </mesh>
      <pointLight position={[0, 4.8, 0]} intensity={3.2} distance={18} color="#f3d49a" />
    </group>
  );
}

function ArenaStructure() {
  return (
    <group>
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[18, 0.16, 12]} />
        <meshStandardMaterial color="#080b0a" roughness={0.95} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[15, 9]} />
        <meshStandardMaterial color="#123f2b" roughness={0.86} metalness={0.02} />
      </mesh>
      <PitchLines />
      <Goal z={-4.65} facing={1} />
      <Goal z={4.65} facing={-1} />

      <mesh position={[-8.15, 0.65, 0]}>
        <boxGeometry args={[1.05, 1.3, 9]} />
        <meshStandardMaterial color="#171a1f" roughness={0.8} />
      </mesh>
      <mesh position={[8.15, 0.65, 0]}>
        <boxGeometry args={[1.05, 1.3, 9]} />
        <meshStandardMaterial color="#171a1f" roughness={0.8} />
      </mesh>

      <Floodlight x={-7.7} z={-4.8} />
      <Floodlight x={7.7} z={-4.8} />
      <Floodlight x={-7.7} z={4.8} />
      <Floodlight x={7.7} z={4.8} />
    </group>
  );
}

function MatchBall({ chapter }) {
  const ref = useRef();
  const destinations = useMemo(
    () => [
      new THREE.Vector3(0.2, 0.44, 1.1),
      new THREE.Vector3(-1.8, 0.44, -0.4),
      new THREE.Vector3(-5.2, 0.44, 2.6),
      new THREE.Vector3(0, 0.44, -2.2),
      new THREE.Vector3(3.8, 0.44, 2.4),
    ],
    [],
  );

  useFrame((_, delta) => {
    if (!ref.current) return;
    const target = destinations[Math.min(chapter, destinations.length - 1)];
    ref.current.position.lerp(target, 1 - Math.exp(-3.2 * delta));
    ref.current.rotation.x += delta * 0.35;
    ref.current.rotation.y += delta * 0.55;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.12}>
      <group ref={ref} position={[0.2, 0.44, 1.1]}>
        <mesh scale={0.38}>
          <sphereGeometry args={[1, 28, 28]} />
          <meshStandardMaterial color="#ede9d3" roughness={0.55} />
        </mesh>
        <mesh scale={0.385}>
          <icosahedronGeometry args={[1, 2]} />
          <meshBasicMaterial color="#171a1f" wireframe transparent opacity={0.48} />
        </mesh>
      </group>
    </Float>
  );
}

function RealityBeacon({ sourceState }) {
  const color =
    sourceState === "database" ? "#22c55e" : sourceState === "database-empty" ? "#f59e0b" : "#ef4444";

  return (
    <group position={[-7.15, 0.18, 4.05]}>
      <mesh>
        <cylinderGeometry args={[0.08, 0.08, 0.35, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>
      <pointLight position={[0, 0.2, 0]} intensity={1.6} distance={3.5} color={color} />
    </group>
  );
}

function ArenaScene({ chapter, sourceState, quality }) {
  const lookAt = useRef(new THREE.Vector3(...CAMERA_SHOTS[0].target));
  const sceneGroup = useRef();

  useFrame((state, delta) => {
    const shot = CAMERA_SHOTS[Math.min(chapter, CAMERA_SHOTS.length - 1)];
    const alpha = 1 - Math.exp(-2.2 * delta);
    state.camera.position.lerp(new THREE.Vector3(...shot.position), alpha);
    lookAt.current.lerp(new THREE.Vector3(...shot.target), alpha);
    state.camera.lookAt(lookAt.current);

    if (sceneGroup.current) {
      const targetRotation = chapter === 4 ? -0.08 : chapter === 2 ? 0.04 : 0;
      sceneGroup.current.rotation.y = THREE.MathUtils.lerp(
        sceneGroup.current.rotation.y,
        targetRotation,
        alpha,
      );
    }
  });

  return (
    <>
      <color attach="background" args={["#040705"]} />
      <fog attach="fog" args={["#040705", 10, quality === "full" ? 28 : 22]} />
      <ambientLight intensity={0.38} color="#d8e6dc" />
      <hemisphereLight args={["#e8e2c7", "#07120d", 0.62]} />
      <directionalLight position={[-5, 10, 6]} intensity={1.25} color="#f4dfad" />

      <group ref={sceneGroup}>
        <ArenaStructure />
        <MatchBall chapter={chapter} />
        <RealityBeacon sourceState={sourceState} />
      </group>

      {quality === "full" ? (
        <mesh position={[0, 8.5, -13]}>
          <circleGeometry args={[3.2, 64]} />
          <meshBasicMaterial color="#e6a22c" transparent opacity={0.12} />
        </mesh>
      ) : null}
    </>
  );
}

export default function ArenaWorld({ chapter = 0, sourceState = "unavailable", quality = "full" }) {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Canvas
        camera={{ position: CAMERA_SHOTS[0].position, fov: 43, near: 0.1, far: 80 }}
        dpr={quality === "full" ? [1, 1.55] : 1}
        gl={{
          antialias: quality === "full",
          alpha: false,
          powerPreference: quality === "full" ? "high-performance" : "low-power",
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
      >
        <ArenaScene chapter={chapter} sourceState={sourceState} quality={quality} />
      </Canvas>
    </div>
  );
}
