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
    const colors = ["#ffffff", "#67e8f9", "#c084fc", "#93c5fd"];

    for (let i = 0; i < 110; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 0.8 + Math.random() * 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: 0.2 + Math.random() * 0.6,
        alpha: 0.3 + Math.random() * 0.7,
      });
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const render = () => {
      ctx.fillStyle = "#050713";
      ctx.fillRect(0, 0, width, height);

      // Radial nebulae
      const grad = ctx.createRadialGradient(width * 0.5, height * 0.3, 100, width * 0.5, height * 0.3, width * 0.7);
      grad.addColorStop(0, "rgba(22, 14, 55, 0.4)");
      grad.addColorStop(0.6, "rgba(6, 21, 46, 0.25)");
      grad.addColorStop(1, "rgba(5, 7, 19, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Stars
      for (const s of stars) {
        s.y += s.speed;
        if (s.y > height) {
          s.y = 0;
          s.x = Math.random() * width;
        }

        ctx.globalAlpha = s.alpha * (0.6 + Math.sin(Date.now() * 0.002 + s.x) * 0.4);
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
