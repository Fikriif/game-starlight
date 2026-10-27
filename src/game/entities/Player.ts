import {
  PlayerState,
  ProjectileEntity,
  InputState,
  ParticleEntity,
} from "../types/game";
import { PLAYER_CONFIG } from "../config/constants";
import { createProjectile } from "./Projectile";
import { createMuzzleFlashParticles, createThrusterParticle } from "./Particle";

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
      angle: -Math.PI / 2, // Default facing upwards (-Y)
      lives: PLAYER_CONFIG.MAX_LIVES,
      maxLives: PLAYER_CONFIG.MAX_LIVES,
      invulnerableTime: 0,
      shieldActive: false,
      shieldTime: 0,
      muzzleFlashTimer: 0,
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
    this.state.muzzleFlashTimer = 0;
    this.fireTimer = 0;
  }

  public update(
    dt: number,
    input: InputState,
    arenaWidth: number,
    arenaHeight: number,
    hasRapidFire: boolean,
    hasSpreadShot: boolean,
    onSpawnProjectile: (p: ProjectileEntity) => void,
    onSpawnParticle: (p: ParticleEntity) => void
  ) {
    // 1. Independent Movement Physics
    let moveX = 0;
    let moveY = 0;

    if (input.left) moveX -= 1;
    if (input.right) moveX += 1;
    if (input.up) moveY -= 1;
    if (input.down) moveY += 1;

    // Mobile touch vector takes precedence for movement if active
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

      // Responsive acceleration
      this.state.vx += (targetVx - this.state.vx) * 14 * dt;
      this.state.vy += (targetVy - this.state.vy) * 14 * dt;

      // Emit twin-engine thruster particles from rear
      this.thrusterTimer += dt;
      if (this.thrusterTimer > 0.035) {
        this.thrusterTimer = 0;
        const backDist = this.state.radius * 0.95;
        const spreadDist = 7.5;
        const cosA = Math.cos(this.state.angle);
        const sinA = Math.sin(this.state.angle);

        // Left rear engine
        const e1x = this.state.x - cosA * backDist - sinA * spreadDist;
        const e1y = this.state.y - sinA * backDist + cosA * spreadDist;
        onSpawnParticle(createThrusterParticle(e1x, e1y, this.state.angle));

        // Right rear engine
        const e2x = this.state.x - cosA * backDist + sinA * spreadDist;
        const e2y = this.state.y - sinA * backDist - cosA * spreadDist;
        onSpawnParticle(createThrusterParticle(e2x, e2y, this.state.angle));
      }
    } else {
      // Inertia damping / friction
      this.state.vx *= Math.pow(0.04, dt);
      this.state.vy *= Math.pow(0.04, dt);
      if (Math.abs(this.state.vx) < 1) this.state.vx = 0;
      if (Math.abs(this.state.vy) < 1) this.state.vy = 0;
    }

    // Apply movement displacement
    this.state.x += this.state.vx * dt;
    this.state.y += this.state.vy * dt;

    // Clamp inside arena boundaries with safety padding
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

    // 2. Independent Aiming System
    let targetAngle: number | null = null;

    if (input.mousePos) {
      // Mouse cursor aiming (highest desktop priority)
      const dx = input.mousePos.x - this.state.x;
      const dy = input.mousePos.y - this.state.y;
      if (Math.hypot(dx, dy) > 8) {
        targetAngle = Math.atan2(dy, dx);
      }
    } else if (input.touchAimVector) {
      // Mobile dedicated right joystick aiming
      const aimMag = Math.hypot(input.touchAimVector.x, input.touchAimVector.y);
      if (aimMag > 0.1) {
        targetAngle = Math.atan2(input.touchAimVector.y, input.touchAimVector.x);
      }
    } else if (inputMag > 0.1) {
      // Keyboard-only fallback: aim toward movement heading if no mouse/aim stick active
      targetAngle = Math.atan2(this.state.vy, this.state.vx);
    }

    // Smoothly rotate ship toward target angle
    if (targetAngle !== null) {
      let diff = targetAngle - this.state.angle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.state.angle += diff * Math.min(22 * dt, 1.0);
    }

    // 3. Timers (Invulnerability, Shield, Muzzle Flash)
    if (this.state.invulnerableTime > 0) {
      this.state.invulnerableTime = Math.max(0, this.state.invulnerableTime - dt);
    }

    if (this.state.shieldActive && this.state.shieldTime > 0) {
      this.state.shieldTime -= dt;
      if (this.state.shieldTime <= 0) {
        this.state.shieldActive = false;
      }
    }

    if (this.state.muzzleFlashTimer > 0) {
      this.state.muzzleFlashTimer = Math.max(0, this.state.muzzleFlashTimer - dt);
    }

    // 4. Directional Shooting (Fires along ship's exact facing vector)
    const fireInterval = hasRapidFire
      ? PLAYER_CONFIG.FIRE_RATE_RAPID
      : PLAYER_CONFIG.FIRE_RATE_BASE;

    this.fireTimer += dt;

    if (input.isFiring && this.fireTimer >= fireInterval) {
      this.fireTimer = 0;
      this.state.muzzleFlashTimer = 0.08;
      this.fireDirectionalProjectiles(hasSpreadShot, onSpawnProjectile, onSpawnParticle);
    }
  }

  private fireDirectionalProjectiles(
    hasSpreadShot: boolean,
    onSpawnProjectile: (p: ProjectileEntity) => void,
    onSpawnParticle: (p: ParticleEntity) => void
  ) {
    const angle = this.state.angle;
    const muzzleDist = this.state.radius * 1.35;
    const muzzleX = this.state.x + Math.cos(angle) * muzzleDist;
    const muzzleY = this.state.y + Math.sin(angle) * muzzleDist;

    // Trigger visual muzzle flash sparks
    const flashes = createMuzzleFlashParticles(muzzleX, muzzleY, angle, "#00f0ff");
    for (const f of flashes) {
      onSpawnParticle(f);
    }

    if (hasSpreadShot) {
      // Tri-beam fan spread centered along aim angle
      const spread = 0.22; // ~12.5 degrees
      onSpawnProjectile(createProjectile(muzzleX, muzzleY, angle, 1, "#00f0ff", "rgba(0, 240, 255, 0.9)"));
      onSpawnProjectile(createProjectile(muzzleX, muzzleY, angle - spread, 1, "#00f0ff", "rgba(0, 240, 255, 0.9)"));
      onSpawnProjectile(createProjectile(muzzleX, muzzleY, angle + spread, 1, "#00f0ff", "rgba(0, 240, 255, 0.9)"));
    } else {
      // Single precision blaster along exact aim angle
      onSpawnProjectile(createProjectile(muzzleX, muzzleY, angle, 1, "#00f0ff", "rgba(0, 240, 255, 0.9)"));
    }
  }

  public hit(): boolean {
    if (this.state.invulnerableTime > 0) return false;

    // If shield is active, it absorbs this hit!
    if (this.state.shieldActive) {
      this.state.shieldActive = false;
      this.state.shieldTime = 0;
      this.state.invulnerableTime = 1.0;
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

    // Invulnerability flashing feedback
    if (this.state.invulnerableTime > 0) {
      const flash = Math.sin(this.state.invulnerableTime * 24);
      ctx.globalAlpha = flash > 0 ? 0.9 : 0.35;
    }

    // Rotate context to ship angle
    ctx.rotate(this.state.angle);

    // Muzzle Flash Flare on nose
    if (this.state.muzzleFlashTimer > 0) {
      ctx.save();
      ctx.shadowColor = "#00f0ff";
      ctx.shadowBlur = 18;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(this.state.radius * 1.35, 0, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(0, 240, 255, 0.6)";
      ctx.beginPath();
      ctx.arc(this.state.radius * 1.35, 0, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Ship Hull Design (Nose pointing forward along +X)
    ctx.shadowColor = "#00f0ff";
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.moveTo(this.state.radius * 1.35, 0); // Sharp Forward Nose / Muzzle
    ctx.lineTo(-this.state.radius * 0.9, -this.state.radius * 0.95); // Left Wingtip
    ctx.lineTo(-this.state.radius * 0.45, -this.state.radius * 0.35); // Left Inner
    ctx.lineTo(-this.state.radius * 0.85, 0); // Tail
    ctx.lineTo(-this.state.radius * 0.45, this.state.radius * 0.35); // Right Inner
    ctx.lineTo(-this.state.radius * 0.9, this.state.radius * 0.95); // Right Wingtip
    ctx.closePath();

    // High-tech aerospace gradient
    const hullGrad = ctx.createLinearGradient(
      this.state.radius * 1.35,
      0,
      -this.state.radius,
      0
    );
    hullGrad.addColorStop(0, "#ffffff");
    hullGrad.addColorStop(0.3, "#38bdf8");
    hullGrad.addColorStop(0.75, "#0e1a3d");
    hullGrad.addColorStop(1, "#030712");

    ctx.fillStyle = hullGrad;
    ctx.fill();

    ctx.strokeStyle = "#00f0ff";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Center Fuselage Spine Line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(this.state.radius * 1.2, 0);
    ctx.lineTo(-this.state.radius * 0.4, 0);
    ctx.stroke();

    // Cockpit Canopy (Glowing Cyan Gem)
    ctx.beginPath();
    ctx.ellipse(
      this.state.radius * 0.3,
      0,
      this.state.radius * 0.4,
      this.state.radius * 0.18,
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
    ctx.shadowBlur = 8;
    ctx.fillRect(-this.state.radius * 0.85, -this.state.radius * 0.95, 4, 3);
    ctx.fillRect(-this.state.radius * 0.85, this.state.radius * 0.95 - 3, 4, 3);

    // Visible Nose Cannon Muzzle Tip
    ctx.fillStyle = "#00f0ff";
    ctx.shadowColor = "#00f0ff";
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(this.state.radius * 1.35, 0, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Energy Shield Barrier (Rendered around ship)
    if (this.state.shieldActive) {
      ctx.save();
      ctx.translate(this.state.x, this.state.y);

      const shieldRadius = this.state.radius * 1.8;
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 18;

      ctx.strokeStyle = "rgba(56, 189, 248, 0.85)";
      ctx.lineWidth = 2.5;

      // Hexagonal forcefield
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

      // Pulsing inner shield aura
      ctx.fillStyle = "rgba(56, 189, 248, 0.12)";
      ctx.beginPath();
      ctx.arc(0, 0, shieldRadius * 0.95, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }
}
