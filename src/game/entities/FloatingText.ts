import { FloatingTextEntity } from "../types/game";

let nextTextId = 1;

export function createFloatingText(
  text: string,
  x: number,
  y: number,
  color: string = "#00f0ff",
  size: number = 16
): FloatingTextEntity {
  return {
    id: nextTextId++,
    text,
    x,
    y,
    vy: -40,
    alpha: 1.0,
    color,
    size,
    life: 0.9,
    maxLife: 0.9,
  };
}

export function updateFloatingText(t: FloatingTextEntity, dt: number): boolean {
  t.y += t.vy * dt;
  t.life -= dt;
  t.alpha = Math.max(0, t.life / t.maxLife);
  return t.life > 0;
}

export function renderFloatingText(ctx: CanvasRenderingContext2D, t: FloatingTextEntity) {
  ctx.save();
  ctx.globalAlpha = t.alpha;
  ctx.shadowColor = t.color;
  ctx.shadowBlur = 8;
  ctx.font = `bold ${t.size}px monospace, system-ui, sans-serif`;
  ctx.fillStyle = t.color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(t.text, t.x, t.y);
  ctx.restore();
}
