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
      className="md:hidden absolute inset-x-0 bottom-0 h-52 z-20 touch-none select-none flex items-center justify-between px-6"
      style={{ touchAction: "none" }}
    >
      {/* Left Stick (Move) Visual */}
      {leftStick.active && leftStick.origin ? (
        <div
          className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2"
          style={{ left: leftStick.origin.x, top: leftStick.origin.y }}
        >
          <div className="w-24 h-24 rounded-full border-2 border-cyan-400/40 bg-cyan-950/40 backdrop-blur-sm shadow-[0_0_20px_rgba(0,240,255,0.3)] flex items-center justify-center relative">
            <div className="w-2 h-2 rounded-full bg-cyan-400/60" />
            <div
              className="absolute w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_15px_rgba(0,240,255,0.8)] border border-white/60 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
              style={{
                transform: `translate(calc(-50% + ${leftStick.knobPos.x}px), calc(-50% + ${leftStick.knobPos.y}px))`,
              }}
            />
          </div>
        </div>
      ) : (
        <div className="pointer-events-none flex flex-col items-center justify-center opacity-50">
          <div className="w-20 h-20 rounded-full border border-dashed border-cyan-500/40 flex items-center justify-center">
            <span className="text-[10px] font-mono text-cyan-300 font-bold">MOVE</span>
          </div>
        </div>
      )}

      {/* Right Stick (Aim & Fire) Visual */}
      {rightStick.active && rightStick.origin ? (
        <div
          className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2"
          style={{ left: rightStick.origin.x, top: rightStick.origin.y }}
        >
          <div className="w-24 h-24 rounded-full border-2 border-rose-500/40 bg-rose-950/40 backdrop-blur-sm shadow-[0_0_20px_rgba(244,63,94,0.3)] flex items-center justify-center relative">
            <div className="w-2 h-2 rounded-full bg-rose-400/60" />
            <div
              className="absolute w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-purple-600 shadow-[0_0_15px_rgba(244,63,94,0.8)] border border-white/60 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
              style={{
                transform: `translate(calc(-50% + ${rightStick.knobPos.x}px), calc(-50% + ${rightStick.knobPos.y}px))`,
              }}
            />
          </div>
        </div>
      ) : (
        <div className="pointer-events-none flex flex-col items-center justify-center opacity-50">
          <div className="w-20 h-20 rounded-full border border-dashed border-rose-500/40 flex items-center justify-center">
            <span className="text-[10px] font-mono text-rose-300 font-bold">AIM & FIRE</span>
          </div>
        </div>
      )}
    </div>
  );
}
