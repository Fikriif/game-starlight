import { ProjectileEntity } from "../types/game";
import { PLAYER_CONFIG } from "../config/constants";

let nextProjectileId = 1;

export function createProjectile(
  x: number,
  y: number,
  angle: number,
  damage: number = PLAYER_CONFIG.PROJECTILE_DAMAGE,
  color: string = "#00f0ff",
  glowColor: string = "rgba(0, 240, 255, 0.7)"
): ProjectileEntity {
  const speed = PLAYER_CONFIG.PROJECTILE_SPEED;
  return {
    id: nextProjectileId++,
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius: PLAYER_CONFIG.PROJECTILE_RADIUS,
    damage,
    color,
    glowColor,
    life: 1.8, // seconds before timeout
  };
}

export function updateProjectile(p: ProjectileEntity, dt: number): boolean {
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  p.life -= dt;
  return p.life > 0;
}

export function renderProjectile(ctx: CanvasRenderingContext2D, p: ProjectileEntity) {
  ctx.save();
  ctx.shadowColor = p.glowColor;
  ctx.shadowBlur = 10;

  // Projectile trail
  const trailLen = 14;
  const speed = Math.hypot(p.vx, p.vy) || 1;
  const nx = p.vx / speed;
  const ny = p.vy / speed;

  const grad = ctx.createLinearGradient(p.x, p.y, p.x - nx * trailLen, p.y - ny * trailLen);
  grad.addColorStop(0, p.color);
  grad.addColorStop(1, "transparent");

  ctx.strokeStyle = grad;
  ctx.lineWidth = p.radius * 2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(p.x - nx * trailLen, p.y - ny * trailLen);
  ctx.stroke();

  // Bright core
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.radius * 0.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
