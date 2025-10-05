// src/components/LoginFlappy.jsx
import React, { useEffect, useRef, useState } from "react";

const W = 640, H = 360, BIRD_X = 120, GRAV = 1200, FLAP_VY = -360;
const PIPE_W = 64, GAP = 150, SPEED = 170, SPAWN_MS = 1600;

export default function LoginFlappy({ onAllowanceChange, min = 7 }) {
  const canvasRef = useRef(null);

  const started = useRef(false);               // run state
  const [uiStarted, setUiStarted] = useState(false); // for button label
  const score = useRef(0);
  const best  = useRef(0);
  const bird  = useRef({ y: H/2, vy: 0 });
  const pipes = useRef([]);

  // draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let last = performance.now(), raf, spawn = 0;

    const loop = (now) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;

      ctx.clearRect(0,0,W,H);
      ctx.fillStyle = "#0b0f1a"; ctx.fillRect(0,0,W,H);

      if (!started.current) {
        // idle screen
        ctx.fillStyle = "#cbd5e1"; ctx.font = "14px system-ui";
        ctx.fillText("Press Start (or S) to play Flappy Trash", 16, 22);
        ctx.fillText(`Each trash can = +1 char • Need ≥ ${min}`, 16, 40);
        ctx.fillText("Controls: Space = flap • R = stop run • S = start", 16, H - 12);

        ctx.beginPath(); ctx.arc(BIRD_X, H/2, 10, 0, Math.PI*2);
        ctx.fillStyle = "#22c55e"; ctx.fill();

        ctx.fillStyle = "#a3b0c2"; ctx.font = "12px system-ui";
        ctx.fillText(`Best score: ${best.current}`, 16, 62);

        raf = requestAnimationFrame(loop);
        return;
      }

      // running
      spawn += dt * 1000;
      if (spawn > SPAWN_MS) {
        spawn = 0;
        const gapY = 80 + Math.random() * (H - 160 - GAP);
        pipes.current.push({ x: W + PIPE_W, gapY, counted: false });
      }

      bird.current.vy += GRAV * dt;
      bird.current.y  += bird.current.vy * dt;
      if (bird.current.y > H-12) crash();
      if (bird.current.y < 12) { bird.current.y = 12; bird.current.vy = 0; }

      pipes.current.forEach(p => p.x -= SPEED * dt);
      while (pipes.current.length && pipes.current[0].x < -PIPE_W) pipes.current.shift();

      for (const p of pipes.current) {
        const hit   = BIRD_X > p.x - 16 && BIRD_X < p.x + PIPE_W + 16;
        const inGap = bird.current.y > p.gapY && bird.current.y < p.gapY + GAP;
        if (hit && !inGap) crash();
        if (!p.counted && p.x + PIPE_W < BIRD_X - 10) {
          p.counted = true;
          score.current += 1; // allowance applied when the run ends
        }
      }

      // pipes
      for (const p of pipes.current) {
        ctx.fillStyle = "#374151";
        ctx.fillRect(p.x, 0, PIPE_W, p.gapY);
        ctx.fillRect(p.x, p.gapY + GAP, PIPE_W, H - (p.gapY + GAP));
        ctx.fillStyle = "#9ca3af"; ctx.font = "12px monospace";
        ctx.fillText("🗑", p.x + PIPE_W/2 - 6, p.gapY/2);
        ctx.fillText("🗑", p.x + PIPE_W/2 - 6, p.gapY + GAP + (H-(p.gapY+GAP))/2);
      }

      // bird
      ctx.beginPath(); ctx.arc(BIRD_X, bird.current.y, 10, 0, Math.PI*2);
      ctx.fillStyle = "#22c55e"; ctx.fill();

      // HUD
      ctx.fillStyle = "#cbd5e1"; ctx.font = "12px system-ui";
      ctx.fillText(`Run: ${score.current}  |  Best: ${best.current}  |  Need ≥ ${min}`, 10, 18);
      ctx.fillText(`Space to flap • R to stop run`, 10, H-10);

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [min]);

  // keyboard: Space flap | R stop | S start
  useEffect(() => {
    const onKey = (e) => {
      const k = e.key?.toLowerCase();
      if (k === "s") return start();
      if (!started.current) return;
      if (k === " ") { e.preventDefault(); bird.current.vy = FLAP_VY; }
      if (k === "r") stopRun();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function start() {
    started.current = true; setUiStarted(true);
    score.current = 0;
    bird.current  = { y: H/2, vy: 0 };
    pipes.current = [];
    // allowance updates ONLY when a run ends
  }
  function stopRun() {
    started.current = false; setUiStarted(false);
    if (score.current > best.current) best.current = score.current;
    onAllowanceChange?.(best.current); // parent uses this as max password length
    bird.current  = { y: H/2, vy: 0 };
    pipes.current = [];
    score.current = 0;
  }
  function crash() { stopRun(); }

  return (
    <div className="gc">
      <canvas ref={canvasRef} width={W} height={H} />
      <div className="gc-bar">
        {!uiStarted ? (
          <button type="button" onClick={start}>Start</button>
        ) : (
          <button type="button" onClick={stopRun}>Stop</button>
        )}
      </div>
    </div>
  );
}
