import { MeteorEntity, MeteorType, Vector2D } from "../types/game";
import { METEOR_CONFIGS } from "../config/constants";

let nextMeteorId = 1;

export function resetMeteorIdCounter() {
  nextMeteorId = 1;
}

function generateAsteroidVertices(radius: number, numPoints: number = 10, varianceRange: [number, number] = [0.8, 0.4]): Vector2D[] {
  const vertices: Vector2D[] = [];
  const angleStep = (Math.PI * 2) / numPoints;

  for (let i = 0; i < numPoints; i++) {
    const angle = i * angleStep;
    const variance = varianceRange[0] + Math.random() * varianceRange[1];
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
  customVelocity?: Vector2D,
  generation: number = 0
): MeteorEntity {
  const config = METEOR_CONFIGS[type] || METEOR_CONFIGS.standard;

  let numVertices = 10;
  let variance: [number, number] = [0.8, 0.4];

  if (type === "heavy" || type === "large") {
    numVertices = 14;
    variance = [0.75, 0.45];
  } else if (type === "speed") {
    numVertices = 8;
    variance = [0.85, 0.3];
  } else if (type === "splitting") {
    numVertices = 11;
    variance = [0.8, 0.35];
  } else if (type === "splitting_fragment" || type === "small") {
    numVertices = 7;
    variance = [0.82, 0.36];
  } else if (type === "explosive") {
    numVertices = 10;
    variance = [0.78, 0.4];
  } else if (type === "drifting") {
    numVertices = 9;
    variance = [0.8, 0.38];
  }

  const vertices = generateAsteroidVertices(config.radius, numVertices, variance);

  let vx = 0;
  let vy = 0;
  let speed = config.speedMin + Math.random() * (config.speedMax - config.speedMin);

  if (customVelocity) {
    vx = customVelocity.x;
    vy = customVelocity.y;
    speed = Math.hypot(vx, vy) || speed;
  } else if (targetX !== undefined && targetY !== undefined) {
    const dx = targetX - x;
    const dy = targetY - y;
    const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.35;
    vx = Math.cos(angle) * speed;
    vy = Math.sin(angle) * speed;
  } else {
    const angle = Math.random() * Math.PI * 2;
    vx = Math.cos(angle) * speed;
    vy = Math.sin(angle) * speed;
  }

  const rotationSpeed =
    (Math.random() - 0.5) * (type === "speed" ? 3.5 : type === "heavy" ? 0.9 : 1.8);

  const meteor: MeteorEntity = {
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
    rotationSpeed,
    vertices,
    color: config.color,
    coreColor: config.coreColor,
    glowColor: config.glowColor,
    baseSpeed: speed,
    baseVx: vx,
    baseVy: vy,
    trailTimer: 0,
    hasAwardedScore: false,
  };

  // Specific variant configurations
  if (type === "speed") {
    meteor.burstCooldownTimer = 2.2 + Math.random() * 1.5;
    meteor.burstChargeTimer = 0;
    meteor.burstActiveTimer = 0;
    meteor.isChargingBurst = false;
    meteor.isBursting = false;
  } else if (type === "splitting") {
    meteor.canSplit = true;
    meteor.hasSplit = false;
    meteor.generation = generation;
  } else if (type === "splitting_fragment") {
    meteor.canSplit = false;
    meteor.hasSplit = true;
    meteor.generation = generation;
  } else if (type === "explosive") {
    const cfg = config as typeof METEOR_CONFIGS.explosive;
    meteor.fuseTimer = cfg.fuseDuration || 6.5;
    meteor.maxFuse = cfg.fuseDuration || 6.5;
    meteor.explosionRadius = cfg.explosionRadius || 115;
    meteor.hasExploded = false;
    meteor.warningPulsePhase = 0;
  } else if (type === "drifting") {
    const cfg = config as typeof METEOR_CONFIGS.drifting;
    meteor.driftPhase = Math.random() * Math.PI * 2;
    meteor.driftFrequency = cfg.driftFrequency || 2.2;
    meteor.driftAmplitude = cfg.driftAmplitude || 85;
  } else if (type === "pulsar") {
    meteor.wobblePhase = Math.random() * Math.PI * 2;
  }

  return meteor;
}

export interface MeteorUpdateCallbacks {
  onSpeedWarning?: (m: MeteorEntity) => void;
  onSpeedBurst?: (m: MeteorEntity) => void;
  onExplosionWarning?: (m: MeteorEntity) => void;
  onEmitTrail?: (x: number, y: number, color: string, radius: number) => void;
}

export function updateMeteor(
  m: MeteorEntity,
  dt: number,
  callbacks?: MeteorUpdateCallbacks
): void {
  // Speed Meteor Behavior
  if (m.type === "speed") {
    if (!m.isBursting && !m.isChargingBurst) {
      if (m.burstCooldownTimer !== undefined) {
        m.burstCooldownTimer -= dt;
        if (m.burstCooldownTimer <= 0.5) {
          m.isChargingBurst = true;
          m.burstChargeTimer = 0.5;
          callbacks?.onSpeedWarning?.(m);
        }
      }
    } else if (m.isChargingBurst) {
      if (m.burstChargeTimer !== undefined) {
        m.burstChargeTimer -= dt;
        if (m.burstChargeTimer <= 0) {
          m.isChargingBurst = false;
          m.isBursting = true;
          m.burstActiveTimer = 0.8;
          const burstSpeedMult = 1.65;
          m.vx = (m.baseVx || m.vx) * burstSpeedMult;
          m.vy = (m.baseVy || m.vy) * burstSpeedMult;
          callbacks?.onSpeedBurst?.(m);
        }
      }
    } else if (m.isBursting) {
      if (m.burstActiveTimer !== undefined) {
        m.burstActiveTimer -= dt;
        const burstSpeedMult = 1.65;
        m.vx = (m.baseVx || m.vx) * burstSpeedMult;
        m.vy = (m.baseVy || m.vy) * burstSpeedMult;

        if (m.burstActiveTimer <= 0) {
          m.isBursting = false;
          m.vx = m.baseVx || m.vx;
          m.vy = m.baseVy || m.vy;
          m.burstCooldownTimer = 2.8 + Math.random() * 1.4;
        }
      }
    }

    // Cyan movement trail
    m.trailTimer = (m.trailTimer || 0) + dt;
    const trailInterval = m.isBursting ? 0.025 : 0.055;
    if (m.trailTimer >= trailInterval) {
      m.trailTimer = 0;
      callbacks?.onEmitTrail?.(
        m.x - (m.vx * 0.04),
        m.y - (m.vy * 0.04),
        m.isBursting ? "#22d3ee" : "#06b6d4",
        m.isBursting ? 3.2 : 2.0
      );
    }
  }

  // Drifting Meteor Behavior (Smooth, bounded steering curve)
  if (m.type === "drifting") {
    m.driftPhase = (m.driftPhase || 0) + dt * (m.driftFrequency || 2.2);
    const speed = Math.hypot(m.vx, m.vy) || 1;
    const perpX = -m.vy / speed;
    const perpY = m.vx / speed;
    const lateralShift = Math.sin(m.driftPhase) * (m.driftAmplitude || 85) * dt;

    m.x += perpX * lateralShift;
    m.y += perpY * lateralShift;

    // Magenta trail
    m.trailTimer = (m.trailTimer || 0) + dt;
    if (m.trailTimer >= 0.065) {
      m.trailTimer = 0;
      callbacks?.onEmitTrail?.(
        m.x - (m.vx * 0.03),
        m.y - (m.vy * 0.03),
        "#ec4899",
        2.2
      );
    }
  }

  // Explosive Meteor Behavior (Fuse countdown & warning pulse)
  if (m.type === "explosive" && !m.hasExploded) {
    if (m.fuseTimer !== undefined) {
      const prevFuse = m.fuseTimer;
      m.fuseTimer = Math.max(0, m.fuseTimer - dt);

      // Warning pulse accelerates as detonation nears
      const pulseRate = m.fuseTimer < 1.5 ? 16 : m.fuseTimer < 3.0 ? 9 : 4;
      m.warningPulsePhase = (m.warningPulsePhase || 0) + dt * pulseRate;

      // Audio warning tick thresholds
      if (
        (prevFuse > 2.0 && m.fuseTimer <= 2.0) ||
        (prevFuse > 1.0 && m.fuseTimer <= 1.0) ||
        (prevFuse > 0.5 && m.fuseTimer <= 0.5)
      ) {
        callbacks?.onExplosionWarning?.(m);
      }
    }

    // Warm magma spark trail
    m.trailTimer = (m.trailTimer || 0) + dt;
    if (m.trailTimer >= 0.08) {
      m.trailTimer = 0;
      callbacks?.onEmitTrail?.(
        m.x,
        m.y,
        "#f87171",
        1.8
      );
    }
  }

  // Standard Meteor Debris Trail
  if (m.type === "standard") {
    m.trailTimer = (m.trailTimer || 0) + dt;
    if (m.trailTimer >= 0.12) {
      m.trailTimer = 0;
      callbacks?.onEmitTrail?.(
        m.x - (m.vx * 0.03),
        m.y - (m.vy * 0.03),
        Math.random() > 0.5 ? "#f97316" : "#ea580c",
        1.6
      );
    }
  }

  // Heavy Meteor Stone Dust Trail
  if (m.type === "heavy") {
    m.trailTimer = (m.trailTimer || 0) + dt;
    if (m.trailTimer >= 0.14) {
      m.trailTimer = 0;
      callbacks?.onEmitTrail?.(
        m.x - (m.vx * 0.03),
        m.y - (m.vy * 0.03),
        Math.random() > 0.5 ? "#7e22ce" : "#a855f7",
        2.2
      );
    }
  }

  // Splitting Meteor & Fragment Crystal Shimmer Trail
  if (m.type === "splitting" || m.type === "splitting_fragment") {
    m.trailTimer = (m.trailTimer || 0) + dt;
    const interval = m.type === "splitting" ? 0.12 : 0.08;
    if (m.trailTimer >= interval) {
      m.trailTimer = 0;
      callbacks?.onEmitTrail?.(
        m.x - (m.vx * 0.03),
        m.y - (m.vy * 0.03),
        m.type === "splitting" ? "#10b981" : "#34d399",
        m.type === "splitting" ? 1.9 : 1.4
      );
    }
  }

  // Pulsar wobble (legacy)
  if (m.type === "pulsar" && m.wobblePhase !== undefined) {
    m.wobblePhase += dt * 4;
    const speed = Math.hypot(m.vx, m.vy) || 1;
    const perpX = -m.vy / speed;
    const perpY = m.vx / speed;
    m.x += perpX * Math.sin(m.wobblePhase) * 60 * dt;
    m.y += perpY * Math.sin(m.wobblePhase) * 60 * dt;
  }

  // Base physics integration
  m.x += m.vx * dt;
  m.y += m.vy * dt;
  m.rotation += m.rotationSpeed * dt;

  if (m.hitFlashTimer && m.hitFlashTimer > 0) {
    m.hitFlashTimer = Math.max(0, m.hitFlashTimer - dt);
  }
}

export function renderMeteor(ctx: CanvasRenderingContext2D, m: MeteorEntity) {
  // If explosive and has already detonated, skip rendering
  if (m.hasExploded) return;

  // 1. Pre-render world-space Warning Indicators (detonation radius, speed burst reticle)
  if (m.type === "explosive" && m.fuseTimer !== undefined && m.explosionRadius) {
    const pulseFactor = Math.sin(m.warningPulsePhase || 0) * 0.5 + 0.5;
    const isCritical = m.fuseTimer <= 2.0;
    const ringAlpha = isCritical ? 0.35 + pulseFactor * 0.45 : 0.15 + pulseFactor * 0.2;

    ctx.save();
    ctx.strokeStyle = isCritical ? `rgba(239, 68, 68, ${ringAlpha})` : `rgba(248, 113, 113, ${ringAlpha})`;
    ctx.lineWidth = isCritical ? 2.5 : 1.5;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.explosionRadius, 0, Math.PI * 2);
    ctx.stroke();

    // In critical phase, show blinking warning label
    if (isCritical) {
      ctx.fillStyle = "#ef4444";
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`DETONATION IN ${m.fuseTimer.toFixed(1)}s`, m.x, m.y - m.radius - 14);
    }
    ctx.restore();
  }

  if (m.type === "speed" && m.isChargingBurst) {
    ctx.save();
    // Converging cyan telegraph reticle
    const chargeProgress = Math.max(0, (m.burstChargeTimer ?? 0.5) / 0.5);
    const ringRadius = m.radius * (1.3 + chargeProgress * 1.0);
    ctx.strokeStyle = `rgba(6, 182, 212, ${0.9 - chargeProgress * 0.3})`;
    ctx.lineWidth = 2.2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(m.x, m.y, ringRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Directional acceleration chevron in velocity direction
    const burstAngle = Math.atan2(m.vy, m.vx);
    const chevDist = m.radius + 14;
    const chevTipX = m.x + Math.cos(burstAngle) * chevDist;
    const chevTipY = m.y + Math.sin(burstAngle) * chevDist;
    const chevLeftX = m.x + Math.cos(burstAngle - 2.5) * (chevDist - 8);
    const chevLeftY = m.y + Math.sin(burstAngle - 2.5) * (chevDist - 8);
    const chevRightX = m.x + Math.cos(burstAngle + 2.5) * (chevDist - 8);
    const chevRightY = m.y + Math.sin(burstAngle + 2.5) * (chevDist - 8);

    ctx.fillStyle = "#22d3ee";
    ctx.shadowColor = "#06b6d4";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(chevTipX, chevTipY);
    ctx.lineTo(chevLeftX, chevLeftY);
    ctx.lineTo(chevRightX, chevRightY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // 2. Render Meteor Body with local rotation
  ctx.save();
  ctx.translate(m.x, m.y);
  ctx.rotate(m.rotation);

  // Outer glow (restrained to prevent muddy neon haze)
  ctx.shadowColor = m.glowColor;
  let shadowBlur = 6;
  if (m.type === "speed") {
    shadowBlur = m.isBursting ? 16 : m.isChargingBurst ? 10 : 6;
  } else if (m.type === "heavy") {
    shadowBlur = 8;
  } else if (m.type === "explosive") {
    const pulse = Math.sin(m.warningPulsePhase || 0) * 4;
    shadowBlur = 8 + Math.max(0, pulse);
  } else if (m.type === "pulsar") {
    shadowBlur = 10;
  }
  ctx.shadowBlur = shadowBlur;

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

  // White hit flash overlay when damaged
  if (m.hitFlashTimer && m.hitFlashTimer > 0) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.fill();
  }

  // Border stroke
  ctx.strokeStyle = m.color;
  ctx.lineWidth = m.type === "heavy" ? 2.8 : m.type === "speed" ? 2.0 : 1.5;
  ctx.stroke();

  // Reset shadow for internal details
  ctx.shadowBlur = 0;

  // Internal visual details based on meteor variant:

  // A. Heavy Meteor: Visible damage stages with glowing energy cracks
  if (m.type === "heavy") {
    const damageRatio = Math.max(0, 1 - m.hp / m.maxHp);

    // Deep stone texture craters
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.beginPath();
    ctx.arc(-m.radius * 0.3, m.radius * 0.25, m.radius * 0.25, 0, Math.PI * 2);
    ctx.arc(m.radius * 0.3, -m.radius * 0.2, m.radius * 0.2, 0, Math.PI * 2);
    ctx.arc(m.radius * 0.1, m.radius * 0.35, m.radius * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Damage Fissure Cracks (grow wider and brighter as HP drops)
    if (damageRatio > 0) {
      const crackAlpha = 0.4 + damageRatio * 0.6;
      ctx.strokeStyle = damageRatio > 0.6 ? `rgba(244, 63, 94, ${crackAlpha})` : `rgba(192, 132, 252, ${crackAlpha})`;
      ctx.lineWidth = 1.2 + damageRatio * 2.2;
      ctx.shadowColor = damageRatio > 0.6 ? "#f43f5e" : "#c084fc";
      ctx.shadowBlur = 8;

      ctx.beginPath();
      // Primary fissure across center
      ctx.moveTo(-m.radius * 0.6, -m.radius * 0.3);
      ctx.lineTo(-m.radius * 0.1, 0);
      ctx.lineTo(m.radius * 0.5, m.radius * 0.4);

      if (damageRatio > 0.35) {
        // Secondary branching crack
        ctx.moveTo(-m.radius * 0.1, 0);
        ctx.lineTo(m.radius * 0.2, -m.radius * 0.5);
      }
      if (damageRatio > 0.7) {
        // Severe tertiary fissure
        ctx.moveTo(-m.radius * 0.35, m.radius * 0.4);
        ctx.lineTo(0, m.radius * 0.1);
        ctx.lineTo(m.radius * 0.6, -m.radius * 0.2);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  // B. Splitting Meteor: Crystalline fracture seams
  else if (m.type === "splitting") {
    ctx.strokeStyle = "rgba(110, 231, 183, 0.75)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-m.radius * 0.5, -m.radius * 0.5);
    ctx.lineTo(0, 0);
    ctx.lineTo(m.radius * 0.6, -m.radius * 0.2);
    ctx.moveTo(0, 0);
    ctx.lineTo(m.radius * 0.2, m.radius * 0.6);
    ctx.stroke();

    // Crystalline facets
    ctx.fillStyle = "rgba(16, 185, 129, 0.35)";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-m.radius * 0.4, m.radius * 0.3);
    ctx.lineTo(m.radius * 0.3, m.radius * 0.4);
    ctx.closePath();
    ctx.fill();
  }

  // B2. Splitting Fragment: Distinct sharp crystalline shard
  else if (m.type === "splitting_fragment") {
    ctx.strokeStyle = "rgba(52, 211, 153, 0.85)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-m.radius * 0.5, 0);
    ctx.lineTo(0, -m.radius * 0.6);
    ctx.lineTo(m.radius * 0.5, 0);
    ctx.lineTo(0, m.radius * 0.6);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = "rgba(52, 211, 153, 0.35)";
    ctx.fill();
  }

  // C. Explosive Meteor: Volatile magma core
  else if (m.type === "explosive") {
    const pulse = Math.sin(m.warningPulsePhase || 0);
    const coreR = m.radius * (0.35 + pulse * 0.1);

    ctx.fillStyle = pulse > 0 ? "#fef08a" : "#ef4444";
    ctx.shadowColor = "#ef4444";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(3, coreR), 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Glowing fissures
    ctx.strokeStyle = "rgba(254, 240, 138, 0.7)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(0, -coreR);
    ctx.lineTo(0, -m.radius * 0.75);
    ctx.moveTo(coreR, 0);
    ctx.lineTo(m.radius * 0.75, 0);
    ctx.moveTo(0, coreR);
    ctx.lineTo(0, m.radius * 0.75);
    ctx.moveTo(-coreR, 0);
    ctx.lineTo(-m.radius * 0.75, 0);
    ctx.stroke();
  }

  // D. Speed Meteor: Aerodynamic energy streaks
  else if (m.type === "speed") {
    ctx.fillStyle = m.isBursting ? "rgba(34, 211, 238, 0.85)" : "rgba(6, 182, 212, 0.5)";
    ctx.beginPath();
    ctx.ellipse(0, 0, m.radius * 0.7, m.radius * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Streamline velocity axis
    ctx.strokeStyle = m.isBursting ? "#ffffff" : "rgba(6, 182, 212, 0.8)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-m.radius * 0.5, 0);
    ctx.lineTo(m.radius * 0.5, 0);
    ctx.stroke();
  }

  // E. Drifting Meteor: Cosmic plasma crescent swirl
  else if (m.type === "drifting") {
    ctx.strokeStyle = "rgba(129, 140, 248, 0.85)";
    ctx.lineWidth = 2.0;
    ctx.shadowColor = "#818cf8";
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(0, 0, m.radius * 0.55, 0, Math.PI * 1.4);
    ctx.stroke();

    ctx.fillStyle = "rgba(129, 140, 248, 0.35)";
    ctx.beginPath();
    ctx.arc(m.radius * 0.2, -m.radius * 0.2, m.radius * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // F. Standard / Legacy crater details
  else {
    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.beginPath();
    ctx.arc(-m.radius * 0.25, m.radius * 0.25, m.radius * 0.24, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(m.radius * 0.35, -m.radius * 0.15, m.radius * 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(249, 115, 22, 0.3)";
    ctx.beginPath();
    ctx.arc(0, 0, m.radius * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }

  // Pulsar aura ring (legacy)
  if (m.type === "pulsar") {
    ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, m.radius * 1.35, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Health bar if damaged and maxHp > 1
  if (m.hp < m.maxHp && m.maxHp > 1) {
    const barW = Math.max(28, m.radius * 1.6);
    const barH = 3.5;
    const barY = -m.radius - 9;
    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.fillRect(-barW / 2, barY, barW, barH);

    const ratio = m.hp / m.maxHp;
    ctx.fillStyle = ratio > 0.5 ? "#10b981" : ratio > 0.25 ? "#f59e0b" : "#ef4444";
    ctx.fillRect(-barW / 2, barY, barW * ratio, barH);
  }

  ctx.restore();
}

/**
 * Splits a destroyed meteor into smaller fragments if applicable.
 * Guarantees:
 * 1. Splitting only occurs ONCE per parent entity.
 * 2. Fragments have canSplit = false, mathematically preventing infinite splitting.
 * 3. Fragments are fully independent entities.
 */
export function splitMeteor(m: MeteorEntity): MeteorEntity[] {
  const fragments: MeteorEntity[] = [];

  // 1. New Splitting Meteor Variant
  if (m.type === "splitting") {
    if (!m.canSplit || m.hasSplit) {
      return [];
    }
    m.hasSplit = true;

    // Splits into 2 to 3 smaller fragments
    const fragmentCount = 2;
    const baseSpeed = Math.hypot(m.vx, m.vy) || 120;
    const baseAngle = Math.atan2(m.vy, m.vx);
    const angularOffsets = [-0.55, 0.55];

    for (let i = 0; i < fragmentCount; i++) {
      const fragAngle = baseAngle + angularOffsets[i];
      const fragSpeed = baseSpeed * (1.15 + Math.random() * 0.25);
      const spawnDist = m.radius * 0.6;

      fragments.push(
        createMeteor(
          "splitting_fragment",
          m.x + Math.cos(fragAngle) * spawnDist,
          m.y + Math.sin(fragAngle) * spawnDist,
          undefined,
          undefined,
          {
            x: Math.cos(fragAngle) * fragSpeed,
            y: Math.sin(fragAngle) * fragSpeed,
          },
          (m.generation || 0) + 1
        )
      );
    }
  }

  // 2. Legacy large / medium meteor splitting
  else if (m.type === "large") {
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
