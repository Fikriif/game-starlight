import {
  PlayerState,
  Vector2D,
  ProjectileEntity,
  InputState,
  MeteorEntity,
} from "../types/game";
import { PLAYER_CONFIG } from "../config/constants";
import { createProjectile } from "./Projectile";
import { createThrusterParticle } from "./Particle";

export class Player {
  public state: PlayerState;
  private fireTimer: number = 0;
  private thrusterTimer: number = 0;

  constructor(startX: number, startY: number) {
    this.state = {
      x: startX,
      y: startY,
      vx: 0,
      vy: 0,
      radius: PLAYER_CONFIG.RADIUS,
      angle: -Math.PI / 2, // Facing upwards
      lives: PLAYER_CONFIG.MAX_LIVES,
      maxLives: PLAYER_CONFIG.MAX_LIVES,
      invulnerableTime: 0,
      shieldActive: false,
      shieldTime: 0,
    };
  }

  public reset(x: number, y: number) {
    this.state.x = x;
    this.state.y = y;
    this.state.vx = 0;
    this.state.vy = 0;
    this.state.angle = -Math.PI / 2;
    this.state.lives = PLAYER_CONFIG.MAX_LIVES;
    this.state.invulnerableTime = 0;
    this.state.shieldActive = false;
    this.state.shieldTime = 0;
    this.fireTimer = 0;
  }

  public update(
    dt: number,
    input: InputState,
    arenaWidth: number,
    arenaHeight: number,
    meteors: MeteorEntity[],
    hasRapidFire: boolean,
    hasSpreadShot: boolean,
    onSpawnProjectile: (p: ProjectileEntity) => void,
    onSpawnThrusterParticle: (p: ReturnType<typeof createThrusterParticle>) => void
  ) {
    // 1. Movement input handling
    let moveX = 0;
    let moveY = 0;

    if (input.left) moveX -= 1;
    if (input.right) moveX += 1;
    if (input.up) moveY -= 1;
    if (input.down) moveY += 1;

    // Mobile touch vector takes precedence if active
    if (input.touchVector) {
      moveX = input.touchVector.x;
      moveY = input.touchVector.y;
    }

    const inputMag = Math.hypot(moveX, moveY);
    if (inputMag > 0.05) {
      const normX = moveX / (inputMag > 1 ? inputMag : 1);
      const normY = moveY / (inputMag > 1 ? inputMag : 1);
      const targetVx = normX * PLAYER_CONFIG.SPEED;
      const targetVy = normY * PLAYER_CONFIG.SPEED;

      // Smooth acceleration
      this.state.vx += (targetVx - this.state.vx) * 14 * dt;
      this.state.vy += (targetVy - this.state.vy) * 14 * dt;

      // Turn ship slightly into movement vector
      const targetAngle = Math.atan2(this.state.vy, this.state.vx);
      // Smooth angle interpolation
      let angleDiff = targetAngle - this.state.angle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      this.state.angle += angleDiff * 8 * dt;

      // Emit engine thruster particles
      this.thrusterTimer += dt;
      if (this.thrusterTimer > 0.04) {
        this.thrusterTimer = 0;
        // Twin engines offset from center
        const backDist = this.state.radius * 0.9;
        const spreadDist = 7;
        const cosA = Math.cos(this.state.angle);
        const sinA = Math.sin(this.state.angle);

        // Left engine
        const e1x = this.state.x - cosA * backDist - sinA * spreadDist;
        const e1y = this.state.y - sinA * backDist + cosA * spreadDist;
        onSpawnThrusterParticle(createThrusterParticle(e1x, e1y, this.state.angle));

        // Right engine
        const e2x = this.state.x - cosA * backDist + sinA * spreadDist;
        const e2y = this.state.y - sinA * backDist - cosA * spreadDist;
        onSpawnThrusterParticle(createThrusterParticle(e2x, e2y, this.state.angle));
      }
    } else {
      // Damping / friction
      this.state.vx *= Math.pow(0.05, dt);
      this.state.vy *= Math.pow(0.05, dt);
      if (Math.abs(this.state.vx) < 1) this.state.vx = 0;
      if (Math.abs(this.state.vy) < 1) this.state.vy = 0;
    }

    // Apply movement
    this.state.x += this.state.vx * dt;
    this.state.y += this.state.vy * dt;

    // Clamp inside arena boundaries with padding
    const pad = this.state.radius + 6;
    if (this.state.x < pad) {
      this.state.x = pad;
      this.state.vx = 0;
    } else if (this.state.x > arenaWidth - pad) {
      this.state.x = arenaWidth - pad;
      this.state.vx = 0;
    }

    if (this.state.y < pad) {
      this.state.y = pad;
      this.state.vy = 0;
    } else if (this.state.y > arenaHeight - pad) {
      this.state.y = arenaHeight - pad;
      this.state.vy = 0;
    }

    // 2. Timers (Invulnerability & Shield)
    if (this.state.invulnerableTime > 0) {
      this.state.invulnerableTime = Math.max(0, this.state.invulnerableTime - dt);
    }

    if (this.state.shieldActive && this.state.shieldTime > 0) {
      this.state.shieldTime -= dt;
      if (this.state.shieldTime <= 0) {
        this.state.shieldActive = false;
      }
    }

    // 3. Automatic Shooting
    const fireInterval = hasRapidFire
      ? PLAYER_CONFIG.FIRE_RATE_RAPID
      : PLAYER_CONFIG.FIRE_RATE_BASE;

    this.fireTimer += dt;
    if (this.fireTimer >= fireInterval) {
      this.fireTimer = 0;
      this.handleAutoFire(meteors, hasSpreadShot, onSpawnProjectile);
    }
  }

