"use client";

import { useRef, useState } from "react";
import { Vector2D } from "@/game/types/game";

interface MobileControlsProps {
  onVectorChange: (vector: Vector2D | null) => void;
  onAimVectorChange: (vector: Vector2D | null) => void;
}

interface StickState {
  pointerId: number | null;
  active: boolean;
  origin: { x: number; y: number } | null;
  knobPos: { x: number; y: number };
}

export default function MobileControls({
  onVectorChange,
  onAimVectorChange,
}: MobileControlsProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Left Stick (Movement)
  const [leftStick, setLeftStick] = useState<StickState>({
    pointerId: null,
    active: false,
    origin: null,
    knobPos: { x: 0, y: 0 },
  });

  // Right Stick (Aim & Fire)
  const [rightStick, setRightStick] = useState<StickState>({
    pointerId: null,
    active: false,
    origin: null,
    knobPos: { x: 0, y: 0 },
  });

  const maxRadius = 45; // Max joystick thumb travel

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const touchX = e.clientX - rect.left;
    const touchY = e.clientY - rect.top;
    const isLeftHalf = touchX < rect.width / 2;

    if (isLeftHalf && leftStick.pointerId === null) {
      setLeftStick({
        pointerId: e.pointerId,
        active: true,
        origin: { x: touchX, y: touchY },
        knobPos: { x: 0, y: 0 },
      });
      e.currentTarget.setPointerCapture(e.pointerId);
    } else if (!isLeftHalf && rightStick.pointerId === null) {
      setRightStick({
        pointerId: e.pointerId,
        active: true,
        origin: { x: touchX, y: touchY },
        knobPos: { x: 0, y: 0 },
      });
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    // 1. Left Stick Move
    if (leftStick.pointerId === e.pointerId && leftStick.origin) {
      const dx = currentX - leftStick.origin.x;
      const dy = currentY - leftStick.origin.y;
      const dist = Math.hypot(dx, dy);

      if (dist === 0) {
        setLeftStick((prev) => ({ ...prev, knobPos: { x: 0, y: 0 } }));
        onVectorChange(null);
      } else {
        const clampedDist = Math.min(dist, maxRadius);
        const normX = dx / dist;
        const normY = dy / dist;
        setLeftStick((prev) => ({
          ...prev,
          knobPos: { x: normX * clampedDist, y: normY * clampedDist },
        }));
        const strength = clampedDist / maxRadius;
        onVectorChange({ x: normX * strength, y: normY * strength });
      }
    }

    // 2. Right Stick Move (Aim & Fire)
    if (rightStick.pointerId === e.pointerId && rightStick.origin) {
      const dx = currentX - rightStick.origin.x;
      const dy = currentY - rightStick.origin.y;
      const dist = Math.hypot(dx, dy);

      if (dist === 0) {
        setRightStick((prev) => ({ ...prev, knobPos: { x: 0, y: 0 } }));
        onAimVectorChange(null);
      } else {
        const clampedDist = Math.min(dist, maxRadius);
        const normX = dx / dist;
        const normY = dy / dist;
        setRightStick((prev) => ({
          ...prev,
          knobPos: { x: normX * clampedDist, y: normY * clampedDist },
        }));
        const strength = clampedDist / maxRadius;
        onAimVectorChange({ x: normX * strength, y: normY * strength });
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (leftStick.pointerId === e.pointerId) {
      setLeftStick({
        pointerId: null,
        active: false,
        origin: null,
        knobPos: { x: 0, y: 0 },
      });
      onVectorChange(null);
    }

    if (rightStick.pointerId === e.pointerId) {
      setRightStick({
        pointerId: null,
        active: false,
        origin: null,
        knobPos: { x: 0, y: 0 },
      });
      onAimVectorChange(null);
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="md:hidden absolute inset-x-0 bottom-0 h-52 z-20 touch-none select-none flex items-center justify-between px-6 pointer-events-auto"
      style={{ touchAction: "none" }}
    >
      {/* Left Stick (Move) Visual */}
      {leftStick.active && leftStick.origin ? (
        <div
          className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2"
          style={{ left: leftStick.origin.x, top: leftStick.origin.y }}
        >
          <div className="w-24 h-24 rounded-full border border-cyan-400/60 bg-[#060b1e]/85 backdrop-blur-sm shadow-[0_0_15px_rgba(0,240,255,0.25)] flex items-center justify-center relative">
            {/* Crosshair ticks */}
            <div className="absolute top-1 w-0.5 h-2 bg-cyan-400/80" />
            <div className="absolute bottom-1 w-0.5 h-2 bg-cyan-400/80" />
            <div className="absolute left-1 h-0.5 w-2 bg-cyan-400/80" />
            <div className="absolute right-1 h-0.5 w-2 bg-cyan-400/80" />

            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/80" />
            <div
              className="absolute w-10 h-10 rounded-full bg-cyan-400/95 border border-white shadow-[0_0_12px_rgba(0,240,255,0.7)] -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 flex items-center justify-center"
              style={{
                transform: `translate(calc(-50% + ${leftStick.knobPos.x}px), calc(-50% + ${leftStick.knobPos.y}px))`,
              }}
            >
              <div className="w-2 h-2 rounded-full bg-slate-950" />
            </div>
          </div>
        </div>
      ) : (
        <div className="pointer-events-none flex flex-col items-center justify-center opacity-45">
          <div className="w-16 h-16 rounded-full border border-cyan-500/40 bg-[#050a1c]/60 flex items-center justify-center relative">
            <span className="text-[9px] font-mono text-cyan-300 font-bold tracking-widest uppercase">NAV</span>
          </div>
        </div>
      )}

      {/* Right Stick (Aim & Fire) Visual */}
      {rightStick.active && rightStick.origin ? (
        <div
          className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2"
          style={{ left: rightStick.origin.x, top: rightStick.origin.y }}
        >
          <div className="w-24 h-24 rounded-full border border-amber-400/60 bg-[#060b1e]/85 backdrop-blur-sm shadow-[0_0_15px_rgba(245,158,11,0.25)] flex items-center justify-center relative">
            {/* Crosshair ticks */}
            <div className="absolute top-1 w-0.5 h-2 bg-amber-400/80" />
            <div className="absolute bottom-1 w-0.5 h-2 bg-amber-400/80" />
            <div className="absolute left-1 h-0.5 w-2 bg-amber-400/80" />
            <div className="absolute right-1 h-0.5 w-2 bg-amber-400/80" />

            <div className="w-1.5 h-1.5 rounded-full bg-amber-400/80" />
            <div
              className="absolute w-10 h-10 rounded-full bg-amber-400/95 border border-white shadow-[0_0_12px_rgba(245,158,11,0.7)] -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 flex items-center justify-center"
              style={{
                transform: `translate(calc(-50% + ${rightStick.knobPos.x}px), calc(-50% + ${rightStick.knobPos.y}px))`,
              }}
            >
              <div className="w-2 h-2 rounded-full bg-slate-950" />
            </div>
          </div>
        </div>
      ) : (
        <div className="pointer-events-none flex flex-col items-center justify-center opacity-45">
          <div className="w-16 h-16 rounded-full border border-amber-500/40 bg-[#050a1c]/60 flex items-center justify-center relative">
            <span className="text-[9px] font-mono text-amber-300 font-bold tracking-widest uppercase">FIRE</span>
          </div>
        </div>
      )}
    </div>
  );
}
