'use client';

import { Line, OrbitControls, Sparkles } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Group, Mesh } from 'three';
import {
  getExperienceProfile,
  type ExperienceProfile,
} from '@/lib/apwa/runtime';
import {
  getProvinceBySlug,
  SOUTH_AFRICA_PROVINCES,
  type ProvinceSlug,
} from '@/lib/organism/southAfrica';

const PITCH_LENGTH = 6.8;
const PITCH_WIDTH = 4.2;
const LINE_Y = 0.025;

function detectProfile(): ExperienceProfile {
  if (typeof window === 'undefined') {
    return {
      tier: 'static',
      runThreeJs: false,
      runPhysics: false,
      maxDpr: 1,
      targetFps: 0,
      reason: ['server-render'],
    };
  }

  const navigatorWithHints = navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
    deviceMemory?: number;
  };
  const canvas = document.createElement('canvas');
  const webgl = Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));

  return getExperienceProfile({
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    saveData: Boolean(navigatorWithHints.connection?.saveData),
    effectiveType: navigatorWithHints.connection?.effectiveType,
    deviceMemoryGb: navigatorWithHints.deviceMemory,
    hardwareConcurrency: navigator.hardwareConcurrency,
    webgl,
    visible: document.visibilityState === 'visible',
  });
}

function PitchMarkings({ lite }: { lite: boolean }) {
  const line = '#f7f2d4';
  const halfLength = PITCH_LENGTH / 2;
  const halfWidth = PITCH_WIDTH / 2;
  const penaltyDepth = 1.05;
  const penaltyHalfWidth = 1.35;

  return (
    <group position={[0, LINE_Y, 0]}>
      <Line
        points={[
          [-halfLength, 0, -halfWidth],
          [halfLength, 0, -halfWidth],
          [halfLength, 0, halfWidth],
          [-halfLength, 0, halfWidth],
          [-halfLength, 0, -halfWidth],
        ]}
        color={line}
        lineWidth={lite ? 1 : 1.35}
      />
      <Line
        points={[[0, 0, -halfWidth], [0, 0, halfWidth]]}
        color={line}
        lineWidth={lite ? 1 : 1.35}
      />
      <Line
        points={[
          [-halfLength, 0, -penaltyHalfWidth],
          [-halfLength + penaltyDepth, 0, -penaltyHalfWidth],
          [-halfLength + penaltyDepth, 0, penaltyHalfWidth],
          [-halfLength, 0, penaltyHalfWidth],
        ]}
        color={line}
        lineWidth={lite ? 1 : 1.25}
      />
      <Line
        points={[
          [halfLength, 0, -penaltyHalfWidth],
          [halfLength - penaltyDepth, 0, -penaltyHalfWidth],
          [halfLength - penaltyDepth, 0, penaltyHalfWidth],
          [halfLength, 0, penaltyHalfWidth],
        ]}
        color={line}
        lineWidth={lite ? 1 : 1.25}
      />
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.62, lite ? 0.012 : 0.018, 6, lite ? 42 : 72]} />
        <meshBasicMaterial color={line} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.05, 16]} />
        <meshBasicMaterial color={line} />
      </mesh>
    </group>
  );
}

function Goal({ side, lite }: { side: -1 | 1; lite: boolean }) {
  const x = side * (PITCH_LENGTH / 2 + 0.18);
  return (
    <group position={[x, 0.28, 0]}>
      <mesh position={[0, 0.25, -0.72]} castShadow={!lite}>
        <boxGeometry args={[0.045, 0.55, 0.045]} />
        <meshStandardMaterial color="#f6f3dd" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.25, 0.72]} castShadow={!lite}>
        <boxGeometry args={[0.045, 0.55, 0.045]} />
        <meshStandardMaterial color="#f6f3dd" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.52, 0]} castShadow={!lite}>
        <boxGeometry args={[0.045, 0.045, 1.48]} />
        <meshStandardMaterial color="#f6f3dd" roughness={0.5} />
      </mesh>
      {!lite ? (
        <mesh position={[side * 0.15, 0.27, 0]} rotation={[0, 0, Math.PI / 2]}>
          <planeGeometry args={[0.55, 1.42, 5, 8]} />
          <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.17} />
        </mesh>
      ) : null}
    </group>
  );
}

const TEAM_A = [
  [-2.45, -0.9],
  [-1.45, -1.35],
  [-1.45, 1.35],
  [-0.55, -0.55],
  [-0.55, 0.75],
] as const;

const TEAM_B = [
  [2.45, 0.9],
  [1.45, 1.35],
  [1.45, -1.35],
  [0.55, 0.55],
  [0.55, -0.75],
] as const;