  private handleAutoFire(
    meteors: MeteorEntity[],
    hasSpreadShot: boolean,
    onSpawnProjectile: (p: ProjectileEntity) => void
  ) {
    // Locate nearest target within range
    let bestTarget: MeteorEntity | null = null;
    let bestDistSq = PLAYER_CONFIG.AUTO_TARGET_RANGE * PLAYER_CONFIG.AUTO_TARGET_RANGE;

    for (const m of meteors) {
      const dx = m.x - this.state.x;
      const dy = m.y - this.state.y;
      const distSq = dx * dx + dy * dy;
      if (distSq < bestDistSq) {
        bestDistSq = distSq;
        bestTarget = m;
      }
    }

    // Fire angle (targeting nearest enemy or default forward / up)
    let fireAngle: number;
    if (bestTarget) {
      fireAngle = Math.atan2(bestTarget.y - this.state.y, bestTarget.x - this.state.x);
    } else {
      // Default to facing angle or straight up
      fireAngle = this.state.angle;
    }

    const noseDist = this.state.radius * 1.1;
    const noseX = this.state.x + Math.cos(fireAngle) * noseDist;
    const noseY = this.state.y + Math.sin(fireAngle) * noseDist;

    if (hasSpreadShot) {
      // 3 projectiles: center, -16 deg, +16 deg
      const spread = 0.28; // ~16 degrees
      onSpawnProjectile(createProjectile(noseX, noseY, fireAngle, 1, "#00f0ff", "rgba(0, 240, 255, 0.8)"));
      onSpawnProjectile(createProjectile(noseX, noseY, fireAngle - spread, 1, "#00f0ff", "rgba(0, 240, 255, 0.8)"));
      onSpawnProjectile(createProjectile(noseX, noseY, fireAngle + spread, 1, "#00f0ff", "rgba(0, 240, 255, 0.8)"));
    } else {
      onSpawnProjectile(createProjectile(noseX, noseY, fireAngle, 1, "#00f0ff", "rgba(0, 240, 255, 0.8)"));
    }
  }

