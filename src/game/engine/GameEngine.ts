import {
  ActivePowerUpState,
  ComboState,
  EngineCallbacks,
  FloatingTextEntity,
  GameStats,
  GameStatus,
  InputState,
  MeteorEntity,
  MeteorType,
  ParticleEntity,
  PowerUpEntity,
  PowerUpType,
  ProjectileEntity,
  Vector2D,
} from "../types/game";
import {
  GAME_CANVAS,
  POWER_UP_CONFIGS,
  POWER_UP_DROP_RATE,
} from "../config/constants";
import { Player } from "../entities/Player";
import { renderProjectile, updateProjectile } from "../entities/Projectile";
import {
  renderMeteor,
  splitMeteor,
  updateMeteor,
} from "../entities/Meteor";
import { createPowerUp, renderPowerUp, updatePowerUp } from "../entities/PowerUp";
import {
  createExplosionParticles,
  createLaserImpactParticles,
  createParticle,
  renderParticle,
  ShockwaveRing,
  updateParticle,
} from "../entities/Particle";
import {
  createFloatingText,
  renderFloatingText,
  updateFloatingText,
} from "../entities/FloatingText";
import {
  checkPlayerMeteorCollisions,
  checkPlayerPowerUpCollisions,
  checkProjectileMeteorCollisions,
} from "../systems/CollisionSystem";
import { DifficultySystem } from "../systems/DifficultySystem";
import { ScoreSystem } from "../systems/ScoreSystem";
import { SpawnSystem } from "../systems/SpawnSystem";
import { soundManager } from "../audio/SoundManager";

interface Star {
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  twinklePhase: number;
}

export class GameEngine {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public status: GameStatus = "idle";

  public width: number = GAME_CANVAS.BASE_WIDTH;
  public height: number = GAME_CANVAS.BASE_HEIGHT;

  private player: Player;
  private projectiles: ProjectileEntity[] = [];
  private meteors: MeteorEntity[] = [];
  private powerUps: PowerUpEntity[] = [];
  private particles: ParticleEntity[] = [];
  private floatingTexts: FloatingTextEntity[] = [];
  private shockwaves: ShockwaveRing[] = [];

  private difficultySystem: DifficultySystem;
  private scoreSystem: ScoreSystem;
  private spawnSystem: SpawnSystem;

  private activePowerUps: Map<PowerUpType, number> = new Map();

  private input: InputState = {
    up: false,
    down: false,
    left: false,
    right: false,
    touchVector: null,
    touchAimVector: null,
    mousePos: null,
    isFiring: false,
    spacePressed: false,
  };

  private isMouseDown: boolean = false;
  public autoFireEnabled: boolean = false;

  private callbacks: EngineCallbacks = {};

  private introducedMeteorTypes: Set<MeteorType> = new Set();

  private stars: Star[] = [];
  private shakeIntensity: number = 0;
  private flashIntensity: number = 0;
  private lastTime: number = 0;
  private animFrameId: number | null = null;

  // Event listener references for clean teardown
  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundKeyUp: (e: KeyboardEvent) => void;
  private boundMouseMove: (e: MouseEvent) => void;
  private boundMouseDown: (e: MouseEvent) => void;
  private boundMouseUp: (e: MouseEvent) => void;

  constructor(canvas: HTMLCanvasElement, callbacks?: EngineCallbacks) {
    this.canvas = canvas;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("Could not get 2D rendering context");
    this.ctx = context;

    if (callbacks) this.callbacks = callbacks;

    this.player = new Player(this.width / 2, this.height * 0.75);
    this.difficultySystem = new DifficultySystem();
    this.scoreSystem = new ScoreSystem();
    this.spawnSystem = new SpawnSystem();

    this.initStars();

    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);
    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundMouseDown = this.handleMouseDown.bind(this);
    this.boundMouseUp = this.handleMouseUp.bind(this);