function Player({
  position,
  team,
  index,
  active,
  animate,
  lite,
}: {
  position: readonly [number, number];
  team: 'home' | 'away';
  index: number;
  active: boolean;
  animate: boolean;
  lite: boolean;
}) {
  const group = useRef<Group>(null);

  useFrame((state) => {
    if (!group.current || !animate) return;
    const phase = state.clock.elapsedTime * 0.75 + index * 0.63 + (team === 'away' ? 1.8 : 0);
    group.current.position.z = position[1] + Math.sin(phase) * (active ? 0.09 : 0.035);
    group.current.position.x = position[0] + Math.cos(phase * 0.7) * (active ? 0.055 : 0.02);
  });

  const body = team === 'home' ? '#f4cf32' : '#38d989';
  const glow = team === 'home' ? '#6f5700' : '#075436';

  return (
    <group ref={group} position={[position[0], 0, position[1]]}>
      <mesh position={[0, 0.2, 0]} castShadow={!lite}>
        <cylinderGeometry args={[0.1, 0.13, 0.32, lite ? 8 : 12]} />
        <meshStandardMaterial
          color={body}
          emissive={glow}
          emissiveIntensity={active ? 0.65 : 0.18}
          roughness={0.55}
        />
      </mesh>
      <mesh position={[0, 0.43, 0]} castShadow={!lite}>
        <sphereGeometry args={[0.105, lite ? 8 : 12, lite ? 8 : 12]} />
        <meshStandardMaterial color="#d6a67f" roughness={0.72} />
      </mesh>
      {active ? (
        <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.17, 0.23, lite ? 18 : 28]} />
          <meshBasicMaterial color={body} transparent opacity={0.65} />
        </mesh>
      ) : null}
    </group>
  );
}

function Ball({ animate, ready, lite }: { animate: boolean; ready: boolean; lite: boolean }) {
  const mesh = useRef<Mesh>(null);

  useFrame((state) => {
    if (!mesh.current || !animate || !ready) return;
    const t = state.clock.elapsedTime * 0.55;
    mesh.current.position.x = Math.sin(t) * 1.65;
    mesh.current.position.z = Math.sin(t * 1.7) * 0.88;
    mesh.current.rotation.x += 0.025;
    mesh.current.rotation.z += 0.018;
  });

  return (
    <mesh ref={mesh} position={[0, 0.13, 0]} castShadow={!lite}>
      <sphereGeometry args={[0.12, lite ? 10 : 18, lite ? 8 : 14]} />
      <meshStandardMaterial color="#f7f5e8" roughness={0.68} />
    </mesh>
  );
}

function Floodlight({ x, z, lite }: { x: number; z: number; lite: boolean }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 1.35, 0]} castShadow={!lite}>
        <cylinderGeometry args={[0.025, 0.04, 2.7, 8]} />
        <meshStandardMaterial color="#79838a" metalness={0.7} roughness={0.36} />
      </mesh>
      <mesh position={[0, 2.72, 0]} rotation={[0, 0, x < 0 ? -0.15 : 0.15]}>
        <boxGeometry args={[0.45, 0.18, 0.12]} />
        <meshStandardMaterial color="#e9f6ff" emissive="#b8dcff" emissiveIntensity={lite ? 0.4 : 1.2} />
      </mesh>
    </group>
  );
}

