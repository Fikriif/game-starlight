import { ParticleEntity } from "../types/game";

export interface ShockwaveRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
  speed: number;
  lineWidth: number;
}

export function createParticle(
  x: number,
  y: number,
  vx: number,
  vy: number,
  radius: number,
  color: string,
  life: number,
  glow: boolean = true
): ParticleEntity {
  return {
    x,
    y,
    vx,
    vy,
    radius,
    color,
    alpha: 1.0,
    life,
    maxLife: life,
    glow,
  };
}

export function createMuzzleFlashParticles(
  x: number,
  y: number,
  angle: number,
  color: string = "#00f0ff"
): ParticleEntity[] {
  const particles: ParticleEntity[] = [];
  const count = 5;

  for (let i = 0; i < count; i++) {
    const spread = (Math.random() - 0.5) * 0.5;
    const pAngle = angle + spread;
    const speed = 120 + Math.random() * 140;
    particles.push(
      createParticle(
        x,
        y,
        Math.cos(pAngle) * speed,
        Math.sin(pAngle) * speed,
        1.8 + Math.random() * 1.5,
        Math.random() > 0.3 ? color : "#ffffff",
        0.1 + Math.random() * 0.08,
        true
      )
    );
  }

  return particles;
}

export function createExplosionParticles(
  x: number,
  y: number,
  count: number = 20,
  baseColor: string = "#f59e0b",
  coreColor: string = "#ffffff"
): ParticleEntity[] {
  const particles: ParticleEntity[] = [];

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 40 + Math.random() * 220;
    const radius = 1.5 + Math.random() * 3.5;
    const life = 0.35 + Math.random() * 0.45;
    const color = Math.random() > 0.4 ? baseColor : coreColor;

    particles.push(
      createParticle(
        x,
        y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        radius,
        color,
        life,
        true
      )
    );
  }

  return particles;
}

export function createLaserImpactParticles(
  x: number,
  y: number,
  color: string = "#00f0ff"
): ParticleEntity[] {
  const particles: ParticleEntity[] = [];
  const count = 6;

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 60 + Math.random() * 120;
    particles.push(
      createParticle(
        x,
        y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        1.5 + Math.random() * 1.5,
        color,
        0.2 + Math.random() * 0.2,
        true
      )
    );
  }

  return particles;
}

export function createThrusterParticle(
  x: number,
  y: number,
  angle: number
): ParticleEntity {
  const spread = (Math.random() - 0.5) * 0.4;
  const thrusterAngle = angle + Math.PI + spread;
  const speed = 70 + Math.random() * 90;
  const colors = ["#00f0ff", "#38bdf8", "#a855f7", "#ffffff"];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return createParticle(
    x,
    y,
    Math.cos(thrusterAngle) * speed,
    Math.sin(thrusterAngle) * speed,
    2 + Math.random() * 2,
    color,
    0.22 + Math.random() * 0.18,
    true
  );
}

export function updateParticle(p: ParticleEntity, dt: number): boolean {
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  p.vx *= 0.94;
  p.vy *= 0.94;
  p.life -= dt;
  p.alpha = Math.max(0, p.life / p.maxLife);
  return p.life > 0;
}

export function renderParticle(ctx: CanvasRenderingContext2D, p: ParticleEntity) {
  ctx.save();
  ctx.globalAlpha = p.alpha;
  if (p.glow) {
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 8;
  }
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.radius * p.alpha, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
