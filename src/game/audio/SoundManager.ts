/**
 * Web Audio API procedural sound synthesizer for Starfall Breakout.
 * Zero external audio files required, instant playback, zero network latency,
 * and compatible with all modern desktop and mobile browsers.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterVolume: number = 0.4;
  private masterGain: GainNode | null = null;
  private initialized: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      const savedMute = localStorage.getItem("starfall_muted");
      if (savedMute !== null) {
        this.isMuted = savedMute === "true";
      }
      const savedVol = localStorage.getItem("starfall_volume");
      if (savedVol !== null) {
        this.masterVolume = Math.max(0, Math.min(1, parseFloat(savedVol)));
      }
    }
  }

  public init() {
    if (this.initialized && this.ctx) {
      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      return;
    }

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
        this.initialized = true;
      }
    } catch (e) {
      console.warn("Web Audio API not supported or blocked", e);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== "undefined") {
      localStorage.setItem("starfall_muted", String(this.isMuted));
      window.dispatchEvent(new Event("starfall_sound_changed"));
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (typeof window !== "undefined") {
      localStorage.setItem("starfall_volume", String(this.masterVolume));
    }
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.masterVolume;
  }

  private ensureAudioContext(): boolean {
    if (!this.initialized || !this.ctx) {
      this.init();
    }
    if (!this.ctx || this.isMuted) return false;
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return true;
  }

  /**
   * Laser blaster firing sound (synthesized frequency sweep)
   */
  public playLaser(pitchMultiplier: number = 1.0) {
    if (!this.ensureAudioContext() || !this.ctx || !this.masterGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      const startTime = this.ctx.currentTime;
      const duration = 0.09;

      osc.frequency.setValueAtTime(880 * pitchMultiplier, startTime);
      osc.frequency.exponentialRampToValueAtTime(120 * pitchMultiplier, startTime + duration);

      gain.gain.setValueAtTime(0.22, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + duration);
    } catch {
      // Audio error ignored safely
    }
  }

  /**
   * Meteor explosion (white noise burst + deep rumble)
   */
  public playExplosion(size: "small" | "medium" | "large" = "medium") {
    if (!this.ensureAudioContext() || !this.ctx || !this.masterGain) return;

    try {
      const duration = size === "large" ? 0.45 : size === "medium" ? 0.3 : 0.18;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Generate pink/white noise
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-3 * (i / bufferSize));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      const baseFreq = size === "large" ? 220 : size === "medium" ? 440 : 800;
      filter.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + duration);

      const gain = this.ctx.createGain();
      const vol = size === "large" ? 0.4 : size === "medium" ? 0.28 : 0.18;
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      // Sub-bass thump
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = "sine";
      const startSub = size === "large" ? 90 : 130;
      subOsc.frequency.setValueAtTime(startSub, this.ctx.currentTime);
      subOsc.frequency.exponentialRampToValueAtTime(25, this.ctx.currentTime + duration);

      subGain.gain.setValueAtTime(vol * 0.8, this.ctx.currentTime);
      subGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      subOsc.connect(subGain);
      subGain.connect(this.masterGain);

      noise.start();
      subOsc.start();
      subOsc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio error ignored safely
    }
  }

  /**
   * Player damaged sound (heavy crunch)
   */
  public playPlayerHit() {
    if (!this.ensureAudioContext() || !this.ctx || !this.masterGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = this.ctx.currentTime;
      const duration = 0.28;

      osc.type = "triangle";
      osc.frequency.setValueAtTime(240, startTime);
      osc.frequency.exponentialRampToValueAtTime(30, startTime + duration);

      gain.gain.setValueAtTime(0.45, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + duration);
    } catch {}
  }

  /**
   * Shield absorbs damage (resonant energy ping)
   */
  public playShieldDeflect() {
    if (!this.ensureAudioContext() || !this.ctx || !this.masterGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = this.ctx.currentTime;
      const duration = 0.25;

      osc.type = "sine";
      osc.frequency.setValueAtTime(500, startTime);
      osc.frequency.linearRampToValueAtTime(1400, startTime + 0.08);
      osc.frequency.exponentialRampToValueAtTime(200, startTime + duration);

      gain.gain.setValueAtTime(0.35, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + duration);
    } catch {}
  }

  /**
   * Power-up pickup chime (harmonious ascending arpeggio)
   */
  public playPowerUpCollect() {
    if (!this.ensureAudioContext() || !this.ctx || !this.masterGain) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const noteStart = now + idx * 0.055;
        const noteDuration = 0.18;

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.25, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + noteDuration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(noteStart);
        osc.stop(noteStart + noteDuration);
      });
    } catch {}
  }

  /**
   * Nova Burst shockwave (deep sub explosion + shimmering chord)
   */
  public playNovaBurst() {
    if (!this.ensureAudioContext() || !this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;

      // Sub drop
      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      sub.type = "sine";
      sub.frequency.setValueAtTime(180, now);
      sub.frequency.exponentialRampToValueAtTime(28, now + 0.8);

      subGain.gain.setValueAtTime(0.6, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      sub.connect(subGain);
      subGain.connect(this.masterGain);
      sub.start(now);
      sub.stop(now + 0.8);

      // Shimmering chime
      const chime = this.ctx.createOscillator();
      const chimeGain = this.ctx.createGain();
      chime.type = "triangle";
      chime.frequency.setValueAtTime(1200, now);
      chime.frequency.exponentialRampToValueAtTime(400, now + 0.6);

      chimeGain.gain.setValueAtTime(0.3, now);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      chime.connect(chimeGain);
      chimeGain.connect(this.masterGain);
      chime.start(now);
      chime.stop(now + 0.6);
    } catch {}
  }

  /**
   * Game Over sad descending cadence
   */
  public playGameOver() {
    if (!this.ensureAudioContext() || !this.ctx || !this.masterGain) return;

    try {
      const notes = [311.13, 261.63, 207.65, 174.61]; // Eb4, C4, Ab3, F3
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const noteStart = now + idx * 0.16;
        const noteDuration = 0.35;

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.28, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + noteDuration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(noteStart);
        osc.stop(noteStart + noteDuration);
      });
    } catch {}
  }

  /**
   * UI Click tone
   */
  public playClick() {
    if (!this.ensureAudioContext() || !this.ctx || !this.masterGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.04);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {}
  }

  /**
   * Speed burst telegraph warning (electronic chirp)
   */
  public playSpeedWarning() {
    if (!this.ensureAudioContext() || !this.ctx || !this.masterGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      const duration = 0.1;

      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + duration);

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + duration);
    } catch {}
  }

  /**
   * Speed burst surge acceleration (turbo jet whoosh)
   */
  public playSpeedBurst() {
    if (!this.ensureAudioContext() || !this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const duration = 0.22;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(850, now + duration);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + duration);
    } catch {}
  }

  /**
   * Heavy meteor projectile impact (deep resonant metallic thud)
   */
  public playHeavyDamage() {
    if (!this.ensureAudioContext() || !this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const duration = 0.18;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + duration);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + duration);
    } catch {}
  }

  /**
   * Meteor splitting shatter sound (crystalline fracture burst)
   */
  public playMeteorSplit() {
    if (!this.ensureAudioContext() || !this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const duration = 0.25;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = "triangle";
      osc1.frequency.setValueAtTime(1400, now);
      osc1.frequency.exponentialRampToValueAtTime(400, now + duration);

      osc2.type = "square";
      osc2.frequency.setValueAtTime(2100, now);
      osc2.frequency.exponentialRampToValueAtTime(700, now + duration);

      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration);
      osc2.stop(now + duration);
    } catch {}
  }

  /**
   * Detonation countdown warning beep (ticking hazard alert)
   */
  public playDetonationWarning() {
    if (!this.ensureAudioContext() || !this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const duration = 0.06;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(950, now);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + duration);
    } catch {}
  }

  /**
   * Explosive meteor detonation (powerful shockwave detonation)
   */
  public playExplosiveDetonation() {
    if (!this.ensureAudioContext() || !this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const duration = 0.55;

      // Deep sub boom
      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      sub.type = "sine";
      sub.frequency.setValueAtTime(120, now);
      sub.frequency.exponentialRampToValueAtTime(24, now + duration);

      subGain.gain.setValueAtTime(0.55, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      sub.connect(subGain);
      subGain.connect(this.masterGain);
      sub.start(now);
      sub.stop(now + duration);

      // Filtered explosion roar
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-2.5 * (i / bufferSize));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(380, now);
      filter.frequency.exponentialRampToValueAtTime(50, now + duration);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.38, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      noise.start(now);
    } catch {}
  }
}

export const soundManager = new SoundManager();
