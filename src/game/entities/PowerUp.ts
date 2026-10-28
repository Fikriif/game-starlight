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

  // Blink in the last 3 seconds of life
  const remainingLife = p.maxLife - p.age;
  let alpha = 1.0;
  if (remainingLife < 3) {
    alpha = Math.sin(p.age * 16) > 0 ? 0.9 : 0.25;
  }
  ctx.globalAlpha = alpha;

  // Outer glowing aura (restrained)
  ctx.shadowColor = p.glowColor;
  ctx.shadowBlur = 10;

  // Hexagonal container canister
  ctx.fillStyle = "rgba(4, 8, 22, 0.92)";
  ctx.strokeStyle = p.color;
  ctx.lineWidth = 1.8;

  ctx.beginPath();
  const sides = 6;
  const rot = p.age * 1.2;
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

  // Internal subtle technical ring
  ctx.beginPath();
  ctx.arc(0, 0, p.radius * 0.72, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Reset shadow for crisp vector glyph rendering
  ctx.shadowBlur = 0;
  ctx.fillStyle = p.color;
  ctx.strokeStyle = p.color;

  // Custom procedural vector glyphs based on type (no emoji)
  switch (p.type) {
    case "rapid_fire": {
      // Crisp twin lightning bolts
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      // Bolt 1
      ctx.moveTo(-1, -7);
      ctx.lineTo(-5, 0);
      ctx.lineTo(-2, 0);
      ctx.lineTo(-4, 7);
      ctx.lineTo(2, -1);
      ctx.lineTo(-1, -1);
      ctx.closePath();
      ctx.fill();

      // Bolt 2
      ctx.beginPath();
      ctx.moveTo(3, -5);
      ctx.lineTo(1, 0);
      ctx.lineTo(4, 0);
      ctx.lineTo(2, 6);
      ctx.lineTo(7, -1);
      ctx.lineTo(4, -1);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case "spread_shot": {
      // Tri-beam directional vector spread
      ctx.lineWidth = 2.0;
      ctx.lineCap = "round";
      ctx.beginPath();
      // Center beam
      ctx.moveTo(0, 6);
      ctx.lineTo(0, -7);
      // Left beam
      ctx.moveTo(-2, 5);
      ctx.lineTo(-7, -5);
      // Right beam
      ctx.moveTo(2, 5);
      ctx.lineTo(7, -5);
      ctx.stroke();

      // Arrowhead caps
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(0, -7, 1.8, 0, Math.PI * 2);
      ctx.arc(-7, -5, 1.8, 0, Math.PI * 2);
      ctx.arc(7, -5, 1.8, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case "energy_shield": {
      // Hexagonal forcefield shield emblem
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(0, -7);
      ctx.lineTo(6, -3);
      ctx.lineTo(6, 4);
      ctx.lineTo(0, 8);
      ctx.lineTo(-6, 4);
      ctx.lineTo(-6, -3);
      ctx.closePath();
      ctx.stroke();

      // Inner core node
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case "repair_core": {
      // Tactical medical / nanite cross
      ctx.beginPath();
      const s = 3;
      const l = 7;
      ctx.moveTo(-s, -l);
      ctx.lineTo(s, -l);
      ctx.lineTo(s, -s);
      ctx.lineTo(l, -s);
      ctx.lineTo(l, s);
      ctx.lineTo(s, s);
      ctx.lineTo(s, l);
      ctx.lineTo(-s, l);
      ctx.lineTo(-s, s);
      ctx.lineTo(-l, s);
      ctx.lineTo(-l, -s);
      ctx.lineTo(-s, -s);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case "score_multiplier": {
      // Stylized "2X" tactical badge
      ctx.font = "bold 11px monospace, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffffff";
      ctx.fillText("2X", 0, 0);
      break;
    }

    case "nova_burst": {
      // 8-point shockwave starburst
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        const r1 = i % 2 === 0 ? 8 : 4;
        const px = Math.cos(a) * r1;
        const py = Math.sin(a) * r1;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(0, 0, 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }

  ctx.restore();
}