  public hit(): boolean {
    if (this.state.invulnerableTime > 0) return false;

    // If shield is active, it absorbs this hit!
    if (this.state.shieldActive) {
      this.state.shieldActive = false;
      this.state.shieldTime = 0;
      this.state.invulnerableTime = 1.0; // short grace period
      return "shield" as unknown as boolean;
    }

    // Deduct one life
    this.state.lives = Math.max(0, this.state.lives - 1);
    this.state.invulnerableTime = PLAYER_CONFIG.INVULNERABLE_DURATION;
    return true;
  }

  public restoreLife(): boolean {
    if (this.state.lives < this.state.maxLives) {
      this.state.lives += 1;
      return true;
    }
    return false;
  }

  public activateShield(duration: number) {
    this.state.shieldActive = true;
    this.state.shieldTime = duration;
  }

  public render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.state.x, this.state.y);

    // Invulnerability flashing
    if (this.state.invulnerableTime > 0) {
      const flash = Math.sin(this.state.invulnerableTime * 24);
      ctx.globalAlpha = flash > 0 ? 0.9 : 0.35;
    }

    ctx.rotate(this.state.angle);

    // Ship Hull Design (Futuristic Fighter)
    // Wings
    ctx.shadowColor = "#00f0ff";
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.moveTo(this.state.radius * 1.25, 0); // Nose
    ctx.lineTo(-this.state.radius * 0.9, -this.state.radius * 0.95); // Left wingtip
    ctx.lineTo(-this.state.radius * 0.45, -this.state.radius * 0.35); // Left inner
    ctx.lineTo(-this.state.radius * 0.85, 0); // Center tail
    ctx.lineTo(-this.state.radius * 0.45, this.state.radius * 0.35); // Right inner
    ctx.lineTo(-this.state.radius * 0.9, this.state.radius * 0.95); // Right wingtip
    ctx.closePath();

    // Metallic gradient
    const hullGrad = ctx.createLinearGradient(
      this.state.radius,
      0,
      -this.state.radius,
      0
    );
    hullGrad.addColorStop(0, "#ffffff");
    hullGrad.addColorStop(0.35, "#38bdf8");
    hullGrad.addColorStop(0.85, "#0c1737");
    hullGrad.addColorStop(1, "#030712");

    ctx.fillStyle = hullGrad;
    ctx.fill();

    ctx.strokeStyle = "#00f0ff";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Cockpit Canopy (Glowing Cyan Gem)
    ctx.beginPath();
    ctx.ellipse(
      this.state.radius * 0.25,
      0,
      this.state.radius * 0.4,
      this.state.radius * 0.2,
      0,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "#00f0ff";
    ctx.shadowColor = "#00f0ff";
    ctx.shadowBlur = 10;
    ctx.fill();

    // Wingtip Plasma Cannons
    ctx.fillStyle = "#ff007f";
    ctx.shadowColor = "#ff007f";
    ctx.fillRect(-this.state.radius * 0.85, -this.state.radius * 0.95, 4, 3);
    ctx.fillRect(-this.state.radius * 0.85, this.state.radius * 0.95 - 3, 4, 3);

    ctx.restore();

    // Energy Shield Barrier (Rendered without ship rotation)
    if (this.state.shieldActive) {
      ctx.save();
      ctx.translate(this.state.x, this.state.y);

      const shieldRadius = this.state.radius * 1.8;
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 18;

      ctx.strokeStyle = "rgba(56, 189, 248, 0.85)";
      ctx.lineWidth = 2.5;

      // Hexagonal outer forcefield
      ctx.beginPath();
      const sides = 6;
      const rot = Date.now() * 0.0015;
      for (let i = 0; i < sides; i++) {
        const a = rot + (i * Math.PI * 2) / sides;
        const px = Math.cos(a) * shieldRadius;
        const py = Math.sin(a) * shieldRadius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();

      // Pulsing inner bubble
      ctx.fillStyle = "rgba(56, 189, 248, 0.12)";
      ctx.beginPath();
      ctx.arc(0, 0, shieldRadius * 0.95, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }
}
