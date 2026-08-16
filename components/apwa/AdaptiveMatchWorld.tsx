'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Mesh } from 'three';
import { DEFAULT_PHYSICS, stepBall, type BallState } from '@/lib/apwa/physics';
import { getExperienceProfile, type ExperienceProfile } from '@/lib/apwa/runtime';

function detectProfile(): ExperienceProfile {
  if (typeof window === 'undefined') {
    return { tier: 'static', runThreeJs: false, runPhysics: false, maxDpr: 1, targetFps: 0, reason: ['server-render'] };
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

function Ball({ enabled }: { enabled: boolean }) {
  const mesh = useRef<Mesh>(null);
  const state = useRef<BallState>({ x: 0, y: 0, vx: 2.4, vy: 1.3 });
  const accumulator = useRef(0);

  useFrame((_, delta) => {
    if (!enabled || !mesh.current) return;
    accumulator.current += Math.min(delta, 0.1);
    while (accumulator.current >= DEFAULT_PHYSICS.fixedStepSeconds) {
      state.current = stepBall(state.current);
      accumulator.current -= DEFAULT_PHYSICS.fixedStepSeconds;
    }
    mesh.current.position.x = state.current.x;
    mesh.current.position.z = state.current.y;
  });

  return (
    <mesh ref={mesh} position={[0, 0.32, 0]} castShadow>
      <sphereGeometry args={[0.28, 24, 24]} />
      <meshStandardMaterial color="#f4f4f4" roughness={0.72} />
    </mesh>
  );
}

function Court({ runPhysics }: { runPhysics: boolean }) {
  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[2, 6, 3]} intensity={2.2} castShadow />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 6]} />
        <meshStandardMaterial color="#175f3a" roughness={0.95} />
      </mesh>
      <Ball enabled={runPhysics} />
    </>
  );
}

export default function AdaptiveMatchWorld() {
  const [profile, setProfile] = useState<ExperienceProfile>(() => ({
    tier: 'static', runThreeJs: false, runPhysics: false, maxDpr: 1, targetFps: 0, reason: ['hydrating'],
  }));

  useEffect(() => {
    const update = () => setProfile(detectProfile());
    update();
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  const label = useMemo(() => profile.reason.length ? profile.reason.join(', ') : 'capability budget healthy', [profile.reason]);

  return (
    <section aria-labelledby="apwa-world-title" style={{ display: 'grid', gap: 16 }}>
      <div>
        <p style={{ margin: 0, opacity: 0.72, textTransform: 'uppercase', letterSpacing: '.12em' }}>APWA runtime proof</p>
        <h2 id="apwa-world-title" style={{ margin: '6px 0' }}>Adaptive match world</h2>
        <p style={{ margin: 0 }}>Tier: <strong>{profile.tier}</strong> · Three.js: {profile.runThreeJs ? 'on' : 'off'} · deterministic physics: {profile.runPhysics ? 'on' : 'off'} · {label}</p>
      </div>

      {profile.runThreeJs ? (
        <div style={{ minHeight: 360, borderRadius: 24, overflow: 'hidden', background: '#0d2118' }} data-experience-tier={profile.tier}>
          <Canvas dpr={[1, profile.maxDpr]} camera={{ position: [0, 6.5, 6.8], fov: 50 }} shadows={profile.tier === 'full'}>
            <Court runPhysics={profile.runPhysics} />
          </Canvas>
        </div>
      ) : (
        <div role="img" aria-label="Static five-a-side court fallback" style={{ minHeight: 280, borderRadius: 24, display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#123724,#1f6b42)', color: 'white', padding: 24 }}>
          <div style={{ border: '2px solid rgba(255,255,255,.8)', width: '80%', height: 180, display: 'grid', placeItems: 'center' }}>
            <strong>5s Arena · static court fallback</strong>
          </div>
        </div>
      )}
    </section>
  );
}
