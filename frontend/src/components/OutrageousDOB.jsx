import React, { useEffect, useMemo, useRef, useState } from "react";

const W = 320, H = 260, RX = 120, RY = 90; // ellipse radii
const MONTH_DAYS = [31,28,31,30,31,30,31,31,30,31,30,31];

function dayToMD(dayIndex) {
  let d = dayIndex;
  for (let m = 0; m < 12; m++) {
    if (d < MONTH_DAYS[m]) return { month: m + 1, day: d + 1 };
    d -= MONTH_DAYS[m];
  }
  return { month: 12, day: 31 };
}

export default function OutrageousDOB({ value, onChange, startYear = 2025 }) {
  // Continuous angle accumulator (unbounded). 0 angle = top of ellipse.
  const [angleSum, setAngleSum] = useState(0); // radians, +/- grows with spins
  const [yearBase, setYearBase] = useState(startYear);
  const canvasRef = useRef(null);
  const dragging = useRef(false);
  const prevAngle = useRef(null);

  // derive dayIdx and year from angleSum
  const { dayIdx, year } = useMemo(() => {
    const TWO_PI = Math.PI * 2;
    const spins = Math.floor(angleSum / TWO_PI); // full turns
    const frac = ((angleSum % TWO_PI) + TWO_PI) % TWO_PI; // 0..2π
    const day = Math.round((frac / TWO_PI) * 364); // 0..364
    return { dayIdx: Math.max(0, Math.min(364, day)), year: yearBase + spins };
  }, [angleSum, yearBase]);

  // emit to parent
  useEffect(() => {
    const md = dayToMD(dayIdx);
    onChange?.({ year, ...md });
  }, [dayIdx, year]);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    let raf;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#0b0f1a"; ctx.fillRect(0,0,W,H);

      // ellipse path
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(W/2, H/2, RX, RY, 0, 0, Math.PI*2);
      ctx.stroke();

      // marker at current angle
      const TWO_PI = Math.PI * 2;
      const frac = ((angleSum % TWO_PI) + TWO_PI) % TWO_PI;
      // convert angle so 0 is top (−π/2 offset)
      const a = frac - Math.PI/2;
      const x = W/2 + Math.cos(a) * RX;
      const y = H/2 + Math.sin(a) * RY;

      // satellite
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI*2);
      ctx.fillStyle = "#22c55e";
      ctx.fill();
      ctx.strokeStyle = "#0ea5e9"; ctx.lineWidth = 2; ctx.stroke();

      // labels
      const { month, day } = dayToMD(dayIdx);
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "12px system-ui";
      ctx.textAlign = "center";
      ctx.fillText("Drag around the orbit", W/2, 18);
      ctx.fillText(`Year ${year}  •  ${String(month).padStart(2,"0")}/${String(day).padStart(2,"0")}`, W/2, H-10);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [angleSum, year]);

  useEffect(() => {
    const canvas = canvasRef.current;

    const angleFromEvent = (e) => {
      const rect = canvas.getBoundingClientRect();
      const cx = ("touches" in e ? e.touches[0].clientX : e.clientX) - rect.left - W/2;
      const cy = ("touches" in e ? e.touches[0].clientY : e.clientY) - rect.top - H/2;
      // atan2 with top as 0 (rotate by +π/2)
      let a = Math.atan2(cy, cx) + Math.PI/2;
      if (a < 0) a += Math.PI*2;
      return a; // 0..2π
    };

    const down = (e) => { dragging.current = true; prevAngle.current = angleFromEvent(e); };
    const move = (e) => {
      if (!dragging.current) return;
      const now = angleFromEvent(e);
      let delta = now - prevAngle.current;
      // unwrap to shortest path
      if (delta > Math.PI) delta -= Math.PI*2;
      if (delta < -Math.PI) delta += Math.PI*2;
      setAngleSum((s) => s + delta);
      prevAngle.current = now;
    };
    const up = () => { dragging.current = false; prevAngle.current = null; };

    canvas.addEventListener("mousedown", down);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    canvas.addEventListener("touchstart", down, { passive: true });
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", up);

    return () => {
      canvas.removeEventListener("mousedown", down);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      canvas.removeEventListener("touchstart", down);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
  }, []);

  return (
    <div className="dob">
      <canvas ref={canvasRef} width={W} height={H} className="globe" />
    </div>
  );
}
