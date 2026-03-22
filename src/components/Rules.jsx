import { useEffect, useRef } from "react";

const GRID_SIZE = 24;

function Rules({ setScreen }) {
  const canvasRef = useRef(null);

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
    const buildNodes = () => {
      nodes.length = 0;
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
    };
    buildNodes();
    window.addEventListener("resize", buildNodes);

    const draw = () => {
      t += 0.012;
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      ctx.clearRect(0, 0, W, H);

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
          const pulse = (Math.sin(t * 1.2 + a.phase + b.phase) + 1) / 2;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.strokeStyle = `rgba(52, 211, 153, ${0.03 + pulse * 0.07})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

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
      window.removeEventListener("resize", buildNodes);
    };
  }, []);
  const rules = [
    { icon: "✅", title: "General Advice Only", desc: "Provides general fitness guidance, not medical advice.", color: "#34d399" },
    { icon: "🏋️", title: "Not a Pro Trainer", desc: "Always consult a certified trainer for personalized plans.", color: "#34d399" },
    { icon: "💧", title: "Stay Hydrated", desc: "Drink water before, during, and after every workout.", color: "#22d3ee" },
    { icon: "🔥", title: "Warm Up First", desc: "Always warm up 5–10 mins before starting any exercise.", color: "#fb923c" },
    { icon: "🥗", title: "Diet Matters", desc: "80% of results come from what you eat. Track it.", color: "#34d399" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500&display=swap');

        .rules-root { font-family: 'DM Sans', sans-serif; }
        .rules-heading { font-family: 'Syne', sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
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
          50% { border-color: rgba(52,211,153,0.45); box-shadow: 0 0 40px rgba(52,211,153,0.12), inset 0 0 40px rgba(52,211,153,0.03); }
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes ruleSlide {
          from { opacity: 0; transform: translateX(-16px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes warningPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(251,146,60,0.25); }
          50% { box-shadow: 0 0 40px rgba(251,146,60,0.5), 0 0 60px rgba(251,146,60,0.15); }
        }

        .fade-up-1 { animation: fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s both; }
        .fade-up-2 { animation: fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.22s both; }
        .fade-up-3 { animation: fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.6s both; }

        .rule-item-0 { animation: ruleSlide 0.5s cubic-bezier(0.22,1,0.36,1) 0.3s both; }
        .rule-item-1 { animation: ruleSlide 0.5s cubic-bezier(0.22,1,0.36,1) 0.38s both; }
        .rule-item-2 { animation: ruleSlide 0.5s cubic-bezier(0.22,1,0.36,1) 0.46s both; }
        .rule-item-3 { animation: ruleSlide 0.5s cubic-bezier(0.22,1,0.36,1) 0.54s both; }
        .rule-item-4 { animation: ruleSlide 0.5s cubic-bezier(0.22,1,0.36,1) 0.62s both; }

        .card-border { animation: borderGlow 3s ease-in-out infinite; }
        .warning-icon { animation: warningPulse 2.5s ease-in-out infinite; }

        .scan-line { animation: scanLine 6s linear infinite; }

        .shimmer-text {
          background: linear-gradient(90deg, #34d399, #6ee7b7, #a7f3d0, #6ee7b7, #34d399);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }

        .dot1 { animation: dotPulse 1.4s ease-in-out 0s infinite; }
        .dot2 { animation: dotPulse 1.4s ease-in-out 0.2s infinite; }
        .dot3 { animation: dotPulse 1.4s ease-in-out 0.4s infinite; }

        .rule-row {
          transition: background 0.2s, border-color 0.2s, transform 0.2s;
          cursor: default;
        }
        .rule-row:hover {
          background: rgba(52,211,153,0.06) !important;
          border-color: rgba(52,211,153,0.25) !important;
          transform: translateX(4px);
        }

        .cta-btn {
          position: relative;
          overflow: hidden;
          transition: transform 0.15s, box-shadow 0.15s;
          font-family: 'Syne', sans-serif;
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
        .cta-btn:hover { transform: scale(1.02); box-shadow: 0 0 50px rgba(52,211,153,0.5), 0 0 100px rgba(52,211,153,0.2); }
        .cta-btn:active { transform: scale(0.97); }
      `}</style>

      <div
        className="rules-root min-h-screen w-full flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden"
        style={{ background: "#020c18" }}
      >
        {/* Neural canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 0 }}
        />

        {/* Scan line */}
        <div
          className="scan-line absolute left-0 right-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, rgba(52,211,153,0.4), transparent)", zIndex: 1 }}
        />

        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(52,211,153,0.05) 0%, transparent 70%)", zIndex: 1 }}
        />
        <div
          className="absolute top-0 left-0 w-64 h-64 pointer-events-none"
          style={{ background: "radial-gradient(circle at top left, rgba(251,146,60,0.07) 0%, transparent 70%)", zIndex: 1 }}
        />
        <div
          className="absolute bottom-0 right-0 w-64 h-64 pointer-events-none"
          style={{ background: "radial-gradient(circle at bottom right, rgba(52,211,153,0.07) 0%, transparent 70%)", zIndex: 1 }}
        />

        {/* Corner brackets */}
        {[
          { top: "1rem", left: "1rem", borderTop: true, borderLeft: true },
          { top: "1rem", right: "1rem", borderTop: true, borderRight: true },
          { bottom: "1rem", left: "1rem", borderBottom: true, borderLeft: true },
          { bottom: "1rem", right: "1rem", borderBottom: true, borderRight: true },
        ].map((s, i) => (
          <div
            key={i}
            className="absolute w-8 h-8 pointer-events-none"
            style={{
              ...s,
              borderTop: s.borderTop ? "1px solid rgba(52,211,153,0.25)" : undefined,
              borderLeft: s.borderLeft ? "1px solid rgba(52,211,153,0.25)" : undefined,
              borderBottom: s.borderBottom ? "1px solid rgba(52,211,153,0.25)" : undefined,
              borderRight: s.borderRight ? "1px solid rgba(52,211,153,0.25)" : undefined,
              zIndex: 2,
            }}
          />
        ))}

        {/* Card */}
        <div className="card-border relative z-10 w-full max-w-sm sm:max-w-md border rounded-3xl p-6 sm:p-9"
          style={{ background: "rgba(255,255,255,0.02)", backdropFilter: "blur(32px)", borderColor: "rgba(52,211,153,0.2)" }}
        >
          {/* Top label */}
          <div className="fade-up-1 flex items-center gap-2 mb-6">
            <div className="flex items-center gap-1">
              <span className="dot1 inline-block w-1.5 h-1.5 rounded-full bg-orange-400" />
              <span className="dot2 inline-block w-1.5 h-1.5 rounded-full bg-orange-400" />
              <span className="dot3 inline-block w-1.5 h-1.5 rounded-full bg-orange-400" />
            </div>
            <span className="text-xs font-medium tracking-widest uppercase" style={{ color: "rgba(251,146,60,0.7)" }}>
              Guidelines · Read Carefully
            </span>
          </div>

          {/* Header */}
          <div className="fade-up-2 flex items-center gap-4 mb-6">
            <div
              className="warning-icon flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
              style={{
                background: "linear-gradient(135deg, #7c2d12, #ea580c)",
                boxShadow: "0 0 24px rgba(251,146,60,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
            >
              ⚠️
            </div>
            <div>
              <h2 className="rules-heading text-2xl sm:text-3xl font-black text-white leading-none tracking-tight mb-0.5">
                Before You
              </h2>
              <h2 className="rules-heading text-2xl sm:text-3xl font-black leading-none tracking-tight">
                <span className="shimmer-text">Start Training</span>
              </h2>
            </div>
          </div>

          {/* Divider */}
          <div className="mb-5" style={{ height: "1px", background: "linear-gradient(90deg, rgba(52,211,153,0.3), transparent)" }} />

          {/* Rules */}
          <div className="space-y-2.5 mb-6">
            {rules.map((rule, i) => (
              <div
                key={i}
                className={`rule-row rule-item-${i} flex items-start gap-3.5 p-3.5 rounded-2xl border`}
                style={{
                  background: "rgba(255,255,255,0.025)",
                  borderColor: "rgba(255,255,255,0.07)",
                }}
              >
                {/* Index + Icon */}
                <div className="flex-shrink-0 flex flex-col items-center gap-1 pt-0.5">
                  <span className="text-lg leading-none">{rule.icon}</span>
                  <span
                    className="text-xs font-bold tabular-nums"
                    style={{ color: "rgba(52,211,153,0.35)", fontFamily: "'Syne', sans-serif" }}
                  >
                    0{i + 1}
                  </span>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div
                    className="font-semibold text-sm mb-0.5"
                    style={{ color: "rgba(255,255,255,0.9)", fontFamily: "'Syne', sans-serif", letterSpacing: "0.01em" }}
                  >
                    {rule.title}
                  </div>
                  <div
                    className="text-xs leading-relaxed"
                    style={{ color: "rgba(255,255,255,0.38)", fontWeight: 300 }}
                  >
                    {rule.desc}
                  </div>
                </div>

                {/* Right accent line */}
                <div
                  className="flex-shrink-0 self-stretch w-0.5 rounded-full"
                  style={{ background: `${rule.color}30` }}
                />
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="fade-up-3">
            <button
              onClick={() => setScreen("chat")}
              className="cta-btn w-full py-4 rounded-2xl font-bold text-sm sm:text-base tracking-widest uppercase text-black"
              style={{
                background: "linear-gradient(135deg, #34d399, #10b981, #059669)",
                boxShadow: "0 4px 30px rgba(52,211,153,0.3)",
              }}
            >
              I Understand — Let's Go 💬
            </button>
            <p className="text-center text-xs mt-3" style={{ color: "rgba(255,255,255,0.15)" }}>
              By continuing, you agree to use this responsibly
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Rules;