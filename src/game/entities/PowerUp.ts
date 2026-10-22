import { PowerUpEntity, PowerUpType } from "../types/game";
import { POWER_UP_CONFIGS } from "../config/constants";

let nextPowerUpId = 1;

export function createPowerUp(type: PowerUpType, x: number, y: number): PowerUpEntity {
  const config = POWER_UP_CONFIGS[type];
  // Gentle drift velocity
  const angle = Math.random() * Math.PI * 2;
  const speed = 25 + Math.random() * 20;

  return {
    id: nextPowerUpId++,
    type,
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius: 18,
    duration: config.duration,
    color: config.color,
    glowColor: config.glowColor,
    icon: config.icon,
    age: 0,
    maxLife: 14, // stays on screen for 14 seconds if not picked up
  };
}

export function updatePowerUp(p: PowerUpEntity, dt: number): boolean {
  p.age += dt;
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  // Slow down gently
  p.vx *= 0.98;
  p.vy *= 0.98;

  return p.age < p.maxLife;
}

export function renderPowerUp(ctx: CanvasRenderingContext2D, p: PowerUpEntity) {
  ctx.save();
  ctx.translate(p.x, p.y);

  // Bobbing animation
  const bob = Math.sin(p.age * 4) * 3;
  ctx.translate(0, bob);

  // Blink in the last 3 seconds
  const remainingLife = p.maxLife - p.age;
  let alpha = 1.0;
  if (remainingLife < 3) {
    alpha = Math.sin(p.age * 16) > 0 ? 0.9 : 0.3;
  }
  ctx.globalAlpha = alpha;

  // Outer glowing aura
  ctx.shadowColor = p.glowColor;
  ctx.shadowBlur = 14;

  // Container pill / diamond
  ctx.fillStyle = "rgba(7, 11, 30, 0.85)";
  ctx.strokeStyle = p.color;
  ctx.lineWidth = 2;

  // Hexagonal shape
  ctx.beginPath();
  const sides = 6;
  const rot = p.age * 1.5;
  for (let i = 0; i < sides; i++) {
    const a = rot + (i * Math.PI * 2) / sides;
    const px = Math.cos(a) * p.radius;
    const py = Math.sin(a) * p.radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Internal orbital ring
  ctx.beginPath();
  ctx.arc(0, 0, p.radius * 0.65, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Icon symbol rendering
  ctx.shadowBlur = 0;
  ctx.font = "14px 'Segoe UI Emoji', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(p.icon, 0, 1);

  ctx.restore();
}
