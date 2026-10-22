import { MeteorEntity, MeteorType, Vector2D } from "../types/game";
import { METEOR_CONFIGS } from "../config/constants";

let nextMeteorId = 1;

function generateAsteroidVertices(radius: number, numPoints: number = 10): Vector2D[] {
  const vertices: Vector2D[] = [];
  const angleStep = (Math.PI * 2) / numPoints;

  for (let i = 0; i < numPoints; i++) {
    const angle = i * angleStep;
    // Variance between 0.75 and 1.25 radius
    const variance = 0.8 + Math.random() * 0.4;
    const r = radius * variance;
    vertices.push({
      x: Math.cos(angle) * r,
      y: Math.sin(angle) * r,
    });
  }

  return vertices;
}

export function createMeteor(
  type: MeteorType,
  x: number,
  y: number,
  targetX?: number,
  targetY?: number,
  customVelocity?: Vector2D
): MeteorEntity {
  const config = METEOR_CONFIGS[type];
  const numVertices = type === "large" ? 14 : type === "medium" ? 10 : 8;
  const vertices = generateAsteroidVertices(config.radius, numVertices);

  let vx = 0;
  let vy = 0;

  if (customVelocity) {
    vx = customVelocity.x;
    vy = customVelocity.y;
  } else if (targetX !== undefined && targetY !== undefined) {
    const dx = targetX - x;
    const dy = targetY - y;
    const dist = Math.hypot(dx, dy) || 1;
    const speed = config.speedMin + Math.random() * (config.speedMax - config.speedMin);
    // Add small random divergence angle
    const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.4;
    vx = Math.cos(angle) * speed;
    vy = Math.sin(angle) * speed;
  } else {
    const angle = Math.random() * Math.PI * 2;
    const speed = config.speedMin + Math.random() * (config.speedMax - config.speedMin);
    vx = Math.cos(angle) * speed;
    vy = Math.sin(angle) * speed;
  }

  return {
    id: nextMeteorId++,
    type,
    x,
    y,
    vx,
    vy,
    radius: config.radius,
    hp: config.hp,
    maxHp: config.hp,
    scoreValue: config.scoreValue,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * (type === "small" ? 3.0 : 1.5),
    vertices,
    color: config.color,
    coreColor: config.coreColor,
    glowColor: config.glowColor,
    wobblePhase: Math.random() * Math.PI * 2,
  };
}

export function updateMeteor(m: MeteorEntity, dt: number): void {
  if (m.type === "pulsar" && m.wobblePhase !== undefined) {
    m.wobblePhase += dt * 4;
    // Perpendicular wobble
    const speed = Math.hypot(m.vx, m.vy) || 1;
    const perpX = -m.vy / speed;
    const perpY = m.vx / speed;
    m.x += perpX * Math.sin(m.wobblePhase) * 60 * dt;
    m.y += perpY * Math.sin(m.wobblePhase) * 60 * dt;
  }

  m.x += m.vx * dt;
  m.y += m.vy * dt;
  m.rotation += m.rotationSpeed * dt;
}

export function renderMeteor(ctx: CanvasRenderingContext2D, m: MeteorEntity) {
  ctx.save();
  ctx.translate(m.x, m.y);
  ctx.rotate(m.rotation);

  // Outer glow
  ctx.shadowColor = m.glowColor;
  ctx.shadowBlur = m.type === "pulsar" ? 18 : 10;

  // Meteor body polygon
  ctx.beginPath();
  if (m.vertices.length > 0) {
    ctx.moveTo(m.vertices[0].x, m.vertices[0].y);
    for (let i = 1; i < m.vertices.length; i++) {
      ctx.lineTo(m.vertices[i].x, m.vertices[i].y);
    }
    ctx.closePath();
  }

  // Radial fill for 3D asteroid lighting
  const radGrad = ctx.createRadialGradient(
    -m.radius * 0.3,
    -m.radius * 0.3,
    m.radius * 0.1,
    0,
    0,
    m.radius
  );
  radGrad.addColorStop(0, m.color);
  radGrad.addColorStop(0.7, m.coreColor);
  radGrad.addColorStop(1, "#030712");

  ctx.fillStyle = radGrad;
  ctx.fill();

  ctx.strokeStyle = m.color;
  ctx.lineWidth = m.type === "pulsar" ? 2.5 : 1.5;
  ctx.stroke();

  // Internal crater/fissure details
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.beginPath();
  ctx.arc(-m.radius * 0.2, m.radius * 0.25, m.radius * 0.22, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(m.radius * 0.35, -m.radius * 0.15, m.radius * 0.16, 0, Math.PI * 2);
  ctx.fill();

  // Pulsar aura ring
  if (m.type === "pulsar") {
    ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, m.radius * 1.35, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Health bar if damaged and hp > 1
  if (m.hp < m.maxHp && m.maxHp > 1) {
    const barW = m.radius * 1.6;
    const barH = 3;
    const barY = -m.radius - 8;
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(-barW / 2, barY, barW, barH);
    ctx.fillStyle = m.hp / m.maxHp > 0.4 ? "#10b981" : "#ef4444";
    ctx.fillRect(-barW / 2, barY, barW * (m.hp / m.maxHp), barH);
  }

  ctx.restore();
}

/**
 * Splits a destroyed meteor into smaller fragments if applicable
 */
export function splitMeteor(m: MeteorEntity): MeteorEntity[] {
  const fragments: MeteorEntity[] = [];

  if (m.type === "large") {
    // Splits into 2 medium meteors
    for (let i = 0; i < 2; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * 50;
      fragments.push(
        createMeteor(
          "medium",
          m.x + Math.cos(angle) * 15,
          m.y + Math.sin(angle) * 15,
          undefined,
          undefined,
          {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed,
          }
        )
      );
    }
  } else if (m.type === "medium") {
    // Splits into 2 small meteors
    for (let i = 0; i < 2; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 150 + Math.random() * 60;
      fragments.push(
        createMeteor(
          "small",
          m.x + Math.cos(angle) * 12,
          m.y + Math.sin(angle) * 12,
          undefined,
          undefined,
          {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed,
          }
        )
      );
    }
  }

  return fragments;
}
