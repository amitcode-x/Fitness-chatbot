import { useEffect, useRef, useState } from "react";

const GRID_SIZE = 24;

function Intro({ setScreen }) {
  const canvasRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Neural grid canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animFrame;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const nodes = [];
    const COLS = Math.ceil(canvas.offsetWidth / GRID_SIZE) + 1;
    const ROWS = Math.ceil(canvas.offsetHeight / GRID_SIZE) + 1;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        nodes.push({
          x: c * GRID_SIZE,
          y: r * GRID_SIZE,
          phase: Math.random() * Math.PI * 2,
          speed: 0.3 + Math.random() * 0.4,
        });
      }
    }

    const draw = () => {
      t += 0.012;
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      ctx.clearRect(0, 0, W, H);

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        const ax = a.x + Math.sin(t * a.speed + a.phase) * 3;
        const ay = a.y + Math.cos(t * a.speed + a.phase) * 3;

        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist > GRID_SIZE * 1.6) continue;

          const bx = b.x + Math.sin(t * b.speed + b.phase) * 3;
          const by = b.y + Math.cos(t * b.speed + b.phase) * 3;

          const pulse =
            (Math.sin(t * 1.2 + a.phase + b.phase) + 1) / 2;
          const alpha = 0.03 + pulse * 0.07;

          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.strokeStyle = `rgba(52, 211, 153, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      // Draw nodes
      for (const n of nodes) {
        const nx = n.x + Math.sin(t * n.speed + n.phase) * 3;
        const ny = n.y + Math.cos(t * n.speed + n.phase) * 3;
        const glow = (Math.sin(t * n.speed + n.phase) + 1) / 2;
        const r = 1 + glow * 1.2;
        ctx.beginPath();
        ctx.arc(nx, ny, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(52, 211, 153, ${0.08 + glow * 0.18})`;
        ctx.fill();
      }

      animFrame = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const stats = [
    { val: "10K+", label: "Athletes", icon: "🏃" },
    { val: "500+", label: "Workouts", icon: "🏋️" },
    { val: "24/7", label: "AI Coach", icon: "🤖" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500&display=swap');

        .intro-root {
          font-family: 'DM Sans', sans-serif;
        }

        .intro-heading {
          font-family: 'Syne', sans-serif;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes scanLine {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }

        @keyframes borderGlow {
          0%, 100% { border-color: rgba(52,211,153,0.2); box-shadow: 0 0 20px rgba(52,211,153,0.05); }
          50% { border-color: rgba(52,211,153,0.5); box-shadow: 0 0 40px rgba(52,211,153,0.15), inset 0 0 40px rgba(52,211,153,0.03); }
        }

        @keyframes iconFloat {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-8px) rotate(2deg); }
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes dotPulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }

        .fade-up-1 { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s both; }
        .fade-up-2 { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.25s both; }
        .fade-up-3 { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.4s both; }
        .fade-up-4 { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.55s both; }
        .fade-up-5 { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.7s both; }

        .card-border { animation: borderGlow 3s ease-in-out infinite; }

        .icon-float { animation: iconFloat 3s ease-in-out infinite; }

        .shimmer-text {
          background: linear-gradient(90deg, #34d399, #6ee7b7, #a7f3d0, #6ee7b7, #34d399);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }

        .scan-line {
          animation: scanLine 6s linear infinite;
        }

        .cta-btn {
          position: relative;
          overflow: hidden;
          transition: transform 0.15s, box-shadow 0.15s;
        }

        .cta-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%);
          transform: translateX(-100%);
          transition: transform 0.5s ease;
        }

        .cta-btn:hover::before { transform: translateX(100%); }
        .cta-btn:hover { transform: scale(1.03); box-shadow: 0 0 50px rgba(52,211,153,0.5), 0 0 100px rgba(52,211,153,0.2); }
        .cta-btn:active { transform: scale(0.97); }

        .stat-card {
          transition: background 0.2s, transform 0.2s;
        }
        .stat-card:hover {
          background: rgba(52,211,153,0.08);
          transform: translateY(-2px);
        }

        .dot1 { animation: dotPulse 1.4s ease-in-out 0s infinite; }
        .dot2 { animation: dotPulse 1.4s ease-in-out 0.2s infinite; }
        .dot3 { animation: dotPulse 1.4s ease-in-out 0.4s infinite; }
      `}</style>

      <div
        className="intro-root min-h-screen w-full flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden"
        style={{ background: "#020c18" }}
      >
        {/* Neural canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 0 }}
        />

        {/* Scan line effect */}
        <div
          className="scan-line absolute left-0 right-0 h-px pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(52,211,153,0.4), transparent)",
            zIndex: 1,
          }}
        />

        {/* Radial glow center */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 60% 50% at 50% 55%, rgba(52,211,153,0.06) 0%, transparent 70%)",
            zIndex: 1,
          }}
        />

        {/* Top corner accent */}
        <div
          className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
          style={{
            background: "radial-gradient(circle at top right, rgba(52,211,153,0.12) 0%, transparent 70%)",
            zIndex: 1,
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-56 h-56 pointer-events-none"
          style={{
            background: "radial-gradient(circle at bottom left, rgba(16,185,129,0.08) 0%, transparent 70%)",
            zIndex: 1,
          }}
        />

        {/* Main Card */}
        <div
          className="card-border relative z-10 w-full max-w-sm sm:max-w-md border rounded-3xl p-6 sm:p-10"
          style={{
            background: "rgba(255,255,255,0.02)",
            backdropFilter: "blur(32px)",
            borderColor: "rgba(52,211,153,0.2)",
          }}
        >
          {/* Top label */}
          <div className="fade-up-1 flex items-center gap-2 mb-6">
            <div className="flex items-center gap-1">
              <span className="dot1 inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="dot2 inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="dot3 inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
            <span
              className="text-xs font-medium tracking-widest uppercase"
              style={{ color: "rgba(52,211,153,0.7)" }}
            >
              AI-Powered · Always Learning
            </span>
          </div>

          {/* Icon + Heading */}
          <div className="fade-up-2 flex items-start gap-4 mb-5">
            <div
              className="icon-float flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl"
              style={{
                background: "linear-gradient(135deg, #065f46, #10b981)",
                boxShadow: "0 0 30px rgba(52,211,153,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
            >
              💪
            </div>
            <div>
              <h1
                className="intro-heading text-3xl sm:text-4xl font-black leading-none tracking-tight text-white mb-1"
              >
                FITNESS
              </h1>
              <h1 className="intro-heading text-3xl sm:text-4xl font-black leading-none tracking-tight">
                <span className="shimmer-text">COACH AI</span>
              </h1>
            </div>
          </div>

          {/* Description */}
          <p
            className="fade-up-3 text-sm sm:text-base leading-relaxed mb-6"
            style={{ color: "rgba(255,255,255,0.4)", fontWeight: 300 }}
          >
            Your intelligent training partner — personalized workouts, adaptive nutrition plans, and real-time coaching that evolves with you.
          </p>

          {/* Stats */}
          <div className="fade-up-4 grid grid-cols-3 gap-2 sm:gap-3 mb-6">
            {stats.map(({ val, label, icon }) => (
              <div
                key={label}
                className="stat-card rounded-2xl p-3 text-center cursor-default"
                style={{
                  background: "rgba(52,211,153,0.04)",
                  border: "1px solid rgba(52,211,153,0.1)",
                }}
              >
                <div className="text-lg mb-0.5">{icon}</div>
                <div
                  className="intro-heading text-base sm:text-lg font-bold"
                  style={{ color: "#34d399" }}
                >
                  {val}
                </div>
                <div
                  className="text-xs"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* Feature pills */}
          <div className="fade-up-4 flex flex-wrap gap-2 mb-6">
            {["🧠 Smart Plans", "📊 Progress Tracking", "🔥 Daily Goals", "🥗 Nutrition AI"].map((f) => (
              <span
                key={f}
                className="text-xs px-3 py-1 rounded-full"
                style={{
                  background: "rgba(52,211,153,0.06)",
                  border: "1px solid rgba(52,211,153,0.15)",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                {f}
              </span>
            ))}
          </div>

          {/* CTA Button */}
          <div className="fade-up-5">
            <button
              onClick={() => setScreen("rules")}
              className="cta-btn w-full py-4 rounded-2xl font-bold text-sm sm:text-base tracking-widest uppercase text-black"
              style={{
                background: "linear-gradient(135deg, #34d399, #10b981, #059669)",
                boxShadow: "0 4px 30px rgba(52,211,153,0.3)",
                fontFamily: "'Syne', sans-serif",
              }}
            >
              Start Training →
            </button>

            <p
              className="text-center text-xs mt-4"
              style={{ color: "rgba(255,255,255,0.18)" }}
            >
              Powered by Claude AI · Free to start
            </p>
          </div>
        </div>

        {/* Corner decorations */}
        <div
          className="absolute top-4 left-4 w-8 h-8 pointer-events-none"
          style={{
            borderTop: "1px solid rgba(52,211,153,0.3)",
            borderLeft: "1px solid rgba(52,211,153,0.3)",
            zIndex: 2,
          }}
        />
        <div
          className="absolute top-4 right-4 w-8 h-8 pointer-events-none"
          style={{
            borderTop: "1px solid rgba(52,211,153,0.3)",
            borderRight: "1px solid rgba(52,211,153,0.3)",
            zIndex: 2,
          }}
        />
        <div
          className="absolute bottom-4 left-4 w-8 h-8 pointer-events-none"
          style={{
            borderBottom: "1px solid rgba(52,211,153,0.3)",
            borderLeft: "1px solid rgba(52,211,153,0.3)",
            zIndex: 2,
          }}
        />
        <div
          className="absolute bottom-4 right-4 w-8 h-8 pointer-events-none"
          style={{
            borderBottom: "1px solid rgba(52,211,153,0.3)",
            borderRight: "1px solid rgba(52,211,153,0.3)",
            zIndex: 2,
          }}
        />
      </div>
    </>
  );
}

export default Intro;