    window.addEventListener("keydown", this.boundKeyDown);
    window.addEventListener("keyup", this.boundKeyUp);
    this.canvas.addEventListener("mousemove", this.boundMouseMove);
    window.addEventListener("mousedown", this.boundMouseDown);
    window.addEventListener("mouseup", this.boundMouseUp);
  }

  public setCallbacks(callbacks: EngineCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  private initStars() {
    this.stars = [];
    const starCount = 90;
    const colors = ["#ffffff", "#67e8f9", "#c084fc", "#93c5fd"];

    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: 0.8 + Math.random() * 1.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: 8 + Math.random() * 24,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }
  }

  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.ctx.resetTransform?.();
    this.ctx.scale(dpr, dpr);
  }

  public start() {
    soundManager.init();
    this.reset();
    this.status = "playing";
    this.callbacks.onStatusChange?.(this.status);
    this.lastTime = performance.now();
    this.scheduleFrame();
  }

  public pause() {
    if (this.status !== "playing") return;
    this.status = "paused";
    this.callbacks.onStatusChange?.(this.status);
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public resume() {
    if (this.status !== "paused") return;
    this.status = "playing";
    this.callbacks.onStatusChange?.(this.status);
    this.lastTime = performance.now();
    this.scheduleFrame();
  }

  public restart() {
    this.start();
  }

  public reset() {
    this.player.reset(this.width / 2, this.height * 0.75);
    this.projectiles = [];
    this.meteors = [];
    this.powerUps = [];
    this.particles = [];
    this.floatingTexts = [];
    this.shockwaves = [];
    this.activePowerUps.clear();

    this.difficultySystem.reset();
    this.scoreSystem.reset();
    this.spawnSystem.reset();
    this.shakeIntensity = 0;
    this.flashIntensity = 0;
    this.introducedMeteorTypes.clear();
    this.input.isFiring = this.autoFireEnabled;

    this.callbacks.onScoreChange?.(0);
    this.callbacks.onLivesChange?.(this.player.state.lives);
    this.callbacks.onWaveChange?.(1);
    this.callbacks.onComboChange?.(this.scoreSystem.getComboState());
    this.notifyPowerUpsChange();
  }

  public setTouchVector(vector: Vector2D | null) {
    this.input.touchVector = vector;
  }

  public setTouchAimVector(vector: Vector2D | null) {
    this.input.touchAimVector = vector;
    if (vector) {
      this.input.isFiring = true;
    } else if (!this.isMouseDown && !this.input.spacePressed && !this.autoFireEnabled) {
      this.input.isFiring = false;
    }
  }

  public setAutoFire(enabled: boolean) {
    this.autoFireEnabled = enabled;
    if (enabled) {
      this.input.isFiring = true;
    } else if (!this.isMouseDown && !this.input.spacePressed && !this.input.touchAimVector) {
      this.input.isFiring = false;
    }
  }

  private handleMouseMove(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const scaleX = this.width / rect.width;
      const scaleY = this.height / rect.height;
      this.input.mousePos = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  }

  private handleMouseDown(e: MouseEvent) {
    if (e.button === 0) {
      this.isMouseDown = true;
      this.input.isFiring = true;
    }
  }

  private handleMouseUp(e: MouseEvent) {
    if (e.button === 0) {
      this.isMouseDown = false;
      if (!this.input.spacePressed && !this.autoFireEnabled && !this.input.touchAimVector) {
        this.input.isFiring = false;
      }
    }
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.code === "KeyW" || e.code === "ArrowUp") {
      this.input.up = true;
      e.preventDefault();
    } else if (e.code === "KeyS" || e.code === "ArrowDown") {
      this.input.down = true;
      e.preventDefault();
    } else if (e.code === "KeyA" || e.code === "ArrowLeft") {
      this.input.left = true;
      e.preventDefault();
    } else if (e.code === "KeyD" || e.code === "ArrowRight") {
      this.input.right = true;
      e.preventDefault();
    } else if (e.code === "Space") {
      e.preventDefault();
      this.input.spacePressed = true;
      this.input.isFiring = true;
    } else if (e.code === "KeyP" || e.code === "Escape") {
      e.preventDefault();
      if (this.status === "playing") {
        this.pause();
      } else if (this.status === "paused") {
        this.resume();
      }
    }
  }

  private handleKeyUp(e: KeyboardEvent) {
    if (e.code === "KeyW" || e.code === "ArrowUp") this.input.up = false;
    else if (e.code === "KeyS" || e.code === "ArrowDown") this.input.down = false;
    else if (e.code === "KeyA" || e.code === "ArrowLeft") this.input.left = false;
    else if (e.code === "KeyD" || e.code === "ArrowRight") this.input.right = false;
    else if (e.code === "Space") {
      this.input.spacePressed = false;
      if (!this.isMouseDown && !this.autoFireEnabled && !this.input.touchAimVector) {
        this.input.isFiring = false;
      }
    }
  }

  private scheduleFrame() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    this.animFrameId = requestAnimationFrame(this.gameLoop.bind(this));
  }

  private gameLoop(timestamp: number) {
    if (this.status !== "playing") return;

    // Delta time in seconds, clamped between 0 and 0.1s to avoid huge jumps on tab switch
    const rawDt = (timestamp - this.lastTime) / 1000;
    const dt = Math.min(Math.max(rawDt, 0.001), 0.1);
    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    if (this.status === "playing") {
      this.animFrameId = requestAnimationFrame(this.gameLoop.bind(this));
    }
  }

  private update(dt: number) {
    // 1. Difficulty & Wave progression
    const waveChanged = this.difficultySystem.update(dt);
    if (waveChanged) {
      const waveTitle = this.difficultySystem.getWaveTitle();
      this.callbacks.onWaveChange?.(this.difficultySystem.wave);
      this.callbacks.onWaveTransition?.(this.difficultySystem.wave, waveTitle);
      soundManager.playPowerUpCollect();
      this.floatingTexts.push(
        createFloatingText(
          `WAVE ${this.difficultySystem.wave}: ${waveTitle.toUpperCase()}!`,
          this.width / 2,
          this.height * 0.35,
          "#00f0ff",
          24
        )
      );
    }

    // 2. Score system passive timer & combo timer decay
    const passivePoints = this.scoreSystem.update(dt);
    if (passivePoints > 0) {
      this.callbacks.onScoreChange?.(this.scoreSystem.score);
    }
    // Update combo state for HUD countdown meter
    this.callbacks.onComboChange?.(this.scoreSystem.getComboState());

    // 3. Power-Up active timers
    let powerUpStateDirty = false;
    for (const [type, remaining] of Array.from(this.activePowerUps.entries())) {
      const nextRemaining = remaining - dt;
      if (nextRemaining <= 0) {
        this.activePowerUps.delete(type);
        powerUpStateDirty = true;
        this.callbacks.onPowerUpExpired?.(type);
      } else {
        this.activePowerUps.set(type, nextRemaining);
      }
    }
    if (powerUpStateDirty) {
      this.notifyPowerUpsChange();
    }

    const hasRapidFire = this.activePowerUps.has("rapid_fire");
    const hasSpreadShot = this.activePowerUps.has("spread_shot");

    // 4. Update Player (Directional shooting, no nearest-meteor targeting)
    this.player.update(
      dt,
      this.input,
      this.width,
      this.height,
      hasRapidFire,
      hasSpreadShot,
      (proj) => {
        this.projectiles.push(proj);
        this.scoreSystem.shotsFired++;
        soundManager.playLaser(hasRapidFire ? 1.3 : 1.0);
      },
      (particle) => {
        if (this.particles.length < 240) {
          this.particles.push(particle);
        }
      }
    );

    // 5. Update Projectiles (Strict directional velocity)
    this.projectiles = this.projectiles.filter((p) => {
      const alive = updateProjectile(p, dt);
      const inBounds =
        p.x >= -30 && p.x <= this.width + 30 && p.y >= -30 && p.y <= this.height + 30;
      return alive && inBounds;
    });

    // 6. Update Meteors with special variant callbacks
    for (const m of this.meteors) {
      updateMeteor(m, dt, {
        onSpeedWarning: () => soundManager.playSpeedWarning(),
        onSpeedBurst: () => soundManager.playSpeedBurst(),
        onExplosionWarning: () => soundManager.playDetonationWarning(),
        onEmitTrail: (x, y, color, radius) => {
          if (this.particles.length < 260) {
            this.particles.push(createParticle(x, y, 0, 0, radius, color, 0.18, true));
          }
        },
      });
    }

    // Check for expired explosive meteor fuses
    const expiredFuses = this.meteors.filter(
      (m) => m.type === "explosive" && m.fuseTimer !== undefined && m.fuseTimer <= 0 && !m.hasExploded
    );
    for (const expired of expiredFuses) {
      this.destroyMeteor(expired);
    }

    // Filter meteors out of bounds (with a generous border margin)
    this.meteors = this.meteors.filter((m) => {
      const margin = m.radius + 80;
      return (
        m.x >= -margin &&
        m.x <= this.width + margin &&
        m.y >= -margin &&
        m.y <= this.height + margin
      );
    });

    // 7. Spawn new meteors (supports coordinated multi-meteor spawns in Wave 3+)
    const newMeteors = this.spawnSystem.update(
      dt,
      this.width,
      this.height,
      this.player.state,
      this.meteors.length,
      this.difficultySystem
    );
    for (const newMeteor of newMeteors) {
      this.meteors.push(newMeteor);

      // Introduce special meteor variants with a brief non-intrusive notification
      if (!this.introducedMeteorTypes.has(newMeteor.type)) {
        this.introducedMeteorTypes.add(newMeteor.type);
        const badges: Record<string, { label: string; description: string; color: string }> = {
          speed: {
            label: "SPEED METEOR",
            description: "Supersonic bursts, lead your crosshair!",
            color: "#06b6d4",
          },
          heavy: {
            label: "HEAVY TITAN",
            description: "Dense armor plates, requires focused fire!",
            color: "#a855f7",
          },
          splitting: {
            label: "SPLITTING METEOR",
            description: "Shatters into 2 independent fragments!",
            color: "#10b981",
          },
          explosive: {
            label: "EXPLOSIVE METEOR",
            description: "Hazardous! Avoid detonation blast shockwave!",
            color: "#ef4444",
          },
          drifting: {
            label: "DRIFTING METEOR",
            description: "Sinusoidal steering pattern, track carefully!",
            color: "#ec4899",
          },
        };
        const badge = badges[newMeteor.type];
        if (badge) {
          this.callbacks.onMeteorAlert?.({
            type: newMeteor.type,
            label: badge.label,
            description: badge.description,
            color: badge.color,
          });
          this.floatingTexts.push(
            createFloatingText(badge.label, this.width / 2, this.height * 0.28, badge.color, 18)
          );
        }
      }
    }

    // 8. Update Power-Ups
    this.powerUps = this.powerUps.filter((p) => updatePowerUp(p, dt));

    // 9. Update Particles
    this.particles = this.particles.filter((p) => updateParticle(p, dt));

    // 10. Update Shockwaves
    this.shockwaves = this.shockwaves.filter((sw) => {
      sw.radius += sw.speed * dt;
      sw.alpha = Math.max(0, 1 - sw.radius / sw.maxRadius);
      return sw.radius < sw.maxRadius;
    });

    // 11. Update Floating Texts
    this.floatingTexts = this.floatingTexts.filter((t) => updateFloatingText(t, dt));

    // 12. Check Collisions: Projectile vs Meteor (Directional Projectiles)
    const hits = checkProjectileMeteorCollisions(this.projectiles, this.meteors);
    if (hits.length > 0) {
      const hitProjectileIds = new Set(hits.map((h) => h.projectileId));
      this.projectiles = this.projectiles.filter((p) => !hitProjectileIds.has(p.id));

      for (const hit of hits) {
        this.scoreSystem.shotsHit++;
        const meteor = this.meteors.find((m) => m.id === hit.meteorId);
        if (!meteor) continue;

        meteor.hp -= hit.damage;
        meteor.hitFlashTimer = 0.12; // Trigger white hit flash

        // Play heavy impact audio if heavy meteor
        if (meteor.type === "heavy") {
          soundManager.playHeavyDamage();
        }

        // Laser impact sparks
        this.particles.push(...createLaserImpactParticles(hit.hitX, hit.hitY, meteor.color));

        if (meteor.hp <= 0) {
          // Destroyed meteor!
          this.destroyMeteor(meteor);
        }
      }
    }

    // 13. Check Collisions: Player vs Meteor
    const collidedMeteor = checkPlayerMeteorCollisions(this.player.state, this.meteors);
    if (collidedMeteor) {
      this.applyPlayerDamage(collidedMeteor.x, collidedMeteor.y);
    }

    // 14. Check Collisions: Player vs Power-Up
    const collectedPowerUp = checkPlayerPowerUpCollisions(this.player.state, this.powerUps);
    if (collectedPowerUp) {
      this.collectPowerUp(collectedPowerUp);
      this.powerUps = this.powerUps.filter((p) => p.id !== collectedPowerUp.id);
    }

    // 15. Update Starfield
    for (const star of this.stars) {
      star.y += star.speed * dt;
      if (star.y > this.height) {
        star.y = 0;
        star.x = Math.random() * this.width;
      }
      star.twinklePhase += dt * 3;
    }

    // 16. Screen shake & flash decay
    if (this.shakeIntensity > 0) {
      this.shakeIntensity = Math.max(0, this.shakeIntensity - 35 * dt);
    }
    if (this.flashIntensity > 0) {
      this.flashIntensity = Math.max(0, this.flashIntensity - 2.2 * dt);
    }
  }

  private applyPlayerDamage(sourceX: number, sourceY: number, customLabel?: string): boolean {
    const hitResult = this.player.hit();

    if (hitResult === ("shield" as unknown as boolean)) {
      // Shield absorbed the hit
      soundManager.playShieldDeflect();
      this.shakeIntensity = Math.max(this.shakeIntensity, 8);
      this.shockwaves.push({
        x: this.player.state.x,
        y: this.player.state.y,
        radius: 10,
        maxRadius: 70,
        color: "#38bdf8",
        alpha: 1.0,
        speed: 250,
        lineWidth: 3,
      });
      this.floatingTexts.push(
        createFloatingText("SHIELD DEFLECT!", this.player.state.x, this.player.state.y - 30, "#38bdf8", 16)
      );
      return false;
    } else if (hitResult === true) {
      // Life lost!
      soundManager.playPlayerHit();
      this.shakeIntensity = Math.max(this.shakeIntensity, 18);
      this.callbacks.onLivesChange?.(this.player.state.lives);

      // Player explosion sparks
      this.particles.push(
        ...createExplosionParticles(this.player.state.x, this.player.state.y, 24, "#ff007f", "#ffffff")
      );

      this.floatingTexts.push(
        createFloatingText(customLabel || "-1 LIFE!", this.player.state.x, this.player.state.y - 30, "#ff007f", 20)
      );

      if (this.player.state.lives <= 0) {
        this.handleGameOver();
      }
      return true;
    }

    return false;
  }

  private detonateExplosiveMeteor(m: MeteorEntity) {
    if (m.hasExploded) return;
    m.hasExploded = true;

    const blastRadius = m.explosionRadius || 115;
    soundManager.playExplosiveDetonation();
    this.shakeIntensity = Math.max(this.shakeIntensity, 16);
    this.flashIntensity = 0.35;

    // Detonation expanding shockwave ring
    this.shockwaves.push({
      x: m.x,
      y: m.y,
      radius: 12,
      maxRadius: blastRadius,
      color: "#ef4444",
      alpha: 1.0,
      speed: 380,
      lineWidth: 4,
    });

    // Detonation fire & debris particles
    this.particles.push(
      ...createExplosionParticles(m.x, m.y, 32, "#ef4444", "#fef08a")
    );

    // Apply explosion damage to player if within blast radius at detonation instant
    const distToPlayer = Math.hypot(m.x - this.player.state.x, m.y - this.player.state.y);
    if (distToPlayer <= blastRadius + this.player.state.radius * 0.8) {
      this.applyPlayerDamage(m.x, m.y, "BLAST IMPACT!");
    }

    // Safely apply damage to nearby meteors within blast radius
    const chainVictims: MeteorEntity[] = [];
    for (const other of this.meteors) {
      if (other.id !== m.id && !other.hasExploded) {
        const d = Math.hypot(other.x - m.x, other.y - m.y);
        if (d <= blastRadius + other.radius) {
          other.hp -= 3;
          other.hitFlashTimer = 0.15;
          this.particles.push(...createLaserImpactParticles(other.x, other.y, "#ef4444"));
          if (other.hp <= 0) {
            chainVictims.push(other);
          }
        }
      }
    }

    // Destroy any meteors defeated by the explosion chain reaction
    for (const victim of chainVictims) {
      if (this.meteors.some((active) => active.id === victim.id)) {
        this.destroyMeteor(victim);
      }
    }
  }

  private destroyMeteor(meteor: MeteorEntity) {
    if (!this.meteors.some((m) => m.id === meteor.id)) return;
    this.meteors = this.meteors.filter((m) => m.id !== meteor.id);

    // 1. If explosive meteor, detonate it
    if (meteor.type === "explosive" && !meteor.hasExploded) {
      this.detonateExplosiveMeteor(meteor);
    }

    // 2. Play variant-specific audio and visual destruction effects
    if (meteor.type === "heavy") {
      soundManager.playExplosion("large");
      this.shakeIntensity = Math.max(this.shakeIntensity, 12);
      this.particles.push(
        ...createExplosionParticles(meteor.x, meteor.y, 32, meteor.color, "#ffffff")
      );
    } else if (meteor.type === "speed") {
      soundManager.playExplosion("small");
      this.shakeIntensity = Math.max(this.shakeIntensity, 4);
      this.particles.push(
        ...createExplosionParticles(meteor.x, meteor.y, 16, meteor.color, "#ffffff")
      );
    } else if (meteor.type === "splitting") {
      soundManager.playMeteorSplit();
      this.shakeIntensity = Math.max(this.shakeIntensity, 6);
      this.particles.push(
        ...createExplosionParticles(meteor.x, meteor.y, 22, "#10b981", "#6ee7b7")
      );
    } else if (meteor.type === "explosive") {
      // Sound and particles handled in detonateExplosiveMeteor
    } else {
      soundManager.playExplosion(meteor.type === "large" ? "large" : meteor.type === "medium" ? "medium" : "small");
      this.particles.push(
        ...createExplosionParticles(meteor.x, meteor.y, meteor.type === "large" ? 30 : 16, meteor.color, "#ffffff")
      );
    }

    // 3. Award score with combo streak multiplier
    if (!meteor.hasAwardedScore) {
      meteor.hasAwardedScore = true;
      const gained = this.scoreSystem.addMeteorScore(meteor.scoreValue, this.difficultySystem.wave, true);
      this.callbacks.onScoreChange?.(this.scoreSystem.score);
      this.callbacks.onComboChange?.(this.scoreSystem.getComboState());

      const comboLabel = this.scoreSystem.getComboTierLabel();
      const scoreLabel = comboLabel ? `+${gained} ${comboLabel}!` : `+${gained}`;
      this.floatingTexts.push(
        createFloatingText(scoreLabel, meteor.x, meteor.y, meteor.color, 16)
      );
    }

    // 4. Splitting meteor fragment generation (capped to prevent runaway entity count)
    if (meteor.type === "splitting" || meteor.type === "large" || meteor.type === "medium") {
      const fragments = splitMeteor(meteor);
      if (fragments.length > 0) {
        const maxAllowed = this.difficultySystem.getMaxMeteors() + 6;
        const availableSlots = Math.max(0, maxAllowed - this.meteors.length);
        const fragmentsToAdd = fragments.slice(0, availableSlots);
        this.meteors.push(...fragmentsToAdd);
      }
    }

    // Rebalanced power-up drops (scaled slightly with wave to maintain challenge)
    const waveDropRate = Math.max(0.15, POWER_UP_DROP_RATE - (this.difficultySystem.wave - 1) * 0.015);
    if (Math.random() < waveDropRate) {
      const types: PowerUpType[] = [
        "rapid_fire",
        "spread_shot",
        "energy_shield",
        "repair_core",
        "score_multiplier",
        "nova_burst",
      ];
      const selectedType = types[Math.floor(Math.random() * types.length)];
      this.powerUps.push(createPowerUp(selectedType, meteor.x, meteor.y));
    }
  }

  private collectPowerUp(p: PowerUpEntity) {
    const config = POWER_UP_CONFIGS[p.type];
    soundManager.playPowerUpCollect();

    const bonus = this.scoreSystem.addPowerUpScore(20);
    this.callbacks.onScoreChange?.(this.scoreSystem.score);

    this.floatingTexts.push(
      createFloatingText(`+${bonus} ${config.name}!`, p.x, p.y, config.color, 18)
    );

    switch (p.type) {
      case "rapid_fire":
      case "spread_shot":
      case "score_multiplier": {
        const existing = this.activePowerUps.get(p.type) || 0;
        const refreshed = Math.min(config.duration * 1.5, existing + config.duration);
        this.activePowerUps.set(p.type, refreshed);
        this.notifyPowerUpsChange();
        break;
      }

      case "energy_shield": {
        this.player.activateShield(config.duration);
        const existing = this.activePowerUps.get("energy_shield") || 0;
        const refreshed = Math.min(config.duration * 1.5, existing + config.duration);
        this.activePowerUps.set("energy_shield", refreshed);
        this.notifyPowerUpsChange();
        break;
      }

      case "repair_core":
        const restored = this.player.restoreLife();
        if (restored) {
          this.callbacks.onLivesChange?.(this.player.state.lives);
          this.floatingTexts.push(
            createFloatingText("HULL REPAIRED!", this.player.state.x, this.player.state.y - 25, "#10b981", 18)
          );
        }
        break;

      case "score_multiplier":
        this.scoreSystem.setMultiplier(2, config.duration);
        this.activePowerUps.set("score_multiplier", config.duration);
        this.notifyPowerUpsChange();
        break;

      case "nova_burst":
        this.triggerNovaBurst();
        break;
    }

    this.callbacks.onPowerUpCollected?.(config);
  }

  private triggerNovaBurst() {
    soundManager.playNovaBurst();
    this.shakeIntensity = 22;
    this.flashIntensity = 0.45;

    this.shockwaves.push({
      x: this.player.state.x,
      y: this.player.state.y,
      radius: 10,
      maxRadius: Math.max(this.width, this.height),
      color: "#ff007f",
      alpha: 1.0,
      speed: 1200,
      lineWidth: 5,
    });

    const active = [...this.meteors];
    for (const m of active) {
      this.destroyMeteor(m);
    }

    this.floatingTexts.push(
      createFloatingText("NOVA BURST!", this.width / 2, this.height * 0.45, "#ff007f", 30)
    );
  }

  private handleGameOver() {
    this.status = "gameover";
    this.callbacks.onStatusChange?.(this.status);
    soundManager.playGameOver();

    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    const stats: GameStats = {
      score: this.scoreSystem.score,
      survivalSeconds: Math.floor(this.difficultySystem.survivalTime),
      wave: this.difficultySystem.wave,
      meteorsDestroyed: this.scoreSystem.meteorsDestroyed,
      powerUpsCollected: this.scoreSystem.powerUpsCollected,
      accuracyShotsFired: this.scoreSystem.shotsFired,
      accuracyShotsHit: this.scoreSystem.shotsHit,
      maxCombo: this.scoreSystem.maxCombo,
    };

    this.callbacks.onGameOver?.(stats);
  }

  private notifyPowerUpsChange() {
    const list: ActivePowerUpState[] = [];
    for (const [type, remaining] of this.activePowerUps.entries()) {
      const cfg = POWER_UP_CONFIGS[type];
      list.push({
        type,
        name: cfg.name,
        color: cfg.color,
        timeRemaining: Math.max(0, remaining),
        totalDuration: cfg.duration,
      });
    }
  }

  public getActivePowerUps(): ActivePowerUpState[] {
    const list: ActivePowerUpState[] = [];
    for (const [type, remaining] of this.activePowerUps.entries()) {
      const cfg = POWER_UP_CONFIGS[type];
      list.push({
        type,
        name: cfg.name,
        color: cfg.color,
        timeRemaining: Math.max(0, remaining),
        totalDuration: cfg.duration,
      });
    }
    return list;
  }

  public getComboState(): ComboState {
    return this.scoreSystem.getComboState();
  }

  public render() {
    this.ctx.save();

    // Screen Shake Offset
    if (this.shakeIntensity > 0) {
      const shakeX = (Math.random() - 0.5) * this.shakeIntensity;
      const shakeY = (Math.random() - 0.5) * this.shakeIntensity;
      this.ctx.translate(shakeX, shakeY);
    }

    // 1. Deep Space Cosmic Background
    this.ctx.fillStyle = "#050713";
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Subtle Radial Nebula Glow
    const nebulaGrad = this.ctx.createRadialGradient(
      this.width * 0.5,
      this.height * 0.4,
      50,
      this.width * 0.5,
      this.height * 0.4,
      this.width * 0.8
    );
    nebulaGrad.addColorStop(0, "rgba(24, 18, 64, 0.45)");
    nebulaGrad.addColorStop(0.5, "rgba(8, 25, 54, 0.25)");
    nebulaGrad.addColorStop(1, "rgba(3, 5, 12, 0)");
    this.ctx.fillStyle = nebulaGrad;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // 2. Parallax Starfield
    for (const star of this.stars) {
      const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7;
      this.ctx.fillStyle = star.color;
      this.ctx.globalAlpha = twinkle;
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1.0;

    // 3. Shockwave Rings
    for (const sw of this.shockwaves) {
      this.ctx.save();
      this.ctx.globalAlpha = sw.alpha;
      this.ctx.strokeStyle = sw.color;
      this.ctx.lineWidth = sw.lineWidth;
      this.ctx.shadowColor = sw.color;
      this.ctx.shadowBlur = 15;
      this.ctx.beginPath();
      this.ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();
    }

    // 4. Power-Ups
    for (const p of this.powerUps) {
      renderPowerUp(this.ctx, p);
    }

    // 5. Meteors
    for (const m of this.meteors) {
      renderMeteor(this.ctx, m);
    }

    // 6. Projectiles
    for (const p of this.projectiles) {
      renderProjectile(this.ctx, p);
    }

    // 7. Particles (Thrusters, Muzzle Flashes, Impacts, Explosions)
    for (const p of this.particles) {
      renderParticle(this.ctx, p);
    }

    // 8. Player Spaceship
    if (this.status !== "idle") {
      this.player.render(this.ctx);
    }

    // 9. Floating Combat Texts
    for (const t of this.floatingTexts) {
      renderFloatingText(this.ctx, t);
    }

    // 10. Futuristic Holographic Targeting Reticle at mouse position
    if (this.status === "playing" && this.input.mousePos) {
      const mx = this.input.mousePos.x;
      const my = this.input.mousePos.y;

      this.ctx.save();
      this.ctx.strokeStyle = "rgba(0, 240, 255, 0.75)";
      this.ctx.shadowColor = "#00f0ff";
      this.ctx.shadowBlur = 8;
      this.ctx.lineWidth = 1.5;

      // Outer targeting ring
      this.ctx.beginPath();
      this.ctx.arc(mx, my, 12, 0, Math.PI * 2);
      this.ctx.stroke();

      // Precision crosshair tick marks
      const tick = 6;
      this.ctx.beginPath();
      this.ctx.moveTo(mx - 16, my);
      this.ctx.lineTo(mx - 16 + tick, my);
      this.ctx.moveTo(mx + 16, my);
      this.ctx.lineTo(mx + 16 - tick, my);
      this.ctx.moveTo(mx, my - 16);
      this.ctx.lineTo(mx, my - 16 + tick);
      this.ctx.moveTo(mx, my + 16);
      this.ctx.lineTo(mx, my + 16 - tick);
      this.ctx.stroke();

      // Center laser dot
      this.ctx.fillStyle = "#ffffff";
      this.ctx.beginPath();
      this.ctx.arc(mx, my, 2, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    }

    // 11. Detonation / Nova Screen Flash
    if (this.flashIntensity > 0) {
      this.ctx.save();
      this.ctx.fillStyle = `rgba(255, 235, 215, ${this.flashIntensity})`;
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.restore();
    }

    this.ctx.restore();
  }

  public destroy() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    window.removeEventListener("keydown", this.boundKeyDown);
    window.removeEventListener("keyup", this.boundKeyUp);
    this.canvas.removeEventListener("mousemove", this.boundMouseMove);
    window.removeEventListener("mousedown", this.boundMouseDown);
    window.removeEventListener("mouseup", this.boundMouseUp);
  }
}
