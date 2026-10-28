"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { GameEngine } from "@/game/engine/GameEngine";
import {
  ActivePowerUpState,
  ComboState,
  GameStats,
  GameStatus,
  MeteorAlertInfo,
  Vector2D,
} from "@/game/types/game";
import GameHud from "../hud/GameHud";
import MobileControls from "./MobileControls";
import PauseModal from "./PauseModal";
import GameOverModal from "./GameOverModal";
import { getPlayerProfile } from "@/lib/storage/guestProfile";

export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // React State for HUD & Modals
  const [status, setStatus] = useState<GameStatus>("idle");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [wave, setWave] = useState(1);
  const [waveTitle, setWaveTitle] = useState("Survival Training");
  const [waveTransition, setWaveTransition] = useState<{ wave: number; title: string } | null>(null);
  const [comboState, setComboState] = useState<ComboState>({
    count: 0,
    multiplier: 1.0,
    timeRemaining: 0,
    maxDuration: 2.8,
    tierLabel: "",
  });
  const [survivalSeconds, setSurvivalSeconds] = useState(0);
  const [activePowerUps, setActivePowerUps] = useState<ActivePowerUpState[]>([]);
  const [autoFire, setAutoFire] = useState(false);
  const [gameOverStats, setGameOverStats] = useState<GameStats | null>(null);
  const [meteorAlert, setMeteorAlert] = useState<MeteorAlertInfo | null>(null);

  // Run Session Token & ID
  const [runId, setRunId] = useState<string | null>(null);
  const [runToken, setRunToken] = useState<string | null>(null);

  // Timers
  const survivalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const meteorAlertTimerRef = useRef<NodeJS.Timeout | null>(null);
  const waveTransitionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize new run session
  const startNewRun = useCallback(async () => {
    try {
      const profile = getPlayerProfile();
      const res = await fetch("/api/runs/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId: profile.guestId }),
      });
      const data = await res.json();
      if (data.success) {
        setRunId(data.runId);
        setRunToken(data.token);
      }
    } catch (e) {
      console.warn("Could not start verified run session, falling back to local:", e);
      setRunId(`local_${Date.now()}`);
      setRunToken(null);
    }

    setSurvivalSeconds(0);
    setWave(1);
    setWaveTitle("Survival Training");
    setWaveTransition(null);
    setComboState({
      count: 0,
      multiplier: 1.0,
      timeRemaining: 0,
      maxDuration: 2.8,
      tierLabel: "",
    });
    setGameOverStats(null);
    setMeteorAlert(null);

    if (engineRef.current) {
      engineRef.current.start();
    }
  }, []);

  // Set up GameEngine on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 650;

    const engine = new GameEngine(canvas, {
      onScoreChange: (newScore) => setScore(newScore),
      onLivesChange: (newLives) => setLives(newLives),
      onWaveChange: (newWave) => setWave(newWave),
      onWaveTransition: (newWave, title) => {
        setWave(newWave);
        setWaveTitle(title);
        setWaveTransition({ wave: newWave, title });
        if (waveTransitionTimerRef.current) {
          clearTimeout(waveTransitionTimerRef.current);
        }
        waveTransitionTimerRef.current = setTimeout(() => {
          setWaveTransition(null);
        }, 3500);
      },
      onComboChange: (newCombo) => {
        setComboState(newCombo);
      },
      onStatusChange: (newStatus) => setStatus(newStatus),
      onMeteorAlert: (alert) => {
        setMeteorAlert(alert);
        if (meteorAlertTimerRef.current) {
          clearTimeout(meteorAlertTimerRef.current);
        }
        meteorAlertTimerRef.current = setTimeout(() => {
          setMeteorAlert(null);
        }, 3200);
      },
      onPowerUpCollected: () => {
        if (engineRef.current) {
          setActivePowerUps(engineRef.current.getActivePowerUps());
        }
      },
      onPowerUpExpired: () => {
        if (engineRef.current) {
          setActivePowerUps(engineRef.current.getActivePowerUps());
        }
      },
      onGameOver: (stats) => {
        setGameOverStats(stats);
      },
    });

    engine.resize(width, height);
    engineRef.current = engine;

    // Responsive Canvas Resizing
    const handleResize = () => {
      if (!container || !engineRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0 && h > 0) {
        engineRef.current.resize(w, h);
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Automatically initiate first run
    startNewRun();

    return () => {
      resizeObserver.disconnect();
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
      if (survivalTimerRef.current) {
        clearInterval(survivalTimerRef.current);
      }
      if (meteorAlertTimerRef.current) {
        clearTimeout(meteorAlertTimerRef.current);
      }
      if (waveTransitionTimerRef.current) {
        clearTimeout(waveTransitionTimerRef.current);
      }
    };
  }, [startNewRun]);

  // Interval timer for HUD survival time seconds counter
  useEffect(() => {
    if (status === "playing") {
      survivalTimerRef.current = setInterval(() => {
        setSurvivalSeconds((prev) => prev + 1);
        if (engineRef.current) {
          setActivePowerUps(engineRef.current.getActivePowerUps());
        }
      }, 1000);
    } else {
      if (survivalTimerRef.current) {
        clearInterval(survivalTimerRef.current);
      }
    }

    return () => {
      if (survivalTimerRef.current) clearInterval(survivalTimerRef.current);
    };
  }, [status]);

  const handlePauseToggle = () => {
    if (!engineRef.current) return;
    if (status === "playing") {
      engineRef.current.pause();
    } else if (status === "paused") {
      engineRef.current.resume();
    }
  };

  const handleToggleAutoFire = () => {
    const nextVal = !autoFire;
    setAutoFire(nextVal);
    if (engineRef.current) {
      engineRef.current.setAutoFire(nextVal);
    }
  };

  const handleMobileTouchVector = (vector: Vector2D | null) => {
    if (engineRef.current) {
      engineRef.current.setTouchVector(vector);
    }
  };

  const handleMobileTouchAimVector = (vector: Vector2D | null) => {
    if (engineRef.current) {
      engineRef.current.setTouchAimVector(vector);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[calc(100vh-4rem)] max-h-[920px] min-h-[520px] bg-[#02040a] overflow-hidden select-none border-y sm:border border-cyan-500/30 arcade-bezel corner-bracket"
    >
      {/* HTML5 Game Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block focus:outline-none cursor-crosshair"
        tabIndex={0}
      />

      {/* Subtle CRT Scanline Texture */}
      <div className="absolute inset-0 crt-scanlines pointer-events-none opacity-30 z-10" />

      {/* Floating HUD */}
      <GameHud
        score={score}
        lives={lives}
        maxLives={3}
        wave={wave}
        waveTitle={waveTitle}
        waveTransition={waveTransition}
        comboState={comboState}
        survivalSeconds={survivalSeconds}
        activePowerUps={activePowerUps}
        isPaused={status === "paused"}
        autoFire={autoFire}
        meteorAlert={meteorAlert}
        onToggleAutoFire={handleToggleAutoFire}
        onPauseToggle={handlePauseToggle}
        onRestart={startNewRun}
      />

      {/* Virtual Mobile Twin-Stick for touchscreen devices */}
      {status === "playing" && (
        <MobileControls
          onVectorChange={handleMobileTouchVector}
          onAimVectorChange={handleMobileTouchAimVector}
        />
      )}

      {/* Pause Screen Overlay */}
      {status === "paused" && (
        <PauseModal
          onResume={() => engineRef.current?.resume()}
          onRestart={startNewRun}
        />
      )}

      {/* Game Over Screen Overlay */}
      {status === "gameover" && gameOverStats && (
        <GameOverModal
          stats={gameOverStats}
          runToken={runToken}
          runId={runId}
          onRestart={startNewRun}
        />
      )}
    </div>
  );
}
