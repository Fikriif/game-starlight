"use client";

import { useEffect, useRef } from "react";

export default function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const stars: { x: number; y: number; size: number; color: string; speed: number; alpha: number }[] = [];

    for (let i = 0; i < 90; i++) {
      const isDistant = Math.random() < 0.65;
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: isDistant ? 0.6 + Math.random() * 0.6 : 1.2 + Math.random() * 1.0,
        color: isDistant ? "#94a3b8" : Math.random() > 0.4 ? "#ffffff" : "#7dd3fc",
        speed: isDistant ? 0.12 + Math.random() * 0.25 : 0.4 + Math.random() * 0.5,
        alpha: isDistant ? 0.25 + Math.random() * 0.4 : 0.6 + Math.random() * 0.4,
      });
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const render = () => {
      ctx.fillStyle = "#02040a";
      ctx.fillRect(0, 0, width, height);

      // Radial nebulae (subtle dark navy)
      const grad = ctx.createRadialGradient(width * 0.5, height * 0.35, 100, width * 0.5, height * 0.35, width * 0.7);
      grad.addColorStop(0, "rgba(8, 16, 38, 0.35)");
      grad.addColorStop(0.6, "rgba(4, 9, 22, 0.15)");
      grad.addColorStop(1, "rgba(2, 4, 10, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Stars
      for (const s of stars) {
        s.y += s.speed;
        if (s.y > height) {
          s.y = 0;
          s.x = Math.random() * width;
        }

        ctx.globalAlpha = s.alpha * (0.7 + Math.sin(Date.now() * 0.0018 + s.x) * 0.3);
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-10 w-full h-full"
    />
  );
}
