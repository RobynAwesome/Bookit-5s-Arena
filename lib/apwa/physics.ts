export interface BallState {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface PhysicsConfig {
  fixedStepSeconds: number;
  dragPerSecond: number;
  restitution: number;
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
}

export const DEFAULT_PHYSICS: PhysicsConfig = {
  fixedStepSeconds: 1 / 60,
  dragPerSecond: 0.42,
  restitution: 0.78,
  bounds: { minX: -4.5, maxX: 4.5, minY: -2.5, maxY: 2.5 },
};

export function stepBall(state: BallState, config: PhysicsConfig = DEFAULT_PHYSICS): BallState {
  const dt = config.fixedStepSeconds;
  const drag = Math.max(0, 1 - config.dragPerSecond * dt);
  let vx = state.vx * drag;
  let vy = state.vy * drag;
  let x = state.x + vx * dt;
  let y = state.y + vy * dt;

  if (x < config.bounds.minX) {
    x = config.bounds.minX;
    vx = Math.abs(vx) * config.restitution;
  } else if (x > config.bounds.maxX) {
    x = config.bounds.maxX;
    vx = -Math.abs(vx) * config.restitution;
  }

  if (y < config.bounds.minY) {
    y = config.bounds.minY;
    vy = Math.abs(vy) * config.restitution;
  } else if (y > config.bounds.maxY) {
    y = config.bounds.maxY;
    vy = -Math.abs(vy) * config.restitution;
  }

  return { x, y, vx, vy };
}

export function simulateBall(initial: BallState, steps: number, config: PhysicsConfig = DEFAULT_PHYSICS): BallState {
  if (!Number.isInteger(steps) || steps < 0) throw new Error('steps must be a non-negative integer');
  let state = initial;
  for (let i = 0; i < steps; i += 1) state = stepBall(state, config);
  return state;
}