function Stands({ lite }: { lite: boolean }) {
  if (lite) return null;

  return (
    <group>
      {[-1, 1].map((side) => (
        <group key={side} position={[0, 0, side * 2.75]}>
          {[0, 1, 2].map((tier) => (
            <mesh key={tier} position={[0, 0.16 + tier * 0.14, side * tier * 0.16]} receiveShadow>
              <boxGeometry args={[7.45, 0.22, 0.38]} />
              <meshStandardMaterial color={tier % 2 ? '#121b19' : '#18251f'} roughness={0.9} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function ProvinceNode({
  index,
  activeIndex,
  onSelect,
  lite,
}: {
  index: number;
  activeIndex: number;
  onSelect?: (slug: ProvinceSlug) => void;
  lite: boolean;
}) {
  const mesh = useRef<Mesh>(null);
  const province = SOUTH_AFRICA_PROVINCES[index];
  const angle = (index / SOUTH_AFRICA_PROVINCES.length) * Math.PI * 2;
  const radiusX = 4.45;
  const radiusZ = 3.3;
  const isActive = index === activeIndex;

  useFrame((state) => {
    if (!mesh.current || !isActive) return;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 2.2) * 0.1;
    mesh.current.scale.setScalar(pulse);
  });

  return (
    <mesh
      ref={mesh}
      position={[Math.cos(angle) * radiusX, 0.16, Math.sin(angle) * radiusZ]}
      onClick={(event) => {
        event.stopPropagation();
        onSelect?.(province.slug);
      }}
    >
      <sphereGeometry args={[isActive ? 0.17 : 0.09, lite ? 8 : 14, lite ? 8 : 14]} />
      <meshStandardMaterial
        color={isActive ? '#f5c542' : '#39d98a'}
        emissive={isActive ? '#7a5a00' : '#0b4d31'}
        emissiveIntensity={isActive ? 1.1 : 0.3}
        roughness={0.5}
      />
    </mesh>
  );
}

function ArenaWorld({
  activeIndex,
  weatherCode,
  temperature,
  wind,
  footballReady,
  animate,
  lite,
  full,
  onProvinceSelect,
}: {
  activeIndex: number;
  weatherCode: number | null;
  temperature: number | null;
  wind: number | null;
  footballReady: boolean;
  animate: boolean;
  lite: boolean;
  full: boolean;
  onProvinceSelect?: (slug: ProvinceSlug) => void;
}) {
  const root = useRef<Group>(null);
  const rainLike = weatherCode != null && weatherCode >= 51;
  const heat = temperature == null ? 0.5 : Math.min(1, Math.max(0, (temperature - 8) / 28));
  const windEnergy = wind == null ? 0 : Math.min(1, wind / 45);
  const activePlayer = activeIndex % 5;

  useFrame((state, delta) => {
    if (!root.current || !animate) return;
    root.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.11) * (0.015 + windEnergy * 0.012);
    root.current.position.y = Math.sin(state.clock.elapsedTime * 0.42) * 0.008;
    if (!footballReady) root.current.rotation.y *= Math.max(0, 1 - delta * 0.7);
  });

  return (
    <group ref={root}>
      <ambientLight intensity={rainLike ? 0.55 : 0.78} />
      <hemisphereLight args={['#d7ecff', '#132219', rainLike ? 0.55 : 0.8]} />
      <directionalLight
        position={[3.5, 6.5, 3]}
        intensity={1.15 + heat * 0.65}
        castShadow={full}
      />
      {full ? <pointLight position={[0, 4.2, 0]} intensity={footballReady ? 0.75 : 0.3} color="#ffe7a1" /> : null}

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[PITCH_LENGTH, PITCH_WIDTH, 1, 1]} />
        <meshStandardMaterial
          color={rainLike ? '#174f34' : '#1f6a3c'}
          roughness={rainLike ? 0.72 : 0.92}
          metalness={rainLike ? 0.08 : 0.01}
        />
      </mesh>
      <mesh position={[0, -0.035, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[9.8, 7.15]} />
        <meshStandardMaterial color="#050a08" roughness={0.98} />
      </mesh>

      <PitchMarkings lite={lite} />
      <Goal side={-1} lite={lite} />
      <Goal side={1} lite={lite} />
      <Stands lite={lite} />

      {TEAM_A.map((position, index) => (
        <Player
          key={`home-${index}`}
          position={position}
          team="home"
          index={index}
          active={index === activePlayer}
          animate={animate && footballReady}
          lite={lite}
        />
      ))}
      {TEAM_B.map((position, index) => (
        <Player
          key={`away-${index}`}
          position={position}
          team="away"
          index={index}
          active={index === (activePlayer + 2) % 5}
          animate={animate && footballReady}
          lite={lite}
        />
      ))}
      <Ball animate={animate} ready={footballReady} lite={lite} />

      {!lite ? (
        <>
          <Floodlight x={-4.15} z={-2.65} lite={lite} />
          <Floodlight x={4.15} z={-2.65} lite={lite} />
          <Floodlight x={-4.15} z={2.65} lite={lite} />
          <Floodlight x={4.15} z={2.65} lite={lite} />
        </>
      ) : null}

      {SOUTH_AFRICA_PROVINCES.map((province, index) => (
        <ProvinceNode
          key={province.slug}
          index={index}
          activeIndex={activeIndex}
          onSelect={onProvinceSelect}
          lite={lite}
        />
      ))}

      {full && footballReady ? (
        <Sparkles count={28} scale={[8.8, 3.4, 6]} size={1.3} speed={0.18} opacity={0.22} color="#f5c542" />
      ) : null}
    </group>
  );
}

function StaticArenaFallback({ provinceLabel }: { provinceLabel: string }) {
  return (
    <div
      className="relative grid min-h-64 place-items-center overflow-hidden rounded-[2rem] border border-white/10 bg-[#050908] p-6 text-center"
      data-experience-tier="static"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 aspect-[1.62/1] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/30 bg-green-950/35">
        <div className="absolute inset-y-0 left-1/2 border-l border-white/25" />
        <div className="absolute left-1/2 top-1/2 h-[30%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25" />
        <div className="absolute inset-y-[24%] left-0 w-[18%] border-y border-r border-white/20" />
        <div className="absolute inset-y-[24%] right-0 w-[18%] border-y border-l border-white/20" />
      </div>
      <div className="relative z-10 max-w-sm rounded-2xl border border-white/10 bg-black/65 p-4 backdrop-blur">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-green-300">
          {provinceLabel} · adaptive static arena
        </p>
        <p className="mt-2 text-sm leading-6 text-gray-300">
          Locality and football state stay available without forcing WebGL or continuous motion.
        </p>
      </div>
    </div>
  );
}

export default function LocalityScene({
  provinceSlug,
  weatherCode,
  temperature,
  wind,
  condition,
  footballReady,
  headline,
  onProvinceSelect,
}: {
  provinceSlug: string;
  weatherCode: number | null;
  temperature: number | null;
  wind: number | null;
  condition: string | null;
  footballReady: boolean;
  headline: string | null;
  onProvinceSelect?: (slug: string) => void;
}) {
  const [profile, setProfile] = useState<ExperienceProfile>({
    tier: 'static',
    runThreeJs: false,
    runPhysics: false,
    maxDpr: 1,
    targetFps: 0,
    reason: ['hydrating'],
  });

  useEffect(() => {
    const update = () => setProfile(detectProfile());
    update();
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    document.addEventListener('visibilitychange', update);
    media.addEventListener?.('change', update);
    return () => {
      document.removeEventListener('visibilitychange', update);
      media.removeEventListener?.('change', update);
    };
  }, []);

  const activeIndex = useMemo(() => {
    const index = SOUTH_AFRICA_PROVINCES.findIndex(
      (province) => province.slug === provinceSlug,
    );
    return index >= 0 ? index : 0;
  }, [provinceSlug]);

  const province = useMemo(() => getProvinceBySlug(provinceSlug), [provinceSlug]);
  const lite = profile.tier === 'lite';
  const full = profile.tier === 'full';
  const animate = profile.runThreeJs && profile.targetFps > 0;
  const selectProvince = onProvinceSelect
    ? (slug: ProvinceSlug) => onProvinceSelect(slug)
    : undefined;

  if (!profile.runThreeJs) {
    return <StaticArenaFallback provinceLabel={province.label} />;
  }

  return (
    <div
      className="relative min-h-[21rem] overflow-hidden rounded-[2rem] border border-white/10 bg-[#050908] shadow-[0_28px_90px_rgba(0,0,0,0.38)]"
      data-experience-tier={profile.tier}
      data-football-ready={footballReady ? 'true' : 'false'}
    >
      <Canvas
        dpr={[1, profile.maxDpr]}
        camera={{ position: [0, 6.4, 7.25], fov: 43 }}
        shadows={full}
        frameloop={animate ? 'always' : 'demand'}
      >
        <ArenaWorld
          activeIndex={activeIndex}
          weatherCode={weatherCode}
          temperature={temperature}
          wind={wind}
          footballReady={footballReady}
          animate={animate}
          lite={lite}
          full={full}
          onProvinceSelect={selectProvince}
        />
        {!lite ? (
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={0.62}
            maxPolarAngle={1.12}
            minAzimuthAngle={-0.42}
            maxAzimuthAngle={0.42}
            target={[0, 0.25, 0]}
          />
        ) : null}
      </Canvas>

      <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-3 sm:inset-x-4 sm:top-4">
        <div className="max-w-[72%] rounded-2xl border border-white/10 bg-black/70 px-3 py-2.5 backdrop-blur-md sm:px-4">
          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-green-300">
            Locality state · {profile.tier} lane
          </p>
          <p className="mt-1 text-sm font-black uppercase text-white sm:text-base">
            {province.label}
          </p>
          <p className="mt-1 line-clamp-1 text-[10px] text-gray-300 sm:text-xs">
            {condition || 'Condition pending'}{temperature != null ? ` · ${temperature}°C` : ''}{wind != null ? ` · ${wind} km/h wind` : ''}
          </p>
        </div>
        <div className={`rounded-full border px-3 py-2 text-[8px] font-black uppercase tracking-[0.16em] backdrop-blur-md ${footballReady ? 'border-green-300/30 bg-green-300/12 text-green-200' : 'border-amber-300/30 bg-amber-300/12 text-amber-100'}`}>
          {footballReady ? 'Play ready' : 'Watch conditions'}
        </div>
      </div>

      {headline ? (
        <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-2xl border border-white/10 bg-black/72 px-3 py-2.5 backdrop-blur-md sm:inset-x-4 sm:bottom-4 sm:px-4">
          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-yellow-300">Local feed entering the arena</p>
          <p className="mt-1 line-clamp-1 text-xs font-bold text-white sm:text-sm">{headline}</p>
        </div>
      ) : null}
    </div>
  );
}
