"use client";

import { useEffect, useRef, useState } from "react";
import { Vector2D } from "@/game/types/game";

interface MobileControlsProps {
  onVectorChange: (vector: Vector2D | null) => void;
}

export default function MobileControls({ onVectorChange }: MobileControlsProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [touchActive, setTouchActive] = useState(false);
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const activePointerId = useRef<number | null>(null);
  const maxRadius = 45; // Max joystick thumb travel

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== null) return;
    activePointerId.current = e.pointerId;

    const rect = e.currentTarget.getBoundingClientRect();
    const touchX = e.clientX - rect.left;
    const touchY = e.clientY - rect.top;

    setOrigin({ x: touchX, y: touchY });
    setKnobPos({ x: 0, y: 0 });
    setTouchActive(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== e.pointerId || !origin) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const dx = currentX - origin.x;
    const dy = currentY - origin.y;
    const dist = Math.hypot(dx, dy);

    if (dist === 0) {
      setKnobPos({ x: 0, y: 0 });
      onVectorChange(null);
      return;
    }

    const clampedDist = Math.min(dist, maxRadius);
    const normX = dx / dist;
    const normY = dy / dist;

    setKnobPos({
      x: normX * clampedDist,
      y: normY * clampedDist,
    });

    // Provide normalized vector (-1 to 1) based on distance ratio
    const strength = clampedDist / maxRadius;
    onVectorChange({
      x: normX * strength,
      y: normY * strength,
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current === e.pointerId) {
      activePointerId.current = null;
      setTouchActive(false);
      setOrigin(null);
      setKnobPos({ x: 0, y: 0 });
      onVectorChange(null);
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="md:hidden absolute inset-x-0 bottom-0 h-48 z-20 touch-none select-none flex items-center justify-center"
      style={{ touchAction: "none" }}
    >
      {/* Floating Joystick Visual */}
      {touchActive && origin ? (
        <div
          className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2"
          style={{ left: origin.x, top: origin.y }}
        >
          {/* Base Ring */}
          <div className="w-24 h-24 rounded-full border-2 border-cyan-400/40 bg-cyan-950/30 backdrop-blur-sm shadow-[0_0_20px_rgba(0,240,255,0.3)] flex items-center justify-center relative">
            {/* Center Axis Dot */}
            <div className="w-2 h-2 rounded-full bg-cyan-400/60" />

            {/* Draggable Knob */}
            <div
              className="absolute w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_15px_rgba(0,240,255,0.8)] border border-white/60 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 transition-transform duration-75"
              style={{
                transform: `translate(calc(-50% + ${knobPos.x}px), calc(-50% + ${knobPos.y}px))`,
              }}
            />
          </div>
        </div>
      ) : (
        <div className="pointer-events-none flex flex-col items-center justify-center opacity-60">
          <div className="w-20 h-20 rounded-full border border-dashed border-cyan-500/40 flex items-center justify-center">
            <span className="text-[11px] font-mono text-cyan-300">TOUCH TO MOVE</span>
          </div>
        </div>
      )}
    </div>
  );
}
